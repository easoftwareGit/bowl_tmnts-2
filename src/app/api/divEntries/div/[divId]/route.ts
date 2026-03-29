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
    const divEntries = await prisma.div_Entry.findMany({
      select: {
        id: true,
        squad_id: true,
        div_id: true,
        player_id: true,
        fee: true,
        player: {
          select: {
            average: true,
          },
        },
        div: {
          select: {
            hdcp_from: true,
            int_hdcp: true,
            hdcp_per: true,            
          },
        },        
      },
      where: {
        div_id: divId
      },
    })
    return NextResponse.json({ divEntries }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error getting divEntries for div");
  }
}