import { isValidBtDbId, ErrorCode, isNumber } from "@/lib/validation";
import { brktSeedType, validBrktSeedsType } from "@/lib/types/types";
import { blankBrktSeed, defaultBrktPlayers } from "@/lib/db/initVals";

/**
 * checks if brktSeed object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param {brktSeedType} brktSeed - brktSeed to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotBrktSeedData = (brktSeed: brktSeedType): ErrorCode => {
  try {
    if (!brktSeed
      || !brktSeed.one_brkt_id
      || !brktSeed.player_id
      || brktSeed.seed == null
      || !isNumber(brktSeed.seed)
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * checks if seed value is valid
 * 
 * @param {number} seed - seed to validate
 * @returns {boolean} - true if valid, else false 
 */
export const validSeed = (seed: number): boolean => {
  if (!isNumber(seed) || seed < 0 || !Number.isInteger(seed) || seed >= defaultBrktPlayers) {
    return false
  }
  return true
}

/**
 * checks if brktSeed data is valid
 * 
 * @param {brktSeedType} brktSeed - brktSeed to validate
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError}  
 */
const validBrktSeedData = (brktSeed: brktSeedType): ErrorCode => { 
  try {
    if (!brktSeed) return ErrorCode.InvalidData
    if (!isValidBtDbId(brktSeed.one_brkt_id, 'obk')) return ErrorCode.InvalidData
    if (!isValidBtDbId(brktSeed.player_id, 'ply')) return ErrorCode.InvalidData
    if (!validSeed(brktSeed.seed)) return ErrorCode.InvalidData
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
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
  if (isValidBtDbId(brktSeed.player_id, 'ply')) sanitziedOneBrkt.player_id = brktSeed.player_id;
  if (validSeed(brktSeed.seed)) sanitziedOneBrkt.seed = brktSeed.seed;
  return sanitziedOneBrkt;
}

/**
 * validates brktSeed data
 * 
 * @param {brktSeedType} brktSeed - brktSeed to validate 
 * @returns {ErrorCode.InvalidData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
export function validateBrktSeed(brktSeed: brktSeedType): ErrorCode {
  try {
    const errCode = gotBrktSeedData(brktSeed);
    if (errCode !== ErrorCode.None) return errCode;
    return validBrktSeedData(brktSeed);
  } catch (error) {
    return ErrorCode.OtherError;   
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
    return { brktSeeds: blankBrktSeeds, errorCode: ErrorCode.MissingData };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < brktSeeds.length) {
    const toPost = sanitizeBrktSeed(brktSeeds[i]);
    const errCode = validateBrktSeed(toPost);
    if (errCode !== ErrorCode.None) {
      return { brktSeeds: okBrktSeeds, errorCode: errCode };
    }
    okBrktSeeds.push(toPost);
    i++;
  }
  return { brktSeeds: okBrktSeeds, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotBrktSeedData, validBrktSeedData
}