import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

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
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brktSeeds for oneBrkt" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ oneBrktId: string }> }
) {
  try {
    const { oneBrktId } = await params;    
    // check if oneBrktId is a valid one brkt id
    if (!isValidBtDbId(oneBrktId, "obk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt_Seed.deleteMany({
      where: {
        one_brkt_id: oneBrktId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brktSeeds for oneBrkt" },
      { status: 500 }
    );
  }
}