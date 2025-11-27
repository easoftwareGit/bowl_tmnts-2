import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { sanitizeBrkt, validateBrkt } from "../../validate";
import { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { calcFSA } from "@/lib/currency/fsa";
import { getErrorStatus } from "@/app/api/errCodes";

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
    const prismaBrkt = await prisma.brkt.findUnique({
      where: {
        id: id,
      },
    });
    if (!prismaBrkt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    // add in fsa
    const brkt = {
      ...prismaBrkt,
      fsa: calcFSA(prismaBrkt.first, prismaBrkt.second, prismaBrkt.admin),
    }
    return NextResponse.json({ brkt }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting brkt" }, { status: 500 });
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

    // NO fsa in data object
    const putBrkt = await prisma.brkt.update({
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
    // add in fsa
    const brkt = {
      ...putBrkt,
      fsa: calcFSA(putBrkt.first, putBrkt.second, putBrkt.admin),
    };
    return NextResponse.json({ brkt }, { status: 200 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error updating brkt" },
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
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentBrkt = await prisma.brkt.findUnique({
      where: {
        id: id,
      },
    });    

    if (!currentBrkt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: brktType = {
      ...initBrkt,
      div_id: currentBrkt.div_id,
      squad_id: currentBrkt.squad_id,
      fee: currentBrkt.fee + "",
      start: currentBrkt.start,
      games: currentBrkt.games,
      players: currentBrkt.players,
      first: currentBrkt.first + "",
      second: currentBrkt.second + "",
      admin: currentBrkt.admin + "",
      fsa: Number(currentBrkt.first) + Number(currentBrkt.second) + Number(currentBrkt.admin) + '',
      sort_order: currentBrkt.sort_order,
    };

    if (jsonProps.includes("div_id")) {
      toCheck.div_id = json.div_id;
    }
    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }
    if (jsonProps.includes("fee")) {
      toCheck.fee = json.fee;
      toCheck.fsa = (json.fee * currentBrkt.players) + "";
    }
    if (jsonProps.includes("start")) {
      toCheck.start = json.start;
    }    
    if (jsonProps.includes("games")) {
      toCheck.games = json.games;
    }
    if (jsonProps.includes("players")) {
      toCheck.players = json.players;      
    }
    if (jsonProps.includes("first")) {
      toCheck.first = json.first;
    }
    if (jsonProps.includes("second")) {
      toCheck.second = json.second;
    }
    if (jsonProps.includes("admin")) {
      toCheck.admin = json.admin;
    }
    if (jsonProps.includes("sort_order")) {
      toCheck.sort_order = json.sort_order;
    }

    const toBePatched = sanitizeBrkt(toCheck);
    const errCode = validateBrkt(toBePatched);
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
      ...initBrkt,
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

    const patchBrkt = await prisma.brkt.update({
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
    let brkt;
    // add in fsa if needed
    if (jsonProps.includes("fee") ||
        jsonProps.includes("first") ||
        jsonProps.includes("second") ||
        jsonProps.includes("admin")) {
      brkt = {
        ...patchBrkt,
        fsa: calcFSA(patchBrkt.first, patchBrkt.second, patchBrkt.admin),
      };
    } else {
      brkt = patchBrkt;
    }
    return NextResponse.json({ brkt }, { status: 200 });    
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching brkt" },
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
    if (!isValidBtDbId(id, "brk")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.brkt.deleteMany({
      where: {
        id: id,
      },
    });
    
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting brkt" },
      { status: errStatus }
    );
  }
}
