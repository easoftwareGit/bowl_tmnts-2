import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation";
import { initPotEntry } from "@/lib/db/initVals";
import { potEntryType } from "@/lib/types/types";
import { sanitizePotEntry, validatePotEntry } from "../../validate";
import { validMoney } from "@/lib/currency/validate";

// routes /api/potEntries/potEntry/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "pen")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potEntry = await prisma.pot_Entry.findUnique({
      where: {
        id: id,
      },
    })
    if (!potEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ potEntry }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting potEntry" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "pen")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { pot_id, player_id, fee } = await request.json()
    const toCheck: potEntryType = {
      ...initPotEntry,      
      pot_id,
      player_id,
      fee,
    };

    const toPut = sanitizePotEntry(toCheck);
    const errCode = validatePotEntry(toPut);
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
    const potEntry = await prisma.pot_Entry.update({
      where: {
        id: id,
      },
      data: {        
        pot_id: toPut.pot_id,
        player_id: toPut.player_id,
        fee: toPut.fee,
      },
    });

    return NextResponse.json({ potEntry }, { status: 200 });
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
      { error: "Error putting potEntry" },
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
    if (!isValidBtDbId(id, "pen")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentPotEntry = await prisma.pot_Entry.findUnique({
      where: { id: id },
    });
    if (!currentPotEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: potEntryType = {
      ...initPotEntry,      
      pot_id: currentPotEntry.pot_id,
      player_id: currentPotEntry.player_id,
      fee: currentPotEntry.fee + '',
    };    
    let gotDataToPatch = false;
    if (jsonProps.includes("pot_id")) {
      toCheck.pot_id = json.pot_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("player_id")) {
      toCheck.player_id = json.player_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ potEntry: currentPotEntry }, { status: 200 });
    }
    const toBePatched = sanitizePotEntry(toCheck);
    const errCode = validatePotEntry(toBePatched);
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
      ...initPotEntry,      
    }
    if (jsonProps.includes("pot_id")) {
      toPatch.pot_id = toBePatched.pot_id;
    }
    if (jsonProps.includes("player_id")) {    
      toPatch.player_id = toBePatched.player_id;  
    }
    if (jsonProps.includes("fee")) {    
      toPatch.fee = toBePatched.fee;  
    }
    
    const potEntry = await prisma.pot_Entry.update({
      where: {
        id: id,
      },
      data: {        
        pot_id: toPatch.pot_id || undefined,
        player_id: toPatch.player_id || undefined,
        fee: toPatch.fee || undefined,
      },
    });

    return NextResponse.json({ potEntry }, { status: 200 });
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
      { error: "Error patching potEntry" },
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
    if (!isValidBtDbId(id, "pen")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.pot_Entry.delete({
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
      { error: "Error deleting potEntry" },
      { status: errStatus }
    );
  }
}    