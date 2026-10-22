import { getPlayerName } from "@/lib/getName";
import {
  tmntGameResult,
  GameNum,
  GameHdcp,
  tgrGameKey,
  tgrHdcpKey,
} from "@/lib/types/resultsTypes";
import { elimPfType, elimType, tmntFullType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { calcPositions, calcPrizes } from "../calcResults";

export type ElimGameNumAlive = `Game ${number} Alive`;
export const erAliveKey = (n: number): ElimGameNumAlive => `Game ${n} Alive`;

export type elimResults = {
  position: number | null;
  player_id: string;
  full_name: string;
  hdcp: number;

  // dynamic game columns
  [key: GameNum]: number | null;
  [key: GameHdcp]: number | null;
  [key: ElimGameNumAlive]: boolean | null;

  prize: number | null;
};

/**
 * Get all game data for all players entered for one eliminator
 *
 * @param {elimType} elim - eliminator info
 * @param {tmntFullType} tmntFullData - full tournament data
 * @param {tmntGameResult[]} tmntResults - tournament results
 * @param {Set<string>} elimPlayerIds - set of player ids
 * @return {elimResults[]} - array of all player data for one elim
 */
const getAllPlayerData = (
  elim: elimType,
  tmntFullData: tmntFullType,
  tmntResults: tmntGameResult[],
  elimPlayerIds: Set<string>,
): elimResults[] => {
  const allPlayerData: elimResults[] = [];
  elimPlayerIds.forEach((playerId) => {
    const playerResults = tmntResults.find(
      (result) => result.player_id === playerId,
    );
    if (playerResults) {
      const playerRow: elimResults = {
        position: null,
        player_id: playerResults.player_id,
        full_name: getPlayerName(tmntFullData.players, playerResults.player_id),
        hdcp: playerResults.hdcp,
        prize: null,
      };
      for (let game = elim.start; game <= elim.start + elim.games - 1; game++) {
        playerRow[tgrGameKey(game)] = playerResults[tgrGameKey(game)];
        playerRow[tgrHdcpKey(game)] = playerResults[tgrHdcpKey(game)];
        playerRow[erAliveKey(game)] = null;
      }
      allPlayerData.push(playerRow);
    }
  });
  return allPlayerData;
};

/**
 * Builds a list of rows for the eliminator results table
 *
 * @param {string} elimId - eliminator id
 * @param {tmntFullType} tmntFullData - full tournament data
 * @param {tmntGameResult[]} tmntResults - tournament results
 * @param {elimPfType[]} justElimPfs - eliminator prize funds just for this elim
 * @return {elimResults[]} - array of elimResults
 */
export const buildElimResultsRows = (
  elimId: string,
  tmntFullData: tmntFullType,
  tmntResults: tmntGameResult[],
  justElimPfs: elimPfType[],
): elimResults[] => {
  if (!isValidBtDbId(elimId, "elm")) return [];
  if (!tmntFullData || tmntFullData.elims.length === 0) return [];
  if (!Array.isArray(tmntResults) || tmntResults.length === 0) return [];

  const elim = tmntFullData.elims.find((e) => e.id === elimId);
  if (!elim) return [];

  const elimPlayers = tmntFullData.elimEntries.filter(
    (elimEntry) => elimEntry.elim_id === elim.id,
  );
  if (elimPlayers.length === 0) {
    return [];
  }
  const elimPlayerIds = new Set(
    elimPlayers.map((elimPlayer) => elimPlayer.player_id),
  );

  const allPlayerData = getAllPlayerData(
    elim,
    tmntFullData,
    tmntResults,
    elimPlayerIds,
  );

  const elimDataSorted = [...allPlayerData];
  const lastGame = elim.start + elim.games - 1;
  let isLastElimGameCompleted = false;
  let lastCompletedGameNum = 0;

  // a player competes in a game if it is the first game of the elim,
  // or they advanced from the previous game
  const isInElimForGame = (row: elimResults, game: number): boolean =>
    game === elim.start || row[erAliveKey(game - 1)] === true;

  let numAdvancing = Math.max(1, Math.ceil(elimPlayerIds.size / 2));  
  for (let game = elim.start; game <= lastGame; game++) {
    // sort on the current game, highest to lowest. sort is stable, so
    // players eliminated earlier keep their order from earlier games
    elimDataSorted.sort(
      (a, b) => (b[tgrHdcpKey(game)] ?? 0) - (a[tgrHdcpKey(game)] ?? 0),
    );

    // only players still in the elim for this game
    const alivePlayers = elimDataSorted.filter((row) => isInElimForGame(row, game));

    // stop at the first game where a player still in has no score yet
    if (alivePlayers.some((row) => row[tgrGameKey(game)] == null)) break;
    lastCompletedGameNum = game;

    // no player is eliminated in the last game: every finalist stays alive
    if (game === lastGame) {
      alivePlayers.forEach((row) => {
        row[erAliveKey(game)] = true;
      });
      isLastElimGameCompleted = true;
      break;
    }

    // handicap score of the last advancing player (ties at that score advance)
    const advancingScore = alivePlayers[numAdvancing - 1][tgrHdcpKey(game)] ?? 0;

    alivePlayers.forEach((row) => {
      row[erAliveKey(game)] = (row[tgrHdcpKey(game)] ?? 0) >= advancingScore;
    });

    // clear later games for players eliminated in this game
    if (game < lastGame) {
      alivePlayers
        .filter((row) => row[erAliveKey(game)] === false)
        .forEach((row) => {
          for (let g = game + 1; g <= lastGame; g++) {
            row[tgrGameKey(g)] = null;
            row[tgrHdcpKey(g)] = null;
            row[erAliveKey(g)] = null;
          }
        });
    }

    // calc num advancing for next game from the calculated number, not the
    // actual number. ties let extra players advance, but don't change the count
    numAdvancing = Math.max(1, Math.ceil(numAdvancing / 2));
  }  

  // calc and distribute prizes
  if (isLastElimGameCompleted && Array.isArray(justElimPfs)) {
    // sort prize fund positions low to high (1st to last)
    const pfs = [...justElimPfs].sort(
      (a, b) => (a.position ?? 0) - (b.position ?? 0),
    );

    // only finalists (alive in the last game) share the prize fund.
    // eliminated players never get a prize
    const finalists = elimDataSorted.filter(
      (player) => player[erAliveKey(lastGame)] === true,
    );    

    // calc the prizes (takes care of ties)
    const prizes = calcPrizes(finalists, tgrHdcpKey(lastGame), pfs);
    // distribute the prizes
    prizes.forEach((prize, i) => {
      finalists[i].prize = prize;
    });
  }

  const positions = (lastCompletedGameNum > 0)
    ? calcPositions(elimDataSorted, tgrHdcpKey(lastCompletedGameNum))
    : Array.from({ length: elimPlayers.length }, (_, index) => index + 1);

  elimDataSorted.forEach((player, i) => {
    player.position = positions[i];
  });   
  return elimDataSorted;
};

/**
 * Gets lowest advancing score for each completed elim game.
 * last game is skipped, no players advances from the final.
 *
 * @param {elimResults[]} rows - rows from buildElimResultsRows
 * @param {elimType} elim - eliminator info
 * @return {Map<number, number>} - key: game number, value: lowest advancing score
 */
export const getElimAdvancingScores = (
  rows: elimResults[],
  elim: elimType,
): Map<number, number> => {
  const advancingScores = new Map<number, number>();
  if (!Array.isArray(rows) || rows.length === 0 || !elim) return advancingScores;

  const lastGame = elim.start + elim.games - 1;
  for (let game = elim.start; game < lastGame; game++) {
    let lowScore: number | null = null;
    for (const row of rows) {
      if (row[erAliveKey(game)] !== true) continue;
      const score = row[tgrHdcpKey(game)] ?? 0;
      if (lowScore === null || score < lowScore) lowScore = score;
    }
    // no one marked alive = game not completed yet, so later games aren't either
    if (lowScore === null) break;
    advancingScores.set(game, lowScore);
  }
  return advancingScores;
};