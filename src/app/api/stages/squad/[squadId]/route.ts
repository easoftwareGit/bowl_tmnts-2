import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { extractStageFromPrisma } from "@/lib/db/stageMappers";

// routes /api/stages/squad/[squadId]

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
    const prismaStages = await prisma.stage.findMany({
      where: {
        squad_id: squadId
      },      
    })    

    // at this point, only one stage per squad should exist    
    // no stages is an error
    if (!prismaStages || prismaStages.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    const stage = extractStageFromPrisma(prismaStages[0]);
    return NextResponse.json({ stage }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting stages for squad" },
      { status: 500 }
    );        
  } 
}
