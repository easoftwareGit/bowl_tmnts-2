import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPlayer } from "@/lib/db/initVals";
import type { playerType } from "@/lib/types/types";
import { sanitizePlayer, validatePlayer } from "../../../lib/validation/players/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";
import { playerDataForPrisma } from "./playerDataForPrisma";

// routes /api/players

export async function GET(request: NextRequest) {
  try {
    const players = await prisma.player.findMany({
      orderBy: [
        {
          squad_id: 'asc',
        }, 
        {
          lane: 'asc',
        }, 
        {
          position: 'asc',
        },
      ]
    })   
    return NextResponse.json({ players }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting players");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, squad_id, first_name, last_name,
      average, lane, position } = await request.json()
    const toCheck: playerType = {
      ...initPlayer,
      id,
      squad_id,
      first_name,
      last_name,
      average,
      lane,
      position,
    }

    const toPost = sanitizePlayer(toCheck);
    const errCode = validatePlayer(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
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

    const playerData = playerDataForPrisma(toPost);
    if (!playerData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const player = await prisma.player.create({
      data: playerData
    })
    return NextResponse.json({ player }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating player");
  }
}