import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { tmntMoneyType } from "@/lib/types/types";
import { initTmntMoney } from "@/lib/db/initVals";
import {
  validateTmntMoney,
  sanitizeTmntMoney,
} from "../../../lib/validation/moneys/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { standardCatchReturn } from "../apiCatch";
import type { MoneyDescrip } from "@prisma/client";

// routes /api/moneys

export async function GET(request: NextRequest) {
  try {
    const moneys = await prisma.money.findMany({
      // yes, sort order is last, so sorted by event_id, squad_id, div_id first
      orderBy: [
        { event_id: "asc" },
        { squad_id: "asc" },
        { div_id: "asc" },
        { sort_order: "asc" },
      ],
    });
    return NextResponse.json({ moneys }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting moneys");
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      id,
      event_id,
      squad_id,
      div_id,
      descrip,
      amount,
      sort_order,
      pot_id,
      brkt_id,
      elim_id,
    } = await request.json();

    const toCheck: tmntMoneyType = {
      ...initTmntMoney,
      id,
      event_id,
      squad_id,
      div_id,
      descrip,
      amount,
      sort_order,
      pot_id,
      brkt_id,
      elim_id,
    };
    const toPost = sanitizeTmntMoney(toCheck);
    const errCode = validateTmntMoney(toPost);
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

    let tmntMoneyData = {
      id: toPost.id,
      event_id: toPost.event_id,
      squad_id: toPost.squad_id,
      div_id: toPost.div_id,
      descrip: toPost.descrip,
      amount: toPost.amount as number,
      sort_order: toPost.sort_order,
      pot_id: toPost.pot_id,
      brkt_id: toPost.brkt_id,
      elim_id: toPost.elim_id,
    };
    const money = await prisma.money.create({ data: tmntMoneyData });
    return NextResponse.json({ money }, { status: 201 });
  } catch (error) {
    return standardCatchReturn(error, "error creating tmntMoney");
  }
}
