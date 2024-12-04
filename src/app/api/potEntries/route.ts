import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initPotEntry } from "@/lib/db/initVals";
import { potEntryDataType, potEntryType } from "@/lib/types/types";
import { sanitizePotEntry, validatePotEntry } from "./validate";
import { ErrorCode, maxMoney } from "@/lib/validation";
import { validMoney } from "@/lib/currency/validate";

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

    const potEntryData: potEntryDataType = {
      id: toPost.id,      
      pot_id: toPost.pot_id,
      player_id: toPost.player_id,
      fee: toPost.fee
    }
    const potEntry = await prisma.pot_Entry.create({
      data: potEntryData
    })
    return NextResponse.json({ potEntry }, { status: 201 });
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating potEntry" },
      { status: errStatus }
    );
  }
}