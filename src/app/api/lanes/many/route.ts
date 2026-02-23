import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/enums/enums";
import type { laneType } from "@/lib/types/types";
import { validateLanes } from "../../../../lib/validation/lanes/validate";
import { getErrorStatus } from "../../errCodes";

// routes /api/lanes/many

export async function POST(request: NextRequest) {

  try {
    const lanes: laneType[] = await request.json();
    if (Array.isArray(lanes) && lanes.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate squads
    const validLanes = await validateLanes(lanes); // need to use await! or else returns a promise
    if (validLanes.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const result = await prisma.lane.createMany({
      // data: lanesToPost,
      data: validLanes.lanes,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many lanes" },
      { status: errStatus }
    );        
  } 
}
