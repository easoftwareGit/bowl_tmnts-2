import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { squadType, squadDataType } from "@/lib/types/types";
import { validateSquads } from "../validate";
import { getErrorStatus } from "../../errCodes";
import { squadDataForPrisma } from "../dataForPrisma";

// routes /api/squads/many

export async function POST(request: NextRequest) { 

  try { 
    const squads: squadType[] = await request.json();
    if (Array.isArray(squads) && squads.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    const validSquads = await validateSquads(squads); // need to use await! or else returns a promise
    if (validSquads.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid squads into SquadData to post
    const squadsToPost: squadDataType[] = []
    for (let i = 0; i < validSquads.squads.length; i++) {
      const toPush = squadDataForPrisma(validSquads.squads[i]);
      if (toPush) {
        squadsToPost.push(toPush);
      } else {
        return NextResponse.json({ error: "invalid data" }, { status: 422 });
      }
    }
    const result = await prisma.squad.createMany({
      data: squadsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many squads" },
      { status: errStatus }
    );        
  } 
}