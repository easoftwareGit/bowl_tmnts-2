import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/divEntry/div/:divId

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
    const potEntries = await prisma.pot_Entry.findMany({
      where: {
        pot: {
          div_id: divId
        }
      },
    })
    return NextResponse.json({potEntries}, {status: 200});
  } catch (error) {
    return standardCatchReturn(error, "error getting potEntries for div");
  }
}
