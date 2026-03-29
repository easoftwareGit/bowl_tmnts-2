import { publicApi, privateApi } from "@/lib/api/axios";
import { baseSquadsApi } from "@/lib/api/apiPaths";
import { testBaseSquadsApi } from "../../../../test/testApi";
import type { oneBrktsAndSeedsType, squadType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { removeTimeFromISODateStr } from "@/lib/dateTools";
import { blankSquad } from "../initVals";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;

const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";
const withSeedsUrl = url + "/withSeeds/";

/**
 * maps db squad to squadType
 *
 * @param {any} squad - squad from API response
 * @returns {squadType} - mapped squad
 */
const mapSquad = (squad: any): squadType => ({
  ...blankSquad,
  id: squad.id,
  event_id: squad.event_id,
  squad_name: squad.squad_name,
  tab_title: squad.squad_name,
  games: squad.games,
  lane_count: squad.lane_count,
  starting_lane: squad.starting_lane,
  squad_date_str: removeTimeFromISODateStr(squad.squad_date),
  squad_time: squad.squad_time,
  sort_order: squad.sort_order,
});

/**
 * extracts squads from GET API response
 *
 * @param {any} squads - array of squads from GET API response
 * @returns {squadType[]} - array of squads
 */
export const extractSquads = (squads: any): squadType[] => {
  if (!squads || !Array.isArray(squads)) return [];
  return squads.map((squad: any) => mapSquad(squad));
};

/**
 * gets all squads for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get squads for
 * @returns {squadType[]} - array of squads for tmnt
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllSquadsForTmnt = async (
  tmntId: string
): Promise<squadType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data?.squads) {
      throw new Error("Error fetching squads");
    }

    return extractSquads(response.data.squads);
  } catch (err) {
    throw new Error(
      `getAllSquadsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all oneBrkts and seeds for a squad in one array of objects
 *
 * @param {string} squadId - id of squad to get oneBrkts and seeds for
 * @returns {oneBrktsAndSeedsType[]} - array of oneBrkts and seeds for squad
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllOneBrktsAndSeedsForSquad = async (
  squadId: string
): Promise<oneBrktsAndSeedsType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(withSeedsUrl + squadId);

    if (!response.data?.oneBrktsAndSeeds) {
      throw new Error("Error fetching oneBrkts and seeds");
    }

    return response.data.oneBrktsAndSeeds;
  } catch (err) {
    throw new Error(
      `getAllOneBrktsAndSeedsForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * post a new squad
 *
 * @param {squadType} squad - squad to post
 * @returns {squadType} - posted squad
 * @throws {Error} - if data is invalid or API call fails
 */
export const postSquad = async (squad: squadType): Promise<squadType> => {
  if (!squad || !isValidBtDbId(squad.id, "sqd")) {
    throw new Error("Invalid squad data");
  }

  try {
    // further sanitation and validation done in POST route
    const squadJSON = JSON.stringify(squad);
    const response = await privateApi.post(url, squadJSON);

    if (!response.data?.squad) {
      throw new Error("Error posting squad");
    }

    return mapSquad(response.data.squad);
  } catch (err) {
    throw new Error(
      `postSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * puts a squad
 *
 * @param {squadType} squad - squad to put
 * @returns {squadType} - put squad
 * @throws {Error} - if data is invalid or API call fails
 */
export const putSquad = async (squad: squadType): Promise<squadType> => {
  if (!squad || !isValidBtDbId(squad.id, "sqd")) {
    throw new Error("Invalid squad data");
  }

  try {
    // further sanitation and validation done in PUT route
    const squadJSON = JSON.stringify(squad);
    const response = await privateApi.put(squadUrl + squad.id, squadJSON);

    if (!response.data?.squad) {
      throw new Error("Error putting squad");
    }

    return mapSquad(response.data.squad);
  } catch (err) {
    throw new Error(
      `putSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * deletes a squad
 *
 * @param {string} id - id of squad to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteSquad = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await privateApi.delete(squadUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting squad");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
};
