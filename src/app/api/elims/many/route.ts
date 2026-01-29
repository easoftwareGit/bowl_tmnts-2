import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation/validation";
import { elimType, elimDataType } from "@/lib/types/types";
import { validateElims } from "../../../../lib/validation/elims/validate";
import { getErrorStatus } from "../../errCodes";
import { elimDataForPrisma } from "../dataForPrisma";

// routes /api/elims/many

export async function POST(request: NextRequest) {

  try {
    const elims: elimType[] = await request.json();
    if (Array.isArray(elims) && elims.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate elims
    const validElims = await validateElims(elims); // need to use await! or else returns a promise
    if (validElims.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid elims to elims to post
    const elimsToPost: elimDataType[] = validElims.elims
      .map(elim => elimDataForPrisma(elim))
      .filter((data): data is elimDataType => data !== null); 
    const result = await prisma.elim.createMany({
      data: elimsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many elims" },
      { status: errStatus }
    );        
  } 
}