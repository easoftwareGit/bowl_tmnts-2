import axios from "axios";
import { baseOneBrktsApi } from "@/lib/db/apiPaths";
import { testBaseOneBrktsApi } from "../../../../test/testApi";
import { oneBrktType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
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
 * Get all oneBrkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get oneBrkts for
 * @returns {oneBrktType[] | null} - array of oneBrkts for tmnt 
 */
export const getAllOneBrktsForTmnt = async (tmntId: string): Promise<oneBrktType[] | null> => { 
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: tmntUrl + tmntId,
    });
    if (response.status !== 200) return null;    
    return response.data.oneBrkts;
  } catch (err) {
    return null;
  }
}

/**
 * Get all oneBrkts for a squad
 * 
 * @param {squadId} squadId - id of squad to get oneBrkts for
 * @returns - array of oneBrkts for squad 
 */
export const getAllOneBrktsForSquad = async (squadId: string): Promise<oneBrktType[] | null> => { 
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: squadUrl + squadId,
    });
    if (response.status !== 200) return null;    
    return response.data.oneBrkts;
  } catch (err) {
    return null;
  }
}

/**
 * Get all oneBrkts for a div
 * 
 * @param {string} divId - id of div to get oneBrkts for
 * @returns {oneBrktType[] | null} - array of oneBrkts for div or null 
 */
export const getAllOneBrktsForDiv = async (divId: string): Promise<oneBrktType[] | null> => { 
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: divUrl + divId,
    });
    if (response.status !== 200) return null;    
    return response.data.oneBrkts;
  } catch (err) {
    return null;
  }
}

/**
 * Get all oneBrkts for a brkt
 * 
 * @param {string} brktId - id of brkt to get oneBrkts for
 * @returns {oneBrktType[] | null} - array of oneBrkts for brkt or null 
 */
export const getAllOneBrktsForBrkt = async (brktId: string): Promise<oneBrktType[] | null> => { 
  try {
    if (!isValidBtDbId(brktId, "brk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: brktUrl + brktId,
    });
    if (response.status !== 200) return null;    
    return response.data.oneBrkts;
  } catch (err) {
    return null;
  }
}

/**
 * Get one oneBrkt
 * 
 * @param {string} oneBrktId - id of oneBrkt to get
 * @returns {oneBrktType | null} - oneBrkt or null
 */
export const getOneBrkt = async (oneBrktId: string): Promise<oneBrktType | null> => { 
  try {
    if (!isValidBtDbId(oneBrktId, "obk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneOneBrktUrl + oneBrktId,
    });
    if (response.status !== 200) return null;    
    return response.data.oneBrkt;
  } catch (err) {
    return null;
  }
}

/**
 * posts one oneBrkt
 * 
 * @param {oneBrktType} oneBrkt - oneBrkt to post
 * @returns {oneBrktType | null} - oneBrkt that was posted or null 
 */
export const postOneBrkt = async (oneBrkt: oneBrktType): Promise<oneBrktType | null> => {
  try {
    if (!oneBrkt || !isValidBtDbId(oneBrkt.id, "obk")) return null;
    // further sanatation and validation done in POST route
    const oneBrktJSON = JSON.stringify(oneBrkt);
    const response = await axios({
      method: "post",
      data: oneBrktJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;    
    return response.data.oneBrkt;
  } catch (err) {
    return null;
  }
}

/**
 * posts many oneBrkts
 * 
 * @param {oneBrktType[]} oneBrkts - array of oneBrkts to post
 * @returns {oneBrktType[] | null} - array of oneBrkts that were posted or null 
 */
export const postManyOneBrkts = async (oneBrkts: oneBrktType[]): Promise<oneBrktType[] | null> => {
  try {
    if (!oneBrkts) return null;
    if (oneBrkts.length === 0) return [];
    // further sanatation and validation done in POST route
    const oneBrktsJSON = JSON.stringify(oneBrkts);
    const response = await axios({
      method: "post",
      data: oneBrktsJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    return response.data.oneBrkts;
  } catch (err) {
    return null;
  }
}

/**
 * deletes oneBrkt
 * 
 * @param {string} id - id of oneBrkt to delete
 * @returns {number} - 1 if deleted, -1 on failure 
 */
export const deleteOneBrkt = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "obk")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneOneBrktUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all oneBrkts for a brkt
 * 
 * @param {string} brktId - id of brkt with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted, -1 if brktId is invalid or an error
 */
export const deleteAllOneBrktsForBrkt = async (brktId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(brktId, "brk")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: brktUrl + brktId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }  
}

/**
 * deletes all oneBrkts for a div
 * 
 * @param {string} divId - id of div with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted, -1 if divId is invalid or an error 
 */
export const deleteAllOneBrktsForDiv = async (divId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(divId, "div")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: divUrl + divId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }  
}

/**
 * deletes all oneBrkts for a squad
 * 
 * @param {string} squadId - id of squad with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted, -1 if squadId is invalid or an error 
 */
export const deleteAllOneBrktsForSquad = async (squadId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: squadUrl + squadId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }  
}

/**
 * deletes all oneBrkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with oneBrkts to delete
 * @returns {number} - # of oneBrkts deleted, -1 if tmntId is invalid or an error 
 */
export const deleteAllOneBrktsForTmnt = async (tmntId: string): Promise<number> => {  
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: tmntUrl + tmntId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}
