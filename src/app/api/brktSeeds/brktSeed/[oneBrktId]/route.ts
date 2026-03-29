import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brktSeeds/:oneBrktId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ oneBrktId: string }> }
) {
  try {
    const { oneBrktId } = await params;    
    // check if id is a valid brkt id
    if (!isValidBtDbId(oneBrktId, "obk")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const brktSeeds = await prisma.brkt_Seed.findMany({
      where: {
        one_brkt_id: oneBrktId,
      },
      orderBy: [
        {
          seed: "asc",
        },
      ]
    });
    if (!brktSeeds) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({ brktSeeds }, { status: 200 });
  } catch (error) {    
    return standardCatchReturn(error, "error getting brktSeeds for oneBrkt");
  }
}