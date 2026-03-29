import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktEntries/div/:divId

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
    const brktEntries = await prisma.brkt_Entry.findMany({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_brackets: true,
        time_stamp: true,

        // parent fields
        brkt: {
          select: {
            fee: true,
          },
        },

        // optional 1:1 child; will be null if missing
        brkt_refunds: {
          select: {
            num_refunds: true,
          },
        },
      },
      where: {
        brkt: {
          div_id: divId,
        },
      },      
    })  
    
    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brktEntries for div");
  }
}