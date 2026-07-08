import { validMoney } from "@/lib/currency/validate";
import { isValidBtDbId, validInteger, isNumber } from "@/lib/validation/validation";
import { maxMoney, maxPosition } from "../constants";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { divPfType, validDivPfsType } from "@/lib/types/types";
import { blankDivPf } from "@/lib/db/initVals";

/**
 * Checks if the divPf object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {divPfType} divPf - The divPf to validate
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotDivPfData = (divPf: divPfType): ErrorCode => {
  try {
    if (!divPf ||
      !divPf.id ||
      !divPf.div_id ||
      (divPf.position === null) ||
      (divPf.amount === null))
    {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }    
};

/**
 * checks if position is valid
 * 
 * @param {unknown} positionNum - money to check
 * @returns {boolean} - true if amount is valid and not blank; else false
 */
export const validDivPfPosition = (positionNum: unknown): boolean => {
  if (positionNum == null || typeof positionNum !== 'number') return false;
  return (
    validInteger(positionNum) &&
    positionNum > 0 &&
    positionNum < maxPosition
  ) ? true : false;  
};

/**
 * checks if amount is valid
 * 
 * @param {unknown} moneyNum - money to check
 * @returns {boolean} - true if amount is valid and not blank; else false
 */
export const validDivPfAmount = (moneyNum: unknown): boolean => {
  if (moneyNum == null || typeof moneyNum !== 'number') return false;
  return validMoney(moneyNum, 0, maxMoney);
};

/**
 * checks if divPf data is valid
 * 
 * @param {divPfType} divPf - divPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validDivPfData = (divPf: divPfType): ErrorCode => { 
  try {
    if (!divPf) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(divPf.id, "dpf")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(divPf.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validDivPfPosition(divPf.position)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validDivPfAmount(divPf.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes divPf
 * 
 * @param {divPfType} divPf - divPf to sanitize
 * @returns {divPfType} - sanitized divPf
 */
export const sanitizeDivPf = (divPf: divPfType): divPfType => { 
  if (!divPf) return null as any;
  const sanitziedDivPf: divPfType = {
    ...blankDivPf,    
  }
  if (divPf.id) {
    sanitziedDivPf.id = sanitizeBtDbId(divPf.id);
  }
  if (divPf.div_id) {
    sanitziedDivPf.div_id = sanitizeBtDbId(divPf.div_id);
  }
  if (divPf.position === null || isNumber(divPf.position)) {
    sanitziedDivPf.position = divPf.position;
  }
  if (divPf.amount !== null) {
    sanitziedDivPf.amount = sanitizeMoneyAmount(divPf.amount);
  }  
  return sanitziedDivPf;
}

/**
 * validates divPf
 * 
 * @param {divPfType} divPf - divPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateDivPf = (divPf: divPfType): ErrorCode => { 
  try {
    const errorCode = gotDivPfData(divPf);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validDivPfData(divPf);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of divPfs
 * 
 * @param {divPfType[]} tmntMoneys - array of tmntMoneys to validate
 * @returns {divPfs: divPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateDivPfs = (divPfs: divPfType[]): validDivPfsType => {
  
  const blankDivPfs: divPfType[] = [];
  const okDivPfs: divPfType[] = [];
  if (!Array.isArray(divPfs) || divPfs.length === 0) {
    return { divPfs: blankDivPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  let firstDivId = "";
  while (i < divPfs.length) {
    const toPost = sanitizeDivPf(divPfs[i]);
    const errCode = validateDivPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { divPfs: okDivPfs, errorCode: errCode };
    }
    // all divPfs MUST have same div_id
    if (i === 0) {
      firstDivId = toPost.div_id;      
    } else if (firstDivId !== toPost.div_id) {
      return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all divPfs MUST have sequential positions, starting at 1
    if (divPfs[i].position !== i + 1) {
      return { divPfs: okDivPfs, errorCode: ErrorCode.INVALID_DATA };      
    }
    okDivPfs.push(toPost);    
    i++;
  }
  return { divPfs: okDivPfs, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotDivPfData,
  validDivPfData,
};
