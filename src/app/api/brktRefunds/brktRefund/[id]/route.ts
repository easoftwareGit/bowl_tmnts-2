import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initBrktRefund } from "@/lib/db/initVals";
import { brktRefundType } from "@/lib/types/types";
import { sanitizeBrktRefund, validateBrktRefund } from "../../validate";

// routes /api/brktRefunds/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "brf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktRefund = await prisma.brkt_Refund.findUnique({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_refunds: true,
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "brf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { brkt_id, player_id, num_refunds } = await request.json()
    const toCheck: brktRefundType = {
      ...initBrktRefund,
      id,
      brkt_id,
      player_id,
      num_refunds,
    };

    const toPut = sanitizeBrktRefund(toCheck);
    const errCode = validateBrktRefund(toPut);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
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
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const brktRefund = await prisma.brkt_Refund.update({
      where: {
        id: id,
      },
      data: {        
        brkt_id: toPut.brkt_id,
        player_id: toPut.player_id,
        num_refunds: toPut.num_refunds,        
      },
    });

    return NextResponse.json({ brktRefund }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003":   // parent not found
        errStatus = 404;
        break;
      case "P2025":   // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error putting brktRefund" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "brf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentBrktRefund = await prisma.brkt_Refund.findUnique({
      select: {
        id: true,
        brkt_id: true,
        player_id: true,
        num_refunds: true,        
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
    if (!currentBrktRefund) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: brktRefundType = {
      ...initBrktRefund,         
      brkt_id: currentBrktRefund.brkt_id,
      player_id: currentBrktRefund.player_id,
      num_refunds: currentBrktRefund.num_refunds,
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
    if (jsonProps.includes("num_refunds")) {
      toCheck.num_refunds = json.num_refunds;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ brktRefund: currentBrktRefund }, { status: 200 });
    }
    const toBePatched = sanitizeBrktRefund(toCheck);
    const errCode = validateBrktRefund(toBePatched);
    if (errCode !== ErrorCode.None) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.InvalidData:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...initBrktRefund,      
    }
    if (jsonProps.includes("brkt_id")) {
      toPatch.brkt_id = toBePatched.brkt_id;
    }
    if (jsonProps.includes("player_id")) {    
      toPatch.player_id = toBePatched.player_id;  
    }
    if (jsonProps.includes("num_refunds")) {
      toPatch.num_refunds = toBePatched.num_refunds;
    }
        
    const brktRefund = await prisma.brkt_Refund.update({
      where: {
        id: id,
      },
      data: {             
        brkt_id: toPatch.brkt_id || undefined,
        player_id: toPatch.player_id || undefined,
        num_refunds: toPatch.num_refunds || undefined,        
      },
    });

    return NextResponse.json({ brktRefund }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003":   // parent not found
        errStatus = 404;
        break;
      case "P2025":   // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error patching brktRefund" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "brf")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.brkt_Refund.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (error: any) {
    let errStatus: number;
    switch (error.code) {
      case "P2003": // parent has child rows
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "Error deleting brktRefund" },
      { status: errStatus }
    );
  }
} 