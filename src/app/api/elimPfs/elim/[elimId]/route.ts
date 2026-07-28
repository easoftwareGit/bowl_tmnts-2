import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { elimPfDataForPrisma } from "../../elimPfsDataForPisma";
import { elimPfDataType, validElimPfsType } from "@/lib/types/types";
import { validateElimPfs } from "@/lib/validation/elimPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

// routes /api/elimPfs/elim/:elimId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ elimId: string }> }
) {
  try {
    const { elimId } = await params;    
    // check if elimId is a valid tmnt id
    if (!isValidBtDbId(elimId, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const elimPfs = await prisma.elim_PF.findMany({
      where: {
        elim_id: elimId, 
      },
      orderBy: [
        { elim_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ elimPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting elimPfs for tmnt");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ elimId: string }> },
) {
  try {
    const { elimId } = await params;

    if (!isValidBtDbId(elimId, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const passedElimPfs: elimPfDataType = await request.json();

    if (!Array.isArray(passedElimPfs)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    // just check first elim id. validateElimPfs will check the rest
    if (passedElimPfs.length > 0 && passedElimPfs[0].elim_id !== elimId) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }

    let validElimPfs: validElimPfsType = { elimPfs: [], errorCode: ErrorCode.NONE };
    // empty elimPfs is OK
    if (passedElimPfs.length > 0) {
      validElimPfs = validateElimPfs(passedElimPfs);
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
          elim_id: elimId,
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
  { params }: { params: Promise<{ elimId: string }> },
) {
  try {
    const { elimId } = await params;

    if (!isValidBtDbId(elimId, "elm")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.elim_PF.deleteMany({
      where: {
        elim_id: elimId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting elimPfs for elim");
  }
}
