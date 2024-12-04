import { validMoney } from "@/lib/currency/validate";
import { blankPotEntry } from "@/lib/db/initVals";
import { potEntryType, validPotEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation";

/**
 * checks if potEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param potEntryType - potEntry to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotPotEntryData = (pot: potEntryType): ErrorCode => {
  try {    
    if (!pot
      || !pot.id
      || !pot.pot_id
      || !pot.player_id
      || !pot.fee      
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

/**
 * checks if fee is valid
 * 
 * @param moneyStr - money to check 
 * @returns - true if amount is valid and equal to pot fee; else false
 */
export const validPotEntryFee = (moneyStr: string): boolean => {
  if (!moneyStr) return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if potEntry data is valid
 * 
 * @param potEntry - potEntry to validate 
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validPotEntryData = (potEntry: potEntryType): ErrorCode => { 
  try {
    if (!potEntry) return ErrorCode.InvalidData;
    if (!isValidBtDbId(potEntry.id, "pen")) {
      return ErrorCode.InvalidData;
    }
    if(!isValidBtDbId(potEntry.pot_id, "pot")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(potEntry.player_id, "ply")) {
      return ErrorCode.InvalidData;
    }
    if (!validPotEntryFee(potEntry.fee)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitizes potEntry
 * 
 * @param {potEntryType} potEntry - potEntry to sanitize
 * @returns {potEntryType} - sanitized potEntry
 */
export const sanitizePotEntry = (potEntry: potEntryType): potEntryType => {
  if (!potEntry) return null as any;
  const sanitzedPotEntry: potEntryType = {
    ...blankPotEntry,
  }
  if (isValidBtDbId(potEntry.id, "pen")) {
    sanitzedPotEntry.id = potEntry.id;
  }
  if (isValidBtDbId(potEntry.pot_id, "pot")) {
    sanitzedPotEntry.pot_id = potEntry.pot_id;
  }
  if (isValidBtDbId(potEntry.player_id, "ply")) {
    sanitzedPotEntry.player_id = potEntry.player_id;
  }
  if (validMoney(potEntry.fee, 0, maxMoney)) {
    sanitzedPotEntry.fee = potEntry.fee;
  }
  return sanitzedPotEntry;
}

/**
 * validates potEntry
 * 
 * @param potEntry - potEntry to validate 
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validatePotEntry = (potEntry: potEntryType): ErrorCode => {
  try {
    const errorCode = gotPotEntryData(potEntry);
    if (errorCode !== ErrorCode.None) return errorCode;
    return validPotEntryData(potEntry);
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * validates array of potEntries
 * 
 * @param potEntries - array of potEntries to validate
 * @param potFee - pot fee from pot not from potEntry
 * @returns {potEntries: potEntryType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validatePotEntries = (potEntries: potEntryType[]): validPotEntriesType => {
  const blankPotEntries: potEntryType[] = [];
  const okPotEntries: potEntryType[] = [];
  if (!Array.isArray(potEntries) || potEntries.length === 0) {
    return { potEntries: blankPotEntries, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < potEntries.length) {
    const toPost = sanitizePotEntry(potEntries[i]);
    const errCode = validatePotEntry(toPost);
    if (errCode !== ErrorCode.None) {
      return { potEntries: okPotEntries, errorCode: errCode };
    }    
    okPotEntries.push(toPost);
    i++;
  }
  return { potEntries: okPotEntries, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotPotEntryData,
  validPotEntryData,
};