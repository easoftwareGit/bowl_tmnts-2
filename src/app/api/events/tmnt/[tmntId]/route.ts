import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/events/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const events = await prisma.event.findMany({
      where: {
        tmnt_id: tmntId
      },
      orderBy: {
        sort_order: 'asc'
      }
    })    
    // no matching rows is ok

    // // add in lpox
    // const events = prismaEvents.map(event => ({
    //   ...event,
    //   lpox: event.entry_fee
    // }))
    return NextResponse.json({ events }, { status: 200 });        
  } catch (error) {
    return standardCatchReturn(error, "error getting events for tmnt");
  } 
}
