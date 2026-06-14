import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { tmntMoneyType } from "@/lib/types/types";
import { blankTmntMoney, initTmntMoney } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { sanitizeTmntMoney, validateTmntMoney } from "@/lib/validation/moneys/validate";
import { validBtdbMoney } from "@/lib/currency/validate";
import { MoneyDescrip } from "@prisma/client";

// routes /api/moneys/money/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "mon")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const money = await prisma.money.findUnique({
      where: {
        id: id,
      },
    });
    if (!money) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ money }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting money");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "mon")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const { 
      event_id,
      squad_id,
      div_id,
      descrip,
      amount,
      sort_order,
      pot_id,
      brkt_id,
      elim_id
    } = await request.json();
    const toCheck: tmntMoneyType = {
      ...initTmntMoney, 
      id, 
      event_id, 
      squad_id, 
      div_id, 
      descrip,      
      amount, 
      sort_order, 
      pot_id, 
      brkt_id, 
      elim_id
    }

    const toPut = sanitizeTmntMoney(toCheck);
    const errCode = validateTmntMoney(toPut);
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

    const money = await prisma.money.update({
      where: {
        id: id,
      },
      data: {
        event_id: toPut.event_id,
        squad_id: toPut.squad_id,
        div_id: toPut.div_id,
        descrip: toPut.descrip,
        amount: toPut.amount as number,
        sort_order: toPut.sort_order,
        pot_id: toPut.pot_id,
        brkt_id: toPut.brkt_id,
        elim_id: toPut.elim_id,
      },
    })    
    return NextResponse.json({ money }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating money");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }   
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "mon")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeMoney = {
      ...initTmntMoney,
      id,
      event_id: "evt_00000000000000000000000000000000",
      squad_id: "sqd_00000000000000000000000000000000",
      div_id: "div_00000000000000000000000000000000",
      descrip: MoneyDescrip.OTHER,
      amount: 0,
      sort_order: 1,
      pot_id: null,
      brkt_id: null,
      elim_id: null,
    }
    // populate toCheck with fake data 
    const toCheck: tmntMoneyType = {
      ...initTmntMoney, 
      id, 
      event_id: fakeMoney.event_id, 
      squad_id: fakeMoney.squad_id, 
      div_id: fakeMoney.div_id, 
      descrip: fakeMoney.descrip,      
      amount: Number(fakeMoney.amount), 
      sort_order: fakeMoney.sort_order, 
      pot_id: fakeMoney.pot_id, 
      brkt_id: fakeMoney.brkt_id, 
      elim_id: fakeMoney.elim_id
    }

    const json = await request.json();
    // re-populate toCheck with json data, only for fields that are in json
    const jsonProps = Object.getOwnPropertyNames(json);    
    let gotDataToPatch = false;
    if (jsonProps.includes("event_id")) {
      toCheck.event_id = json.event_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("descrip")) {
      toCheck.descrip = json.descrip;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("amount")) {
      toCheck.amount = validBtdbMoney(json.amount) ? Number(json.amount) : null as any;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = validBtdbMoney(json.sort_order) ? Number(json.sort_order) : null as any;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("pot_id")) {
      toCheck.pot_id = json.pot_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("brkt_id")) {
      toCheck.brkt_id = json.brkt_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("elim_id")) {
      toCheck.elim_id = json.elim_id;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }
    
    const toBePatched = sanitizeTmntMoney(toCheck);
    const errCode = validateTmntMoney(toBePatched);
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
      ...blankTmntMoney,      
    }
    if (jsonProps.includes("event_id")) {
      toPatch.event_id = toBePatched.event_id;
    }
    if (jsonProps.includes("squad_id")) {
      toPatch.squad_id = toBePatched.squad_id;
    }
    if (jsonProps.includes("div_id")) {
      toPatch.div_id = toBePatched.div_id;
    }
    if (jsonProps.includes("descrip")) {
      toPatch.descrip = toBePatched.descrip;
    }
    if (jsonProps.includes("amount")) {
      toPatch.amount = toBePatched.amount;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    }
    if (jsonProps.includes("pot_id")) { 
      toPatch.pot_id = toBePatched.pot_id;
    }
    if (jsonProps.includes("brkt_id")) {
      toPatch.brkt_id = toBePatched.brkt_id;
    }
    if (jsonProps.includes("elim_id")) {
      toPatch.elim_id = toBePatched.elim_id;
    }
    const money = await prisma.money.update({
      where: {
        id: id,
      },
      data: {
        event_id: toPatch.event_id || undefined,
        squad_id: toPatch.squad_id || undefined,
        div_id: toPatch.div_id || undefined,
        descrip: toPatch.descrip || undefined,
        amount: toPatch.amount || undefined,
        pot_id: toPatch.pot_id || undefined,
        brkt_id: toPatch.brkt_id || undefined,
        elim_id: toPatch.elim_id || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    })    
    return NextResponse.json({ money }, { status: 200 });
  } catch (error: any) {
    return standardCatchReturn(error, "error patching money");    
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "mon")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.money.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting money");
  }
}