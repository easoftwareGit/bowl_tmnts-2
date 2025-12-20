import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateElim, sanitizeElim } from "./validate";
import { ErrorCode } from "@/lib/validation";
import { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";
import { elimDataForPrisma } from "./dataForPrisma";

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
    
    const elimData = elimDataForPrisma(toPost);
    if (!elimData) {
      return NextResponse.json({ error: "error creating elim" }, { status: 422 });
    }
    const elim = await prisma.elim.create({
      data: elimData,
    });
    return NextResponse.json({ elim }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating elim" },
      { status: errStatus }
    );
  }
}
