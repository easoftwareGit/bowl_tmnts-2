import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";

// routes /api/divPfs/div/:divId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ divId: string }> }
) {
  try {
    const {divId} = await params;
    // check if divId is a valid div id
    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divPfs = await prisma.div_PF.findMany({
      where: {
        div_id: divId,
      },
      orderBy: [
        { div_id: "asc" },
        { position: "asc" },
      ],
    });

    return NextResponse.json({ divPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPfs for div");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ divId: string }> },
) {
  try {
    const { divId } = await params;

    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const { divPfs } = await request.json();

    if (!Array.isArray(divPfs)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    const divPfsToCreate = divPfs.map((divPf) => ({
      ...divPf,
      div_id: divId,
    }));

    // 1) delete all divPfs for the div
    // 2) create new divPfs for the div
    const result = await prisma.$transaction(async (tx) => {

      // 1) delete all divPfs for the div
      await tx.div_PF.deleteMany({
        where: {
          div_id: divId,
        },
      });

      // 2) create new divPfs for the div
      const created = await tx.div_PF.createMany({
        data: divPfsToCreate,
      });

      return created;
    });

    return NextResponse.json(
      { 
        message: "divPfs replaced",
        count: result.count,
      },
      { status: 200 },
    );
  } catch (error) {
    return standardCatchReturn(error, "error replacing divPfs for div");
  }
}