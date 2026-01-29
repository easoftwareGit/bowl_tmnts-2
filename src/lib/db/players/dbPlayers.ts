import axios from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../../test/testApi";
import { playerType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { blankPlayer } from "../initVals";
import { validatePlayers } from "@/lib/validation/players/validate";

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi; 

const manyUrl = url + "/many";   
const playerUrl = url + "/player/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extracts player data from GET API response
 * 
 * @param {any} players - array of players from GET API response
 * @returns {playerType[]} - array of players with extracted data
 */
export const extractPlayers = (players: any): playerType[] => {
  return players.map((player: any) => ({
    ...blankPlayer,
    id: player.id,
    squad_id: player.squad_id,
    first_name: player.first_name,
    last_name: player.last_name,
    average: player.average,
    lane: player.lane,
    position: player.position,
  }));
}

/**
 * gets all players for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get players for
 * @returns {playerType[]} - array of players
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllPlayersForTmnt = async (tmntId: string): Promise<playerType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllPlayersForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching players`)
  }    
  return extractPlayers(response.data.players);
};

/**
 * gets all players for a squad
 * 
 * @param {string} squadId - id of squad to get players for
 * @returns {playerType[]} - array of players 
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllPlayersForSquad = async (squadId: string): Promise<playerType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllPlayersForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching players`)
  }
  return extractPlayers(response.data.players);
};

/**
 * posts a player
 * 
 * @param {playerType} player - player to post 
 * @returns {playerType} - player
 * @throws {Error} - if data is invalid or API call fails
 */
export const postPlayer = async (player: playerType): Promise<playerType> => { 

  if (!player || !isValidBtDbId(player.id, "ply")) {
    throw new Error("Invalid player data");
  }
  let response;
  try {
    // further sanatation and validation done in POST route
    const playerJSON = JSON.stringify(player);
    response = await axios.post(url, playerJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`postPlayer failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.player) {
    throw new Error("Error posting player");
  }
  const dbPlayer = response.data.player;
  const postedPlayer: playerType = {
    ...blankPlayer,
    id: dbPlayer.id,
    squad_id: dbPlayer.squad_id,
    first_name: dbPlayer.first_name,
    last_name: dbPlayer.last_name,
    average: dbPlayer.average,
    lane: dbPlayer.lane,
    position: dbPlayer.position,
  }
  return postedPlayer; 
}

/**
 * posts many players
 * 
 * @param {playerType[]} players - array of players to post
 * @returns {number} - number of players posted or
 * @throws {Error} - if data is invalid or API call fails
 */
export const postManyPlayers = async (players: playerType[]): Promise<number> => { 
  if (!players || !Array.isArray(players)) { 
    throw new Error("Invalid players data");
  }
  if (players.length === 0) return 0; // not an error, just no data to post  
  const validPlayers = validatePlayers(players);
  if (validPlayers.errorCode !== ErrorCode.NONE
    || validPlayers.players.length !== players.length)
  { 
    if (validPlayers.players.length === 0) {      
      throw new Error('Invalid player data at index 0');
    }
    const errorIndex = players.findIndex(player => !isValidBtDbId(player.id, "ply"));
    if (errorIndex < 0) {
      throw new Error(`Invalid player data at index ${validPlayers.players.length}`);
    } else {
      throw new Error(`Invalid player data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const playersJSON = JSON.stringify(players);  
    response = await axios.post(manyUrl, playersJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyPlayers failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting players");
  }
  return response.data.count;
}
    
/**
 * puts a player
 * 
 * @param {playerType} player - player to put
 * @returns {playerType} - player
 * @throws {Error} - if data is invalid or API call fails
 */
export const putPlayer = async (player: playerType): Promise<playerType> => { 
  if (!player || !isValidBtDbId(player.id, "ply")) {
    throw new Error("Invalid player data");
  }
  let response;
  try { 
    // further sanatation and validation done in PUT route
    const playerJSON = JSON.stringify(player);
    response = await axios.put(playerUrl + player.id, playerJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putPlayer failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.player) {
    throw new Error("Error putting player");
  }
  const dbPlayer = response.data.player;
  const postedPlayer: playerType = {
    ...blankPlayer,
    id: dbPlayer.id,
    squad_id: dbPlayer.squad_id,
    first_name: dbPlayer.first_name,
    last_name: dbPlayer.last_name,
    average: dbPlayer.average,
    lane: dbPlayer.lane,
    position: dbPlayer.position,
  };    
  return postedPlayer;
}

/**
 * deletes a player
 * 
 * @param {string} id - player id to delete
 * @returns {number} - 1 on success
 * @throws {Error} - if id is invalid or API call fails
 */
export const deletePlayer = async (id: string): Promise<number> => { 

  if (!isValidBtDbId(id, "ply")) {
    throw new Error("Invalid player id");
  }
  let response;
  try { 
    response = await axios.delete(playerUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deletePlayer failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting player");
  }
  return response.data.count;
}

/**
 * deletes all players for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of players deleted on success
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllPlayersForSquad = async (squadId: string): Promise<number> => {

  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPlayersForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting players for squad");
  }
  return response.data.count;
} 

/**
 * deletes all players for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of players deleted on success
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const deleteAllPlayersForTmnt = async (tmntId: string): Promise<number> => {

  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPlayersForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting players for tmnt");
  }
  return response.data.count;
}
