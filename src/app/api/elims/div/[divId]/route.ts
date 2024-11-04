import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/elims/div/:divId

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
    const elims = await prisma.elim.findMany({
      where: {
        div_id: divId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });

    // no matching rows is ok
    return NextResponse.json({ elims }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting elims for div" },
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
    const deleted = await prisma.elim.deleteMany({
      where: {
        div_id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting elims for div" },
      { status: 500 }
    );
  }
}