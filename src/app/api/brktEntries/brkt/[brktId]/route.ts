import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktEntry/brkt/:brktId

export async function GET(
  request: Request,
  { params }: { params: { brktId: string } }
) { 
  try {
    const brktId = params.brktId;
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktEntries = await prisma.brkt_Entry.findMany({
      where: {
        brkt_id: brktId
      },
    })
    return NextResponse.json({brktEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brktEntries for brkt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { brktId: string } }
) { 
  try {
    const brktId = params.brktId;
    // check if id is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Entry.deleteMany({
      where: {
        brkt_id: brktId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brktEntries for brkt" },
      { status: 500 }
    );
  }
}

