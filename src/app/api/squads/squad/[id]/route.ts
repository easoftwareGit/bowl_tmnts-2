import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { sanitizeSquad, validateSquad } from "@/app/api/squads/validate";
import { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { dateTo_UTC_yyyyMMdd, startOfDayFromString } from "@/lib/dateTools";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/squads/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const squad = await prisma.squad.findUnique({
      where: {
        id: id,
      },
    });
    if (!squad) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ squad }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting squad" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const {
      event_id,
      squad_name,
      games,
      starting_lane,
      lane_count,
      squad_date_str,
      squad_time,
      sort_order,
    } = await request.json();    

    const toCheck: squadType = {
      ...initSquad,
      event_id,
      squad_name,
      games,
      starting_lane,
      lane_count,
      squad_date_str,
      squad_time,
      sort_order,
    };

    const toPut = sanitizeSquad(toCheck);
    const errCode = validateSquad(toPut);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    
    const squadDate = startOfDayFromString(toPut.squad_date_str) as Date
    if (!squadDate) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const squad = await prisma.squad.update({
      where: {
        id: id,
      },
      data: {
        // event_id: toPut.event_id, // do not update event_id
        squad_name: toPut.squad_name,
        games: toPut.games,
        starting_lane: toPut.starting_lane,
        lane_count: toPut.lane_count,
        squad_date: squadDate,
        squad_time: toPut.squad_time,
        sort_order: toPut.sort_order,
      },
    });
    return NextResponse.json({ squad }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating squad" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentSquad = await prisma.squad.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentSquad) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: squadType = {
      ...initSquad,
      event_id: currentSquad.event_id,
      squad_name: currentSquad.squad_name,
      games: currentSquad.games,
      starting_lane: currentSquad.starting_lane,
      lane_count: currentSquad.lane_count,
      squad_date_str: dateTo_UTC_yyyyMMdd(currentSquad.squad_date),
      squad_time: currentSquad.squad_time!,
      sort_order: currentSquad.sort_order,
    };

    if (jsonProps.includes("event_id")) {
      toCheck.event_id = json.event_id;
    }
    if (jsonProps.includes("squad_name")) {
      toCheck.squad_name = json.squad_name;
    }
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
    }
    if (jsonProps.includes("starting_lane")) {
      toCheck.starting_lane = json.starting_lane;
    }
    if (jsonProps.includes("lane_count")) {
      toCheck.lane_count = json.lane_count;
    }
    if (jsonProps.includes("squad_date_str")) {      
      toCheck.squad_date_str = json.squad_date_str;
    }
    if (jsonProps.includes("squad_time")) {
      toCheck.squad_time = json.squad_time;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
    }

    const toBePatched = sanitizeSquad(toCheck);
    const errCode = validateSquad(toBePatched);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    
    let gotEmptySquadDate = undefined;
    let gotEmptySquadTime = undefined;
    const toPatch = {      
      event_id: "", 
      squad_name: "",
      games: null as number | null,
      starting_lane: null as number | null,
      lane_count: null as number | null,
      squad_date: null as Date | null,
      squad_time: null as string | null,
      sort_order: null as number | null
    };
    if (jsonProps.includes("event_id")) {
      toPatch.event_id = toBePatched.event_id;
    }
    if (jsonProps.includes("squad_name")) {
      toPatch.squad_name = toBePatched.squad_name;
    }
    if (jsonProps.includes("games")) {
      toPatch.games = toBePatched.games;
    }
    if (jsonProps.includes("starting_lane")) {
      toPatch.starting_lane = toBePatched.starting_lane;
    }
    if (jsonProps.includes("lane_count")) {
      toPatch.lane_count = toBePatched.lane_count;
    }
    if (jsonProps.includes("squad_date_str")) {
      toPatch.squad_date = startOfDayFromString(toBePatched.squad_date_str);
      gotEmptySquadDate = '';
    }
    if (jsonProps.includes("squad_time")) {
      toPatch.squad_time = toBePatched.squad_time;
      gotEmptySquadTime = toBePatched.squad_time;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    }
    const squad = await prisma.squad.update({
      where: {
        id: id,
      },
      data: {
        // event_id: toPatch.event_id || undefined, // do not patch event_id
        squad_name: toPatch.squad_name || undefined,
        games: toPatch.games || undefined,
        starting_lane: toPatch.starting_lane || undefined,
        lane_count: toPatch.lane_count || undefined,
        squad_date: toPatch.squad_date || gotEmptySquadDate,
        squad_time: toPatch.squad_time || gotEmptySquadTime,
        sort_order: toPatch.sort_order || undefined,
      },
    });

    return NextResponse.json({ squad }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching squad" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.squad.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting squad" },
      { status: errStatus }
    );
  }
}
