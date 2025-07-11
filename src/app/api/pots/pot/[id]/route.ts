import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { validatePot, sanitizePot } from "../../validate";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { potType, potCategoriesTypes } from "@/lib/types/types";
import { initPot } from "@/lib/db/initVals";
import { getErrorStatus } from "@/app/api/errCodes";

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
  } catch (err: any) {
    return NextResponse.json({ error: "error getting pot" }, { status: 500 });
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating pot" },
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
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentPot = await prisma.pot.findUnique({
      where: {
        id: id,
      },
    });    

    if (!currentPot) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const toCheck: potType = {
      ...initPot,
      div_id: currentPot.div_id,
      squad_id: currentPot.squad_id,
      pot_type: currentPot.pot_type as potCategoriesTypes,
      fee: currentPot.fee + '',      
      sort_order: currentPot.sort_order,
    };

    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }
    if (jsonProps.includes("pot_type")) {
      toCheck.pot_type = json.pot_type;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
    }

    const toBePatched = sanitizePot(toCheck);
    const errCode = validatePot(toBePatched);
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
    
    const toPatch = {      
      div_id: "",
      squad_id: "",
      pot_type: "",
      fee: "",
      sort_order: null as number | null,
    };

    if (jsonProps.includes("div_id")) {
      toPatch.div_id = toBePatched.div_id;
    }
    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
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
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching pot" },
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
    if (!isValidBtDbId(id, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const deleted = await prisma.pot.delete({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting pot" },
      { status: errStatus }
    );    
  }
}