import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/lanes/squad/:squadId

export async function GET(
  request: Request,
  { params }: { params: { squadId: string } }
) {   
  try {
    const squadId = params.squadId;
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
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting lanes for squad" },
      { status: 500 }
    );        
  } 
}

export async function DELETE(
  request: Request,
  { params }: { params: { squadId: string } }
) {
  try {
    const squadId = params.squadId;
    // check if id is a valid tmnt id
    if (!isValidBtDbId(squadId, 'sqd')) {
      return NextResponse.json({ error: "not found" }, { status: 404 });        
    }
    const deleted = await prisma.lane.deleteMany({
      where: {
        squad_id: squadId
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting lanes for squad" },
      { status: 500 }
    );        
  } 
}