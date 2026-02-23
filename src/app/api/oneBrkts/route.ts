import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateOneBrkt, sanitizeOneBrkt } from "../../../lib/validation/oneBrkts/valildate";
import { ErrorCode } from "@/lib/enums/enums";
import type { oneBrktType } from "@/lib/types/types";
import { initOneBrkt } from "@/lib/db/initVals";

// routes /api/oneBrkts
export async function GET(request: NextRequest) {
  try {
    const oneBrkts = await prisma.one_Brkt.findMany({
      orderBy: [
        {
          brkt_id: 'asc',
        }, 
        {
          bindex: 'asc',
        }, 
      ]
    });
    return NextResponse.json({oneBrkts}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting oneBrkts" },
      { status: 400 }
    );            
  }
}

export async function POST(request: Request) { 
  try {
    const { id, brkt_id, bindex } = await request.json()    
    const toCheck: oneBrktType = {
      ...initOneBrkt,
      id,
      brkt_id,
      bindex
    }

    const toPost = sanitizeOneBrkt(toCheck);
    const errCode = validateOneBrkt(toPost);
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
    const oneBrkt = await prisma.one_Brkt.create({
      data: toPost,
    });
    return NextResponse.json({oneBrkt}, {status: 201});
  } catch (err: any) {
    return NextResponse.json(
      { error: "error creating oneBrkt" },
      { status: 500 }
    );
  }
}