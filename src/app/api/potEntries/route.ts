import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPotEntry } from "@/lib/db/initVals";
import type { potEntryType } from "@/lib/types/types";
import { sanitizePotEntry, validatePotEntry } from "../../../lib/validation/potEntries/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { getErrorStatus } from "../errCodes";
import { potEntryDataForPrisma } from "./dataForPrisma";

// routes /api/potEntries

export async function GET(request: NextRequest) {
  try {
    const potEntries = await prisma.pot_Entry.findMany();
    return NextResponse.json({ potEntries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting potEntries" },
      { status: 500 }
    );                
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { id, pot_id, player_id, fee } = await request.json()
    const toCheck: potEntryType = {
      ...initPotEntry,
      id,      
      pot_id,
      player_id,
      fee,
    }

    const toPost = sanitizePotEntry(toCheck);
    const errCode = validatePotEntry(toPost);
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

    const potEntryData = potEntryDataForPrisma(toPost);
    if (!potEntryData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const potEntry = await prisma.pot_Entry.create({
      data: potEntryData
    })
    return NextResponse.json({ potEntry }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating potEntry" },
      { status: errStatus }
    );
  }
}