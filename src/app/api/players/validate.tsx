import { blankPlayer } from "@/lib/db/initVals";
import { sanitize } from "@/lib/sanitize";
import { idTypes, playerType, validPlayersType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId, maxFirstNameLength, maxLastNameLength, maxStartLane, validName } from "@/lib/validation";
import { isNumber } from "lodash";

const gotPlayerData = (player: playerType): ErrorCode => {
  try {
    if (!player 
        || !player.id
        || !player.squad_id
        || !sanitize(player.first_name)
        || !sanitize(player.last_name)
        || typeof player.average !== "number"
        || typeof player.lane !== "number"  
        || !sanitize(player.position)) 
    {
      return ErrorCode.MissingData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

export const validPlayerFirstName = (firstName: string): boolean => {  
  return validName(firstName, maxFirstNameLength)
}
export const validPlayerLastName = (lastName: string): boolean => {  
  return validName(lastName, maxLastNameLength)
}

export const validAverage = (average: number): boolean => {
  if (typeof average !== 'number') return false
  return Number.isInteger(average) && average > 0 && average <= 300
}

export const validLane = (lane: number): boolean => {
  if (typeof lane !== 'number') return false
  return Number.isInteger(lane) && lane > 0 && lane <= maxStartLane
}

export const validPosition = (position: string): boolean => {
  return validName(position, 1) // only 1 character
}

/**
 * checks if foreign key is valid
 *
 * @param FkId - foreign key
 * @param idType - id type - 'sqd'
 * @returns {boolean} - true if foreign key is valid
 */
export const validPlayerFkId = (FkId: string, idType: idTypes): boolean => {
  if (!FkId || !isValidBtDbId(FkId, idType)) {
    return false;
  }
  return idType === "sqd";
};

/**
 * validates player data
 * 
 * @param {playerType} player - player data to checj
 * @returns {ErrorCode} - ErrorCode.None: player data is valid, 
 *    ErrorCode.InvalidData: player data is invalid, 
 *    ErrorCode.OtherError: an error occurred
 */
const validPlayerData = (player: playerType): ErrorCode => { 
  try {
    if (!player) return ErrorCode.InvalidData
    if (!isValidBtDbId(player.id, 'ply')) {
      return ErrorCode.InvalidData
    }
    if (!validPlayerFkId(player.squad_id, 'sqd')) {
      return ErrorCode.InvalidData
    }
    if (!validPlayerFirstName(player.first_name)) {
      return ErrorCode.InvalidData
    }
    if (!validPlayerLastName(player.last_name)) {
      return ErrorCode.InvalidData
    }
    if (!validAverage(player.average)) {
      return ErrorCode.InvalidData
    }
    if (!validLane(player.lane)) {
      return ErrorCode.InvalidData
    }
    if (!validPosition(player.position)) {
      return ErrorCode.InvalidData
    }
    return ErrorCode.None
  } catch (error) {
    return ErrorCode.OtherError
  }
}

/**
 * sanitizes player data
 * 
 * @param {playerType} player - player to sanitize
 * @returns {playerType} - player object with sanitized data
 */
export const sanitizePlayer = (player: playerType): playerType => { 
  if (!player) return null as any;
  const sanitizedPlayer: playerType = { ...blankPlayer }
  if (isValidBtDbId(player.id, 'ply')) {
    sanitizedPlayer.id = player.id
  }
  if (validPlayerFkId(player.squad_id, 'sqd')) {
    sanitizedPlayer.squad_id = player.squad_id
  }
  sanitizedPlayer.first_name = sanitize(player.first_name)
  sanitizedPlayer.last_name = sanitize(player.last_name)
  if ((player.average === null) || isNumber(player.average)) {
    sanitizedPlayer.average = player.average;
  }
  if ((player.lane === null) || isNumber(player.lane)) {
    sanitizedPlayer.lane = player.lane;
  }
  sanitizedPlayer.position = sanitize(player.position)
  return sanitizedPlayer
}

/**
 * validates player data
 * 
 * @param player - player to validate
 * @returns {ErrorCode} - ErrorCode.None: player data is valid, 
 *    ErrorCode.InvalidData: player data is invalid, 
 *    ErrorCode.MissingData: player data is missing,
 *    ErrorCode.OtherError: an error occurred
 */
export const validatePlayer = (player: playerType): ErrorCode => { 
  try {
    const errCode = gotPlayerData(player)
    if (errCode !== ErrorCode.None) {
      return errCode
    }
    return validPlayerData(player)
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

export const validatePlayers = (players: playerType[]): validPlayersType => { 
  const blankPlayers: playerType[] = [];
  const okPlayers: playerType[] = [];
  if (!Array.isArray(players) || players.length === 0) {
    return { players: blankPlayers, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;
  let squadId = "";
  while (i < players.length) {
    const toPost = sanitizePlayer(players[i]);
    const errCode = validatePlayer(toPost);
    if (errCode !== ErrorCode.None) { 
      return { players: okPlayers, errorCode: errCode };
    }    
    // all players MUST have same squad_id
    if (i > 0 && squadId !== toPost.squad_id) {
      return { players: okPlayers, errorCode: ErrorCode.InvalidData };
    }
    // push AFETER errCode is None
    okPlayers.push(toPost);    
    // set tmnt_id AFTER 1st event sanitzied and validated
    if (i === 0) {
      squadId = toPost.squad_id;
    }
    i++;
  }
  return { players: okPlayers, errorCode: ErrorCode.None };
}

export const exportedForTesting = {
  gotPlayerData,
  validPlayerData 
}