import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/oneBrkts/brkt/:brktId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) {
  try {
    const {brktId} = await params;
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const oneBrkts = await prisma.one_Brkt.findMany({
      where: { brkt_id: brktId },
      orderBy: { bindex: "asc" },
    });

    if (!oneBrkts) {
      return NextResponse.json({ error: "error getting oneBrkts for brkt" }, { status: 404 });
    }

    return NextResponse.json({ oneBrkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ err: "error getting oneBrkts for brkt" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) {
  try {
    const {brktId} = await params;
    // check if id is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.one_Brkt.deleteMany({
      where: {
        brkt_id: brktId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting oneBrkts for brkt" },
      { status: 500 }
    );
  }
}

