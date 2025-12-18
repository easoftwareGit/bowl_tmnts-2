import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../../test/testApi";
import { oneBrktsAndSeedsType, squadType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { removeTimeFromISODateStr } from "@/lib/dateTools";
import { blankSquad } from "../initVals";
import { validateSquads } from "@/app/api/squads/validate";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;  
// const entriesUrl = url + '/entries/';
const eventUrl = url + "/event/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/"; 
const tmntUrl = url + "/tmnt/";
const withSeedsUrl = url + "/withSeeds/";
   
/**
 * extracts squads from GET APT response
 * 
 * @param {any} squads - array of squads from GET APT response
 * @returns {squadType[]} - array of squads
 */
export const extractSquads = (squads: any): squadType[] => {
  if (!squads || !Array.isArray(squads)) return [];
  return squads.map((squad: any) => ({
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
    finalized: squad.finalized,
    sort_order: squad.sort_order,
  }));
}

/**
 * gets all squads for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get squads for
 * @returns {squadType[]} - array of squads for tmnt 
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllSquadsForTmnt = async (tmntId: string): Promise<squadType[]> => {
  if (!isValidBtDbId(tmntId, 'tmt')) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllSquadsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching squads`)
  }
  return extractSquads(response.data.squads);
}

/**
 * Get all oneBrkts and seeds for a squad in one array of objects
 * 
 * @param squadId - id of squad to get oneBrkts and seeds for
 * @returns - array of oneBrkts and seeds for squad 
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllOneBrktsAndSeedsForSquad = async (squadId: string): Promise<oneBrktsAndSeedsType[]> => { 
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(withSeedsUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsAndSeedsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts and seeds`)
  }    
  return response.data.oneBrktsAndSeeds;
}

/**
 * post a new squad
 * 
 * @param {squadType} squad - squad to post
 * @returns {squadType} - posted squad 
 * @throws {Error} - if data is invalid or API call fails
 */  
export const postSquad = async (squad: squadType): Promise<squadType> => {
  if (!squad || !isValidBtDbId(squad.id, 'sqd')) { 
    throw new Error("Invalid squad data");
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const squadJSON = JSON.stringify(squad);
    response = await axios.post(url, squadJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`postSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.squad) {
    throw new Error("Error posting squad");
  }
  const dbSquad = response.data.squad
  const postedSquad: squadType = {
    ...blankSquad,
    id: dbSquad.id,
    event_id: dbSquad.event_id,          
    squad_name: dbSquad.squad_name,
    tab_title: dbSquad.squad_name,                
    games: dbSquad.games,          
    lane_count: dbSquad.lane_count,        
    starting_lane: dbSquad.starting_lane,        
    squad_date_str: removeTimeFromISODateStr(dbSquad.squad_date),        
    squad_time: dbSquad.squad_time,     
    finalized: dbSquad.finalized,
    sort_order: dbSquad.sort_order,
  }
  return postedSquad
}

/**
 * post many squads
 * 
 * @param {squadType[]} squads - array of squads to post
 * @returns {number} - number of posted squads
 * @throws {Error} - if data is invalid or API call fails
 */
export const postManySquads = async (squads: squadType[]): Promise<number> => { 
  if (!squads || !Array.isArray(squads)) { 
    throw new Error("Invalid squads data");
  }
  if (squads.length === 0) return 0; // not an error, just no data to post
  const validSquads = validateSquads(squads);
  if (validSquads.errorCode !== ErrorCode.None
    || validSquads.squads.length !== squads.length)
  { 
    if (validSquads.squads.length === 0) {      
      throw new Error('Invalid squad data at index 0');
    }
    const errorIndex = squads.findIndex(squad => !isValidBtDbId(squad.id, "sqd"));
    if (errorIndex < 0) {
      throw new Error(`Invalid squad data at index ${validSquads.squads.length}`);
    } else {
      throw new Error(`Invalid squad data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const squadsJSON = JSON.stringify(squads);  
    response = await axios.post(manyUrl, squadsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManySquads failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting squads");
  }
  return response.data.count;
}

/**
 * puts a squad
 * 
 * @param {squadType} squad - squad to put
 * @returns {squadType} - putted squad
 * @throws {Error} - if data is invalid or API call fails
 */
export const putSquad = async (squad: squadType): Promise<squadType> => { 
  if (!squad || !isValidBtDbId(squad.id, 'sqd')) { 
    throw new Error("Invalid squad data");
  }
  let response;
  try { 
    // further sanatation and validation done in PUT route
    const squadJSON = JSON.stringify(squad);
    response = await axios.put(squadUrl + squad.id, squadJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.squad) {
    throw new Error("Error putting squad");
  }
  const dbSquad = response.data.squad
  const puttedSquad: squadType = {
    ...blankSquad,
    id: dbSquad.id,
    event_id: dbSquad.event_id,
    squad_name: dbSquad.squad_name,
    tab_title: dbSquad.squad_name,
    games: dbSquad.games,
    lane_count: dbSquad.lane_count,
    starting_lane: dbSquad.starting_lane,
    squad_date_str: removeTimeFromISODateStr(dbSquad.squad_date),
    squad_time: dbSquad.squad_time,
    finalized: dbSquad.finalized,
    sort_order: dbSquad.sort_order,
  }
  return puttedSquad;
}

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
  let response;
  try { 
    response = await axios.delete(squadUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting squad");
  }
  return response.data.count;
}

/**
 * deletes all squads for an event
 * 
 * @param {string} eventId - id of event to delete all event squads 
 * @returns {number} - # of squads deleted
 * @throws {Error} - if eventId is invalid or API call fails
 */
export const deleteAllSquadsForEvent = async (eventId: string): Promise<number> => {
  if (!isValidBtDbId(eventId, "evt")) { 
    throw new Error("Invalid event id");
  }
  let response;
  try { 
    response = await axios.delete(eventUrl + eventId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllSquadsForEvent failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting squads for event");
  }
  return response.data.count
}

/**
 * deletes all squads for a tmnt
 * 
 * @param tmntId - id of tmnt with squads to delete
 * @returns {number} - # of squads deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllSquadsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllSquadsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting squads for tmnt");
  }
  return response.data.count
}
