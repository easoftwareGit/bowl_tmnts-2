import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation/validation";
import { playerType, playerDataType } from "@/lib/types/types";
import { validatePlayers } from "../../../../lib/validation/players/validate";
import { getErrorStatus } from "../../errCodes";
import { playerDataForPrisma } from "../dataForPrisma";

// routes /api/players/many

export async function POST(request: NextRequest) {

  try {
    const players: playerType[] = await request.json();
    if (Array.isArray(players) && players.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate players
    const validPlayers = await validatePlayers(players); // need to use await! or else returns a promise
    if (validPlayers.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid players into playerData to post
    const playersToPost: playerDataType[] = validPlayers.players
      .map(player => playerDataForPrisma(player))
      .filter((data): data is playerDataType => data !== null);

    const result = await prisma.player.createMany({
      data: playersToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many players" },
      { status: errStatus }
    );
  }
}