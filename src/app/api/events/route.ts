import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateEvent, sanitizeEvent, allEventMoneyValid } from "@/app/api/events/validate";
import { ErrorCode } from "@/lib/validation";
import { eventDataType, eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";

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
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MissingData:
          errMsg = 'missing data'
          break;
        case ErrorCode.InvalidData:
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
            
    let eventData: eventDataType = {
      id: toPost.id,
      tmnt_id: toPost.tmnt_id,
      event_name: toPost.event_name,
      team_size: toPost.team_size,
      games: toPost.games,
      entry_fee: toPost.entry_fee,
      lineage: toPost.lineage,
      prize_fund: toPost.prize_fund,
      other: toPost.other,
      expenses: toPost.expenses,
      added_money: toPost.added_money,      
      sort_order: toPost.sort_order,          
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
      { error: "error creating event" },
      { status: errStatus }
    );        
  }
}