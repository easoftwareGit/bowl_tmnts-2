import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initPlayer } from "@/lib/db/initVals";
import { playerType } from "@/lib/types/types";
import { sanitizePlayer, validatePlayer, validPlayerId } from "../../validate";
import { getErrorStatus } from "@/app/api/errCodes";

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
    // if (!isValidBtDbId(id, "ply")) {
    //   return NextResponse.json({ error: "not found" }, { status: 404 });
    // }
    const player = await prisma.player.findUnique({
      where: {
        id: id,
      },
    })
    if (!player) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ player }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting player" }, { status: 500 });
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error putting player" },
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
    // do not use validPlayerId() here, cannot PATCH Bye player
    if (!isValidBtDbId(id, "ply")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentPlayer = await prisma.player.findUnique({
      where: { id: id },
    });
    if (!currentPlayer) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: playerType = {
      ...initPlayer,
      squad_id: currentPlayer.squad_id,
      first_name: currentPlayer.first_name,
      average: currentPlayer.average,
    };
    if (currentPlayer.last_name) toCheck.last_name = currentPlayer.last_name;
    if (currentPlayer.lane) toCheck.lane = currentPlayer.lane;
    if (currentPlayer.position) toCheck.position = currentPlayer.position;
    
    let gotDataToPatch = false;
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
      gotDataToPatch = true;
    }
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
      return NextResponse.json({ player: currentPlayer }, { status: 200 });
    }
    const toBePatched = sanitizePlayer(toCheck);
    const errCode = validatePlayer(toBePatched);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...initPlayer,
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error patching player" },
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
    if (!validPlayerId(id)) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const deleted = await prisma.player.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting player" },
      { status: errStatus }
    );
  }
}    