import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { fullStageType } from "@/lib/types/types";
import { initFullStage } from "@/lib/db/initVals";
import { sanitizeFullStage, validateFullStage } from "@/lib/validation/stages/validate";
import { getErrorStatus } from "@/app/api/errCodes";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "stg")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const {
      squad_id,
      stage,
      stage_set_at,
      scores_started_at,
      stage_override_enabled,
      stage_override_at,
      stage_override_reason,
    } = await request.json();    

    const toCheck: fullStageType = {
      ...initFullStage,
      squad_id,
      stage,
      stage_set_at,
      scores_started_at,
      stage_override_enabled,
      stage_override_at,
      stage_override_reason,
    };

    const toPut = sanitizeFullStage(toCheck);
    const errCode = validateFullStage(toPut);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = "missing data";
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = "invalid data";
          break;
        default:
          errMsg = "unknown error";
          break;
      }
      return NextResponse.json({ error: errMsg }, { status: 422 });
    }
    
    const puttedStage = await prisma.stage.update({
      where: {
        id: id,
      },
      data: {
        // squad_id: toPut.event_id, // do not update squad_id
        stage: toPut.stage,
        stage_set_at: toPut.stage_set_at,
        scores_started_at: toPut.scores_started_at,
        stage_override_enabled: toPut.stage_override_enabled,
        stage_override_at: toPut.stage_override_at,
        stage_override_reason: toPut.stage_override_reason,
      },
    });
    return NextResponse.json({ stage: puttedStage }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error putting stage" },
      { status: errStatus }
    );
  }
}
