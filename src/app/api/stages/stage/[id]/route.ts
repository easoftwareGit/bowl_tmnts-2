import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { fullStageType } from "@/lib/types/types";
import { initFullStage } from "@/lib/db/initVals";
import { sanitizeFullStage, validateFullStage } from "@/lib/validation/stages/validate";
import { getErrorStatus } from "@/app/api/errCodes";
import { SquadStage } from "@prisma/client";

// routes /api/stages/stage/:id

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "stg")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }
    const stage = await prisma.stage.findUnique({
      where: {
        id: id,
      },
    });
    if (!stage) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ stage }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: "error getting stage" }, { status: 500 });
  }
}

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
    // set systen stage dates AFTER sanitize and BEFORE validation
    const stageDate = new Date(); // app sets stage date
    toPut.stage_set_at = stageDate;
    toPut.scores_started_at = (toPut.stage && toPut.stage === SquadStage.SCORES) ? stageDate : null;
    toPut.stage_override_at = (toPut.stage_override_enabled) ? stageDate : null;

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "stg")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    
    const currentStage = await prisma.stage.findUnique({
      where: {
        id: id,
      },
    });    
    if (!currentStage) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const toCheck: fullStageType = {
      ...initFullStage,
      squad_id: currentStage.squad_id,
      stage: currentStage.stage,
      stage_set_at: currentStage.stage_set_at!,
      scores_started_at: currentStage.scores_started_at!,
      stage_override_enabled: currentStage.stage_override_enabled,
      stage_override_at: currentStage.stage_override_at!,
      stage_override_reason: currentStage.stage_override_reason!,
    };

    if (jsonProps.includes("squad_id")) {
      toCheck.squad_id = json.squad_id;
    }
    if (jsonProps.includes("stage")) {
      toCheck.stage = json.stage;
    }
    if (jsonProps.includes("stage_override_enabled")) {
      toCheck.stage_override_enabled = json.stage_override_enabled;
    }
    if (jsonProps.includes("stage_override_reason")) {
      toCheck.stage_override_reason = json.stage_override_reason;
    }

    const toBePatched = sanitizeFullStage(toCheck);

    // set date values AFTER sanitize and BEFORE validate 
    // also, do not set stage_override_reason here. it will checked in validate

    const stageDate = new Date(); // app sets stage date 
    if (toBePatched.stage !== currentStage.stage) {
      toBePatched.stage_set_at = stageDate;
      if (toBePatched.stage === SquadStage.SCORES) {
        toBePatched.scores_started_at = stageDate;
      }
    }
    if (jsonProps.includes("stage_override_enabled")) {
      toBePatched.stage_override_at =
        (toBePatched.stage_override_enabled)
          ? stageDate
          : null;        
    }    

    const errCode = validateFullStage(toBePatched);
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
    
    const toPatch = {
      stage: null as SquadStage | null,
      stage_set_at: null as Date | null,
      scores_started_at: null as Date | null,
      stage_override_enabled: null as boolean | null,
      stage_override_at: null as Date | null,
      stage_override_reason: null as string | null,
    };    
    
    const data: {
      stage?: SquadStage;
      stage_set_at?: Date;
      scores_started_at?: Date | null;
      stage_override_enabled?: boolean;
      stage_override_at?: Date | null;
      stage_override_reason?: string | null;
    } = {};

    // stage
    if (jsonProps.includes("stage")) {
      data.stage = toBePatched.stage;
      data.stage_set_at = toBePatched.stage_set_at;
      if (toBePatched.stage === SquadStage.SCORES) {
        data.scores_started_at = stageDate;
      }
    }

    // override (server-owned timestamp)
    if (jsonProps.includes("stage_override_enabled")) {
      data.stage_override_enabled = toBePatched.stage_override_enabled;

      if (toBePatched.stage_override_enabled) {
        data.stage_override_at = stageDate;
        data.stage_override_reason = toBePatched.stage_override_reason;
      } else {
        data.stage_override_at = null; 
        data.stage_override_reason = "";
      }
    }
    const updatedStage = await prisma.stage.update({
      where: { id },      
      data,
    });

    return NextResponse.json({ stage: updatedStage }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error patching stage" },
      { status: errStatus }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "stg")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    const result = await prisma.stage.deleteMany({
      where: {
        id: id,
      },
    });
    return NextResponse.json({ count: result.count }, { status: 200 });
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error deleting stage" },
      { status: errStatus }
    );
  }
}
