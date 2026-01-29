import { blankFullStage, blankJustStageOverride, initFullStage } from "@/lib/db/initVals";
import { fullStageType, justStageOverrideType, justStageType } from "@/lib/types/types";
import {
  validStageOverrideAt,
  validStageOverrideEnabled,
  validStageOverrideReason,
  validStageSetAt,
  validStageValue,
  validFullStageData,
  validJustStageData,
  validJustStageOverrideData,
  exportedForTesting,
  sanitizeFullStage,
  sanitizeJustStage,
  sanitizeJustStageOverride,
  validateFullStage,
  validateJustStage,
  isSquadStageOverrideType,
  isSquadStageType
} from "@/lib/validation/stages/validate";
import { ErrorCode, maxReasonLength } from "@/lib/validation/validation";
import { SquadStage } from "@prisma/client";

const stageId = "stg_c5f562c4c4304d919ac43fead73123e2";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const {
  gotFullStageData,
  gotJustStageData,
  gotJustStageOverrideData,
} = exportedForTesting;

const validFullStage: fullStageType = {
  ...initFullStage,
  id: stageId,
  squad_id: squadId,
  stage: SquadStage.DEFINE,
  stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
  scores_started_at: null,
  stage_override_enabled: false,
  stage_override_at: null,
  stage_override_reason: '',
};


