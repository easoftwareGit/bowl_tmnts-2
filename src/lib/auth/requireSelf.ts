import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Checks that the request comes from the logged-in user whose id is in the URL.
 *
 * @param {string} id - user id from the route params
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireSelf(id: string): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "not logged in" }, { status: 401 });
  }
  if (session.user.id !== id) {
    return NextResponse.json({ message: "not authorized" }, { status: 403 });
  }
  return null;
}