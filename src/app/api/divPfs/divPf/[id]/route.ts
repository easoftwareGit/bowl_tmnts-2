import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId, validInteger } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { divPfType } from "@/lib/types/types";
import { blankDivPf, initDivPf } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { sanitizeDivPf, validateDivPf } from "@/lib/validation/divPfs/validate";
import { validBtdbMoney } from "@/lib/currency/validate";

// routes /api/divPfs/divPf/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "dpf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divPf = await prisma.div_PF.findUnique({
      where: {
        id: id,
      },
    });
    if (!divPf) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ divPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPf");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "dpf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { 
      div_id,
      position,
      amount,
    } = await request.json();
    const toCheck: divPfType = {
      ...initDivPf, 
      id, 
      div_id, 
      position,      
      amount, 
    }

    const toPut = sanitizeDivPf(toCheck);
    const errCode = validateDivPf(toPut);
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

    const divPf = await prisma.div_PF.update({
      where: {
        id: id,
      },
      data: {
        div_id: toPut.div_id,
        position: toPut.position as number,
        amount: toPut.amount as number,
      },
    })    
    return NextResponse.json({ divPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating divPf");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "dpf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeDivPf = {
      ...initDivPf,
      id,
      div_id: "div_00000000000000000000000000000000",
      position: 1,      
      amount: 0,
    }
    // populate toCheck with fake data 
    const toCheck: divPfType = {
      ...initDivPf, 
      id, 
      div_id: fakeDivPf.div_id, 
      position: fakeDivPf.position,
      amount: Number(fakeDivPf.amount), 
    }

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);    
    let gotDataToPatch = false;
    // if (jsonProps.includes("div_id")) {
    //   toCheck.div_id = json.div_id;
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
    
    const toBePatched = sanitizeDivPf(toCheck);
    const errCode = validateDivPf(toBePatched);
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
      ...blankDivPf,
    }
    // if (jsonProps.includes("div_id")) {
    //   toPatch.div_id = toBePatched.div_id;
    // }
    if (jsonProps.includes("position")) {
      toPatch.position = toBePatched.position;
    }
    if (jsonProps.includes("amount")) {
      toPatch.amount = toBePatched.amount;
    }
    const divPf = await prisma.div_PF.update({
      where: {
        id: id,
      },
      data: {
        // div_id: toPatch.div_id || undefined,
        position: toPatch.position || undefined,
        amount: toPatch.amount || undefined,
      },
    })    
    return NextResponse.json({ divPf }, { status: 200 });
  } catch (error: any) {
    return standardCatchReturn(error, "error patching divPf");    
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "dpf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.div_PF.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting divPf");
  }
}
