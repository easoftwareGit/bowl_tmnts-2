import { isValidBtDbId, isNumber } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import type { brktSeedType, validBrktSeedsType } from "@/lib/types/types";
import { blankBrktSeed, defaultBrktPlayers } from "@/lib/db/initVals";
import { validPlayerId } from "../players/validate";

/**
 * checks if brktSeed object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {brktSeedType} brktSeed - brktSeed to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotBrktSeedData = (brktSeed: brktSeedType): ErrorCode => {
  try {
    if (!brktSeed
      || !brktSeed.one_brkt_id
      || !brktSeed.player_id
      || brktSeed.seed == null
      || !isNumber(brktSeed.seed)
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * checks if seed value is valid
 * 
 * @param {unknown} seed - seed to validate
 * @returns {boolean} - true if valid, else false 
 */
export const validSeed = (seed: unknown): boolean => {
  if (typeof seed !== 'number') return false
  if (!isNumber(seed) || seed < 0 || !Number.isInteger(seed) || seed >= defaultBrktPlayers) {
    return false
  }
  return true
}

/**
 * checks if brktSeed data is valid
 * 
 * @param {brktSeedType} brktSeed - brktSeed to validate
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR}  
 */
const validBrktSeedData = (brktSeed: brktSeedType): ErrorCode => { 
  try {
    if (!brktSeed) return ErrorCode.INVALID_DATA
    if (!isValidBtDbId(brktSeed.one_brkt_id, 'obk')) return ErrorCode.INVALID_DATA
    if (!validPlayerId(brktSeed.player_id)) return ErrorCode.INVALID_DATA
    // if (!isValidBtDbId(brktSeed.player_id, 'ply')) return ErrorCode.INVALID_DATA
    if (!validSeed(brktSeed.seed)) return ErrorCode.INVALID_DATA
    return ErrorCode.NONE
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * checks if brktSeed data is valid
 * 
 * @param {string} oneBrktId - oneBrktId to validate
 * @param {string | number} seed - seed to validate
 * @returns {boolean} - true if valid, else false 
 */
export const validCompositKey = (oneBrktId: string, seed: string | number): boolean => {
  const seedNum = typeof seed === 'string' ? Number(seed) : seed;
  if (isNaN(seedNum) || !Number.isInteger(seedNum)) return false;
  return isValidBtDbId(oneBrktId, 'obk') && validSeed(seedNum)
}

/**
 * sanitizes brktSeed
 * 
 * @param {brktSeedType} brktSeed - brktSeed to sanitize
 * @returns {oneBrbrktSeedTypektType} - sanitized brktSeed
 */
export const sanitizeBrktSeed = (brktSeed: brktSeedType): brktSeedType => { 
  if (!brktSeed) return null as any;
  const sanitziedOneBrkt: brktSeedType = {
    ...blankBrktSeed,
  }
  if (isValidBtDbId(brktSeed.one_brkt_id, 'obk')) sanitziedOneBrkt.one_brkt_id = brktSeed.one_brkt_id;
  if (validPlayerId(brktSeed.player_id)) sanitziedOneBrkt.player_id = brktSeed.player_id;
  if (validSeed(brktSeed.seed)) sanitziedOneBrkt.seed = brktSeed.seed;
  return sanitziedOneBrkt;
}

/**
 * validates brktSeed data
 * 
 * @param {brktSeedType} brktSeed - brktSeed to validate 
 * @returns {ErrorCode.INVALID_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
export function validateBrktSeed(brktSeed: brktSeedType): ErrorCode {
  try {
    const errCode = gotBrktSeedData(brktSeed);
    if (errCode !== ErrorCode.NONE) return errCode;
    return validBrktSeedData(brktSeed);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;   
  }
}

/**
 * sanitizes and validates an array of brktSeed objects
 * 
 * @param {brktSeedType[]} brktSeeds - array of brktSeed objects to validate
 * @returns {validBrktSeedType} - object containing valid brktSeeds and error code 
 */
export const validateBrktSeeds = (brktSeeds: brktSeedType[]): validBrktSeedsType => {
  const blankBrktSeeds: brktSeedType[] = [];
  const okBrktSeeds: brktSeedType[] = [];
  if (!Array.isArray(brktSeeds) || brktSeeds.length === 0) {
    return { brktSeeds: blankBrktSeeds, errorCode: ErrorCode.MISSING_DATA };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < brktSeeds.length) {
    const toPost = sanitizeBrktSeed(brktSeeds[i]);
    const errCode = validateBrktSeed(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { brktSeeds: okBrktSeeds, errorCode: errCode };
    }
    okBrktSeeds.push(toPost);
    i++;
  }
  return { brktSeeds: okBrktSeeds, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotBrktSeedData, validBrktSeedData
}