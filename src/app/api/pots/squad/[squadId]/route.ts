import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/pots/squad/:squadId

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
    const pots = await prisma.pot.findMany({
      where: {
        squad_id: id,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });
    // no matching rows is ok
    return NextResponse.json({ pots }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting pots for squad" },
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
    const deleted = await prisma.pot.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting pots for squad" },
      { status: 500 }   
    );
  }
}
