import { isValidBtDbId, ErrorCode, isNumber, maxBrackets } from "@/lib/validation";
import { brktRefundType, validBrktRefundsType } from "@/lib/types/types";
import { blankBrktRefund } from "@/lib/db/initVals";

/**
 * checks if brktRefund object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {brktRefundType} brktRefund - brktRefund to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotBrktRefundData = (brktRefund: brktRefundType): ErrorCode => {
  try {
    if (
      !brktRefund ||
      !brktRefund.brkt_entry_id ||
      !isNumber(brktRefund.num_refunds)
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

/**
 * checks if numRefundsvalue is valid
 *
 * @param {number} numRefunds - numRefunds to validate
 * @returns {boolean} - true if valid, else false
 */
export const validNumRefunds = (numRefunds: number): boolean => {
  if (
    !isNumber(numRefunds) ||
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
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError}  
 */
const validBrktRefundData = (brktRefund: brktRefundType): ErrorCode => { 
  try {
    if (!brktRefund) return ErrorCode.InvalidData
    if (!isValidBtDbId(brktRefund.brkt_entry_id, 'ben')) return ErrorCode.InvalidData
    if (!validNumRefunds(brktRefund.num_refunds)) return ErrorCode.InvalidData
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
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
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
export function validateBrktRefund(brktRefund: brktRefundType): ErrorCode {
  try {
    const errCode = gotBrktRefundData(brktRefund);
    if (errCode !== ErrorCode.None) return errCode;
    return validBrktRefundData(brktRefund);
  } catch (error) {
    return ErrorCode.OtherError;   
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
    return { brktRefunds: blankBrktRefunds, errorCode: ErrorCode.MissingData };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < brktRefunds.length) {
    const toPost = sanitizeBrktRefund(brktRefunds[i]);
    const errCode = validateBrktRefund(toPost);
    if (errCode !== ErrorCode.None) {
      return { brktRefunds: okBrktRefunds, errorCode: errCode };
    }
    okBrktRefunds.push(toPost);
    i++;
  }
  return { brktRefunds: okBrktRefunds, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotBrktRefundData, validBrktRefundData
}