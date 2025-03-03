import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getSquadGamesSql } from "../../getSql";

// routes /api/games/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const id = params.squadId;
    // check if id is a valid squad id
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const games = await prisma.game.findMany({
      where: {
        squad_id: id
      }   
    })

    // const squads = await prisma.squad.findUnique({  
    //   select: {
    //     games: true
    //   },
    //   where: {
    //     id: id
    //   }
    // })
    // if (!squads || !squads.games) {
    //   return NextResponse.json({ games: [] }, { status: 200 });
    // }

    // const squadGamesSql = getSquadGamesSql(id, squads.games);
    // // ok to use queryRaw because call to sanitizing in getSquadGamesSql
    // const games = await prisma.$queryRawUnsafe(squadGamesSql);
    // console.log(games);

    // no matching rows is ok
    return NextResponse.json({ games }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting games for squad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.game.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting games for squad" },
      { status: 500 }   
    );
  }
}
