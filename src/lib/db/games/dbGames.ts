import axios from "axios";
import { baseGamesApi } from "@/lib/db/apiPaths";
import { testBaseGamesApi } from "../../../../test/testApi";
import { gameType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankGame } from "../initVals";

const url = testBaseGamesApi.startsWith("undefined")
  ? baseGamesApi
  : testBaseGamesApi;  
const oneSquadUrl = url + "/squad/";

/**
 * gets all games for a squad
 * 
 * @param {squadId} squadId - id of squad to get games for
 * @returns {gameType[] | null} - array of games for squad or null
 */
export const getAllGamesForSquad = async (squadId: string): Promise<gameType[] | null> => { 

  try {
    if (!squadId || !isValidBtDbId(squadId, 'sqd')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null
    const squadGames = response.data.games;
    const games: gameType[] = squadGames.map((game: any) => { 
      return {
        ...blankGame,
        id: game.id,
        player_id: game.player_id,
        squad_id: game.squad_id,        
        game_num: game.game_num,
        score: game.score,
      } 
    })
    return games        
  } catch (err) {
    return null;
  }  
}