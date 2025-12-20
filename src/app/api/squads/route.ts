import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeSquad, validateSquad } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { startOfDayFromString } from "@/lib/dateTools";
import { getErrorStatus } from "../errCodes";
import { squadDataForPrisma } from "./dataForPrisma";

// routes /api/squads

export async function GET(request: NextRequest) {
  try {
    const squads = await prisma.squad.findMany({
      orderBy: [
        {
          event_id: 'asc',
        }, 
        {
          sort_order: 'asc',
        }, 
      ]
    })
    return NextResponse.json({ squads }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting squads" },
      { status: 500 }
    );        
  }
}

export async function POST(request: Request) {
  try {
    const { id, event_id, squad_name, games, starting_lane, lane_count, squad_date_str, squad_time, finalized, sort_order } = await request.json()    

    // const squadDateStr = removeTimeFromISODateStr(squad_date);
    
    const toCheck: squadType = {
      ...initSquad,
      id,
      event_id,
      squad_name,
      games,
      starting_lane,
      lane_count,
      squad_date_str,
      squad_time,
      finalized,
      sort_order
    }

    const toPost = sanitizeSquad(toCheck);    
    const errCode = validateSquad(toPost);
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
    
    const squadDate = startOfDayFromString(toPost.squad_date_str) as Date
    if (!squadDate) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 }
      );
    }
    const squadData = squadDataForPrisma(toPost);
    if (!squadData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const squad = await prisma.squad.create({
      data: squadData
    })
    return NextResponse.json({ squad }, { status: 201 })        
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating squad" },
      { status: errStatus }
    );        
  }
}