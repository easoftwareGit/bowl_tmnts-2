import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/enums/enums";
import type { brktSeedType } from "@/lib/types/types";
import { validateBrktSeeds } from "../../../../lib/validation/brktSeeds/validate";
import { getErrorStatus } from "../../errCodes";

// routes /api/brktSeeds/many

export async function POST(request: NextRequest) {
  try {
    const brktSeeds: brktSeedType[] = await request.json();
    if (Array.isArray(brktSeeds) && brktSeeds.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate brktSeeds
    const validBrktSeeds = await validateBrktSeeds(brktSeeds) // need to use await! or else returns a promise
    if (validBrktSeeds.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const brktSeedsToPost = validBrktSeeds.brktSeeds;
    const result = await prisma.brkt_Seed.createMany({
      data: brktSeedsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    });

    return NextResponse.json({ count: result.count }, { status: 201 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many brktSeeds" },
      { status: errStatus }
    );            
  }
}