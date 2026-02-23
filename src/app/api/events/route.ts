import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEvent, sanitizeEvent, allEventMoneyValid } from "@/lib/validation/events/validate";
import { ErrorCode } from "@/lib/enums/enums";
import type { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";
import { getErrorStatus } from "../errCodes";
import { eventDataForPrisma } from "./dataForPrisma";

// routes /api/events

export async function GET(request: NextRequest) {
  try {
    const prismaEvents = await prisma.event.findMany({
      orderBy: [
        {
          tmnt_id: 'asc',
        }, 
        {
          sort_order: 'asc',
        }, 
      ]
    })        
    // add in lpox    
    const events = prismaEvents.map(event => ({
      ...event,
      lpox: event.entry_fee
    }))
    return NextResponse.json({ events }, { status: 200 });    
  } catch (error: any) {
    return NextResponse.json(
      { error: "error getting events" },
      { status: 500 }
    );        
  }
}

export async function POST(request: Request) {
  try {
    const { id, tmnt_id, event_name, team_size, games, added_money,
      entry_fee, lineage, prize_fund, other, expenses, lpox, sort_order } = await request.json()    
    const toCheck: eventType = {
      ...initEvent,
      id,
      tmnt_id,      
      event_name,
      team_size,
      games,
      added_money,
      entry_fee,
      lineage,
      prize_fund,
      other,
      expenses,    
      lpox,
      sort_order,
    }

    if (!allEventMoneyValid(toCheck)) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const toPost = sanitizeEvent(toCheck);
    const errCode = validateEvent(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;        
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      );
    }
            
    const eventData = eventDataForPrisma(toPost);
    if (!eventData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const postedEvent = await prisma.event.create({
      data: eventData
    })
    // add in lpox
    const event = {
      ...postedEvent,
      lpox: postedEvent.entry_fee
    }    
    return NextResponse.json({ event }, { status: 201 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating event" },
      { status: errStatus }
    );        
  }
}