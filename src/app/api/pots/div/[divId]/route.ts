import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/pots/div/:divId

export async function GET(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const id = params.divId;
    // check if id is a valid div id
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const pots = await prisma.pot.findMany({
      where: {
        div_id: id,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });
    // no matching rows is ok
    return NextResponse.json({ pots }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting pots for div" },
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
    const deleted = await prisma.pot.deleteMany({
      where: {
        div_id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting pots for div" },
      { status: 500 }
    );
  }
}

