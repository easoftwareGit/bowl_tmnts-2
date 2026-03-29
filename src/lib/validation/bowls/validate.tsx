import { isValidBtDbId } from "@/lib/validation/validation";
import {
  maxBowlNameLemgth,
  maxCityLength,
  maxStateLength,
  maxUrlLength
} from "../constants";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitizeCity, sanitizeName, sanitizeTournamentName, sanitizeUrl } from "@/lib/validation/sanitize";
import type { bowlType } from "@/lib/types/types";
import { blankBowl } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

/**
 * checks for required data and returns error code if missing
 *
 * @param bowl bowl data to check
 * @returns - {ErrorCode.MISSING_DATA, ErrorCode.NONE, ErrorCode.OtherError}
 */
const gotBowlData = (bowl: bowlType): ErrorCode => {
  try {
    if (bowl == null) return ErrorCode.MISSING_DATA;
    if (
      !bowl ||
      !bowl.id ||
      !sanitizeTournamentName(bowl.bowl_name) ||
      !sanitizeCity(bowl.city) ||
      !sanitizeCity(bowl.state) ||
      !sanitizeUrl(bowl.url)
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validBowlName = (bowlName: unknown): boolean => {
  const sanitized = sanitizeTournamentName(bowlName);
  return sanitized.length > 0 && sanitized.length <= maxBowlNameLemgth;
};
export const validCity = (city: unknown): boolean => {
  const sanitized = sanitizeCity(city);
  return sanitized.length > 0 && sanitized.length <= maxCityLength;
};
export const validState = (state: unknown): boolean => {
  const sanitized = sanitizeCity(state);
  return sanitized.length > 0 && sanitized.length <= maxStateLength;
};
export const validUrl = (url: unknown): boolean => {
  const sanitized = sanitizeUrl(url);
  return sanitized.length > 0 && sanitized.length <= maxUrlLength;
};

/**
 * checks if bowl data is valid
 *
 * @param bowl - bowl data to check
 * @returns - {ErrorCode.INVALID_DATA, ErrorCode.NONE, ErrorCode.OtherError}
 */
const validBowlData = (bowl: bowlType): ErrorCode => {
  try {
    if (!bowl) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(bowl.id, "bwl")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validBowlName(bowl.bowl_name)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validCity(bowl.city)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validState(bowl.state)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validUrl(bowl.url)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitize bowl data to remove unwanted characters - DOES NOT VALIDATE
 *
 * @param bowl - bowl data to sanitize
 * @returns - sanitized bowl:
 *   - sanitized bowl_name, city and state
 *   - sanitized url
 */
export const sanitizeBowl = (bowl: bowlType): bowlType => {
  if (!bowl) return null as any;
  const sanitizedBowl: bowlType = cloneDeep(blankBowl);
  if (isValidBtDbId(bowl.id, "bwl")) {
    sanitizedBowl.id = bowl.id;
  }
  sanitizedBowl.bowl_name = sanitizeTournamentName(bowl.bowl_name);
  sanitizedBowl.city = sanitizeCity(bowl.city);
  sanitizedBowl.state = sanitizeCity(bowl.state);
  sanitizedBowl.url = sanitizeUrl(bowl.url);
  return sanitizedBowl;
};

/**
 * validates a bowl data object
 *
 * @param bowl - bowl data to check
 * @returns - {ErrorCode.MISSING_DATA, ErrorCode.INVALID_DATA, ErrorCode.NONE, ErrorCode.OtherError}
 */
export function validateBowl(bowl: bowlType): ErrorCode {
  try {
    const errCode = gotBowlData(bowl);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validBowlData(bowl);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

export const exportedForTesting = {
  gotBowlData,
  validBowlData,
};
