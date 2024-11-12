import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";

// routes /api/events/tmnt/:tmntId

export async function GET(
  request: Request,
  { params }: { params: { tmntId: string } }
) {   
  try {
    const tmntId = params.tmntId;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const prismaEvents = await prisma.event.findMany({
      where: {
        tmnt_id: tmntId
      },
      orderBy: {
        sort_order: 'asc'
      }
    })    
    // no matching rows is ok

    // add in lpox
    const events = prismaEvents.map(event => ({
      ...event,
      lpox: event.entry_fee
    }))
    return NextResponse.json({events}, {status: 200});    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting events for tmnt" },
      { status: 500 }
    );        
  } 
}

export async function DELETE(
  request: Request,
  { params }: { params: { tmntId: string } }
) {   
  try {
    const tmntId = params.tmntId;
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, 'tmt')) {
      return NextResponse.json(
        { error: "not found" },
        { status: 404 }
      );        
    }
    const deleted = await prisma.event.deleteMany({
      where: {
        tmnt_id: tmntId,
      },
    });    
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting events for tmnt" },
      { status: 500 }
    );        
  } 
}
