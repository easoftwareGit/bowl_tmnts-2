import {
  tgrGameKey,
  tgrHdcpKey,
  tmntGameResult,
  tmntStandingsTableRow
} from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { calcPositions, calcPrizesForDiv } from "@/components/tmnts/prizes";
import { calcNumGames } from "@/components/tmnts/games";

// const gameKey = (n: number): GameNum => `Game ${n}`;
// const hdcpKey = (n: number): GameHdcp => `Game ${n} + Hdcp`;

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
      total_hdcp: result.total_hdcp,
      total_plus_total_hdcp: result["total + Hdcp"] ?? 0,  
      plus_minus: "",
      prize: "",
    };

    let plusMinus = 0;
    for (let game = 1; game <= numGames; game++) {
      // const gameCol = `Game ${game}` as const;
      // const gameHdcpCol = `Game ${game} + Hdcp` as const;

      pRow[tgrGameKey(game)] = result[tgrGameKey(game)];
      pRow[tgrHdcpKey(game)] = result[tgrHdcpKey(game)];

      if (result[tgrGameKey(game)]) {
        plusMinus += (result[tgrGameKey(game)] - 200);
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
