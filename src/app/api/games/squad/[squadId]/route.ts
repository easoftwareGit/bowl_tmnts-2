import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { validateGames } from "@/lib/validation/games/validate";
import { validGamesType } from "@/lib/types/types";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/games/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if id is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const games = await prisma.game.findMany({
      where: {
        squad_id: squadId
      },
      orderBy: [
        {
          player_id : "asc",
        },
        {
          game_num: "asc",
        },
      ],
    })

    // no matching rows is ok
    return NextResponse.json({ games }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting games for squad");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;

    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "invalid squad" }, { status: 404 });
    }

    const gamesJSON = await req.json();

    if (!Array.isArray(gamesJSON)) {
      return NextResponse.json(
        { error: "games must be an array" },
        { status: 400 }
      );
    }

    const validGames: validGamesType = validateGames(squadId, gamesJSON);
    if (validGames.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid games" }, { status: 404 });
    }
     
    const upsertedGames = await prisma.$transaction(
      validGames.games.map((game) =>
        prisma.game.upsert({
          where: {
            id: game.id,
          },
          update: {
            squad_id: squadId,
            player_id: game.player_id,
            game_num: game.game_num,
            score: game.score,
          },
          create: {
            squad_id: squadId,
            player_id: game.player_id,
            game_num: game.game_num,
            score: game.score,
          },
        })
      )
    );

    return NextResponse.json(
      { games: upsertedGames },
      { status: 200 }
    );
  } catch (error) {
    return standardCatchReturn(error, "error upserting games for squad");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.game.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting games for squad");
  }
}

