import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/enums/enums";
import type { tmntDataType, tmntType } from "@/lib/types/types";
import { sanitizeTmnt, validateTmnt } from "../../../lib/validation/tmnts/valildate";
import { initTmnt } from "@/lib/db/initVals";
import { standardCatchReturn } from "../apiCatch";
import { tmntDataForPrisma } from "./tmntDataForPrisma";

// routes /api/tmnts

export async function GET(request: NextRequest) {
  try {
    const skip = request.nextUrl.searchParams.get('skip')
    const take = request.nextUrl.searchParams.get('take')
    const tmnts = await prisma.tmnt.findMany({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    })
    // return NextResponse.json(tmnts);
    return NextResponse.json({ tmnts }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error getting tmnts");
  }
}
  
export async function POST(request: Request) {  

  try {
    const { id, tmnt_name, start_date_str, end_date_str, user_id, bowl_id } = await request.json()    

    const toCheck: tmntType = {
      ...initTmnt, 
      id,
      tmnt_name,
      start_date_str,
      end_date_str,
      user_id,
      bowl_id
    }

    const toPost = sanitizeTmnt(toCheck);
    const errCode = validateTmnt(toPost);
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
    
    const prismaToPost = tmntDataForPrisma(toPost);
    if (!prismaToPost) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    let tmntData: tmntDataType = {
      id: prismaToPost.id,
      tmnt_name: prismaToPost.tmnt_name,
      start_date: prismaToPost.start_date,
      end_date: prismaToPost.end_date,
      user_id: prismaToPost.user_id,
      bowl_id: prismaToPost.bowl_id
    }

    const tmnt = await prisma.tmnt.create({
      data: tmntData
    })
    return NextResponse.json({ tmnt }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating tmnt");
  }
}