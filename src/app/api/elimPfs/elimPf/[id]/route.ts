import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/elimPfs/elimPf/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "epf")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimPf = await prisma.elim_PF.findUnique({
      where: {
        id: id,
      },
    });
    if (!elimPf) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ elimPf }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPf");
  }
}

// no individual updates or deletes
// div prizes are group updates
