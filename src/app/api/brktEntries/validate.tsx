import { validMoney } from "@/lib/currency/validate";
import { blankBrktEntry} from "@/lib/db/initVals";
import { brktEntryType, validBrktEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, isValidTimeStamp, maxBrackets, maxDate, maxMoney, minDate, validTime } from "@/lib/validation";
import { isValid } from "date-fns";
import { cloneDeep, min } from "lodash";

/**
 * checks if brktEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param {brktEntryType} brktEntry - brktEntry to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotBrktEntryData = (brktEntry: brktEntryType): ErrorCode => {
  try {
    if (!brktEntry ||      
      !brktEntry.id ||
      !brktEntry.brkt_id ||
      !brktEntry.player_id ||
      (brktEntry.num_brackets === undefined || brktEntry.num_brackets === null) ||
      !brktEntry.fee ||
      !brktEntry.time_stamp) 
    {
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * checks if number of brackets is valid
 * 
 * @param {number} numBrackets - number of bracket entries for one player
 * @returns {boolean} - true if brackets is valid and not blank; else false
 */
export const validBrktEntryNumBrackets = (numBrackets: number): boolean => {
  if (typeof numBrackets !== 'number') return false
  return Number.isInteger(numBrackets) && numBrackets >= 0 && numBrackets <= maxBrackets;
}

/**
 * checks if fee is valid
 * 
 * @param moneyStr - money to check
 * @returns - true if amount is valid and not blank; else false
 */
export const validBrktEntryFee = (moneyStr: string): boolean => {
  if (!moneyStr) return false;
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if brktEntry data is valid
 * 
 * @param {brktEntryType} brktEntry - brktEntry to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validBrktEntryData = (brktEntry: brktEntryType): ErrorCode => { 
  try {
    if (!brktEntry) return ErrorCode.InvalidData;
    if (!isValidBtDbId(brktEntry.id, "ben")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(brktEntry.brkt_id, "brk")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(brktEntry.player_id, "ply")) {
      return ErrorCode.InvalidData;
    }
    if (!validBrktEntryNumBrackets(brktEntry.num_brackets)) {
      return ErrorCode.InvalidData;
    }
    if (!validBrktEntryFee(brktEntry.fee)) {
      return ErrorCode.InvalidData;
    }
    if (brktEntry.num_brackets === 0 && (brktEntry.fee !== '' || Number(brktEntry.fee) !== 0)) {
      return ErrorCode.InvalidData;      
    }
    if ((brktEntry.fee === '' || Number(brktEntry.fee) === 0) && (brktEntry.num_brackets !== 0)) {
      return ErrorCode.InvalidData;
    } 
    if (brktEntry.time_stamp) {
      if (!isValidTimeStamp(brktEntry.time_stamp) || brktEntry.time_stamp < 0 || brktEntry.time_stamp > maxDate.getTime()) {
        return ErrorCode.InvalidData
      }
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitizes brktEntry
 * 
 * @param {brktEntryType} brktEntry - brktEntry to sanitize
 * @returns {brktEntryType} - sanitized brktEntry
 */
export const sanitizeBrktEntry = (brktEntry: brktEntryType): brktEntryType => { 
  if (!brktEntry) return null as any;
  const sanitziedBrktEntry: brktEntryType = cloneDeep(blankBrktEntry);
  sanitziedBrktEntry.time_stamp = 0;
  if (isValidBtDbId(brktEntry.id, "ben")) {
    sanitziedBrktEntry.id = brktEntry.id;
  }
  if (isValidBtDbId(brktEntry.brkt_id, "brk")) {
    sanitziedBrktEntry.brkt_id = brktEntry.brkt_id;
  }
  if (isValidBtDbId(brktEntry.player_id, "ply")) {
    sanitziedBrktEntry.player_id = brktEntry.player_id;
  }
  if (validBrktEntryNumBrackets(brktEntry.num_brackets)) {
    sanitziedBrktEntry.num_brackets = brktEntry.num_brackets;
  }
  if (validMoney(brktEntry.fee, 0, maxMoney)) {
    sanitziedBrktEntry.fee = brktEntry.fee;
  }
  if (brktEntry.time_stamp && isValidTimeStamp(brktEntry.time_stamp)) {
    sanitziedBrktEntry.time_stamp = brktEntry.time_stamp;
  }
  return sanitziedBrktEntry;
}

/**
 * validates brktEntry
 * 
 * @param brktEntry - brktEntry to validate
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validateBrktEntry = (brktEntry: brktEntryType): ErrorCode => { 
  try {
    const errorCode = gotBrktEntryData(brktEntry);
    if (errorCode !== ErrorCode.None) return errorCode;
    return validBrktEntryData(brktEntry);
  } catch (err) {
    return ErrorCode.OtherError;
  }
}

/**
 * validates array of brktEntries
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries to validate
 * @returns {brktEntries: brktEntryType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateBrktEntries = (brktEntries: brktEntryType[]): validBrktEntriesType => {
  
  const blankBrktEntries: brktEntryType[] = [];
  const okBrktEntries: brktEntryType[] = [];
  if (!Array.isArray(brktEntries) || brktEntries.length === 0) {
    return { brktEntries: blankBrktEntries, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < brktEntries.length) {    
    const errCode = validateBrktEntry(brktEntries[i]);
    if (errCode !== ErrorCode.None) {
      return { brktEntries: okBrktEntries, errorCode: errCode };
    }
    okBrktEntries.push(brktEntries[i]);
    i++;
  }
  return { brktEntries: okBrktEntries, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotBrktEntryData,
  validBrktEntryData,  
};
