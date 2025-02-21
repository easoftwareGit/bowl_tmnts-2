import { validMoney } from "@/lib/currency/validate";
import { blankElimEntry } from "@/lib/db/initVals";
import { elimEntryType, validElimEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation";

/**
 * checks if elimEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param elimEntry - elimEntry to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotElimEntryData = (elimEntry: elimEntryType): ErrorCode => {
  try {
    if (!elimEntry ||      
      !elimEntry.id ||
      !elimEntry.elim_id ||
      !elimEntry.player_id ||      
      !elimEntry.fee)
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
export const validElimEntryFee = (moneyStr: string): boolean => {
  if (!moneyStr) return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if elimEntry data is valid
 * 
 * @param {elimEntryType} elimEntry - elimEntry to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validElimEntryData = (elimEntry: elimEntryType): ErrorCode => { 
  try {
    if (!elimEntry) return ErrorCode.InvalidData;
    if (!isValidBtDbId(elimEntry.id, "een")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(elimEntry.elim_id, "elm")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(elimEntry.player_id, "ply")) {
      return ErrorCode.InvalidData;
    }
    if (!validElimEntryFee(elimEntry.fee)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
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
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validateElimEntry = (elimEntry: elimEntryType): ErrorCode => { 
  try {
    const errorCode = gotElimEntryData(elimEntry);
    if (errorCode !== ErrorCode.None) return errorCode;
    return validElimEntryData(elimEntry);
  } catch (err) {
    return ErrorCode.OtherError;
  }
}

/**
 * validates array of elimEntries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries to validate
 * @returns {elimEntries: elimEntryType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateElimEntries = (elimEntries: elimEntryType[]): validElimEntriesType => {
  
  const blankElimEntries: elimEntryType[] = [];
  const okElimEntries: elimEntryType[] = [];
  if (!Array.isArray(elimEntries) || elimEntries.length === 0) {
    return { elimEntries: blankElimEntries, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < elimEntries.length) {
    const toPost = sanitizeElimEntry(elimEntries[i]);
    const errCode = validateElimEntry(toPost);
    if (errCode !== ErrorCode.None) {
      return { elimEntries: okElimEntries, errorCode: errCode };
    }
    okElimEntries.push(toPost);
    i++;
  }
  return { elimEntries: okElimEntries, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotElimEntryData,
  validElimEntryData,
};
