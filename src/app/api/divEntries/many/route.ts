import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { divEntryType, divEntryDataType, tmntEntryDivEntryType } from "@/lib/types/types";
import { validateDivEntries } from "../validate";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "./getSql";
import { getErrorStatus } from "../../errCodes";
import { divEntryDataForPrisma } from "../dataForPrisma";

// routes /api/divEntries/many

export async function POST(request: NextRequest) {

  try {    
    const divEntries: divEntryType[] = await request.json();
    if (Array.isArray(divEntries) && divEntries.length === 0) {
      return NextResponse.json({ count: 0 }, { status: 200 });
    }    
    // sanitize and validate divEntries
    const validDivEntries = await validateDivEntries(divEntries); // need to use await! or else returns a promise
    if (validDivEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid divEntries into divEntryData to post
    const divEntriesToPost: divEntryDataType[] = validDivEntries.divEntries
      .map(divEntry => divEntryDataForPrisma(divEntry))
      .filter((data): data is divEntryDataType => data !== null);
    const result = await prisma.div_Entry.createMany({
      data: divEntriesToPost,
      skipDuplicates: false, // or true if you want to silently skip existing rows
    })

    return NextResponse.json({ count: result.count }, { status: 201 });   
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many divEntries" },
      { status: errStatus }
    );        
  } 
}

export async function PUT(request: NextRequest) { 

  try {
    const teDivEntries: tmntEntryDivEntryType[] = await request.json();
    const validDivEntries = await validateDivEntries(teDivEntries as divEntryType[]); // need to use await! or else returns a promise
    if (validDivEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const validTeDivEntries: tmntEntryDivEntryType[] = [];
    validDivEntries.divEntries.forEach((divEntry) => {
      const foundDivEntry = teDivEntries.find((d) => d.div_id === divEntry.div_id && d.player_id === divEntry.player_id);
      if (foundDivEntry) {
        const vteDivEntry = {
          ...divEntry,
          eType: foundDivEntry.eType,
        }
        validTeDivEntries.push(vteDivEntry);
      }
    })

    if (validTeDivEntries.length === 0) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const divEntriesToUpdate = validTeDivEntries.filter((divEntry) => divEntry.eType === "u");    
    const updateManySQL = (divEntriesToUpdate.length > 0)
      ? getUpdateManySQL(divEntriesToUpdate)
      : "";
    
    const divEntriesToInsert = validTeDivEntries.filter((divEntry) => divEntry.eType === "i");
    const insertManySQL = (divEntriesToInsert.length > 0)
      ? getInsertManySQL(divEntriesToInsert)
      : "";
    
    const divEntriesToDelete = validTeDivEntries.filter((divEntry) => divEntry.eType === "d");
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
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating many div entries" },
      { status: errStatus }
    );
  }    
}