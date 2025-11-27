import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/elimEntries/div/:divId

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
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.elim_Entry.deleteMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: { div_id: divId },
            select: { id: true },
          }).then((elims) => elims.map((elim) => elim.id)),
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting elimEntries for div" },
      { status: errStatus }
    );
  }
}    