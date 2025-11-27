import axios from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../../test/testApi";
import { potType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankPot } from "../initVals";
import { validatePots } from "@/app/api/pots/validate";

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;  
const divUrl = url + "/div/";
const manyUrl = url + "/many";   
const potUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extracts pots data from GET API response
 * 
 * @param {any} pots - array of pots from GET API response
 * @returns {potType[]} - array of pots with extracted data
 */
export const extractPots = (pots: any): potType[] => {
  if (!pots || !Array.isArray(pots)) return [];
  return pots.map((pot: any) => ({
    ...blankPot,
    id: pot.id,
    div_id: pot.div_id,
    squad_id: pot.squad_id,
    pot_type: pot.pot_type,                
    fee: pot.fee,        
    sort_order: pot.sort_order,
  }));
}


/**
 * gets all pots for a squad
 * 
 * @param {string} squadId - id of squad to get all pots for
 * @returns {potType[]} - pot array
 * @throws {Error} - if squad id is invalid or API call fails
 */
export const getAllPotsForSquad = async (squadId: string): Promise<potType[]> => {
  if (!isValidBtDbId(squadId, 'sqd')) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllPotsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching pots`)
  }
  return extractPots(response.data.pots);
}

/**
 * gets all pots for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get all pots for
 * @returns {potType[]} - pot array or null
 * @throws {Error} - if tmnt id is invalid or API call fails
 */
export const getAllPotsForTmnt = async (tmntId: string): Promise<potType[]> => {
  if (!isValidBtDbId(tmntId, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.get(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllPotsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching pots`)
  }
  return extractPots(response.data.pots);
}

/**
 * post a new pot
 * 
 * @param {potType} pot - pot to post
 * @returns {potType | null} - pot object
 * @throws {Error} - if pot is invalid or API call fails
 */
export const postPot = async (pot: potType): Promise<potType> => {  
  if (!pot || !isValidBtDbId(pot.id, "pot")) {
    throw new Error("Invalid pot data");
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const potJSON = JSON.stringify(pot);
    response = await axios.post(url, potJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`postPot failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.pot) {
    throw new Error("Error posting pot");
  }
  const dbPot = response.data.pot
  const potsedPot: potType = {
    ...blankPot,
    id: dbPot.id,
    div_id: dbPot.div_id,
    squad_id: dbPot.squad_id,
    pot_type: dbPot.pot_type,                
    fee: dbPot.fee,        
    sort_order: dbPot.sort_order,
  }
  return potsedPot
}

/**
 * post many pots
 * 
 * @param {potType[]} pots - array of pot objects
 * @returns {number} - number of pot objects posted 
 * @throws {Error} - if pots are invalid or API call fails
 */
export const postManyPots = async (pots: potType[]): Promise<number> => {
  if (!pots || !Array.isArray(pots)) { 
    throw new Error("Invalid pots data");
  }
  if (pots.length === 0) return 0; // not an error, just no data to post
  const validPots = validatePots(pots);
  if (validPots.errorCode !== ErrorCode.None
    || validPots.pots.length !== pots.length)
  { 
    if (validPots.pots.length === 0) {      
      throw new Error('Invalid pot data at index 0');
    }
    const errorIndex = pots.findIndex(pot => !isValidBtDbId(pot.id, "pot"));
    if (errorIndex < 0) {
      throw new Error(`Invalid pot data at index ${validPots.pots.length}`);
    } else {
      throw new Error(`Invalid pot data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const potsJSON = JSON.stringify(pots);  
    response = await axios.post(manyUrl, potsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyPots failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting pots");
  }
  return response.data.count;
}

/**
 * puts a pot
 * 
 * @param {potType} pot - pot to update
 * @returns {potType} - pot object
 * @throws {Error} - if pot is invalid or API call fails
 */
export const putPot = async (pot: potType): Promise<potType> => { 
  if (!pot || !isValidBtDbId(pot.id, 'pot')) { 
    throw new Error('Invalid pot data');
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const potJSON = JSON.stringify(pot);
    response = await axios.put(potUrl + pot.id, potJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`putPot failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.pot) {
    throw new Error("Error putting pot");
  }
  const dbPot = response.data.pot
  const puttedPot: potType = {
    ...blankPot,
    id: dbPot.id,
    div_id: dbPot.div_id,
    squad_id: dbPot.squad_id,
    pot_type: dbPot.pot_type,                
    fee: dbPot.fee,        
    sort_order: dbPot.sort_order,
  }
  return puttedPot
}

/**
 * deletes a pot
 * 
 * @param {string} id - the id of the pot to delete
 * @returns {number} - 1 if successful
 * @throws {Error} - if id is invalid or API call fails
 */
export const deletePot = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, 'pot')) { 
    throw new Error('Invalid pot id');
  }
  let response;
  try { 
    response = await axios.delete(potUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deletePot failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting pot");
  }
  return response.data.count;
}

/**
 * deletes all pots for a squad
 * 
 * @param {string} squadId - id of squad to delete all pots from
 * @returns {number} - # of pots deleted
 * @throws {Error} - if squad id is invalid or API call fails
 */
export const deleteAllPotsForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, 'sqd')) {
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting pots for squad");
  }
  return response.data.count
}

/**
 * 
 * @param {string} divId - id of div to delete all pots from
 * @returns {number} - # of pots deleted
 * @throws {Error} - if div id is invalid or API call fails
 */
export const deleteAllPotsForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, 'div')) { 
    throw new Error('Invalid div id');
  }
  let response;
  try { 
    response = await axios.delete(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting pots for div");
  }
  return response.data.count
}

/**
 * deletes all pots for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all pots from
 * @returns {number} - # of pots deleted
 * @throws {Error} - if tmnt id is invalid or API call fails
 */
export const deleteAllPotsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting pots for tmnt");
  }
  return response.data.count
}