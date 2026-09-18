import type { TmntGameResult } from "@/lib/types/resultsTypes";
import type { gameType } from "@/lib/types/types";
import { dummySquadId } from "@/lib/validation/constants";
import { calcNumGames } from "@/components/tmnts/games";
import { btDbUuid } from "@/lib/uuid";

/**
 * Converts TmntGameResult[] to gameType[]
 * NOTE: tmntResults does not have game_id's for each game, or a squad id
 *       so create a new game id for each gameType item and use dummySquadId
 * 
 * @param {TmntGameResult[]} tmntResults - array of TmntGameResult objects
 * @returns {gameType[]} - array of gameType objects
 */
export const tmntResultsToGameTypes = (tmntResults: TmntGameResult[]): gameType[] => { 
  
  if (!tmntResults || !Array.isArray(tmntResults) || tmntResults.length === 0) return [];
  const numGames = calcNumGames(tmntResults);
  const games: gameType[] = [];
  tmntResults.forEach(tmntResult => {
    for (let g = 1; g <= numGames; g++) {
      const game: gameType = {
        id: btDbUuid('gam'),
        squad_id: dummySquadId,
        player_id: tmntResult.player_id,
        game_num: g,
        score: tmntResult[`Game ${g}`],        
      }
      games.push(game);
    }
  });
  return games;
};