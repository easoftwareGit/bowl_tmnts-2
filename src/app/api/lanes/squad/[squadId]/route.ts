import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/lanes/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;
    if (!isValidBtDbId(squadId, 'sqd')) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 404 }
      );        
    }
    const lanes = await prisma.lane.findMany({
      where: {
        squad_id: squadId
      },
      orderBy: {
        lane_number: 'asc'
      }
    })    
    // no matching rows is ok
    return NextResponse.json({ lanes }, { status: 200 });        
  } catch (error) {
    return standardCatchReturn(error, "error getting lanes for squad");    
  } 
}