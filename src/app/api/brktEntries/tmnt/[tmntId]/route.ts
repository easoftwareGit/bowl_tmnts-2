import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktEntries/tmnt/:tmntId

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
    const brktEntries = await prisma.brkt_Entry.findMany({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_brackets: true,
        time_stamp: true,

        // parent Brkt fields you want
        brkt: {
          select: {
            fee: true,
          },
        },

        // optional child (1:1); will be null if missing
        brkt_refunds: {
          select: {
            num_refunds: true,
          },
        },        
      },      
      where: {
        brkt: {
          div: {
            tmnt_id: tmntId, // <-- tournament id (tmt_...)
          },
        },
      },
    })

    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brktEntries for tmnt");
  }
}