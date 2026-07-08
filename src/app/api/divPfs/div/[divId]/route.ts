import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { extractDivPfs } from "@/lib/db/divPfs/dbDivPfs";
import { divPfDataForPrisma } from "../../divPfsDataForPrisma";
import { divPfDataType, validDivPfsType } from "@/lib/types/types";
import { validateDivPfs } from "@/lib/validation/divPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

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

    const passedDivPfs: divPfDataType = await request.json();

    if (!Array.isArray(passedDivPfs)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    // just check first div id. validateDivPfs will check the rest
    if (passedDivPfs.length > 0 && passedDivPfs[0].div_id !== divId) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }

    let validDivPfs: validDivPfsType = { divPfs: [], errorCode: ErrorCode.NONE };
    // empty divPfs is OK
    if (passedDivPfs.length > 0) {
      validDivPfs = validateDivPfs(passedDivPfs);
    }    
    if (validDivPfs.errorCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (validDivPfs.errorCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;
        case ErrorCode.OTHER_ERROR:
          errMsg = 'other error'
          break;
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }    

    const divPfsToCreate = validDivPfs.divPfs
      .map((divPf) => divPfDataForPrisma(divPf));
    if (divPfsToCreate.some((row) => row === null)) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }
    const prismaDivPfs = divPfsToCreate as divPfDataType[];
    
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
        data: prismaDivPfs,
      });

      return created;
    });

    return NextResponse.json(
      { 
        message: "divPfs replaced",
        count: result.count,
        divPfs: prismaDivPfs,
      },
      { status: 200 },
    );
  } catch (error) {
    return standardCatchReturn(error, "error replacing divPfs for div");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ divId: string }> },
) {
  try {
    const { divId } = await params;

    if (!isValidBtDbId(divId, "div")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.div_PF.deleteMany({
      where: {
        div_id: divId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting divPfs for div");
  }
}
