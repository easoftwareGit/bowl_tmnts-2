import { TmntGameResult } from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { calcNumGames, getLastGameWithScores } from "./games";

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
 * Note: tmntResults is sorted by "total + Hdcp".
 *
 * @param {TmntGameResult[]} tmntResults - array of tournament results
 * @return {number[]} array of positions
 */
export const calcPositions = (tmntResults: TmntGameResult[]): number[] => {
  if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return [];

  const positions: number[] = [];
  let position = 1;
  let resultIndex = 0;

  while (resultIndex < tmntResults.length) {
    const currentTotal = tmntResults[resultIndex]["total + Hdcp"];
    const allWithSameTotal = tmntResults.filter(
      (result) => result["total + Hdcp"] === currentTotal);
    
    const lastResultIndex = resultIndex + allWithSameTotal.length - 1;
    for (let r = resultIndex; r <= lastResultIndex; r++) {
      positions.push(position);
    }

    resultIndex += allWithSameTotal.length;
    position += allWithSameTotal.length;
  }

  return positions;
};

/** 
 * distribute prizes for a division
 * note 1: tmntResults is sorted by "total + Hdcp"
 *         divPfs is sorted by position
 * note 2: if not at last game, ties are not calculated
 * 
 * @param {TmntGameResult[]} tmntResults - array of TmntGameResult for division
 * @param {divPfType[]} divPfs - array of division prize fund
 * @returns {string[]} array of prizes, sorted by position
 */
export const calcPrizesForDiv = (
  tmntResults: TmntGameResult[],
  divPfs: divPfType[],  
): string[] => {
  if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return [];
  if (!divPfs || !Array.isArray(divPfs) || divPfs.length === 0) return [];  
  const numGames = calcNumGames(tmntResults);
  if (numGames === 0) return [];
  const lastGameWithScore = getLastGameWithScores(tmntResults);

  let prizeIndex = 0;
  let resultIndex = 0;  
  const prizes: string[] = [];

  // if not at last game, ties are not calculated
  if (numGames > lastGameWithScore) { 
    for (let p = 0; p < divPfs.length; p++) {
      prizes.push(formatValueSymbSep2Dec(divPfs[p].amount!.toString(), localConfig));
    }
    return prizes;
  };
  
  // at last game, check for ties and adjust prizes appropriately
  while (prizeIndex < divPfs.length) {
    const currentTotal = tmntResults[resultIndex]["total + Hdcp"]
    const allWithSameTotal = tmntResults.filter(
      (result) => result["total + Hdcp"] === currentTotal);

    /*
    * A tie occupies one prize position for each tied player.
    * Only include prize positions that actually exist.
    */    
    const lastPrizeIndex = prizeIndex + allWithSameTotal.length - 1;
    let totalPrize = 0;
    for (let p = prizeIndex; p <= lastPrizeIndex && p < divPfs.length; p++) {
      const divPf = divPfs[p];
      totalPrize += divPf.amount!;      
    }
    prizeIndex += allWithSameTotal.length;
    
    const lastResultIndex = resultIndex + allWithSameTotal.length - 1;
    const prizePerPlayer = totalPrize / allWithSameTotal.length;
    for (let r = resultIndex; r <= lastResultIndex && r < tmntResults.length; r++) {
      prizes.push(formatValueSymbSep2Dec(prizePerPlayer.toString(), localConfig));
    }
    resultIndex += allWithSameTotal.length    
  }
  return prizes;
}
