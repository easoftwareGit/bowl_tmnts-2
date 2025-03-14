import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { getDivGamesSql } from "../../getSql";

// routes /api/results/games/div/:divId

export async function GET(
  request: Request,
  { params }: { params: { divId: string } }
) {
  try {
    const id = params.divId;
    // check if id is a valid div id
    if (!isValidBtDbId(id, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const squads = await prisma.squad.findFirst({
      select: {
        games: true
      },
      where: {
        dviEntries: {
          some: {
            div_id: id
          }
        }
      },
      distinct: ["games"]
    });
    if (!squads || !squads.games) {
      return NextResponse.json({ games: [] }, { status: 200 });
    }

    const divGamesSql = getDivGamesSql(id, squads.games);
    // ok to use queryRaw because call to sanitizing in getDivGamesSql
    const games = await prisma.$queryRawUnsafe(divGamesSql);
    
    // no matching rows is ok
    return NextResponse.json({ games }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting games for div" },
      { status: 500 }
    );
  }
}
