import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { potPfType } from "@/lib/types/types";
import { initPotPf } from "@/lib/db/initVals";
import {
  validatePotPf,
  sanitizePotPf,
} from "../../../lib/validation/potPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";

// routes /api/potPfs

export async function GET(request: NextRequest) {
  try {
    const potPfs = await prisma.pot_PF.findMany({      
      orderBy: [
        { pot_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ potPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting potPfs");
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      pot_id,
      position,
      amount,
    } = await request.json();

    const toCheck: potPfType = {
      ...initPotPf,
      id,
      pot_id,
      position,
      amount,
    };
    const toPost = sanitizePotPf(toCheck);
    const errCode = validatePotPf(toPost);
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

    let potPfData = {
      id: toPost.id,
      pot_id: toPost.pot_id,
      position: toPost.position as number,
      amount: toPost.amount as number,
    };
    const potPf = await prisma.pot_PF.create({ data: potPfData });
    return NextResponse.json({ potPf }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating potPf");
  }
}
