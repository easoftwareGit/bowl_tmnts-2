import axios from "axios";
import { baseBrktEntriesApi } from "@/lib/db/apiPaths";
import { testBaseBrktEntriesApi } from "../../../../test/testApi";
import { brktEntryType, putManyBrktEntriesReturnType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankBrktEntry, noBrktEntriesUpdates } from "../initVals";

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi; 

const brktEntryUrl = url + "/brktEntry/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all brkt entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 */
export const getAllBrktEntriesForTmnt = async (tmntId: string): Promise<brktEntryType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: tmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntBrktEntries = response.data.brktEntries;
    const brktEntries: brktEntryType[] = tmntBrktEntries.map((brktEntry: brktEntryType) => {
      return {
        ...blankBrktEntry,
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.num_refunds,
        fee: brktEntry.fee,
        time_stamp: brktEntry.time_stamp,
      }
    });
    return brktEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt entries for a div
 * 
 * @param {string} divId - id of div to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 */
export const getAllBrktEntriesForDiv = async (divId: string): Promise<brktEntryType[] | null> => {
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: divUrl + divId,
    });
    if (response.status !== 200) return null;
    const divBrktEntries = response.data.brktEntries;
    const brktEntries: brktEntryType[] = divBrktEntries.map((brktEntry: brktEntryType) => {
      return {
        ...blankBrktEntry,
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.num_refunds,
        fee: brktEntry.fee,
        time_stamp: brktEntry.time_stamp,
      }
    });
    return brktEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt entries for a brkt
 * 
 * @param {string} brktId - id of brkt to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 */
export const getAllBrktEntriesForBrkt = async (brktId: string): Promise<brktEntryType[] | null> => {
  try {
    if (!isValidBtDbId(brktId, "brk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: brktUrl + brktId,
    });
    if (response.status !== 200) return null;
    const dbBrktEntries = response.data.brktEntries;
    const brktEntries: brktEntryType[] = dbBrktEntries.map((brktEntry: brktEntryType) => {
      return {
        ...blankBrktEntry,
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.num_refunds,
        fee: brktEntry.fee,
        time_stamp: brktEntry.time_stamp,
      }
    });
    return brktEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt entries for a squad
 * 
 * @param {string} squadId - id of squad to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 */
export const getAllBrktEntriesForSquad = async (squadId: string): Promise<brktEntryType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: squadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const squadBrktEntries = response.data.brktEntries;
    const brktEntries: brktEntryType[] = squadBrktEntries.map((brktEntry: brktEntryType) => {
      return {
        ...blankBrktEntry,
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.num_refunds,
        fee: brktEntry.fee,
        time_stamp: brktEntry.time_stamp,
      }
    });
    return brktEntries;
  } catch (err) {
    return null;
  }
}

/**
 * posts a brkt entry
 * 
 * @param {brktEntryType} brktEntry - brktEntry to post
 * @returns {brktEntryType | null} - brktEntry that was posted or null
 */
