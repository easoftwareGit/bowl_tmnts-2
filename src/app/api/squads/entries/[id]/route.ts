import { NextResponse } from "next/server";
import { getSquadEntriesSQL } from "../getSql";
import { dataOneTmntType } from "@/lib/types/types";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

export async function GET(
  request: Request,  
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "sqd")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const url = new URL(request.url);
    const curDataStr = url.searchParams.get("curData");
    if (!curDataStr) {
      return NextResponse.json({ error: "missing request data" }, { status: 400 });
    }
    const curData: dataOneTmntType = JSON.parse(curDataStr);
    if (!curData || !curData.squads || curData.squads.length === 0 || curData.squads[0].id !== id) { 
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const squadsSql = getSquadEntriesSQL(curData);
    if (!squadsSql || squadsSql === '') {
      return NextResponse.json(
        { error: "error getting squad entries" },
        { status: 422 }
      );                 
    }
    const squadEntries = await prisma.$queryRawUnsafe(squadsSql);
    return NextResponse.json({squadEntries}, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "error getting squad entries" },
      { status: 500 }
    );                 
  }
}