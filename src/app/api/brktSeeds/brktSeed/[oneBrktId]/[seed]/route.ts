import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validCompositKey } from "../../../validate";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/brktSeeds/brktSeed/:oneBrktId/:seed

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ oneBrktId: string; seed: string }> }
) {
  try {
    const { oneBrktId, seed } = await params; 
    if (!validCompositKey(oneBrktId, seed)) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }  
    const seedNum = typeof seed === 'string' ? parseInt(seed, 10) : seed;
    const brktSeed = await prisma.brkt_Seed.findUnique({
      where: {
        one_brkt_id_seed: {
          one_brkt_id: oneBrktId,
          seed: seedNum,
        },        
      },
    });
    if (!brktSeed) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json({brktSeed}, { status: 200 });    
  } catch (error) {
    return NextResponse.json(
      { error: "error getting brktSeed" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ oneBrktId: string; seed: string }> }
) {
  try {
    const { oneBrktId, seed } = await params; 
    if (!validCompositKey(oneBrktId, seed)) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }  
    const seedNum = typeof seed === 'string' ? parseInt(seed, 10) : seed;

    const result = await prisma.brkt_Seed.deleteMany({
      where: {        
        one_brkt_id: oneBrktId,
        seed: seedNum,        
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting brktSeed" },
      { status: errStatus }
    );    
  }
}