import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import {
  allEventMoneyValid,
  sanitizeEvent,
  validateEvent,
} from "@/lib/validation/events/validate";
import type { eventType } from "@/lib/types/types";
import { initEvent, blankEvent } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/events/event/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const event = await prisma.event.findUnique({
      where: {
        id: id,
      },
    });
    if (!event) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting event");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
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

    // NO lpox in data object
    const event = await prisma.event.update({
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
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error updating event");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeEvent: eventType = {
      ...initEvent,
      id,
      tmnt_id: "tmt_00000000000000000000000000000000",
      event_name: "Fake Event",
      team_size: 1,
      games: 6,
      added_money: "0",
      entry_fee: "10",
      lineage: "1",
      prize_fund: "4",
      other: "2",
      expenses: "3",
      lpox: "10",
      sort_order: 1,
    };

    // const currentEvent = await prisma.event.findUnique({
    //   where: {
    //     id: id,
    //   },
    // });
    // if (!currentEvent) {
    //   return NextResponse.json({ error: "not found" }, { status: 404 });
    // }

    // currentEvent money values are deimals, so convert to strings
    const toCheck: eventType = {
      ...initEvent,
      id: fakeEvent.id,
      tmnt_id: fakeEvent.tmnt_id,
      event_name: fakeEvent.event_name,
      team_size: fakeEvent.team_size,
      games: fakeEvent.games,
      added_money: fakeEvent.added_money,
      entry_fee: fakeEvent.entry_fee,
      lineage: fakeEvent.lineage,
      prize_fund: fakeEvent.prize_fund,
      other: fakeEvent.other,
      expenses: fakeEvent.expenses,
      lpox: fakeEvent.entry_fee,
      sort_order: fakeEvent.sort_order,
    };

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
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
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    // if (!allEventMoneyValid(toCheck)) {
    //   return NextResponse.json({ error: "invalid data" }, { status: 422 });
    // }
    const toBePatched = sanitizeEvent(toCheck);
    let errCode = validateEvent(toBePatched);
    if (
      errCode === ErrorCode.NONE &&
      jsonProps.includes("added_money") &&
      toBePatched.added_money === ""
    ) {
      errCode = ErrorCode.MISSING_DATA;
    }
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
      ...blankEvent,
      entry_fee: undefined as any,
      lineage: undefined as any,
      prize_fund: undefined as any,
      expenses: undefined as any,
      other: undefined as any,
      lpox: undefined as any,
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
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    } else {
      toPatch.sort_order = undefined as any;
    }

    const event = await prisma.event.update({
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
    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching event");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "evt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.event.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting event");
  }
}
