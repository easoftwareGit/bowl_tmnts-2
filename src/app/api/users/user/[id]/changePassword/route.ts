import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isPassword8to20, isValidBtDbId } from "@/lib/validation/validation";
import { doCompare, doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/users/:id/changePassword

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const { currentPassword, newPassword } = await req.json();
    
    if (!isPassword8to20(currentPassword) || !isPassword8to20(newPassword)) {
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
    });

    if (!dbUser) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    };

    if (!dbUser.password_hash) {
      return NextResponse.json({ error: "User has no password" }, { status: 400 });
    }
    
    const pwdsMatch = await doCompare(currentPassword, dbUser.password_hash);
    if (!pwdsMatch) {
      return NextResponse.json({ error: "Current Password is incorrect" }, { status: 400 });
    }

    const newHash = await doHash(newPassword || "");
    if (!newHash) {
      return NextResponse.json({ error: "Error hashing password" }, { status: 500 });
    }

    await prisma.user.update({
      where: { id },
      data: { password_hash: newHash },      
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error changing password");
  }
};