import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { divPfDataForPrisma } from "../../divPfsDataForPrisma";
import { divPfDataType, divPfType, validDivPfsType } from "@/lib/types/types";
import { isDivPfSaveDataType, validateDivPfs } from "@/lib/validation/divPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

// routes /api/divPfs/tmnt/:tmntId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const {tmntId} = await params;
    // check if tmntId is a valid div id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const divPfs = await prisma.div_PF.findMany({
      where: {
        div: {
          tmnt_id: tmntId,
        },
      },
      orderBy: [
        { div_id: "asc" },
        { position: "asc" },
      ],
    });

    return NextResponse.json({ divPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting divPfs for tournament");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> },
) {
  try {
    const { tmntId } = await params;

    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    // get the data to save
    const passedDivPfData: unknown = await request.json();
    // make sure data is in correct format
    if (!isDivPfSaveDataType(passedDivPfData)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    const passedDivPfs: divPfType[] = passedDivPfData.divPfData;
    const divIds: string[] = passedDivPfData.divIds;

    // validate the data
    let validDivPfs: validDivPfsType = { divPfs: [], errorCode: ErrorCode.NONE };
    // empty divPfs is OK
    if (passedDivPfs.length > 0) {
      validDivPfs = validateDivPfs(passedDivPfs, divIds);
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

    // convert to prisma format
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
          div: {
            tmnt_id: tmntId,
          },
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
    return standardCatchReturn(error, "error replacing divPfs for tournament");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ tmntId: string }> },
) {
  try {
    const { tmntId } = await params;

    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.div_PF.deleteMany({
      where: {
        div: {
          tmnt_id: tmntId,
        },
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting divPfs for tournament");
  }
}
