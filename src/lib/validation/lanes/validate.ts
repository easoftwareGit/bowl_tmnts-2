import {
  isValidBtDbId,
  minLane,
  maxLaneCount,
  ErrorCode,
  isNumber,    
} from "@/lib/validation/validation";
import { idTypes, laneType, validLanesType } from "@/lib/types/types";
import { blankLane } from "@/lib/db/initVals";

/**
 * checks if lane object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param lane - the lane object to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA |  ErrorCode.OTHER_ERROR }
 */
const gotLaneData = (lane: laneType): ErrorCode => {
  try {    
    if (!lane 
      || !lane.id 
      || !lane.squad_id      
      || (typeof lane.lane_number !== 'number')
      || (typeof lane.in_use !== 'boolean')
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

export const validLaneNumber = (laneNumber: unknown): boolean => {
  if (laneNumber == null || !Number.isInteger(laneNumber)) return false
  const laneNumInt = Number(laneNumber)
  return (laneNumInt < minLane || laneNumInt > maxLaneCount) 
    ? false
    : true;
}

/**
 * checks if foreign key is valid
 * 
 * @param FkId - foreign key 
 * @param idType - id type - 'sqd'
 * @returns {boolean} - true if foreign key is valid
 */
export const validLaneFkId = (FkId: string, idType: idTypes): boolean => { 

  if (!(FkId) || !isValidBtDbId(FkId, idType)) {
    return false
  }
  return (idType === 'sqd')
}

/**
 * checks if lane data is valid
 * 
 * @param lane - lane object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validLaneData = (lane: laneType): ErrorCode => {  
  try {
    if (!lane) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(lane.id, 'lan')) {
      return ErrorCode.INVALID_DATA
    }
    if (!isValidBtDbId(lane.squad_id, 'sqd')) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validLaneNumber(lane.lane_number)) {
      return ErrorCode.INVALID_DATA;
    }
    if (typeof lane.in_use !== 'boolean') {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes an lane object 
 * 
 * @param lane - lane to sanitize
 * @returns {laneType} - lane object with sanitized data
 */
export const sanitizeLane = (lane: laneType): laneType => { 
  if (!lane) return null as any
  const sanitizedLane = {
    ...blankLane,
    lane_number: null as any
  }  
  if (isValidBtDbId(lane.id, "lan")) {
    sanitizedLane.id = lane.id;
  }
  if (validLaneFkId(lane.squad_id, 'sqd')) {
    sanitizedLane.squad_id = lane.squad_id
  }
  if ((lane.lane_number === null) || isNumber(lane.lane_number)) {
    sanitizedLane.lane_number = lane.lane_number
  }
  if (typeof lane.in_use === 'boolean') {
    sanitizedLane.in_use = lane.in_use
  }
  return sanitizedLane    
}

/**
 * validates a lane object - DOES NOT SANITIZE
 * 
 * @param lane - lane to validate
 * @returns {ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
export function validateLane(lane: laneType): ErrorCode { 
  try {
    const errCode = gotLaneData(lane)
    if (errCode !== ErrorCode.NONE) {
      return errCode
    }    
    return validLaneData(lane)
  } catch (error) {
    return ErrorCode.OTHER_ERROR
  }
}

/**
 * sanitizes and validates an array of lanes
 * 
 * @param {laneType[]} lanes - array of lanes to validate
 * @returns {validLanesType} - {lanes:laneType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateLanes = (lanes: laneType[]): validLanesType => { 

  const blankLanes: laneType[] = []
  const okLanes: laneType[] = [];
  if (!Array.isArray(lanes) || lanes.length === 0) {
    return { lanes: blankLanes, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < lanes.length) {
    let errCode = gotLaneData(lanes[i])
    if (errCode !== ErrorCode.NONE) { 
      return { lanes: okLanes, errorCode: errCode };
    }
    const toPost = sanitizeLane(lanes[i]);
    errCode = validateLane(toPost);
    if (errCode !== ErrorCode.NONE) { 
      // remove current lane and everything after it
      return { lanes: okLanes, errorCode: errCode };
    }
    okLanes.push(toPost);
    i++;
  }
  const seenKeys = new Set<string>();
  for (let i = 0; i < okLanes.length; i++) {
    const lane = okLanes[i];
    const key = `${lane.squad_id}-${lane.lane_number}`;
    if (seenKeys.has(key)) {
      okLanes.splice(i);
      return { lanes: okLanes, errorCode: ErrorCode.INVALID_DATA };
    }
    seenKeys.add(key);
  }
  return { lanes: okLanes, errorCode: ErrorCode.NONE };
}

export const exportedForTesting = {
  gotLaneData, 
  validLaneData 
}