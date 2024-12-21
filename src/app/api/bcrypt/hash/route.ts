import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { maxToHashLength } from "@/lib/validation";

export async function PUT(req: Request) {

  try {
    const { toHash } = await req.json();
    if (!toHash || toHash.length > maxToHashLength) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const saltRoundsStr: any = process.env.SALT_ROUNDS;
    let saltRounds: number;
    if (saltRoundsStr.startsWith("undefined")) {
      const testSaltRoundsStr: any = process.env.TEST_SALT_ROUNDS;
      if (testSaltRoundsStr.startsWith("undefined")) {
        return NextResponse.json({ error: "other error" }, { status: 404 });
      } else {
        saltRounds = parseInt(testSaltRoundsStr);
      }
    } else {
      saltRounds = parseInt(saltRoundsStr);
    }

    const hashed = await hash(toHash, saltRounds);    

    return NextResponse.json({ hashed }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Error bcrypt put" }, { status: 500 });
  }
}