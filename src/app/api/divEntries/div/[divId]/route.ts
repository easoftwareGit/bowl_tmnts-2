import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/divEntry/div/:divId

export async function GET(
  request: Request,
  { params }: { params: { divId: string } }
) { 
  try {
    const divId = params.divId;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divEntries = await prisma.div_Entry.findMany({
      where: {
        div_id: divId
      },
    })
    return NextResponse.json({divEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting divEntries for div" },
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
    const deleted = await prisma.div_Entry.deleteMany({
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

