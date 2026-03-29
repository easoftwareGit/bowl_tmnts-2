import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initDivEntry } from "@/lib/db/initVals";
import type { divEntryType } from "@/lib/types/types";
import { sanitizeDivEntry, validateDivEntry } from "../../../lib/validation/divEntries/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";
import { divEntryDataForPrisma } from "./divEntryDataForPrisma";

// routes /api/divEntries
export async function GET(request: NextRequest) {
  try {
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
    });    

    return NextResponse.json({ divEntries }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divEntries");
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
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
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

    const divEntryData = divEntryDataForPrisma(toPost);
    if (!divEntryData) {
      return NextResponse.json({ error: "invalid data" },{ status: 422 });
    }
    const divEntry = await prisma.div_Entry.create({
      data: divEntryData
    })
    return NextResponse.json({ divEntry }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating divEntry");
  }
}