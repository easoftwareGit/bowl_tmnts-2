import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";

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
    const stages = await prisma.stage.findMany({
      where: {
        squad_id: squadId
      },      
    })    

    // at this point, only one stage per squad should exist    
    // no stages is an error
    if (!stages || stages.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ stage: stages[0] }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting stages for squad" },
      { status: 500 }
    );        
  } 
}
