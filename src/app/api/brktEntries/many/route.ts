import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktEntryType, brktEntryDataType, tmntEntryBrktEntryType } from "@/lib/types/types";
import { validateBrktEntries } from "../validate";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "@/app/api/brktEntries/many/getSql";
// import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "./getSql";

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
        time_stamp: new Date(brktEntry.time_stamp), // Convert to Date object             
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

export async function PUT(request: NextRequest) { 

  try {
    const teBrktEntries: tmntEntryBrktEntryType[] = await request.json();
    const validBrktEntries = await validateBrktEntries(teBrktEntries as brktEntryType[]); // need to use await! or else returns a promise
    if (validBrktEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const validTeBrktEntries: tmntEntryBrktEntryType[] = [];
    validBrktEntries.brktEntries.forEach((brktEntry) => {
      const foundBrktEntry = teBrktEntries.find((b) => b.brkt_id === brktEntry.brkt_id && b.player_id === brktEntry.player_id);
      if (foundBrktEntry) {
        const vteBrktEntry = {
          ...brktEntry,
          // createdAt: foundBrktEntry.createdAt,
          // updatedAt: foundBrktEntry.updatedAt,
          eType: foundBrktEntry.eType,
        }
        validTeBrktEntries.push(vteBrktEntry);
      }
    })

    if (validTeBrktEntries.length === 0) {
      return NextResponse.json({ error: "no data" }, { status: 422 });
    }

    const brktEntriesToUpdate = validTeBrktEntries.filter((brktEntry) => brktEntry.eType === "u");
    const updateManySQL = (brktEntriesToUpdate.length > 0)
      ? getUpdateManySQL(brktEntriesToUpdate)
      : "";
    
    const divEntriesToInsert = validTeBrktEntries.filter((brktEntry) => brktEntry.eType === "i");
    const insertManySQL = (divEntriesToInsert.length > 0)
      ? getInsertManySQL(divEntriesToInsert)
      : "";
    
    const divEntriesToDelete = validTeBrktEntries.filter((brktEntry) => brktEntry.eType === "d");
    const deleteManySQL = (divEntriesToDelete.length > 0)
      ? getDeleteManySQL(divEntriesToDelete)
      : "";

    const [updates, inserts, deletes] = await prisma.$transaction([
      prisma.$executeRawUnsafe(updateManySQL),
      prisma.$executeRawUnsafe(insertManySQL),
      prisma.$executeRawUnsafe(deleteManySQL),      
    ])

    const updateInfo = { updates: updates, inserts: inserts, deletes: deletes };    
    return NextResponse.json({updateInfo}, { status: 200 });
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
      { error: "error updating many brktEntries" },
      { status: errStatus }
    );
  }    
}