import { tmntGameResult, tgrGameKey, tgrHdcpKey } from "@/lib/types/resultsTypes";

export type potResultsRowType = {
  player_id: string;
  div_id: string;
  gameNum: number;
  score: number | null;
  hdcp: number | null;
  scoreWithHdcp: number | null;
};

/**
 * Builds a list of rows for the pot results table
 * 
 * @param {tmntGameResult[]} tmntResults - array of tounament game results
 * @param {number} numGames - number of games in the tournament
 * @returns {potResultsRowType[]} array of potResultsRowType
 */
export const buildPotResultsRows = (
  tmntResults: tmntGameResult[],
  numGames: number,
): potResultsRowType[] => {
  const rows: potResultsRowType[] = [];

  tmntResults.forEach((playerRow) => {
    for (let g = 1; g <= numGames; g++) {
      const score = playerRow[tgrGameKey(g)];
      const scoreWithHdcp = playerRow[tgrHdcpKey(g)];
      const hdcp = (score == null || scoreWithHdcp == null)
        ? null
        : scoreWithHdcp - score;
      rows.push({
        player_id: playerRow.player_id,
        div_id: playerRow.div_id,
        gameNum: g,
        score,
        hdcp,
        scoreWithHdcp,        
      });
    }
  });

  return rows;
};