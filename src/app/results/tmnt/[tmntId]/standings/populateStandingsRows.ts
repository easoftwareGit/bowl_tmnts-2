import {
  tgrGameKey,
  tgrHdcpKey,
  tmntGameResult,
  tmntStandingsTableRow
} from "@/lib/types/resultsTypes";
import { divPfType } from "@/lib/types/types";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import { calcNumGames } from "@/components/tmnts/games";
import { PAR } from "@/lib/validation/constants";
import { calcPositions, calcPrizes } from "@/lib/results/calcResults";

/**
 * Populate the standings rows from tnmtResults
 *
 * note: ties are only calculated for prizes once at least one result has a
 *       score for the last game. Until then, the prize fund amounts are shown
 *       in position order.
 *
 * @param {tmntGameResult[]} tmntResults - tournament game results from the database
 * @param {divPfType[]} justDivPfs - division prize funds - just one division
 * @returns {tmntStandingsTableRow[]} array of TmntStandingsTableRow for data table
 */
export const populateStandingsRows = (
  tmntResults: tmntGameResult[],
  justDivPfs: divPfType[]
): tmntStandingsTableRow[] => {

  if (!Array.isArray(tmntResults) || tmntResults.length === 0) return [];

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

  // only calculate ties once at least one result has a score for the last game;
  // before that, show the prize fund amounts in position order
  const lastGameKey = tgrGameKey(numGames);
  const prizes: number[] = sortedResults.some((r) => r[lastGameKey] != null)
    ? calcPrizes(sortedResults, "total + Hdcp", sortedDivPfs)
    : sortedDivPfs.map((pf) => pf.amount ?? 0);

  // calcPositions handles ties (1, 2, 2, 4)
  const positions = calcPositions(sortedResults, "total + Hdcp");

  return sortedResults.map((result, i) => {
    const prize = prizes[i]; // undefined past the last paid place
    const pRow: tmntStandingsTableRow = {
      id: result.player_id,
      position: positions[i] ?? i + 1,
      player_id: result.player_id,
      full_name: result.full_name,
      average: result.average,
      hdcp: result.hdcp,
      total: result.total,
      total_hdcp: result.total_hdcp,
      total_plus_total_hdcp: result["total + Hdcp"] ?? 0,
      plus_minus: "",
      prize: (prize != null)
        ? formatValueSymbSep2Dec(prize.toString(), localConfig)
        : "",
    };

    let plusMinus = 0;
    for (let game = 1; game <= numGames; game++) {
      const gameScore = result[tgrGameKey(game)];
      pRow[tgrGameKey(game)] = gameScore;
      pRow[tgrHdcpKey(game)] = result[tgrHdcpKey(game)];
      if (gameScore != null) {
        plusMinus += (gameScore - PAR);
      }
    }

    pRow.plus_minus = (plusMinus > 0)
      ? `+${plusMinus}`
      : (plusMinus < 0) ? `${plusMinus}` : "0";

    return pRow;
  });
};
