import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGame, sanitizeGame } from "../../../lib/validation/games/validate";
import { ErrorCode } from "@/lib/validation/validation";
import { gameType } from "@/lib/types/types";
import { initGame } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";

// routes /api/games
export async function GET(request: NextRequest) {
  try {
    const games = await prisma.game.findMany({
      orderBy: [
        {
          squad_id: 'asc',
        }, 
        {
          player_id: 'asc',
        }, 
        {
          game_num: 'asc',
        }
      ]
    })
    return NextResponse.json({games}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting games" },
      { status: 400 }
    );            
  }
}

export async function POST(request: Request) { 
  try {
    const { id, squad_id, player_id, game_num, score } = await request.json()    
    const toCheck: gameType = {
      ...initGame,
      id,      
      squad_id,
      player_id,
      game_num,
      score
    }

    const toPost = sanitizeGame(toCheck);
    const errCode = validateGame(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.MISSING_DATA:
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

    let gameData: gameType = {
      id: toPost.id,      
      squad_id: toPost.squad_id,
      player_id: toPost.player_id,
      game_num: toPost.game_num,
      score: toPost.score
    }
    const game = await prisma.game.create({
      data: gameData
    })    
    return NextResponse.json({ game }, { status: 201 })        
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating game" },
      { status: errStatus }
    );            
  }
}