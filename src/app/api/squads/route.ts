import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeSquad, validateSquad } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { squadDataType, squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";
import { getErrorStatus } from "../errCodes";

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
    const { id, event_id, squad_name, games, starting_lane, lane_count, squad_date_str, squad_time, sort_order } = await request.json()    

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
    let squadData: squadDataType = {
      id: toPost.id,
      event_id: toPost.event_id,            
      squad_name: toPost.squad_name,      
      games: toPost.games,        
      lane_count: toPost.lane_count,      
      starting_lane: toPost.starting_lane,      
      squad_date: squadDate,
      squad_time: toPost.squad_time,      
      sort_order: toPost.sort_order
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