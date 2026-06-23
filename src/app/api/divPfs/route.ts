import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { divPfType } from "@/lib/types/types";
import { initDivPf } from "@/lib/db/initVals";
import {
  validateDivPf,
  sanitizeDivPf,
} from "../../../lib/validation/divPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";

// routes /api/divPfs

export async function GET(request: NextRequest) {
  try {
    const divPfs = await prisma.div_PF.findMany({      
      orderBy: [
        { div_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ divPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPfs");
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      div_id,
      position,
      amount,
    } = await request.json();

    const toCheck: divPfType = {
      ...initDivPf,
      id,
      div_id,
      position,
      amount,
    };
    const toPost = sanitizeDivPf(toCheck);
    const errCode = validateDivPf(toPost);
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

    let divPfData = {
      id: toPost.id,
      div_id: toPost.div_id,
      position: toPost.position as number,
      amount: toPost.amount as number,
    };
    const divPf = await prisma.div_PF.create({ data: divPfData });
    return NextResponse.json({ divPf }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating divPf");
  }
}
