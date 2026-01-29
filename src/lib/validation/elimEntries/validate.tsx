import { validMoney } from "@/lib/currency/validate";
import { blankElimEntry } from "@/lib/db/initVals";
import { elimEntryType, validElimEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation/validation";

/**
 * checks if elimEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param elimEntry - elimEntry to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotElimEntryData = (elimEntry: elimEntryType): ErrorCode => {
  try {
    if (!elimEntry ||      
      !elimEntry.id ||
      !elimEntry.elim_id ||
      !elimEntry.player_id ||      
      !elimEntry.fee)
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
 * @param unknown - money string to check
 * @returns - true if amount is valid and not blank; else false
 */
export const validElimEntryFee = (moneyStr: unknown): boolean => {
  if (!moneyStr || typeof moneyStr !== 'string') return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if elimEntry data is valid
 * 
 * @param {elimEntryType} elimEntry - elimEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validElimEntryData = (elimEntry: elimEntryType): ErrorCode => { 
  try {
    if (!elimEntry) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(elimEntry.id, "een")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elimEntry.elim_id, "elm")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elimEntry.player_id, "ply")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validElimEntryFee(elimEntry.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes elimEntry
 * 
 * @param {elimEntryType} elimEntry - elimEntry to sanitize
 * @returns {elimEntryType} - sanitized elimEntry
 */
export const sanitizeElimEntry = (elimEntry: elimEntryType): elimEntryType => { 
  if (!elimEntry) return null as any;
  const sanitziedElimEntry: elimEntryType = {
    ...blankElimEntry
  }
  if (isValidBtDbId(elimEntry.id, "een")) {
    sanitziedElimEntry.id = elimEntry.id;
  }
  if (isValidBtDbId(elimEntry.elim_id, "elm")) {
    sanitziedElimEntry.elim_id = elimEntry.elim_id;
  }
  if (isValidBtDbId(elimEntry.player_id, "ply")) {
    sanitziedElimEntry.player_id = elimEntry.player_id;
  }
  if (validMoney(elimEntry.fee, 0, maxMoney)) {
    sanitziedElimEntry.fee = elimEntry.fee;
  }
  return sanitziedElimEntry;
}

/**
 * validates elimEntry
 * 
 * @param elimEntry - elimEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateElimEntry = (elimEntry: elimEntryType): ErrorCode => { 
  try {
    const errorCode = gotElimEntryData(elimEntry);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validElimEntryData(elimEntry);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of elimEntries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries to validate
 * @returns {elimEntries: elimEntryType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateElimEntries = (elimEntries: elimEntryType[]): validElimEntriesType => {
  
  const blankElimEntries: elimEntryType[] = [];
  const okElimEntries: elimEntryType[] = [];
  if (!Array.isArray(elimEntries) || elimEntries.length === 0) {
    return { elimEntries: blankElimEntries, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < elimEntries.length) {
    const toPost = sanitizeElimEntry(elimEntries[i]);
    const errCode = validateElimEntry(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { elimEntries: okElimEntries, errorCode: errCode };
    }
    okElimEntries.push(toPost);
    i++;
  }
  return { elimEntries: okElimEntries, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotElimEntryData,
  validElimEntryData,
};
