import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { laneType, laneDataType } from "@/lib/types/types";
import { initLane } from "@/lib/db/initVals";
import { validateLanes } from "../validate";

// routes /api/lanes/many

export async function POST(request: NextRequest) {

  try {
    const lanes: laneType[] = await request.json();
    // sanitize and validate squads
    const validLanes = await validateLanes(lanes); // need to use await! or else returns a promise
    if (validLanes.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid lanes into LaneData to post
    const lanesToPost: laneDataType[] = []
    validLanes.lanes.forEach(lane => {
      lanesToPost.push({
        id: lane.id,
        squad_id: lane.squad_id,
        lane_number: lane.lane_number,
        in_use: lane.in_use
      })
    });      

    const prismaLanes = await prisma.lane.createManyAndReturn({
      data: [...lanesToPost]
    })
    // convert prismaLanes to lanes
    const manyLanes: laneType[] = [];
    prismaLanes.map((lane) => {
      manyLanes.push({
        ...initLane,
        id: lane.id,
        squad_id: lane.squad_id,        
        lane_number: lane.lane_number,
      })
    })
    return NextResponse.json({lanes: manyLanes}, { status: 201 });    
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409 
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;    
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating many lanes" },
      { status: errStatus }
    );        
  } 
}
