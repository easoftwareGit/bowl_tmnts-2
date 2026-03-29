import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;    
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
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
            div: {
              tmnt: {
                id: tmntId,
              },
            },
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
        { error: "error getting brktSeeds for tmnt" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (err: any) {
    return standardCatchReturn(err, "error getting brktSeeds for tmnt");
  }
}