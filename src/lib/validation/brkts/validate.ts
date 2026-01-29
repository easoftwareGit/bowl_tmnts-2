import {
  isValidBtDbId,
  ErrorCode,
  maxMoney,
  validSortOrder,
  minGames,
  maxGames,
  isNumber,
} from "@/lib/validation/validation";
import { sanitizeCurrency } from "@/lib/validation/sanitize";
import { validMoney } from "@/lib/currency/validate";
import { brktType, validBrktsType } from "@/lib/types/types";
import { blankBrkt, defaultBrktGames, defaultBrktPlayers } from "@/lib/db/initVals";

/**
 * checks if brkt object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param brkt - brkt to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotBrktData = (brkt: brktType): ErrorCode => {
  try {    
    if (!brkt ||
      !brkt.id ||
      !brkt.div_id ||
      !brkt.squad_id ||
      !brkt.start ||
      !brkt.games ||
      !brkt.players ||
      !brkt.fee ||
      !brkt.first ||
      !brkt.second ||
      !brkt.admin ||
      !brkt.fsa ||
      !brkt.sort_order
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validStart = (start: unknown): boolean => {
  if (typeof start !== 'number') return false
  return Number.isInteger(start) && start >= minGames && start <= maxGames;
};
export const validGames = (games: unknown): boolean => {
  if (typeof games !== 'number') return false
  return (
    Number.isInteger(games) &&
    games >= defaultBrktGames &&
    games <= defaultBrktGames
  );
};
export const validPlayers = (players: unknown): boolean => {
  if (typeof players !== 'number') return false
  return (
    Number.isInteger(players) &&
    players >= defaultBrktPlayers &&
    players <= defaultBrktPlayers
  );
};
export const validBrktMoney = (moneyStr: unknown): boolean => {
  if (moneyStr == null || typeof moneyStr !== 'string') return false;  
  return validMoney(moneyStr, 1, maxMoney);
};

/**
 * checks if (fee * players) = (first + second + admin) and
 *  first = fee * 5
 *  second = fee * 2
 *  admin = fee
 *  (fee * players) = fsa
 * @param brkt - brkt to check
 * @returns {boolean} - true if entry equals lpox
 */
export const validFsa = (brkt: brktType): boolean => {
  if (!brkt) return false;
  try {
    const fee = Number(brkt.fee);
    const first = Number(brkt.first);
    const players = brkt.players;
    const second = Number(brkt.second);
    const admin = Number(brkt.admin);
    const fsa = Number(brkt.fsa);
    if (
      isNaN(fee) ||
      isNaN(first) ||
      isNaN(second) ||
      isNaN(admin) ||
      isNaN(fsa) ||
      isNaN(players)
    ) {
      return false;
    }
    return (
      fee * players === first + second + admin &&
      fee * 5 === first &&
      fee * 2 === second &&
      fee === admin &&
      fee * players === fsa
    );
  } catch (error) {
    return false;
  }
};

/**
 * checks if brkt data is valid
 *
 * @param brkt - brkt object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validBrktData = (brkt: brktType): ErrorCode => {
  try {
    if (!brkt) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(brkt.id, 'brk')) {
      return ErrorCode.INVALID_DATA
    }
    if (!isValidBtDbId(brkt.div_id, "div")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!isValidBtDbId(brkt.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktMoney(brkt.fee)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validStart(brkt.start)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validGames(brkt.games)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPlayers(brkt.players)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktMoney(brkt.first)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktMoney(brkt.second)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktMoney(brkt.admin)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBrktMoney(brkt.fsa)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validFsa(brkt)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validSortOrder(brkt.sort_order)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes a brkt object
 *
 * @param brkt - brkt to sanitize
 * @returns {brktType} - brkt object with sanitized data
 */
export const sanitizeBrkt = (brkt: brktType): brktType => {
  if (!brkt) return null as any;
  const sanitizedBrkt = {
    ...blankBrkt,
    start: null as any,
    games: null as any,
    players: null as any,
    sort_order: null as any,
  };
  if (isValidBtDbId(brkt.id, "brk")) {
    sanitizedBrkt.id = brkt.id;
  }
  if (isValidBtDbId(brkt.div_id, "div")) {
    sanitizedBrkt.div_id = brkt.div_id;
  }
  if (isValidBtDbId(brkt.squad_id, "sqd")) {
    sanitizedBrkt.squad_id = brkt.squad_id;
  }
  if ((brkt.start === null) || isNumber(brkt.start)) {
    sanitizedBrkt.start = brkt.start;
  }
  if ((brkt.games === null) || isNumber(brkt.games)) {
    sanitizedBrkt.games = brkt.games;
  }
  if ((brkt.players === null) || isNumber(brkt.players)) {
    sanitizedBrkt.players = brkt.players;
  }
  // sanitizeCurrency removes trailing zeros
  if (validBrktMoney(brkt.fee)) {
    sanitizedBrkt.fee = sanitizeCurrency(brkt.fee);
  }
  if (validBrktMoney(brkt.first)) {
    sanitizedBrkt.first = sanitizeCurrency(brkt.first);
  }
  if (validBrktMoney(brkt.second)) {
    sanitizedBrkt.second = sanitizeCurrency(brkt.second);
  }
  if (validBrktMoney(brkt.admin)) {
    sanitizedBrkt.admin = sanitizeCurrency(brkt.admin);
  }
  if (validBrktMoney(brkt.fsa)) {
    sanitizedBrkt.fsa = sanitizeCurrency(brkt.fsa);
  }
  if ((brkt.sort_order === null) || isNumber(brkt.sort_order)) {
    sanitizedBrkt.sort_order = brkt.sort_order;
  }
  return sanitizedBrkt;
};

/**
 * validates a brkt object
 *
 * @param brkt - brkt to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export function validateBrkt(brkt: brktType): ErrorCode {
  try {
    const errCode = gotBrktData(brkt);
    if (errCode !== ErrorCode.NONE) return errCode;
    return validBrktData(brkt);
  } catch (err) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes and validates an array of brkts
 * 
 * @param {brktType[]} brkts - array of brkts to validate
 * @returns {validBrktsType} - {brkts:brktType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateBrkts = (brkts: brktType[]): validBrktsType => {
  
  const blankBrkts: brktType[] = [];
  const okBrkts: brktType[] = [];
  if (!Array.isArray(brkts) || brkts.length === 0) {
    return { brkts: blankBrkts, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an error need exit loop
  let i = 0;  
  while (i < brkts.length) {
    const toPost = sanitizeBrkt(brkts[i]);
    const errCode = validateBrkt(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { brkts: okBrkts, errorCode: errCode };
    }
    okBrkts.push(toPost);
    i++;
  }
  return { brkts: okBrkts, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotBrktData,
  validBrktData,
};
