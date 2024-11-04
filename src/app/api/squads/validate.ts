import {
  isValidBtDbId,
  maxEventLength,
  minGames,
  maxGames,
  ErrorCode,
  validTime,
  minLane,
  maxStartLane,
  isOdd,
  isEven,
  isNumber,
  maxLaneCount,
  validSortOrder,
  maxDate,
  minDate,  
} from "@/lib/validation";
import { sanitize } from "@/lib/sanitize";
import { compareAsc, isValid } from "date-fns";
import { squadType, idTypes, validSquadsType } from "@/lib/types/types";
import { blankSquad, initSquad } from "@/lib/db/initVals";
import { validDateString } from "@/lib/dateTools";

/**
 * checks if squad object has missing data - DOES NOT SANITIZE OR VALIDATE
 * 
 * @param squad - squad to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotSquadData =(squad: squadType): ErrorCode => {
  try {
    // squad_time can be blank
    if (!squad
      || !squad.id
      || !squad.event_id
      || !sanitize(squad.squad_name)
      || (typeof squad.games !== "number")
      || (typeof squad.starting_lane !== "number")
      || (typeof squad.lane_count !== "number")
      || !squad.squad_date
      || (typeof squad.sort_order !== "number")           
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

export const validSquadName = (squadName: string): boolean => { 
  const sanitized = sanitize(squadName);
  return (sanitized.length > 0 && sanitized.length <= maxEventLength)
}
export const validGames = (games: number): boolean => {
  if (typeof games !== 'number' || !Number.isInteger(games)) return false
  return (games >= minGames && games <= maxGames);
}
export const validStartingLane = (startingLane: number): boolean => {
  if (typeof startingLane !== 'number' || !Number.isInteger(startingLane)) return false
  return (startingLane >= minLane && startingLane <= maxStartLane) &&
    isOdd(startingLane);
}
export const validLaneCount = (laneCount: number): boolean => { 
  if (typeof laneCount !== 'number' || !Number.isInteger(laneCount)) return false
  return (laneCount >= 2 && laneCount <= maxStartLane + 1) &&
    isEven(laneCount);
}
export const validSquadDate = (squadDate: Date): boolean => { 
  if (!squadDate) return false  
  if (typeof squadDate === 'string') {
    if (validDateString(squadDate)) {
      squadDate = new Date(squadDate)
    } else {
      return false
    }    
  }
  if (!isValid(squadDate)) return false
  return (compareAsc(squadDate, minDate) >= 0 && compareAsc(squadDate, maxDate) <= 0)
}
export const validSquadTime = (squadTimeStr: string | null): boolean => { 
  if (typeof squadTimeStr === 'undefined') return false  
  if (!squadTimeStr) return true
  return validTime(squadTimeStr)
}

/**
 * sanitizes a time string, DOES NOT VALIDATE!
 *   ##:## or ##:## am/pm are valid, any number and any case for am/pm
 * 
 * @param timeStr - time string to sanitize
 * @returns - sanitized time string
 */
export const sanitizedTime = (timeStr: string): string | null => {
  if (timeStr === null) return null;
  if (!timeStr || !(timeStr.length === 5 || timeStr.length === 8)) return ''; 
  const regex =
    timeStr.length === 5
      ? /^\d{2}:\d{2}$/
      : /\d{2}:\d{2} ([AaPp][Mm])/;
  if (!regex.test(timeStr)) return '';
  return timeStr;
}

/**
 * checks in the combo of startingLane and laneCount is valid
 * 
 * @param startingLane - the starting lane 
 * @param laneCount - the number of lanes
 * @returns {boolean} - true if (startingLane - 1) + laneCount <= maxLaneCount
 */
export const validLaneConfig = (startingLane: number, laneCount: number): boolean => { 
  if (!validStartingLane(startingLane) || !validLaneCount(laneCount)) return false
  return ((startingLane - 1) + laneCount <= maxLaneCount) 
}
/**
 * checks if foreign key is valid
 * 
 * @param FkId - foreign key 
 * @param idType - id type - 'evt'
 * @returns {boolean} - true if foreign key is valid
 */
