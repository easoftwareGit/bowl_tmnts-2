import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getTmntGamesSql } from "../../getSql";

// routes /api/results/games/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: { tmntId: string } }
) {
  try {
    const id = params.tmntId;
    // check if id is a valid tmnt id
    if (!isValidBtDbId(id, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const squads = await prisma.squad.findMany({
      select: {
        games: true,
      },
      where: {
        events: {
          tmnt_id: id,
        },
      },
      distinct: ['games'],
    });

    if (!squads || squads.length === 0 || !squads[0].games) {    
      return NextResponse.json({ games: [] }, { status: 200 });
    }    
    const tmntGamesSql = getTmntGamesSql(id, squads[0].games);    
    // ok to use queryRaw because call to sanitizing in getDivGamesSql
    const games = await prisma.$queryRawUnsafe(tmntGamesSql);
    
    // no matching rows is ok
    return NextResponse.json({ games }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting games for div" },
      { status: 500 }
    );
  }
}
