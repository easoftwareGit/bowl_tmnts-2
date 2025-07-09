import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { divEntriesWithHdcp } from "../../hdcpCalc";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/divEntries/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if squadId is a valid tmnt id
    if (!isValidBtDbId(squadId, "sqd")) {
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
        squad_id: squadId
      },
    })
    const divEntries = divEntriesWithHdcp(
      divEntriesNoHdcp.map(entry => ({
        ...entry,
        fee: entry.fee.toNumber()
      })
    ));        
    return NextResponse.json({ divEntries }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting divEntries for squad" },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if squadId is a valid tmnt id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.div_Entry.deleteMany({
      where: {
        squad_id: squadId
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting divEntries for squad" },
      { status: errStatus }
    );
  }
}    