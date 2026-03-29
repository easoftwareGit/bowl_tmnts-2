import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLane, sanitizeLane } from "../../../lib/validation/lanes/validate";
import { ErrorCode } from "@/lib/enums/enums";
import type { laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import { getErrorStatus, standardCatchReturn } from "../apiCatch";

// routes /api/lanes

export async function GET(request: NextRequest) {
  try {
    const lanes = await prisma.lane.findMany({
      orderBy: [
        {
          squad_id: 'asc',
        },
        {
          lane_number: 'asc',
        }
      ]      
    })
    return NextResponse.json({ lanes }, { status: 200 });        
  } catch (error) {
    return standardCatchReturn(error, "error getting lanes");
  }  
}

export const POST = async (request: NextRequest) => { 
  try {
    const { id, lane_number, squad_id } = await request.json();
    const toCheck: laneType = {
      ...initLane,
      id,
      lane_number,
      squad_id
    }
    const toPost = sanitizeLane(toCheck);
    const errCode = validateLane(toPost);
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
    
    const lane = await prisma.lane.create({
      data: toPost
    })
    return NextResponse.json({ lane }, { status: 201 });    
  } catch (error) {
    return standardCatchReturn(error, "error creating lane");
  }
}
