import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktRefunds/brkt/:brktId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) { 
  try {
    const { brktId } = await params;    
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktRefunds = await prisma.brkt_Refund.findMany({
      select: {
        brkt_entry_id: true,
        num_refunds: true,
      },      
      where: {
        brkt_entry_id: {
          in: await prisma.brkt_Entry.findMany({
            where: { brkt_id: brktId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id))
        }
      },
    })

    return NextResponse.json({brktRefunds}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting brktRefunds for brkt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,  
  { params }: { params: Promise<{ brktId: string }> }
) {
  try {
    const {brktId} = await params;
    // check if id is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt_Refund.deleteMany({
      where: {
        brkt_entry_id: {
          in: await prisma.one_Brkt.findMany({
            where: { brkt_id: brktId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    });
    return NextResponse.json({ deleted: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brktRefunds for brkt" },
      { status: 500 }
    );
  }
}
