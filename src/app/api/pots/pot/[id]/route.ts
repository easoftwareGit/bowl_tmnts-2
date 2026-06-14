import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePot, sanitizePot } from "../../../../../lib/validation/pots/validate";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { potType, potCategoriesTypes } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/pots/pot/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const pot = await prisma.pot.findUnique({
      where: {
        id: id,
      },
    });
    if (!pot) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ pot }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting pot");
  }
}

export async function PUT(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const { div_id, squad_id, pot_type, fee, sort_order } =
      await request.json();
    const toCheck: potType = {
      ...initPot,
      id,
      div_id,
      squad_id,
      pot_type,
      fee,
      sort_order,
    };

    const toPut = sanitizePot(toCheck);
    const errCode = validatePot(toPut);
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
    
    // NO hdcp_per_str in data object
    const pot = await prisma.pot.update({
      where: {
        id: id,
      },
      data: {
        div_id: toPut.div_id, 
        squad_id: toPut.squad_id, 
        pot_type: toPut.pot_type,
        fee: toPut.fee,        
        sort_order: toPut.sort_order,
      },
    });
    return NextResponse.json({ pot }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating pot");
  }
}

export async function PATCH(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakePot = {
      ...initPot,
      id,
      div_id: "div_00000000000000000000000000000000",
      squad_id: "sqd_00000000000000000000000000000000",
      pot_type: "Game" as potCategoriesTypes,
      fee: "1",
      sort_order: 1,
    }
    // populate toCheck with fake data 
    const toCheck: potType = {
      ...initPot,
      div_id: fakePot.div_id,
      squad_id: fakePot.squad_id,
      pot_type: fakePot.pot_type as potCategoriesTypes,
      fee: fakePot.fee,
      sort_order: fakePot.sort_order,
    };

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    // if (jsonProps.includes("div_id")) {
    //   toCheck.div_id = json.div_id;
    // }
    // if (jsonProps.includes("squad_id")) {
    //   toCheck.squad_id = json.squad_id;
    // }
    if (jsonProps.includes("pot_type")) {
      toCheck.pot_type = json.pot_type;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizePot(toCheck);
    const errCode = validatePot(toBePatched);
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
    
    const toPatch = {      
      pot_type: "" as potCategoriesTypes,
      fee: "",
      sort_order: null as number | null,
    };

    // if (jsonProps.includes("div_id")) {
    //   toPatch.div_id = toBePatched.div_id;
    // }
    // if (jsonProps.includes("squad_id")) {
    //   toPatch.squad_id = toBePatched.squad_id;
    // }
    if (jsonProps.includes("pot_type")) {
      toPatch.pot_type = toBePatched.pot_type;
    }
    if (jsonProps.includes("fee")) {
      toPatch.fee = toBePatched.fee;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    }

    const pot = await prisma.pot.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        // div_id: toPatch.div_id || undefined, // do not patch div_id
        // squad_id: toPatch.squad_id || undefined, // do not patch squad_id
        pot_type: toPatch.pot_type || undefined,
        fee: toPatch.fee || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    });
    return NextResponse.json({ pot }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching pot");
  }
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.pot.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting pot");
  }
}