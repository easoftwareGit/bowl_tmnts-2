import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/elimEntry/elim/:elimId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ elimId: string }> }
) {
  try {
    const { elimId } = await params;
    // check if elimId is a valid elim id
    if (!isValidBtDbId(elimId, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimEntries = await prisma.elim_Entry.findMany({
      where: {
        elim_id: elimId
      },
    })
    return NextResponse.json({elimEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting elimEntries for elim" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ elimId: string }> }
) {
  try {
    const { elimId } = await params;
    // check if id is a valid elim id
    if (!isValidBtDbId(elimId, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.elim_Entry.deleteMany({
      where: {
        elim_id: elimId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting elimEntries for elim" },
      { status: 500 }
    );
  }
}

