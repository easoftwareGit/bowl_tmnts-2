import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/squad/:squadId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
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
            squad_id: squadId
          }
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
        { error: "error getting brktSeeds for squad" },
        { status: 404 }
      );
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brktSeeds for squad");
  }
}