import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/div/:divId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;    
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const brktSeeds = await prisma.brkt_Seed.findMany({
      select: {
        one_brkt_id: true,
        seed: true,
        player_id: true,
      },
      where: {
        one_brkt: {
          brkt: {
            div_id: divId,
          },
        }
      },
      orderBy: [
        {
          one_brkt_id: "asc",
        },
        {
          seed: "asc",
        },
      ],
    });

    if (!brktSeeds) {
      return NextResponse.json(
        { error: "error getting brktSeeds for div" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brktSeeds for div");
  }
}