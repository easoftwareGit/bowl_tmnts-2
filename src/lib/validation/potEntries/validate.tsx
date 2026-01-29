import { validMoney } from "@/lib/currency/validate";
import { blankPotEntry } from "@/lib/db/initVals";
import { potEntryType, validPotEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxMoney } from "@/lib/validation/validation";

/**
 * checks if potEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param potEntryType - potEntry to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotPotEntryData = (pot: potEntryType): ErrorCode => {
  try {    
    if (!pot
      || !pot.id
      || !pot.pot_id
      || !pot.player_id
      || !pot.fee      
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if fee is valid
 * 
 * @param moneyStr {unknown} - money to check 
 * @returns {boolean} - true if amount is valid and equal to pot fee; else false
 */
export const validPotEntryFee = (moneyStr: unknown): boolean => {
  if (!moneyStr || typeof moneyStr !== 'string') return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if potEntry data is valid
 * 
 * @param potEntry - potEntry to validate 
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validPotEntryData = (potEntry: potEntryType): ErrorCode => { 
  try {
    if (!potEntry) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(potEntry.id, "pen")) {
      return ErrorCode.INVALID_DATA;
    }
    if(!isValidBtDbId(potEntry.pot_id, "pot")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(potEntry.player_id, "ply")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPotEntryFee(potEntry.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
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
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validatePotEntry = (potEntry: potEntryType): ErrorCode => {
  try {
    const errorCode = gotPotEntryData(potEntry);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validPotEntryData(potEntry);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of potEntries
 * 
 * @param potEntries - array of potEntries to validate
 * @param potFee - pot fee from pot not from potEntry
 * @returns {potEntries: potEntryType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validatePotEntries = (potEntries: potEntryType[]): validPotEntriesType => {
  const blankPotEntries: potEntryType[] = [];
  const okPotEntries: potEntryType[] = [];
  if (!Array.isArray(potEntries) || potEntries.length === 0) {
    return { potEntries: blankPotEntries, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < potEntries.length) {
    const toPost = sanitizePotEntry(potEntries[i]);
    const errCode = validatePotEntry(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { potEntries: okPotEntries, errorCode: errCode };
    }    
    okPotEntries.push(toPost);
    i++;
  }
  return { potEntries: okPotEntries, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotPotEntryData,
  validPotEntryData,
};