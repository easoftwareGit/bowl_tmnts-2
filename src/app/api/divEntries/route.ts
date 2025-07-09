import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initDivEntry } from "@/lib/db/initVals";
import { divEntryDataType, divEntryType } from "@/lib/types/types";
import { sanitizeDivEntry, validateDivEntry } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { divEntriesWithHdcp } from "./hdcpCalc";
import { getErrorStatus } from "../errCodes";

// routes /api/divEntries
export async function GET(request: NextRequest) {
  try {
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
    });    

    const divEntries = divEntriesWithHdcp(
      divEntriesNoHdcp.map(entry => ({
        ...entry,
        fee: entry.fee.toNumber()
      })
    ));    

    return NextResponse.json({ divEntries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting divEntries" },
      { status: 500 }
    );                
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { id, squad_id, div_id, player_id, fee } = await request.json()
    const toCheck: divEntryType = {
      ...initDivEntry,
      id,
      squad_id,
      div_id,
      player_id,
      fee,
    }

    const toPost = sanitizeDivEntry(toCheck);
    const errCode = validateDivEntry(toPost);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.InvalidData:
          errMsg = 'invalid data'
          break;
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      );
    }

    const divEntryData: divEntryDataType = {
      id: toPost.id,
      squad_id: toPost.squad_id,
      div_id: toPost.div_id,
      player_id: toPost.player_id,
      fee: toPost.fee,
    }
    const divEntry = await prisma.div_Entry.create({
      data: divEntryData
    })
    return NextResponse.json({ divEntry }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating divEntry" },
      { status: errStatus }
    );
  }
}