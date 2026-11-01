import type { Prisma } from "@prisma/client";

// fields that are safe to send to the browser
// (never password_hash, failed_pwd_attempts or pwd_locked_until)
export const publicUserSelect = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  phone: true,
  role: true,
} satisfies Prisma.UserSelect;

// public fields plus password_hash, for routes that pass the row to
// toPublicUser() so it can set has_password
export const publicUserWithHashSelect = {
  ...publicUserSelect,
  password_hash: true,
} satisfies Prisma.UserSelect;

// fields that must never be sent to the browser
const privateUserFields = [
  "password_hash",
  "failed_pwd_attempts",
  "pwd_locked_until",
] as const;

type PrivateUserField = (typeof privateUserFields)[number];

/**
 * Server-only helper: never send password_hash or the password lockout
 * fields (failed_pwd_attempts, pwd_locked_until) to the browser.
 * Replaces password_hash with a has_password flag, which is all the UI needs.
 *
 * @param {object} user - one row of user data
 * @returns {object} - user data without the private fields, with has_password flag
 */
export const toPublicUser = <
  T extends {
    password_hash?: string | null;
    failed_pwd_attempts?: number;
    pwd_locked_until?: Date | null;
  },
>(
  user: T
): Omit<T, PrivateUserField> & { has_password: boolean } => {
  // copy the user, then remove the private fields from the copy
  const rest: Partial<T> = { ...user };
  for (const field of privateUserFields) {
    delete rest[field];
  }
  // return the public fields with a has_password flag set
  return {
    ...(rest as Omit<T, PrivateUserField>),
    has_password: !!user.password_hash,
  };
};