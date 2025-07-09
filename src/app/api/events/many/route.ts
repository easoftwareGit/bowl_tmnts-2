import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { eventDataType, eventType } from "@/lib/types/types";
import { validateEvents } from "../validate";
import { getErrorStatus } from "../../errCodes";

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
    const manyEvents = prismaEvents.map((event) => {
      return {
        ...event,
        lpox: event.entry_fee,
      }
    })
    return NextResponse.json({events: manyEvents}, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many events" },
      { status: errStatus }
    );        
  } 
}