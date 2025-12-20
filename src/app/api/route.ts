import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(_request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true }, { status: 200 });
}