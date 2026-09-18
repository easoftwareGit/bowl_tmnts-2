import { TmntGameResult } from "@/lib/types/resultsTypes";

/**
 * Calculate the number of games in the tournament results
 * 
 * @param {TmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number} number of games 
 */
export const calcNumGames = (tmntResults: TmntGameResult[]): number => {
  if (!tmntResults || tmntResults.length === 0) return 0;

  return Object.keys(tmntResults[0]).filter((key) => /^Game \d+$/.test(key))
    .length;
};

/**
 * Creates an array of game numbers
 * 
 * @param {TmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number[]} array of game numbers
 */
export const getGameNums = (tmntResults: TmntGameResult[]): number[] => {
  const numGames = calcNumGames(tmntResults);
  // create the array of game numbers
  // don't care about the value parameter, so use _
  // index + 1 because index starts at 0
  return Array.from({ length: numGames }, (_, index) => index + 1);
};

/**
 * Finds the last game that has at least one score entered.
 * 
 * @param {TmntGameResult[]} tmntResults - array of TmntGameResult
 * @returns {number} last completed game 
 */
export const getLastGameWithScores = (tmntResults: TmntGameResult[]): number => {
  const numGames = calcNumGames(tmntResults);
  let lastGame = 1;
  for (let game = 1; game <= numGames; game++) {
    const completed = tmntResults.filter(
      (result) => result[`Game ${game}`] !== null
    );
    if (completed.length === 0) {
      return lastGame;
    }
    lastGame = game;
  }
  return lastGame;
}