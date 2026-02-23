import axios from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../../test/testApi";
import type { divEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { blankDivEntry } from "../initVals";
import { validateDivEntries } from "@/lib/validation/divEntries/validate";
import { calcHandicap } from "@/app/api/divEntries/calcHdcp";

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi; 

const divEntryUrl = url + "/divEntry/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Extract div entries from GET API response
 * 
 * @param {any} divEntries - array of divEntries from GET API response
 * @returns {divEntryType[]} - array of divEntries with extracted data 
 */
export const extractDivEntries = (divEntries: any): divEntryType[] => {
  if (!divEntries || !Array.isArray(divEntries)) return [];      
  return divEntries.map((divEntry: any) => ({
    ...blankDivEntry,
    id: divEntry.id,
    squad_id: divEntry.squad_id,
    div_id: divEntry.div_id,
    player_id: divEntry.player_id,
    fee: divEntry.fee + '', 
    hdcp: calcHandicap(divEntry.player.average, divEntry.div.hdcp_from, divEntry.div.hdcp_per, divEntry.div.int_hdcp),
    // hdcp: divEntry.hdcp,
  }));
}

/**
 * Get all div entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get div entries for
 * @returns {divEntryType[]} - array of div entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllDivEntriesForTmnt = async (tmntId: string): Promise<divEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllDivEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching divEntries`)
  }  
  return extractDivEntries(response.data.divEntries);
}

/**
 * Get all div entries for a div
 * 
 * @param {string} divId - id of div to get div entries for
 * @returns {divEntryType[]} - array of div entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllDivEntriesForDiv = async (divId: string): Promise<divEntryType[]> => {
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error('Invalid div id');
  }
  let response;
  try { 
    response = await axios.get(divUrl + divId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllDivEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching divEntries`)
  }        
  return extractDivEntries(response.data.divEntries);
}

/**
 * Get all div entries for a squad
 * 
 * @param {string} squadId - id of squad to get div entries for
 * @returns {divEntryType[]} - array of div entries
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllDivEntriesForSquad = async (squadId: string): Promise<divEntryType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try {
    response = await axios.get(squadUrl + squadId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllDivEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching divEntries`)
  };    
  return extractDivEntries(response.data.divEntries);
}

/**
 * posts a div entry
 * 
 * @param {divEntryType} divEntry - divEntry to post
 * @returns {divEntryType} - divEntry that was posted 
 * @throws {Error} - if divEntry is invalid or API call fails
 */
export const postDivEntry = async (divEntry: divEntryType): Promise<divEntryType> => {
  if (!divEntry || !isValidBtDbId(divEntry.id, "den")) { 
    throw new Error("Invalid divEntry data");
  }
  let response;
  try {    
    // further sanatation and validation done in POST route
    const divEntryJSON = JSON.stringify(divEntry);
    response = await axios.post(url, divEntryJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`postDivEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.divEntry) { 
    throw new Error("Error posting divEntry");
  }
  const dbDivEntry = response.data.divEntry;
  const postedDivEntry: divEntryType = {
    ...blankDivEntry,
    id: dbDivEntry.id,
    squad_id: dbDivEntry.squad_id,
    div_id: dbDivEntry.div_id,
    player_id: dbDivEntry.player_id,
    fee: dbDivEntry.fee,   
    hdcp: divEntry.hdcp,
  };
  return postedDivEntry;
}

/**
 * posts many div entries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries to post
 * @returns {number} - number of divEntries posted 
 * @throws {Error} - if divEntries are invalid or API call fails
 */
export const postManyDivEntries = async (divEntries: divEntryType[]): Promise<number> => {
  if (!divEntries || !Array.isArray(divEntries)) { 
    throw new Error("Invalid divEntries data");
  };
  if (divEntries.length === 0) return 0; // not an error, no divEntries to post  
  // further sanatation and validation done in POST route
  const validDivEntries = validateDivEntries(divEntries);
  if (validDivEntries.errorCode !== ErrorCode.NONE
    || validDivEntries.divEntries.length !== divEntries.length)
  {
    if (validDivEntries.divEntries.length === 0) {      
      throw new Error('Invalid divEntry data at index 0');
    }
    const errorIndex = divEntries.findIndex(divEntry => !isValidBtDbId(divEntry.id, "den"));
    if (errorIndex < 0) {
      throw new Error(`Invalid divEntry data at index ${validDivEntries.divEntries.length}`);
    } else {
      throw new Error(`Invalid divEntry data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const divEntryJSON = JSON.stringify(divEntries);
    response = await axios.post(manyUrl, divEntryJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`postManyDivEntries failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") { 
    throw new Error("Error posting divEntries");
  }
  return response.data.count;
}

/**
 * updates a div entry
 * 
 * @param {divEntryType} divEntry - divEntry to update
 * @returns {divEntryType | null} - divEntry that was updated
 * @throws {Error} - if divEntry is invalid or API call fails
 */
export const putDivEntry = async (divEntry: divEntryType): Promise<divEntryType | null> => {
  if (!divEntry || !isValidBtDbId(divEntry.id, "den")) { 
    throw new Error("Invalid divEntry data");
  }
  let response;
  try {
    // further sanatation and validation done in PUT route
    const divEntryJSON = JSON.stringify(divEntry);
    response = await axios.put(divEntryUrl + divEntry.id, divEntryJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putDivEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.divEntry) { 
    throw new Error("Error putting divEntry");
  }
  const dbDivEntry = response.data.divEntry;
  const puttedDivEntry: divEntryType = {
    ...blankDivEntry,
    id: dbDivEntry.id,
    squad_id: dbDivEntry.squad_id,
    div_id: dbDivEntry.div_id,
    player_id: dbDivEntry.player_id,
    fee: dbDivEntry.fee,      
    hdcp: divEntry.hdcp,
  };
  return puttedDivEntry;
}

/**
 * deletes a div entry
 * 
 * @param {string} id - id of div entry to delete 
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteDivEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "den")) { 
    throw new Error("Invalid divEntry id");
  }
  let response;
  try {
    response = await axios.delete(divEntryUrl + id, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteDivEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting divEntry");
  }
  return response.data.count;
}

/**
 * deletes all div entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of div entries deleted
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllDivEntriesForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.delete(squadUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllDivEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting divEntries for squad");
  }
  return response.data.count;
}

/**
 * deletes all div entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of div entries deleted
 * @throws {Error} - if divId is invalid or API call fails
 */
export const deleteAllDivEntriesForDiv = async (divId: string): Promise<number> => {  
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.delete(divUrl + divId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllDivEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting divEntries for div");
  }
  return response.data.count;
}

/**
 * deletes all div entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of div entries deleted, -1 on failure
 */
export const deleteAllDivEntriesForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllDivEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting divEntries for tmnt");
  }
  return response.data.count;
}
