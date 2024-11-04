import {
  isValidBtDbId,
  ErrorCode,
  maxMoney,
  validSortOrder,
  minGames,
  maxGames,
  isNumber,
} from "@/lib/validation";
import { sanitizeCurrency } from "@/lib/sanitize";
import { validMoney } from "@/lib/currency/validate";
import { elimType, idTypes, validElimsType } from "@/lib/types/types";
import { blankElim } from "@/lib/db/initVals";

/**
 * checks if elim object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param elim - elim to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
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
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

export const validStart = (start: number): boolean => {
  if (typeof start !== 'number') return false
  return Number.isInteger(start) && start >= minGames && start <= maxGames;
};
export const validGames = (games: number): boolean => {
  if (typeof games !== 'number') return false
  return (
    Number.isInteger(games) &&
    games >= minGames &&
    games <= maxGames
  );
};
export const validElimMoney = (moneyStr: string): boolean => {
  if (!moneyStr) return false;
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
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validElimData = (elim: elimType): ErrorCode => {
  try {
    if (!elim) return ErrorCode.InvalidData;
    if (!isValidBtDbId(elim.id, "elm")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(elim.div_id, "div")) {
      return ErrorCode.InvalidData;
    }
    if (!isValidBtDbId(elim.squad_id, "sqd")) {
      return ErrorCode.InvalidData;
    }
    if (!validElimMoney(elim.fee)) {
      return ErrorCode.InvalidData;
    }
    if (!validStart(elim.start)) {
      return ErrorCode.InvalidData;
    }
    if (!validGames(elim.games)) {
      return ErrorCode.InvalidData;
    }
    if (!validSortOrder(elim.sort_order)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
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
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export function validateElim(elim: elimType): ErrorCode {
  try {
    const errCode = gotElimData(elim);
    if (errCode !== ErrorCode.None) {
      return errCode;
    }
    return validElimData(elim);
  } catch (err) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitizes and validates an array of elim objects
 * 
 * @param {elimType[]} elims - array of elims to validate
 * @returns {validElimsType} - {elims: [], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateElims = (elims: elimType[]): validElimsType => {
  
  const blankElims: elimType[] = [];
  const okElims: elimType[] = [];
  if (!Array.isArray(elims) || elims.length === 0) {
    return { elims: blankElims, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < elims.length) {
    const toPost = sanitizeElim(elims[i]);
    const errCode = validateElim(toPost);
    if (errCode !== ErrorCode.None) {
      return { elims: okElims, errorCode: errCode };
    }
    okElims.push(toPost);
    i++;
  }
  return { elims: okElims, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotElimData,
  validElimData,
};
