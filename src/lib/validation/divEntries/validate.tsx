import { validMoney } from "@/lib/currency/validate";
import { blankDivEntry } from "@/lib/db/initVals";
import { divEntryType, validDivEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation/validation";

/**
 * checks if divEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param divEntry - divEntry to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotDivEntryData = (divEntry: divEntryType): ErrorCode => {
  try {
    if (!divEntry ||      
      !divEntry.id ||
      !divEntry.squad_id ||
      !divEntry.div_id ||
      !divEntry.player_id ||
      !divEntry.fee)
    {
      return ErrorCode.MISSING_DATA
    }
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * checks if fee is valid
 * 
 * @param moneyStr {unknown} - money to check
 * @returns {boolean} - true if amount is valid and not blank; else false
 */
export const validDivEntryFee = (moneyStr: unknown): boolean => {
  if (!moneyStr || typeof moneyStr !== 'string') return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if divEntry data is valid
 * 
 * @param {divEntryType} divEntry - divEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validDivEntryData = (divEntry: divEntryType): ErrorCode => { 
  try {
    if (!divEntry) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(divEntry.id, "den")) {
      return ErrorCode.INVALID_DATA;
    }
    if(!isValidBtDbId(divEntry.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(divEntry.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(divEntry.player_id, "ply")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validDivEntryFee(divEntry.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes divEntry
 * 
 * @param {divEntryType} divEntry - divEntry to sanitize
 * @returns {divEntryType} - sanitized divEntry
 */
export const sanitizeDivEntry = (divEntry: divEntryType): divEntryType => { 
  if (!divEntry) return null as any;
  const sanitziedDivEntry: divEntryType = {
    ...blankDivEntry
  }
  if (isValidBtDbId(divEntry.id, "den")) {
    sanitziedDivEntry.id = divEntry.id;
  }
  if (isValidBtDbId(divEntry.squad_id, "sqd")) {
    sanitziedDivEntry.squad_id = divEntry.squad_id;
  }
  if (isValidBtDbId(divEntry.div_id, "div")) {
    sanitziedDivEntry.div_id = divEntry.div_id;
  }
  if (isValidBtDbId(divEntry.player_id, "ply")) {
    sanitziedDivEntry.player_id = divEntry.player_id;
  }
  if (validMoney(divEntry.fee, 0, maxMoney)) {
    sanitziedDivEntry.fee = divEntry.fee;
  }
  return sanitziedDivEntry;
}

/**
 * validates divEntry
 * 
 * @param divEntry - divEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateDivEntry = (divEntry: divEntryType): ErrorCode => { 
  try {
    const errorCode = gotDivEntryData(divEntry);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validDivEntryData(divEntry);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of divEntries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries to validate
 * @returns {divEntries: divEntryType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateDivEntries = (divEntries: divEntryType[]): validDivEntriesType => {
  
  const blankDivEntries: divEntryType[] = [];
  const okDivEntries: divEntryType[] = [];
  if (!Array.isArray(divEntries) || divEntries.length === 0) {
    return { divEntries: blankDivEntries, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < divEntries.length) {
    const toPost = sanitizeDivEntry(divEntries[i]);
    const errCode = validateDivEntry(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { divEntries: okDivEntries, errorCode: errCode };
    }
    okDivEntries.push(toPost);
    i++;
  }
  return { divEntries: okDivEntries, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotDivEntryData,
  validDivEntryData,
};
