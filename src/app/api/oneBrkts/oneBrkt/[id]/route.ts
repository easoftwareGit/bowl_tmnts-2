import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { getErrorStatus } from "@/app/api/errCodes";

// routes /api/oneBrkts/oneBrkt/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "obk")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const oneBrkt = await prisma.one_Brkt.findUnique({
      where: {
        id: id,
      },
    });
    if (!oneBrkt) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ oneBrkt }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting oneBrkt" }, { status: 500 });
  }  
}

export async function DELETE(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "obk")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const result = await prisma.one_Brkt.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting oneBrkt" },
      { status: errStatus }
    );    
  }
}