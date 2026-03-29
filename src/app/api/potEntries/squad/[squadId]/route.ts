import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
        pot: {
          squad: {
            id: squadId,
          },
        }
      },
    })
    return NextResponse.json({ potEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting potEntries for squad");
  }
}
