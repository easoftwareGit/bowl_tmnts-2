import { ErrorCode, isValidBtDbId, maxBowlNameLemgth, maxCityLength, maxStateLength, maxUrlLength } from "@/lib/validation";
import { sanitize, sanitizeUrl } from "@/lib/sanitize";
import { bowlType } from "@/lib/types/types";
import { blankBowl } from "@/lib/db/initVals";

/**
 * checks for required data and returns error code if missing 
 * 
 * @param bowl bowl data to check
 * @returns - {ErrorCode.MissingData, ErrorCode.None, ErrorCode.OtherError}
 */
const gotBowlData = (bowl: bowlType): ErrorCode => {   
  try {
    if (!bowl
        || !(bowl.id)
        || !sanitize(bowl.bowl_name)
        || !sanitize(bowl.city)
        || !sanitize(bowl.state)
        || !sanitizeUrl(bowl.url))    
    {
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const validBowlName = (bowlName: string): boolean => { 
  const sanitized = sanitize(bowlName);
  return (sanitized.length > 0 && sanitized.length <= maxBowlNameLemgth)
}
export const validCity = (city: string): boolean => { 
  const sanitized = sanitize(city);
  return (sanitized.length > 0 && sanitized.length <= maxCityLength)
}
export const validState = (state: string): boolean => { 
  const sanitized = sanitize(state);
  return (sanitized.length > 0 && sanitized.length <= maxStateLength)
}
export const validUrl = (url: string): boolean => { 
  const sanitized = sanitizeUrl(url);
  return (sanitized.length > 0 && sanitized.length <= maxUrlLength)
}

/**
 * checks if bowl data is valid
 * 
 * @param bowl - bowl data to check
 * @returns - {ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError}
 */
const validBowlData = (bowl: bowlType): ErrorCode => { 
  try {
    if (!bowl) return ErrorCode.InvalidData
    if (!isValidBtDbId(bowl.id, 'bwl')) {
      return ErrorCode.InvalidData
    }
    if (!validBowlName(bowl.bowl_name)) {
      return ErrorCode.InvalidData
    }
    if (!validCity(bowl.city)) {
      return ErrorCode.InvalidData
    }
    if (!validState(bowl.state)) {
      return ErrorCode.InvalidData
    }
    if (!validUrl(bowl.url)) {
      return ErrorCode.InvalidData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

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
  const sanitizedBowl: bowlType = { ...blankBowl }
  if (isValidBtDbId(bowl.id, "bwl")) {
    sanitizedBowl.id = bowl.id;
  }
  sanitizedBowl.bowl_name = sanitize(bowl.bowl_name)
  sanitizedBowl.city = sanitize(bowl.city)
  sanitizedBowl.state = sanitize(bowl.state)
  sanitizedBowl.url = sanitizeUrl(bowl.url)
  return sanitizedBowl
}

/**
 * validates a bowl data object
 * 
 * @param bowl - bowl data to check
 * @returns - {ErrorCode.MissingData, ErrorCode.InvalidData, ErrorCode.None, ErrorCode.OtherError} 
 */
export function validateBowl(bowl: bowlType): ErrorCode { 
  try {
    const errCode = gotBowlData(bowl)
    if (errCode !== ErrorCode.None) {
      return errCode
    }
    return validBowlData(bowl)
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const exportedForTesting = {
  gotBowlData,
  validBowlData 
}