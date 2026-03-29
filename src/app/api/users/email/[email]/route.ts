import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isEmail } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { maxEmailLength } from "@/lib/validation/constants";

// routes /api/users/email/:email

export async function GET(
  request: Request,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    const { email } = await params;

    if (!email || !isEmail(email) || email.length > maxEmailLength) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
      
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting user by email");
  }
} 