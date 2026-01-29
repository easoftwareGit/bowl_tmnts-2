import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";

// routes /api/brktRefunds/squad/:squadId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const brktRefunds = await prisma.brkt_Refund.findMany({
      select: {
        brkt_entry_id: true,
        num_refunds: true,
      },
      where: {
        brkt_entry_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { squad_id: squadId },
                      select: { id: true },
                    })
                    .then((brkts) => brkts.map((brkt) => brkt.id)),
                },
              },
            })
            .then((brkts) => brkts.map((brkt) => brkt.id)),
        },
      },
    });

    if (!brktRefunds) {
      return NextResponse.json(
        { error: "error getting brktRefunds for squad" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktRefunds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error getting brktRefunds for squad" },
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
    const result = await prisma.brkt_Refund.deleteMany({
      where: {
        brkt_entry_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { squad_id: squadId },
                      select: { id: true },
                    })
                    .then((brkts) => brkts.map((brkt) => brkt.id)),
                },
              },
            })
            .then((brkts) => brkts.map((brkt) => brkt.id)),
        },
      },
    });
    return NextResponse.json({ deleted: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktRefunds for squad" },
      { status: 500 }
    );
  }
}
