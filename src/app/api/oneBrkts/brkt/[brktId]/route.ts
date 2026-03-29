import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
  } catch (error) {
    return standardCatchReturn(error, "error getting oneBrkts for brkt");
  }
}
