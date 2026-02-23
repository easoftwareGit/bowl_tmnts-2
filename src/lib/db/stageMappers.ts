import type { fullStageType, fullStageDataType, prismaFullStageType } from "@/lib/types/types";
import { Stage } from "@prisma/client";

/**
 * Converts a prisma stage to a full stage
 * 
 * @param {Stage} pStage - stage to convert
 * @returns {fullStageType} - converted stage
 * @throws {Error} - if stage is missing stage_set_at 
 */
export const extractStageFromPrisma = (pStage: Stage): fullStageType => {

  if (!pStage.stage_set_at) {
    throw new Error("Stage missing stage_set_at");
  }

  return {
    id: pStage.id,
    squad_id: pStage.squad_id,
    stage: pStage.stage,
    stage_set_at: pStage.stage_set_at.toISOString(),
    scores_started_at: pStage.scores_started_at?.toISOString() ?? null,
    stage_override_enabled: pStage.stage_override_enabled,
    stage_override_at: pStage.stage_override_at?.toISOString() ?? null,
    stage_override_reason: pStage.stage_override_reason ?? "",
  };
};

/**
 * Converts a stage to stage data for prisma
 *
 * @param {fullStageType} fullStage - squad to convert
 * @returns {fullStageDataType | null} - squad data for prisma or null
 */
export const stageDataForPrisma = (fullStage: fullStageType): fullStageDataType | null => {
  if (fullStage == null) return null;
  try {    
    const stageSetAtDate = new Date(fullStage.stage_set_at);
    if (Number.isNaN(stageSetAtDate.getTime())) return null;
    const scoresStartedAtDate = fullStage.scores_started_at
      ? new Date(fullStage.scores_started_at)
      : null;
    const stageOverrideAtDate = fullStage.stage_override_at
      ? new Date(fullStage.stage_override_at)
      : null;    
    return {
      id: fullStage.id,
      squad_id: fullStage.squad_id,
      stage: fullStage.stage,
      stage_set_at: stageSetAtDate,
      scores_started_at: scoresStartedAtDate,
      stage_override_enabled: fullStage.stage_override_enabled,
      stage_override_at: stageOverrideAtDate,
      stage_override_reason: fullStage.stage_override_reason
    };
  } catch (error) {
    return null;
  }
};
