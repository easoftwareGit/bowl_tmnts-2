import axios from "axios";
import { baseGamesApi } from "@/lib/db/apiPaths";
import { testBaseGamesApi } from "../../../../test/testApi";
import type { gameType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankGame } from "../initVals";

const url = testBaseGamesApi.startsWith("undefined")
  ? baseGamesApi
  : testBaseGamesApi;  
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
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
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