import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { potEntryDataType, potEntryType } from "@/lib/types/types";
import { validatePotEntries } from "../validate";

// routes /api/divEntries/many

export async function POST(request: NextRequest) {
   
  try {
    const potEntries: potEntryType[] = await request.json();
    // sanitize and validate divEntries
    const validPotEntries = await validatePotEntries(potEntries); // need to use await! or else returns a promise
    if (validPotEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid potEntries into potEntryData to post
    const potEntriesToPost: potEntryDataType[] = []
    validPotEntries.potEntries.forEach(potEntry => {
      potEntriesToPost.push({
        id: potEntry.id,        
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,   
        fee: potEntry.fee,
      })
    });      

    const manyPotEntries = await prisma.pot_Entry.createManyAndReturn({
      data: [...potEntriesToPost]
    })
    return NextResponse.json({potEntries: manyPotEntries}, { status: 201 });    
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
      { error: "error creating many potEntries" },
      { status: errStatus }
    );        
  } 
}