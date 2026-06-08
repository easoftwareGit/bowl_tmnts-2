import type { gameType, tmntFullType } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";
import { isValidBtDbId } from "@/lib/validation/validation";
import { cloneDeep } from "lodash";

export const scoreEntryData: { [key: string]: any } = {
  id: "",
  player_id: "",
  first_name: "",
  last_name: "",
  average: 0,
  lanePos: "",
  total: null,
  plus_minus: null,
};

export type scoreEntryRow = typeof scoreEntryData;
/**
 * Extract game scores from score entry rows
 * 
 * @param {scoreEntryRow[]} rows - array of score entry rows
 * @param {gameType[]} games - array of existing games for squad
 * @param {string} squadId - id of squad
 * @returns {gameType[]} - array of new/edited games to upsert
 */
export const extractGameScores = (
  rows: scoreEntryRow[],
  games: gameType[],
  squadId: string,
): gameType[] => {
  const gameScores: gameType[] = [];

  // create a map of existing games for quick lookup
  const existingGamesMap = new Map<string, gameType>();
  games.forEach((game) => {
    existingGamesMap.set(
      `${game.player_id}_${game.game_num}`,
      game,
    );
  });

  // iterate through rows and extract game scores
  rows.forEach((row) => {
    for (const [key, value] of Object.entries(row)) {
      if (!key.startsWith("game_")) continue;
      if (value === null || value === "") continue;

      const gameNum = Number(key.split("_")[1]);
      if (!Number.isInteger(gameNum)) continue;

      // check if game already exists
      const existingGame = existingGamesMap.get(
        `${row.player_id}_${gameNum}`,
      );

      const score = Number(value);
      if (existingGame) {
        if (existingGame.score !== score) {
          gameScores.push({
            ...existingGame,
            score,
          });
        }
      } else {
        gameScores.push({
          id: btDbUuid("gam"),
          squad_id: squadId,
          player_id: row.player_id,
          game_num: gameNum,
          score,
        });
      }
    }
  });

  return gameScores;
};

/**
 * Populate rows for scores form
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @param {gameType[]} games - array of games
 * @returns {scoreEntryRow[]} - array of scoreEntryRow objects
 */
export const populateScoreRows = (
  tmntFullData: tmntFullType,
  games: gameType[],
): scoreEntryRow[] => {
  const sRows: scoreEntryRow[] = [];
  const numGames = tmntFullData?.squads?.[0]?.games ?? 0;

  // populate all players
  tmntFullData?.players?.forEach((player) => {
    // if a player, then add player to sRows
    if (isValidBtDbId(player.id, "ply")) {
      const sRow: scoreEntryRow = cloneDeep({ ...scoreEntryData });
      sRow.id = player.id;
      sRow.player_id = player.id;
      sRow.first_name = player.first_name;
      sRow.last_name = player.last_name;
      sRow.average = player.average;
      sRow.lanePos = `${player.lane}-${player.position}`;
      for (let g = 1; g <= numGames; g++) {
        sRow["game_" + g] = null;
      }
      sRow.total = 0;
      sRow.plus_minus = 0;
      const playerScores = games.filter((game) => game.player_id === player.id);
      playerScores.forEach((game) => {
        sRow["game_" + game.game_num] = game.score;
        sRow.total += game.score;
      });
      sRows.push(sRow);
    }
  });
  return sRows;
};
