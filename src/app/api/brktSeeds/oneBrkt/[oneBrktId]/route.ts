import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/oneBrkt/:oneBrktId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ oneBrktId: string }> }
) {
  try {
    const { oneBrktId } = await params;    
    // check if oneBrktId is a valid oneBrkt id
    if (!isValidBtDbId(oneBrktId, "obk")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const brktSeeds = await prisma.brkt_Seed.findMany({
      select: {
        one_brkt_id: true,
        seed: true,
        player_id: true,
      },
      where: { one_brkt_id: oneBrktId },
      orderBy: [
        {
          one_brkt_id: 'asc',
        }, 
        {
          seed: 'asc',
        }, 
      ]
    });

    if (!brktSeeds) {
      return NextResponse.json({ error: "error getting brktSeeds for oneBrkt" }, { status: 404 });
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (err: any) {
    return standardCatchReturn(err, "error getting brktSeeds for oneBrkt");    
  }
}