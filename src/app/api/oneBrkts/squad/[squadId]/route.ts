import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// route /api/oneBrkts/squad/:squadId
export async function GET(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const oneBrkts = await prisma.one_Brkt.findMany({
      select: {
        id: true,
        brkt_id: true,
        bindex: true,
      },      
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    })
    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error getting oneBrkts for squad" },
      { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.one_Brkt.deleteMany({
      where: {
        brkt_id: {
          in: await prisma.brkt.findMany({
            where: { squad_id: squadId },
            select: { id: true },
          }).then((brkts) => brkts.map((brkt) => brkt.id)),
        }
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting oneBrkts for squad" },
      { status: errStatus }
    );
  }
}    