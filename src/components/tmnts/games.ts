import { tmntGameResult } from "@/lib/types/resultsTypes";

/**
 * Calculate the number of games in the tournament results
 * 
 * @param {tmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number} number of games 
 */
export const calcNumGames = (tmntResults: tmntGameResult[]): number => {
  if (!tmntResults || tmntResults.length === 0) return 0;

  return Object.keys(tmntResults[0]).filter((key) => /^Game \d+$/.test(key))
    .length;
};

/**
 * Creates an array of game numbers
 * 
 * @param {tmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number[]} array of game numbers
 */
export const getGameNums = (tmntResults: tmntGameResult[]): number[] => {
  const numGames = calcNumGames(tmntResults);
  // create the array of game numbers
  // don't care about the value parameter, so use _
  // index + 1 because index starts at 0
  return Array.from({ length: numGames }, (_, index) => index + 1);
};

/**
 * Finds the last game that has at least one score entered.
 * 
 * @param {tmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number} last game with at least one score, or 0 if none 
 */
export const getLastGameWithScores = (tmntResults: tmntGameResult[]): number => {
  const numGames = calcNumGames(tmntResults);

  let lastGame = 0;
  for (let game = 1; game <= numGames; game++) {
    // check if there are scores for the game number
    const hasScores = tmntResults.some(
      (result) => result[`Game ${game}`] != null
    );
    // if there are no scores for game number, return current last game
    if (!hasScores) {
      return lastGame;
    }
    // if got here, at least one player has a score for this game,
    // so it becomes the last game with scores
    lastGame = game;
  }
  return lastGame;
}
