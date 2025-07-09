import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { elimEntryType, elimEntryDataType, tmntEntryElimEntryType } from "@/lib/types/types";
import { validateElimEntries } from "../validate";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "./getSql";
import { getErrorStatus } from "../../errCodes";

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
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error creating many elimEntries" },
      { status: errStatus }
    );        
  } 
}

export async function PUT(request: NextRequest) { 

  try {
    const teElimEntries: tmntEntryElimEntryType[] = await request.json();    
    const validElimEntries = await validateElimEntries(teElimEntries as elimEntryType[]); // need to use await! or else returns a promise
    if (validElimEntries.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const validTeElimEntries: tmntEntryElimEntryType[] = [];    
    validElimEntries.elimEntries.forEach((elimEntry) => {
      const foundElimEntry = teElimEntries.find((e) => e.elim_id === elimEntry.elim_id && e.player_id === elimEntry.player_id);
      if (foundElimEntry) {
        const vteElimEntry = {
          ...elimEntry,
          eType: foundElimEntry.eType,
        }
        validTeElimEntries.push(vteElimEntry);
      }
    })

    if (validTeElimEntries.length === 0) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const elimEntriesToUpdate = validTeElimEntries.filter((elimEntry) => elimEntry.eType === "u");
    const updateManySQL = (elimEntriesToUpdate.length > 0)
      ? getUpdateManySQL(elimEntriesToUpdate)
      : "";
    
    const elimEntriesToInsert = validTeElimEntries.filter((elimEntry) => elimEntry.eType === "i");
    const insertManySQL = (elimEntriesToInsert.length > 0)
      ? getInsertManySQL(elimEntriesToInsert)
      : "";
    
    const elimEntriesToDelete = validTeElimEntries.filter((elimEntry) => elimEntry.eType === "d");
    const deleteManySQL = (elimEntriesToDelete.length > 0)
      ? getDeleteManySQL(elimEntriesToDelete)
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
      { error: "error updating many elimEntries" },
      { status: errStatus }
    );
  }    
}