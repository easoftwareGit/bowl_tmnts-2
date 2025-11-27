import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getSquadGamesSql } from "../../getSql";

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
      }   
    })

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
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting games for squad" },
      { status: 500 }   
    );
  }
}
