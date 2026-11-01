import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPassword8to20, isValidBtDbId } from "@/lib/validation/validation";
import { doCompare, doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { requireSelf } from "@/lib/auth/requireSelf";
import { maxPwdAttempts, pwdLockMinutes } from "@/lib/auth/authUtils";

const MS_PER_MINUTE = 60 * 1000;
// const lockedMessage = `Too many attempts, try again in ${PWD_LOCK_MINUTES} minutes`;
// not exported: Next.js only allows HTTP handlers and route config in route.ts

/**
 * builds the 429 response for a locked account, with the time left
 *
 * @param lockedUntil - when the lock ends
 * @returns - 429 response: "try again in N minute(s)" + Retry-After header
 */
const lockedResponse = (lockedUntil: Date) => {
  const msLeft = lockedUntil.getTime() - Date.now();
  // round up, so 30 seconds left says "1 minute", never "0 minutes"
  const minutesLeft = Math.max(1, Math.ceil(msLeft / MS_PER_MINUTE));
  const secondsLeft = Math.max(1, Math.ceil(msLeft / 1000));
  const unit = minutesLeft === 1 ? "minute" : "minutes";

  return NextResponse.json(
    { error: `Too many attempts, try again in ${minutesLeft} ${unit}` },
    {
      status: 429,
      // standard header: seconds until the client may retry
      headers: { "Retry-After": String(secondsLeft) },
    },
  );
};

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const authError = await requireSelf(id);
    if (authError) return authError;

    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    let jsonBody: { currentPassword?: unknown; newPassword?: unknown } | null;
    try {
      jsonBody = await req.json();
    } catch {
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
    }
    if (!jsonBody || typeof jsonBody !== "object" || Array.isArray(jsonBody)) {
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
    }
    const { currentPassword, newPassword } = jsonBody;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !isPassword8to20(currentPassword) ||
      !isPassword8to20(newPassword)
    ) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 });
    }

    if (currentPassword === newPassword) {
      return NextResponse.json(
        { error: "New password must be different" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id },
      select: { password_hash: true, pwd_locked_until: true },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    if (dbUser.pwd_locked_until && dbUser.pwd_locked_until > new Date()) {
      return lockedResponse(dbUser.pwd_locked_until);
    }

    if (!dbUser.password_hash) {
      return NextResponse.json({ error: "User has no password" }, { status: 400 });
    }

    const pwdsMatch = await doCompare(currentPassword, dbUser.password_hash);
    if (!pwdsMatch) {
      // if failed on current password match, increment failed attempts
      const failed = await prisma.user.update({
        where: { id },
        data: { failed_pwd_attempts: { increment: 1 } },
      });
      // if over max attempts, lock account for 15 minutes
      if (failed.failed_pwd_attempts >= maxPwdAttempts) {
        const lockedUntil = new Date(
          Date.now() + pwdLockMinutes * MS_PER_MINUTE,
        );
        await prisma.user.update({
          where: { id },
          data: {
            failed_pwd_attempts: 0,
            pwd_locked_until: lockedUntil,
          },
        });
        // tell the user now, not on their next try
        return lockedResponse(lockedUntil);
      }
      return NextResponse.json({ error: "Current Password is incorrect" }, { status: 400 });
    }

    const newHash = await doHash(newPassword);
    if (!newHash) {
      return NextResponse.json({ error: "Error hashing password" }, { status: 500 });
    }

    // successfull match on old password, 
    // update new hash and reset failed attempts
    await prisma.user.update({
      where: { id },
      data: {
        password_hash: newHash,
        failed_pwd_attempts: 0,
        pwd_locked_until: null,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error changing password");
  }
}

