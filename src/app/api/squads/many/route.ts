import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { squadType, squadDataType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { validateSquads } from "../validate";
import { removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";

// routes /api/squads/many

export async function POST(request: NextRequest) { 

  try { 
    const squads: squadType[] = await request.json();
    squads.forEach(squad => {
      // json converted date to string, need to convert back to date
      // cannot assume squad.squad_date_str is set 
      const squadDateStr = squad.squad_date as unknown as string
      const noTimeDateStr = removeTimeFromISODateStr(squadDateStr)
      squad.squad_date = startOfDayFromString(noTimeDateStr) as Date
    });
    // sanitize and validate squads
    const validSquads = await validateSquads(squads); // need to use await! or else returns a promise
    if (validSquads.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid squads into SquadData to post
    const squadsToPost: squadDataType[] = []
    validSquads.squads.forEach(squad => {
      squadsToPost.push({
        id: squad.id,
        event_id: squad.event_id,        
        squad_name: squad.squad_name,        
        games: squad.games,
        starting_lane: squad.starting_lane,
        lane_count: squad.lane_count,
        squad_date: squad.squad_date,
        squad_time: squad.squad_time,
        sort_order: squad.sort_order,
      })
    });      

    const prismaSquads = await prisma.squad.createManyAndReturn({
      data: [...squadsToPost]
    })
    // convert prismaSquad to squads
    const manySquads: squadType[] = [];
    prismaSquads.map((squad) => {
      manySquads.push({
        ...initSquad,
        id: squad.id,
        event_id: squad.event_id,        
        squad_name: squad.squad_name,
        games: squad.games,
        lane_count: squad.lane_count,
        starting_lane: squad.starting_lane,
        squad_date: squad.squad_date,        
        squad_time: squad.squad_time,
        sort_order: squad.sort_order,
      })
    })
    return NextResponse.json({squads: manySquads}, { status: 201 });
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
      { error: "error creating many squads" },
      { status: errStatus }
    );        
  } 
}