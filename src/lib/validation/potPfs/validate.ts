import { isValidBtDbId, isNumber, validPfAmount, validPfPosition } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeBtDbId, sanitizeMoneyAmount } from "../sanitize";
import { potPfDataType, potPfSaveDataType, potPfType, validPotPfsType } from "@/lib/types/types";
import { blankPotPf } from "@/lib/db/initVals";
import { maxMoney } from "../constants";

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
 * checks if value is potPfDataType
 *
 * @param {unknown} value - value to check
 * @return {boolean} - true if value is potPfDataType
 */
const isPotPfDataType = (value: unknown): value is potPfDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const potPf = value as Record<string, unknown>;

  return (
    typeof potPf.id === "string" &&
    typeof potPf.pot_id === "string" &&
    typeof potPf.position === "number" &&
    typeof potPf.amount === "number"
  );
};

/**
 * checks if value is potPfSaveDataType
 * 
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is potPfSaveDataType
 */
export const isPotPfSaveDataType = (value: unknown): value is potPfSaveDataType => {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    Array.isArray(data.potPfData) &&
    data.potPfData.every(isPotPfDataType) &&
    Array.isArray(data.potIds) &&
    data.potIds.every((id) => typeof id === "string")
  );
};

/**
 * validates array of potPfs
 * 
 * @param {potPfType[]} potPfs - array of potPfType to validate
 * @param {string[]} potIds - array of pot ids for the tournament
 * @returns {potPfs: potPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validatePotPfs = (potPfs: potPfType[], potIds: string[]): validPotPfsType => {
  
  const blankPotPfs: potPfType[] = [];
  const okPotPfs: potPfType[] = [];
  if (!Array.isArray(potPfs) || potPfs.length === 0) {
    return { potPfs: blankPotPfs, errorCode: ErrorCode.MISSING_DATA };
  };
  if (!Array.isArray(potIds) || potIds.length === 0) {
    return { potPfs: blankPotPfs, errorCode: ErrorCode.MISSING_DATA };
  }
  const potIdSet = new Set(potIds);
  // sort by pot_id and position
  const sortedPotPfs = potPfs.toSorted((a, b) => {
    const potCompare = a.pot_id.localeCompare(b.pot_id);

    if (potCompare !== 0) {
      return potCompare;
    }

    return a.position! - b.position!;
  });

  // cannot use forEach because if got an error need exit loop
  let i = 0;    
  let currentPotId = "";
  let lastPos = 0;
  let lastAmount = maxMoney; 
  while (i < potPfs.length) {
    const toPost = sanitizePotPf(sortedPotPfs[i]);
    const errCode = validatePotPf(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { potPfs: okPotPfs, errorCode: errCode };
    }
    // all potPfs MUST have id in potIdSet
    if (!potIdSet.has(toPost.pot_id)) {
      return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
    }
    // all potPfs MUST have sequential positions, starting at 1, per pot
    if (toPost.pot_id !== currentPotId) {
      if (toPost.position !== 1) {
        return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      currentPotId = toPost.pot_id;
      lastPos = 1;
      if (toPost.amount! > maxMoney) {
        return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    } else {
      if (toPost.position !== lastPos + 1) {
        return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastPos = toPost.position;
      if (toPost.amount! > lastAmount) {
        return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
      }
      lastAmount = toPost.amount!;
    }

    okPotPfs.push(toPost);    
    i++;
  }

  return { potPfs: okPotPfs, errorCode: ErrorCode.NONE };
}

// /**
//  * validates array of potPfs
//  * 
//  * @param {potPfType[]} potPfs - array of potPfType to validate
//  * @returns {potPfs: potPfType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
//  */
// export const validatePotPfs = (potPfs: potPfType[]): validPotPfsType => {
  
//   const blankPotPfs: potPfType[] = [];
//   const okPotPfs: potPfType[] = [];
//   if (!Array.isArray(potPfs) || potPfs.length === 0) {
//     return { potPfs: blankPotPfs, errorCode: ErrorCode.MISSING_DATA };
//   };
//   // cannot use forEach because if got an error need exit loop
//   let i = 0;  
//   let firstPotId = "";
//   while (i < potPfs.length) {
//     const toPost = sanitizePotPf(potPfs[i]);
//     const errCode = validatePotPf(toPost);
//     if (errCode !== ErrorCode.NONE) {
//       return { potPfs: okPotPfs, errorCode: errCode };
//     }
//     // all potPfs MUST have same pot_id
//     if (i === 0) {
//       firstPotId = toPost.pot_id;      
//     } else if (firstPotId !== toPost.pot_id) {
//       return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };
//     }
//     // all potPfs MUST have sequential positions, starting at 1
//     if (potPfs[i].position !== i + 1) {
//       return { potPfs: okPotPfs, errorCode: ErrorCode.INVALID_DATA };      
//     }
//     okPotPfs.push(toPost);    
//     i++;
//   }
//   return { potPfs: okPotPfs, errorCode: ErrorCode.NONE };
// }

export const exportedForTesting = {
  gotPotPfData,
  validPotPfData,
};
