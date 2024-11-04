import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";

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
    const events: eventType[] = prismaEvents.map(event => ({
      ...initEvent,
      id: event.id,
      tmnt_id: event.tmnt_id,
      event_name: event.event_name,
      team_size: event.team_size,
      games: event.games,      
      added_money: event.added_money + '',
      entry_fee: event.entry_fee + '',
      lineage: event.lineage + '',
      prize_fund: event.prize_fund + '',
      other: event.other + '',
      expenses: event.expenses + '',
      lpox: event.entry_fee + '',
      sort_order: event.sort_order,
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
