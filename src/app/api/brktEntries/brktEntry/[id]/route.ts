import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";
import { sanitizeBrktEntry, validateBrktEntry } from "../../validate";

// routes /api/brktEntries/brktEntry/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brktEntry = await prisma.brkt_Entry.findUnique({
      where: {
        id: id,
      },
    })
    if (!brktEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ brktEntry }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brktEntry" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { brkt_id, player_id, num_brackets, fee } = await request.json()
    const toCheck: brktEntryType = {
      ...initBrktEntry,      
      id,
      brkt_id,
      player_id,
      num_brackets,
      fee,
    };

    const toPut = sanitizeBrktEntry(toCheck);
    const errCode = validateBrktEntry(toPut);
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
    const brktEntry = await prisma.brkt_Entry.update({
      where: {
        id: id,
      },
      data: {        
        brkt_id: toPut.brkt_id,
        player_id: toPut.player_id,
        num_brackets: toPut.num_brackets,
        fee: toPut.fee,
      },
    });

    return NextResponse.json({ brktEntry }, { status: 200 });
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
      { error: "Error putting brktEntry" },
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
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentBrktEntry = await prisma.brkt_Entry.findUnique({
      where: { id: id },
    });
    if (!currentBrktEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: brktEntryType = {
      ...initBrktEntry,      
      brkt_id: currentBrktEntry.brkt_id,
      player_id: currentBrktEntry.player_id,
      num_brackets: currentBrktEntry.num_brackets,
      fee: currentBrktEntry.fee + '',
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
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ brktEntry: currentBrktEntry }, { status: 200 });
    }
    const toBePatched = sanitizeBrktEntry(toCheck);
    const errCode = validateBrktEntry(toBePatched);
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
    if (jsonProps.includes("fee")) {
      toPatch.fee = toBePatched.fee;
    }
    
    const brktEntry = await prisma.brkt_Entry.update({
      where: {
        id: id,
      },
      data: {             
        brkt_id: toPatch.brkt_id || undefined,
        player_id: toPatch.player_id || undefined,
        num_brackets: toPatch.num_brackets || undefined,
        fee: toPatch.fee || undefined,
      },
    });

    return NextResponse.json({ brktEntry }, { status: 200 });
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
      { error: "Error patching brktEntry" },
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
    if (!isValidBtDbId(id, "ben")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.brkt_Entry.delete({
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
      { error: "Error deleting brktEntry" },
      { status: errStatus }
    );
  }
}    