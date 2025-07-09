import axios from "axios";
import { baseLanesApi } from "@/lib/db/apiPaths";
import { testBaseLanesApi } from "../../../../test/testApi";
import { laneType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankLane } from "../initVals";

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
    if (!isValidBtDbId(tmntId, "tmt")) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null
    const tmntLanes = response.data.lanes
    const lanes: laneType[] = tmntLanes.map((lane: any) => {
      return {
        ...blankLane,
        id: lane.id,
        squad_id: lane.squad_id,
        lane_number: lane.lane_number,
        in_use: lane.in_use,
      }
    })
    return lanes
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
    if (response.status !== 201) return null
    const dbLane = response.data.lane
    const postedLane: laneType = {
      ...blankLane,
      id: dbLane.id,
      squad_id: dbLane.squad_id,
      lane_number: dbLane.lane_number,
      in_use: dbLane.in_use,
    }
    return postedLane
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
    if (response.status !== 201) return null
    const dbLanes = response.data.lanes
    const manyLanes: laneType[] = dbLanes.map((lane: any) => {
      return {
        ...blankLane,
        id: lane.id,
        squad_id: lane.squad_id,
        lane_number: lane.lane_number,
        in_use: lane.in_use,
      }
    })
    return manyLanes
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
    if (response.status !== 200) return null
    const dbLane = response.data.lane
    const puttedLane: laneType = {
      ...blankLane,
      id: dbLane.id,
      squad_id: dbLane.squad_id,
      lane_number: dbLane.lane_number,
      in_use: dbLane.in_use,
    }
    return puttedLane
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
    if (!isValidBtDbId(id, "lan")) return -1    
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
export const deleteAllLanesForSquad = async (squadId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return -1
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
export const deleteAllLanesForTmnt = async (tmntId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return -1
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