export const validEventFkId = (FkId: string, idType: idTypes): boolean => { 

  if (!(FkId) || !isValidBtDbId(FkId, idType)) {
    return false
  }
  return (idType === 'evt')
}

/**
 * checks if squad data is valid
 * 
 * @param squad - squad object to validate
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validSquadData = (squad: squadType): ErrorCode => {  
  try {
    if (!squad) return ErrorCode.InvalidData;
    if (!isValidBtDbId(squad.id, 'sqd')) {
      return ErrorCode.InvalidData
    }
    if (!isValidBtDbId(squad.event_id, 'evt')) {
      return ErrorCode.InvalidData;
    }
    if (!validSquadName(squad.squad_name)) {
      return ErrorCode.InvalidData;
    }
    if (!validGames(squad.games)) {
      return ErrorCode.InvalidData;
    }
    if (!validLaneConfig(squad.starting_lane, squad.lane_count)) {
      return ErrorCode.InvalidData;
    }
    if (!validSquadDate(squad.squad_date)) {
      return ErrorCode.InvalidData;
    }
    if (!validSquadTime(squad.squad_time)) {
      return ErrorCode.InvalidData;
    }
    if (!validSortOrder(squad.sort_order)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitizes a squad object 
 * 
 * @param squad - squad to sanitize
 * @returns {squadType} - squad object with sanitized data
 */
export const sanitizeSquad = (squad: squadType): squadType => { 
  if (!squad) return null as any
  const sanitizedSquad = {
    ...blankSquad,
    games: null as any,
    lane_count: null as any,
    starting_lane: null as any,
    sort_order: null as any,
  }
  if (isValidBtDbId(squad.id, "sqd")) {
    sanitizedSquad.id = squad.id;
  }
  sanitizedSquad.squad_name = sanitize(squad.squad_name)
  if (validEventFkId(squad.event_id, 'evt')) {
    sanitizedSquad.event_id = squad.event_id
  }
  if ((squad.games === null) || isNumber(squad.games)) {
    sanitizedSquad.games = squad.games
  }
  if ((squad.starting_lane === null) || isNumber(squad.starting_lane)) {
    sanitizedSquad.starting_lane = squad.starting_lane
  }
  if ((squad.lane_count === null) || isNumber(squad.lane_count)) {
    sanitizedSquad.lane_count = squad.lane_count
  }
  if (validSquadDate(squad.squad_date)) {
    sanitizedSquad.squad_date = squad.squad_date
  }
  sanitizedSquad.squad_time = sanitizedTime(squad.squad_time as string)
  if ((squad.sort_order === null) || isNumber(squad.sort_order)) {
    sanitizedSquad.sort_order = squad.sort_order
  }  
  return sanitizedSquad    
}

/**
 * validates a squad object
 * 
 * @param squad - squad to validate
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export function validateSquad(squad: squadType): ErrorCode { 
  try {
    const errCode = gotSquadData(squad)
    if (errCode !== ErrorCode.None) {
      return errCode
    }    
    return validSquadData(squad)
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizes and validates an array of squad
 * 
 * @param {squadType[]} squads - array of squad to validate
 * @returns {validSquadsType} - {squads:squadType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateSquads = (squads: squadType[]): validSquadsType => {

  const blankSquads: squadType[] = [];
  const okSquads: squadType[] = [];
  if (!Array.isArray(squads) || squads.length === 0) {
    return { squads: blankSquads, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;  
  while (i < squads.length) {
    const toPost = sanitizeSquad(squads[i]);
    const errCode = validateSquad(toPost);
    if (errCode !== ErrorCode.None) { 
      return { squads: okSquads, errorCode: errCode };
    }    
    // push AFETER errCode is None
    okSquads.push(toPost);    
    i++;
  }
  return { squads: okSquads, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotSquadData, 
  validSquadData 
}