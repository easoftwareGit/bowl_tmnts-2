import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBrktSeed, sanitizeBrktSeed } from "../../../lib/validation/brktSeeds/validate"
import { ErrorCode } from "@/lib/validation/validation";
import { brktSeedType } from "@/lib/types/types";
import { initBrktSeed } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";

// routes /api/brktSeeds/

export async function GET(request: Request) {
  try {    
    const brktSeeds = await prisma.brkt_Seed.findMany({
      orderBy: [
        {
          one_brkt_id: 'asc',
        }, 
        {
          seed: 'asc',
        }, 
      ]
    });
    return NextResponse.json({brktSeeds}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brktSeeds" },
      { status: 400 }
    );            
  }  
}

export async function POST(request: NextRequest) {
  try {
    const { one_brkt_id, seed, player_id } = await request.json()    
    const toCheck: brktSeedType = {
      ...initBrktSeed,
      one_brkt_id,
      seed,
      player_id,
    }

    const toPost = sanitizeBrktSeed(toCheck);
    const errCode = validateBrktSeed(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;        
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      );
    }
    const brktSeed = await prisma.brkt_Seed.create({
      data: toPost,
    });
    return NextResponse.json({brktSeed}, {status: 201});
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating brktSeed" },
      { status: errStatus }
    );
  }
}