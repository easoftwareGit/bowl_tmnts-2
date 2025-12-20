import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { initBrktRefund } from "@/lib/db/initVals";
import { brktRefundType } from "@/lib/types/types";
import { ErrorCode } from "@/lib/validation";
import { getErrorStatus } from "../errCodes";
import { sanitizeBrktRefund, validateBrktRefund } from "./validate";

// routes /api/brktRefunds

export async function GET(request: NextRequest) {
  try {
    const brktRefunds = await prisma.brkt_Refund.findMany({
    });
    // add in fsa
    return NextResponse.json({ brktRefunds }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brktRefunds" }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { brkt_entry_id, num_refunds } = await request.json()    
    const toCheck: brktRefundType = {
      ...initBrktRefund,
      brkt_entry_id,
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
    const brktSeed = await prisma.brkt_Refund.create({
      data: toPost,
    });
    return NextResponse.json({brktSeed}, {status: 201});
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating brktRefund" },
      { status: errStatus }
    );
  }
}