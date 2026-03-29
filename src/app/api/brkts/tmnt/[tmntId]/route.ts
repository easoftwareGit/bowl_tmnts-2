import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brkts/tmnt/:tmntId

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
    const brkts = await prisma.brkt.findMany({
      where: {
        squad: {
          event: {
            tmnt_id: tmntId,
          },
        },
      },
      orderBy: [
        { squad: { sort_order: "asc" } },
        { sort_order: "asc" },
      ],
    });

    return NextResponse.json({ brkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brkts for tmnt");
  }
}