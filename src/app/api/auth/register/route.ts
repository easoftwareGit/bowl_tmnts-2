import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { NextResponse } from "next/server";
import { ErrorCode } from "@/lib/validation";
import { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "../../users/validate";

export async function POST(req: Request) {
  try {        
    const { id, first_name, last_name, email, phone, password } = await req.json();
    const postUser: userType = {
      ...initUser,
      id,
      first_name,
      last_name,
      email,
      phone,
      password,
    }
    
    let checkPhone = false
    if (phone) {
      checkPhone = true
    }
    const sanitizedUser: userType = sanitizeUser(postUser);  
    const errCode = validateUser(sanitizedUser, checkPhone, true);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.InvalidData:
          errMsg = 'invalid data'
          break;
        default:
          errMsg = 'unknown error'
          break;        
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      )
    }

    // if got here, email is valid, ok to pass use sanitizedUser.email
    // find user in database by matching email
    const oldUser = await prisma.user.findUnique({
      where: {
        email: sanitizedUser.email,
      },
    });    
    
    if (oldUser) {
      return NextResponse.json(
        { error: "email already in use" },
        { status: 409 }
      );
    }

    const saltRoundsStr: any = process.env.SALT_ROUNDS;
    const saltRounds = parseInt(saltRoundsStr);
    const hashedpassword = await hash(password, saltRounds);

    const user = await prisma.user.create({
      data: {
        id: sanitizedUser.id,
        first_name: sanitizedUser.first_name,
        last_name: sanitizedUser.last_name,
        email,
        phone: sanitizedUser.phone,
        password_hash: hashedpassword,
      },
    });
    return NextResponse.json({user}, {status: 201});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );    
  }
}
