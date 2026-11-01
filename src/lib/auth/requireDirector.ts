import { NextResponse } from "next/server";
import { auth } from "@/auth";

const writeRoles = ["DIRECTOR", "ADMIN"];

/**
 * Checks that the request comes from a logged-in director or admin.
 *
 * @returns {Promise<NextResponse | null>} - error response to return, or null if allowed
 */
export async function requireDirector(): Promise<NextResponse | null> {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ message: "not logged in" }, { status: 401 });
  }
  if (!writeRoles.includes(session.user.role ?? "")) {
    return NextResponse.json({ message: "not authorized" }, { status: 403 });
  }
  return null;
}