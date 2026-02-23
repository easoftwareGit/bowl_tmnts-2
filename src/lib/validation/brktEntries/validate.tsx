import { validMoney } from "@/lib/currency/validate";
import { blankBrktEntry } from "@/lib/db/initVals";
import type {
  brktEntryType,
  validBrktEntriesType,
} from "@/lib/types/types";
import {  
  isValidBtDbId,
  isValidTimeStamp,
  maxBrackets,
  maxDate,
  maxMoney,
  safeNumericEqual,
} from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { cloneDeep } from "lodash";
import { sanitizeCurrency } from "../sanitize";
import { sanitizedTime } from "../squads/validate";

/**
 * checks if brktEntry object has missing data - DOES NOT SANITIZE OR VALIDATE
 * NOTE: num_refunds can be 0 or null, so it is not checked here
 *
 * @param {brktEntryType} brktEntry - brktEntry to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotBrktEntryData = (brktEntry: brktEntryType): ErrorCode => {
  try {
    if (
      !brktEntry ||
      !brktEntry.id ||
      !brktEntry.brkt_id ||
      !brktEntry.player_id ||      
      brktEntry.num_brackets == null ||
      !brktEntry.fee ||
      brktEntry.time_stamp == null   ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if number of brackets is valid
 *
 * @param {unknown} numBrackets - number of bracket entries for one player
 * @returns {boolean} - true if brackets is valid and not blank; else false
 */
export const validBrktEntryNumBrackets = (numBrackets: unknown): boolean => {
  if (typeof numBrackets !== "number") return false;
  return (
    Number.isInteger(numBrackets) &&
    numBrackets > 0 &&
    numBrackets <= maxBrackets
  );
};

/**
 * checks if number of refunds is valid
 * NOTE: if num_refunds null or undefined it is valid
 *
 * @param {unknown} numRefunds - number of refunds for one player
 * @returns {boolean} - true if refunds is valid and not blank; else false
 */
export const validBrktEntryNumRefunds = (numRefunds: unknown): boolean => {
  if (numRefunds === null || numRefunds === undefined) return true;
  if (typeof numRefunds !== "number") return false;
  return (
    Number.isInteger(numRefunds) && numRefunds >= 0 && numRefunds <= maxBrackets
  );
};

/**
 * checks if fee is valid
 *
 * @param moneyStr - money to check
 * @returns - true if amount is valid or blank; else false
 */
export const validBrktEntryFee = (moneyStr: unknown): boolean => {
  if (moneyStr == null || typeof moneyStr !== "string") return false;
  if (moneyStr === "") return true; // blank is ok
  return validMoney(moneyStr, 0, maxMoney);
};

/**
 * checks if brktEntry data is valid
 *
 * @param {brktEntryType} brktEntry - brktEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validBrktEntryData = (brktEntry: brktEntryType): ErrorCode => {
  try {
    if (!brktEntry) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(brktEntry.id, "ben")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(brktEntry.brkt_id, "brk")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(brktEntry.player_id, "ply")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktEntryNumBrackets(brktEntry.num_brackets)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktEntryNumRefunds(brktEntry.num_refunds)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktEntryFee(brktEntry.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    if (
      brktEntry.num_brackets === 0 &&
      brktEntry.fee !== "" &&
      Number(brktEntry.fee) !== 0
    ) {
      return ErrorCode.INVALID_DATA;
    }
    if (
      (brktEntry.fee === "" || Number(brktEntry.fee) === 0) &&
      brktEntry.num_brackets !== 0
    ) {
      return ErrorCode.INVALID_DATA;
    }
    if (brktEntry.num_brackets < brktEntry.num_refunds) {
      return ErrorCode.INVALID_DATA;
    }
    if (brktEntry.time_stamp) {
      if (
        !isValidTimeStamp(brktEntry.time_stamp) ||
        brktEntry.time_stamp < 0 ||
        brktEntry.time_stamp > maxDate.getTime()
      ) {
        return ErrorCode.INVALID_DATA;
      }
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes a brkt entry money string
 *   "" is valid, and sanitized to "0"
 *   all 0's is ok, return "0"
 *   sanitizeCurrency removes trailing zeros
 *
 * @param moneyStr - money string to sanitize
 * @returns {string} - sanitized money string
 */
const sanitizedBrktEntryMoney = (moneyStr: string): string => {
  if (moneyStr === null
    || moneyStr === undefined
    || typeof moneyStr !== "string") return "";  
  if (moneyStr === "" || moneyStr.replace(/^0+/, '') === "") return "0";
  return sanitizeCurrency(moneyStr);
}

/**
 * sanitizes brktEntry
 * 
 * @param {brktEntryType} brktEntry - brktEntry to sanitize
 * @returns {brktEntryType} - sanitized brktEntry  
 */
