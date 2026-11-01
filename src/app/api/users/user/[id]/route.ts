import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { userDataType, userFormType, roleTypes } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "@/lib/validation/users/validate";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { normalizeEmail } from "@/lib/auth/authUtils";
import { toPublicUser, publicUserWithHashSelect } from "@/lib/server/publicUser";
import { requireDirector } from "@/lib/auth/requireDirector";
import { requireSelfOrDirector } from "@/lib/auth/requireSelfOrDirector";

// routes /api/users/:id

// Never send password_hash, failed_pwd_attempts or pwd_locked_until to the browser.
// 1) publicUserWithHashSelect: only read the public fields + password_hash from the db
// 2) toPublicUser: replace password_hash with has_password, drop any private fields

const isRoleType = (value: unknown): value is roleTypes => {
  return value === "ADMIN" || value === "DIRECTOR" || value === "USER";
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // a user can read their own account; a director or admin can read any
    const authError = await requireSelfOrDirector(id);
    if (authError) return authError;

    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: publicUserWithHashSelect,
    });

    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting user by id");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authError = await requireDirector();
    if (authError) return authError;
    
    const { id } = await params;    
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    // read the body before touching the database; bad JSON is a client error
    let json: Record<string, unknown>;
    try {
      const parsed: unknown = await request.json();
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
      }
      json = parsed as Record<string, unknown>;
    } catch {
      return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
    }
    const jsonProps = Object.getOwnPropertyNames(json);

    // only the fields needed to check the patch (public fields + password_hash)
    const currentUser = await prisma.user.findUnique({
      where: {
        id,
      },
      select: publicUserWithHashSelect,
    });

    if (!currentUser) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: userFormType = {
      ...initUserForm,
      id,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      email: currentUser.email,
      phone: currentUser.phone || "",
      password: "",
      role: isRoleType(currentUser.role) ? currentUser.role : "USER",
    };

    if (jsonProps.includes("first_name")) {
      toCheck.first_name = json.first_name as string;
    }
    if (jsonProps.includes("last_name")) {
      toCheck.last_name = json.last_name as string;
    }
    if (jsonProps.includes("email")) {
      toCheck.email =
        typeof json.email === "string"
          ? normalizeEmail(json.email)
          : (json.email as string);
    }
    if (jsonProps.includes("phone")) {
      toCheck.phone = json.phone as string;
    }
    if (jsonProps.includes("password")) {
      toCheck.password = json.password as string;
    }
    if (jsonProps.includes("role")) {
      if (!isRoleType(json.role)) {
        return NextResponse.json({ error: "invalid data" }, { status: 422 });
      }
      toCheck.role = json.role;
    }

    // no password saved (null or "") = e.g. a Google login
    const hasPassword = !!currentUser.password_hash;
    if (jsonProps.includes("password")) {
      const sentPassword = !!toCheck.password;
      // cannot remove a password, and cannot add one to a no-password user
      if (hasPassword !== sentPassword) {
        return NextResponse.json({ error: "invalid data" }, { status: 422 });
      }
    }

    const sanitized = sanitizeUser(toCheck);
    if (!sanitized) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 })
    };

    const toBePatched: userFormType = {
      id: sanitized.id,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      email: sanitized.email,
      phone: sanitized.phone,
      password: "password" in sanitized ? sanitized.password : "",
      role: sanitized.role as roleTypes,
    };

    // detect if sanitization changed a SENT phone or password. A saved phone
    // that is not in E.164 format must not block patching other fields.
    const phoneChanged =
      jsonProps.includes("phone") && toCheck.phone !== sanitized.phone;
    const passwordChanged =
      jsonProps.includes("password") &&
      "password" in sanitized &&
      toCheck.password !== sanitized.password;

    if (phoneChanged || passwordChanged) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const checkPhone = toBePatched.phone !== "";
    const checkPass = toBePatched.password !== "";

    const errCode = validateUser(toBePatched, checkPhone, checkPass);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          // an email that was sent but blanked by sanitizing is invalid, not missing
          if (
            jsonProps.includes("email") &&
            toCheck.email != null &&
            toCheck.email !== ""
          ) {
            errMsg = "invalid data";
          } else {
            errMsg = "missing data";
          }
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const hashed = toBePatched.password
      ? await doHash(toBePatched.password)
      : "";

    const toPatch: {
      first_name?: string;
      last_name?: string;
      email?: string;
      password_hash?: string;
      phone?: string;
      role?: userDataType["role"];
    } = {};

    if (jsonProps.includes("first_name")) {
      toPatch.first_name = toBePatched.first_name;
    }
    if (jsonProps.includes("last_name")) {
      toPatch.last_name = toBePatched.last_name;
    }
    if (jsonProps.includes("email")) {
      toPatch.email = toBePatched.email;
    }
    if (jsonProps.includes("password") && hashed) {
      toPatch.password_hash = hashed;
    }
    if (jsonProps.includes("phone")) {
      toPatch.phone = toBePatched.phone;
    }
    if (jsonProps.includes("role")) {
      toPatch.role = toBePatched.role;
    }

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: toPatch,
      select: publicUserWithHashSelect,
    });

    return NextResponse.json({ user: toPublicUser(user) }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error patching user");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const authError = await requireDirector();
    if (authError) return authError;
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.user.deleteMany({
      where: {
        id,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error deleting user");
  }
}
