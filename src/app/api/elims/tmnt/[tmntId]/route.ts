import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/elims/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elims = await prisma.elim.findMany({
      where: {
        squad: {
          event: {
            tmnt_id: tmntId,
          },
        }
      },
      orderBy:{
        sort_order: 'asc',
      },
    });
    return NextResponse.json({elims}, {status: 200});
  } catch (error) {
    return standardCatchReturn(error, "error getting elims for tmnt");
  }
}