export const sanitizeBrktEntry = (brktEntry: brktEntryType): brktEntryType => { 
  const sanitziedBrktEntry: brktEntryType = cloneDeep(blankBrktEntry);  
  if (isValidBtDbId(brktEntry.id, "ben")) {
    sanitziedBrktEntry.id = brktEntry.id;
  }
  if (isValidBtDbId(brktEntry.brkt_id, "brk")) {
    sanitziedBrktEntry.brkt_id = brktEntry.brkt_id;
  }
  if (isValidBtDbId(brktEntry.player_id, "ply")) {
    sanitziedBrktEntry.player_id = brktEntry.player_id;
  }
  if (!Number.isNaN(brktEntry.num_brackets) && Number.isSafeInteger(brktEntry.num_brackets)) {
    sanitziedBrktEntry.num_brackets = brktEntry.num_brackets;
  }
  // null or undefined is ok for num_refunds
  if (brktEntry.num_refunds == null || !Number.isNaN(brktEntry.num_refunds) && Number.isSafeInteger(brktEntry.num_refunds)) {
    sanitziedBrktEntry.num_refunds = brktEntry.num_refunds;
  }
  sanitziedBrktEntry.fee = sanitizedBrktEntryMoney(brktEntry.fee);  
  if (!Number.isNaN(brktEntry.time_stamp) && Number.isSafeInteger(brktEntry.time_stamp)) {
    sanitziedBrktEntry.time_stamp = brktEntry.time_stamp;
  }  
  return sanitziedBrktEntry;
}

// /**
//  * sanitizes brktEntry
//  *
//  * @param {brktEntryType} brktEntry - brktEntry to sanitize
//  * @returns {brktEntrySanitizedResult} - sanitized brktEntry
//  */
// export const sanitizeBrktEntry = (
//   brktEntry: brktEntryType,
// ): brktEntrySanitizedResult => {
//   if (!brktEntry)
//     return { brktEntry: null as any, errorCode: ErrorCode.MISSING_DATA };
//   const sanitziedBrktEntry: brktEntryType = cloneDeep(blankBrktEntry);
//   let errorCode = ErrorCode.NONE;
//   sanitziedBrktEntry.time_stamp = 0;
//   if (isValidBtDbId(brktEntry.id, "ben")) {
//     sanitziedBrktEntry.id = brktEntry.id;
//   }
//   if (isValidBtDbId(brktEntry.brkt_id, "brk")) {
//     sanitziedBrktEntry.brkt_id = brktEntry.brkt_id;
//   }
//   if (isValidBtDbId(brktEntry.player_id, "ply")) {
//     sanitziedBrktEntry.player_id = brktEntry.player_id;
//   }
//   if (
//     typeof brktEntry.num_brackets === "number" &&
//     !isNaN(brktEntry.num_brackets)
//   ) {
//     sanitziedBrktEntry.num_brackets = brktEntry.num_brackets;
//   } else if (
//     typeof brktEntry.num_brackets === "string" &&
//     (brktEntry.num_brackets as string).trim() !== "" &&
//     !isNaN(Number(brktEntry.num_brackets))
//   ) {
//     sanitziedBrktEntry.num_brackets = Number(brktEntry.num_brackets);
//   }
//   if (brktEntry.num_refunds == null) {
//     sanitziedBrktEntry.num_refunds = brktEntry.num_refunds;
//   } else {
//     if (!isNaN(Number(brktEntry.num_refunds))) {
//       sanitziedBrktEntry.num_refunds = Number(brktEntry.num_refunds);
//     } else {
//       errorCode = ErrorCode.INVALID_DATA;
//     }
//   }
//   if (validMoney(brktEntry.fee, 0, maxMoney)) {
//     sanitziedBrktEntry.fee = brktEntry.fee;
//   }
//   if (brktEntry.time_stamp && isValidTimeStamp(brktEntry.time_stamp)) {
//     sanitziedBrktEntry.time_stamp = brktEntry.time_stamp;
//   }
//   return { brktEntry: sanitziedBrktEntry, errorCode };
// };

/**
 * validates brktEntry
 *
 * @param brktEntry - brktEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateBrktEntry = (brktEntry: brktEntryType): ErrorCode => {
  try {
    const errorCode = gotBrktEntryData(brktEntry);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validBrktEntryData(brktEntry);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * validates array of brktEntries
 *
 * @param {brktEntryType[]} brktEntries - array of brktEntries to validate
 * @returns {brktEntries: brktEntryType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateBrktEntries = (
  brktEntries: brktEntryType[],
): validBrktEntriesType => {
  const blankBrktEntries: brktEntryType[] = [];
  const okBrktEntries: brktEntryType[] = [];
  if (!Array.isArray(brktEntries) || brktEntries.length === 0) {
    return { brktEntries: blankBrktEntries, errorCode: ErrorCode.MISSING_DATA };
  }
  // cannot use forEach because if got an error need exit loop
  let i = 0;
  while (i < brktEntries.length) {
    const sanitized = sanitizeBrktEntry(brktEntries[i]);
    if (sanitized.num_brackets !== brktEntries[i].num_brackets ||
      sanitized.num_refunds !== brktEntries[i].num_refunds ||
      !safeNumericEqual(sanitized.fee, brktEntries[i].fee) ||
      sanitized.time_stamp !== brktEntries[i].time_stamp
    ) {        
      return { brktEntries: okBrktEntries, errorCode: ErrorCode.INVALID_DATA };
    }

    const errCode = validateBrktEntry(sanitized);
    if (errCode !== ErrorCode.NONE) {
      return { brktEntries: okBrktEntries, errorCode: errCode };
    }
    okBrktEntries.push(sanitized);
    i++;
  }
  return { brktEntries: okBrktEntries, errorCode: ErrorCode.NONE };
};

export const exportedForTesting = {
  gotBrktEntryData,
  sanitizedBrktEntryMoney,
  validBrktEntryData,
};
