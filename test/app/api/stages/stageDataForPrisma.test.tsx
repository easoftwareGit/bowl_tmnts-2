import { fullStageType } from "@/lib/types/types";
import { mockFullTmntStage } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { stageDataForPrisma } from "@/app/api/stages/dataForPrisma";
import { cloneDeep } from "lodash";
import { SquadStage } from "@prisma/client";

describe('stageDataForPrisma function', () => {   
  it('should return a valid stage data for prisma', () => {
    const testStage: fullStageType = cloneDeep(mockFullTmntStage);  
    const result = stageDataForPrisma(testStage);      
    expect(result).toEqual({
      id: testStage.id,
      squad_id: testStage.squad_id,
      stage: testStage.stage,
      stage_set_at: testStage.stage_set_at,
      scores_started_at: testStage.scores_started_at,
      stage_override_enabled: testStage.stage_override_enabled,
      stage_override_at: testStage.stage_override_at,
      stage_override_reason: testStage.stage_override_reason
    });
  });
  it('should return a valid stage when all fields are valid', () => { 
    const testDateStr = "2025-09-01T00:00:00.000Z";
    const testStage: fullStageType = cloneDeep(mockFullTmntStage);  

    testStage.stage = SquadStage.SCORES;
    testStage.stage_set_at = new Date(testDateStr);
    testStage.scores_started_at = new Date(testDateStr);
    testStage.stage_override_enabled = true;
    testStage.stage_override_at = new Date(testDateStr);
    testStage.stage_override_reason = "test reason";

    const result = stageDataForPrisma(testStage);      
    expect(result).toEqual({
      id: testStage.id,
      squad_id: testStage.squad_id,
      stage: testStage.stage,
      stage_set_at: testStage.stage_set_at,
      scores_started_at: testStage.scores_started_at,
      stage_override_enabled: testStage.stage_override_enabled,
      stage_override_at: testStage.stage_override_at,
      stage_override_reason: testStage.stage_override_reason
    });
  })
  it('should return null if stage is null', () => {
    const result = stageDataForPrisma(null as any);
    expect(result).toBeNull();
  });
  it('should return null if stage_set_at date is invalid', () => { 
    const testStage: fullStageType = cloneDeep(mockFullTmntStage);    
    testStage.stage_set_at = new Date("invalid date");
    const result = stageDataForPrisma(testStage);      
    expect(result).toBeNull();
  })
})