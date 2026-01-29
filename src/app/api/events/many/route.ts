import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation/validation";
import { eventDataType, eventType } from "@/lib/types/types";
import { validateEvents } from "../../../../lib/validation/events/validate";
import { getErrorStatus } from "../../errCodes";
import { eventDataForPrisma } from "../dataForPrisma";

// routes /api/events/many

export async function POST(request: NextRequest) { 

  try { 
    const events: eventType[] = await request.json();
    if (Array.isArray(events) && events.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }
    // sanitize and validate events
    const validEvents = await validateEvents(events); // need to use await! or else returns a promise    
    if (validEvents.errorCode !== ErrorCode.NONE) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid events into eventData to post
    const eventsToPost: eventDataType[] = validEvents.events
      .map(event => eventDataForPrisma(event))
      .filter((data): data is eventDataType => data !== null);

    const result = await prisma.event.createMany({
      data: eventsToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })
    return NextResponse.json({ count: result.count }, { status: 201 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many events" },
      { status: errStatus }
    );        
  } 
}