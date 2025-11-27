import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { count } from "console";

// routes /api/elims/squad/:squadId

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
    const elims = await prisma.elim.findMany({
      where: {
        squad_id: squadId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });

    // no matching rows is ok
    return NextResponse.json({ elims }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting elims for squad" },
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
    const result = await prisma.elim.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting elims for squad" },
      { status: 500 }   
    );
  }
}