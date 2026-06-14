import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeElim, validateElim } from "@/lib/validation/elims/validate";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { getErrorStatus, standardCatchReturn } from "@/app/api/apiCatch";

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
  } catch (error) {
    return standardCatchReturn(error, "error getting elim");    
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
  } catch (error) {
    return standardCatchReturn(error, "error updating elim");
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

    // fake data that will pass sanitation and validation
    const fakeElim = {
      ...initElim,
      id,
      squad_id: "sqd_00000000000000000000000000000000",
      div_id: "div_00000000000000000000000000000000",
      sort_order: 1,
      start: 1,
      games: 3,
      fee: 10,      
    }

    const toCheck: elimType = {
      ...initElim,
      id, 
      div_id: fakeElim.div_id,
      squad_id: fakeElim.squad_id,
      fee: fakeElim.fee + "",
      start: fakeElim.start,
      games: fakeElim.games,
      sort_order: fakeElim.sort_order,
    };

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    // if (jsonProps.includes("div_id")) {
    //   toCheck.div_id = json.div_id;
    //   gotDataToPatch = true;
    // }
    // if (jsonProps.includes("squad_id")) {
    //   toCheck.squad_id = json.squad_id;
    //   gotDataToPatch = true;
    // }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("start")) {
      toCheck.start = json.start;
      gotDataToPatch = true;
    }    
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizeElim(toCheck);
    const errCode = validateElim(toBePatched);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
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
  } catch (error) {
    return standardCatchReturn(error, "error patching elim");
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
  } catch (error) {
    return standardCatchReturn(error, "error deleting elim");
  }
}
