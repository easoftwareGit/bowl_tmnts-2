import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { elimPfDataForPrisma } from "../../elimPfsDataForPisma";
import { elimPfDataType, elimPfType, validElimPfsType } from "@/lib/types/types";
import { isElimPfSaveDataType, validateElimPfs } from "@/lib/validation/elimPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

// routes /api/elimPfs/tmnt/:tmntId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const { tmntId } = await params;    
    // check if tmntId is a valid tmnt id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimPfs = await prisma.elim_PF.findMany({
      where: {
        elim: {
          div: {
            tmnt_id: tmntId,
          }
        },
      },
      orderBy: [
        { elim_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ elimPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPfs for tournament");
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
    const passedElimPfData: unknown = await request.json();
    // make sure data is in correct format
    if (!isElimPfSaveDataType(passedElimPfData)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    const passedElimPfs: elimPfType[] = passedElimPfData.elimPfData;
    const elimIds: string[] = passedElimPfData.elimIds;

    // valildate data
    let validElimPfs: validElimPfsType = { elimPfs: [], errorCode: ErrorCode.NONE };
    // empty elimPfs is OK
    if (passedElimPfs.length > 0) {
      validElimPfs = validateElimPfs(passedElimPfs, elimIds);
    }    
    if (validElimPfs.errorCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (validElimPfs.errorCode) {
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
    
    // convert data to prisma
    const elimPfsToCreate = validElimPfs.elimPfs
      .map((elimPf) => elimPfDataForPrisma(elimPf));
    if (elimPfsToCreate.some((row) => row === null)) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }
    const prismaElimPfs = elimPfsToCreate as elimPfDataType[];
    
    // 1) delete all elimPfs for the elims
    // 2) create new elimPfs for the elims
    const result = await prisma.$transaction(async (tx) => {

      // 1) delete all elimPfs for the elim
      await tx.elim_PF.deleteMany({
        where: {
          elim: {
            div: {
              tmnt_id: tmntId,  
            }
          }        
        },
      });

      // 2) create new elimPfs for the elim
      const created = await tx.elim_PF.createMany({
        data: prismaElimPfs,
      });

      return created;
    });

    return NextResponse.json(
      { 
        message: "elimPfs replaced",
        count: result.count,
        elimPfs: prismaElimPfs,
      },
      { status: 200 },
    );
  } catch (error) {
    return standardCatchReturn(error, "error replacing elimPfs for elim");
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

    const result = await prisma.elim_PF.deleteMany({
      where: {
        elim: {
          div: {
            tmnt_id: tmntId,
          }
        },
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting elimPfs for elim");
  }
}
