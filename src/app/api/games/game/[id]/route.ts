import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateGame, sanitizeGame } from "../../validate";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { gameType } from "@/lib/types/types";
import { initGame } from "@/lib/db/initVals";

// routes /api/games/game/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
  } catch (err: any) {
    return NextResponse.json({ error: "error getting game" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 404;
        break;
      case "P2003": // foreign key constraint
        errStatus = 404;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error updating game" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentGame = await prisma.game.findUnique({
      where: {
        id: id,
      },
    });    

    if (!currentGame) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const toCheck: gameType = {
      ...initGame,      
      squad_id: currentGame.squad_id,
      player_id: currentGame.player_id,
      game_num: currentGame.game_num,
      score: currentGame.score,
    };

    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }
    if (jsonProps.includes("player_id")) {
      toCheck.player_id = json.player_id;
    }
    if (jsonProps.includes("game_num")) {
      toCheck.game_num = json.game_num;
    }
    if (jsonProps.includes("score")) {
      toCheck.score = json.score;
    }

    const toBePatched = sanitizeGame(toCheck);
    const errCode = validateGame(toBePatched);
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
    
    const toPatch = {            
      squad_id: "",
      player_id: "",      
      game_num: null as number | null,
      score: null as number | null,
    };

    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
    if (jsonProps.includes("player_id")) {
      toPatch.player_id = toBePatched.player_id;
    }
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
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 404;
        break;
      case "P2003": // foreign key constraint
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error patching game" },
      { status: errStatus }
    );    
  }
}


export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "gam")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const deleted = await prisma.game.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2003": // parent has child rows
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error deleting game" },
      { status: errStatus }
    );    
  }
}