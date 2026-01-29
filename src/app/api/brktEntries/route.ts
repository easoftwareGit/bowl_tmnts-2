import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";
import { sanitizeBrktEntry, validateBrktEntry } from "../../../lib/validation/brktEntries/validate";
import { ErrorCode } from "@/lib/validation/validation";
import { getErrorStatus } from "../errCodes";
import { brktEntryDataForPrisma } from "./dataForPrisma";

// routes /api/brktEntries

const getErrMsg = (errorCode: ErrorCode) => {
  let errMsg: string;
  switch (errorCode) {
    case ErrorCode.MISSING_DATA:
      errMsg = "missing data";
      break;
    case ErrorCode.INVALID_DATA:
      errMsg = "invalid data";
      break;
    default:
      errMsg = "unknown error";
      break;
  }
  return errMsg;  
}

export async function GET(request: NextRequest) {
  try {
    const brktEntries = await prisma.brkt_Entry.findMany(
      { include: { brkt_refunds: true } }
    );
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
    const { id, brkt_id, player_id, num_brackets, num_refunds, fee, time_stamp } = await request.json()
    const toCheck: brktEntryType = {
      ...initBrktEntry,
      id,      
      brkt_id,
      player_id,
      num_brackets,
      num_refunds,
      fee,
      time_stamp,
    }

    const sanitizedObj = sanitizeBrktEntry(toCheck);
    if (sanitizedObj.errorCode !== ErrorCode.NONE) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    const toPost = sanitizedObj.brktEntry;
    const errCode = validateBrktEntry(toPost);
    if (errCode !== ErrorCode.NONE) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json( { error: errMsg }, { status: 422 } );
    }

    const brktEntryData = brktEntryDataForPrisma(toPost);
    if (!brktEntryData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // DO NOT POST FEE
    const postedBrktEntry = await prisma.brkt_Entry.create({
      data: {
        id: brktEntryData.id,
        brkt_id: brktEntryData.brkt_id,
        player_id: brktEntryData.player_id,
        num_brackets: brktEntryData.num_brackets,
        time_stamp: brktEntryData.time_stamp,
        brkt_refunds: (brktEntryData.num_refunds != null && brktEntryData.num_refunds > 0)
          ? {
            create: {              
              num_refunds: brktEntryData.num_refunds
            }
          }
          : undefined,
      },
      include: { brkt_refunds: true },
    })
    // add the num_refunds to the return object if needed
    let brktEntry
    if (brktEntryData.num_refunds != null && brktEntryData.num_refunds > 0) {
      brktEntry = {
        ...postedBrktEntry,
        num_refunds: postedBrktEntry.brkt_refunds?.num_refunds,
      }
    } else { 
      brktEntry = postedBrktEntry
    }
    return NextResponse.json({ brktEntry }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating brktEntry" },
      { status: errStatus }
    );
  }
}