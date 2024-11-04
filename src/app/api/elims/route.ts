import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateElim, sanitizeElim } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { elimDataType, elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";

// routes /api/elims

export async function GET(request: NextRequest) {
  try {
    const elims = await prisma.elim.findMany({
      orderBy: [
        {
          div_id: "asc",
        },
        {
          sort_order: "asc",
        },
      ],
    });
    return NextResponse.json({ elims }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting elims" }, { status: 500 });
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
      sort_order,
    } = await request.json();
    
    const toCheck: elimType = {
      ...initElim,
      id,
      div_id,
      squad_id,
      fee,
      start,
      games,
      sort_order,
    };

    const toPost = sanitizeElim(toCheck);
    const errCode = validateElim(toPost);
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
    
    let elimData: elimDataType = {
      id: toPost.id,
      div_id: toPost.div_id, 
      squad_id: toPost.squad_id,
      fee: toPost.fee,
      start: toPost.start,
      games: toPost.games,
      sort_order: toPost.sort_order,
    };
    const elim = await prisma.elim.create({
      data: elimData,
    });
    return NextResponse.json({ elim }, { status: 201 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // Unique constraint
        errStatus = 404;
        break;
      case "P2003": // Foreign key constraint
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error creating elim" },
      { status: errStatus }
    );
  }
}
