import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/divPfs/divPf/:id

export async function GET(
  request: Request,
	{ params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "dpf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divPf = await prisma.div_PF.findUnique({
      where: {
        id: id,
      },
    });
    if (!divPf) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ divPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPf");
  }
}

// no individual updates or deletes
// div prizes are group updates
