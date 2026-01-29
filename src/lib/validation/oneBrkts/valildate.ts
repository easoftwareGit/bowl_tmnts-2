import { isValidBtDbId, ErrorCode, isNumber } from "@/lib/validation/validation";
import { oneBrktType, validOneBrktsType } from "@/lib/types/types";
import { blankOneBrkt } from "@/lib/db/initVals";
import { isInteger } from "lodash";

/**
 * checks if oneBrkt object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {oneBrktType} oneBrkt - oneBrkt to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotOneBrktData = (oneBrkt: oneBrktType): ErrorCode => {
  try {
    if (!oneBrkt
      || !oneBrkt.id
      || !oneBrkt.brkt_id
      || oneBrkt.bindex == null
      || !isNumber(oneBrkt.bindex)
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * checks if bindex is valid
 * 
 * @param {unknown} bindex - bindex to check
 * @returns {boolean} - true if bindex is valid, else false
 */
const validBindex = (bindex: unknown): boolean => {  
  if (bindex == null || !Number.isInteger(bindex)) return false;
  const bindexInt = Number(bindex)
  return (bindexInt < 0 || bindexInt > Number.MAX_SAFE_INTEGER) 
    ? false
    : true;
}

/**
 * checks if oneBrkt data is valid
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to validate
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const validOneBrktData = (oneBrkt: oneBrktType): ErrorCode => { 
  try {
    if (!oneBrkt) return ErrorCode.INVALID_DATA
    if (!isValidBtDbId(oneBrkt.id, 'obk')) return ErrorCode.INVALID_DATA
    if (!isValidBtDbId(oneBrkt.brkt_id, 'brk')) return ErrorCode.INVALID_DATA
    if (!validBindex(oneBrkt.bindex)) return ErrorCode.INVALID_DATA
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
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
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
export function validateOneBrkt(oneBrkt: oneBrktType): ErrorCode {
  try {
    const errCode = gotOneBrktData(oneBrkt);
    if (errCode !== ErrorCode.NONE) return errCode;
    return validOneBrktData(oneBrkt);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;   
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
    return { oneBrkts: blankOneBrkts, errorCode: ErrorCode.MISSING_DATA };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < oneBrkts.length) {
    const toPost = sanitizeOneBrkt(oneBrkts[i]);
    const errCode = validateOneBrkt(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { oneBrkts: okOneBrkts, errorCode: errCode };
    }
    okOneBrkts.push(toPost);
    i++;
  }
  return { oneBrkts: okOneBrkts, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotOneBrktData, validBindex, validOneBrktData
}