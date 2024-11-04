import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";
import { sanitizeBowl, validateBowl } from "./validate";
import { ErrorCode } from "@/lib/validation";

// routes /api/bowls

export async function GET(request: NextRequest) {
  try {
    const bowls = await prisma.bowl.findMany({
      orderBy: {
        bowl_name: 'asc',
      }
    })
    return NextResponse.json({bowls}, {status: 200});    
  } catch (error) {
    return NextResponse.json(
      { error: "error getting bowls" },
      { status: 500 }
    );            
  }
}

export async function POST(request: NextRequest) {
  // only admin and super admins can create new bowls
  try {
    const { id, bowl_name, city, state, url } = await request.json();  

    const toCheck: bowlType = {
      ...initBowl,
      id,
      bowl_name,      
      city,
      state,
      url
    }
    const toPost = sanitizeBowl(toCheck);
    const errCode = validateBowl(toPost);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.InvalidData:
          errMsg = 'invalid data'
          break;
        case ErrorCode.OtherError:
          errMsg = 'other error'
          break;
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      )
    }
    
    type bowlDataType = {
      id: string
      bowl_name: string
      city: string
      state: string
      url: string,      
    }
    let bowlData: bowlDataType = {
      id: toPost.id,
      bowl_name: toPost.bowl_name,
      city: toPost.city,
      state: toPost.state,
      url: toPost.url
    }

    const bowl = await prisma.bowl.create({
      data: bowlData
    })
    return NextResponse.json({bowl}, {status: 201});
  } catch (error: any) {
    let errStatus: number
    switch (error.code) {
      case 'P2002': // unique constraint violation
        errStatus = 400
        break;
      case 'P2003': // parent row not found
        errStatus = 404
        break;    
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating bowl" },
      { status: errStatus }
    );
  }
}