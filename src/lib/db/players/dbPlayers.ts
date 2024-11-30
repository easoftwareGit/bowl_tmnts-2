import axios from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../../test/testApi";
import { playerType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankPlayer } from "../initVals";

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi; 

const onePlayerUrl = url + "/player/";
const oneSquadUrl = url + "/squad/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * gets all players for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get players for
 * @returns {playerType[] | null} - array of players or null
 */
export const getAllPlayersForTmnt = async (tmntId: string): Promise<playerType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntPlayers = response.data.players;
    const players: playerType[] = tmntPlayers.map((player: any) => {
      return {
        ...blankPlayer,
        id: player.id,
        squad_id: player.squad_id,
        first_name: player.first_name,
        last_name: player.last_name,
        average: player.average,
        lane: player.lane,
        position: player.position,
      };
    });
    return players;
  } catch (err) {
    return null;
  }
};

/**
 * gets all players for a squad
 * 
 * @param {string} squadId - id of squad to get players for
 * @returns {playerType[] | null} - array of players or null
 */
export const getAllPlayersForSquad = async (squadId: string): Promise<playerType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) {
      return null;
    }
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const squadPlayers = response.data.players;
    const players: playerType[] = squadPlayers.map((player: any) => {
      return {
        ...blankPlayer,
        id: player.id,
        squad_id: player.squad_id,
        first_name: player.first_name,
        last_name: player.last_name,
        average: player.average,
        lane: player.lane,
        position: player.position,
      };
    });
    return players;
  } catch (err) {
    return null;
  }
};

/**
 * posts a player
 * 
 * @param {playerType} player - player to post
 * @returns {playerType | null} - player or null
 */
export const postPlayer = async (player: playerType): Promise<playerType | null> => { 
  try {
    if (!player || !isValidBtDbId(player.id, "ply")) return null;
    // further sanatation and validation done in POST route
    const playerJSON = JSON.stringify(player);
    const response = await axios({
      method: "post",
      data: playerJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
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
  } catch (err) {
    return null;
  }
}

/**
 * posts many players
 * 
 * @param {playerType[]} players - array of players to post
 * @returns {playerType[] | null} - array of players or null
 */
export const postManyPlayers = async (players: playerType[]): Promise<playerType[] | null> => { 
  try {
    if (!players) return null;
    if (players.length === 0) return [];
    const playersJSON = JSON.stringify(players);
    // further sanatation and validation done in POST route
    const response = await axios({
      method: "post",
      data: playersJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbPlayers = response.data.players;
    const postedPlayers: playerType[] = dbPlayers.map((player: any) => {
      return {
        ...blankPlayer,
        id: player.id,
        squad_id: player.squad_id,
        first_name: player.first_name,
        last_name: player.last_name,
        average: player.average,
        lane: player.lane,
        position: player.position,
      };
    })
    return postedPlayers;
  } catch (err) {
    return null;
  }
}
    
/**
 * updates a player
 * 
 * @param {playerType} player - player to put
 * @returns {playerType | null} - player or null
 */
export const putPlayer = async (player: playerType): Promise<playerType | null> => { 
  try {
    if (!player || !isValidBtDbId(player.id, "ply")) return null;
    // further sanatation and validation done in PUT route
    const playerJSON = JSON.stringify(player);
    const response = await axios({
      method: "put",
      data: playerJSON,
      withCredentials: true,
      url: onePlayerUrl + player.id,
    });
    if (response.status !== 200) return null;
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
  } catch (err) {
    return null;
  }
}

/**
 * deletes a player
 * 
 * @param {string} id - player id to delete
 * @returns {number} - 1 on success, -1 on failure
 */
export const deletePlayer = async (id: string): Promise<number> => { 
  try {
    if (!id || !isValidBtDbId(id, "ply")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: onePlayerUrl + id,
    });    
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all players for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of players deleted on success, -1 on failure
 */
export const deleteAllSquadPlayers = async (squadId: string): Promise<number> => {
  try {
    if (!squadId || !isValidBtDbId(squadId, "sqd")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
} 

/**
 * deletes all players for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of players deleted on success, -1 on failure
 */
export const deleteAllTmntPlayers = async (tmntId: string): Promise<number> => {
  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}