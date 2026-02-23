import type { fullStageType, prismaFullStageType } from "@/lib/types/types";
import { mockFullTmntStage } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { extractStageFromPrisma, stageDataForPrisma } from "@/lib/db/stageMappers";
import { SquadStage, Stage } from "@prisma/client";
import { cloneDeep } from "lodash";

describe("stageMappers", () => { 

  describe("extractStageFromPrisma function", () => {
    it("should convert prisma Stage (Dates) to fullStageType (ISO strings)", () => {
      const stageSetAt = "2025-09-01T00:00:00.000Z";
      const scoresStartedAt = "2025-09-01T01:02:03.000Z";
      const overrideAt = "2025-09-02T03:04:05.000Z";

      const pStage: Stage = {
        id: "stg_123",
        squad_id: "sqd_456",
        stage: SquadStage.SCORES,
        stage_set_at: new Date(stageSetAt),
        scores_started_at: new Date(scoresStartedAt),
        stage_override_enabled: true,
        stage_override_at: new Date(overrideAt),
        stage_override_reason: "test reason",
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-02T00:00:00.000Z"),
      };

      const result = extractStageFromPrisma(pStage);

      expect(result).toEqual({
        id: pStage.id,
        squad_id: pStage.squad_id,
        stage: pStage.stage,
        stage_set_at: stageSetAt, // should be non-null
        scores_started_at: scoresStartedAt,
        stage_override_enabled: pStage.stage_override_enabled,
        stage_override_at: overrideAt,
        stage_override_reason: pStage.stage_override_reason,
      });

      // extra sanity: ensure output is strings (not Date objects)
      expect(typeof result.stage_set_at).toBe("string");
      expect(result.scores_started_at && typeof result.scores_started_at).toBe("string");
      expect(result.stage_override_at && typeof result.stage_override_at).toBe("string");
    });

    it("should set stage_override_reason to empty string when prisma value is null", () => {
      const pStage: Stage = {
        id: "stg_123",
        squad_id: "sqd_456",
        stage: SquadStage.DEFINE,
        stage_set_at: new Date("2025-09-01T00:00:00.000Z"),
        scores_started_at: null,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: '',
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-02T00:00:00.000Z"),
      };

      const result = extractStageFromPrisma(pStage);

      expect(result.stage_override_reason).toBe("");
      expect(result.scores_started_at).toBeNull();
      expect(result.stage_override_at).toBeNull();
    });

    it("should throw if stage_set_at is missing (null)", () => {
      const pStage: Stage = {
        id: "stg_123",
        squad_id: "sqd_456",
        stage: SquadStage.DEFINE,
        stage_set_at: null as any, // ← required by extractStageFromPrisma
        scores_started_at: null,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: '',
        createdAt: new Date("2025-01-01T00:00:00.000Z"),
        updatedAt: new Date("2025-01-02T00:00:00.000Z"),
      };

      expect(() => extractStageFromPrisma(pStage)).toThrow("Stage missing stage_set_at");
    });
  });

  describe('stageDataForPrisma function', () => {   
    it('should return a valid stage data for prisma', () => {
      const testStage: fullStageType = cloneDeep(mockFullTmntStage);  
      const result = stageDataForPrisma(testStage);      
      expect(result).toEqual({
        id: testStage.id,
        squad_id: testStage.squad_id,
        stage: testStage.stage,
        stage_set_at: new Date(testStage.stage_set_at),
        scores_started_at: testStage.scores_started_at,
        stage_override_enabled: testStage.stage_override_enabled,
        stage_override_at: testStage.stage_override_at,
        stage_override_reason: testStage.stage_override_reason
      });
    });
    it('should return a valid stage when all fields are valid', () => { 
      const testDateStr = "2025-09-01T00:00:00.000Z";
      const testDate = new Date(testDateStr);
      const testStage: fullStageType = cloneDeep(mockFullTmntStage);  

      testStage.stage = SquadStage.SCORES;
      testStage.stage_set_at = testDateStr;
      testStage.scores_started_at = testDateStr;
      testStage.stage_override_enabled = true;
      testStage.stage_override_at = testDateStr;
      testStage.stage_override_reason = "test reason";

      const result = stageDataForPrisma(testStage);      
      expect(result).toEqual({
        id: testStage.id,
        squad_id: testStage.squad_id,
        stage: testStage.stage,
        stage_set_at: testDate,
        scores_started_at: testDate,
        stage_override_enabled: testStage.stage_override_enabled,
        stage_override_at: testDate,
        stage_override_reason: testStage.stage_override_reason
      });
    })
    it('should return null if stage is null', () => {
      const result = stageDataForPrisma(null as any);
      expect(result).toBeNull();
    });
    it('should return null if stage_set_at date is invalid', () => { 
      const testStage: fullStageType = cloneDeep(mockFullTmntStage);    
      testStage.stage_set_at = "invalid date";
      const result = stageDataForPrisma(testStage);      
      expect(result).toBeNull();
    })
  })  


})
