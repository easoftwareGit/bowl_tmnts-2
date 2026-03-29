import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

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
    const brkts = await prisma.brkt.findMany({
      where: {
        div_id: divId,
      },
      orderBy:{
        sort_order: 'asc',
      }, 
    });
    // no matching rows is ok
    return NextResponse.json({ brkts }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting brkts for div");
  }
}