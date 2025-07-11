import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { divEntriesWithHdcp } from "../../hdcpCalc";

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
        div_id: {
          in: await prisma.div.findMany({
            where: { tmnt_id: tmntId},
            select: { id: true },
          }).then((divs) => divs.map((div) => div.id))
        }
      }
    })

    const divEntries = divEntriesWithHdcp(
      divEntriesNoHdcp.map(entry => ({
        ...entry,
        fee: entry.fee.toNumber()
      })
    ));    

    return NextResponse.json({divEntries}, {status: 200});
  } catch (err: any) {
    return NextResponse.json({ err: "error getting divEntries for tmnt" },
      { status: 500 }
    );
  }
}

export async function DELETE(  
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.div_Entry.deleteMany({
      where: {
        div_id: {
          in: await prisma.div.findMany({
            where: { tmnt_id: tmntId},
            select: { id: true },
          }).then((divs) => divs.map((div) => div.id))
        }
      }
    })
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { err: "error deleting divEntries for tmnt" },
      { status: 500 }
    );
  }
}    