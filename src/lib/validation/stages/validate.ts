import type {
  DateInput,
  fullStageType,
  justStageOverrideType,
  justStageType,
} from "@/lib/types/types";
import {
  isValidBtDbId,
  maxReasonLength,
  toValidDateOrNull,
} from "../validation";
import { ErrorCode } from "@/lib/enums/enums";
import { SquadStage } from "@prisma/client";
import { blankFullStage, initFullStage } from "@/lib/db/initVals";
import { sanitize } from "../sanitize";

const gotFullStageData = (stage: fullStageType): ErrorCode => {
  try {
    if (stage == null) return ErrorCode.MISSING_DATA;
    if (
      !stage ||
      !stage.id ||
      !stage.squad_id ||
      typeof stage.stage !== "string" ||
      !stage.stage_set_at ||
      stage.stage_set_at.trim() === "" ||
      typeof stage.stage_override_enabled !== "boolean"
    ) {
      return ErrorCode.MISSING_DATA;
    }
    // if stage_override_enabled is true,
    // then stage_override_at and stage_override_reason are required
    if (
      stage.stage_override_enabled &&
      (stage.stage_override_at === null ||
        stage.stage_override_at.trim() === "" ||
        stage.stage_override_reason == null ||
        stage.stage_override_reason.trim() === "")
    ) {
      return ErrorCode.MISSING_DATA;
    }

    // if stage_override_enabled is false,
    // then stage_override_at and stage_override_reason are not required
    // so no need to check for missing data - DO CHECK IF VALID 
    // if (!stage.stage_override_enabled) {
    //   if (
    //     (stage.stage_override_at !== null &&
    //     stage.stage_override_at.trim() === "") ||
    //     (stage.stage_override_reason !== null &&
    //       stage.stage_override_reason.trim() !== "")
    //   ) {
    //     return ErrorCode.MISSING_DATA;
    //   }
    // }


    // if stage is scores, then scores_started_at is required
    if (stage.stage === SquadStage.SCORES && stage.scores_started_at == null) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if justStage object has missing data
 *
 * @param justStage {justStageType} - justStage object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const gotJustStageData = (justStage: justStageType): ErrorCode => {
  try {
    if (justStage == null) return ErrorCode.MISSING_DATA;
    const dummyStage: fullStageType = {
      ...initFullStage,
      id: justStage.id,
      squad_id: justStage.squad_id,
      stage: justStage.stage,
      stage_set_at: justStage.stage_set_at,
      scores_started_at: justStage.scores_started_at,
    };
    return gotFullStageData(dummyStage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if justStageOverride object has missing data
 *
 * @param justStageOverride {justStageOverrideType} - justStageOverride object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const gotJustStageOverrideData = (
  justStageOverride: justStageOverrideType,
): ErrorCode => {
  try {
    if (justStageOverride == null) return ErrorCode.MISSING_DATA;
    const dummyStage: fullStageType = {
      ...initFullStage,
      id: justStageOverride.id,
      squad_id: justStageOverride.squad_id,
      stage_override_enabled: justStageOverride.stage_override_enabled,
      stage_override_at: justStageOverride.stage_override_at,
      stage_override_reason: justStageOverride.stage_override_reason,
    };
    return gotFullStageData(dummyStage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validStageValue = (stage: unknown): stage is SquadStage => {
  return (
    typeof stage === "string" &&
    (Object.values(SquadStage) as string[]).includes(stage)
  );
};
export const validStageSetAt = (stageSetAt: unknown): boolean => {
  if (typeof stageSetAt !== "string") return false;
  return toValidDateOrNull(stageSetAt as DateInput) !== null;
};
export const validScoresStartedAt = (value: unknown): boolean => {    
  if (value == null) return true;
  if (typeof value !== "string") return false;
  return value == null || toValidDateOrNull(value as DateInput) !== null;
};
export const validStageOverrideEnabled = (value: unknown): boolean => {
  return typeof value === "boolean";
};
export const validStageOverrideAt = (value: unknown): boolean => {
  if (value == null) return true;
  if (typeof value !== "string") return false;
  return value == null || toValidDateOrNull(value as DateInput) !== null;
};
export const validStageOverrideReason = (value: unknown): boolean => {
  const sanitized = sanitize(value);
  return sanitized.length > 0 && sanitized.length <= maxReasonLength;
};

/**
 * checks if fullStage data is valid
 *
 * @param {fullStageType} fullStage - fullStage object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validFullStageData = (fullStage: fullStageType): ErrorCode => {
  try {
    if (!fullStage) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(fullStage.id, "stg")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(fullStage.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validStageValue(fullStage.stage)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validStageSetAt(fullStage.stage_set_at)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validScoresStartedAt(fullStage.scores_started_at)) {
      return ErrorCode.INVALID_DATA;
    }
    if (fullStage.stage === SquadStage.SCORES && !fullStage.scores_started_at) {
      return ErrorCode.INVALID_DATA;
    }
    if (fullStage.stage !== SquadStage.SCORES && fullStage.scores_started_at) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validStageOverrideEnabled(fullStage.stage_override_enabled)) {
      return ErrorCode.INVALID_DATA;
    }
    if (fullStage.stage_override_enabled) {
      if (fullStage.stage_override_at == null ||
        (typeof fullStage.stage_override_at === "string"
          && fullStage.stage_override_at === "")) {
        return ErrorCode.MISSING_DATA;
      }
      if (fullStage.stage_override_reason == null ||
        (typeof fullStage.stage_override_reason === "string"
          && fullStage.stage_override_reason === "")) {
        return ErrorCode.MISSING_DATA;
      }
      if (!validStageOverrideAt(fullStage.stage_override_at)) {
        return ErrorCode.INVALID_DATA;
      }
      if (!validStageOverrideReason(fullStage.stage_override_reason)) {
        return ErrorCode.INVALID_DATA;
      }
      if (
        !fullStage.stage_override_at ||
        !fullStage.stage_override_reason ||
        fullStage.stage_override_reason === ""
      ) {
        return ErrorCode.INVALID_DATA;
      }
    } else {
      if (fullStage.stage_override_at !== null) {
        return ErrorCode.INVALID_DATA;
      }
      if (
        fullStage.stage_override_reason !== null &&
        fullStage.stage_override_reason !== ""
      ) {
        return ErrorCode.INVALID_DATA;
      }
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if stage data is valid
 *
 * @param {justStageType} justStage - justStage object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validJustStageData = (justStage: justStageType): ErrorCode => {
  try {
    if (!justStage) return ErrorCode.INVALID_DATA;
    const dummyFullStage: fullStageType = {
      ...initFullStage,
      id: justStage.id,
      squad_id: justStage.squad_id,
      stage: justStage.stage,
      stage_set_at: justStage.stage_set_at,
      scores_started_at: justStage.scores_started_at,
    };
    return validFullStageData(dummyFullStage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if justStageOverride data is valid
 *
 * @param {justStageOverrideType} justStageOverride - justStageOverride object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validJustStageOverrideData = (
  justStageOverride: justStageOverrideType,
): ErrorCode => {
  try {
    if (!justStageOverride) return ErrorCode.INVALID_DATA;
    const dummyFullStage: fullStageType = {
      ...initFullStage,
      id: justStageOverride.id,
      squad_id: justStageOverride.squad_id,
      stage_override_enabled: justStageOverride.stage_override_enabled,
      stage_override_at: justStageOverride.stage_override_at,
      stage_override_reason: justStageOverride.stage_override_reason,
    };
    return validFullStageData(dummyFullStage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes a full stage object
 *
 * @param {fullStageType} fullStage - full stage to sanitize
 * @returns {fullStageType} - full stage object with sanitized data
 */
export const sanitizeFullStage = (fullStage: fullStageType): fullStageType => {
  if (!fullStage) return null as any;
  const sanitizedStage: fullStageType = {
    ...blankFullStage,
    stage: null as any,
    stage_set_at: null as any,
    stage_override_enabled: null as any,
    scores_started_at: null as any,
    stage_override_at: null as any,
  };
  if (isValidBtDbId(fullStage.id, "stg")) {
    sanitizedStage.id = fullStage.id;
  }
  if (isValidBtDbId(fullStage.squad_id, "sqd")) {
    sanitizedStage.squad_id = fullStage.squad_id;
  }
  if (validStageValue(fullStage.stage)) {
    sanitizedStage.stage = fullStage.stage;
  }
  if (validStageSetAt(fullStage.stage_set_at)) {
    sanitizedStage.stage_set_at = fullStage.stage_set_at;
  }
  if (validScoresStartedAt(fullStage.scores_started_at)) {
    sanitizedStage.scores_started_at = fullStage.scores_started_at;
  }
  if (validStageOverrideEnabled(fullStage.stage_override_enabled)) {
    sanitizedStage.stage_override_enabled = fullStage.stage_override_enabled;
  }
  if (validStageOverrideAt(fullStage.stage_override_at)) {
    sanitizedStage.stage_override_at = fullStage.stage_override_at;
  }
  sanitizedStage.stage_override_reason = sanitize(
    fullStage.stage_override_reason,
  );
  return sanitizedStage;
};

/**
 * sanitizes a justStage
 *
 * @param {justStageType} justStage - justStage object to sanitize
 * @returns {justStageType} - justStage object with sanitized data
 */
export const sanitizeJustStage = (justStage: justStageType): justStageType => {
  if (!justStage) return null as any;
  const dummyFullStage: fullStageType = {
    ...initFullStage,
    id: justStage.id,
    squad_id: justStage.squad_id,
    stage: null as any,
    stage_set_at: null as any,
  };
  const sanitized = sanitizeFullStage(dummyFullStage);
  return {
    id: sanitized.id,
    squad_id: sanitized.squad_id,
    stage: sanitized.stage,
    stage_set_at: sanitized.stage_set_at,
    scores_started_at: sanitized.scores_started_at,
  };
};

/**
 * sanitizes a sanitizeJustStageOverride
 *
 * @param {justStageOverrideType} justStageOverride - sanitizeJustStageOverride override object to sanitize
 * @returns {justStageOverrideType} - sanitizeJustStageOverride object with sanitized data
 */
export const sanitizeJustStageOverride = (
  justStageOverride: justStageOverrideType,
): justStageOverrideType => {
  if (!justStageOverride) return null as any;
  const dummyFullStage: fullStageType = {
    ...initFullStage,
    id: justStageOverride.id,
    squad_id: justStageOverride.squad_id,
    stage_override_enabled: null as any,
    stage_override_at: null as any,
    stage_override_reason: null as any,
  };
  const sanitized = sanitizeFullStage(dummyFullStage);
  return {
    id: sanitized.id,
    squad_id: sanitized.squad_id,
    stage_override_enabled: sanitized.stage_override_enabled,
    stage_override_at: sanitized.stage_override_at,
    stage_override_reason: sanitized.stage_override_reason,
  };
};

/**
 * validates a fullStage object
 *
 * @param {fullStageType} stage - full stage to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export function validateFullStage(stage: fullStageType): ErrorCode {
  try {
    const errCode = gotFullStageData(stage);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validFullStageData(stage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates a justStage object
 *
 * @param {justStageType} justStage - justStage object to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateJustStage = (justStage: justStageType): ErrorCode => {
  try {
    const errCode = gotJustStageData(justStage);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validJustStageData(justStage);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * validates a justStageOverride object
 *
 * @param {justStageOverrideType} justStageOverride - justStageOverride object to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateSquadStageOverride = (
  justStageOverride: justStageOverrideType,
): ErrorCode => {
  try {
    const errCode = gotJustStageOverrideData(justStageOverride);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validJustStageOverrideData(justStageOverride);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * tests if an object is a squadStageType
 *
 * @param {unknown} input - object to test if a squadStageType object
 * @returns {boolean} - true if a squadStageType object, otherwise false
 */
export function isSquadStageType(input: unknown): input is justStageType {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "squad_id" in input &&
    "stage" in input &&
    "stage_set_at" in input &&
    "scores_started_at" in input &&
    typeof (input as any).id === "string" &&
    typeof (input as any).stage_set_at === "string" &&
    ((input as any).scores_started_at == null ||
      typeof (input as any).scores_started_at === "string")
  );
}

/**
 * tests if an object is a squadStageOverrideType
 *
 * @param {unknown} input - object to test if a squadStageOverrideType
 * @returns {boolean} - true if a squadStageOverrideType object, otherwise false
 */
export const isSquadStageOverrideType = (
  input: unknown,
): input is justStageOverrideType => {
  return (
    typeof input === "object" &&
    input !== null &&
    "id" in input &&
    "squad_id" in input &&
    "stage_override_enabled" in input &&
    "stage_override_at" in input &&
    "stage_override_reason" in input &&
    typeof (input as any).id === "string" &&
    // (input as any).stage_override_at instanceof Date
    ((input as any).stage_override_at === null ||
      typeof (input as any).stage_override_at === "string")
  );
};

export const exportedForTesting = {
  gotFullStageData,
  gotJustStageData,
  gotJustStageOverrideData,
  validFullStageData,
  validJustStageData,
  validJustStageOverrideData,
};
