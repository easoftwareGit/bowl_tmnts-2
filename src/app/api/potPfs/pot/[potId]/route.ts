import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { potPfDataForPrisma } from "../../potPfsDataForPisma";
import { potPfDataType, validPotPfsType } from "@/lib/types/types";
import { validatePotPfs } from "@/lib/validation/potPfs/validate";
import { ErrorCode } from "@/lib/enums/enums";

// routes /api/potPfs/pot/:potId

export async function GET(
  request: Request,  
  { params }: { params: Promise<{ potId: string }> }
) {
  try {
    const { potId } = await params;    
    // check if potId is a valid tmnt id
    if (!isValidBtDbId(potId, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    const potPfs = await prisma.pot_PF.findMany({
      where: {
        pot_id: potId, 
      },
      orderBy: [
        { pot_id: "asc" },
        { position: "asc" },
      ],
    });
    return NextResponse.json({ potPfs }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error getting potPfs for tmnt");
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ potId: string }> },
) {
  try {
    const { potId } = await params;

    if (!isValidBtDbId(potId, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const passedPotPfs: potPfDataType = await request.json();

    if (!Array.isArray(passedPotPfs)) {
      return NextResponse.json(
        { error: "invalid request" },
        { status: 400 },
      );
    }

    // just check first pot id. validatePotPfs will check the rest
    if (passedPotPfs.length > 0 && passedPotPfs[0].pot_id !== potId) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }

    let validPotPfs: validPotPfsType = { potPfs: [], errorCode: ErrorCode.NONE };
    // empty potPfs is OK
    if (passedPotPfs.length > 0) {
      validPotPfs = validatePotPfs(passedPotPfs);
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

    const potPfsToCreate = validPotPfs.potPfs
      .map((potPf) => potPfDataForPrisma(potPf));
    if (potPfsToCreate.some((row) => row === null)) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 },
      );
    }
    const prismaPotPfs = potPfsToCreate as potPfDataType[];
    
    // 1) delete all potPfs for the pots
    // 2) create new potPfs for the pots
    const result = await prisma.$transaction(async (tx) => {

      // 1) delete all potPfs for the pot
      await tx.pot_PF.deleteMany({
        where: {
          pot_id: potId,
        },
      });

      // 2) create new potPfs for the pot
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
    return standardCatchReturn(error, "error replacing potPfs for pot");
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ potId: string }> },
) {
  try {
    const { potId } = await params;

    if (!isValidBtDbId(potId, "pot")) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const result = await prisma.pot_PF.deleteMany({
      where: {
        pot_id: potId,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error deleting potPfs for pot");
  }
}
