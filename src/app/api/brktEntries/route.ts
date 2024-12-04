import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryDataType, brktEntryType } from "@/lib/types/types";
import { sanitizeBrktEntry, validateBrktEntry } from "./validate";
import { ErrorCode } from "@/lib/validation";

// routes /api/brktEntries
export async function GET(request: NextRequest) {
  try {
    const brktEntries = await prisma.brkt_Entry.findMany();
    return NextResponse.json({ brktEntries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting brktEntries" },
      { status: 500 }
    );                
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { id, brkt_id, player_id, num_brackets, fee } = await request.json()
    const toCheck: brktEntryType = {
      ...initBrktEntry,
      id,      
      brkt_id,
      player_id,
      num_brackets,
      fee,
    }

    const toPost = sanitizeBrktEntry(toCheck);
    const errCode = validateBrktEntry(toPost);
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

    const brktEntryData: brktEntryDataType = {
      id: toPost.id,      
      brkt_id: toPost.brkt_id,
      player_id: toPost.player_id,
      num_brackets: toPost.num_brackets,
      fee: toPost.fee,
    }
    const brktEntry = await prisma.brkt_Entry.create({
      data: brktEntryData
    })
    return NextResponse.json({ brktEntry }, { status: 201 });
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
      { error: "error creating brktEntry" },
      { status: errStatus }
    );
  }
}