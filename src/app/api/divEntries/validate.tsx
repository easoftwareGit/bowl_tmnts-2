import { validMoney } from "@/lib/currency/validate";
import { blankDivEntry } from "@/lib/db/initVals";
import { divEntryType, validDivEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation";

/**
 * checks if divEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param divEntry - divEntry to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
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
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * checks if fee is valid
 * 
 * @param moneyStr - money to check
 * @returns - true if amount is valid and not blank; else false
 */
export const validDivEntryFee = (moneyStr: string): boolean => {
  if (!moneyStr) return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if divEntry data is valid
 * 
 * @param {divEntryType} divEntry - divEntry to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validDivEntryData = (divEntry: divEntryType): ErrorCode => { 
  try {
    if (!divEntry) return ErrorCode.InvalidData;
    if (!isValidBtDbId(divEntry.id, "den")) {
      return ErrorCode.InvalidData;
    }
    if(!isValidBtDbId(divEntry.squad_id, "sqd")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(divEntry.div_id, "div")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(divEntry.player_id, "ply")) {
      return ErrorCode.InvalidData;
    }
    if (!validDivEntryFee(divEntry.fee)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
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
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validateDivEntry = (divEntry: divEntryType): ErrorCode => { 
  try {
    const errorCode = gotDivEntryData(divEntry);
    if (errorCode !== ErrorCode.None) return errorCode;
    return validDivEntryData(divEntry);
  } catch (err) {
    return ErrorCode.OtherError;
  }
}

/**
 * validates array of divEntries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries to validate
 * @returns {divEntries: divEntryType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateDivEntries = (divEntries: divEntryType[]): validDivEntriesType => {
  
  const blankDivEntries: divEntryType[] = [];
  const okDivEntries: divEntryType[] = [];
  if (!Array.isArray(divEntries) || divEntries.length === 0) {
    return { divEntries: blankDivEntries, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < divEntries.length) {
    const toPost = sanitizeDivEntry(divEntries[i]);
    const errCode = validateDivEntry(toPost);
    if (errCode !== ErrorCode.None) {
      return { divEntries: okDivEntries, errorCode: errCode };
    }
    okDivEntries.push(toPost);
    i++;
  }
  return { divEntries: okDivEntries, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotDivEntryData,
  validDivEntryData,
};
