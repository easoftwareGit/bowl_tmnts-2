import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode } from "@/lib/validation";
import { brktRefundType, brktRefundDataType, tmntEntryBrktRefundType } from "@/lib/types/types";
import { validateBrktRefunds } from "../validate";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "./getSql";

// routes /api/brktRefunds/many 

export async function POST(request: NextRequest) {

  try {
    const brktRefunds: brktRefundType[] = await request.json();
    // sanitize and validate brktEntries
    const validBrktRefunds = await validateBrktRefunds(brktRefunds); // need to use await! or else returns a promise
    if (validBrktRefunds.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    // convert valid brktRefunds into brktRefundData to post
    const brktRefundsToPost: brktRefundDataType[] = []
    validBrktRefunds.brktRefunds.forEach(brktRefund => {
      brktRefundsToPost.push({
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,        
      })
    });      

    const manyBrktRefunds = await prisma.brkt_Refund.createManyAndReturn({
      data: [...brktRefundsToPost]
    })
    return NextResponse.json({brktRefunds: manyBrktRefunds}, { status: 201 });    
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
    const teBrktRefunds: tmntEntryBrktRefundType[] = await request.json();
    const validBrktRefunds = await validateBrktRefunds(teBrktRefunds as brktRefundType[]); // need to use await! or else returns a promise
    if (validBrktRefunds.errorCode !== ErrorCode.None) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }

    const validTeBrktRefunds: tmntEntryBrktRefundType[] = [];
    validBrktRefunds.brktRefunds.forEach((brktRefund) => {
      const foundBrktRefund = teBrktRefunds.find((b) => b.brkt_id === brktRefund.brkt_id && b.player_id === brktRefund.player_id);
      if (foundBrktRefund) {
        const vteBrktRefund = {
          ...brktRefund,
          eType: foundBrktRefund.eType,
        }
        validTeBrktRefunds.push(vteBrktRefund);
      }
    })

    if (validTeBrktRefunds.length === 0) {
      return NextResponse.json({ error: "no data" }, { status: 422 });
    }

    const brktRefundsToUpdate = validTeBrktRefunds.filter((brktRefund) => brktRefund.eType === "u");
    const updateManySQL = (brktRefundsToUpdate.length > 0)
      ? getUpdateManySQL(brktRefundsToUpdate)
      : "";
    
    const brktRefundsToInsert = validTeBrktRefunds.filter((brktRefund) => brktRefund.eType === "i");
    const insertManySQL = (brktRefundsToInsert.length > 0)
      ? getInsertManySQL(brktRefundsToInsert)
      : "";
    
    const brktRefundsToDelete = validTeBrktRefunds.filter((brktRefund) => brktRefund.eType === "d");
    const deleteManySQL = (brktRefundsToDelete.length > 0)
      ? getDeleteManySQL(brktRefundsToDelete)
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
      { error: "error updating many brktRefunds" },
      { status: errStatus }
    );
  }    
}