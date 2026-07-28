import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId, validInteger } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { elimPfType } from "@/lib/types/types";
import { blankElimPf, initElimPf } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { sanitizeElimPf, validateElimPf } from "@/lib/validation/elimPfs/validate";
import { validBtdbMoney } from "@/lib/currency/validate";

// routes /api/elimPfs/elimPf/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "epf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimPf = await prisma.elim_PF.findUnique({
      where: {
        id: id,
      },
    });
    if (!elimPf) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ elimPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPf");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "epf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { 
      elim_id,
      position,
      amount,
    } = await request.json();
    const toCheck: elimPfType = {
      ...initElimPf, 
      id, 
      elim_id, 
      position,      
      amount, 
    }

    const toPut = sanitizeElimPf(toCheck);
    const errCode = validateElimPf(toPut);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;
        case ErrorCode.OTHER_ERROR:
          errMsg = 'other error'
          break;
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }    

    const elimPf = await prisma.elim_PF.update({
      where: {
        id: id,
      },
      data: {
        elim_id: toPut.elim_id,
        position: toPut.position as number,
        amount: toPut.amount as number,
      },
    })    
    return NextResponse.json({ elimPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating elimPf");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "epf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeElimPf = {
      ...initElimPf,
      id,
      elim_id: "elm_00000000000000000000000000000000",
      position: 1,      
      amount: 0,
    }
    // populate toCheck with fake data 
    const toCheck: elimPfType = {
      ...initElimPf, 
      id, 
      elim_id: fakeElimPf.elim_id, 
      position: fakeElimPf.position,
      amount: Number(fakeElimPf.amount), 
    }

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);    
    let gotDataToPatch = false;
    // if (jsonProps.includes("elim_id")) {
    //   toCheck.elim_id = json.elim_id;
    //   gotDataToPatch = true;
    // }
    if (jsonProps.includes("position")) {
      toCheck.position = validInteger(json.position) ? Number(json.position) : null as any;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("amount")) {
      toCheck.amount = validBtdbMoney(json.amount) ? Number(json.amount) : null as any;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }
    
    const toBePatched = sanitizeElimPf(toCheck);
    const errCode = validateElimPf(toBePatched);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;
        case ErrorCode.OTHER_ERROR:
          errMsg = 'other error'
          break;
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }

    const toPatch = {
      ...blankElimPf,
    }
    // if (jsonProps.includes("elim_id")) {
    //   toPatch.elim_id = toBePatched.elim_id;
    // }
    if (jsonProps.includes("position")) {
      toPatch.position = toBePatched.position;
    }
    if (jsonProps.includes("amount")) {
      toPatch.amount = toBePatched.amount;
    }
    const elimPf = await prisma.elim_PF.update({
      where: {
        id: id,
      },
      data: {
        // elim_id: toPatch.elim_id || undefined,
        position: toPatch.position || undefined,
        amount: toPatch.amount || undefined,
      },
    })    
    return NextResponse.json({ elimPf }, { status: 200 });
  } catch (error: any) {
    return standardCatchReturn(error, "error patching elimPf");    
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "epf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.elim_PF.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting elimPf");
  }
}
