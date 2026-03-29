import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeUser, validateUser } from "@/lib/validation/users/validate";
import type { userDataType, userFormType } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";
import { doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "../apiCatch";
import { isEmail } from "@/lib/validation/validation";
import { maxEmailLength } from "@/lib/validation/constants";

// routes /api/users

export async function GET(request: NextRequest) {
  try {
    const users = await prisma.user.findMany({});
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting users");
  }
}

export async function POST(request: Request) {
  // use route api/register
  // this route for testing only
  try {
    const { id, first_name, last_name, email, phone, password } =
      await request.json();

    const toCheck: userFormType = {
      ...initUserForm,
      id,
      first_name,
      last_name,
      email,
      phone,
      password,
    };

    const sanitized = sanitizeUser(toCheck);
    // detect if sanitization changed non-blank phone to blank
    const phoneChanged = (toCheck.phone !== '' && sanitized.phone === '');
    // detect if sanitization changed password 
    const passwordChanged = "password" in sanitized 
      ? toCheck.password !== sanitized.password
      : false;
    
    if (phoneChanged || passwordChanged) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });      
    }
    const toPost: userFormType = {
      id: sanitized.id,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      email: sanitized.email,
      phone: sanitized.phone,
      password: "password" in sanitized ? sanitized.password : "",
      role: sanitized.role === "" ? toCheck.role : sanitized.role,
    };

    const checkPhone = toPost.phone !== "";
    const checkPass = toPost.password !== "";
    
    const errCode = validateUser(toPost, checkPhone, checkPass);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
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

    // get old user by email
    if (!toPost.email || !isEmail(toPost.email) || email.length > maxEmailLength) {
      return NextResponse.json({ error: "invalid email" }, { status: 400 });
    }
    const oldUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (oldUser) {
      return NextResponse.json(
        { error: "email already in use" },
        { status: 409 }
      );
    }

    const hashed = toPost.password
      ? await doHash(toPost.password)
      : '';

    const userData: userDataType & { password_hash: string } = {
      id: toPost.id,
      first_name: toPost.first_name,
      last_name: toPost.last_name,
      email: toPost.email,
      phone: toPost.phone,
      role: toPost.role,
      password_hash: hashed,
    };

    const user = await prisma.user.create({
      data: userData,
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "Error creating user");
  }
}
