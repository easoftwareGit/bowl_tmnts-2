import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/oneBrkts/div/:divId

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
    const oneBrkts = await prisma.one_Brkt.findMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
      orderBy: [
        {
          brkt_id: "asc",
        },
        {
          bindex: "asc",
        },
      ],
    });
    if (!oneBrkts) {
      return NextResponse.json({ error: "error getting oneBrkts for div" }, { status: 404 });
    }
    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ err: "error getting oneBrkts for div" }, { status: 500 });
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
    const result = await prisma.one_Brkt.deleteMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting oneBrkts for div" },
      { status: errStatus }
    );
  }
}    