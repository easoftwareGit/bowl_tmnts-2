import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { testDateType } from "@/lib/types/types";
import { initTestDate } from "@/lib/db/initVals";

// routes /api/testdate

export async function GET(request: NextRequest) {
  try {
    const testDates = await prisma.testDate.findMany({})
    return NextResponse.json({ testDates }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting testdates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const {
      id,
      sod,
      eod,
      gmt,
    } = await request.json();
    const toCheck: testDateType = {
      ...initTestDate,
      sod,
      eod,
      gmt,
    };

    let postId = 0;
    if (id) {
      postId = Number(id)
      if (isNaN(postId) || !(Number.isInteger(postId)) || postId < 1 || postId > Number.MAX_SAFE_INTEGER) {
        return NextResponse.json({ error: "invalid data" }, { status: 422 });
      }
    }

    const toPost = toCheck;
    type testDateDataType = {
      sod: Date;
      eod: Date;
      gmt: Date;
      id?: number;
    };
    let testDateData: testDateDataType = {
      sod: toPost.sod,
      eod: toPost.eod,
      gmt: toPost.gmt,
    };
    if (postId) {
      testDateData.id = postId;
    }
    const td = await prisma.testDate.create({
      data: testDateData,
    });
    return NextResponse.json({ td }, { status: 201 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // Unique constraint
        errStatus = 422;
        break;
      case "P2003": // Foreign key constraint
        errStatus = 422;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error creating testDate" },
      { status: errStatus }
    );
  }
}
