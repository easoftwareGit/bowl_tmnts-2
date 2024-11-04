import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePot, sanitizePot } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { potType, potDataType } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";

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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.MissingData:
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

    let potData: potDataType = {
      id: toPost.id,
      div_id: toPost.div_id,
      squad_id: toPost.squad_id,
      pot_type: toPost.pot_type,
      fee: toPost.fee,            
      sort_order: toPost.sort_order
    }
    const pot = await prisma.pot.create({
      data: potData
    })    
    return NextResponse.json({ pot }, { status: 201 })        
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // Foreign key constraint
        errStatus = 404
        break;    
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating pot" },
      { status: errStatus }
    );            
  }
}