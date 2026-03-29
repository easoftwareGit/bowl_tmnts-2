import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
  } catch (error) {
    return standardCatchReturn(error, "error getting oneBrkt");
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
  } catch (error) {
    return standardCatchReturn(error, "error deleting oneBrkt");
  }
}