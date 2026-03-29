import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
  } catch (error) {
    return standardCatchReturn(error, "error getting elimEntries for elim");
  }
}