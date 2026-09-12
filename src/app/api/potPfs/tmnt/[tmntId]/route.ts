import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { potPfDataForPrisma } from "../../potPfsDataForPisma";
import { potPfDataType, potPfType, validPotPfsType } from "@/lib/types/types";
import { isPotPfSaveDataType, validatePotPfs } from "@/lib/validation/potPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

// routes /api/potPfs/tmnt/:tmntId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ tmntId: string }> }
) {
  try {
    const {tmntId} = await params;
    // check if tmntId is a valid pot id
    if (!isValidBtDbId(tmntId, "tmt")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potPfs = await prisma.pot_PF.findMany({
      where: {
        pot: {
          div: {
            tmnt_id: tmntId,
          }
        },
      },
      orderBy: [
        { pot_id: "asc" },
        { position: "asc" },
      ],
    });

    return NextResponse.json({ potPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting potPfs for tournament");
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
    const passedPotPfData: unknown = await request.json();
    // make sure data is in correct format
    if (!isPotPfSaveDataType(passedPotPfData)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    const passedPotPfs: potPfType[] = passedPotPfData.potPfData;
    const potIds: string[] = passedPotPfData.potIds;

    // validate the data
    let validPotPfs: validPotPfsType = { potPfs: [], errorCode: ErrorCode.NONE };
    // empty potPfs is OK
    if (passedPotPfs.length > 0) {
      validPotPfs = validatePotPfs(passedPotPfs, potIds);
    }    
    if (validPotPfs.errorCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (validPotPfs.errorCode) {
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
    const potPfsToCreate = validPotPfs.potPfs
      .map((potPf) => potPfDataForPrisma(potPf));
    if (potPfsToCreate.some((row) => row === null)) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }
    const prismaPotPfs = potPfsToCreate as potPfDataType[];
    
    // 1) delete all potPfs for the tmnt
    // 2) create new potPfs for the tmnt
    const result = await prisma.$transaction(async (tx) => {

      // 1) delete all potPfs for the tmnt
      await tx.pot_PF.deleteMany({
        where: {
          pot: {
            div: {
              tmnt_id: tmntId,  
            }
          }        
        },
      });

      // 2) create new potPfs for the tmnt
      const created = await tx.pot_PF.createMany({
        data: prismaPotPfs,
      });

      return created;
    });

    return NextResponse.json(
      { 
        message: "potPfs replaced",
        count: result.count,
        potPfs: prismaPotPfs,
      },
      { status: 200 },
    );
  } catch (error) {
    return standardCatchReturn(error, "error replacing potPfs for tournament");
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

    const result = await prisma.pot_PF.deleteMany({
      where: {
        pot: {
          div: {
            tmnt_id: tmntId,
          }
        },
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting potPfs for tournament");
  }
}