export const postBrktEntry = async (brktEntry: brktEntryType): Promise<brktEntryType | null> => {
  try {
    if (!brktEntry || !isValidBtDbId(brktEntry.id, "ben")) return null;
    // further sanatation and validation done in POST route
    const brktEntryJSON = JSON.stringify(brktEntry);
    const response = await axios({
      method: "post",
      data: brktEntryJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
    const dbBrktEntry = response.data.brktEntry;
    const postedBrktEntry: brktEntryType = {
      ...blankBrktEntry,
      id: dbBrktEntry.id,      
      brkt_id: dbBrktEntry.brkt_id,
      player_id: dbBrktEntry.player_id,
      num_brackets: dbBrktEntry.num_brackets,
      num_refunds: dbBrktEntry.num_refunds,
      fee: dbBrktEntry.fee,
    };
    return postedBrktEntry;
  } catch (err) {
    return null;
  }
}

/**
 * posts many brkt entries
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries to post
 * @returns {brktEntryType[] | null} - array of brktEntries that were posted or null
 */
export const postManyBrktEntries = async (brktEntries: brktEntryType[]): Promise<brktEntryType[] | null> => {
  try {
    if (!brktEntries) return null;
    if (brktEntries.length === 0) return [];
    // further sanatation and validation done in POST route
    const brktEntryJSON = JSON.stringify(brktEntries);
    const response = await axios({
      method: "post",
      data: brktEntryJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbBrktEntries = response.data.brktEntries;
    const postedBrktEntries: brktEntryType[] = dbBrktEntries.map((brktEntry: any) => {
      return {
        ...blankBrktEntry,
        id: brktEntry.id,        
        brkt_id: brktEntry.brkt_id,
        player_id: brktEntry.player_id,
        num_brackets: brktEntry.num_brackets,
        num_refunds: brktEntry.num_refunds,
        fee: brktEntry.fee,
      }
    });
    return postedBrktEntries;
  } catch (err) {
    return null;
  }
}

/**
 * updates a brkt entry
 * 
 * @param {brktEntryType} brktEntry - brktEntry to update
 * @returns {brktEntryType | null} - brktEntry that was updated
 */
export const putBrktEntry = async (brktEntry: brktEntryType): Promise<brktEntryType | null> => {
  try {
    if (!brktEntry || !isValidBtDbId(brktEntry.id, "ben")) return null;
    // further sanatation and validation done in POST route
    const brktEntryJSON = JSON.stringify(brktEntry);
    const response = await axios({
      method: "put",
      data: brktEntryJSON,
      withCredentials: true,
      url: brktEntryUrl + brktEntry.id,
    });
    if (response.status !== 200) return null;
    const dbBrktEntry = response.data.brktEntry;
    const puttedBrktEntry: brktEntryType = {
      ...blankBrktEntry,
      id: dbBrktEntry.id,      
      brkt_id: dbBrktEntry.brkt_id,
      player_id: dbBrktEntry.player_id,
      num_brackets: dbBrktEntry.num_brackets,
      num_refunds: dbBrktEntry.num_refunds,
      fee: dbBrktEntry.fee,
    };
    return puttedBrktEntry;
  } catch (err) {
    return null;
  }
}

/**
 * updates, inserts or deletes many brkt entries
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries to update, insert or delete
 * @returns {putManyBrktEntriesReturnType | null} - putManyBrktEntriesReturnType has how many of each type updated or null 
 */
export const putManyBrktEntries = async (brktEntries: brktEntryType[]): Promise<putManyBrktEntriesReturnType | null> => {

  try {
    if (!brktEntries) return null;
    if (brktEntries.length === 0) return noBrktEntriesUpdates;
    for (let i = 0; i < brktEntries.length; i++) {
      if (!isValidBtDbId(brktEntries[i].id, "ben")) return null;
    }
    // further sanatation and validation done in PUT route
    const brktEntriesJSON = JSON.stringify(brktEntries);
    const response = await axios({
      method: "put",
      data: brktEntriesJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 200) return null;
    const updatedInfo: putManyBrktEntriesReturnType = response.data.updateInfo;
    return updatedInfo;
  } catch (err) {
    return null;
  }
}

/**
 * deletes a brkt entry
 * 
 * @param {string} id - id of brkt entry to delete 
 * @returns {number} - 1 if deleted, -1 on failure
 */
export const deleteBrktEntry = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "ben")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: brktEntryUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brkt entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 */
export const deleteAllBrktEntriesForSquad = async (squadId: string): Promise<number> => {
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
 * deletes all brkt entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 */
export const deleteAllBrktEntriesForDiv = async (divId: string): Promise<number> => {  
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
 * deletes all brkt entries for a brkt
 * 
 * @param {string} brktId - id of brkt to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 */
export const deleteAllBrktEntriesForBrkt = async (brktId: string): Promise<number> => {  
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
 * deletes all brkt entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 */
export const deleteAllBrktEntriesForTmnt = async (tmntId: string): Promise<number> => {
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