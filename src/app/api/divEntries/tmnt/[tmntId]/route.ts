import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/divEntries/tmnt/:tmntId

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
        div_id: {
          in: await prisma.div.findMany({
            where: { tmnt_id: tmntId},
            select: { id: true },
          }).then((divs) => divs.map((div) => div.id))
        }
      }
    })

    return NextResponse.json({ divEntries }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error getting divEntries for tmnt");
  }
}
