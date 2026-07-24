import { isValidBtDbId, isNumber, validPfAmount, validPfPosition } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { elimPfType, validElimPfsType } from "@/lib/types/types";
import { blankElimPf } from "@/lib/db/initVals";

/**
 * Checks if the elimPf object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {elimPfType} elimPf - The elimPf to validate
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotElimPfData = (elimPf: elimPfType): ErrorCode => {
  try {
    if (!elimPf ||
      !elimPf.id ||
      !elimPf.elim_id ||
      (elimPf.position === null) ||
      (elimPf.amount === null))
    {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }    
};

/**
 * checks if elimPf data is valid
 * 
 * @param {elimPfType} elimPf - elimPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validElimPfData = (elimPf: elimPfType): ErrorCode => { 
  try {
    if (!elimPf) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(elimPf.id, "epf")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elimPf.elim_id, "elm")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfPosition(elimPf.position)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfAmount(elimPf.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes elimPf
 * 
 * @param {elimPfType} elimPf - elimPf to sanitize
 * @returns {elimPfType} - sanitized elimPf
 */
export const sanitizeElimPf = (elimPf: elimPfType): elimPfType => { 
  if (!elimPf) return null as any;
  const sanitziedElimPf: elimPfType = {
    ...blankElimPf,    
  }
  if (elimPf.id) {
    sanitziedElimPf.id = sanitizeBtDbId(elimPf.id);
  }
  if (elimPf.elim_id) {
    sanitziedElimPf.elim_id = sanitizeBtDbId(elimPf.elim_id);
  }
  if (elimPf.position === null || isNumber(elimPf.position)) {
    sanitziedElimPf.position = elimPf.position;
  }
  if (elimPf.amount !== null) {
    sanitziedElimPf.amount = sanitizeMoneyAmount(elimPf.amount);
  }  
  return sanitziedElimPf;
}

/**
 * validates elimPf
 * 
 * @param {elimPfType} elimPf - elimPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validateElimPf = (elimPf: elimPfType): ErrorCode => { 
  try {
    const errorCode = gotElimPfData(elimPf);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validElimPfData(elimPf);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of elimPfs
 * 
 * @param {elimPfType[]} elimPfs - array of elimPfType to validate
 * @returns {elimPfs: elimPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateElimPfs = (elimPfs: elimPfType[]): validElimPfsType => {
  
  const blankElimPfs: elimPfType[] = [];
  const okElimPfs: elimPfType[] = [];
  if (!Array.isArray(elimPfs) || elimPfs.length === 0) {
    return { elimPfs: blankElimPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  let firstElimId = "";
  while (i < elimPfs.length) {
    const toPost = sanitizeElimPf(elimPfs[i]);
    const errCode = validateElimPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { elimPfs: okElimPfs, errorCode: errCode };
    }
    // all elimPfs MUST have same elim_id
    if (i === 0) {
      firstElimId = toPost.elim_id;      
    } else if (firstElimId !== toPost.elim_id) {
      return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all elimPfs MUST have sequential positions, starting at 1
    if (elimPfs[i].position !== i + 1) {
      return { elimPfs: okElimPfs, errorCode: ErrorCode.INVALID_DATA };      
    }
    okElimPfs.push(toPost);    
    i++;
  }
  return { elimPfs: okElimPfs, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotElimPfData,
  validElimPfData,
};
