import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initElimEntry } from "@/lib/db/initVals";
import { elimEntryType } from "@/lib/types/types";
import { sanitizeElimEntry, validateElimEntry } from "../../validate";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/elimEntries/elimEntry/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "een")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimEntry = await prisma.elim_Entry.findUnique({
      where: {
        id: id,
      },
    })
    if (!elimEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }    
    return NextResponse.json({ elimEntry }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting elimEntry" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "een")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { elim_id, player_id, fee } = await request.json()
    const toCheck: elimEntryType = {
      ...initElimEntry,      
      id,
      elim_id,
      player_id,      
      fee,
    };

    const toPut = sanitizeElimEntry(toCheck);
    const errCode = validateElimEntry(toPut);
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
    const elimEntry = await prisma.elim_Entry.update({
      where: {
        id: id,
      },
      data: {        
        elim_id: toPut.elim_id,
        player_id: toPut.player_id,        
        fee: toPut.fee,
      },
    });

    return NextResponse.json({ elimEntry }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error putting elimEntry" },
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
    if (!isValidBtDbId(id, "een")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentElimEntry = await prisma.elim_Entry.findUnique({
      where: { id: id },
    });
    if (!currentElimEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: elimEntryType = {
      ...initElimEntry,      
      elim_id: currentElimEntry.elim_id,
      player_id: currentElimEntry.player_id,      
      fee: currentElimEntry.fee + '',
    };    
    let gotDataToPatch = false;
    if (jsonProps.includes("elim_id")) {
      toCheck.elim_id = json.elim_id;
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
      return NextResponse.json({ elimEntry: currentElimEntry }, { status: 200 });
    }
    const toBePatched = sanitizeElimEntry(toCheck);
    const errCode = validateElimEntry(toBePatched);
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
      ...initElimEntry,      
    }
    if (jsonProps.includes("elim_id")) {
      toPatch.elim_id = toBePatched.elim_id;
    }
    if (jsonProps.includes("player_id")) {    
      toPatch.player_id = toBePatched.player_id;  
    }
    if (jsonProps.includes("fee")) {
      toPatch.fee = toBePatched.fee;
    }
    
    const elimEntry = await prisma.elim_Entry.update({
      where: {
        id: id,
      },
      data: {             
        elim_id: toPatch.elim_id || undefined,
        player_id: toPatch.player_id || undefined,        
        fee: toPatch.fee || undefined,
      },
    });

    return NextResponse.json({ elimEntry }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error patching elimEntry" },
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
    if (!isValidBtDbId(id, "een")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const deleted = await prisma.elim_Entry.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting elimEntry" },
      { status: errStatus }
    );
  }
}    