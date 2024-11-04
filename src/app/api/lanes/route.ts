import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateLane, sanitizeLane } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { laneDataType, laneType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";

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
  } catch (error: any) {
    return NextResponse.json(
      { error: "error getting lanes" },
      { status: 400 }
    );            
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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.InvalidData:
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
    
    let laneData: laneDataType = {
      id: toPost.id,
      squad_id: toPost.squad_id,
      lane_number: toPost.lane_number
    }
    const lane = await prisma.lane.create({
      data: laneData      
    })
    return NextResponse.json({ lane }, { status: 201 });    
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // Foreign key constraint
        errStatus = 409
        break;    
      case 'P2025': // Record not found
        errStatus = 404
        break;
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating lane" },
      { status: errStatus }
    );        
  }
}
