import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateDiv, sanitizeDiv } from "../../../lib/validation/divs/validate";
import { ErrorCode } from "@/lib/validation/validation";
import { divType } from "@/lib/types/types";
import { initDiv } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";
import { divDataForPrisma } from "./dataForPrisma";

// routes /api/divs

export async function GET(request: NextRequest) {
  try {
    const divs = await prisma.div.findMany({
      orderBy: [
        {
          tmnt_id: "asc",
        },
        {
          sort_order: "asc",
        },
      ],
    });
    return NextResponse.json({ divs }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting divs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, tmnt_id, div_name, hdcp_per, hdcp_from, int_hdcp, hdcp_for, sort_order } =
      await request.json();
    const toCheck: divType = {
      ...initDiv,
      id,
      tmnt_id,
      div_name,
      hdcp_per,
      hdcp_from,
      int_hdcp,
      hdcp_for,
      sort_order,
    };

    const toPost = sanitizeDiv(toCheck);
    const errCode = validateDiv(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.MISSING_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const divData = divDataForPrisma(toPost);
    if (!divData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    // let divData: divDataType = {
    //   id: toPost.id,
    //   tmnt_id: toPost.tmnt_id,
    //   div_name: toPost.div_name,
    //   hdcp_per: toPost.hdcp_per,
    //   hdcp_from: toPost.hdcp_from,
    //   int_hdcp: toPost.int_hdcp,
    //   hdcp_for: toPost.hdcp_for,
    //   sort_order: toPost.sort_order,
    // };
    const div = await prisma.div.create({
      data: divData,
    });

    return NextResponse.json({ div }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json({ error: "error creating div" }, { status: errStatus });
  }
}
