import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGame, sanitizeGame } from "../../../../../lib/validation/games/validate";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { gameType } from "@/lib/types/types";
import { blankGame, initGame } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/games/game/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const game = await prisma.game.findUnique({
      where: {
        id: id,
      },
    });
    if (!game) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting game");
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const { squad_id, player_id, game_num, score } =
      await request.json();
    const toCheck: gameType = {
      ...initGame,
      id,      
      squad_id,
      player_id,
      game_num,
      score,
    };

    const toPut = sanitizeGame(toCheck);
    const errCode = validateGame(toPut);
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
    
    // NO hdcp_per_str in data object
    const game = await prisma.game.update({
      where: {
        id: id,
      },
      data: {        
        squad_id: toPut.squad_id, 
        player_id: toPut.player_id,
        game_num: toPut.game_num,        
        score: toPut.score,
      },
    });
    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating game");
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeGame = {
      ...initGame,
      id,
      squad_id: "sqd_00000000000000000000000000000000",
      player_id: "ply_00000000000000000000000000000000",
      game_num: 1,
      score: 1,
    }
    
    // populate toCheck with fake data 
    const toCheck: gameType = {
      ...initGame, 
      id, 
      squad_id: fakeGame.squad_id,
      player_id: fakeGame.player_id,
      game_num: fakeGame.game_num,
      score: fakeGame.score,
    };

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    // if (jsonProps.includes("squad_id")) {
    //   toCheck.squad_id = json.squad_id;
    //   gotDataToPatch = true;
    // }
    // if (jsonProps.includes("player_id")) {
    //   toCheck.player_id = json.player_id;
    //   gotDataToPatch = true;
    // }
    if (jsonProps.includes("game_num")) {
      toCheck.game_num = json.game_num;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("score")) {
      toCheck.score = json.score;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizeGame(toCheck);
    const errCode = validateGame(toBePatched);
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
      ...blankGame,
      game_num: null as number | null,
      score: null as number | null,
    };

    // if (jsonProps.includes("squad_id")) {
    //   toPatch.squad_id = toBePatched.squad_id;
    // }
    // if (jsonProps.includes("player_id")) {
    //   toPatch.player_id = toBePatched.player_id;
    // }
    if (jsonProps.includes("game_num")) {
      toPatch.game_num = toBePatched.game_num;
    }
    if (jsonProps.includes("score")) {
      toPatch.score = toBePatched.score;
    }

    const game = await prisma.game.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {        
        // squad_id: toPatch.squad_id || undefined, // do not patch squad_id        
        // player_id: toPatch.player_id || undefined, // do not patch player_id
        game_num: toPatch.game_num || undefined,
        score: toPatch.score || undefined,
      },
    });
    return NextResponse.json({ game }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching game");
  }
}


export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.game.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting game");
  }
}