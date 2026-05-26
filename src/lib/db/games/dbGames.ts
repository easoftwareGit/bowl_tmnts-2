import { privateApi } from "@/lib/api/axios";
import { baseGamesApi } from "@/lib/api/apiPaths";
import { testBaseGamesApi } from "../../../../test/testApi";
import type { gameType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankGame } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseGamesApi
  ? testBaseGamesApi
  : baseGamesApi;  

const squadUrl = url + "/squad/";

/**
 * gets all games for a squad
 * 
 * @param {squadId} squadId - id of squad to get games for
 * @returns {gameType[]} - array of games for squad
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllGamesForSquad = async (squadId: string): Promise<gameType[]> => { 
  if (!isValidBtDbId(squadId, 'sqd')) { 
    throw new Error('Invalid squad id');    
  }
  let response;
  try { 
    response = await privateApi.get(squadUrl + squadId);
  } catch (err) {
    throw new Error(`getAllGamesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching games`)
  }    
  return response.data.games.map((game: any) => ({
    ...blankGame,
    id: game.id,
    player_id: game.player_id,
    squad_id: game.squad_id,
    game_num: game.game_num,
    score: game.score,
  }));
}

/**
 * upserts all games for a squad
 * 
 * @param {gameType[]} games - array of games to upsert
 * @returns {gameType[]} - array of games
 * @throws {Error} - if games are invalid or API call fails
 */
export const upsertAllGamesForSquad = async(squadId: string, games: gameType[]): Promise<gameType[]> => {
  // data validation is done in PUT route
  try {
    if (!isValidBtDbId(squadId, 'sqd')) {
      throw new Error('Invalid squad id');
    }
    const found = games.filter((game) => game.squad_id !== squadId);
    if (found.length > 0) {
      throw new Error('All games must have passed squad id');
    }
    const gamesJSON = JSON.stringify(games); 
    const response = await privateApi.put(squadUrl + squadId, gamesJSON);
    if (response.status !== 200) {
      throw new Error(`Unexpected status ${response.status} when upserting games`);
    }    
    return response.data.games;
  } catch (err) {
    throw new Error(
      `upsertAllGamesForSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
}