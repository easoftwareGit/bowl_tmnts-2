import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { divEntryType, divEntryDataType } from "@/lib/types/types";
import { validateDivEntries } from "../validate";

// routes /api/divEntries/many

export async function POST(request: NextRequest) {

  try {
    const divEntries: divEntryType[] = await request.json();
    // sanitize and validate divEntries
    const validDivEntries = await validateDivEntries(divEntries); // need to use await! or else returns a promise
    if (validDivEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid divEntries into brktData to post
    const divEntriesToPost: divEntryDataType[] = []
    validDivEntries.divEntries.forEach(divEntry => {
      divEntriesToPost.push({
        id: divEntry.id,
        squad_id: divEntry.squad_id,
        div_id: divEntry.div_id,
        player_id: divEntry.player_id,
        fee: divEntry.fee,
      })
    });      

    const manyDivEntries = await prisma.div_Entry.createManyAndReturn({
      data: [...divEntriesToPost]
    })
    return NextResponse.json({divEntries: manyDivEntries}, { status: 201 });    
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
      { error: "error creating many brkts" },
      { status: errStatus }
    );        
  } 
}