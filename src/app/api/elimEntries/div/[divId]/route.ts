import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/elimEntries/div/:divId

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
    const elimEntries = await prisma.elim_Entry.findMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((elims) => elims.map((elim) => elim.id)),
        }
      },
    })
    return NextResponse.json({ elimEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting elimEntries for div" },
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
    const deleted = await prisma.elim_Entry.deleteMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((elims) => elims.map((elim) => elim.id)),
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
      { error: "Error deleting elimEntries for div" },
      { status: errStatus }
    );
  }
}    