describe("tests for stage validation", () => {

  describe("gotFullStageData function", () => {
    const baseStage: fullStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: '',      
    };

    it("should return ErrorCode.NONE when squadStage has required data (scores_started_at null allowed)", () => {
      expect(gotFullStageData(baseStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when input is null", () => {
      expect(gotFullStageData(null as any)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const testStage = { ...baseStage, id: "" };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage is missing", () => {
      const testStage = { ...baseStage, stage: null as any };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage_set_at is missing", () => {
      const testStage = { ...baseStage, stage_set_at: null as any };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage is SCORES and scores_started_at is missing", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: null,
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when stage is SCORES and scores_started_at is present", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: new Date("2025-01-02T12:34:56.000Z"),
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when stage is DEFINE and scores_started_at is undefined (not required by gotSquadData unless stage=SCORES)", () => {
      const testStage = { ...baseStage } as any;
      delete testStage.scores_started_at;
      expect(gotFullStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when stage_override_enabled is missing", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: null as any,
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and override_at is null", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: true,
        stage_override_at: null,
        stage_override_reason: "Testing",
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and reason is null", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: null as any,
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and reason is blank", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "   ",
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when override is enabled and override_at + reason are present", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "Testing",
      };
      expect(gotFullStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when override is disabled but override_at is not null", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: false,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "",
      };
      expect(gotFullStageData(testStage)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when override is disabled but reason is not blank", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "Should not be set",
      };
      expect(gotFullStageData(testStage)).toBe(
        ErrorCode.MISSING_DATA
      );
    });
  })

  describe("gotSquadStageData function", () => {
    const baseStage: justStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: null,
    };

    it("should return ErrorCode.NONE when squadStage has required data (scores_started_at null allowed)", () => {
      expect(gotJustStageData(baseStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when input is null", () => {
      expect(gotJustStageData(null as any)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const testStage = { ...baseStage, id: "" };
      expect(gotJustStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage is missing", () => {
      const testStage = { ...baseStage, stage: null as any };
      expect(gotJustStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage_set_at is missing", () => {
      const testStage = { ...baseStage, stage_set_at: null as any };
      expect(gotJustStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.MISSING_DATA when stage is SCORES and scores_started_at is missing", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: null,
      };
      expect(gotJustStageData(testStage)).toBe(ErrorCode.MISSING_DATA);
    });

    it("should return ErrorCode.NONE when stage is SCORES and scores_started_at is present", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: new Date("2025-01-02T12:34:56.000Z"),
      };
      expect(gotJustStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when stage is DEFINE and scores_started_at is undefined (not required by gotSquadData unless stage=SCORES)", () => {
      const testStage = { ...baseStage } as any;
      delete testStage.scores_started_at;
      expect(gotJustStageData(testStage)).toBe(ErrorCode.NONE);
    });
    
  });

  describe("gotJustStageOverrideData function", () => {
    const baseOverride: justStageOverrideType = {
      id: stageId,
      squad_id: squadId,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: "",
    };

    it("should return ErrorCode.NONE when override is disabled and override_at is null and reason blank", () => {
      expect(gotJustStageOverrideData(baseOverride)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when input is null", () => {
      expect(gotJustStageOverrideData(null as any)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const testOverride = { ...baseOverride, id: "" };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when stage_override_enabled is missing", () => {
      const testOverride = {
        ...baseOverride,
        stage_override_enabled: null as any,
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and override_at is null", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: null,
        stage_override_reason: "Testing",
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and reason is null", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: null as any,
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when override is enabled and reason is blank", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "   ",
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.NONE when override is enabled and override_at + reason are present", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "Testing",
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.MISSING_DATA when override is disabled but override_at is not null", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: false,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "",
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });

    it("should return ErrorCode.MISSING_DATA when override is disabled but reason is not blank", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "Should not be set",
      };
      expect(gotJustStageOverrideData(testOverride)).toBe(
        ErrorCode.MISSING_DATA
      );
    });
  });  

  describe("validStage function", () => {
    it("returns true for each SquadStage enum value", () => {
      expect(validStageValue(SquadStage.DEFINE)).toBe(true);
      expect(validStageValue(SquadStage.ENTRIES)).toBe(true);
      expect(validStageValue(SquadStage.SCORES)).toBe(true);
    });
    it("returns false for invalid strings", () => {
      expect(validStageValue("RUN")).toBe(false);
      expect(validStageValue("")).toBe(false);
      expect(validStageValue("define")).toBe(false); // case-sensitive
      expect(validStageValue("ENTRIES ")).toBe(false); // extra whitespace
    });
    it("returns false for non-strings", () => {
      expect(validStageValue(null)).toBe(false);
      expect(validStageValue(undefined)).toBe(false);
      expect(validStageValue(123)).toBe(false);
      expect(validStageValue(new Date())).toBe(false);
      expect(validStageValue({})).toBe(false);
      expect(validStageValue([])).toBe(false);
    });
  });

  describe("validStageSetAt function", () => {
    it("returns true for a Date object", () => {
      expect(validStageSetAt(new Date())).toBe(true);
    });

    it("returns true for epoch milliseconds number", () => {
      expect(validStageSetAt(1700000000000)).toBe(true);
    });

    it("returns true for numeric string epoch milliseconds", () => {
      expect(validStageSetAt("1700000000000")).toBe(true);
    });

    it("returns true for ISO strings (including with whitespace padding)", () => {
      const iso = "2023-12-31T23:59:59.000Z";
      expect(validStageSetAt(iso)).toBe(true);
      expect(validStageSetAt(`  ${iso}   `)).toBe(true);
    });

    it("returns false for null/undefined (stageSetAt can never be null)", () => {
      expect(validStageSetAt(null)).toBe(false);
      expect(validStageSetAt(undefined)).toBe(false);
    });

    it("returns false for invalid date inputs", () => {
      expect(validStageSetAt("not-a-date")).toBe(false);
      expect(validStageSetAt("")).toBe(false);
      expect(validStageSetAt("   ")).toBe(false);
      expect(validStageSetAt({})).toBe(false);
    });
  });

  describe("validStageOverrideEnabled", () => {
    it("returns true only for booleans", () => {
      expect(validStageOverrideEnabled(true)).toBe(true);
      expect(validStageOverrideEnabled(false)).toBe(true);
    });

    it("returns false for non-booleans", () => {
      expect(validStageOverrideEnabled(null)).toBe(false);
      expect(validStageOverrideEnabled(undefined)).toBe(false);
      expect(validStageOverrideEnabled("true")).toBe(false);
      expect(validStageOverrideEnabled(1)).toBe(false);
      expect(validStageOverrideEnabled({})).toBe(false);
    });
  });

  describe("validStageOverrideAt", () => {
    it("returns true for null/undefined", () => {
      expect(validStageOverrideAt(null)).toBe(true);
      expect(validStageOverrideAt(undefined)).toBe(true);
    });

    it("returns true for valid date inputs", () => {
      expect(validStageOverrideAt(new Date())).toBe(true);
      expect(validStageOverrideAt(1700000000000)).toBe(true);
      expect(validStageOverrideAt("1700000000000")).toBe(true);

      const iso = "2023-12-31T23:59:59.000Z";
      expect(validStageOverrideAt(iso)).toBe(true);
      expect(validStageOverrideAt(`  ${iso} `)).toBe(true);
    });

    it("returns false for invalid non-null values", () => {
      expect(validStageOverrideAt("nope")).toBe(false);
      expect(validStageOverrideAt("   ")).toBe(false);
      expect(validStageOverrideAt({})).toBe(false);
    });
  });

  describe("validStageOverrideReason", () => {
    it("returns true for a non-empty sanitized string within maxReasonLength", () => {
      expect(validStageOverrideReason("Reason")).toBe(true);
      expect(validStageOverrideReason("  Reason with padding  ")).toBe(true);
    });

    it("returns false for empty/whitespace-only strings (after sanitize)", () => {
      expect(validStageOverrideReason("")).toBe(false);
      expect(validStageOverrideReason("   ")).toBe(false);
      expect(validStageOverrideReason("\n\t")).toBe(false);
    });

    it("returns false when sanitized length exceeds maxReasonLength", () => {
      const tooLong = "a".repeat(maxReasonLength + 1);
      expect(validStageOverrideReason(tooLong)).toBe(false);
    });

    it("returns false for non-string-ish inputs that sanitize to empty", () => {
      // depending on your sanitize implementation, these likely become ""
      expect(validStageOverrideReason(null as any)).toBe(false);
      expect(validStageOverrideReason(undefined as any)).toBe(false);
      expect(validStageOverrideReason({} as any)).toBe(false);
    });
  });

  describe("validFullStageData function", () => {
    const baseStage: fullStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: "",
    };

    it("should return ErrorCode.NONE when stage is DEFINE and dates are valid", () => {
      expect(validFullStageData(baseStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when stage is SCORES and scores_started_at is a valid Date", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: new Date("2025-01-02T09:30:00.000Z"),
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is not a valid squad id", () => {
      const testStage: fullStageType = {
        ...baseStage,
        id: "not-a-valid-sqd-id",
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage is not a valid SquadStage enum", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: "NOT_A_STAGE" as any,
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage_set_at is not a valid date", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage_set_at: "not-a-date" as any,
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage is SCORES and scores_started_at is null", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: null,
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when scores_started_at is an invalid date", () => {
      const testStage: fullStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: "bad-date" as any,
      };
      expect(validFullStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("validJustStageData function", () => {
    const baseStage: justStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: null,
    };

    it("should return ErrorCode.NONE when stage is DEFINE and dates are valid", () => {
      expect(validJustStageData(baseStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when stage is SCORES and scores_started_at is a valid Date", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: new Date("2025-01-02T09:30:00.000Z"),
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is not a valid squad id", () => {
      const testStage: justStageType = {
        ...baseStage,
        id: "not-a-valid-sqd-id",
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage is not a valid SquadStage enum", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: "NOT_A_STAGE" as any,
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage_set_at is not a valid date", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage_set_at: "not-a-date" as any,
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when stage is SCORES and scores_started_at is null", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: null,
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });

    it("should return ErrorCode.INVALID_DATA when scores_started_at is an invalid date", () => {
      const testStage: justStageType = {
        ...baseStage,
        stage: SquadStage.SCORES,
        scores_started_at: "bad-date" as any,
      };
      expect(validJustStageData(testStage)).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("validJustStageOverrideData function", () => {
    const baseOverride: justStageOverrideType = {
      id: stageId,
      squad_id: squadId,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: "",
    };

    it("should return ErrorCode.NONE when override is disabled and fields are consistent", () => {
      expect(validJustStageOverrideData(baseOverride)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.NONE when override is enabled and override_at + reason are valid", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "Testing override",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(ErrorCode.NONE);
    });

    it("should return ErrorCode.INVALID_DATA when id is not a valid squad id", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        id: "not-a-valid-sqd-id",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when stage_override_enabled is not a boolean", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: "true" as any,
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when override is enabled and override_at is null", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: null,
        stage_override_reason: "Reason here",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when override is enabled and override_reason is blank", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when override is enabled and override_reason is only whitespace", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: true,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "   ",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when override is disabled but override_at is non-null", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: false,
        stage_override_at: new Date("2025-01-03T10:00:00.000Z"),
        stage_override_reason: "",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });

    it("should return ErrorCode.INVALID_DATA when override is disabled but override_reason is non-blank", () => {
      const testOverride: justStageOverrideType = {
        ...baseOverride,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "Should not be set",
      };
      expect(validJustStageOverrideData(testOverride)).toBe(
        ErrorCode.INVALID_DATA
      );
    });
  });

  describe("sanitizeFullStage function", () => {
    it("should return a sanitized fullStage when fullStage is already sanitized", () => {
      const testFullStage: fullStageType = {
        ...validFullStage,
        id: "",
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.id).toEqual("");
      expect(sanitizedFullStage.squad_id).toEqual(testFullStage.squad_id);
      expect(sanitizedFullStage.stage).toEqual(testFullStage.stage);
      expect(sanitizedFullStage.stage_set_at).toEqual(testFullStage.stage_set_at);
      expect(sanitizedFullStage.scores_started_at).toEqual(
        testFullStage.scores_started_at
      );
      expect(sanitizedFullStage.stage_override_enabled).toEqual(
        testFullStage.stage_override_enabled
      );
      expect(sanitizedFullStage.stage_override_at).toEqual(
        testFullStage.stage_override_at
      );
      expect(sanitizedFullStage.stage_override_reason).toEqual(
        testFullStage.stage_override_reason
      );
    });
    it("should return a sanitized fullStage when fullStage has an id", () => {
      const testFullStage = {
        ...validFullStage,
        id: stageId,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.id).toEqual(stageId);
    });
    it("should return a sanitized fullStage when fullStage has an invalid id", () => {
      const testFullStage = {
        ...validFullStage,
        id: "test123",
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.id).toEqual("");
    });
    it("should return a sanitized fullStage when fullStage is NOT already sanitized", () => {
      // do not incluide numerical or boolean fields
      const atDate = new Date();
      const testFullStage = {
        ...validFullStage,
        squad_id: "abc_123",
        scores_started_at: atDate,
        stage_override_at: atDate,
        stage_override_reason: " <alert> test </alert>  ",
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.squad_id).toEqual("");
      expect(sanitizedFullStage.scores_started_at).toEqual(atDate);
      expect(sanitizedFullStage.stage_override_at).toEqual(atDate);
      expect(sanitizedFullStage.stage_override_reason).toEqual("test");
    });
    it("should return a sanitized fullStage when numerical and boolean values are null", () => {
      const testFullStage = {
        ...validFullStage,
        stage_override_enabled: null as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.stage_override_enabled).toBeNull();
    });
    it("should return a sanitized fullStage when stage value is not SquadStage", () => {
      const testFullStage = {
        ...validFullStage,
        stage: "abc" as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.stage).toBeNull();
    });
    it("should return a sanitized fullStage when stage value is null", () => {
      const testFullStage = {
        ...validFullStage,
        stage: null as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.stage).toBeNull();
    });
    it("should return a sanitized fullStage when boolean values are not booleans", () => {
      const testFullStage = {
        ...validFullStage,
        stage_override_enabled: "abc" as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.stage_override_enabled).toBeNull();
    });
    it("should return a sanitized fullStage when boolean values are null", () => {
      const testFullStage = {
        ...validFullStage,
        stage_override_enabled: null as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);
      expect(sanitizedFullStage.stage_override_enabled).toBeNull();
    });
    it("should return a sanitized fullStage when date values are not dates", () => {
      const testFullStage = {
        ...validFullStage,
        stage_set_at: "abc" as any,
        stage_override_at: "def" as any,
        scores_started_at: "ghi" as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);      
      expect(sanitizedFullStage.stage_set_at).toBeNull();
      expect(sanitizedFullStage.stage_override_at).toBeNull();
      expect(sanitizedFullStage.scores_started_at).toBeNull();
    });
    it("should return a sanitized fullStage when date values are null", () => {
      const testFullStage = {
        ...validFullStage,        
        stage_set_at: null as any,
        stage_override_at: null as any,
        scores_started_at: null as any,
      };
      const sanitizedFullStage = sanitizeFullStage(testFullStage);      
      expect(sanitizedFullStage.stage_set_at).toBeNull();
      expect(sanitizedFullStage.stage_override_at).toBeNull();
      expect(sanitizedFullStage.scores_started_at).toBeNull();
    });
    it("should return null when passed a null squad", () => {
      const sanitizedFullStage = sanitizeFullStage(null as any);
      expect(sanitizedFullStage).toEqual(null);
    });
    it("should return null when passed undefined squad", () => {
      const sanitizedFullStage = sanitizeFullStage(undefined as any);
      expect(sanitizedFullStage).toEqual(null);
    });
  });

  describe("sanitizeJustStage function", () => {
    const baseStage: justStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: new Date("2025-01-02T09:30:00.000Z"),
    };

    it("should return null when input is null", () => {
      const result = sanitizeJustStage(null as any);
      expect(result).toBeNull();
    });

    it("should keep a valid stage id", () => {
      const result = sanitizeJustStage(baseStage);

      // id should be preserved because it is a valid 'stg' id
      expect(result.id).toBe(stageId);
    });

    it("should replace an invalid stage id with the blankSquad id", () => {
      const invalidIdStage: justStageType = {
        ...baseStage,
        id: "not-a-valid-sqd-id",
      };

      const result = sanitizeJustStage(invalidIdStage);

      // invalid id should not survive; we expect the default (blankSquad.id)
      expect(result.id).toBe(blankFullStage.id);
      expect(result.id).not.toBe(invalidIdStage.id);
    });

    it("should null out stage, stage_set_at, and scores_started_at regardless of input values", () => {
      const testJustStage: justStageType = {
        id: squadId,
        squad_id: squadId,
        stage: SquadStage.SCORES,
        stage_set_at: new Date("2025-02-01T12:00:00.000Z"),
        scores_started_at: new Date("2025-02-01T12:05:00.000Z"),
      };

      const result = sanitizeJustStage(testJustStage);

      // Current implementation: dummyStage passes null for these into sanitizeStage,
      // so the sanitized values are all null.
      expect(result.stage).toBeNull();
      expect(result.stage_set_at).toBeNull();
      expect(result.scores_started_at).toBeNull();
    });
  });

  describe("sanitizeJustStageOverride function", () => {
    const baseJustOverride: justStageOverrideType = {
      id: stageId,
      squad_id: squadId,
      stage_override_enabled: true,
      stage_override_at: new Date("2025-03-01T10:00:00.000Z"),
      stage_override_reason: "  Some reason here  ",
    };

    it("should return null when input is null", () => {
      const result = sanitizeJustStageOverride(null as any);
      expect(result).toBeNull();
    });

    it("should keep a valid stage id", () => {
      const result = sanitizeJustStageOverride(baseJustOverride);

      // id should be preserved because it is a valid 'stg' id
      expect(result.id).toBe(stageId);
    });

    it("should replace an invalid stage id with the blankSquad id", () => {
      const invalidOverride: justStageOverrideType = {
        ...baseJustOverride,
        id: "not-a-valid-sqd-id",
      };

      const result = sanitizeJustStageOverride(invalidOverride);

      expect(result.id).toBe(blankJustStageOverride.id);
      expect(result.id).not.toBe(invalidOverride.id);
    });

    it("should set stage_override_enabled to null regardless of input", () => {
      const resultEnabled = sanitizeJustStageOverride({
        ...baseJustOverride,
        stage_override_enabled: true,
      });
      const resultDisabled = sanitizeJustStageOverride({
        ...baseJustOverride,
        stage_override_enabled: false,
      });

      // Implementation passes null into sanitizeSquad and never sets it back,
      // so both come out as null.
      expect(resultEnabled.stage_override_enabled).toBeNull();
      expect(resultDisabled.stage_override_enabled).toBeNull();
    });

    it("should set stage_override_at to null regardless of input", () => {
      const result = sanitizeJustStageOverride(baseJustOverride);

      // dummyJustStageOverride passes null for stage_override_at, and validStageOverrideAt(null) is true,
      // so sanitizeSquad writes null.
      expect(result.stage_override_at).toBeNull();
    });

    it("should set stage_override_reason to an empty string (sanitize(null) => '')", () => {
      const noisyOverride: justStageOverrideType = {
        ...baseJustOverride,
        stage_override_reason: "  Some reason here  ",
      };

      const result = sanitizeJustStageOverride(noisyOverride);

      // Implementation passes null for stage_override_reason into sanitizeSquad,
      // so sanitize(null) gives "" (blank).
      expect(result.stage_override_reason).toBe("");
    });
  });

  describe("validateFullStage function", () => {

    describe("validateFullStage function - valid data", () => {
      it("should return ErrorCode.NONE when all data is valid", () => {
        expect(validateFullStage(validFullStage)).toBe(ErrorCode.NONE);
      });
      it('should return ErrorCode.NONE when all fields are properly sanitized', () => {
        const testFullStage = {
          ...validFullStage,
          stage_override_enabled: true,
          stage_override_at: new Date("2025-03-01T10:00:00.000Z"),
          stage_override_reason: "<aletrt>  Some reason here  </alert>", 
        };
        expect(validateFullStage(testFullStage)).toBe(ErrorCode.NONE);
      })
    })

    describe("validateFullStage function - missing data", () => {
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with blank id", () => {
        const missingFullStage = {
          ...validFullStage,
          id: "",
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with missing id", () => {
        const missingFullStage = {
          ...validFullStage,
          id: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with blank squad_id", () => {
        const missingFullStage = {
          ...validFullStage,
          squad_id: "",
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with missing squad_id", () => {
        const missingFullStage = {
          ...validFullStage,
          squad_id: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with missing stage", () => {
        const missingFullStage = {
          ...validFullStage,
          stage: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with missing stage_set_at", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_set_at: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage = 'SCORES' and scores_started_at is null", () => {
        const missingFullStage = {
          ...validFullStage,
          stage: SquadStage.SCORES,
          scores_started_at: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with missing stage_override_enabled", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = true and blank stage_override_reason", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: true,
          stage_override_reason: "",
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = true and invalid stage_override_reason", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: true,
          stage_override_reason: "a".repeat(maxReasonLength + 1),
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = true and missing stage_override_at", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: true,
          stage_override_at: null as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = true and invalid stage_override_at", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: true,
          stage_override_at: 'test' as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = false and valid stage_override_at", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: false,
          stage_override_at: new Date(),          
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });
      it("should return ErrorCode.MISSING_DATA when passed a full Stage with stage_override_enabled = false and valid stage_override_reason", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_override_enabled: false,
          stage_override_reason: 'testing',
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.MISSING_DATA);
      });

      it("should return ErrorCode.MISSING_DATA when passed a null full stage", () => {
        expect(validateFullStage(null as any)).toBe(ErrorCode.MISSING_DATA);
      });
    });

    describe("validateFullStage function - invalid data", () => {
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with invalid id", () => {
        const missingFullStage = {
          ...validFullStage,
          id: "test",          
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with valid id, but not a stage id", () => {
        const missingFullStage = {
          ...validFullStage,
          id: squadId,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with invalid suqad_id", () => {
        const missingFullStage = {
          ...validFullStage,
          squad_id: "test",          
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with valid squad_id, but not a squad id", () => {
        const missingFullStage = {
          ...validFullStage,
          squad_id: stageId,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with invalid stage", () => {
        const missingFullStage = {
          ...validFullStage,
          stage: "test" as any,          
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with invalid stage_set_at", () => {
        const missingFullStage = {
          ...validFullStage,
          stage_set_at: 'invalid' as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with stage = 'SCORES' and scores_started_at is a non date", () => {
        const missingFullStage = {
          ...validFullStage,
          stage: SquadStage.SCORES,
          scores_started_at: 'invalid' as any,
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
      it("should return ErrorCode.INVALID_DATA when passed a full Stage with stage != 'SCORES' and scores_started_at is a valid date", () => {
        const missingFullStage = {
          ...validFullStage,
          stage: SquadStage.ENTRIES,
          scores_started_at: new Date(),
        };
        expect(validateFullStage(missingFullStage)).toBe(ErrorCode.INVALID_DATA);
      });
    });

  });

  describe('validateJustStage function', () => {
    const validJustStage: justStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date(),
      scores_started_at: null,
    }
    describe('validateJustStage function - valid data', () => { 
      it('should return ErrorCode.NONE for valid justStage', () => { 
        expect(validateJustStage(validJustStage)).toEqual(ErrorCode.NONE);  
      })      
      it('should return ErrorCode.NONE for valid justStage', () => { 
        const gotScoresStage: justStageType = {
          ...validJustStage,
          stage: SquadStage.SCORES,
          scores_started_at: new Date(),
        }
        expect(validateJustStage(gotScoresStage)).toEqual(ErrorCode.NONE);  
      })      
    })

    describe('validateJustStage function - missing data', () => {
      it('should return ErrorCode.MISSING_DATA for justStage with blank id', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          id: "",
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })      
      it('should return ErrorCode.MISSING_DATA for justStage with missing id', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          id: null as any,
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })      
      it('should return ErrorCode.MISSING_DATA for justStage with blank squad_id', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          squad_id: "",
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })
      it('should return ErrorCode.MISSING_DATA for justStage with missing squad_id', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          squad_id: null as any,
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })
      it('should return ErrorCode.MISSING_DATA for justStage with missing stage', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          stage: null as any,
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })
      it('should return ErrorCode.MISSING_DATA for justStage with missing stage_set_at', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          stage_set_at: null as any,
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })
      it('should return ErrorCode.MISSING_DATA for justStage with stage = "SCORES" and missing scores_started_at', () => { 
        const missingJustStage: justStageType = {
          ...validJustStage,
          stage: SquadStage.SCORES,
          scores_started_at: null as any,
        }
        expect(validateJustStage(missingJustStage)).toEqual(ErrorCode.MISSING_DATA);  
      })
    })

    describe('validateJustStage function - invalid data', () => { 
      it('should return ErrorCode.INVALID_DATA for justStage with invalid id', () => { 
        const invalidJustStage: justStageType = {
          ...validJustStage,
          id: "test",
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);  
      })      
      it('should return ErrorCode.INVALID_DATA for justStage with valid id, but not a stage id', () => { 
        const invalidJustStage: justStageType = {
          ...validJustStage,
          id: squadId
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);  
      })      
      it('should return ErrorCode.INVALID_DATA for justStage with invalid squad_id', () => { 
        const invalidJustStage: justStageType = {
          ...validJustStage,
          squad_id: "test",
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);  
      })      
      it('should return ErrorCode.INVALID_DATA for justStage with valid squad_id, but not a squad id', () => { 
        const invalidJustStage: justStageType = {
          ...validJustStage,
          squad_id: stageId
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);  
      })      
      it('should return ErrorCode.INVALID_DATA for justStage with invalid stage', () => {
        const invalidJustStage: justStageType = {
          ...validJustStage,
          stage: "test" as any
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStage with invalid stage_set_at', () => {
        const invalidJustStage: justStageType = {
          ...validJustStage,
          stage_set_at: "test" as any
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStage with invalid scores_started_at', () => {
        const invalidJustStage: justStageType = {
          ...validJustStage,
          scores_started_at: "test" as any
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStage with stage = "SCORES" and invalid scores_started_at', () => {
        const invalidJustStage: justStageType = {
          ...validJustStage,
          stage: SquadStage.SCORES,
          scores_started_at: "test" as any
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStage with stage != "SCORES" and valid scores_started_at', () => {
        const invalidJustStage: justStageType = {
          ...validJustStage,
          stage: SquadStage.ENTRIES,
          scores_started_at: new Date(),
        }
        expect(validateJustStage(invalidJustStage)).toEqual(ErrorCode.INVALID_DATA);
      })
      
    })
  });

  describe('validJustStageOverrideData function', () => { 
    const validJustStageOverride: justStageOverrideType = {
      id: stageId,
      squad_id: squadId,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: '',
    }

    describe('validJustStageOverrideData function - valid data', () => {
      it('should return ErrorCode.NONE for valid justStageOverride stage_override_enabled = false', () => {
        expect(validJustStageOverrideData(validJustStageOverride)).toEqual(ErrorCode.NONE);
      })
      it('should return ErrorCode.NONE for valid justStageOverride with stage_override_enabled = true', () => { 
        const testJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          stage_override_enabled: true,
          stage_override_at: new Date(),
          stage_override_reason: "Testing override",
        }
        expect(validJustStageOverrideData(testJustStageOverride)).toEqual(ErrorCode.NONE);
      })
    })
    
    describe('validJustStageOverrideData function - invalid data', () => { 
      it('should return ErrorCode.INVALID_DATA for justStageOverride with invalid id', () => {
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          id: "test" as any,
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with valid id, but not a stage id', () => {
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          id: squadId,
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with invalid squad_id', () => {
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          squad_id: "test" as any,
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with valid squad_id, but not a squad id', () => {
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          squad_id: stageId
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with invalid stage_override_enabled', () => {
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          stage_override_enabled: "test" as any,
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with invalid stage_override_at', () => { 
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          stage_override_enabled: true,
          stage_override_at: "test" as any,
          stage_override_reason: "Testing override",
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA for justStageOverride with invalid stage_override_reason', () => { 
        const invalidJustStageOverride: justStageOverrideType = {
          ...validJustStageOverride,
          stage_override_enabled: true,
          stage_override_at: new Date(),
          stage_override_reason: "a".repeat(maxReasonLength + 1),
        }
        expect(validJustStageOverrideData(invalidJustStageOverride)).toEqual(ErrorCode.INVALID_DATA);
      })
    })
  })

  describe("isSquadStageType type guard", () => {
    const validStageObj: justStageType = {
      id: stageId,
      squad_id: squadId,
      stage: SquadStage.DEFINE,
      stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
      scores_started_at: null,
    };

    it("returns true for a valid squadStageType object (scores_started_at null allowed)", () => {
      expect(isSquadStageType(validStageObj)).toBe(true);
    });

    it("returns true for a valid squadStageType object with scores_started_at as Date", () => {
      const withScores: justStageType = {
        ...validStageObj,
        stage: SquadStage.SCORES,
        scores_started_at: new Date("2025-01-02T09:30:00.000Z"),
      };
      expect(isSquadStageType(withScores)).toBe(true);
    });

    it("returns false for null input", () => {
      expect(isSquadStageType(null as any)).toBe(false);
    });

    it("returns false for non-object input", () => {
      expect(isSquadStageType("not-an-object" as any)).toBe(false);
      expect(isSquadStageType(123 as any)).toBe(false);
      expect(isSquadStageType(true as any)).toBe(false);
    });

    it("returns false when id is missing", () => {
      const bad: any = {
        ...validStageObj,
      };
      delete bad.id;

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when squad_id is missing", () => {
      const bad: any = {
        ...validStageObj,
      };
      delete bad.squad_id;

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when stage is missing", () => {
      const bad: any = {
        ...validStageObj,
      };
      delete bad.stage;

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when stage_set_at is missing", () => {
      const bad: any = {
        ...validStageObj,
      };
      delete bad.stage_set_at;

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when stage_set_at is not a Date", () => {
      const bad: any = {
        ...validStageObj,
        stage_set_at: "not-a-date",
      };

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when id is not a string", () => {
      const bad: any = {
        ...validStageObj,
        id: 123,
      };

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when scores_started_at is neither null nor Date", () => {
      const bad: any = {
        ...validStageObj,
        scores_started_at: "not-a-date",
      };

      expect(isSquadStageType(bad)).toBe(false);
    });

    it("returns false when scores_started_at property is missing", () => {
      const bad: any = {
        id: stageId,
        squad_id: squadId,
        stage: SquadStage.DEFINE,
        stage_set_at: new Date("2025-01-01T12:00:00.000Z"),
        // scores_started_at missing
      };

      expect(isSquadStageType(bad)).toBe(false);
    });
  });

  describe("isSquadStageOverrideType type guard", () => {
    const validOverrideDate = new Date("2025-03-01T10:00:00.000Z");

    const validOverrideObj: justStageOverrideType = {
      id: stageId,
      squad_id: squadId,
      stage_override_enabled: true,
      stage_override_at: validOverrideDate,
      stage_override_reason: "Override for testing",
    };

    it("returns true for a valid squadStageOverrideType object", () => {
      expect(isSquadStageOverrideType(validOverrideObj)).toBe(true);
    });

    it("returns false when input is null", () => {
      expect(isSquadStageOverrideType(null as any)).toBe(false);
    });

    it("returns false when input is not an object", () => {
      expect(isSquadStageOverrideType("not-an-object" as any)).toBe(false);
      expect(isSquadStageOverrideType(42 as any)).toBe(false);
      expect(isSquadStageOverrideType(false as any)).toBe(false);
    });

    it("returns false when id is missing", () => {
      const bad: any = {
        ...validOverrideObj,
      };
      delete bad.id;

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when squad_id is missing", () => {
      const bad: any = {
        ...validOverrideObj,
      };
      delete bad.squad_id;

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when stage_override_enabled is missing", () => {
      const bad: any = {
        ...validOverrideObj,
      };
      delete bad.stage_override_enabled;

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when stage_override_at is missing", () => {
      const bad: any = {
        ...validOverrideObj,
      };
      delete bad.stage_override_at;

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when stage_override_reason is missing", () => {
      const bad: any = {
        ...validOverrideObj,
      };
      delete bad.stage_override_reason;

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when id is not a string", () => {
      const bad: any = {
        ...validOverrideObj,
        id: 123,
      };

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when stage_override_at is not a Date", () => {
      const bad: any = {
        ...validOverrideObj,
        stage_override_at: "not-a-date",
      };

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when stage_override_enabled is not present but other fields are", () => {
      const bad: any = {
        id: stageId,
        squad_id: squadId,
        stage_override_at: validOverrideDate,
        stage_override_reason: "Reason",
        // stage_override_enabled missing
      };

      expect(isSquadStageOverrideType(bad)).toBe(false);
    });

    it("returns false when only the shape roughly matches but keys are wrong", () => {
      const bad = {
        id: stageId,
        stageId: squadId,
        enabled: true,
        override_at: validOverrideDate,
        reason: "Bad keys",
      };

      expect(isSquadStageOverrideType(bad as any)).toBe(false);
    });

    it("ideally should return true when stage_override_at is null (type allows Date | null)", () => {
      const withNullDate: justStageOverrideType = {
        id: stageId,
        squad_id: squadId,
        stage_override_enabled: false,
        stage_override_at: null,
        stage_override_reason: "",
      };
      expect(isSquadStageOverrideType(withNullDate)).toBe(true);
    });
  });

});
