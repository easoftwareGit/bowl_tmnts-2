import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/moneys/tmnt/:tmntId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const {tmntId} = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const moneys = await prisma.money.findMany({
      where: {
        event: {
          tmnt_id: tmntId,
        },        
      },
      orderBy: [
        { event_id: "asc" },
        { squad_id: "asc" },
        { div_id: "asc" },
        { sort_order: "asc" },
      ],
    });

    return NextResponse.json({ moneys }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting moneys for tmnt");
  }
}