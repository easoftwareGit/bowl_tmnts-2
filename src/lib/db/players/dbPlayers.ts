import { publicApi, privateApi } from "@/lib/api/axios";
import { basePlayersApi } from "@/lib/api/apiPaths";
import { testBasePlayersApi } from "../../../../test/testApi";
import type { playerType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankPlayer } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePlayersApi
  ? testBasePlayersApi
  : basePlayersApi;  

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
};

/**
 * maps one player from API response to playerType
 *
 * @param {any} player - player from API response
 * @returns {playerType} - extracted player
 */
const extractPlayer = (player: any): playerType => ({
  ...blankPlayer,
  id: player.id,
  squad_id: player.squad_id,
  first_name: player.first_name,
  last_name: player.last_name,
  average: player.average,
  lane: player.lane,
  position: player.position,
});

/**
 * gets all players for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get players for
 * @returns {playerType[]} - array of players
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllPlayersForTmnt = async (
  tmntId: string
): Promise<playerType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data?.players) {
      throw new Error("Error fetching players");
    }

    return extractPlayers(response.data.players);
  } catch (err) {
    throw new Error(
      `getAllPlayersForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * gets all players for a squad
 *
 * @param {string} squadId - id of squad to get players for
 * @returns {playerType[]} - array of players
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllPlayersForSquad = async (
  squadId: string
): Promise<playerType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);

    if (!response.data?.players) {
      throw new Error("Error fetching players");
    }

    return extractPlayers(response.data.players);
  } catch (err) {
    throw new Error(
      `getAllPlayersForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
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

  try {
    // further sanitation and validation done in POST route
    const playerJSON = JSON.stringify(player);
    const response = await privateApi.post(url, playerJSON);

    if (!response.data?.player) {
      throw new Error("Error posting player");
    }

    return extractPlayer(response.data.player);
  } catch (err) {
    throw new Error(
      `postPlayer failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

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

  try {
    // further sanitation and validation done in PUT route
    const playerJSON = JSON.stringify(player);
    const response = await privateApi.put(playerUrl + player.id, playerJSON);

    if (!response.data?.player) {
      throw new Error("Error putting player");
    }

    return extractPlayer(response.data.player);
  } catch (err) {
    throw new Error(
      `putPlayer failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

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

  try {
    const response = await privateApi.delete(playerUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting player");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deletePlayer failed: ${err instanceof Error ? err.message : err}`
    );
  }
};