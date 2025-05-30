import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktRefunds/brkt/:brktId

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
    const brktRefunds = await prisma.brkt_Refund.findMany({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_refunds: true,
        brkt: {
          select: {
            fee: true,
          },
        },
      },      
      where: {
        brkt_id: brktId
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
  { params }: { params: { brktId: string } }
) { 
  try {
    const brktId = params.brktId;
    // check if id is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Refund.deleteMany({
      where: {
        brkt_id: brktId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brktRefunds for brkt" },
      { status: 500 }
    );
  }
}
