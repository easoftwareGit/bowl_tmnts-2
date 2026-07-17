import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId, validInteger } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { potPfType } from "@/lib/types/types";
import { blankPotPf, initPotPf } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { sanitizePotPf, validatePotPf } from "@/lib/validation/potPfs/validate";
import { validBtdbMoney } from "@/lib/currency/validate";

// routes /api/potPfs/potPf/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ppf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potPf = await prisma.pot_PF.findUnique({
      where: {
        id: id,
      },
    });
    if (!potPf) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ potPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting potPf");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ppf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { 
      pot_id,
      position,
      amount,
    } = await request.json();
    const toCheck: potPfType = {
      ...initPotPf, 
      id, 
      pot_id, 
      position,      
      amount, 
    }

    const toPut = sanitizePotPf(toCheck);
    const errCode = validatePotPf(toPut);
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

    const potPf = await prisma.pot_PF.update({
      where: {
        id: id,
      },
      data: {
        pot_id: toPut.pot_id,
        position: toPut.position as number,
        amount: toPut.amount as number,
      },
    })    
    return NextResponse.json({ potPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating potPf");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ppf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakePotPf = {
      ...initPotPf,
      id,
      pot_id: "pot_00000000000000000000000000000000",
      position: 1,      
      amount: 0,
    }
    // populate toCheck with fake data 
    const toCheck: potPfType = {
      ...initPotPf, 
      id, 
      pot_id: fakePotPf.pot_id, 
      position: fakePotPf.position,
      amount: Number(fakePotPf.amount), 
    }

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);    
    let gotDataToPatch = false;
    // if (jsonProps.includes("pot_id")) {
    //   toCheck.pot_id = json.pot_id;
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
    
    const toBePatched = sanitizePotPf(toCheck);
    const errCode = validatePotPf(toBePatched);
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
      ...blankPotPf,
    }
    // if (jsonProps.includes("pot_id")) {
    //   toPatch.pot_id = toBePatched.pot_id;
    // }
    if (jsonProps.includes("position")) {
      toPatch.position = toBePatched.position;
    }
    if (jsonProps.includes("amount")) {
      toPatch.amount = toBePatched.amount;
    }
    const potPf = await prisma.pot_PF.update({
      where: {
        id: id,
      },
      data: {
        // pot_id: toPatch.pot_id || undefined,
        position: toPatch.position || undefined,
        amount: toPatch.amount || undefined,
      },
    })    
    return NextResponse.json({ potPf }, { status: 200 });
  } catch (error: any) {
    return standardCatchReturn(error, "error patching potPf");    
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "ppf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.pot_PF.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting potPf");
  }
}
