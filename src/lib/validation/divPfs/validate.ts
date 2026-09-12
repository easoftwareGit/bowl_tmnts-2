import { isValidBtDbId, isNumber, validPfPosition, validPfAmount } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { divPfDataType, divPfSaveDataType, divPfType, validDivPfsType } from "@/lib/types/types";
import { blankDivPf } from "@/lib/db/initVals";
import { maxMoney } from "@/lib/validation/constants";

/**
 * Checks if the divPf object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {divPfType} divPf - The divPf to validate
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotDivPfData = (divPf: divPfType): ErrorCode => {
  try {
    if (!divPf ||
      !divPf.id ||
      !divPf.div_id ||
      (divPf.position === null) ||
      (divPf.amount === null))
    {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }    
};

/**
 * checks if divPf data is valid
 * 
 * @param {divPfType} divPf - divPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validDivPfData = (divPf: divPfType): ErrorCode => { 
  try {
    if (!divPf) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(divPf.id, "dpf")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(divPf.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfPosition(divPf.position)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfAmount(divPf.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes divPf
 * 
 * @param {divPfType} divPf - divPf to sanitize
 * @returns {divPfType} - sanitized divPf
 */
export const sanitizeDivPf = (divPf: divPfType): divPfType => { 
  if (!divPf) return null as any;
  const sanitziedDivPf: divPfType = {
    ...blankDivPf,    
  }
  if (divPf.id) {
    sanitziedDivPf.id = sanitizeBtDbId(divPf.id);
  }
  if (divPf.div_id) {
    sanitziedDivPf.div_id = sanitizeBtDbId(divPf.div_id);
  }
  if (divPf.position === null || isNumber(divPf.position)) {
    sanitziedDivPf.position = divPf.position;
  }
  if (divPf.amount !== null) {
    sanitziedDivPf.amount = sanitizeMoneyAmount(divPf.amount);
  }  
  return sanitziedDivPf;
}

/**
 * validates divPf
 * 
 * @param {divPfType} divPf - divPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateDivPf = (divPf: divPfType): ErrorCode => { 
  try {
    const errorCode = gotDivPfData(divPf);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validDivPfData(divPf);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * checks if value is divPfDataType
 *
 * @param {unknown} value - value to check
 * @return {boolean} - true if value is divPfDataType
 */
const isDivPfDataType = (value: unknown): value is divPfDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const divPf = value as Record<string, unknown>;

  return (
    typeof divPf.id === "string" &&
    typeof divPf.div_id === "string" &&
    typeof divPf.position === "number" &&
    typeof divPf.amount === "number"
  );
};

/**
 * checks if value is divPfSaveDataType
 * 
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is divPfSaveDataType
 */
export const isDivPfSaveDataType = (value: unknown): value is divPfSaveDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    Array.isArray(data.divPfData) &&
    data.divPfData.every(isDivPfDataType) &&
    Array.isArray(data.divIds) &&
    data.divIds.every((id) => typeof id === "string")
  );
};

/**
 * validates array of divPfs
 * 
 * @param {divPfType[]} divPfs - array of divPfType to validate
 * @param {string[]} divIds - array of div ids for the tournament
 * @returns {divPfs: divPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateDivPfs = (divPfs: divPfType[], divIds: string[]): validDivPfsType => {
  
  const blankDivPfs: divPfType[] = [];
  const okDivPfs: divPfType[] = [];
  if (!Array.isArray(divPfs) || divPfs.length === 0) {
    return { divPfs: blankDivPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  if (!Array.isArray(divIds) || divIds.length === 0) {
    return { divPfs: blankDivPfs, errorCode: ErrorCode.MISSING_DATA };
  }
  const divIdSet = new Set(divIds);
  // sort by div_id and position
  const sortedDivPfs = divPfs.toSorted((a, b) => {
    const divCompare = a.div_id.localeCompare(b.div_id);

    if (divCompare !== 0) {
      return divCompare;
    }

    return a.position! - b.position!;
  });

  // cannot use forEach because if got an error need exit loop
  let i = 0;    
  let currentDivId = "";
  let lastPos = 0;
  let lastAmount = maxMoney; 
  while (i < divPfs.length) {
    const toPost = sanitizeDivPf(sortedDivPfs[i]);
    const errCode = validateDivPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { divPfs: okDivPfs, errorCode: errCode };
    }
    // all divPfs MUST have id in divIdSet
    if (!divIdSet.has(toPost.div_id)) {
      return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all divPfs MUST have sequential positions, starting at 1, per div
    if (toPost.div_id !== currentDivId) {
      if (toPost.position !== 1) {
        return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      currentDivId = toPost.div_id;
      lastPos = 1;
      if (toPost.amount! > maxMoney) {
        return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    } else {
      if (toPost.position !== lastPos + 1) {
        return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastPos = toPost.position;
      if (toPost.amount! > lastAmount) {
        return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    }

    okDivPfs.push(toPost);    
    i++;
  }

  return { divPfs: okDivPfs, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotDivPfData,
  validDivPfData,
};
