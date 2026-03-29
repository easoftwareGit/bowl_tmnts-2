import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktEntries/brkt/:brktId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ brktId: string }> }
) { 
  try {
    const { brktId } = await params;    
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
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
        brkt_id: brktId      
      },
    })

    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brktEntries for brkt");
  }
}