import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { userDataType, userFormType, roleTypes } from "@/lib/types/types";
import { blankUserData, initUserForm } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "@/lib/validation/users/validate";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/users/:id

const isRoleType = (value: unknown): value is roleTypes => {
  return value === "ADMIN" || value === "DIRECTOR" || value === "USER";
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error getting user by id");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const { first_name, last_name, email, phone, password, role } =
      await req.json();

    const toCheck: userFormType = {
      ...initUserForm,
      id,
      first_name,
      last_name,
      email,
      phone,
      password,
      role,
    };

    const sanitized = sanitizeUser(toCheck);
    const toPut: userFormType = {
      id: sanitized.id,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      email: sanitized.email,
      phone: sanitized.phone,
      password: "password" in sanitized ? sanitized.password : "",
      role: sanitized.role === "" ? toCheck.role : sanitized.role,
    };
    // detect if sanitization changed phone or password
    const phoneChanged = toCheck.phone !== sanitized.phone;
    const passwordChanged =
      "password" in sanitized ? toCheck.password !== sanitized.password : false;
    if (phoneChanged || passwordChanged) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const checkPhone = toPut.phone !== "";
    const checkPass = toPut.password !== "";

    const errCode = validateUser(toPut, checkPhone, checkPass);
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

    const hashed = toPut.password ? await doHash(toPut.password) : "";
    if (!hashed && toPut.password !== "") {
      return NextResponse.json(
        { error: "Error hashing password" },
        { status: 422 },
      );
    }

    const result = await prisma.user.updateMany({
      where: {
        id,
      },
      data: {
        first_name: toPut.first_name,
        last_name: toPut.last_name,
        email: toPut.email,
        password_hash: hashed,
        phone: toPut.phone,
        role: toPut.role,
      },
    });

    if (result.count === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // do not return password or password_hash
    const user: userDataType & { password_hash: string } = {
      ...blankUserData,
      id: toPut.id,
      first_name: toPut.first_name,
      last_name: toPut.last_name,
      email: toPut.email,
      phone: toPut.phone,
      role: toPut.role,
      password_hash: hashed,
    };

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error putting user");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const currentUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    const jsonProps = Object.getOwnPropertyNames(json);

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
      toCheck.first_name = json.first_name;
    }
    if (jsonProps.includes("last_name")) {
      toCheck.last_name = json.last_name;
    }
    if (jsonProps.includes("email")) {
      toCheck.email = json.email;
    }
    if (jsonProps.includes("phone")) {
      toCheck.phone = json.phone;
    }
    if (jsonProps.includes("password")) {
      toCheck.password = json.password;
    }
    if (jsonProps.includes("role")) {
      toCheck.role = json.role;
    }

    // if password_hash is not empty and new password is empty
    // return error - cannot remove password
    if (
      currentUser.password_hash !== "" &&
      jsonProps.includes("password") &&
      toCheck.password === ""
    ) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const sanitized = sanitizeUser(toCheck);
    const toBePatched: userFormType = {
      id: sanitized.id,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      email: sanitized.email,
      phone: sanitized.phone,
      password: "password" in sanitized ? sanitized.password : "",
      role: sanitized.role === "" ? toCheck.role : sanitized.role,
    };

    // detect if sanitization changed phone or password
    const phoneChanged = toCheck.phone !== sanitized.phone;
    const passwordChanged =
      "password" in sanitized ? toCheck.password !== sanitized.password : false;

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

    const hashed = toBePatched.password
      ? await doHash(toBePatched.password)
      : "";

    // let hashedPassword = "";
    // if (jsonProps.includes("password")) {
    //   hashedPassword = await doHash(toBePatched.password);
    // }

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
    if (jsonProps.includes("password")) {
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
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error patching user");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "usr")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.user.deleteMany({
      where: {
        id,
      },
    });

    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "Error deleting user");
  }
}
