import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktSeedType } from "@/lib/types/types";
import { validateBrktSeeds } from "../validate";
import { getErrorStatus } from "../../errCodes";

// routes /api/brktSeeds/many

export async function POST(request: NextRequest) {
  try {
    const brktSeeds: brktSeedType[] = await request.json();
    // sanitize and validate brktSeeds
    const validbrktSeeds = await validateBrktSeeds(brktSeeds) // need to use await! or else returns a promise
    if (validbrktSeeds.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const brktSeedsToPost = validbrktSeeds.brktSeeds;
    const createdBrktSeeds = await prisma.$transaction(
      brktSeedsToPost.map((brktSeed) => {
        return prisma.brkt_Seed.create({
          data: {
            one_brkt_id: brktSeed.one_brkt_id,
            seed: brktSeed.seed,
            player_id: brktSeed.player_id,
          },
        });
      })
    )
      
    return NextResponse.json({brktSeeds: createdBrktSeeds}, {status: 201});
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many brktSeeds" },
      { status: errStatus }
    );            
  }
}