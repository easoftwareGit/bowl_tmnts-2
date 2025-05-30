import { validMoney } from "@/lib/currency/validate";
import { blankBrktEntry} from "@/lib/db/initVals";
import { brktEntrySanitizedResult, brktEntryType, validBrktEntriesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, isValidTimeStamp, maxBrackets, maxDate, maxMoney, minDate, validTime } from "@/lib/validation";
import { cloneDeep, isNumber } from "lodash";

/**
 * checks if brktEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * NOTE: num_refunds can be 0 or null, so it is not checked here
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
 * checks if number of refunds is valid 
 * NOTE: if num_refunds null or undefined it is valid
 * 
 * @param {number} numRefunds - number of refunds for one player
 * @returns {boolean} - true if refunds is valid and not blank; else false
 */
export const validBrktEntryNumRefunds = (numRefunds: number): boolean => { 
  if (numRefunds === null || numRefunds === undefined) return true;
  if (typeof numRefunds !== 'number') return false;
  return Number.isInteger(numRefunds) && numRefunds >= 0 && numRefunds <= maxBrackets;
}

/**
 * checks if fee is valid
 * 
 * @param moneyStr - money to check
 * @returns - true if amount is valid or blank; else false
 */
export const validBrktEntryFee = (moneyStr: string): boolean => {  
  if (moneyStr == null) return false; // == tests for null and undefined
  if (moneyStr === '') return true;   // blank is ok  
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
    if (!validBrktEntryNumRefunds(brktEntry.num_refunds)) {
      return ErrorCode.InvalidData;
    }
    if (!validBrktEntryFee(brktEntry.fee)) {
      return ErrorCode.InvalidData;
    }
    if (brktEntry.num_brackets === 0 && (brktEntry.fee !== '' && Number(brktEntry.fee) !== 0)) {
      return ErrorCode.InvalidData;      
    }
    if ((brktEntry.fee === '' || Number(brktEntry.fee) === 0) && (brktEntry.num_brackets !== 0)) {
      return ErrorCode.InvalidData;
    }     
    if (brktEntry.num_brackets < brktEntry.num_refunds) { 
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
 * @returns {brktEntrySanitizedResult} - sanitized brktEntry
 */
export const sanitizeBrktEntry = (brktEntry: brktEntryType): brktEntrySanitizedResult => { 
  if (!brktEntry) return { brktEntry: null as any, errorCode: ErrorCode.MissingData};
  const sanitziedBrktEntry: brktEntryType = cloneDeep(blankBrktEntry);
  let errorCode = ErrorCode.None;
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
  // if (brktEntry.num_brackets == null || isNumber(brktEntry.num_brackets)) {
  //   sanitziedBrktEntry.num_brackets = brktEntry.num_brackets;
  // }
  // if (brktEntry.num_refunds == null || isNumber(brktEntry.num_refunds)) {
  //   sanitziedBrktEntry.num_refunds = brktEntry.num_refunds;
  // }
  if (typeof brktEntry.num_brackets === 'number' && !isNaN(brktEntry.num_brackets)) {
    sanitziedBrktEntry.num_brackets = brktEntry.num_brackets;
  } else if (typeof brktEntry.num_brackets === 'string'
    && (brktEntry.num_brackets as string).trim() !== ''
    && !isNaN(Number(brktEntry.num_brackets)))
  {
    sanitziedBrktEntry.num_brackets = Number(brktEntry.num_brackets);
  }
  if (brktEntry.num_refunds == null) {
    sanitziedBrktEntry.num_refunds = brktEntry.num_refunds;
  } else {
    if (!isNaN(Number(brktEntry.num_refunds))) {
      sanitziedBrktEntry.num_refunds = Number(brktEntry.num_refunds);
    } else {
      errorCode = ErrorCode.InvalidData;
    }
  }
  if (validMoney(brktEntry.fee, 0, maxMoney)) {
    sanitziedBrktEntry.fee = brktEntry.fee;
  }
  if (brktEntry.time_stamp && isValidTimeStamp(brktEntry.time_stamp)) {
    sanitziedBrktEntry.time_stamp = brktEntry.time_stamp;
  }
  return { brktEntry: sanitziedBrktEntry, errorCode };
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
    const sanitizedObj = sanitizeBrktEntry(brktEntries[i]);
    if (sanitizedObj.errorCode !== ErrorCode.None) { 
      return { brktEntries: okBrktEntries, errorCode: sanitizedObj.errorCode };
    }
    const errCode = validateBrktEntry(sanitizedObj.brktEntry);
    if (errCode !== ErrorCode.None) {
      return { brktEntries: okBrktEntries, errorCode: errCode };
    }
    okBrktEntries.push(sanitizedObj.brktEntry);
    i++;
  }
  return { brktEntries: okBrktEntries, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotBrktEntryData,
  validBrktEntryData,  
};
