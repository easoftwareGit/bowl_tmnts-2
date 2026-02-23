import { isValidBtDbId, validSortOrder, isNumber } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitize, sanitizeCurrency } from "@/lib/validation/sanitize";
import { validBtdbMoney, validMoney } from "@/lib/currency/validate";
import type { potType, potCategoriesTypes, idTypes, validPotsType } from "@/lib/types/types";
import { blankPot } from "@/lib/db/initVals";

/**
 * checks if pot object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {potType} pot - pot to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotPotData = (pot: potType): ErrorCode => {
  try {    
    if (!pot
      || !pot.id
      || !pot.div_id
      || !pot.squad_id
      || !sanitize(pot.pot_type)
      || !validMoney(pot.fee, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER)
      || typeof pot.sort_order !== "number"
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if pot type is valid
 * 
 * @param {pot_type} pot_type - pot type to validate
 * @returns {boolean} - true if pot type is valid, else false
 */
const validPotType = (pot_type: potCategoriesTypes): boolean => {
  if (!pot_type) return false;
  const sanitized = sanitize(pot_type);
  // "" is inclided in PotCategories type, but is not a valid value
  return (sanitized === 'Game' || sanitized === 'Last Game' || sanitized === 'Series');  
}

/**
 * checks if pot money is valid
 * 
 * @param {unknown} moneyStr - money to check
 * @returns {boolean} - true if amount is valid and not blank; else false
 */
const validPotMoney = (moneyStr: unknown): boolean => {
  if (!moneyStr || typeof moneyStr !== 'string') return false;
  return validBtdbMoney(moneyStr, 1);
};

/**
 * checks if foreign key is valid
 *
 * @param {string} FkId - foreign key
 * @param {idTypes} idType - id type - 'div' or 'sqd'
 * @returns {boolean} - true if foreign key is valid
 */
const validPotFkId = (FkId: string, idType: idTypes): boolean => {
  if (!FkId || !isValidBtDbId(FkId, idType)) {
    return false;
  }
  return (idType === "div" || idType === "sqd");
};

/**
 * checks if pot data is valid
 *
 * @param {potType} pot - pot object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validPotData = (pot: potType): ErrorCode => {
  try {
    if (!pot) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(pot.id, "pot")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(pot.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(pot.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPotType(pot.pot_type)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPotMoney(pot.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validSortOrder(pot.sort_order)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes a pot object
 *
 * @param {potType} pot - pot to sanitize
 * @returns {potType} - pot object with sanitized data
 */
export const sanitizePot = (pot: potType): potType => {
  if (!pot) return null as any;
  const sanitizedPot = {
    ... blankPot,
    sort_order: null as any,
  };    
  if (isValidBtDbId(pot.id, "pot")) {
    sanitizedPot.id = pot.id;
  }
  if (validPotFkId(pot.div_id, "div")) {
    sanitizedPot.div_id = pot.div_id
  };
  if (validPotFkId(pot.squad_id, "sqd")) {
    sanitizedPot.squad_id = pot.squad_id
  };
  if (validPotType(pot.pot_type)) {    
    sanitizedPot.pot_type = sanitize(pot.pot_type) as potCategoriesTypes;
  }
  // sanitizeCurrency removes trailing zeros
  if (validPotMoney(pot.fee)) {
    sanitizedPot.fee = sanitizeCurrency(pot.fee);
  }
  if ((pot.sort_order === null) || isNumber(pot.sort_order)) {
    sanitizedPot.sort_order = pot.sort_order
  }
  return sanitizedPot
} 

/**
 * validates a pot object
 *
 * @param {potType} pot - pot pot to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export function validatePot(pot: potType): ErrorCode {
  try {
    const errCode = gotPotData(pot);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validPotData(pot);
  } catch (pot) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes and validates an array of pot objects
 * 
 * @param {potType[]} pots - array of pot objects to validate
 * @returns {validPotsType} - {pots:potType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validatePots = (pots: potType[]): validPotsType => {
  
  const blankPots: potType[] = [];
  const okPots: potType[] = [];
  if (!Array.isArray(pots) || pots.length === 0) {
    return { pots: blankPots, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < pots.length) {
    const toPost = sanitizePot(pots[i]);
    const errCode = validatePot(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { pots: okPots, errorCode: errCode };
    }
    okPots.push(toPost);
    i++;
  }
  return { pots: okPots, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotPotData,
  validPotType,
  validPotMoney,
  validPotData,  
  validPotFkId,
};
