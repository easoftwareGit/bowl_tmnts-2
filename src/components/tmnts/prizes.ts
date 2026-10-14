import { tmntGameResult } from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { calcNumGames, getLastGameWithScores } from "./games";

/**
 * Count the results, starting at startIndex, that have the same
 * "total + Hdcp" as the result at startIndex. Always at least 1.
 * Only looks at neighbouring results, so it cannot loop forever.
 * 
 * @param {tmntGameResult[]} tmntResults - array of tournament results
 * @param {number} startIndex - index of the first result to count
 * @returns {number} number of tied results
 */
const countTied = (
  tmntResults: tmntGameResult[],
  startIndex: number
): number => {
  const total = tmntResults[startIndex]["total + Hdcp"];
  let count = 1;
  while (
    startIndex + count < tmntResults.length &&
    tmntResults[startIndex + count]["total + Hdcp"] === total
  ) {
    count++;
  }
  return count;
};

/**
 * Calculate the position for each player.
 *
 * Tied players receive the same position. The next position
 * skips the positions occupied by the tied players.
 *
 * Example:
 *   scores:    1400, 1350, 1350, 1300
 *   positions:    1,    2,    2,    4
 *
 * @param {tmntGameResult[]} tmntResults - array of tournament results
 * @return {number[]} array of positions
 */
export const calcPositions = (tmntResults: tmntGameResult[]): number[] => {
  if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return [];

  const sortedResults = [...tmntResults].sort(
    (a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0)
  );

  const positions: number[] = [];
  let resultIndex = 0;

  while (resultIndex < sortedResults.length) {
    const numTied = countTied(sortedResults, resultIndex);
    const position = resultIndex + 1;
    for (let i = 0; i < numTied; i++) {
      positions.push(position);
    }
    resultIndex += numTied;
  }

  return positions;
};

// export const calcPositions = (tmntResults: tmntGameResult[]): number[] => {
//   if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return [];

//   // make sure data is sorted correctly
//   const sortedResults = [...tmntResults].sort(
//     (a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0)
//   );

//   const positions: number[] = [];
//   let position = 1;
//   let resultIndex = 0;

//   while (resultIndex < sortedResults.length) {
//     const currentTotal = sortedResults[resultIndex]["total + Hdcp"];
//     const allWithSameTotal = sortedResults.filter(
//       (result) => result["total + Hdcp"] === currentTotal);
    
//     const lastResultIndex = resultIndex + allWithSameTotal.length - 1;
//     for (let r = resultIndex; r <= lastResultIndex; r++) {
//       positions.push(position);
//     }

//     resultIndex += allWithSameTotal.length;
//     position += allWithSameTotal.length;
//   }

//   return positions;
// };

/** 
 * distribute prizes for a division
 * note 1: tmntResults is sorted by "total + Hdcp"
 *         divPfs is sorted by position
 * note 2: if not at last game, ties are not calculated
 * 
 * @param {tmntGameResult[]} tmntResults - array of TmntGameResult for division
 * @param {divPfType[]} divPfs - array of division prize fund
 * @returns {string[]} array of prizes, sorted by position
 */
export const calcPrizesForDiv = (
  tmntResults: tmntGameResult[],
  divPfs: divPfType[],  
): string[] => {
  if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return []; 
  if (!divPfs || !Array.isArray(divPfs) || divPfs.length === 0) return [];  

  // make sure data is sorted correctly
  const sortedResults = [...tmntResults].sort(
    (a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0)
  );
  const sortedDivPfs = [...divPfs].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  const numGames = calcNumGames(sortedResults);
  if (numGames === 0) return [];
  const lastGameWithScore = getLastGameWithScores(sortedResults);

  let prizeIndex = 0;
  let resultIndex = 0;  
  const prizes: string[] = [];

  // if not at last game, ties are not calculated
  if (numGames > lastGameWithScore) {
    for (let p = 0; p < sortedDivPfs.length; p++) {
      prizes.push(
        formatValueSymbSep2Dec((sortedDivPfs[p].amount ?? 0).toString(), localConfig)
      );
    }
    return prizes;
  }

  // at last game, check for ties and adjust prizes appropriately
  while (prizeIndex < sortedDivPfs.length && resultIndex < sortedResults.length) {
    const numTied = countTied(sortedResults, resultIndex);

    // a tie occupies one prize position per tied player;
    // only prize positions that actually exist are included
    const lastPrizeIndex = prizeIndex + numTied - 1;
    let totalPrize = 0;
    for (let p = prizeIndex; p <= lastPrizeIndex && p < sortedDivPfs.length; p++) {
      totalPrize += sortedDivPfs[p].amount ?? 0;
    }

    const prizePerPlayer = totalPrize / numTied;
    for (let i = 0; i < numTied; i++) {
      prizes.push(
        formatValueSymbSep2Dec(prizePerPlayer.toString(), localConfig)
      );
    }

    prizeIndex += numTied;
    resultIndex += numTied;
  }
  return prizes;

  // // if not at last game, ties are not calculated
  // if (numGames > lastGameWithScore) { 
  //   for (let p = 0; p < sortedDivPfs.length; p++) {
  //     prizes.push(formatValueSymbSep2Dec(sortedDivPfs[p].amount!.toString(), localConfig));
  //   }
  //   return prizes;
  // };
  
  // // at last game, check for ties and adjust prizes appropriately
  // while (prizeIndex < sortedDivPfs.length) {
  //   const currentTotal = sortedResults[resultIndex]["total + Hdcp"]
  //   const allWithSameTotal = sortedResults.filter(
  //     (result) => result["total + Hdcp"] === currentTotal);

  //   /*
  //   * A tie occupies one prize position for each tied player.
  //   * Only include prize positions that actually exist.
  //   */    
  //   const lastPrizeIndex = prizeIndex + allWithSameTotal.length - 1;
  //   let totalPrize = 0;
  //   for (let p = prizeIndex; p <= lastPrizeIndex && p < sortedDivPfs.length; p++) {
  //     const divPf = sortedDivPfs[p];
  //     totalPrize += divPf.amount!;      
  //   }
  //   prizeIndex += allWithSameTotal.length;
    
  //   const lastResultIndex = resultIndex + allWithSameTotal.length - 1;
  //   const prizePerPlayer = totalPrize / allWithSameTotal.length;
  //   for (let r = resultIndex; r <= lastResultIndex && r < sortedResults.length; r++) {
  //     prizes.push(formatValueSymbSep2Dec(prizePerPlayer.toString(), localConfig));
  //   }
  //   resultIndex += allWithSameTotal.length    
  // }
  // return prizes;
}
