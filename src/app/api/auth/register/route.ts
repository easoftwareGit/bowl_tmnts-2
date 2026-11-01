import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ErrorCode } from "@/lib/enums/enums";
import type {
  roleTypes,
  registerUserType,
  userDataType,
  userFormType,  
} from "@/lib/types/types";
import { normalizeEmail } from "@/lib/auth/authUtils";
import { initUserForm } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "@/lib/validation/users/validate";
import { btDbUuid } from "@/lib/uuid";
import { doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "../../apiCatch";

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  try {
    const { first_name, last_name, email, phone, password } = 
      body as registerUserType;

    const postUser: userFormType = {
      ...initUserForm,
      id: btDbUuid("usr"),
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      email: typeof email === "string" ? normalizeEmail(email) : "",
      phone: phone ?? "",
      password: password ?? "",
      role: "DIRECTOR", // currently all new users are directors
    };

    const checkPhone = !!postUser.phone;

    const sanitized = sanitizeUser(postUser);

    if (!sanitized) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const sanitizedUser: userFormType = {
      id: sanitized.id,
      email: sanitized.email,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      phone: sanitized.phone,
      role: sanitized.role as roleTypes,
      password: "password" in sanitized ? sanitized.password : postUser.password,
    };

    const errCode = validateUser(sanitizedUser, checkPhone, true);

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

    const oldUser = await prisma.user.findUnique({
      where: {
        email: sanitizedUser.email,
      },
    });

    if (oldUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 }
      );
    }

    const hashedPassword = await doHash(sanitizedUser.password);

    const createdUser = await prisma.user.create({
      data: {
        id: sanitizedUser.id,
        first_name: sanitizedUser.first_name,
        last_name: sanitizedUser.last_name,
        email: sanitizedUser.email,
        phone: sanitizedUser.phone || null,
        password_hash: hashedPassword,
        role: sanitizedUser.role,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone: true,
        role: true,
      },
    });

    const user: userDataType = {
      id: createdUser.id,
      email: createdUser.email,
      first_name: createdUser.first_name,
      last_name: createdUser.last_name,
      phone: createdUser.phone ?? "",
      role: createdUser.role as userDataType["role"],
    };

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "Error registering user");
  }
}
