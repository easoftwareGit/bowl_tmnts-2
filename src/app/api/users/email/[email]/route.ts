import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmail } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { maxEmailLength } from "@/lib/validation/constants";
import { normalizeEmail } from "@/lib/auth/authUtils";

// routes /api/users/email/:email

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    const { email } = await params;
    
    if (!email) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }      

    const normalized = normalizeEmail(email);

    if (!normalized || !isEmail(normalized) || normalized.length > maxEmailLength) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalized },
      select: { id: true },      
    });

    const gotUser = user !== null;
    return NextResponse.json({ gotUser }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting user by email");
  }
} 