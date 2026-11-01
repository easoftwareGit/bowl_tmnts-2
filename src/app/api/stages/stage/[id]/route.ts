import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { fullStageType } from "@/lib/types/types";
import { initFullStage } from "@/lib/db/initVals";
import { sanitizeFullStage, validateFullStage } from "@/lib/validation/stages/validate";
import { standardCatchReturn } from "@/app/api/apiCatch";
import { SquadStage } from "@prisma/client";

// routes /api/stages/stage/:id

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) { 
  try {
    const { id } = await params;
    if (!isValidBtDbId(id, "stg")) {
      return NextResponse.json({ error: "invalid request" }, { status: 404 });
    }

    // fake data that will pass sanitation and validation
    const fakeStage: fullStageType = {
      ...initFullStage,
      id,
      squad_id: "sqd_00000000000000000000000000000000",
      stage: SquadStage.DEFINE,
      stage_set_at: "2023-01-01T00:00:00.000Z",
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: "",
    }
    // populate toCheck with fake data
    const toCheck: fullStageType = {
      ...initFullStage, 
      id, 
      squad_id: fakeStage.squad_id, 
      stage: fakeStage.stage, 
      stage_set_at: fakeStage.stage_set_at, 
      scores_started_at: fakeStage.scores_started_at, 
      stage_override_enabled: fakeStage.stage_override_enabled, 
      stage_override_at: fakeStage.stage_override_at, 
      stage_override_reason: fakeStage.stage_override_reason, 
    }

    const json = await request.json();
    // populate toCheck with json
    const jsonProps = Object.getOwnPropertyNames(json);
    let gotDataToPatch = false;
    if (jsonProps.includes("stage")) {
      toCheck.stage = json.stage;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("stage_override_enabled")) {
      toCheck.stage_override_enabled = json.stage_override_enabled;
      gotDataToPatch = true;
    }
    if (jsonProps.includes("stage_override_reason")) {
      toCheck.stage_override_reason = json.stage_override_reason;
      gotDataToPatch = true;
    }

    const toBePatched = sanitizeFullStage(toCheck);

    // set date values AFTER sanitize and BEFORE validate 
    // also, do not set stage_override_reason here. it will checked in validate

    const stageDateStr = new Date().toISOString(); // app sets stage date 
    if (jsonProps.includes("stage")) {
      toBePatched.stage_set_at = stageDateStr;
      if (toBePatched.stage === SquadStage.SCORES) {
        toBePatched.scores_started_at = stageDateStr;
      }
      gotDataToPatch = true;
    }
    if (jsonProps.includes("stage_override_enabled")) {
      toBePatched.stage_override_at =
        (toBePatched.stage_override_enabled)
          ? stageDateStr
          : null;        
      gotDataToPatch = true;
    }    

    if (!gotDataToPatch) {
      return NextResponse.json({ error: "no data to patch" }, { status: 400 });
    }

    const errCode = validateFullStage(toBePatched);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          // if sanitize removed invalid stage data
				  if (toCheck.stage != null && toBePatched.stage == null) {
						errMsg = 'invalid data'
					} else {
						errMsg = 'missing data'
					}
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
    
    const toPatch: {
      stage?: SquadStage;
      stage_set_at?: Date;
      scores_started_at?: Date | null;
      stage_override_enabled?: boolean;
      stage_override_at?: Date | null;
      stage_override_reason?: string | null;
    } = {};

    // stage
    if (jsonProps.includes("stage")) {
      toPatch.stage = toBePatched.stage;
      toPatch.stage_set_at = new Date(toBePatched.stage_set_at);
      if (toBePatched.stage === SquadStage.SCORES) {
        toPatch.scores_started_at = new Date(stageDateStr);
      }
    }

    // override (server-owned timestamp)
    if (jsonProps.includes("stage_override_enabled")) {
      toPatch.stage_override_enabled = toBePatched.stage_override_enabled;

      if (toBePatched.stage_override_enabled) {
        toPatch.stage_override_at = new Date(stageDateStr);
        toPatch.stage_override_reason = toBePatched.stage_override_reason;
      } else {
        toPatch.stage_override_at = null; 
        toPatch.stage_override_reason = "";
      }
    }
    const stage = await prisma.stage.update({
      where: { id },      
      data: toPatch,
    });

    return NextResponse.json({ stage }, { status: 200 });
  } catch (error) {
    return standardCatchReturn(error, "error patching stage");
  }
}
