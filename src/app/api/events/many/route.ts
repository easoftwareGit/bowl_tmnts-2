import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { eventDataType, eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { validateEvents } from "../validate";

// routes /api/events/many

export async function POST(request: NextRequest) { 

  try { 
    const events: eventType[] = await request.json();

    // sanitize and validate events
    const validEvents = await validateEvents(events); // need to use await! or else returns a promise
    if (validEvents.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid events into eventData to post
    const eventsToPost: eventDataType[] = []
    validEvents.events.forEach(event => {
      eventsToPost.push({
        id: event.id,
        tmnt_id: event.tmnt_id,        
        event_name: event.event_name,
        team_size: event.team_size,
        games: event.games,
        added_money: event.added_money,
        entry_fee: event.entry_fee,
        lineage: event.lineage,
        prize_fund: event.prize_fund,
        expenses: event.expenses,
        other: event.other,        
        sort_order: event.sort_order,
      })
    });      

    const prismaEvents = await prisma.event.createManyAndReturn({
      data: [...eventsToPost]
    })
    // convert prismaEvents to events
    const manyEvents: eventType[] = [];
    prismaEvents.map((event) => {
      manyEvents.push({
        ...initEvent,
        id: event.id,
        tmnt_id: event.tmnt_id,        
        event_name: event.event_name,
        tab_title: event.event_name,
        team_size: event.team_size,
        games: event.games,
        added_money: event.added_money + '',
        entry_fee: event.entry_fee + '',
        lineage: event.lineage + '',
        prize_fund: event.prize_fund + '',
        expenses: event.expenses + '',
        other: event.other + '',
        lpox: event.entry_fee + '',
        sort_order: event.sort_order,
      })
    })
    return NextResponse.json({events: manyEvents}, { status: 201 });
  } catch (err: any) {
    let errStatus: number
    switch (err.code) {
      case 'P2002': // Unique constraint
        errStatus = 409
        break;
      case 'P2003': // parent not found
        errStatus = 404
        break;    
      default:
        errStatus = 500
        break;
    }
    return NextResponse.json(
      { error: "error creating many events" },
      { status: errStatus }
    );        
  } 
}