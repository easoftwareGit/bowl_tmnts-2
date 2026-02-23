import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/enums/enums";
import type { oneBrktType } from "@/lib/types/types";
import { validateOneBrkts } from "../../../../lib/validation/oneBrkts/valildate";
import { getErrorStatus } from "../../errCodes";

// routes /api/oneBrkts/many

export async function POST(request: NextRequest) {
  try {    
    const oneBrkts: oneBrktType[] = await request.json();
    if (Array.isArray(oneBrkts) && oneBrkts.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate oneBrkts    
    const validOneBrkts = await validateOneBrkts(oneBrkts) // need to use await! or else returns a promise
    if (validOneBrkts.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const oneBrktsToPost = validOneBrkts.oneBrkts
    const result = await prisma.one_Brkt.createMany({
      data: oneBrktsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    });

    return NextResponse.json({ count: result.count }, { status: 201 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many oneBrkts" },
      { status: errStatus }
    );            
  }
}