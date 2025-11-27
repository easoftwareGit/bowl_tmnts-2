import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { initDivEntry } from "@/lib/db/initVals";
import { divEntryRawType, divEntryType } from "@/lib/types/types";
import { sanitizeDivEntry, validateDivEntry } from "../../validate";
import { divEntriesWithHdcp } from "../../calcHdcp";
import { getErrorStatus } from "@/app/api/errCodes";

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
    const divEntryNoHdcp = await prisma.div_Entry.findUnique({
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
    if (!divEntryNoHdcp) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    } 
    // convert fee to number
    const divEntriesNoHecp: divEntryRawType[] = [
      {
        ...divEntryNoHdcp,
        fee: divEntryNoHdcp.fee.toNumber(),
      }
    ];
    // calc hdcp
    const divEntries = divEntriesWithHdcp(divEntriesNoHecp);
    // get just 1st and only div entry
    const divEntry = divEntries[0];
    return NextResponse.json({ divEntry }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting divEntry" }, { status: 500 });
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error putting divEntry" },
      { status: errStatus }
    );
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error patching divEntry" },
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
    if (!isValidBtDbId(id, "den")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.div_Entry.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "Error deleting divEntry" },
      { status: errStatus }
    );
  }
}    