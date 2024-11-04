import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";
import { ErrorCode } from "@/lib/validation";
import { findUserByEmail } from "@/lib/db/users/users";
import { sanitizeUser, validateUser } from "./validate";
import { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";

// routes /api/users

export async function GET(request: NextRequest) {
  const users = await prisma.user.findMany({})  
  return NextResponse.json({users}, {status: 200});
}

export async function POST(request: Request) {
  
  // use route api/register  
  // this route for testing only
  try {
    const { id, first_name, last_name, email, phone, password } = await request.json();
    
    const toCheck: userType = {
      ...initUser,
      id,
      first_name,
      last_name,
      email,
      phone,
      password,
    }
    
    const toPost = sanitizeUser(toCheck);
    const errCode = validateUser(toPost, true, true);
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

    const oldUser = await findUserByEmail(email);
    if (oldUser) {
      return NextResponse.json(
        { error: "email already in use" },
        { status: 409 }
      );
    }
    
    const saltRoundsStr: any = process.env.SALT_ROUNDS;
    const saltRounds = parseInt(saltRoundsStr);
    const hashed = await hash(password, saltRounds);

    type userDataType = {
      id: string;
      first_name: string,
      last_name: string,
      email: string,
      phone: string,
      password_hash: string,      
    }
    let userData: userDataType = {
      id: toPost.id,
      first_name: toPost.first_name,
      last_name: toPost.last_name,
      email,
      phone: toPost.phone,
      password_hash: hashed,
    }

    const user = await prisma.user.create({
      data: userData,
    });
    return NextResponse.json({ user }, { status: 201 });        
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case 'P2002': // Unique constraint failed on the fields: (`email`)
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error creating user" },
      { status: errStatus }
    );
  }
}