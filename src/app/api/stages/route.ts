import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import type { fullStageType } from "@/lib/types/types";
import { initFullStage } from "@/lib/db/initVals";
import { sanitizeFullStage, validateFullStage } from "@/lib/validation/stages/validate";
import { ErrorCode } from "@/lib/enums/enums";
import { extractStageFromPrisma, stageDataForPrisma } from "../../../lib/db/stageMappers";
import { getErrorStatus } from "../errCodes";
import { SquadStage } from "@prisma/client";

// routes /api/stages

export async function GET(request: NextRequest) {
  try {
    const stages = await prisma.stage.findMany()    
    return NextResponse.json({ stages }, { status: 200 });    
  } catch (err: any) {
    return NextResponse.json(
      { error: "error getting stages" },
      { status: 500 }
    );        
  }
}

export async function POST(request: Request) {
  try {
    const {
      id,
      squad_id,
      stage,
      stage_set_at,
      scores_started_at,
      stage_override_enabled,
      stage_override_at,
      stage_override_reason,      
    } = await request.json()        
    
    const toCheck: fullStageType = {
      ...initFullStage,
      id,
      squad_id,
      stage,
      stage_set_at,
      scores_started_at,
      stage_override_enabled,
      stage_override_at,
      stage_override_reason,      
    }

    const toPost = sanitizeFullStage(toCheck); 
    
    // set systen stage dates AFTER sanitize and BEFORE validation
    const stageDateStr = new Date().toISOString(); // app sets stage date
    toPost.stage_set_at = stageDateStr;
    toPost.scores_started_at = (toPost.stage === SquadStage.SCORES) ? stageDateStr : null;
    toPost.stage_override_at = (toPost.stage_override_enabled) ? stageDateStr : null;

    const errCode = validateFullStage(toPost);
    if (errCode !== ErrorCode.NONE) {
      let errMsg: string;
      switch (errCode) {
        case ErrorCode.MISSING_DATA:
          errMsg = 'missing data'
          break;
        case ErrorCode.INVALID_DATA:
          errMsg = 'invalid data'
          break;        
        default:
          errMsg = 'unknown error'
          break;
      }
      return NextResponse.json(
        { error: errMsg },
        { status: 422 }
      );
    }
    
    try {
      const stageSetAtDate = new Date(toPost.stage_set_at)
      if (!stageSetAtDate) {
        return NextResponse.json({ error: "invalid data" }, { status: 422 });
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: "invalid data" },
        { status: 422 }
      );      
    }
    const stageData = stageDataForPrisma(toPost);
    if (!stageData) {
      return NextResponse.json({ error: "invalid data" }, { status: 422 });
    }
    const createdStage = await prisma.stage.create({
      data: stageData
    })
    return NextResponse.json({ stage: createdStage }, { status: 201 })        
  } catch (err: any) {
    const errStatus = getErrorStatus(err.code);
    return NextResponse.json(
      { error: "error posting stage" },
      { status: errStatus }
    );        
  }
}