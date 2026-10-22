import {
  tmntGameResult,
  tgrGameKey,
  tgrHdcpKey,
} from "@/lib/types/resultsTypes";
import { tmntFullType } from "@/lib/types/types";
import { maxGames } from "@/lib/validation/constants";
import { isValidBtDbId } from "@/lib/validation/validation";

export type potResultsRowType = {
  player_id: string;
  div_id: string;
  gameNum: number;
  score: number | null;
  hdcp: number | null;
  scoreWithHdcp: number | null;
  prizeMoney: number | null;
};

export type potGamesResultsType = {
  gameNum: number;
  rows: potResultsRowType[];
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
      const hdcp =
        score == null || scoreWithHdcp == null ? null : scoreWithHdcp - score;
      rows.push({
        player_id: playerRow.player_id,
        div_id: playerRow.div_id,
        gameNum: g,
        score,
        hdcp,
        scoreWithHdcp,
        prizeMoney: null,
      });
    }
  });

  return rows;
};

export const noGameResults: potGamesResultsType[] = [
  {
    gameNum: 0,
    rows: []
  }
];

/** 
 * Builds a list of pot game results
 *  
 * @param {string} pot_id 
 * @param {tmntFullType} tmntFullData 
 * @param {potResultsRowType[]} potResultsRows 
 * @param {number} numGames 
 * @returns {potGamesResultsType[]} - array of potGamesResultsType 
 *      note: on error returns { gameNum: 0, rows: [] } 
 */
export const potGameResults = (
  pot_id: string,
  tmntFullData: tmntFullType,
  potResultsRows: potResultsRowType[],
  numGames: number,
): potGamesResultsType[] => {
  if (!isValidBtDbId(pot_id, "pot")) return noGameResults;
  if (!tmntFullData) return noGameResults;
  if (!Array.isArray(potResultsRows) || potResultsRows.length === 0) return noGameResults;
  if (!Number.isInteger(numGames!) || numGames < 1 || numGames > maxGames) return noGameResults;

  const potPlayers = tmntFullData.potEntries.filter(
    (potEntry) => potEntry.pot_id === pot_id,
  );
  if (potPlayers.length === 0) {
    return noGameResults;
  }
  const potPlayerIds = new Set(potPlayers.map((potPlayer) => potPlayer.player_id));
  // game numbers 1..numGames
  const gameNums = Array.from({ length: numGames }, (_, i) => i + 1);

  return gameNums.map((gameNum) => ({
    gameNum,
    rows: potResultsRows
      .filter(
        (row) => row.gameNum === gameNum && potPlayerIds.has(row.player_id),
      )
      .sort((a, b) => (b.scoreWithHdcp ?? 0) - (a.scoreWithHdcp ?? 0)),
  }));
};

/** 
 * Builds a list of pot last game results
 *  
 * @param {string} pot_id 
 * @param {tmntFullType} tmntFullData 
 * @param {potResultsRowType[]} potResultsRows 
 * @param {number} numGames 
 * @returns {potResultsRowType[]} - array of potGamesResultsType 
 *      note: on error returns an empty array
 */
export const potLastGameResults = (
  pot_id: string,
  tmntFullData: tmntFullType,
  potResultsRows: potResultsRowType[],
  numGames: number,
): potResultsRowType[] => {
  if (!isValidBtDbId(pot_id, "pot")) return [];
  if (!tmntFullData) return [];
  if (!Array.isArray(potResultsRows) || potResultsRows.length === 0) return [];
  if (!Number.isInteger(numGames!) || numGames < 1 || numGames > maxGames) return [];

  const potPlayers = tmntFullData.potEntries.filter(
    (potEntry) => potEntry.pot_id === pot_id,
  );
  if (potPlayers.length === 0) return [];

  const potPlayerIds = new Set(potPlayers.map((potPlayer) => potPlayer.player_id));
  return potResultsRows
    .filter((row) => row.gameNum === numGames && potPlayerIds.has(row.player_id))
    .sort((a, b) => (b.scoreWithHdcp ?? 0) - (a.scoreWithHdcp ?? 0));
};
