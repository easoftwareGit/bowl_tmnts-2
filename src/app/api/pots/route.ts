import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePot, sanitizePot } from "../../../lib/validation/pots/validate";
import { ErrorCode } from "@/lib/validation/validation";
import { potType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";
import { potDataForPrisma } from "./dataForPrisma";

// routes /api/pots
export async function GET(request: NextRequest) {
  try {
    const pots = await prisma.pot.findMany({
      orderBy: [
        {
          div_id: 'asc',
        }, 
        {
          sort_order: 'asc',
        }, 
      ]
    })
    return NextResponse.json({pots}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting pots" },
      { status: 400 }
    );            
  }
}

export async function POST(request: Request) { 
  try {
    const { id, div_id, squad_id, pot_type, fee, sort_order } = await request.json()    
    const toCheck: potType = {
      ...initPot,
      id,
      div_id,
      squad_id,
      pot_type,
      fee,
      sort_order
    }

    const toPost = sanitizePot(toCheck);
    const errCode = validatePot(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.MISSING_DATA:
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

    const potData = potDataForPrisma(toPost);
    if (!potData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const pot = await prisma.pot.create({
      data: potData
    })    
    return NextResponse.json({ pot }, { status: 201 })        
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating pot" },
      { status: errStatus }
    );            
  }
}