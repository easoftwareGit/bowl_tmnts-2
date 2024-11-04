import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "../../validate";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { hash } from "bcrypt";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });
    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error getting user" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const { first_name, last_name, email, phone, password } = await req.json();
    const toCheck: userType = {
      ...initUser,
      id,
      first_name,
      last_name,
      email,
      phone,
      password,
    };

    const toPut = sanitizeUser(toCheck);    
    const errCode = validateUser(toPut, true, true);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const saltRoundsStr: any = process.env.SALT_ROUNDS;
    const saltRounds = parseInt(saltRoundsStr);
    const hashedPassword = await hash(toPut.password, saltRounds);

    const user = await prisma.user.update({
      where: {
        id: id,
      },
      data: {
        first_name: toPut.first_name,
        last_name: toPut.last_name,
        email: toPut.email,
        password_hash: hashedPassword,
        phone: toPut.phone,
      },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
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
      { error: "Error putting user" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    
    const currentUser = await prisma.user.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentUser) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: userType = {
      ...initUser,
      first_name: currentUser.first_name,
      last_name: currentUser.last_name,
      email: currentUser.email,
      phone: currentUser.phone || "",        
      password_hash: currentUser.password_hash || "",
    };

    let checkPhone = false
    let checkPass = false
    if (jsonProps.includes('first_name')) {
      toCheck.first_name = json.first_name;
    }
    if (jsonProps.includes('last_name')) {
      toCheck.last_name = json.last_name;
    }
    if (jsonProps.includes('email')) {
      toCheck.email = json.email;
    }
    if (jsonProps.includes('phone')) {
      toCheck.phone = json.phone;
      checkPhone = true
    }
    if (jsonProps.includes("password")) {
      toCheck.password = json.password;
      checkPass = true
    }
    
    const toBePatched = sanitizeUser(toCheck);
    const errCode = validateUser(toBePatched, checkPhone, checkPass);    
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode as ErrorCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    let hashedPassword = "";
    if (jsonProps.includes("password")) {
      const saltRoundsStr: any = process.env.SALT_ROUNDS;
      const saltRounds = parseInt(saltRoundsStr);
      hashedPassword = await hash(toCheck.password, saltRounds);
    }    
    const toPatch = {
      first_name: "",
      last_name: "",
      email: "",
      password_hash: "",
      phone: "",
    };
    if (jsonProps.includes("first_name")) {
      toPatch.first_name = toBePatched.first_name;
    }
    if (jsonProps.includes("last_name")) {
      toPatch.last_name = toBePatched.last_name;
    }
    if (jsonProps.includes("email")) {
      toPatch.email = toBePatched.email;
    }
    if (jsonProps.includes("password")) {
      toPatch.password_hash = hashedPassword;
    }
    if (jsonProps.includes("phone")) {
      toPatch.phone = toBePatched.phone;
    }
    const user = await prisma.user.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        first_name: toPatch.first_name || undefined,
        last_name: toPatch.last_name || undefined,
        email: toPatch.email || undefined,
        password_hash: hashedPassword || undefined,
        phone: toPatch.phone || undefined,
      },
    });
    return NextResponse.json({ user }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case 'P2002': // Unique constraint failed on the fields: (`email`)
        errStatus = 409;
        break;
      case "P2003": // parent has child rows
        errStatus = 404;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error pasting user" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.user.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003": // parent has child rows
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
      { error: "Error deleting user" },
      { status: errStatus }
    );
  }
}
