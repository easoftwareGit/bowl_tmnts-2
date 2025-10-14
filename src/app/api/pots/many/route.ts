import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { potType, potDataType, potCategoriesTypes } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { validatePots } from "../validate";
import { getErrorStatus } from "../../errCodes";
import { potDataForPrisma } from "../dataForPrisma";

// routes /api/pots/many

export async function POST(request: NextRequest) {

  try {
    const pots: potType[] = await request.json();
    if (Array.isArray(pots) && pots.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate pots
    const validPots = await validatePots(pots); // need to use await! or else returns a promise
    if (validPots.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid pots into potData to post
    const potsToPost: potDataType[] = validPots.pots
      .map(pot => potDataForPrisma(pot))
      .filter((data): data is potDataType => data !== null);

    const result = await prisma.pot.createMany({
      data: potsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many pots" },
      { status: errStatus }
    );        
  } 
}
