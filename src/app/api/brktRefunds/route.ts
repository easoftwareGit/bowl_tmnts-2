import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
// import { initBrktEntry } from "@/lib/db/initVals";
// import { brktEntryDataType, brktEntryType } from "@/lib/types/types";
// import { sanitizeBrktEntry, validateBrktEntry } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { brktRefundDataType, brktRefundType } from "@/lib/types/types";
import { initBrktRefund } from "@/lib/db/initVals";
import { sanitizeBrktRefund, validateBrktRefund } from "./validate";

// routes /api/brktRefunds
export async function GET(request: NextRequest) {
  try {
    const brktRefunds = await prisma.brkt_Refund.findMany();
    return NextResponse.json({ brktRefunds }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting brktRefunds" },
      { status: 500 }
    );                
  }
}

export const POST = async (request: NextRequest) => {
  try {
    const { id, brkt_id, player_id, num_refunds } = await request.json()
    const toCheck: brktRefundType = {
      ...initBrktRefund,
      id,      
      brkt_id,
      player_id,
      num_refunds,
    }

    const toPost = sanitizeBrktRefund(toCheck);
    const errCode = validateBrktRefund(toPost);
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
    
    const brktRefundData: brktRefundDataType = {
      id: toPost.id,      
      brkt_id: toPost.brkt_id,
      player_id: toPost.player_id,
      num_refunds: toPost.num_refunds,      
    }
    const brktRefund = await prisma.brkt_Refund.create({
      data: brktRefundData
    })
    return NextResponse.json({ brktRefund }, { status: 201 });
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
      { error: "error creating brktRefund" },
      { status: errStatus }
    );
  }
}