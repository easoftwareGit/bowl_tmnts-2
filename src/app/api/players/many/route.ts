import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { playerType, playerDataType } from "@/lib/types/types";
import { validatePlayers } from "../validate";

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