import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPlayer } from "@/lib/db/initVals";
import { playerType } from "@/lib/types/types";
import { sanitizePlayer, validatePlayer } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { getErrorStatus } from "../errCodes";
import { playerDataForPrisma } from "./dataForPrisma";

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
    return NextResponse.json(
      { error: "error getting players" },
      { status: 500 }
    );            
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

    const playerData = playerDataForPrisma(toPost);
    if (!playerData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const player = await prisma.player.create({
      data: playerData
    })
    return NextResponse.json({ player }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating player" },
      { status: errStatus }
    );            
  }
}