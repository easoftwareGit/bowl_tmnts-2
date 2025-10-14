import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateBrkt, sanitizeBrkt } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { brktDataType, brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { calcFSA } from "@/lib/currency/fsa";
import { getErrorStatus } from "../errCodes";
import { brktDataForPrisma } from "./dataForPrisma";

// routes /api/brkts

export async function GET(request: NextRequest) {
  try {
    const prismaBrkts = await prisma.brkt.findMany({
      orderBy: [
        {
          div_id: "asc",
        },
        {
          sort_order: "asc",
        },
      ],
    });
    // add in fsa
    const brkts = prismaBrkts.map(brkt => ({
      ...brkt,
      fsa: calcFSA(brkt.first, brkt.second, brkt.admin),
    }))
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brkts" }, { status: 500 });
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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = "missing data";
          break;
        case ErrorCode.InvalidData:
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
    // // NO fsa in eventDataType
    // let brktData: brktDataType = {
    //   id: toPost.id,
    //   div_id: toPost.div_id,
    //   squad_id: toPost.squad_id,
    //   fee: toPost.fee,
    //   start: toPost.start,
    //   games: toPost.games,
    //   players: toPost.players,
    //   first: toPost.first,
    //   second: toPost.second,
    //   admin: toPost.admin,
    //   sort_order: toPost.sort_order,
    // };
    const postedBrkt = await prisma.brkt.create({
      data: brktData,
    });
    // add in fsa
    const brkt = {
      ...postedBrkt,
      fsa: calcFSA(postedBrkt.first, postedBrkt.second, postedBrkt.admin),      
    };
    return NextResponse.json({ brkt }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating brkt" },
      { status: errStatus }
    );
  }
}
