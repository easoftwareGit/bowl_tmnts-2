import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { calcFSA } from "@/lib/currency/fsa";

// routes /api/brkts/div/:divId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;    
    // check if id is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaBrkts = await prisma.brkt.findMany({
      where: {
        div_id: divId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });
    // add in fsa
    const brkts = prismaBrkts.map((brkt) => ({
      ...brkt,
      fsa: calcFSA(brkt.first, brkt.second, brkt.admin),
    }))
    // no matching rows is ok
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting brkts for div" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const { divId } = await params;    
    // check if id is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const deleted = await prisma.brkt.deleteMany({
      where: {
        div_id: divId,
      },
    });
    return NextResponse.json({ deleted }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brkts for div" },
      { status: 500 }
    );
  }
}

