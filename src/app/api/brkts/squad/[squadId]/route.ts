import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { initBrkt } from "@/lib/db/initVals";

// routes /api/brkts/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if id is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaBrkts = await prisma.brkt.findMany({
      where: {
        squad_id: squadId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });
    // add in fsa
    const brkts = prismaBrkts.map((brkt) => ({
      ...initBrkt,
      id: brkt.id,
      div_id: brkt.div_id,
      squad_id: brkt.squad_id,
      start: brkt.start,
      games: brkt.games,
      players: brkt.players,
      fee: brkt.fee + "",
      first: brkt.first + "",
      second: brkt.second + "",
      admin: brkt.admin + "",
      fsa: Number(brkt.first) + Number(brkt.second) + Number(brkt.admin) + "",
    }));

    // no matching rows is ok
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brkts for squad" },
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
    const deleted = await prisma.brkt.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brkts for squad" },
      { status: 500 }   
    );
  }
}