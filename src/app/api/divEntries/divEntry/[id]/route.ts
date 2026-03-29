import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { initDivEntry } from "@/lib/db/initVals";
import type { divEntryType } from "@/lib/types/types";
import { sanitizeDivEntry, validateDivEntry } from "../../../../../lib/validation/divEntries/validate";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/divEntries/divEntry/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "den")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divEntry = await prisma.div_Entry.findUnique({
      select: {
        id: true,
        squad_id: true,
        div_id: true,
        player_id: true,
        fee: true,
        player: {
          select: {
            average: true,
          },
        },
        div: {
          select: {
            hdcp_from: true,
            int_hdcp: true,
            hdcp_per: true,            
          },
        },        
      },      
      where: {
        id: id,
      },
    })
    if (!divEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    } 
    return NextResponse.json({ divEntry }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divEntry");    
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "den")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { squad_id, div_id, player_id, fee } = await request.json()
    const toCheck: divEntryType = {
      ...initDivEntry,
      squad_id,
      div_id,
      player_id,
      fee,
    };

    const toPut = sanitizeDivEntry(toCheck);
    const errCode = validateDivEntry(toPut);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    const divEntry = await prisma.div_Entry.update({
      where: {
        id: id,
      },
      data: {
        squad_id: toPut.squad_id,
        div_id: toPut.div_id,
        player_id: toPut.player_id,
        fee: toPut.fee,
      },
    });

    return NextResponse.json({ divEntry }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error putting divEntry");
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "den")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }  
    const currentDivEntry = await prisma.div_Entry.findUnique({
      where: { id: id },
    });
    if (!currentDivEntry) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    const toCheck: divEntryType = {
      ...initDivEntry,
      squad_id: currentDivEntry.squad_id,
      div_id: currentDivEntry.div_id,
      player_id: currentDivEntry.player_id,
      fee: currentDivEntry.fee + '',
    };    
    let gotDataToPatch = false;
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
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
      return NextResponse.json({ divEntry: currentDivEntry }, { status: 200 });
    }
    const toBePatched = sanitizeDivEntry(toCheck);
    const errCode = validateDivEntry(toBePatched);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...initDivEntry,      
    }
    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
    if (jsonProps.includes("div_id")) {
      toPatch.div_id = toBePatched.div_id;
    }
    if (jsonProps.includes("player_id")) {    
      toPatch.player_id = toBePatched.player_id;  
    }
    if (jsonProps.includes("fee")) {
      toPatch.fee = toBePatched.fee;
    }
    
    const divEntry = await prisma.div_Entry.update({
      where: {
        id: id,
      },
      data: {        
        squad_id: toPatch.squad_id || undefined,
        div_id: toPatch.div_id || undefined,
        player_id: toPatch.player_id || undefined,
        fee: toPatch.fee || undefined,
      },
    });

    return NextResponse.json({ divEntry }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching divEntry");
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "den")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.div_Entry.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting divEntry");
  }
}    