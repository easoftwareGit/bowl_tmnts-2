import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation";
import { calcFSA } from "@/lib/currency/fsa";

// routes /api/brkts/squad/:squadId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if id is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const prismaBrkts = await prisma.brkt.findMany({
      where: {
        squad_id: squadId,
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
      { error: "error getting brkts for squad" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ squadId: string }> }
) {
  try {
    const { squadId } = await params;    
    // check if squadId is a valid squad id
    if (!isValidBtDbId(squadId, "sqd")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const result = await prisma.brkt.deleteMany({
      where: {
        squad_id: squadId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "error deleting brkts for squad" },
      { status: 500 }   
    );
  }
}