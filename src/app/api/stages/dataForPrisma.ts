import { fullStageDataType, fullStageType } from "@/lib/types/types";

/**
 * Converts a squad to squad data for prisma
 *
 * @param {squadType} fullStage - squad to convert
 * @returns {squadDataType | null} - squad data for prisma or null
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
