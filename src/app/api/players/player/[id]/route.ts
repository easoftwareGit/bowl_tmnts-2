import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { blankPlayer, initPlayer } from "@/lib/db/initVals";
import type { playerType } from "@/lib/types/types";
import { sanitizePlayer, validatePlayer, validPlayerId } from "../../../../../lib/validation/players/validate";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/players/player/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!validPlayerId(id)) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const player = await prisma.player.findUnique({
      where: {
        id: id,
      },
    })
    if (!player) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting player");
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    // do not use validPlayerId() here, cannot PUT Bye player
    if (!isValidBtDbId(id, "ply")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { squad_id, first_name, last_name,
      average, lane, position } = await request.json()    
    const toCheck: playerType = {
      ...initPlayer,
      squad_id,
      first_name,
      last_name,
      average,
      lane,
      position,
    };

    const toPut = sanitizePlayer(toCheck);
    const errCode = validatePlayer(toPut);
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
    const player = await prisma.player.update({
      where: {
        id: id,
      },
      data: {
        // squad_id: toPut.squad_id, do not put squad_id
        first_name: toPut.first_name,
        last_name: toPut.last_name,
        average: toPut.average,
        lane: toPut.lane,
        position: toPut.position,
      },
    });

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error putting player");
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    // do not use validPlayerId() here, cannot PATCH Bye player
    if (!isValidBtDbId(id, "ply")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  

    // fake data that will pass sanitation and validation
    const fakePlayer = {
      ...initPlayer,
      id,
      squad_id: "sqd_00000000000000000000000000000000",
      first_name: "Fake",
      last_name: "Name",
      average: 1,
      lane: 1,
      position: 'A',
    }
    // populate toCheck with fake data 
    const toCheck: playerType = {
      ...initPlayer, 
      id, 
      squad_id: fakePlayer.squad_id, 
      first_name: fakePlayer.first_name, 
      last_name: fakePlayer.last_name, 
      average: fakePlayer.average, 
      lane: fakePlayer.lane, 
      position: fakePlayer.position, 
    };
    // const toCheck: playerType = {
    //   ...initPlayer,
    //   squad_id: currentPlayer.squad_id,
    //   first_name: currentPlayer.first_name,
    //   average: currentPlayer.average,
    // };
    // if (currentPlayer.last_name) toCheck.last_name = currentPlayer.last_name;
    // if (currentPlayer.lane) toCheck.lane = currentPlayer.lane;
    // if (currentPlayer.position) toCheck.position = currentPlayer.position;

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    if (jsonProps.includes("first_name")) {
      toCheck.first_name = json.first_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("last_name")) {
      toCheck.last_name = json.last_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("average")) {
      toCheck.average = json.average;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("lane")) {
      toCheck.lane = json.lane;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("position")) {
      toCheck.position = json.position;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizePlayer(toCheck);
    const errCode = validatePlayer(toBePatched);
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

    const toPatch = {
      ...blankPlayer,
      squad_id: '',
    }
    if (jsonProps.includes("first_name")) {
      toPatch.first_name = toBePatched.first_name;
    }
    if (jsonProps.includes("last_name")) {    
      toPatch.last_name = toBePatched.last_name;  
    }
    if (jsonProps.includes("average")) {
      toPatch.average = toBePatched.average;
    } else {
      toPatch.average = undefined as any;
    }
    if (jsonProps.includes("lane")) {
      toPatch.lane = toBePatched.lane;
    } else {
      toPatch.lane = undefined as any;
    }
    if (jsonProps.includes("position")) {
      toPatch.position = toBePatched.position;
    }
    
    const player = await prisma.player.update({
      where: {
        id: id,
      },
      data: {
        // do not patch squad id
        first_name: toPatch.first_name || undefined,
        last_name: toPatch.last_name || undefined,
        average: toPatch.average || undefined,
        lane: toPatch.lane || undefined,
        position: toPatch.position || undefined,
      },
    });

    return NextResponse.json({ player }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching player");
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!validPlayerId(id)) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const result = await prisma.player.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting player");
  }
}    