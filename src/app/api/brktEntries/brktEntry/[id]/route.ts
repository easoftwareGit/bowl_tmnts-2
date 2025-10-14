import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntriesFromPrisa, brktEntryType } from "@/lib/types/types";
import { sanitizeBrktEntry, validateBrktEntry } from "../../validate";
import { brktEntriesWithFee } from "../../feeCalc";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/brktEntries/brktEntry/:id

const getErrMsg = (errorCode: ErrorCode) => {
  let errMsg: string;
  switch (errorCode) {
    case ErrorCode.MissingData:
      errMsg = "missing data";
      break;
    case ErrorCode.InvalidData:
      errMsg = "invalid data";
      break;
    default:
      errMsg = "unknown error";
      break;
  }
  return errMsg;  
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktEntryNoFee = await prisma.brkt_Entry.findUnique({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_brackets: true,
        time_stamp: true,
        brkt_refunds: true,
        brkt: {
          select: {
            fee: true,
          },
        },
      },      
      where: {
        id: id,
      },
    })
    if (!brktEntryNoFee) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }   

    // get # of refunds and convert brkt.fee from decimal to number
    const brktEntriesNoFee: brktEntriesFromPrisa[] = [
      {
        ...brktEntryNoFee,
        num_refunds: brktEntryNoFee.brkt_refunds ? brktEntryNoFee.brkt_refunds.num_refunds : null as any,
        brkt: {
          ...brktEntryNoFee.brkt,
          fee: Number(brktEntryNoFee.brkt.fee),
        },
      }
    ];

    // calc player fee
    const brktEntries = brktEntriesWithFee(brktEntriesNoFee);
    // get just 1st and only brkt entry
    const brktEntry = brktEntries[0];
    return NextResponse.json({ brktEntry }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brktEntry" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { brkt_id, player_id, num_brackets, num_refunds, fee, time_stamp } = await request.json()
    const toCheck: brktEntryType = {
      ...initBrktEntry,      
      id,
      brkt_id,
      player_id,
      num_brackets,
      num_refunds, 
      fee,
      time_stamp,
    };
    
    const sanitizedObj = sanitizeBrktEntry(toCheck);
    if (sanitizedObj.errorCode !== ErrorCode.None) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    const toPut = sanitizedObj.brktEntry;
    const errCode = validateBrktEntry(toPut);
    if (errCode !== ErrorCode.None) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const existingBrktEntry = await prisma.brkt_Entry.findUnique({
      where: { id },
      include: { brkt_refunds: true },
    })

    if (!existingBrktEntry) {
      return NextResponse.json(
        { error: "error getting existing brktEntry" },
        { status: 404 }
      );
    }

    // DO NOT PUT FEE
    const updatedbrktEntry = await prisma.brkt_Entry.update({
      where: {
        id: id,
      },
      data: {        
        brkt_id: toPut.brkt_id,
        player_id: toPut.player_id,
        num_brackets: toPut.num_brackets,
        time_stamp: new Date(toPut.time_stamp)
      },
    });

    const oldNumRefunds = existingBrktEntry.brkt_refunds?.num_refunds ? existingBrktEntry.brkt_refunds.num_refunds : 0;
    const newNumRefunds = toPut.num_refunds != null ? toPut.num_refunds : 0;
    // if changed num_refunds
    if (newNumRefunds !== oldNumRefunds) { 
      // if now zero num refunds, delete row in num_refunds
      if (newNumRefunds === 0 && oldNumRefunds !== 0) {
        await prisma.brkt_Refund.delete({
          where: {
            brkt_entry_id: id,
          },
        });
      } else { // else update or insert num_refunds
        await prisma.brkt_Refund.upsert({
          where: {
            brkt_entry_id: id,
          },
          update: {
            num_refunds: newNumRefunds,
          },
          create: {
            brkt_entry_id: id,
            num_refunds: newNumRefunds,
          },
        });
      }
    }
    const brktEntry: brktEntryType = {
      ...initBrktEntry,
      id: updatedbrktEntry.id,
      brkt_id: updatedbrktEntry.brkt_id,
      player_id: updatedbrktEntry.player_id,
      num_brackets: updatedbrktEntry.num_brackets,
      num_refunds: newNumRefunds === 0 ? undefined as any : newNumRefunds,   
      time_stamp: updatedbrktEntry.time_stamp.getTime(),
    }

    return NextResponse.json({ brktEntry }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error putting brktEntry" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 1) get copy of data in database
  // 2) update data in copy with data from json
  // 3) sanitize and validate copy of data
  // 4) patch data in database

  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    // 1) get copy of data in database    
    const currentBrktEntryNoFee = await prisma.brkt_Entry.findUnique({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_brackets: true,
        brkt_refunds: true,
        time_stamp: true,
        brkt: {
          select: {
            fee: true,
          },
        },
      },      
      where: {
        id: id,
      },
    });
    if (!currentBrktEntryNoFee) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // convert brkt.fee to a number
    const currentBrktEntriesNoFee: brktEntriesFromPrisa[] = [
      {
        ...currentBrktEntryNoFee,
        num_refunds: currentBrktEntryNoFee.brkt_refunds ? currentBrktEntryNoFee.brkt_refunds.num_refunds : 0,
        brkt: {
          ...currentBrktEntryNoFee.brkt,
          fee: Number(currentBrktEntryNoFee.brkt.fee),
        },
      }
    ];
    // calc player fee
    const brktEntries = brktEntriesWithFee(currentBrktEntriesNoFee);
    // get just 1st and only brkt entry
    const currentBrktEntry = brktEntries[0];

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);

    // 2) update data in copy with data from json
    const toCheck: brktEntryType = {
      ...initBrktEntry,      
      brkt_id: currentBrktEntry.brkt_id,
      player_id: currentBrktEntry.player_id,
      num_brackets: currentBrktEntry.num_brackets,
      num_refunds: currentBrktEntry.num_refunds,
      fee: currentBrktEntry.fee + '',
      time_stamp: currentBrktEntry.time_stamp,
    };    
    let gotDataToPatch = false;
    if (jsonProps.includes("brkt_id")) {
      toCheck.brkt_id = json.brkt_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("player_id")) {
      toCheck.player_id = json.player_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("num_brackets")) {
      toCheck.num_brackets = json.num_brackets;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("num_refunds")) {
      toCheck.num_refunds = json.num_refunds;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("time_stamp")) {
      toCheck.time_stamp = json.time_stamp;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ brktEntry: currentBrktEntry }, { status: 200 });
    }
    // 3) sanitize and validate copy of data
    const sanitizedObj = sanitizeBrktEntry(toCheck);
    if (sanitizedObj.errorCode !== ErrorCode.None) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    const toBePatched = sanitizedObj.brktEntry
    const errCode = validateBrktEntry(toBePatched);    
    if (errCode !== ErrorCode.None) {
      const errMsg = getErrMsg(sanitizedObj.errorCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...initBrktEntry,      
    }
    if (jsonProps.includes("brkt_id")) {
      toPatch.brkt_id = toBePatched.brkt_id;
    }
    if (jsonProps.includes("player_id")) {    
      toPatch.player_id = toBePatched.player_id;  
    }
    if (jsonProps.includes("num_brackets")) {
      toPatch.num_brackets = toBePatched.num_brackets;
    }
    if (jsonProps.includes("num_refunds")) {
      toPatch.num_refunds = toBePatched.num_refunds;
    }
    if (jsonProps.includes("time_stamp")) {
      toPatch.time_stamp = toBePatched.time_stamp;
    }
    
    // 4) patch data in database
    // DO NOT PATCH FEE
    const brktEntryUpdate = await prisma.brkt_Entry.update({
      where: {
        id: id,
      },
      data: {             
        brkt_id: toPatch.brkt_id || undefined,
        player_id: toPatch.player_id || undefined,
        num_brackets: toPatch.num_brackets || undefined,
        time_stamp: new Date(toPatch.time_stamp) || undefined,
      },
    });

    // if changed num_refunds
    if ((jsonProps.includes("num_refunds")) && toBePatched.num_refunds !== currentBrktEntry.num_refunds) { 
      // if now zero num refunds, delete row in num_refunds
      if (toBePatched.num_refunds === 0 && currentBrktEntry.num_refunds !== 0) {
        await prisma.brkt_Refund.delete({
          where: {
            brkt_entry_id: id,
          },
        });
      } else { // else update or insert num_refunds
        await prisma.brkt_Refund.upsert({
          where: {
            brkt_entry_id: id,
          },
          update: {
            num_refunds: toBePatched.num_refunds,
          },
          create: {
            brkt_entry_id: id,
            num_refunds: toBePatched.num_refunds,
          },
        });
      }
    }
    const brktEntry: brktEntryType = {
      id: brktEntryUpdate.id,
      brkt_id: brktEntryUpdate.brkt_id,  
      player_id: brktEntryUpdate.player_id,
      num_brackets: brktEntryUpdate.num_brackets,  
      num_refunds: (toBePatched.num_refunds === 0 || toBePatched.num_refunds == null) ? undefined as any : toBePatched.num_refunds,
      fee: currentBrktEntry.fee + '',        
      time_stamp: brktEntryUpdate.time_stamp.getTime(),
    }    

    return NextResponse.json({ brktEntry }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error patching brktEntry" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.brkt_Entry.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting brktEntry" },
      { status: errStatus }
    );
  }
}    