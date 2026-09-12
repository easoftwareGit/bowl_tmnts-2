import { isValidBtDbId, isNumber, validPfAmount, validPfPosition } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { elimPfDataType, elimPfSaveDataType, elimPfType, validElimPfsType } from "@/lib/types/types";
import { blankElimPf } from "@/lib/db/initVals";
import { maxMoney } from "@/lib/validation/constants";

/**
 * Checks if the elimPf object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {elimPfType} elimPf - The elimPf to validate
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotElimPfData = (elimPf: elimPfType): ErrorCode => {
  try {
    if (!elimPf ||
      !elimPf.id ||
      !elimPf.elim_id ||
      (elimPf.position === null) ||
      (elimPf.amount === null))
    {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }    
};

/**
 * checks if elimPf data is valid
 * 
 * @param {elimPfType} elimPf - elimPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validElimPfData = (elimPf: elimPfType): ErrorCode => { 
  try {
    if (!elimPf) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(elimPf.id, "epf")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elimPf.elim_id, "elm")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfPosition(elimPf.position)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfAmount(elimPf.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes elimPf
 * 
 * @param {elimPfType} elimPf - elimPf to sanitize
 * @returns {elimPfType} - sanitized elimPf
 */
export const sanitizeElimPf = (elimPf: elimPfType): elimPfType => { 
  if (!elimPf) return null as any;
  const sanitziedElimPf: elimPfType = {
    ...blankElimPf,    
  }
  if (elimPf.id) {
    sanitziedElimPf.id = sanitizeBtDbId(elimPf.id);
  }
  if (elimPf.elim_id) {
    sanitziedElimPf.elim_id = sanitizeBtDbId(elimPf.elim_id);
  }
  if (elimPf.position === null || isNumber(elimPf.position)) {
    sanitziedElimPf.position = elimPf.position;
  }
  if (elimPf.amount !== null) {
    sanitziedElimPf.amount = sanitizeMoneyAmount(elimPf.amount);
  }  
  return sanitziedElimPf;
}

/**
 * validates elimPf
 * 
 * @param {elimPfType} elimPf - elimPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateElimPf = (elimPf: elimPfType): ErrorCode => { 
  try {
    const errorCode = gotElimPfData(elimPf);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validElimPfData(elimPf);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * checks if value is elimPfDataType
 *
 * @param {unknown} value - value to check
 * @return {boolean} - true if value is elimPfDataType
 */
const isElimPfDataType = (value: unknown): value is elimPfDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const elimPf = value as Record<string, unknown>;

  return (
    typeof elimPf.id === "string" &&
    typeof elimPf.elim_id === "string" &&
    typeof elimPf.position === "number" &&
    typeof elimPf.amount === "number"
  );
};

/**
 * checks if value is elimPfSaveDataType
 * 
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is elimPfSaveDataType
 */
export const isElimPfSaveDataType = (value: unknown): value is elimPfSaveDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    Array.isArray(data.elimPfData) &&
    data.elimPfData.every(isElimPfDataType) &&
    Array.isArray(data.elimIds) &&
    data.elimIds.every((id) => typeof id === "string")
  );
};

/**
 * validates array of elimPfs
 * 
 * @param {elimPfType[]} elimPfs - array of elimPfType to validate
 * @param {string[]} elimIds - array of elim ids for the tournament
 * @returns {elimPfs: elimPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateElimPfs = (elimPfs: elimPfType[], elimIds: string[]): validElimPfsType => {
  
  const blankElimPfs: elimPfType[] = [];
  const okElimPfs: elimPfType[] = [];
  if (!Array.isArray(elimPfs) || elimPfs.length === 0) {
    return { elimPfs: blankElimPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  if (!Array.isArray(elimIds) || elimIds.length === 0) {
    return { elimPfs: blankElimPfs, errorCode: ErrorCode.MISSING_DATA };
  }
  const elimIdSet = new Set(elimIds);
  // sort by elim_id and position
  const sortedElimPfs = elimPfs.toSorted((a, b) => {
    const elimCompare = a.elim_id.localeCompare(b.elim_id);
    if (elimCompare !== 0) {
      return elimCompare;
    }
    return a.position! - b.position!;
  });

  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  let currentElimId = "";
  let lastPos = 0;
  let lastAmount = maxMoney; 
  while (i < elimPfs.length) {
    const toPost = sanitizeElimPf(sortedElimPfs[i]);
    const errCode = validateElimPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { elimPfs: okElimPfs, errorCode: errCode };
    }
    // all elimPfs MUST have id in elimIdSet
    if (!elimIdSet.has(toPost.elim_id)) {
      return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all elimPfs MUST have sequential positions, starting at 1, per elim
    if (toPost.elim_id !== currentElimId) {
      if (toPost.position !== 1) {
        return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      currentElimId = toPost.elim_id;
      lastPos = 1;
      if (toPost.amount! > maxMoney) {
        return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    } else {
      if (toPost.position !== lastPos + 1) {
        return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastPos = toPost.position;
      if (toPost.amount! > lastAmount) {
        return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    }
    okElimPfs.push(toPost);    
    i++;
  }
  return { elimPfs: okElimPfs, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotElimPfData,
  validElimPfData,
};
