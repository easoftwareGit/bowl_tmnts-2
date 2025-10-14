import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initBrktRefund } from "@/lib/db/initVals";
import { brktRefundType } from "@/lib/types/types";
import { sanitizeBrktRefund, validateBrktRefund } from "../../validate";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/brktRefunds/brktRefund/:id

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
    const brktRefund = await prisma.brkt_Refund.findUnique({
      select: {
        brkt_entry_id: true,
        num_refunds: true,
      },      
      where: {
        brkt_entry_id: id,
      },
    })
    if (!brktRefund) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }   

    return NextResponse.json({ brktRefund }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brktRefund" }, { status: 500 });
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

    const { brkt_entry_id, num_refunds } = await request.json()
    const toCheck: brktRefundType = {
      ...initBrktRefund,
      brkt_entry_id,
      num_refunds, 
    };
    
    const toPut = sanitizeBrktRefund(toCheck);
    const errCode = validateBrktRefund(toPut);
    if (errCode !== ErrorCode.None) {
      const errMsg = getErrMsg(errCode)
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const brktRefund = await prisma.brkt_Refund.update({
      where: {
        brkt_entry_id: id,
      },
      data: {
        brkt_entry_id: toPut.brkt_entry_id,
        num_refunds: toPut.num_refunds,
      },
    });

    return NextResponse.json({ brktRefund }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error putting brktRefund" },
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
    const currentBrktRefund = await prisma.brkt_Refund.findUnique({
      select: {
        brkt_entry_id: true,
        num_refunds: true,
      },      
      where: {
        brkt_entry_id: id,
      },
    });
    if (!currentBrktRefund) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);

    // 2) update data in copy with data from json
    const toCheck: brktRefundType = {
      ...initBrktRefund,      
      brkt_entry_id: currentBrktRefund.brkt_entry_id,      
      num_refunds: currentBrktRefund.num_refunds,
    };    
    let gotDataToPatch = false;
    if (jsonProps.includes("num_refunds")) {
      toCheck.num_refunds = json.num_refunds;
      gotDataToPatch = true;
    }         

    if (!gotDataToPatch) {
      return NextResponse.json({ currentBrktRefund }, { status: 200 });
    }
    // 3) sanitize and validate copy of data
    const toBePatched = sanitizeBrktRefund(toCheck);
    const errCode = validateBrktRefund(toBePatched);    
    if (errCode !== ErrorCode.None) {
      const errMsg = getErrMsg(errCode);
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...initBrktRefund,
    }
    if (jsonProps.includes("num_refunds")) {
      toPatch.num_refunds = toBePatched.num_refunds;
    }
    
    // 4) patch data in database
    // DO NOT PATCH FEE
    const brktEntryUpdate = await prisma.brkt_Refund.update({
      where: {
        brkt_entry_id: id,
      },
      data: {             
        num_refunds: toPatch.num_refunds || undefined,
      },
    });

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