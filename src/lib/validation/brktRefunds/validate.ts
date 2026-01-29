import { isValidBtDbId, ErrorCode, isNumber, maxBrackets } from "@/lib/validation/validation";
import { brktRefundType, validBrktRefundsType } from "@/lib/types/types";
import { blankBrktRefund } from "@/lib/db/initVals";

/**
 * checks if brktRefund object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {brktRefundType} brktRefund - brktRefund to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotBrktRefundData = (brktRefund: brktRefundType): ErrorCode => {
  try {
    if (
      !brktRefund ||
      !brktRefund.brkt_entry_id ||
      !isNumber(brktRefund.num_refunds)
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if numRefundsvalue is valid
 *
 * @param {unknown} numRefunds - numRefunds to validate
 * @returns {boolean} - true if valid, else false
 */
export const validNumRefunds = (numRefunds: unknown): boolean => {
  if (!isNumber(numRefunds) || typeof numRefunds !== "number") return false;
  if (
    numRefunds <= 0 ||
    !Number.isInteger(numRefunds) ||
    numRefunds >= maxBrackets
  ) {
    return false;
  }
  return true;
};

/**
 * checks if brktRefund data is valid
 * 
 * @param {brktRefundType} brktRefund - brktRefund to validate
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR}  
 */
const validBrktRefundData = (brktRefund: brktRefundType): ErrorCode => { 
  try {
    if (!brktRefund) return ErrorCode.INVALID_DATA
    if (!isValidBtDbId(brktRefund.brkt_entry_id, 'ben')) return ErrorCode.INVALID_DATA
    if (!validNumRefunds(brktRefund.num_refunds)) return ErrorCode.INVALID_DATA
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * sanitizes brktRefund
 * 
 * @param {brktRefundType} brktRefund - brktRefund to sanitize
 * @returns {brktRefundType} - sanitized brktRefund
 */
export const sanitizeBrktRefund = (brktRefund: brktRefundType): brktRefundType => { 
  if (!brktRefund) return null as any;
  const sanitziedBrktRefund: brktRefundType = {
    ...blankBrktRefund,
  }
  if (isValidBtDbId(brktRefund.brkt_entry_id, 'ben')) sanitziedBrktRefund.brkt_entry_id = brktRefund.brkt_entry_id;  
  if (validNumRefunds(brktRefund.num_refunds)) sanitziedBrktRefund.num_refunds = brktRefund.num_refunds;
  return sanitziedBrktRefund;
}

/**
 * validates brktRefund data
 * 
 * @param {brktRefundType} brktRefund - brktRefund to validate 
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
export function validateBrktRefund(brktRefund: brktRefundType): ErrorCode {
  try {
    const errCode = gotBrktRefundData(brktRefund);
    if (errCode !== ErrorCode.NONE) return errCode;
    return validBrktRefundData(brktRefund);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;   
  }
}

/**
 * sanitizes and validates an array of brktRefund objects
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefund objects to validate
 * @returns {validBrktRefundsType} - object containing valid brktRefund and error code 
 */
export const validateBrktRefunds = (brktRefunds: brktRefundType[]): validBrktRefundsType => {
  const blankBrktRefunds: brktRefundType[] = [];
  const okBrktRefunds: brktRefundType[] = [];
  if (!Array.isArray(brktRefunds) || brktRefunds.length === 0) {
    return { brktRefunds: blankBrktRefunds, errorCode: ErrorCode.MISSING_DATA };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < brktRefunds.length) {
    const toPost = sanitizeBrktRefund(brktRefunds[i]);
    const errCode = validateBrktRefund(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { brktRefunds: okBrktRefunds, errorCode: errCode };
    }
    okBrktRefunds.push(toPost);
    i++;
  }
  return { brktRefunds: okBrktRefunds, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotBrktRefundData, validBrktRefundData
}