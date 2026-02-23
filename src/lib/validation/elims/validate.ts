import {
  isValidBtDbId,  
  maxMoney,
  validSortOrder,
  minGames,
  maxGames,
  isNumber,
} from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeCurrency } from "@/lib/validation/sanitize";
import { validMoney } from "@/lib/currency/validate";
import type { elimType, idTypes, validElimsType } from "@/lib/types/types";
import { blankElim } from "@/lib/db/initVals";

/**
 * checks if elim object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param elim - elim to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotElimData = (elim: elimType): ErrorCode => {
  try {    
    if (
      !elim ||
      !elim.id ||
      !elim.div_id ||
      !elim.squad_id ||
      !validMoney(elim.fee, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) ||
      typeof elim.start !== "number" ||
      typeof elim.games !== "number" ||      
      !validMoney(elim.fee, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER) ||
      typeof elim.sort_order !== "number"
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validStart = (start: unknown): boolean => {
  if (typeof start !== 'number' || !Number.isInteger(start)) return false
  return Number.isInteger(start) && start >= minGames && start <= maxGames;
};
export const validGames = (games: unknown): boolean => {
  if (typeof games !== 'number' || !Number.isInteger(games)) return false
  return (    
    games >= minGames &&
    games <= maxGames
  );
};
export const validElimMoney = (moneyStr: unknown): boolean => {
  if (moneyStr == null || typeof moneyStr !== 'string') return false;
  return validMoney(moneyStr, 1, maxMoney);
};

/**
 * checks if foreign key is valid
 *
 * @param FkId - foreign key
 * @param idType - id type - 'div' or 'sqd'
 * @returns {boolean} - true if foreign key is valid
 */
export const validElimFkId = (FkId: string, idType: idTypes): boolean => {
  if (!FkId || !isValidBtDbId(FkId, idType)) {
    return false;
  }
  return idType === "div" || idType === "sqd";
};

/**
 * checks if elim data is valid
 *
 * @param elim - elim object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validElimData = (elim: elimType): ErrorCode => {
  try {
    if (!elim) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(elim.id, "elm")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elim.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(elim.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validElimMoney(elim.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validStart(elim.start)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validGames(elim.games)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validSortOrder(elim.sort_order)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes a elim object
 *
 * @param elim - elim to sanitize
 * @returns {elimType} - elim object with sanitized data
 */
export const sanitizeElim = (elim: elimType): elimType => {
  if (!elim) return null as any;
  const sanitizedElim = {
    ...blankElim,
    start: null as any,
    games: null as any,
    sort_order: null as any,
  };
  if (isValidBtDbId(elim.id, "elm")) {
    sanitizedElim.id = elim.id;
  }
  if (validElimFkId(elim.div_id, "div")) {
    sanitizedElim.div_id = elim.div_id;
  }
  if (validElimFkId(elim.squad_id, "sqd")) {
    sanitizedElim.squad_id = elim.squad_id;
  }
  if ((elim.start === null) || isNumber(elim.start)) {
    sanitizedElim.start = elim.start;
  }
  if ((elim.games === null) || isNumber(elim.games)) {
    sanitizedElim.games = elim.games;
  }
  // sanitizeCurrency removes trailing zeros
  if (validElimMoney(elim.fee)) {
    sanitizedElim.fee = sanitizeCurrency(elim.fee);
  }
  if ((elim.sort_order === null) || isNumber(elim.sort_order)) {
    sanitizedElim.sort_order = elim.sort_order;
  }
  return sanitizedElim;
};

/**
 * validates a elim object
 *
 * @param elim - elim to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export function validateElim(elim: elimType): ErrorCode {
  try {
    const errCode = gotElimData(elim);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validElimData(elim);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes and validates an array of elim objects
 * 
 * @param {elimType[]} elims - array of elims to validate
 * @returns {validElimsType} - {elims: [], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateElims = (elims: elimType[]): validElimsType => {
  
  const blankElims: elimType[] = [];
  const okElims: elimType[] = [];
  if (!Array.isArray(elims) || elims.length === 0) {
    return { elims: blankElims, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < elims.length) {
    const toPost = sanitizeElim(elims[i]);
    const errCode = validateElim(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { elims: okElims, errorCode: errCode };
    }
    okElims.push(toPost);
    i++;
  }
  return { elims: okElims, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotElimData,
  validElimData,
};
