import axios from "axios";
import { baseLanesApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi } from "../../../../test/testApi";
import type { laneType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { blankLane } from "../initVals";
import { validateLanes } from "@/lib/validation/lanes/validate";

const url = testBaseLanesApi.startsWith("undefined")
  ? baseLanesApi
  : testBaseLanesApi;   
const laneUrl = url + "/lane/";
const manyUrl = url + "/many";
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
}

/**
 * get all lanes for a squad
 * 
 * @param {string} squadId - id of squad to get lanes for
 * @returns {laneType[]} - array of lanes
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllLanesForSquad = async (squadId: string): Promise<laneType[]> => {

  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllLanesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching lanes`)
  }
  return extractLanes(response.data.lanes);
}

/**
 * get all lanes for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get lanes for
 * @returns {laneType[]} - array of lanes
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllLanesForTmnt = async (tmntId: string): Promise<laneType[] | null> => {

  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllLanesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching lanes`)
  }    
  return extractLanes(response.data.lanes);
}

/**
 * post a new lane
 * 
 * @param {laneType} lane - lane to post
 * @returns {laneType} - lane object
 * @throws {Error} - if lane is invalid or API call fails
 */
export const postLane = async (lane: laneType): Promise<laneType> => {
  
  if (!lane || !isValidBtDbId(lane.id, 'lan')) {
    throw new Error('Invalid lane data');
  }
  let response;
  try { 
    const laneJSON = JSON.stringify(lane);
    response = await axios.post(url, laneJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`postLane failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.lane) {
    throw new Error("Error posting lane");
  }
  const dbLane = response.data.lane
  const postedLane: laneType = {
    ...blankLane,
    id: dbLane.id,
    squad_id: dbLane.squad_id,
    lane_number: dbLane.lane_number,
    in_use: dbLane.in_use,
  }
  return postedLane
}

/**
 * post many lanes
 * 
 * @param {laneType[]} lanes - array of lanes to post
 * @returns {number} - array of lanes posted
 * @throws {Error} - if lanes are invalid or API call fails
 */
export const postManyLanes = async (lanes: laneType[]): Promise<number> => {

  if (!lanes || !Array.isArray(lanes)) { 
    throw new Error('Invalid lanes data');
  }
  if (lanes.length === 0) return 0; // not an error, just no data to post  
  const validLanes = validateLanes(lanes);
  if (validLanes.errorCode !== ErrorCode.NONE
    || validLanes.lanes.length !== lanes.length)
  { 
    if (validLanes.lanes.length === 0) {      
      throw new Error('Invalid lane data at index 0');
    }
    const errorIndex = lanes.findIndex(lane => !isValidBtDbId(lane.id, "lan"));
    if (errorIndex < 0) {
      throw new Error(`Invalid lane data at index ${validLanes.lanes.length}`);
    } else {
      throw new Error(`Invalid lane data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const lanesJSON = JSON.stringify(lanes);  
    response = await axios.post(manyUrl, lanesJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyLanes failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting lanes");
  }
  return response.data.count;
}

/**
 * puts a lane
 * 
 * @param {laneType} lane - lane to put
 * @returns {laneType} - lane object
 * @throws {Error} - if lane is invalid or API call fails
 */
export const putLane = async (lane: laneType): Promise<laneType> => { 
  
  if (!lane || !isValidBtDbId(lane.id, 'lan')) { 
    throw new Error('Invalid lane data');
  }
  let response;
  try {
    const laneJSON = JSON.stringify(lane);
    response = await axios.put(laneUrl + lane.id, laneJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`putLane failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.lane) {
    throw new Error("Error putting lane");
  }
  const dbLane = response.data.lane
  const puttedLane: laneType = {
    ...blankLane,
    id: dbLane.id,
    squad_id: dbLane.squad_id,
    lane_number: dbLane.lane_number,
    in_use: dbLane.in_use,
  }
  return puttedLane
}

/**
 * deletes a lane
 * 
 * @param {string} id - the id of the lane to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteLane = async (id: string): Promise<number> => {

  if (!isValidBtDbId(id, "lan")) { 
    throw new Error('Invalid lane id');
  }
  let response;
  try { 
    response = await axios.delete(laneUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteLane failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting lane");
  }
  return response.data.count;
}

/**
 * deletes all lanes for a squad 
 * 
 * @param {string} squadId - id of squad to delete all lanes from
 * @returns {number} - # of lanes deleted
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllLanesForSquad = async (squadId: string): Promise<number> => {

  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllLanesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting lanes for squad");
  }
  return response.data.count;
}

/**
 * deletes all lanes for a tmnt 
 * 
 * @param {string} tmntId - id of tmnt with lanes to delete
 * @returns {number} - # of lanes deleted
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const deleteAllLanesForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllLanesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting lanes for tmnt");
  }
  return response.data.count
}