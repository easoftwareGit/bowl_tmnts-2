import { NextResponse } from "next/server";
import { compare } from "bcrypt";
import { bcryptLength, maxToHashLength } from "@/lib/validation/validation";

export async function PUT(req: Request) { 
  
  try { 
    const { toHash, hashed } = await req.json();
    if (!toHash || toHash.length > maxToHashLength || !hashed || hashed.length !== bcryptLength) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const match = await compare(toHash, hashed);

    if (!match) {
      return NextResponse.json({ error: "does not match" }, { status: 404 });
    }

    return NextResponse.json({ match }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error bcrypt put" }, { status: 500 });
  }
}