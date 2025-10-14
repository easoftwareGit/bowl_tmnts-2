import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { divEntriesWithHdcp } from "../../calcHdcp";

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
    const divEntriesNoHdcp = await prisma.div_Entry.findMany({
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

    const divEntries = divEntriesWithHdcp(
      divEntriesNoHdcp.map(entry => ({
        ...entry,
        fee: entry.fee.toNumber()
      })
    ));    

    return NextResponse.json({divEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting divEntries for div" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;    
    // check if id is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.div_Entry.deleteMany({
      where: {
        div_id: divId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting divEntries for div" },
      { status: 500 }
    );
  }
}

