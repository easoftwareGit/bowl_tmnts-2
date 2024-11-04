import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { initBrkt } from "@/lib/db/initVals";

// routes /api/brkts/div/:divId

export async function GET(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const divId = params.divId;
    // check if id is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaBrkts = await prisma.brkt.findMany({
      where: {
        div_id: divId,
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
      { error: "error getting brkts for div" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { divId: string } }
) { 
  try {
    const id = params.divId;
    // check if id is a valid div id
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt.deleteMany({
      where: {
        div_id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brkts for div" },
      { status: 500 }
    );
  }
}

