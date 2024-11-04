import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { allEventMoneyValid, sanitizeEvent, validateEvent } from "@/app/api/events/validate";
import { eventType } from "@/lib/types/types";
import { initEvent } from "@/lib/db/initVals";

// routes /api/events/:id

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaEvent = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });
    if (!prismaEvent) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // add in lpox
    const event: eventType = {
      ...initEvent,
      id: prismaEvent.id,
      tmnt_id: prismaEvent.tmnt_id,
      event_name: prismaEvent.event_name,
      team_size: prismaEvent.team_size,
      games: prismaEvent.games,      
      added_money: prismaEvent.added_money + '',
      entry_fee: prismaEvent.entry_fee + '',
      lineage: prismaEvent.lineage + '',
      prize_fund: prismaEvent.prize_fund + '',
      other: prismaEvent.other + '',
      expenses: prismaEvent.expenses + '',      
      lpox: prismaEvent.entry_fee + '',
      sort_order: prismaEvent.sort_order,
    };
    return NextResponse.json({ event }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting event" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const {
      tmnt_id,
      event_name,
      team_size,
      games,
      added_money,
      entry_fee,
      lineage,
      prize_fund,
      other,
      expenses,
      lpox,
      sort_order,
    } = await request.json();
    const toCheck: eventType = {
      ...initEvent,
      tmnt_id,
      event_name,
      team_size,
      games,
      added_money,
      entry_fee,
      lineage,
      prize_fund,
      other,
      expenses,
      lpox,
      sort_order,
    };
    
    if (!allEventMoneyValid(toCheck)) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const toPut = sanitizeEvent(toCheck);
    const errCode = validateEvent(toPut);
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
    
    // NO lpox in data object
    const putEvent = await prisma.event.update({
      where: {
        id: id,
      },
      data: {
        // tmnt_id: toPut.tmnt_id, // dont update tmnt_id
        event_name: toPut.event_name,
        team_size: toPut.team_size,
        games: toPut.games,
        added_money: toPut.added_money,
        entry_fee: toPut.entry_fee,
        lineage: toPut.lineage,
        prize_fund: toPut.prize_fund,
        other: toPut.other,
        expenses: toPut.expenses,
        sort_order: toPut.sort_order,
      },
    });
    // add in lpox
    const event = {
      ...putEvent,
      lpox: putEvent.entry_fee,
    };
    return NextResponse.json({ event }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 404;
        break;
      case "P2003": // parent not found
        errStatus = 404;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error updating event" },
      { status: errStatus }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const currentEvent = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });
    if (!currentEvent) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    
    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);    
    // currentEvent money values are deimals, so convert to strings
    const toCheck: eventType = {
      ...initEvent,
      id: currentEvent.id,
      tmnt_id: currentEvent.tmnt_id,
      event_name: currentEvent.event_name,
      team_size: currentEvent.team_size,
      games: currentEvent.games,
      added_money: currentEvent.added_money + "",
      entry_fee: currentEvent.entry_fee + "",
      lineage: currentEvent.lineage + "",
      prize_fund: currentEvent.prize_fund + "",
      other: currentEvent.other + "",
      expenses: currentEvent.expenses + "",
      lpox: currentEvent.entry_fee + "",
      sort_order: currentEvent.sort_order,
    };

    let gotDataToPatch = false;
    if (jsonProps.includes("event_name")) {
      toCheck.event_name = json.event_name;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("team_size")) {
      toCheck.team_size = json.team_size;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("added_money")) {
      toCheck.added_money = json.added_money;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("entry_fee")) {
      toCheck.entry_fee = json.entry_fee;
      toCheck.lpox = json.entry_fee;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("lineage")) {
      toCheck.lineage = json.lineage;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("prize_fund")) {
      toCheck.prize_fund = json.prize_fund;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("other")) {
      toCheck.other = json.other;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("expenses")) {
      toCheck.expenses = json.expenses;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("lpox")) {
      toCheck.lpox = json.lpox;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }

    if (!gotDataToPatch) {
      return NextResponse.json({ event: currentEvent }, { status: 200 });
    }
    if (!allEventMoneyValid(toCheck)) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const toBePatched = sanitizeEvent(toCheck);
    const errCode = validateEvent(toBePatched);
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
      ...initEvent,
      tmnt_id: "",
    };
    if (jsonProps.includes("event_name")) {
      toPatch.event_name = toBePatched.event_name;
    }
    // if(jsonProps.includes("tmnt_id")) {
    //   toPatch.tmnt_id = toBePatched.tmnt_id;
    // }
    if (jsonProps.includes("team_size")) {
      toPatch.team_size = toBePatched.team_size;
    } else {
      toPatch.team_size = undefined as any;
    }
    if (jsonProps.includes("games")) {
      toPatch.games = toBePatched.games;
    } else {
      toPatch.games = undefined as any;
    }
    if (jsonProps.includes("added_money")) {
      toPatch.added_money = toBePatched.added_money;
    }
    if (jsonProps.includes("entry_fee")) {
      // DO NOT add lpox
      toPatch.entry_fee = toBePatched.entry_fee;
    }
    if (jsonProps.includes("lineage")) {
      toPatch.lineage = toBePatched.lineage;
    }
    if (jsonProps.includes("prize_fund")) {
      toPatch.prize_fund = toBePatched.prize_fund;
    }
    if (jsonProps.includes("other")) {
      toPatch.other = toBePatched.other;
    }
    if (jsonProps.includes("expenses")) {
      toPatch.expenses = toBePatched.expenses;
    }
    if (jsonProps.includes("lpox")) {
      toPatch.lpox = toBePatched.lpox;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    } else {
      toPatch.sort_order = undefined as any;
    }

    const patchEvent = await prisma.event.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        // tmnt_id: toPatch.tmnt_id || undefined, // dont patch tmnt id
        event_name: toPatch.event_name || undefined,
        team_size: toPatch.team_size || undefined,
        games: toPatch.games || undefined,
        added_money: toPatch.added_money || undefined,
        entry_fee: toPatch.entry_fee || undefined,
        lineage: toPatch.lineage || undefined,
        prize_fund: toPatch.prize_fund || undefined,
        other: toPatch.other || undefined,
        expenses: toPatch.expenses || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    });
    let event;
    // add in lpox if needed
    if (jsonProps.includes("entry_fee")) {
      event = {
        ...patchEvent,
        lpox: patchEvent.entry_fee,
      };
    } else {
      event = patchEvent;
    }
    return NextResponse.json({ event }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2002": // unique constraint
        errStatus = 422;
        break;
      case "P2003": // foreign key constraint
        errStatus = 422;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error patching event" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deletedEvent = await prisma.event.delete({
      where: {
        id: id,
      },
    });
    // add in lpox
    const deleted = {
      ...deletedEvent,
      lpox: deletedEvent.entry_fee,
    };
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    let errStatus: number;
    switch (err.code) {
      case "P2003": // parent has child rows
        errStatus = 409;
        break;
      case "P2025": // record not found
        errStatus = 404;
        break;
      default:
        errStatus = 500;
        break;
    }
    return NextResponse.json(
      { error: "error deleting event" },
      { status: errStatus }
    );
  }
}
