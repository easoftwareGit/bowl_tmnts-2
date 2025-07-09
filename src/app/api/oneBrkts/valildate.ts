import { isValidBtDbId, ErrorCode, isNumber } from "@/lib/validation";
import { oneBrktType, validOneBrktsType } from "@/lib/types/types";
import { blankOneBrkt } from "@/lib/db/initVals";

/**
 * checks if oneBrkt object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {oneBrktType} oneBrkt - oneBrkt to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotOneBrktData = (oneBrkt: oneBrktType): ErrorCode => {
  try {
    if (!oneBrkt
      || !oneBrkt.id
      || !oneBrkt.brkt_id
      || oneBrkt.bindex == null
      || !isNumber(oneBrkt.bindex)
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * checks if bindex is valid
 * 
 * @param {number} bindex - bindex to check
 * @returns {boolean} - true if bindex is valid, else false
 */
const validBindex = (bindex: number): boolean => {
  if (!isNumber(bindex) || bindex < 0 || !Number.isInteger(bindex) || bindex > Number.MAX_SAFE_INTEGER) {
    return false;
  }
  return true;
}

/**
 * checks if oneBrkt data is valid
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to validate
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const validOneBrktData = (oneBrkt: oneBrktType): ErrorCode => { 
  try {
    if (!oneBrkt) return ErrorCode.InvalidData
    if (!isValidBtDbId(oneBrkt.id, 'obk')) return ErrorCode.InvalidData
    if (!isValidBtDbId(oneBrkt.brkt_id, 'brk')) return ErrorCode.InvalidData
    if (!validBindex(oneBrkt.bindex)) return ErrorCode.InvalidData
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizes oneBrkt
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to sanitize
 * @returns {oneBrktType} - sanitized oneBrkt
 */
export const sanitizeOneBrkt = (oneBrkt: oneBrktType): oneBrktType => { 
  if (!oneBrkt) return null as any;
  const sanitziedOneBrkt: oneBrktType = {
    ...blankOneBrkt,
  }
  if (isValidBtDbId(oneBrkt.id, 'obk')) sanitziedOneBrkt.id = oneBrkt.id;
  if (isValidBtDbId(oneBrkt.brkt_id, 'brk')) sanitziedOneBrkt.brkt_id = oneBrkt.brkt_id;
  if (validBindex(oneBrkt.bindex)) sanitziedOneBrkt.bindex = oneBrkt.bindex;
  return sanitziedOneBrkt;
}

/**
 * validates oneBrkt data
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to validate 
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
export function validateOneBrkt(oneBrkt: oneBrktType): ErrorCode {
  try {
    const errCode = gotOneBrktData(oneBrkt);
    if (errCode !== ErrorCode.None) return errCode;
    return validOneBrktData(oneBrkt);
  } catch (error) {
    return ErrorCode.OtherError;   
  }
}

/**
 * sanitizes and validates an array of oneBrkt objects
 * 
 * @param {oneBrktType[]} oneBrkts - array of oneBrkt objects to validate
 * @returns {validOneBrktsType} - object containing valid oneBrkts and error code 
 */
export const validateOneBrkts = (oneBrkts: oneBrktType[]): validOneBrktsType => {
  const blankOneBrkts: oneBrktType[] = [];
  const okOneBrkts: oneBrktType[] = [];
  if (!Array.isArray(oneBrkts) || oneBrkts.length === 0) {
    return { oneBrkts: blankOneBrkts, errorCode: ErrorCode.MissingData };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < oneBrkts.length) {
    const toPost = sanitizeOneBrkt(oneBrkts[i]);
    const errCode = validateOneBrkt(toPost);
    if (errCode !== ErrorCode.None) {
      return { oneBrkts: okOneBrkts, errorCode: errCode };
    }
    okOneBrkts.push(toPost);
    i++;
  }
  return { oneBrkts: okOneBrkts, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotOneBrktData, validBindex, validOneBrktData
}