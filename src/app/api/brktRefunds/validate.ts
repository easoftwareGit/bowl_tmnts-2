import { blankBrktRefund } from "@/lib/db/initVals";
import { brktRefundType, validBrktRefundsType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxBrackets } from "@/lib/validation";
import { cloneDeep } from "lodash";

/**
 * checks if brktRefund object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param {brktRefundType} brktRefund - brktRefund to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotBrktRefundData = (brktRefund: brktRefundType): ErrorCode => {
  try {
    if (!brktRefund ||      
      !brktRefund.id ||
      !brktRefund.brkt_id ||
      !brktRefund.player_id ||
      (brktRefund.num_refunds === undefined || brktRefund.num_refunds === null)) 
    {
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * checks if number of refunds is valid
 * 
 * @param {number} numRefunds - number of refund entries for one player
 * @returns {boolean} - true if refunds is valid and not blank; else false
 */
export const validBrktRefundNumRefunds = (numRefunds: number): boolean => {
  if (typeof numRefunds !== 'number') return false
  return Number.isInteger(numRefunds) && numRefunds > 0 && numRefunds <= maxBrackets;
}

/**
 * checks if brktRefund data is valid
 * 
 * @param {brktRefundType} brktRefund - brktRefund to validate
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validBrktRefundData = (brktRefund: brktRefundType): ErrorCode => {
  try {
    if (!brktRefund) return ErrorCode.InvalidData;
    if (gotBrktRefundData(brktRefund) !== ErrorCode.None) return ErrorCode.InvalidData;
    if (!isValidBtDbId(brktRefund.id, 'brf')) return ErrorCode.InvalidData;
    if (!isValidBtDbId(brktRefund.brkt_id, 'brk')) return ErrorCode.InvalidData;
    if (!isValidBtDbId(brktRefund.player_id, 'ply')) return ErrorCode.InvalidData;
    if (!validBrktRefundNumRefunds(brktRefund.num_refunds)) return ErrorCode.InvalidData;
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizes brktRefund object
 * 
 * @param {brktRefundType} brktRefund - brktRefund to sanitize
 * @returns {brktRefundType} - sanitized brktRefund
 */
export const sanitizeBrktRefund = (brktRefund: brktRefundType): brktRefundType => {
  if (!brktRefund) return null as any;
  const sanitizedBrktRefund = cloneDeep(blankBrktRefund);
  if (isValidBtDbId(brktRefund.id, 'brf')) { 
    sanitizedBrktRefund.id = brktRefund.id;
  }
  if (isValidBtDbId(brktRefund.brkt_id, 'brk')) { 
    sanitizedBrktRefund.brkt_id = brktRefund.brkt_id;
  }
  if (isValidBtDbId(brktRefund.player_id, 'ply')) {
    sanitizedBrktRefund.player_id = brktRefund.player_id;
  }
  if (validBrktRefundNumRefunds(brktRefund.num_refunds)) {
    sanitizedBrktRefund.num_refunds = brktRefund.num_refunds;
  }
  return sanitizedBrktRefund;
}

/**
 * checks if brktRefund data is valid
 * 
 * @param {brktRefundType} brktRefund - brktRefund to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validateBrktRefund = (brktRefund: brktRefundType): ErrorCode => {
  try { 
    const errCode = gotBrktRefundData(brktRefund);
    if (errCode !== ErrorCode.None) return errCode;
    return validBrktRefundData(brktRefund);    
  } catch (err) {
    return ErrorCode.OtherError;
  }
}

export const validateBrktRefunds = (brktRefunds: brktRefundType[]): validBrktRefundsType => {
  const blankBrktRefunds: brktRefundType[] = [];
  const okBrktRefunds: brktRefundType[] = [];
  if (!Array.isArray(brktRefunds) || brktRefunds.length === 0) {
    return { brktRefunds: blankBrktRefunds, errorCode: ErrorCode.MissingData };
  }
  // cannot use forEach because if got an error need exit loop
  let i = 0;
  while (i < brktRefunds.length) {
    const errCode = validateBrktRefund(brktRefunds[i]);
    if (errCode !== ErrorCode.None) {
      return { brktRefunds: okBrktRefunds, errorCode: errCode };
    }
    okBrktRefunds.push(brktRefunds[i]);
    i++;
  }
  return { brktRefunds: okBrktRefunds, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotBrktRefundData,
  validBrktRefundData,
};