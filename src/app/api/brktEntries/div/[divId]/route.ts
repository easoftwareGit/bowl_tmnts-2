import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/brktEntries/div/:divId

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
    const brktEntries = await prisma.brkt_Entry.findMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    })
    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brktEntries for div" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const divId = params.divId;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt_Entry.deleteMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003": // parent has child rows
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error deleting brktEntries for div" },
      { status: errStatus }
    );
  }
}    