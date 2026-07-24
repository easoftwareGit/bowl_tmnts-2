import { isValidBtDbId, isNumber, validPfAmount, validPfPosition } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { potPfType, validPotPfsType } from "@/lib/types/types";
import { blankPotPf } from "@/lib/db/initVals";

/**
 * Checks if the potPf object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {potPfType} potPf - The potPf to validate
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotPotPfData = (potPf: potPfType): ErrorCode => {
  try {
    if (!potPf ||
      !potPf.id ||
      !potPf.pot_id ||
      (potPf.position === null) ||
      (potPf.amount === null))
    {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }    
};

/**
 * checks if potPf data is valid
 * 
 * @param {potPfType} potPf - potPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validPotPfData = (potPf: potPfType): ErrorCode => { 
  try {
    if (!potPf) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(potPf.id, "ppf")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(potPf.pot_id, "pot")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfPosition(potPf.position)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPfAmount(potPf.amount)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes potPf
 * 
 * @param {potPfType} potPf - potPf to sanitize
 * @returns {potPfType} - sanitized potPf
 */
export const sanitizePotPf = (potPf: potPfType): potPfType => { 
  if (!potPf) return null as any;
  const sanitziedPotPf: potPfType = {
    ...blankPotPf,    
  }
  if (potPf.id) {
    sanitziedPotPf.id = sanitizeBtDbId(potPf.id);
  }
  if (potPf.pot_id) {
    sanitziedPotPf.pot_id = sanitizeBtDbId(potPf.pot_id);
  }
  if (potPf.position === null || isNumber(potPf.position)) {
    sanitziedPotPf.position = potPf.position;
  }
  if (potPf.amount !== null) {
    sanitziedPotPf.amount = sanitizeMoneyAmount(potPf.amount);
  }  
  return sanitziedPotPf;
}

/**
 * validates potPf
 * 
 * @param {potPfType} potPf - potPf to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export const validatePotPf = (potPf: potPfType): ErrorCode => { 
  try {
    const errorCode = gotPotPfData(potPf);
    if (errorCode !== ErrorCode.NONE) return errorCode;
    return validPotPfData(potPf);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * validates array of potPfs
 * 
 * @param {potPfType[]} potPfs - array of potPfType to validate
 * @returns {potPfs: potPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validatePotPfs = (potPfs: potPfType[]): validPotPfsType => {
  
  const blankPotPfs: potPfType[] = [];
  const okPotPfs: potPfType[] = [];
  if (!Array.isArray(potPfs) || potPfs.length === 0) {
    return { potPfs: blankPotPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  let firstPotId = "";
  while (i < potPfs.length) {
    const toPost = sanitizePotPf(potPfs[i]);
    const errCode = validatePotPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { potPfs: okPotPfs, errorCode: errCode };
    }
    // all potPfs MUST have same pot_id
    if (i === 0) {
      firstPotId = toPost.pot_id;      
    } else if (firstPotId !== toPost.pot_id) {
      return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all potPfs MUST have sequential positions, starting at 1
    if (potPfs[i].position !== i + 1) {
      return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };      
    }
    okPotPfs.push(toPost);    
    i++;
  }
  return { potPfs: okPotPfs, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotPotPfData,
  validPotPfData,
};
