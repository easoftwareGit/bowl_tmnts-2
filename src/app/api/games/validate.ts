import { blankGame } from "@/lib/db/initVals";
import { gameType, idTypes, validGamesType } from "@/lib/types/types";
import { isValidBtDbId, ErrorCode, isNumber, maxScore, validInteger, maxGames } from "@/lib/validation";
import { cloneDeep } from "lodash";

/**
 * checks if game object has missing data
 *
 * @param {gameType} game - game to check for missing data

 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotGameData = (game: gameType): ErrorCode => {
  try {
    if (!game
      || !game.id
      || !game.squad_id
      || !game.player_id
      || !game.game_num
      || !game.score
    ) {
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

/**
 * checks if game number is valid
 *
 * @param {number} gameNum - game number to validate 
 * @returns {boolean} - true if game number is valid, else false
 */
const validGameNumber = (gameNum: number): boolean => {
  if (!isNumber(gameNum)    
    || !Number.isInteger(gameNum)
    || !validInteger(gameNum)    
  ) {
    return false;
  }
  if (gameNum < 1 || gameNum > maxGames) {
    return false;
  }
  return true;
};

/**
 * checks if score is valid
 *
 * @param {number} score - score to validate
 * @returns {boolean} - true if score is valid, else false
 */
const validScore = (score: number): boolean => {
  if (!isNumber(score) || !Number.isInteger(score) || !validInteger(score)) return false;
  if (score < 0 || score > maxScore) return false;
  return true;
};

/**
 * checks if foreign key is valid
 *
 * @param FkId - foreign key
 * @param idType - id type - 'div' or 'sqd'
 * @returns {boolean} - true if foreign key is valid
 */
export const validGameFkId = (FkId: string, idType: idTypes): boolean => {
  if (!FkId || !isValidBtDbId(FkId, idType)) {
    return false;
  }
  return idType === "ply" || idType === "sqd";
};

/**
 * checks if game data is valid
 *
 * @param game - game to validate 
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const validGameData = (game: gameType): ErrorCode => {
  try {
    if (!game) return ErrorCode.InvalidData;
    if (!isValidBtDbId(game.id, "gam")) return ErrorCode.InvalidData;
    if (!isValidBtDbId(game.squad_id, "sqd")) return ErrorCode.InvalidData;
    if (!isValidBtDbId(game.player_id, "ply")) return ErrorCode.InvalidData;
    if (!validGameNumber(game.game_num))
      return ErrorCode.InvalidData;
    if (!validScore(game.score)) return ErrorCode.InvalidData;
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

/**
 * sanitizes game - returns -1 in id if id not sanitized
 *
 * @param {gameType} game - game to sanitize 
 * @returns {gameType} - sanitized game
 */
export const sanitizeGame = (game: gameType): gameType => {
  if (!game) return null as any;
  const sanitizedGame = cloneDeep(blankGame);
  if (isValidBtDbId(game.id, "gam")) {
    sanitizedGame.id = game.id;
  }  
  if (isValidBtDbId(game.squad_id, "sqd")) {
    sanitizedGame.squad_id = game.squad_id;
  }
  if (isValidBtDbId(game.player_id, "ply")) {
    sanitizedGame.player_id = game.player_id;
  }
  if (isNumber(game.game_num) && Number.isInteger(game.game_num) && validInteger(game.game_num)) {
    sanitizedGame.game_num = game.game_num;
  }
  if (isNumber(game.score) && Number.isInteger(game.score) && validInteger(game.score)) {
    sanitizedGame.score = game.score;
  }
  return sanitizedGame;
};

/**
 * validates game data
 *
 * @param game - game to validate 
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export const validateGame = (game: gameType): ErrorCode => {
  try {
    const errorCode = gotGameData(game);
    if (errorCode !== ErrorCode.None) return errorCode;
    return validGameData(game);
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

/**
 * validates array of games
 *
 * @param games - array of games to validate 
 * @returns - {games: gameType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateGames = (games: gameType[]): validGamesType => {
  const blankGames: gameType[] = [];
  const okGames: gameType[] = [];
  if (!Array.isArray(games) || games.length === 0) {
    return { games: blankGames, errorCode: ErrorCode.MissingData };
  }
  let i = 0;
  while (i < games.length) {
    const toPush = sanitizeGame(games[i]);
    const errCode = validateGame(toPush);
    if (errCode !== ErrorCode.None) {
      return { games: okGames, errorCode: errCode };
    }
    okGames.push(toPush);
    i++;
  }
  return { games: okGames, errorCode: ErrorCode.None };
};

export const exportedForTesting = {
  gotGameData,
  validGameNumber,
  validScore,
  validGameData,
};
