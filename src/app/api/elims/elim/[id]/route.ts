import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeElim, validateElim } from "@/lib/validation/elims/validate";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/elims/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elim = await prisma.elim.findUnique({
      where: {
        id: id,
      },
    });
    if (!elim) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ elim }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json({ error: "error getting elim" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const {      
      div_id,
      squad_id,
      fee,
      start,
      games,
      sort_order,
    } = await request.json();
    const toCheck: elimType = {
      ...initElim,
      id,
      div_id,
      squad_id,
      fee,
      start,
      games,
      sort_order,
    };

    const toPut = sanitizeElim(toCheck);
    const errCode = validateElim(toPut);
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
        
    const elim = await prisma.elim.update({
      where: {
        id: id,
      },
      data: {
        div_id: toPut.div_id,
        squad_id: toPut.squad_id, 
        fee: toPut.fee,
        start: toPut.start,
        games: toPut.games,
        sort_order: toPut.sort_order,
      },
    });
    return NextResponse.json({ elim }, { status: 200 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating elim" },
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
    if (!isValidBtDbId(id, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentElim = await prisma.elim.findUnique({
      where: {
        id: id,
      },
    });    

    if (!currentElim) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: elimType = {
      ...initElim,
      div_id: currentElim.div_id,
      squad_id: currentElim.squad_id,
      fee: currentElim.fee + "",
      start: currentElim.start,
      games: currentElim.games,
      sort_order: currentElim.sort_order,
    };

    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
    }
    if (jsonProps.includes("start")) {
      toCheck.start = json.start;
    }    
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
    }

    const errCode = validateElim(toCheck);
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

    const toBePatched = sanitizeElim(toCheck);
    const toPatch = {
      ...initElim,
      div_id: "",
      squad_id: "",
    };
    if (jsonProps.includes("div_id")) {
      toPatch.div_id= toBePatched.div_id;
    }
    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
    if (jsonProps.includes("fee")) {      
      toPatch.fee = toBePatched.fee;     
    }
    if (jsonProps.includes("start")) {
      toPatch.start = toBePatched.start;
    } else {
      toPatch.start = undefined as any;
    }
    if (jsonProps.includes("games")) {
      toPatch.games = toBePatched.games;
    } else {
      toPatch.games = undefined as any;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    } else {
      toPatch.sort_order = undefined as any;
    }

    const elim = await prisma.elim.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        // div_id: toPatch.div_id || undefined, // do not patch div_id
        // squad_id: toPatch.squad_id || undefined, // do not patch squad_id
        fee: toPatch.fee || undefined,
        start: toPatch.start || undefined,
        games: toPatch.games || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    });
    return NextResponse.json({ elim }, { status: 200 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching elim" },
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
    if (!isValidBtDbId(id, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.elim.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting elim" },
      { status: errStatus }
    );
  }
}
