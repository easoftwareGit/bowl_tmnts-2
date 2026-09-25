import { tmntGameResult, tmntStandingsTableRow } from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { calcPositions, calcPrizesForDiv } from "@/components/tmnts/prizes";
import { calcNumGames } from "@/components/tmnts/games";

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
  const numGames = calcNumGames(tmntResults);

  // tmntResults is sorted by total + Hdcp, 
  let position = 1;
  tmntResults.forEach((result) => {
    const pRow: tmntStandingsTableRow = {
      id: result.player_id,
      position: position++,
      player_id: result.player_id,
      full_name: result.full_name,
      average: result.average,
      hdcp: result.hdcp,
      total: result.total,      
      total_hdcp: result.hdcp * numGames,
      total_plus_total_hdcp: result["total + Hdcp"] ?? 0,  
      plus_minus: "",
      prize: "",
    };

    let plusMinus = 0;
    for (let game = 1; game <= numGames; game++) {
      const gameCol = `Game ${game}` as const;
      const gameHdcpCol = `Game ${game} + Hdcp` as const;

      pRow[gameCol] = result[gameCol];
      pRow[gameHdcpCol] = result[gameHdcpCol];

      if (result[gameCol]) {
        plusMinus += (result[gameCol] - 200);
      }
    }

    pRow.plus_minus = (plusMinus > 0)
      ? `+${plusMinus}`
      : (plusMinus < 0) ? `${plusMinus}` : "0";

    pRows.push(pRow);
  });

  const prizes = calcPrizesForDiv(tmntResults, justDivPfs);
  for (let i = 0; i < pRows.length; i++) {
    pRows[i].prize = prizes[i];
  }

  // calculate positions
  const positions = calcPositions(tmntResults);
  for (let i = 0; i < pRows.length; i++) {
    pRows[i].position = positions[i];
  }

  return pRows;
};
