import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { playerType, playerDataType, tmntEntryPlayerType } from "@/lib/types/types";
import { validatePlayers } from "../validate";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "./getSql";
import { initPlayer } from "@/lib/db/initVals";

// routes /api/players/many

export async function POST(request: NextRequest) {

  try {
    const players: playerType[] = await request.json();
    // sanitize and validate players
    const validPlayers = await validatePlayers(players); // need to use await! or else returns a promise
    if (validPlayers.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid players into playerData to post
    const playersToPost: playerDataType[] = []
    validPlayers.players.forEach(player => {
      playersToPost.push({
        id: player.id,
        squad_id: player.squad_id,
        first_name: player.first_name,
        last_name: player.last_name,
        average: player.average,
        lane: player.lane,
        position: player.position,        
      })
    });

    const manyPlayers = await prisma.player.createManyAndReturn({
      data: playersToPost
    })
    return NextResponse.json({players: manyPlayers}, { status: 201 }); 
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating many players" },
      { status: errStatus }
    );
  }
}

export async function PUT(request: NextRequest) {  

  try {
    const tePlayers: tmntEntryPlayerType[] = await request.json();
    const teToValidate: playerType[] = tePlayers.map((player) => {
      return {
        ...initPlayer,
        id: player.id ?? "",
        squad_id: player.squad_id,
        first_name: player.first_name,
        last_name: player.last_name,
        average: player.average,
        lane: player.lane,
        position: player.position,        
      }
    })
    // sanitize and validate players
    // const validPlayers = await validatePlayers(tePlayers as playerType[]); // need to use await! or else returns a promise
    const validPlayers = await validatePlayers(teToValidate); // need to use await! or else returns a promise    
    if (validPlayers.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const validTePlayers: tmntEntryPlayerType[] = [];
    validPlayers.players.forEach((player) => {
      const foundPlayer = tePlayers.find((p) => p.id === player.id);
      if (foundPlayer) {
        const vtePlayer = {
          ...player,
          eType: foundPlayer.eType,
        }
        validTePlayers.push(vtePlayer);
      }
    })

    if (validTePlayers.length === 0) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const playersToUpdate = validTePlayers.filter((player) => player.eType === "u");    
    const updateManySQL = (playersToUpdate.length > 0)
      ? getUpdateManySQL(playersToUpdate)
      : "";

    const playersToInsert = validTePlayers.filter((player) => player.eType === "i");
    const insertManySQL = (playersToInsert.length > 0)
      ? getInsertManySQL(playersToInsert)
      : "";
    
    const playersToDelete = validTePlayers.filter((player) => player.eType === "d");
    const deleteManySQL = (playersToDelete.length > 0)
      ? getDeleteManySQL(playersToDelete)
      : "";

    const [updates, inserts, deletes] = await prisma.$transaction([
      prisma.$executeRawUnsafe(updateManySQL),
      prisma.$executeRawUnsafe(insertManySQL),
      prisma.$executeRawUnsafe(deleteManySQL),      
    ])
    
    const updateInfo = { updates: updates, inserts: inserts, deletes: deletes };    
    return NextResponse.json({updateInfo}, { status: 200 });
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error updating many players" },
      { status: errStatus }
    );
  }
}
