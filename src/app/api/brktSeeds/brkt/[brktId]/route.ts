import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/brkt/:brktId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ brktId: string }> }
) {
  try {
    const {brktId} = await params;
    // check if brktId is a valid brkt id
    if (!isValidBtDbId(brktId, "brk")) {
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
          brkt_id: brktId
        }
      },
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
      return NextResponse.json({ error: "error getting brktSeeds for brkt" }, { status: 404 });
    }

    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (err: any) {
    return standardCatchReturn(err, "error getting brktSeeds for brkt");    
  }
}