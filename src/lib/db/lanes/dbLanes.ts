import { publicApi, privateApi } from "@/lib/api/axios";
import { baseLanesApi } from "@/lib/api/apiPaths";
import { testBaseLanesApi } from "../../../../test/testApi";
import type { laneType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankLane } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseLanesApi
  ? testBaseLanesApi
  : baseLanesApi;  

const laneUrl = url + "/lane/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extract lanes from API response
 *
 * @param {any} lanes - lanes to be extracted
 * @returns {laneType[]} - array of lanes
 */
export const extractLanes = (lanes: any): laneType[] => {
  if (!lanes || !Array.isArray(lanes)) return [];
  return lanes.map((lane: any) => ({
    ...blankLane,
    id: lane.id,
    squad_id: lane.squad_id,
    lane_number: lane.lane_number,
    in_use: lane.in_use,
  }));
};

/**
 * get all lanes for a squad
 *
 * @param {string} squadId - id of squad to get lanes for
 * @returns {laneType[]} - array of lanes
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllLanesForSquad = async (
  squadId: string
): Promise<laneType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  let response;
  try {
    response = await publicApi.get(squadUrl + squadId);
  } catch (err) {
    throw new Error(
      `getAllLanesForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  return extractLanes(response.data?.lanes);
};

/**
 * get all lanes for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get lanes for
 * @returns {laneType[]} - array of lanes
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllLanesForTmnt = async (
  tmntId: string
): Promise<laneType[] | null> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  let response;
  try {
    response = await publicApi.get(tmntUrl + tmntId);
  } catch (err) {
    throw new Error(
      `getAllLanesForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }

  return extractLanes(response.data?.lanes);
};

/**
 * post a new lane
 *
 * @param {laneType} lane - lane to post
 * @returns {laneType} - lane object
 * @throws {Error} - if lane is invalid or API call fails
 */
export const postLane = async (lane: laneType): Promise<laneType> => {
  if (!lane || !isValidBtDbId(lane.id, "lan")) {
    throw new Error("Invalid lane data");
  }

  let response;
  try {
    const laneJSON = JSON.stringify(lane);
    response = await privateApi.post(url, laneJSON);
  } catch (err) {
    throw new Error(
      `postLane failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.lane) {
    throw new Error("Error posting lane");
  }

  const dbLane = response.data.lane;
  const postedLane: laneType = {
    ...blankLane,
    id: dbLane.id,
    squad_id: dbLane.squad_id,
    lane_number: dbLane.lane_number,
    in_use: dbLane.in_use,
  };
  return postedLane;
};

/**
 * puts a lane
 *
 * @param {laneType} lane - lane to put
 * @returns {laneType} - lane object
 * @throws {Error} - if lane is invalid or API call fails
 */
export const putLane = async (lane: laneType): Promise<laneType> => {
  if (!lane || !isValidBtDbId(lane.id, "lan")) {
    throw new Error("Invalid lane data");
  }

  let response;
  try {
    const laneJSON = JSON.stringify(lane);
    response = await privateApi.put(laneUrl + lane.id, laneJSON);
  } catch (err) {
    throw new Error(
      `putLane failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.lane) {
    throw new Error("Error putting lane");
  }

  const dbLane = response.data.lane;
  const puttedLane: laneType = {
    ...blankLane,
    id: dbLane.id,
    squad_id: dbLane.squad_id,
    lane_number: dbLane.lane_number,
    in_use: dbLane.in_use,
  };
  return puttedLane;
};

/**
 * deletes a lane
 *
 * @param {string} id - the id of the lane to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteLane = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "lan")) {
    throw new Error("Invalid lane id");
  }

  let response;
  try {
    response = await privateApi.delete(laneUrl + id);
  } catch (err) {
    throw new Error(
      `deleteLane failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (typeof response.data?.count !== "number") {
    throw new Error("Error deleting lane");
  }

  return response.data.count;
};
