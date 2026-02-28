import axios from "axios";
import { baseOneBrktsApi } from "@/lib/api/apiPaths";
import { testBaseOneBrktsApi } from "../../../../test/testApi";
import type { oneBrktType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { validateOneBrkts } from "@/lib/validation/oneBrkts/valildate";
import { blankOneBrkt } from "../initVals";

const url = testBaseOneBrktsApi.startsWith("undefined")
  ? baseOneBrktsApi
  : testBaseOneBrktsApi; 

const oneOneBrktUrl = url + "/oneBrkt/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";   
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * Extract oneBrkts from GET API response
 * 
 * @param {any} oneBrkts - array of oneBrkts from GET API response
 * @returns {oneBrktType[]} - array of oneBrkts
 */
export const extractOneBrkts = (oneBrkts: any): oneBrktType[] => {
  if (!oneBrkts || !Array.isArray(oneBrkts)) return [];
  return oneBrkts.map((oneBrkt: any) => ({
    ...blankOneBrkt,
    id: oneBrkt.id,
    brkt_id: oneBrkt.brkt_id,
    bindex: oneBrkt.bindex
  }));
}

/**
 * Get all oneBrkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for tmnt 
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllOneBrktsForTmnt = async (tmntId: string): Promise<oneBrktType[]> => { 
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts`)
  }    
  return extractOneBrkts(response.data.oneBrkts);
}

/**
 * Get all oneBrkts for a squad
 * 
 * @param {squadId} squadId - id of squad to get oneBrkts for
 * @returns - array of oneBrkts for squad 
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllOneBrktsForSquad = async (squadId: string): Promise<oneBrktType[]> => { 
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(squadUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts`)
  }    
  return extractOneBrkts(response.data.oneBrkts);
}

/**
 * Get all oneBrkts for a div
 * 
 * @param {string} divId - id of div to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for div
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllOneBrktsForDiv = async (divId: string): Promise<oneBrktType[]> => { 
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.get(divUrl + divId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts`)
  }    
  return extractOneBrkts(response.data.oneBrkts);
}

/**
 * Get all oneBrkts for a brkt
 * 
 * @param {string} brktId - id of brkt to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for brkt
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const getAllOneBrktsForBrkt = async (brktId: string): Promise<oneBrktType[]> => { 
  if (!isValidBtDbId(brktId, "brk")) { 
    throw new Error("Invalid brkt id");
  }
  let response;
  try {
    response = await axios.get(brktUrl + brktId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsForBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts`)
  }    
  return extractOneBrkts(response.data.oneBrkts);
}

/**
 * Get one oneBrkt
 * 
 * @param {string} oneBrktId - id of oneBrkt to get
 * @returns {oneBrktType} - oneBrkt or null
 * @throws {Error} - if oneBrktId is invalid or API call fails
 */
export const getOneBrkt = async (oneBrktId: string): Promise<oneBrktType> => { 
  if (!isValidBtDbId(oneBrktId, "obk")) { 
    throw new Error("Invalid oneBrkt id");
  }
  let response;
  try {
    response = await axios.get(oneOneBrktUrl + oneBrktId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getOneBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkt`)
  }    
  const dbOneBrkt = response.data.oneBrkt;
  const oneBrkt: oneBrktType = {
    ...blankOneBrkt,
    id: dbOneBrkt.id,
    brkt_id: dbOneBrkt.brkt_id,
    bindex: dbOneBrkt.bindex,
  }
  return oneBrkt;
}

/**
 * posts one oneBrkt
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to post
 * @returns {oneBrktType} - oneBrkt that was posted
 * @throws {Error} - if oneBrkt is invalid or API call fails
 */
export const postOneBrkt = async (oneBrkt: oneBrktType): Promise<oneBrktType> => {
  if (!oneBrkt || !isValidBtDbId(oneBrkt.id, "obk")) { 
    throw new Error("Invalid oneBrkt data");
  }
  let response;
  try {
    const oneBrktJSON = JSON.stringify(oneBrkt);
    response = await axios.post(url, oneBrktJSON, { withCredentials: true });    
  } catch (err) {
    throw new Error(`postOneBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.oneBrkt) {
    throw new Error("Error posting oneBrkt");
  }
  return response.data.oneBrkt;
}

/**
 * posts many oneBrkts
 * 
 * @param {oneBrktType[]} oneBrkts - array of oneBrkts to post
 * @returns {number} - number of oneBrkts posted, -1 if error
 */
export const postManyOneBrkts = async (oneBrkts: oneBrktType[]): Promise<number> => {
  if (!oneBrkts || !Array.isArray(oneBrkts)) { 
    throw new Error("Invalid oneBrkts data");
  }
  if (oneBrkts.length === 0) return 0; // not an error, just no data to post
  const validOneBrkts = validateOneBrkts(oneBrkts);
  if (validOneBrkts.errorCode !== ErrorCode.NONE
    || validOneBrkts.oneBrkts.length !== oneBrkts.length)
  { 
    if (validOneBrkts.oneBrkts.length === 0) {      
      throw new Error('Invalid oneBrkt data at index 0');
    }
    const errorIndex = oneBrkts.findIndex(oneBrkt => !isValidBtDbId(oneBrkt.id, "obk"));
    if (errorIndex < 0) {
      throw new Error(`Invalid oneBrkt data at index ${validOneBrkts.oneBrkts.length}`);
    } else {
      throw new Error(`Invalid oneBrkt data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const oneBrktsJSON = JSON.stringify(oneBrkts);  
    response = await axios.post(manyUrl, oneBrktsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyOneBrkts failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting oneBrkts");
  }
  return response.data.count;
  

  // try {
  //   if (!oneBrkts || !Array.isArray(oneBrkts)) return -1
  //   if (oneBrkts.length === 0) return 0;
  //   // further sanatation and validation done in POST route
  //   const oneBrktsJSON = JSON.stringify(oneBrkts);
  //   const response = await axios({
  //     method: "post",
  //     data: oneBrktsJSON,
  //     withCredentials: true,
  //     url: manyUrl,
  //   });
  //   if (response.status !== 201) return -1;
  //   return response.data.count;
  // } catch (err) {
  //   return -1;
  // }
}

/**
 * deletes oneBrkt
 * 
 * @param {string} id - id of oneBrkt to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteOneBrkt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "obk")) { 
    throw new Error("Invalid oneBrkt id");
  }
  let response;
  try {
    response = await axios.delete(oneOneBrktUrl + id, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteOneBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting oneBrkt");
  }    
  return response.data.count
}

/**
 * deletes all oneBrkts for a brkt
 * 
 * @param {string} brktId - id of brkt with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllOneBrktsForBrkt = async (brktId: string): Promise<number> => {
  if (!isValidBtDbId(brktId, "brk")) { 
    throw new Error("Invalid brkt id"); 
  }
  let response;
  try {
    response = await axios.delete(brktUrl + brktId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllOneBrktsForBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting oneBrkts for brkt");
  }
  return response.data.count
}

/**
 * deletes all oneBrkts for a div
 * 
 * @param {string} divId - id of div with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllOneBrktsForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.delete(divUrl + divId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllOneBrktsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting oneBrkts for div");
  }
  return response.data.count
}

/**
 * deletes all oneBrkts for a squad
 * 
 * @param {string} squadId - id of squad with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllOneBrktsForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.delete(squadUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllOneBrktsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting oneBrkts for squad");
  }
  return response.data.count;
}

/**
 * deletes all oneBrkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted
 */
export const deleteAllOneBrktsForTmnt = async (tmntId: string): Promise<number> => {  
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllOneBrktsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting oneBrkts for tmnt");
  }
  return response.data.count;
}
