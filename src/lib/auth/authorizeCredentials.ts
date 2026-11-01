// The email + password check for NextAuth's credentials provider.
// Kept out of auth.ts (and free of next-auth imports) so it can be unit tested.
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";
import {
  maxPwdAttempts,
  normalizeEmail,
  pwdLockMinutes,
} from "@/lib/auth/authUtils";

export type AppUser = {
  id: string;
  email: string;
  name: string;
  first_name: string;
  last_name: string;
  role: string;
};

export type AuthorizeResult =
  | { status: "ok"; user: AppUser }
  | { status: "invalid" }
  | { status: "locked" };

const invalid: AuthorizeResult = { status: "invalid" };
const locked: AuthorizeResult = { status: "locked" };

/**
 * checks an email + password login, with a lockout after too many
 * wrong passwords.
 *
 * - wrong password: adds 1 to failed_pwd_attempts
 * - the maxPwdAttempts-th wrong password: locks the account for
 *   pwdLockMinutes and resets the counter
 * - while locked: the password is not even checked
 * - right password: clears any old failed attempts / expired lock
 *
 * @param credentials - what the login form sent
 * @returns - ok + the user, invalid, or locked
 */
export const authorizeCredentials = async (
  credentials: Partial<Record<"email" | "password", unknown>> | undefined,
): Promise<AuthorizeResult> => {
  const email =
    typeof credentials?.email === "string"
      ? normalizeEmail(credentials.email)
      : "";
  const password =
    typeof credentials?.password === "string" ? credentials.password : "";

  if (!email || !password) return invalid;

  const dbUser = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      first_name: true,
      last_name: true,
      role: true,
      password_hash: true,
      failed_pwd_attempts: true,
      pwd_locked_until: true,
    },
  });

  // no such user, or a Google-only user with no password
  if (!dbUser || !dbUser.password_hash) return invalid;

  // locked: refuse without checking the password, so guesses made while
  // locked can never succeed
  if (dbUser.pwd_locked_until && dbUser.pwd_locked_until > new Date()) {
    return locked;
  }

  const isPasswordValid = await compare(password, dbUser.password_hash);

  if (!isPasswordValid) {
    const failed = await prisma.user.update({
      where: { id: dbUser.id },
      data: { failed_pwd_attempts: { increment: 1 } },
      select: { failed_pwd_attempts: true },
    });

    if (failed.failed_pwd_attempts >= maxPwdAttempts) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          failed_pwd_attempts: 0,
          pwd_locked_until: new Date(Date.now() + pwdLockMinutes * 60 * 1000),
        },
      });
      // tell the user now, not on their next try
      return locked;
    }
    return invalid;
  }

  // right password: clear old failed attempts or an expired lock,
  // but skip the write when there is nothing to clear
  if (dbUser.failed_pwd_attempts > 0 || dbUser.pwd_locked_until) {
    await prisma.user.update({
      where: { id: dbUser.id },
      data: { failed_pwd_attempts: 0, pwd_locked_until: null },
    });
  }

  return {
    status: "ok",
    user: {
      id: dbUser.id,
      email: normalizeEmail(dbUser.email),
      name: `${dbUser.first_name} ${dbUser.last_name}`.trim(),
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      role: dbUser.role,
    },
  };
};