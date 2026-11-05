import "server-only";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// ---- roles ----

/** Roles allowed into the private pages and the write APIs. */
const PRIVATE_ROLES = ["DIRECTOR", "ADMIN"] as const;

export function hasPrivateRole(role: string | null | undefined): boolean {
  return !!role && (PRIVATE_ROLES as readonly string[]).includes(role);
}

function isAdmin(role: string | null | undefined): boolean {
  return role === "ADMIN";
}

// ---- responses ----

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });

const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

// ---- API route guards ----
// Each returns an error response to return as is, or null if allowed:
//   const denied = await requireDirector();
//   if (denied) return denied;

/**
 * Checks that the request comes from a logged-in director or admin.
 *
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireDirector(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) return notLoggedIn();
  if (!hasPrivateRole(session.user.role)) return notAuthorized();
  return null;
}

/**
 * Checks that the request comes from the logged-in user whose id is in the URL.
 *
 * @param {string} id - user id from the route params
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireSelf(id: string): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user?.id) return notLoggedIn();
  if (session.user.id !== id) return notAuthorized();
  return null;
}

/**
 * Checks that the request comes from the logged-in user whose id is in the
 * URL, or from an admin. Use this for anything that reads or changes a
 * user's own account.
 *
 * @param {string} id - user id from the route params
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireSelfOrAdmin(
  id: string
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) return notLoggedIn();
  if (session.user.id && session.user.id === id) return null;
  if (isAdmin(session.user.role)) return null;
  return notAuthorized();
}

/**
 * Checks that the request comes from the logged-in user whose id is in the
 * URL, or from any director or admin.
 *
 * WARNING: any director passes this check for ANY user id. Don't use it for
 * routes that read or change user accounts; use requireSelfOrAdmin.
 *
 * @param {string} id - user id from the route params
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireSelfOrDirector(
  id: string
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) return notLoggedIn();
  if (session.user.id && session.user.id === id) return null;
  if (hasPrivateRole(session.user.role)) return null;
  return notAuthorized();
}

// ---- page guard ----

/**
 * For Server Component pages and layouts: sends anyone who isn't a logged-in
 * director or admin somewhere else. Returns the session when allowed.
 *
 *   not logged in        -> /login
 *   logged in, wrong role -> /denied
 */
export async function requirePrivatePage() {
  const session = await auth();

  if (!session?.user) redirect("/login");
  if (!hasPrivateRole(session.user.role)) redirect("/denied");

  return session;
}