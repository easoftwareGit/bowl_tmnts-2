import axios from "axios";
import { baseLanesApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi } from "../../../../test/testApi";
import { laneType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";

const url = testBaseLanesApi.startsWith("undefined")
  ? baseLanesApi
  : testBaseLanesApi;   
const oneLaneUrl = url + "/lane/";
const oneSquadUrl = url + "/squad/"; 
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";

/**
 * get all lanes for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get lanes for
 * @returns {laneType[] | null} - array of lanes or null
 */
export const getAllLanesForTmnt = async (tmntId: string): Promise<laneType[] | null> => {

  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200)
      ? response.data.lanes
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post a new lane
 * 
 * @param {laneType} lane - lane to post
 * @returns {laneType | null} - lane object or null
 */
export const postLane = async (lane: laneType): Promise<laneType | null> => {
    
  try {
    if (!lane || !isValidBtDbId(lane.id, 'lan')) return null    
    // further sanatation and validation done in POST route
    const laneJSON = JSON.stringify(lane);
    const response = await axios({
      method: "post",
      data: laneJSON,
      withCredentials: true,
      url: url,
    });
    return (response.status === 201)
      ? response.data.lane
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post many lanes
 * 
 * @param {laneType[]} lanes - array of lanes to post
 * @returns {laneType[] | null} - array of lanes posted or null
 */
export const postManyLanes = async (lanes: laneType[]): Promise<laneType[] | null> => {

  try {
    if (!lanes || lanes.length === 0) return null
    // further sanatation and validation done in POST route
    const laneJSON = JSON.stringify(lanes);
    const response = await axios({
      method: "post",
      data: laneJSON,
      withCredentials: true,
      url: manyUrl,
    });
    return (response.status === 201)
      ? response.data.lanes
      : null
  } catch (err) {
    return null;
  }
}

/**
 * puts a lane
 * 
 * @param {laneType} lane - lane to put
 * @returns {laneType | null} - lane object or null
 */
export const putLane = async (lane: laneType): Promise<laneType | null> => { 
  
  try {
    if (!lane || !isValidBtDbId(lane.id, 'lan')) return null
    // further sanatation and validation done in PUT route
    const laneJSON = JSON.stringify(lane);
    const response = await axios({
      method: "put",
      data: laneJSON,
      withCredentials: true,
      url: oneLaneUrl + lane.id,
    });
    return (response.status === 200)
      ? response.data.lane
      : null
  } catch (err) {
    return null;
  }
}

/**
 * deletes a lane
 * 
 * @param {string} id - the id of the lane to delete
 * @returns {number} - 1 if deleted, -1 if not found or error
 */
export const deleteLane = async (id: string): Promise<number> => {
  try {
    if (!id || !isValidBtDbId(id, "lan")) return -1    
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneLaneUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all lanes for a squad 
 * 
 * @param {string} squadId - id of squad to delete all lanes from
 * @returns {number} - # of lanes deleted, -1 if squadId is invalid or an error
 */
export const deleteAllSquadLanes = async (squadId: string): Promise<number> => {
  try {
    if (!squadId || !isValidBtDbId(squadId, "sqd")) return -1
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
 * deletes all lanes for a tmnt 
 * 
 * @param {string} tmntId - id of tmnt with lanes to delete
 * @returns {number} - # of lanes deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntLanes = async (tmntId: string): Promise<number> => {
  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return -1
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