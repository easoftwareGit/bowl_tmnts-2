import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktEntryType, brktEntryDataType } from "@/lib/types/types";
import { validateBrktEntries } from "../validate";

// routes /api/brktEntries/many

export async function POST(request: NextRequest) {

  try {
    const brktEntries: brktEntryType[] = await request.json();
    // sanitize and validate brktEntries
    const validBrktEntries = await validateBrktEntries(brktEntries); // need to use await! or else returns a promise
    if (validBrktEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid brktEntries into brktEntryData to post
    const brktEntriesToPost: brktEntryDataType[] = []
    validBrktEntries.brktEntries.forEach(brktEntry => {
      brktEntriesToPost.push({
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        fee: brktEntry.fee,
      })
    });      

    const manyBrktEntries = await prisma.brkt_Entry.createManyAndReturn({
      data: [...brktEntriesToPost]
    })
    return NextResponse.json({brktEntries: manyBrktEntries}, { status: 201 });    
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
      { error: "error creating many brktEntries" },
      { status: errStatus }
    );        
  } 
}