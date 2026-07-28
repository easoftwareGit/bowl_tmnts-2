import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { elimPfType } from "@/lib/types/types";
import { initElimPf } from "@/lib/db/initVals";
import {
  validateElimPf,
  sanitizeElimPf,
} from "../../../lib/validation/elimPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";

// routes /api/elimPfs

export async function GET(request: NextRequest) {
  try {
    const elimPfs = await prisma.elim_PF.findMany({      
      orderBy: [
        { elim_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ elimPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPfs");
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      elim_id,
      position,
      amount,
    } = await request.json();

    const toCheck: elimPfType = {
      ...initElimPf,
      id,
      elim_id,
      position,
      amount,
    };
    const toPost = sanitizeElimPf(toCheck);
    const errCode = validateElimPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        case ErrorCode.OTHER_ERROR:
          errMsg = "other error";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    let elimPfData = {
      id: toPost.id,
      elim_id: toPost.elim_id,
      position: toPost.position as number,
      amount: toPost.amount as number,
    };
    const elimPf = await prisma.elim_PF.create({ data: elimPfData });
    return NextResponse.json({ elimPf }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating elimPf");
  }
}
