import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation/validation";
import { brktType, brktDataType } from "@/lib/types/types";
import { validateBrkts } from "../../../../lib/validation/brkts/validate";
import { getErrorStatus } from "../../errCodes";
import { brktDataForPrisma } from "../dataForPrisma";

// routes /api/brkts/many

export async function POST(request: NextRequest) {

  try {
    const brkts: brktType[] = await request.json();
    if (Array.isArray(brkts) && brkts.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate brkts
    const validBrkts = await validateBrkts(brkts); // need to use await! or else returns a promise
    if (validBrkts.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid brkts into brktData to post
    const brktsToPost: brktDataType[] = validBrkts.brkts
      .map(brkt => brktDataForPrisma(brkt))
      .filter((data): data is brktDataType => data !== null);
    
    const result = await prisma.brkt.createMany({
      data: brktsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many brkts" },
      { status: errStatus }
    );        
  } 
}