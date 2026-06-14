import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBrkt, validateBrkt } from "../../../../../lib/validation/brkts/validate";
import type { brktType } from "@/lib/types/types";
import { blankBrkt, initBrkt } from "@/lib/db/initVals";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/brkts/brkt/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const brkt = await prisma.brkt.findUnique({
      where: {
        id: id,
      },
    });
    if (!brkt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ brkt }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brkt");    
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const {
      div_id,
      squad_id,
      fee,
      start,
      games,
      players,
      first,
      second,
      admin,
      fsa,
      sort_order,
    } = await request.json();
    const toCheck: brktType = {
      ...initBrkt,
      div_id,
      squad_id,
      fee,
      start,
      games,
      players,
      first,
      second,
      admin,
      fsa,
      sort_order,
    };

    const toPut = sanitizeBrkt(toCheck);
    const errCode = validateBrkt(toPut);
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

    // NO fsa in data object
    const brkt = await prisma.brkt.update({
      where: {
        id: id,
      },
      data: {
        div_id: toPut.div_id, 
        squad_id: toPut.squad_id, 
        fee: toPut.fee,
        start: toPut.start,
        games: toPut.games,
        players: toPut.players,
        first: toPut.first,
        second: toPut.second,
        admin: toPut.admin,        
        sort_order: toPut.sort_order,
      },
    });
    return NextResponse.json({ brkt }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error updating brkt");
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeBrkt = {
      ...initBrkt,      
      div_id: "div_00000000000000000000000000000000",
      squad_id: "sqd_00000000000000000000000000000000",
      fee: 5,
      start: 1,
      games: 3,
      players: 8,
      first: 25,
      second: 10,
      admin: 5,
    }
    // const currentBrkt = await prisma.brkt.findUnique({
    //   where: {
    //     id: id,
    //   },
    // });    

    // if (!currentBrkt) {
    //   return NextResponse.json({ error: "not found" }, { status: 404 });
    // }

    // populate toCheck with fake data
    const toCheck: brktType = {
      ...initBrkt,
      div_id: fakeBrkt.div_id,
      squad_id: fakeBrkt.squad_id,
      fee: fakeBrkt.fee + "",
      start: fakeBrkt.start,
      games: fakeBrkt.games,
      players: fakeBrkt.players,
      first: fakeBrkt.first + "",
      second: fakeBrkt.second + "",
      admin: fakeBrkt.admin + "",
      fsa: Number(fakeBrkt.first) + Number(fakeBrkt.second) + Number(fakeBrkt.admin) + '',
      sort_order: fakeBrkt.sort_order,
    };

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      toCheck.fsa = (json.fee * fakeBrkt.players) + "";
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
    if (jsonProps.includes("players")) {
      toCheck.players = json.players;      
      gotDataToPatch = true;
    }
    if (jsonProps.includes("first")) {
      toCheck.first = json.first;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("second")) {
      toCheck.second = json.second;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("admin")) {
      toCheck.admin = json.admin;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
      gotDataToPatch = true;
    }
    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const toBePatched = sanitizeBrkt(toCheck);
    const errCode = validateBrkt(toBePatched);
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
    
    const toPatch = {
      ...blankBrkt,
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
    if (jsonProps.includes("players")) {
      toPatch.players = toBePatched.players;
    } else {
      toPatch.players = undefined as any;
    }
    if (jsonProps.includes("first")) {
      toPatch.first = toBePatched.first;
    }
    if (jsonProps.includes("second")) {
      toPatch.second = toBePatched.second;
    }
    if (jsonProps.includes("admin")) {
      toPatch.admin = toBePatched.admin;
    }
    if (jsonProps.includes("sort_order")) {
      toPatch.sort_order = toBePatched.sort_order;
    } else {
      toPatch.sort_order = undefined as any;
    }

    const brkt = await prisma.brkt.update({
      where: {
        id: id,
      },
      // remove data if not sent
      data: {
        div_id: toPatch.div_id || undefined,
        squad_id: toPatch.squad_id || undefined, 
        fee: toPatch.fee || undefined,
        start: toPatch.start || undefined,
        games: toPatch.games || undefined,
        players: toPatch.players || undefined,
        first: toPatch.first || undefined,
        second: toPatch.second || undefined,
        admin: toPatch.admin || undefined,
        sort_order: toPatch.sort_order || undefined,
      },
    });
    return NextResponse.json({ brkt }, { status: 200 });    
  } catch (error) {
    return standardCatchReturn(error, "error patching brkt");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.brkt.deleteMany({
      where: {
        id: id,
      },
    });
    
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting brkt");
  }
}
