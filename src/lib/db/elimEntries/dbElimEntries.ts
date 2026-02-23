import axios from "axios";
import { baseElimEntriesApi } from "@/lib/db/apiPaths";
import { testBaseElimEntriesApi } from "../../../../test/testApi";
import type { elimEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { blankElimEntry, noUpdates } from "../initVals";
import { validateElimEntries } from "@/lib/validation/elimEntries/validate";

const url = testBaseElimEntriesApi.startsWith("undefined")
  ? baseElimEntriesApi
  : testBaseElimEntriesApi; 

const elimEntryUrl = url + "/elimEntry/";
const elimUrl = url + "/elim/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";   
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

export const extractElimEntries = (elimEntries: any): elimEntryType[] => {
  if (!elimEntries || !Array.isArray(elimEntries)) return [];
  return elimEntries.map((elimEntry: any) => ({
    ...blankElimEntry,
    id: elimEntry.id,        
    elim_id: elimEntry.elim_id,
    player_id: elimEntry.player_id,        
    fee: elimEntry.fee + "",
  }));
}

/**
 * Get all elim entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllElimEntriesForTmnt = async (tmntId: string): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllElimEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching elimEntries`)
  }    
  return extractElimEntries(response.data.elimEntries);
}

/**
 * Get all elim entries for a div
 * 
 * @param {string} divId - id of div to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllElimEntriesForDiv = async (divId: string): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error('Invalid div id');
  }
  let response;
  try { 
    response = await axios.get(divUrl + divId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllElimEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching elimEntries`)
  }
  return extractElimEntries(response.data.elimEntries);
}

/**
 * Get all elim entries for a elim
 * 
 * @param {string} elimId - id of elim to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if elimId is invalid or API call fails
 */
export const getAllElimEntriesForElim = async (elimId: string): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(elimId, "elm")) {
    throw new Error('Invalid elim id');
  }
  let response;
  try { 
    response = await axios.get(elimUrl + elimId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllElimEntriesForElim failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching elimEntries`)
  }
  return extractElimEntries(response.data.elimEntries);
}

/**
 * Get all elim entries for a squad
 * 
 * @param {string} squadId - id of squad to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllElimEntriesForSquad = async (squadId: string): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllElimEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching elimEntries`)
  }        
  return response.data.elimEntries.map((elimEntry: elimEntryType) => ({
    ...blankElimEntry,
    id: elimEntry.id,        
    elim_id: elimEntry.elim_id,
    player_id: elimEntry.player_id,        
    fee: elimEntry.fee,
  }));
}

/**
 * posts a elim entry
 * 
 * @param {elimEntryType} elimEntry - elimEntry to post
 * @returns {elimEntryType} - elimEntry that was posted
 * @throws {Error} - if elimEntry is invalid or API call fails
 */
export const postElimEntry = async (elimEntry: elimEntryType): Promise<elimEntryType> => {
  if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) { 
    throw new Error('Invalid elimEntry data');
  }
  let response;
  try {
    const elemEntryJSON = JSON.stringify(elimEntry);
    response = await axios.post(url, elemEntryJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`postElimEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data.elimEntry) {
    throw new Error("Error posting elimEntry");
  }
  const dbElimEntry = response.data.elimEntry;
  const postedElimEntry: elimEntryType = {
    ...blankElimEntry,
    id: dbElimEntry.id,      
    elim_id: dbElimEntry.elim_id,
    player_id: dbElimEntry.player_id,      
    fee: dbElimEntry.fee,
  };
  return postedElimEntry;
}

/**
 * posts many elim entries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries to post
 * @returns {number} - number of elimEntries that were posted
 * @throws {Error} - if elimEntries is invalid or API call fails
 */
export const postManyElimEntries = async (elimEntries: elimEntryType[]): Promise<number> => {
  if (!elimEntries || !Array.isArray(elimEntries)) { 
    throw new Error('Invalid elimEntries data');
  }
  if (elimEntries.length === 0) return 0; // not an error, just no data to post
  const validElimEntries = validateElimEntries(elimEntries);
  if (validElimEntries.errorCode !== ErrorCode.NONE
    || validElimEntries.elimEntries.length !== elimEntries.length)
  { 
    if (validElimEntries.elimEntries.length === 0) {      
      throw new Error('Invalid elimEntry data at index 0');
    }
    const errorIndex = elimEntries.findIndex(elimEntry => !isValidBtDbId(elimEntry.id, "een"));
    if (errorIndex < 0) {
      throw new Error(`Invalid elimEntry data at index ${validElimEntries.elimEntries.length}`);
    } else {
      throw new Error(`Invalid elimEntry data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const elimEntriesJSON = JSON.stringify(elimEntries);  
    response = await axios.post(manyUrl, elimEntriesJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyElimEntries failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting elimEntries");
  }
  return response.data.count;
}

/**
 * updates a elim entry
 * 
 * @param {elimEntryType} elimEntry - elimEntry to update
 * @returns {elimEntryType | null} - elimEntry that was updated
 * @throws {Error} - if elimEntry is invalid or API call fails
 */
export const putElimEntry = async (elimEntry: elimEntryType): Promise<elimEntryType | null> => {
  if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) { 
    throw new Error('Invalid elimEntry data');
  }
  let response;
  try { 
    // further sanatation and validation done in PUT route
    const elimEntryJSON = JSON.stringify(elimEntry);
    response = await axios.put(elimEntryUrl + elimEntry.id, elimEntryJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putElimEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data.elimEntry) {
    throw new Error("Error putting elimEntry")
  }        
  const dbElimEntry = response.data.elimEntry;
  const puttedElimEntry: elimEntryType = {
    ...blankElimEntry,
    id: dbElimEntry.id,      
    elim_id: dbElimEntry.elim_id,
    player_id: dbElimEntry.player_id,      
    fee: dbElimEntry.fee,
  };
  return puttedElimEntry;
}

/**
 * deletes a elim entry
 * 
 * @param {string} id - id of elim entry to delete 
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteElimEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "een")) { 
    throw new Error('Invalid elimEntry id');
  }
  let response;
  try {
    response = await axios.delete(elimEntryUrl + id, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`deleteElimEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntry");
  };
  return response.data.count;
}

/**
 * deletes all elim entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of elim entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllElimEntriesForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error('Invalid squad id');
  } 
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllElimEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntries for squad");
  }
  return response.data.count;
}

/**
 * deletes all elim entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of elim entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllElimEntriesForDiv = async (divId: string): Promise<number> => {  
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error('Invalid div id');
  }
  let response;
  try {
    response = await axios.delete(divUrl + divId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllElimEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntries for div");
  }
  return response.data.count;
}

/**
 * deletes all elim entries for a elim
 * 
 * @param {string} elimId - id of elim to delete
 * @returns {number} - number of elim entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllElimEntriesForElim = async (elimId: string): Promise<number> => {  
  if (!isValidBtDbId(elimId, "elm")) {
    throw new Error('Invalid elim id');
  }
  let response;
  try {
    response = await axios.delete(elimUrl + elimId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllElimEntriesForElim failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntries for elim");
  }
  return response.data.count;
}

/**
 * deletes all elim entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of elim entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllElimEntriesForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllElimEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntries for tmnt");
  }
  return response.data.count;
}

export const exportedForTesting = {
  extractElimEntries,
}