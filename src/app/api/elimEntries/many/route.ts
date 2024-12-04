import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { elimEntryType, elimEntryDataType } from "@/lib/types/types";
import { validateElimEntries } from "../validate";

// routes /api/elimEntries/many

export async function POST(request: NextRequest) {

  try {
    const elimEntries: elimEntryType[] = await request.json();
    // sanitize and validate elimEntries
    const validElimEntries = await validateElimEntries(elimEntries); // need to use await! or else returns a promise
    if (validElimEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid elimEntries into elimEntryData to post
    const elimEntriesToPost: elimEntryDataType[] = []
    validElimEntries.elimEntries.forEach(elimEntry => {
      elimEntriesToPost.push({
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      })
    });      

    const manyElimEntries = await prisma.elim_Entry.createManyAndReturn({
      data: [...elimEntriesToPost]
    })
    return NextResponse.json({elimEntries: manyElimEntries}, { status: 201 });    
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
      { error: "error creating many elimEntries" },
      { status: errStatus }
    );        
  } 
}