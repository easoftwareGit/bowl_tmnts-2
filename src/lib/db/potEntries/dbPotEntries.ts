import axios from "axios";
import { basePotEntriesApi } from "@/lib/db/apiPaths";
import { testBasePotEntriesApi } from "../../../../test/testApi";
import { potEntryType, putManyReturnType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankPotEntry, noUpdates } from "../initVals";
import { validatePotEntries } from "@/app/api/potEntries/validate";

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi; 

const divUrl = url + "/div/";
const manyUrl = url + "/many";
const potEntryUrl = url + "/potEntry/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * Extracts potEntries from GET API response
 * 
 * @param {any} potEntries - array of potEntries from GET API response
 * @returns {potEntryType[]} - array of potEntries with extracted data 
 */
export const extractPotEntries = (potEntries: any): potEntryType[] => {
  if (!potEntries || !Array.isArray(potEntries)) return [];
  return potEntries.map((potEntry: any) => ({
    ...blankPotEntry,
    id: potEntry.id,        
    pot_id: potEntry.pot_id,
    player_id: potEntry.player_id,
    fee: potEntry.fee + '',
  }));
}

/**
 * Get all pot entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get pot entries for
 * @returns {potEntryType} - array of pot entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllPotEntriesForTmnt = async (tmntId: string): Promise<potEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllPotEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching potEntries`)
  }
  return extractPotEntries(response.data.potEntries);
}

/**
 * Get all pot entries for a div
 * 
 * @param {string} divId - id of div to get pot entries for
 * @returns {potEntryType[]} - array of pot entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllPotEntriesForDiv = async (divId: string): Promise<potEntryType[]> => {
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.get(divUrl + divId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllPotEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching potEntries`)
  }
  return extractPotEntries(response.data.potEntries);
}

/**
 * Get all pot entries for a squad
 * 
 * @param {string} squadId - id of squad to get pot entries for
 * @returns {potEntryType[]} - array of pot entries
 */
export const getAllPotEntriesForSquad = async (squadId: string): Promise<potEntryType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(squadUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllPotEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching potEntries`)
  }
  return extractPotEntries(response.data.potEntries);
}

/**
 * posts a pot entry
 * 
 * @param {potEntryType} potEntry - potEntry to post
 * @returns {potEntryType} - potEntry that was posted
 * @throws {Error} - if potEntry is invalid or API call fails
 */
export const postPotEntry = async (potEntry: potEntryType): Promise<potEntryType> => {
  if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) { 
    throw new Error("Invalid potEntry data");
  }
  let response;
  try {
    // further sanatation and validation done in POST route
    const potEntryJSON = JSON.stringify(potEntry);
    response = await axios.post(url, potEntryJSON, { withCredentials: true });    
  } catch (err) {
    throw new Error(`postPotEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.potEntry) {
    throw new Error('Error posting potEntry');
  }
  return response.data.potEntry;
}

/**
 * posts many pot entries
 * 
 * @param {potEntryType[]} potEntries - array of potEntries to post
 * @returns {number} - number of potEntries that were posted
 * @throws {Error} - if potEntries are invalid or API call fails
 */
export const postManyPotEntries = async (potEntries: potEntryType[]): Promise<number> => {
  if (!potEntries || !Array.isArray(potEntries)) { 
    throw new Error("Invalid potEntries data");
  }
  if (potEntries.length === 0) return 0; // not an error, just no potEntries to post
  const validPotEntries = validatePotEntries(potEntries);
  if (validPotEntries.errorCode !== ErrorCode.None
    || validPotEntries.potEntries.length !== potEntries.length)
  { 
    if (validPotEntries.potEntries.length === 0) {      
      throw new Error('Invalid potEntry data at index 0');
    }
    const errorIndex = potEntries.findIndex(potEntry => !isValidBtDbId(potEntry.id, "pen"));
    if (errorIndex < 0) {
      throw new Error(`Invalid potEntry data at index ${validPotEntries.potEntries.length}`);
    } else {
      throw new Error(`Invalid potEntry data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const potEntriesJSON = JSON.stringify(potEntries);  
    response = await axios.post(manyUrl, potEntriesJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyPotEntries failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting potEntries");
  }
  return response.data.count;
}

/**
 * puts a div entry
 * 
 * @param {potEntryType} potEntry - potEntry to update
 * @returns {potEntryType} - potEntry that was updated
 * @throws {Error} - if potEntry is invalid or API call fails
 */
export const putPotEntry = async (potEntry: potEntryType): Promise<potEntryType> => {
  if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) { 
    throw new Error("Invalid potEntry data");
  }
  let response;
  try {
    // further sanatation and validation done in PUT route
    const potEntryJSON = JSON.stringify(potEntry);
    response = await axios.put(potEntryUrl + potEntry.id, potEntryJSON, {
      withCredentials: true
    });    
  } catch (err) {
    throw new Error(`putPotEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.potEntry) {
    throw new Error("Error putting potEntry");
  }
  const dbPotEntry = response.data.potEntry;
  const puttedPotEntry: potEntryType = {
    ...blankPotEntry,
    id: dbPotEntry.id,      
    pot_id: dbPotEntry.pot_id,
    player_id: dbPotEntry.player_id,
    fee: dbPotEntry.fee,
  };
  return puttedPotEntry;
}

/**
 * deletes a pot entry
 * 
 * @param {string} id - id of pot entry to delete 
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deletePotEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "pen")) { 
    throw new Error("Invalid potEntry id");
  }
  let response;
  try {
    response = await axios.delete(potEntryUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deletePotEntry failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting potEntry");
  }
  return response.data.count;
}

/**
 * deletes all pot entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of pot entries deleted
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllPotEntriesForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotEntriesForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting potEntries for squad");
  }
  return response.data.count;
}

/**
 * deletes all pot entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of pot entries deleted
 * @throws {Error} - if divId is invalid or API call fails
 */
export const deleteAllPotEntriesForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try { 
    response = await axios.delete(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotEntriesForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting potEntries for div");
  }
  return response.data.count;
}

/**
 * deletes all pot entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of pot entries deleted
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const deleteAllPotEntriesForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllPotEntriesForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting potEntries for tmnt");
  }
  return response.data.count;
}