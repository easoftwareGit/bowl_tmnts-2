import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";

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
        elim: {
          squad_id: squadId
        }
      },
    })
    return NextResponse.json({ elimEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimEntries for squad");
  }
}