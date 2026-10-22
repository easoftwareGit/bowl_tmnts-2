import { divPfType, elimPfType, potPfType } from "../types/types";

/**
 * Count the results, starting at startIndex, that have the same value
 * for propertyName as the result at startIndex. Always at least 1 for a
 * valid startIndex. Only looks at neighbouring results, so it cannot loop forever.
 *
 * @param {T[]} results - array of results
 * @param {keyof T} propertyName - property to compare
 * @param {number} startIndex - index of the first result to count
 * @returns {number} number of tied results (0 if input is invalid)
 */
const countTied = <T,>(
  results: T[],
  propertyName: keyof T,
  startIndex: number
): number => {
  if (
    !Array.isArray(results) ||
    startIndex < 0 ||
    startIndex >= results.length
  )
    return 0;
  const value: T[keyof T] = results[startIndex][propertyName];
  let count = 1;
  while (
    startIndex + count < results.length &&
    results[startIndex + count][propertyName] === value
  ) {
    count++;
  }
  return count;
};

/**
 * Calculate the position for each result.
 * 
 * note 1: sortedResults is sorted the desired prperty name
 *
 * Tied players receive the same position. The next position
 * skips the positions occupied by the tied players. 
 *
 * Example:
 *   scores:    1400, 1350, 1350, 1300
 *   positions:    1,    2,    2,    4
 *
 * @param {T[]} sortedResults - array of sorted results
 * @param {keyof T} propertyName - property name array is sorted by
 * @return {number[]} array of positions
 */
export const calcPositions = <T,>(
  sortedResults: T[],
  propertyName: keyof T,
): number[] => {
  if (sortedResults.length === 0) return [];

  const positions: number[] = [];
  let resultIndex = 0;

  while (resultIndex < sortedResults.length) {
    const numTied = countTied(sortedResults, propertyName, resultIndex);
    const position = resultIndex + 1;
    for (let i = 0; i < numTied; i++) {
      positions.push(position);
    }
    resultIndex += numTied;
  }

  return positions;
};

/** 
 * distribute prizes 
 * note 1: sortedResults is sorted by propertyName
 *         sortedPfs is sorted by position
 * 
 * @param {T[]} sortedResults - array of sorted results
 * @param {keyof T} propertyName - property name array is sorted by
 * @param {divPfType[] | potPfType[] | elimPfType[]} sortedPfs - array of sorted prize fund
 * @returns {number[]} array of prizes, sorted by position
 */
export const calcPrizes = <T,>(
  sortedResults: T[],
  propertyName: keyof T,
  sortedPfs: divPfType[] | potPfType[] | elimPfType[],
): number[] => {
  if (sortedResults.length === 0) return []; 
  if (sortedPfs.length === 0) return [];  

  let prizeIndex = 0;
  let resultIndex = 0;  
  const prizes: number[] = [];

  // check for ties and adjust prizes appropriately
  while (prizeIndex < sortedPfs.length && resultIndex < sortedResults.length) {
    const numTied = countTied(sortedResults, propertyName, resultIndex);

    // a tie occupies one prize position per tied player;
    // only prize positions that actually exist are included
    const lastPrizeIndex = prizeIndex + numTied - 1;
    let totalPrize = 0;
    for (let p = prizeIndex; p <= lastPrizeIndex && p < sortedPfs.length; p++) {
      totalPrize += sortedPfs[p].amount ?? 0;
    }

    const prizePerPlayer = totalPrize / numTied;
    for (let i = 0; i < numTied; i++) {
      prizes.push(prizePerPlayer);
    }

    prizeIndex += numTied;
    resultIndex += numTied;
  }
  return prizes;
}

