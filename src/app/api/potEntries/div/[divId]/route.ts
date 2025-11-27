import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/divEntry/div/:divId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potEntries = await prisma.pot_Entry.findMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: { div_id: divId },
            select: { id: true }
          }).then(pots => pots.map(pot => pot.id))  
        }
      },
    })
    return NextResponse.json({potEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting potEntries for div" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;
    // check if id is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.pot_Entry.deleteMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: { div_id: divId },
            select: { id: true }
          }).then(pots => pots.map(pot => pot.id))
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting potEntries for div" },
      { status: 500 }
    );
  }
}

