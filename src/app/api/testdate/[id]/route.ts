import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { testDateType } from "@/lib/types/types";
import { initTestDate } from "@/lib/db/initVals";
import { findTestDateById } from "@/lib/db/testDates";

// routes /api/testdate/:id

const validId = (id: number): boolean => {
  return !(isNaN(id) || !(Number.isInteger(id)) || id < 1 || id > Number.MAX_SAFE_INTEGER)
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idNum = Number(params.id);
    if (!validId(idNum)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const td = await prisma.testDate.findUnique({
      where: {
        id: idNum,
      },
    });
    if (!td) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ td }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json({ error: "error getting testDate" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const idNum = Number(params.id);
    if (!validId(idNum)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const {
      sod,
      eod,
      gmt,
    } = await request.json();
    const toCheck: testDateType = {
      ...initTestDate,
      sod,
      eod,
      gmt,
    };

    const toPut = toCheck;    
    const td = await prisma.testDate.update({
      where: {
        id: idNum,
      },
      data: {
        sod: toPut.sod,
        eod: toPut.eod,
        gmt: toPut.gmt,
      },
    });
    return NextResponse.json({ td }, { status: 200 });    
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
      { error: "error updating testDate" },
      { status: errStatus }
    );    
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) { 
  try {
    const idNum = Number(params.id);
    if (!validId(idNum)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);

    const currentTd = await findTestDateById(idNum);
    if (!currentTd) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: testDateType = {
      ...initTestDate,
      sod: currentTd.sod,
      eod: currentTd.eod,
      gmt: currentTd.gmt,
    };

    if (jsonProps.includes("sod")) {
      toCheck.sod = json.sod;
    }
    if (jsonProps.includes("eod")) {
      toCheck.eod = json.eod;
    }
    if (jsonProps.includes("gmt")) {
      toCheck.gmt = json.gmt;
    }

    const toBePatched = toCheck;
    // const blankPatch: testDateType = {
    //   ...initTestDate,
    //   sod: null as unknown as Date,
    //   eod: null as unknown as Date,
    //   gmt: null as unknown as Date,
    // }
    const toPatch = {
      ...initTestDate,
      sod: null as unknown as Date,
      eod: null as unknown as Date,
      gmt: null as unknown as Date,
    };
    if (jsonProps.includes("sod")) {
      toPatch.sod= toBePatched.sod;
    }
    if (jsonProps.includes("eod")) {
      toPatch.eod = toBePatched.eod;
    }
    if (jsonProps.includes("gmt")) {      
      toPatch.gmt = toBePatched.gmt;     
    }

    const td = await prisma.testDate.update({
      where: {
        id: idNum,
      },
      // remove data if not sent
      data: {
        sod: toPatch.sod || undefined,
        eod: toPatch.eod || undefined,
        gmt: toPatch.gmt || undefined,
      },
    });
    return NextResponse.json({ td }, { status: 200 });    
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
      { error: "error patching testDate" },
      { status: errStatus }
    );    
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const idNum = Number(params.id);
    if (!validId(idNum)) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.testDate.delete({
      where: {
        id: idNum,
      },
    });
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
      { error: "error deleting testDate" },
      { status: errStatus }
    );
  }
}