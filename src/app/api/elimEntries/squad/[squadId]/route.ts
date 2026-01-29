import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/elimEntries/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimEntries = await prisma.elim_Entry.findMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((elims) => elims.map((elim) => elim.id)),
        }
      },
    })
    return NextResponse.json({ elimEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting elimEntries for squad" },
      { status: 400 }
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
    const result = await prisma.elim_Entry.deleteMany({
      where: {
        elim_id: {
          in: await prisma.elim.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((elims) => elims.map((elim) => elim.id)),
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting elimEntries for squad" },
      { status: errStatus }
    );
  }
}    