import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/squads/event/:eventId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    if (!isValidBtDbId(eventId, 'evt')) {
      return NextResponse.json( { error: "invalid request" }, { status: 404 } );        
    }
    const squads = await prisma.squad.findMany({
      where: {
        event_id: eventId
      },
      orderBy: { sort_order: 'asc' }
    })    
    // no matching rows is ok
    return NextResponse.json({squads}, {status: 200});    
  } catch (error) {
    return standardCatchReturn(error, "error getting squads for event");
  } 
}
 