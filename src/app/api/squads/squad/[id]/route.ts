import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeSquad, validateSquad } from "@/lib/validation/squads/validate";
import type { squadType } from "@/lib/types/types";
import { initSquad } from "@/lib/db/initVals";
import { startOfDayFromString, todayStr } from "@/lib/dateTools";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/squads/squad/:id

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
  } catch (error) {
    return standardCatchReturn(error, "error getting squad");    
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
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
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
  } catch (error) {
    return standardCatchReturn(error, "error updating squad");
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

    // fake data that will pass sanitation and validation
    const fakeSquad = {
      ...initSquad,
      id,
      event_id: "evt_00000000000000000000000000000000",
      squad_name: "Fake Squad",
      games: 1,
      starting_lane: 1,
      lane_count: 2,
      squad_date_str: todayStr,
      squad_time: "10:00",
      sort_order: 1,
    }

    // populate toCheck with fake data 
    const toCheck: squadType = {
      ...initSquad,
      event_id: fakeSquad.event_id,
      squad_name: fakeSquad.squad_name,
      games: fakeSquad.games,
      starting_lane: fakeSquad.starting_lane,
      lane_count: fakeSquad.lane_count,
      squad_date_str: fakeSquad.squad_date_str,
      squad_time: fakeSquad.squad_time,
      sort_order: fakeSquad.sort_order,
    };

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);    
    let gotDataToPatch = false;
    // if (jsonProps.includes("event_id")) {
    //   toCheck.event_id = json.event_id;
    //   gotDataToPatch = true;
    // }
    if (jsonProps.includes("squad_name")) {
      toCheck.squad_name = json.squad_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("starting_lane")) {
      toCheck.starting_lane = json.starting_lane;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("lane_count")) {
      toCheck.lane_count = json.lane_count;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("squad_date_str")) {
      toCheck.squad_date_str = json.squad_date_str;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("squad_time")) {
      toCheck.squad_time = json.squad_time;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toPut = sanitizeSquad(toCheck);
    const errCode = validateSquad(toPut);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
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
  } catch (error) {
    return standardCatchReturn(error, "error patching squad");
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
  } catch (error) {
    return standardCatchReturn(error, "error deleting squad");
  }
}
