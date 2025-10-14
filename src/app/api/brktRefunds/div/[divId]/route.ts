import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktRefunds/div/:divId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;    
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
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
                      where: { div_id: divId },
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
        { error: "error getting brktRefunds for div" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktRefunds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error getting brktRefunds for div" },
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
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Refund.deleteMany({
      where: {
        brkt_entry_id: {
          in: await prisma.one_Brkt
            .findMany({
              where: {
                brkt_id: {
                  in: await prisma.brkt
                    .findMany({
                      where: { div_id: divId },
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

    if (!deleted) {
      return NextResponse.json(
        { error: "error deleting brktRefunds for div" },
        { status: 404 }
      );
    }

    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting brktRefunds for div" },
      { status: 500 }
    );
  }
}
