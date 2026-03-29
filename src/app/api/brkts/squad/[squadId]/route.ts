import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brkts/squad/:squadId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if id is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brkts = await prisma.brkt.findMany({
      where: {
        squad_id: squadId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });

    // no matching rows is ok
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brkts for squad");
  }
}