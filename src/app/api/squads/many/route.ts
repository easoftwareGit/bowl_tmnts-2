import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { squadType, squadDataType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { validateSquads } from "../validate";
import { removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";
import { getErrorStatus } from "../../errCodes";

// routes /api/squads/many

export async function POST(request: NextRequest) { 

  try { 
    const squads: squadType[] = await request.json();
    const validSquads = await validateSquads(squads); // need to use await! or else returns a promise
    if (validSquads.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid squads into SquadData to post
    const squadsToPost: squadDataType[] = []
    validSquads.squads.forEach(squad => {
      const squadDate = startOfDayFromString(squad.squad_date_str) as Date
      squadsToPost.push({
        id: squad.id,
        event_id: squad.event_id,        
        squad_name: squad.squad_name,        
        games: squad.games,
        starting_lane: squad.starting_lane,
        lane_count: squad.lane_count,
        squad_date: squadDate,
        squad_time: squad.squad_time,
        sort_order: squad.sort_order,
      })
    });      

    const manySquads = await prisma.squad.createManyAndReturn({
      data: [...squadsToPost]
    })

    return NextResponse.json({squads: manySquads}, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many squads" },
      { status: errStatus }
    );        
  } 
}