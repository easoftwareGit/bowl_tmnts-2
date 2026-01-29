import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/potEntries/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    // check if squadId is a valid tmnt id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potEntries = await prisma.pot_Entry.findMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: { squad_id: squadId},
            select: { id: true }
          }).then((pots) => pots.map((pot) => pot.id))
        }
      },
    })
    return NextResponse.json({ potEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting potEntries for squad" },
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
    // check if squadId is a valid tmnt id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.pot_Entry.deleteMany({
      where: {
        pot_id: {
          in: await prisma.pot.findMany({
            where: { squad_id: squadId},
            select: { id: true }
          }).then((pots) => pots.map((pot) => pot.id))
        }
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting potEntries for squad" },
      { status: errStatus }
    );
  }
}    