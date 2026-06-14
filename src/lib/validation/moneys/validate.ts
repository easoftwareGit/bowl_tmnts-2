import { validMoney } from "@/lib/currency/validate";
import { MoneyDescrip } from "@prisma/client";
import { isValidBtDbId, isNumber, validSortOrder } from "@/lib/validation/validation";
import { baseIdLength, maxMoney } from "../constants";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { tmntMoneyType, validTmntMoneyType } from "@/lib/types/types";
import { blankTmntMoney } from "@/lib/db/initVals";

/**
 * checks if tmntMoney object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param {tmntMoneyType} tmntMoney - tmntMoney to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotTmntMoneyData = (tmntMoney: tmntMoneyType): ErrorCode => {
  try {
    if (!tmntMoney ||      
      !tmntMoney.id ||
      !tmntMoney.event_id ||
      !tmntMoney.squad_id ||
      !tmntMoney.div_id ||
      !tmntMoney.descrip ||
      (tmntMoney.amount == null) ||
      !tmntMoney.sort_order)
    {
      return ErrorCode.MISSING_DATA
    }
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * checks if amount is valid
 * 
 * @param {unknown} moneyNum - money to check
 * @returns {boolean} - true if amount is valid and not blank; else false
 */
export const validTmntMoneyAmount = (moneyNum: unknown): boolean => {
  if (moneyNum == null || typeof moneyNum !== 'number') return false;
  return validMoney(moneyNum, 0, maxMoney);
};

/**
 * checks if descrip is valid
 * 
 * @param {unknown} descrip - descrip to check
 * @returns {boolean} - true if descrip is valid; else false
 */
export const validDescripValue = (descrip: unknown): descrip is MoneyDescrip => {
  return (
    typeof descrip === "string" &&
    descrip !== MoneyDescrip.ERROR &&
    (Object.values(MoneyDescrip) as string[]).includes(descrip)
  );
};

/**
 * checks if tmntMoney data is valid
 * 
 * @param {tmntMoneyType} tmntMoney - divEntry to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validTmntMoneyData = (tmntMoney: tmntMoneyType): ErrorCode => { 
  try {
    if (!tmntMoney) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(tmntMoney.id, "mon")) {
      return ErrorCode.INVALID_DATA;
    }
    if(!isValidBtDbId(tmntMoney.event_id, "evt")) {
      return ErrorCode.INVALID_DATA;
    }
    if(!isValidBtDbId(tmntMoney.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(tmntMoney.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validDescripValue(tmntMoney.descrip)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validTmntMoneyAmount(tmntMoney.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    if (tmntMoney.pot_id) {
      if (!isValidBtDbId(tmntMoney.pot_id, "pot")) {
        return ErrorCode.INVALID_DATA;
        // if got pot_id, then no brkt_id or elim_id
      } else if (tmntMoney.brkt_id || tmntMoney.elim_id) { 
        return ErrorCode.INVALID_DATA;
      }
    }
    if (tmntMoney.brkt_id) {
      if (!isValidBtDbId(tmntMoney.brkt_id, "brk")) {
        return ErrorCode.INVALID_DATA;
        // if got brkt_id, then no elim_id
      } else if (tmntMoney.elim_id) {
        return ErrorCode.INVALID_DATA;
      }
    }
    if (tmntMoney.elim_id) {
      if (!isValidBtDbId(tmntMoney.elim_id, "elm")) {
        return ErrorCode.INVALID_DATA;
      }
    }
    if (!validSortOrder(tmntMoney.sort_order)) {
      return ErrorCode.INVALID_DATA;
    }    
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes tmntMoney
 * 
 * @param {tmntMoneyType} tmntMoney - tmntMoney to sanitize
 * @returns {tmntMoneyType} - sanitized tmntMoney
 */
export const sanitizeTmntMoney = (tmntMoney: tmntMoneyType): tmntMoneyType => { 
  if (!tmntMoney) return null as any;
  const sanitziedTmntMoney: tmntMoneyType = {
    ...blankTmntMoney    
  }
  if (tmntMoney.id) {
    sanitziedTmntMoney.id = sanitizeBtDbId(tmntMoney.id);
  }
  if (tmntMoney.event_id) {
    sanitziedTmntMoney.event_id = sanitizeBtDbId(tmntMoney.event_id);
  }
  if (tmntMoney.squad_id) {
    sanitziedTmntMoney.squad_id = sanitizeBtDbId(tmntMoney.squad_id);
  }
  if (tmntMoney.div_id) {
    sanitziedTmntMoney.div_id = sanitizeBtDbId(tmntMoney.div_id);
  }
  if (validDescripValue(tmntMoney.descrip)) {
    sanitziedTmntMoney.descrip = tmntMoney.descrip;
  }
  if (tmntMoney.amount !== null) {
    sanitziedTmntMoney.amount = sanitizeMoneyAmount(tmntMoney.amount);
  }  
  if (tmntMoney.pot_id) {    
    sanitziedTmntMoney.pot_id = sanitizeBtDbId(tmntMoney.pot_id);    
  } else { 
    sanitziedTmntMoney.pot_id = null as any;
  }    
  if (tmntMoney.brkt_id) {    
    sanitziedTmntMoney.brkt_id = sanitizeBtDbId(tmntMoney.brkt_id);
  } else {
    sanitziedTmntMoney.brkt_id = null as any;
  }
  if (tmntMoney.elim_id) {    
    sanitziedTmntMoney.elim_id = sanitizeBtDbId(tmntMoney.elim_id);
  } else {
    sanitziedTmntMoney.elim_id = null as any;
  }
  if ((tmntMoney.sort_order === null) || isNumber(tmntMoney.sort_order)) {
    sanitziedTmntMoney.sort_order = tmntMoney.sort_order;
  }
  return sanitziedTmntMoney;
}

/**
 * validates tmntMoney
 * 
 * @param {tmntMoneyType} tmntMoney - tmntMoney to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateTmntMoney = (tmntMoney: tmntMoneyType): ErrorCode => { 
  try {
    const errorCode = gotTmntMoneyData(tmntMoney);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validTmntMoneyData(tmntMoney);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of tmntMoneys
 * 
 * @param {tmntMoneyType[]} tmntMoneys - array of tmntMoneys to validate
 * @returns {tmntMoneys: tmntMoneyType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateTmntMoneys = (tmntMoneys: tmntMoneyType[]): validTmntMoneyType => {
  
  const blankTmntMoneys: tmntMoneyType[] = [];
  const okTmntMoneys: tmntMoneyType[] = [];
  if (!Array.isArray(tmntMoneys) || tmntMoneys.length === 0) {
    return { tmntMoneys: blankTmntMoneys, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < tmntMoneys.length) {
    const toPost = sanitizeTmntMoney(tmntMoneys[i]);
    const errCode = validateTmntMoney(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { tmntMoneys: okTmntMoneys, errorCode: errCode };
    }
    okTmntMoneys.push(toPost);
    i++;
  }
  return { tmntMoneys: okTmntMoneys, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotTmntMoneyData,
  validTmntMoneyData,
};
