import {
  tgrGameKey,
  tgrHdcpKey,
  tmntGameResult,
  tmntStandingsTableRow
} from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { calcNumGames, getLastGameWithScores } from "@/components/tmnts/games";
import { PAR } from "@/lib/validation/constants";

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
 * note 1: sortedResults is sorted by "total + Hdcp"
 *
 * Tied players receive the same position. The next position
 * skips the positions occupied by the tied players. 
 *
 * Example:
 *   scores:    1400, 1350, 1350, 1300
 *   positions:    1,    2,    2,    4
 *
 * @param {tmntGameResult[]} sortedResults - array of tournament results
 * @return {number[]} array of positions
 */
const calcPositions = (sortedResults: tmntGameResult[]): number[] => {
  if (sortedResults.length === 0) return [];

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

/** 
 * distribute prizes for a division
 * note 1: sortedResults is sorted by "total + Hdcp"
 *         sortedDivPfs is sorted by position
 * note 2: if not at last game, ties are not calculated
 * 
 * @param {tmntGameResult[]} sortedResults - array of TmntGameResult for division
 * @param {divPfType[]} sortedDivPfs - array of division prize fund
 * @returns {string[]} array of prizes, sorted by position
 */
const calcPrizesForDiv = (
  sortedResults: tmntGameResult[],
  sortedDivPfs: divPfType[],  
): string[] => {
  if (sortedResults.length === 0) return []; 
  if (sortedDivPfs.length === 0) return [];  

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
}

/**
 * Populate the standings rows from tnmtResults
 * 
 * @param {tmntGameResult[]} tmntResults - tournament game results from the database
 * @param {divPfType[]} justDivPfs - division prize funds - just one division
 * @returns {tmntStandingsTableRow[]} array of TmntStandingsTableRow for data table 
 */
export const populateStandingsRows = (
  tmntResults: tmntGameResult[],
  justDivPfs: divPfType[]
): tmntStandingsTableRow[] => {
  const pRows: tmntStandingsTableRow[] = [];
  
  // make sure data is sorted correctly
  // sort results high to low (b value - a value) 
  const sortedResults = [...tmntResults].sort(
    (a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0)
  );
  // sort positions low to high (1st to last) 
  const sortedDivPfs = [...justDivPfs].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  );

  const numGames = calcNumGames(sortedResults);

  // sortedResults is sorted by total + Hdcp, 
  let position = 1;
  sortedResults.forEach((result) => {
    const pRow: tmntStandingsTableRow = {
      id: result.player_id,
      // initial position by order; overwritten below by calcPositions, which handles ties
      position: position++, 
      player_id: result.player_id,
      full_name: result.full_name,
      average: result.average,
      hdcp: result.hdcp,
      total: result.total,      
      total_hdcp: result.total_hdcp,
      total_plus_total_hdcp: result["total + Hdcp"] ?? 0,  
      plus_minus: "",
      prize: "",
    };

    let plusMinus = 0;
    for (let game = 1; game <= numGames; game++) {

      pRow[tgrGameKey(game)] = result[tgrGameKey(game)];
      pRow[tgrHdcpKey(game)] = result[tgrHdcpKey(game)];

      if (result[tgrGameKey(game)] != null) {
        plusMinus += (result[tgrGameKey(game)] - PAR);
      }
    }

    pRow.plus_minus = (plusMinus > 0)
      ? `+${plusMinus}`
      : (plusMinus < 0) ? `${plusMinus}` : "0";

    pRows.push(pRow);
  });

  const prizes = calcPrizesForDiv(sortedResults, sortedDivPfs);
  for (let i = 0; i < pRows.length; i++) {
    pRows[i].prize = prizes[i] ?? "";
  }

  // calculate positions
  const positions = calcPositions(sortedResults);
  for (let i = 0; i < pRows.length; i++) {
    pRows[i].position = positions[i];
  }

  return pRows;
};
