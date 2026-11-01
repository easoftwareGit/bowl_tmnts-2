import { NextResponse } from "next/server";
import { auth } from "@/auth";

const directorRoles = ["DIRECTOR", "ADMIN"];

/**
 * Checks that the request comes from the logged-in user whose id is in the
 * URL, or from a logged-in director or admin.
 *
 * @param {string} id - user id from the route params
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireSelfOrDirector(
  id: string
): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "not logged in" }, { status: 401 });
  }
  // the user themself
  if (session.user.id && session.user.id === id) {
    return null;
  }
  // a director or admin
  if (directorRoles.includes(session.user.role ?? "")) {
    return null;
  }
  return NextResponse.json({ message: "not authorized" }, { status: 403 });
}