import axios from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../../test/testApi";
import { elimType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankElim } from "../initVals";
import { validateElims } from "@/app/api/elims/validate";

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;   
const divUrl = url + "/div/";
const elimUrl = url + "/elim/";
const manyUrl = url + "/many";   
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extract elim data from GET API response
 * 
 * @param {any} elims - array of elims from GET API response
 * @returns {elimType[]} - array of elims with extracted data 
 */
export const extractElims = (elims: any): elimType[] => {
  if (!elims || !Array.isArray(elims)) return [];
  return elims.map((elim: any) => ({
    ...blankElim,
    id: elim.id,
    div_id: elim.div_id,
    squad_id: elim.squad_id,                            
    start: elim.start,          
    games: elim.games,          
    fee: elim.fee,          
    sort_order: elim.sort_order,              
  }));
}

/**
 * get all elims for a squad
 * 
 * @param {string} squadId - id of squad to get all elims for
 * @returns {elimType[]} - array of elims
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllElimsForSquad = async (squadId: string): Promise<elimType[]> => {
  if (!isValidBtDbId(squadId, 'sqd')) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllElimsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching elims`)
  }  
  return extractElims(response.data.elims)
}

/**
 * get all elims for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get all elims for
 * @returns {elimType[]} - array of elims
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllElimsForTmnt = async (tmntId: string): Promise<elimType[]> => {
  if (!isValidBtDbId(tmntId, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.get(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllElimsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching elims`)
  }  
  return extractElims(response.data.elims)
}

/**
 * post a new elim
 * 
 * @param {elimType} elim - elim to post
 * @returns {elimType} - posted elim 
 * @throws {Error} - if elim is invalid or API call fails
 */
export const postElim = async (elim: elimType): Promise<elimType> => {
  if (!elim || !isValidBtDbId(elim.id, 'elm')) { 
    throw new Error('Invalid elim data');
  }
  let response;    
  try {     
    const elimJSON = JSON.stringify(elim);
    response = await axios.post(url, elimJSON, {
      withCredentials: true,
    });    
  } catch (err) {
    throw new Error(`postElim failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.elim) {       
    throw new Error("Error posting elim");
  }

  const dbElim = response.data.elim
  const postedElim: elimType = {
    ...blankElim,
    id: dbElim.id,
    div_id: dbElim.div_id,
    squad_id: dbElim.squad_id,                            
    start: dbElim.start,          
    games: dbElim.games,          
    fee: dbElim.fee,          
    sort_order: dbElim.sort_order,
  }
  return postedElim
}

/**
 * post many elims
 * 
 * @param {elimType[]} elims - array of elims to post
 * @returns {number} - number of posted elims 
 * @throws {Error} - if elims are invalid or API call fails
 */
export const postManyElims = async (elims: elimType[]): Promise<number> => { 
  if (!elims || !Array.isArray(elims)) { 
    throw new Error('Invalid elims data');
  }
  if (elims.length === 0) return 0 // not an error, just no data to post
  const validElims = validateElims(elims);
  if (validElims.errorCode !== ErrorCode.None
    || validElims.elims.length !== elims.length)
  { 
    if (validElims.elims.length === 0) {      
      throw new Error('Invalid elim data at index 0');
    }
    const errorIndex = elims.findIndex(elim => !isValidBtDbId(elim.id, "elm"));
    if (errorIndex < 0) {
      throw new Error(`Invalid elim data at index ${validElims.elims.length}`);
    } else {
      throw new Error(`Invalid elim data at index ${errorIndex}`);
    }
  }
  let response;
  try { 
    const elimJSON = JSON.stringify(validElims.elims);
    response = await axios.post(manyUrl, elimJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`postManyElims failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting elims");
  }
  return response.data.count;
}

/**
 * update an elim
 * 
 * @param {elimType} elim - elim to update
 * @returns {elimType} - updated elim
 */
export const putElim = async (elim: elimType): Promise<elimType> => { 
  if (!elim || !isValidBtDbId(elim.id, 'elm')) { 
    throw new Error('Invalid elim data');
  }
  let response;
  try { 
    const elimJSON = JSON.stringify(elim);
    response = await axios.put(elimUrl + elim.id, elimJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`putElim failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data.elim) {
    throw new Error("Error putting elim");    
  }
  const dbElim = response.data.elim;
  const puttedElim: elimType = {
    ...blankElim,
    id: dbElim.id,
    div_id: dbElim.div_id,
    squad_id: dbElim.squad_id,                            
    start: dbElim.start,          
    games: dbElim.games,          
    fee: dbElim.fee,          
    sort_order: dbElim.sort_order,
  }
  return puttedElim;
}

/**
 * delete an elim
 * 
 * @param {string} id - id of elim to delete
 * @returns {number} - 1 if success
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteElim = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, 'elm')) { 
    throw new Error('Invalid elim id');
  }
  let response;
  try { 
    response = await axios.delete(elimUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteElim failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error('Error deleting elim');
  }
  return 1
}

/**
 * delete all elims for a squad
 * 
 * @param squadId - id of squad to delete all elims from
 * @returns - # of elims deleted
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllElimsForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, 'sqd')) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllElimsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting elims for squad");
  }
  return response.data.deleted.count
}

/**
 * delete all elims for a div
 * 
 * @param divId - id of div to delete all elims from
 * @returns - # of elims deleted
 * @throws {Error} - if divId is invalid or API call fails
 */
export const deleteAllElimsForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, 'div')) { 
    throw new Error('Invalid div id');
  }
  let response;
  try { 
    response = await axios.delete(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllElimsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting elims for div");
  }
  return response.data.deleted.count
}

/**
 * delete all elims for a tmnt
 * 
 * @param tmntId - id of tmnt to delete all elims from
 * @returns - # of elims deleted
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const deleteAllElimsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, 'tmt')) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllElimsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting elims for tmnt");
  }
  return response.data.deleted.count
}