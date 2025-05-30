import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktEntryType, brktEntryDataType, tmntEntryBrktEntryType } from "@/lib/types/types";
import { validateBrktEntries } from "../validate";
import { getDeleteManyRefundsSQL, getDeleteManySQL, getInsertManyRefundsSQL, getInsertManySQL, getUpdateManyRefundsSQL, getUpdateManySQL } from "./getSql";

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
        num_refunds: brktEntry.num_refunds,
        time_stamp: new Date(brktEntry.time_stamp), // Convert to Date object             
      })
    });      

    const createdBrktEntries = await prisma.$transaction(
      brktEntriesToPost.map(brktEntry =>
        prisma.brkt_Entry.create({
          data: {
            id: brktEntry.id,
            brkt_id: brktEntry.brkt_id,
            player_id: brktEntry.player_id,
            num_brackets: brktEntry.num_brackets,
            time_stamp: brktEntry.time_stamp,
            brkt_refunds: (brktEntry.num_refunds != null && brktEntry.num_refunds > 0)
              ? {
                create: {
                  num_refunds: brktEntry.num_refunds,
                }
              }
              : undefined,
          },
          include: { brkt_refunds: true },
        })
      )
    );

    const manyBrktEntries = createdBrktEntries.map((brktEntry) => {
      return {
        id: brktEntry.id,
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.brkt_refunds?.num_refunds,
        time_stamp: brktEntry.time_stamp,
      };
    });

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
    
    const brktEntriesToInsert = validTeBrktEntries.filter((brktEntry) => brktEntry.eType === "i");
    const insertManySQL = (brktEntriesToInsert.length > 0)
      ? getInsertManySQL(brktEntriesToInsert)
      : "";
    
    const brktEntriesToDelete = validTeBrktEntries.filter((brktEntry) => brktEntry.eType === "d");
    const deleteManySQL = (brktEntriesToDelete.length > 0)
      ? getDeleteManySQL(brktEntriesToDelete)
      : "";

    const updateIds = brktEntriesToUpdate.map(brktEntry => brktEntry.id)
    const insertIds = brktEntriesToInsert.map(brktEntry => brktEntry.id)
    const deleteIds = brktEntriesToDelete.map(brktEntry => brktEntry.id)
    
    const brktRefundIds = [...updateIds, ...insertIds, ...deleteIds];
    const curBrktEntries = await prisma.brkt_Entry.findMany({
      where: {
        id: { in: brktRefundIds },
      },
      include: { brkt_refunds: true },
    });

    const refundsToUpdate: brktEntryType[] = [];
    const refundsToInsert: brktEntryType[] = [];
    const refundsToDelete: brktEntryType[] = [];
    brktEntriesToUpdate.forEach((brktEntry) => { 
      const curBrktEntry = curBrktEntries.find((b) => b.id === brktEntry.id);
      if (brktEntry.num_refunds == null || brktEntry.num_refunds === 0) { 
        if (curBrktEntry 
          && curBrktEntry.brkt_refunds?.num_refunds != null
          && curBrktEntry.brkt_refunds?.num_refunds > 0
        ) {
          refundsToDelete.push(brktEntry);
        }
      } else if (brktEntry.num_refunds > 0) {       
        if (curBrktEntry) { 
          if (curBrktEntry.brkt_refunds?.num_refunds == null ||
            curBrktEntry.brkt_refunds?.num_refunds === 0)
          {
            refundsToInsert.push(brktEntry);      
          } else if (curBrktEntry.brkt_refunds?.num_refunds > 0 && 
            curBrktEntry.brkt_refunds?.num_refunds !== brktEntry.num_refunds) 
          {
            refundsToUpdate.push(brktEntry);            
          }
        }
      }
    })
    brktEntriesToInsert.forEach((brktEntry) => { 
      const curBrktEntry = curBrktEntries.find((b) => b.id === brktEntry.id);
      if (!curBrktEntry) { 
        refundsToInsert.push(brktEntry);
      }
    })
    brktEntriesToDelete.forEach((brktEntry) => { 
      const curBrktEntry = curBrktEntries.find((b) => b.id === brktEntry.id);
      if (curBrktEntry) { 
        refundsToDelete.push(brktEntry);
      }
    })

    const updateRefundsSQL = (refundsToUpdate.length > 0)
      ? getUpdateManyRefundsSQL(refundsToUpdate) 
      : "";
    const insertRefundsSQL = (refundsToInsert.length > 0)
      ? getInsertManyRefundsSQL(refundsToInsert)
      : "";
    const deleteRefundsSQL = (refundsToDelete.length > 0)
      ? getDeleteManyRefundsSQL(refundsToDelete)
      : "";

    const [updates, inserts, deletes, rfUpdates, rfInserts, rfDeletes] = await prisma.$transaction([
      prisma.$executeRawUnsafe(updateManySQL),
      prisma.$executeRawUnsafe(insertManySQL),
      prisma.$executeRawUnsafe(deleteManySQL),
      prisma.$executeRawUnsafe(updateRefundsSQL),
      prisma.$executeRawUnsafe(insertRefundsSQL),
      prisma.$executeRawUnsafe(deleteRefundsSQL),
    ])

    const updateInfo = {
      updates: updates,
      inserts: inserts,
      deletes: deletes,
      rfUpdates: rfUpdates,
      rfInserts: rfInserts,
      rfDeletes: rfDeletes,
    };    
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
      case 'P2010': // foreign key constraint failed
        errStatus = 409
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