import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { ErrorCode } from "@/lib/enums/enums";
import type { roleTypes, userDataType, userFormType } from "@/lib/types/types";
import { initUserForm } from "@/lib/db/initVals";
import { sanitizeUser, validateUser } from "@/lib/validation/users/validate";
import { doHash } from "@/lib/server/hashServer";
import { standardCatchReturn } from "../../apiCatch";

export async function POST(req: Request) {
  try {
    const { id, first_name, last_name, email, phone, password } =
      (await req.json()) as Partial<userFormType>;

    const postUser: userFormType = {
      ...initUserForm,
      id: id ?? initUserForm.id,
      first_name: first_name ?? "",
      last_name: last_name ?? "",
      email: email ?? "",
      phone: phone ?? "",
      password: password ?? "",
    };

    const checkPhone = !!postUser.phone;

    const sanitized = sanitizeUser(postUser);

    const sanitizedRole: roleTypes =
      sanitized.role === "ADMIN" ||
      sanitized.role === "DIRECTOR" ||
      sanitized.role === "USER"
        ? sanitized.role
        : postUser.role;

    const sanitizedUser: userFormType = {
      id: sanitized.id,
      email: sanitized.email,
      first_name: sanitized.first_name,
      last_name: sanitized.last_name,
      phone: sanitized.phone,
      role: sanitizedRole,
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
        { error: "email already in use" },
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
      role: sanitizedUser.role,
    };

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "Error creating user");
  }
}
