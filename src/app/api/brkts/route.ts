import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBrkt, sanitizeBrkt } from "../../../lib/validation/brkts/validate";
import { ErrorCode } from "@/lib/enums/enums";
import type { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { standardCatchReturn } from "../apiCatch";
import { brktDataForPrisma } from "./brktDataForPrisma";

// routes /api/brkts

export async function GET(request: NextRequest) {
  try {
    const brkts = await prisma.brkt.findMany({
      orderBy: [
        {
          div_id: "asc",
        },
        {
          sort_order: "asc",
        },
      ],
    });
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brkts");    
  }
}

export async function POST(request: Request) {
  try {
    const {
      id,
      div_id,
      squad_id,
      fee,
      start,
      games,
      players,
      first,
      second,
      admin,
      fsa,
      sort_order,
    } = await request.json();
    const toCheck: brktType = {
      ...initBrkt,
      id,
      div_id,
      squad_id,
      fee,
      start,
      games,
      players,
      first,
      second,
      admin,
      fsa,
      sort_order,
    };

    const toPost = sanitizeBrkt(toCheck);
    const errCode = validateBrkt(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
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
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    
    const brktData = brktDataForPrisma(toPost);
    if (!brktData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // NO fsa in eventDataType
    const brkt = await prisma.brkt.create({
      data: brktData,
    });
    return NextResponse.json({ brkt }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating brkt");
  }
}
