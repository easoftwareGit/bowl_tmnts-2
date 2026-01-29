import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initElimEntry } from "@/lib/db/initVals";
import { elimEntryType } from "@/lib/types/types";
import { sanitizeElimEntry, validateElimEntry } from "../../../lib/validation/elimEntries/validate";
import { ErrorCode } from "@/lib/validation/validation";
import { getErrorStatus } from "../errCodes";
import { elimEntryDataForPrisma } from "./dataForPrisma";

// routes /api/elimEntries
export async function GET(request: NextRequest) {
  try {
    const elimEntries = await prisma.elim_Entry.findMany();
    return NextResponse.json({ elimEntries }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting elimEntries" },
      { status: 500 }
    );                
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { id, elim_id, player_id, fee } = await request.json()
    const toCheck: elimEntryType = {
      ...initElimEntry,
      id,      
      elim_id,
      player_id,      
      fee,
    }

    const toPost = sanitizeElimEntry(toCheck);
    const errCode = validateElimEntry(toPost);
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
    const elimEntryData = elimEntryDataForPrisma(toPost);
    if (!elimEntryData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // const elimEntryData: elimEntryDataType = {
    //   id: toPost.id,      
    //   elim_id: toPost.elim_id,
    //   player_id: toPost.player_id,      
    //   fee: toPost.fee,
    // }
    const elimEntry = await prisma.elim_Entry.create({
      data: elimEntryData
    })
    return NextResponse.json({ elimEntry }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating elimEntry" },
      { status: errStatus }
    );
  }
}