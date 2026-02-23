import { blankPlayer } from "@/lib/db/initVals";
import { sanitize } from "@/lib/validation/sanitize";
import type { idTypes, playerType, validPlayersType } from "@/lib/types/types";
import {  
  isValidBtDbId,
  maxFirstNameLength,
  maxLastNameLength,
  maxStartLane,
  isValidName,
} from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { isNumber } from "lodash";

const gotPlayerData = (player: playerType): ErrorCode => {
  try {
    if (!player || !player.id) {
      return ErrorCode.MISSING_DATA;
    }
    if (player.id.startsWith("ply")) {
      if (
        !player.squad_id ||
        !sanitize(player.first_name) ||
        !sanitize(player.last_name) ||
        typeof player.average !== "number" ||
        typeof player.lane !== "number" ||
        !sanitize(player.position)
      ) {
        return ErrorCode.MISSING_DATA;
      }
      // return ErrorCode.NONE
    } else if (player.id.startsWith("bye")) {
      if (
        !player.squad_id ||
        !sanitize(player.first_name) ||
        typeof player.average !== "number"
      ) {
        return ErrorCode.MISSING_DATA;
      }
      // return ErrorCode.NONE
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * checks if player id is valid 'ply' = player, 'bye' = bye
 *
 * @param {unknown} playerId - player id, can start with 'ply' or 'bye'
 * @returns {boolean} - true if player id is valid
 */
export const validPlayerId = (playerId: unknown): boolean => {
  if (playerId == null || typeof playerId !== "string") return false;
  return isValidBtDbId(playerId, "ply") || isValidBtDbId(playerId, "bye");
};

export const validPlayerFirstName = (firstName: unknown): boolean => {
  if (firstName == null || typeof firstName !== "string") return false;
  return isValidName(firstName, maxFirstNameLength);
};
export const validPlayerLastName = (lastName: unknown): boolean => {
  if (lastName == null || typeof lastName !== "string") return false;
  return isValidName(lastName, maxLastNameLength);
};
export const validAverage = (average: unknown): boolean => {
  if (typeof average !== "number") return false;
  if (typeof average !== "number" || !Number.isInteger(average)) return false;
  return Number.isInteger(average) && average >= 0 && average <= 300;
};

export const validLane = (lane: number): boolean => {
  if (typeof lane !== "number") return false;
  return Number.isInteger(lane) && lane > 0 && lane <= maxStartLane;
};

export const validPosition = (position: string): boolean => {
  return isValidName(position, 1); // only 1 character
};

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
 * @returns {ErrorCode} - ErrorCode.NONE: player data is valid,
 *    ErrorCode.INVALID_DATA: player data is invalid,
 *    ErrorCode.OtherError: an error occurred
 */
const validPlayerData = (player: playerType): ErrorCode => {
  try {
    if (!player) return ErrorCode.INVALID_DATA;
    if (!validPlayerId(player.id)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validPlayerFkId(player.squad_id, "sqd")) {
      return ErrorCode.INVALID_DATA;
    }
    if (player.id.startsWith("ply")) {
      if (!validPlayerFirstName(player.first_name)) {
        return ErrorCode.INVALID_DATA;
      }
      if (!validPlayerLastName(player.last_name)) {
        return ErrorCode.INVALID_DATA;
      }
      if (!validAverage(player.average)) {
        return ErrorCode.INVALID_DATA;
      }
      if (!validLane(player.lane)) {
        return ErrorCode.INVALID_DATA;
      }
      if (!validPosition(player.position)) {
        return ErrorCode.INVALID_DATA;
      }
    } else {
      // else 'bye'
      if (player.first_name !== "Bye") {
        return ErrorCode.INVALID_DATA;
      }
      if (player.last_name !== null) {
        return ErrorCode.INVALID_DATA;
      }
      if (player.average !== 0) {
        return ErrorCode.INVALID_DATA;
      }
      if (player.lane !== null) {
        return ErrorCode.INVALID_DATA;
      }
      if (player.position !== null) {
        return ErrorCode.INVALID_DATA;
      }
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes player data
 *
 * @param {playerType} player - player to sanitize
 * @returns {playerType} - player object with sanitized data
 */
export const sanitizePlayer = (player: playerType): playerType => {
  if (!player) return null as any;
  const sanitizedPlayer: playerType = { ...blankPlayer };
  sanitizedPlayer.average = -1; // sanitize to invalid value, but not dangerous
  if (validPlayerId(player.id)) {
    sanitizedPlayer.id = player.id;
  }
  if (validPlayerFkId(player.squad_id, "sqd")) {
    sanitizedPlayer.squad_id = player.squad_id;
  }
  sanitizedPlayer.first_name = sanitize(player.first_name);
  if (player.average === null || isNumber(player.average)) {
    sanitizedPlayer.average = player.average;
  }
  if (sanitizedPlayer.id && sanitizedPlayer.id.startsWith("bye")) {
    if (player.last_name === null) {
      sanitizedPlayer.last_name = null as any;
    } else {
      sanitizedPlayer.last_name = sanitize(player.last_name);
    }
    if (player.lane === null) {
      sanitizedPlayer.lane = null as any;
    } else {
      if (isNumber(player.lane)) {
        sanitizedPlayer.lane = player.lane;
      }
    }
    if (player.position === null) {
      sanitizedPlayer.position = null as any;
    } else {
      sanitizedPlayer.position = sanitize(player.position);
    }
  } else {
    sanitizedPlayer.last_name = sanitize(player.last_name);
    if (player.lane === null || isNumber(player.lane)) {
      sanitizedPlayer.lane = player.lane;
    }
    sanitizedPlayer.position = sanitize(player.position);
  }
  return sanitizedPlayer;
};

/**
 * validates player data
 *
 * @param player - player to validate
 * @returns {ErrorCode} - ErrorCode.NONE: player data is valid,
 *    ErrorCode.INVALID_DATA: player data is invalid,
 *    ErrorCode.MISSING_DATA: player data is missing,
 *    ErrorCode.OtherError: an error occurred
 */
export const validatePlayer = (player: playerType): ErrorCode => {
  try {
    const errCode = gotPlayerData(player);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validPlayerData(player);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validatePlayers = (players: playerType[]): validPlayersType => {
  const blankPlayers: playerType[] = [];
  const okPlayers: playerType[] = [];
  if (!Array.isArray(players) || players.length === 0) {
    return { players: blankPlayers, errorCode: ErrorCode.MISSING_DATA };
  }
  // cannot use forEach because if got an errror need exit loop
  let i = 0;
  let squadId = "";
  while (i < players.length) {
    const toPost = sanitizePlayer(players[i]);
    const errCode = validatePlayer(toPost);
    if (errCode !== ErrorCode.NONE) {
      return { players: okPlayers, errorCode: errCode };
    }
    // all players MUST have same squad_id
    if (i > 0 && squadId !== toPost.squad_id) {
      return { players: okPlayers, errorCode: ErrorCode.INVALID_DATA };
    }
    // push AFETER errCode is None
    okPlayers.push(toPost);
    // set tmnt_id AFTER 1st event sanitzied and validated
    if (i === 0) {
      squadId = toPost.squad_id;
    }
    i++;
  }
  return { players: okPlayers, errorCode: ErrorCode.NONE };
};

export const exportedForTesting = {
  gotPlayerData,
  validPlayerData,
};
