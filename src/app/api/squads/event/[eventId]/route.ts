import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/squads/event/:eventId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    if (!isValidBtDbId(eventId, 'evt')) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 404 }
      );        
    }
    const squads = await prisma.squad.findMany({
      where: {
        event_id: eventId
      },
      orderBy: { sort_order: 'asc' }
    })    
    // no matching rows is ok
    return NextResponse.json({squads}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting squads for event" },
      { status: 500 }
    );        
  } 
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    // check if id is a valid tmnt id
    if (!isValidBtDbId(eventId, 'evt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const result = await prisma.squad.deleteMany({
      where: {
        event_id: eventId
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting squads for event" },
      { status: 500 }
    );        
  } 
}
      