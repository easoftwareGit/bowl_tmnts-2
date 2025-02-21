import axios from "axios";
import { baseElimEntriesApi } from "@/lib/db/apiPaths";
import { testBaseElimEntriesApi } from "../../../../test/testApi";
import { elimEntryType, putManyReturnType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankElimEntry, noUpdates } from "../initVals";

const url = testBaseElimEntriesApi.startsWith("undefined")
  ? baseElimEntriesApi
  : testBaseElimEntriesApi; 

const oneElimEntryUrl = url + "/elimEntry/";
const oneElimUrl = url + "/elim/";
const oneDivUrl = url + "/div/";
const oneSquadUrl = url + "/squad/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all elim entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get elim entries for
 * @returns {elimEntryType[] | null} - array of elim entries
 */
export const getAllElimEntriesForTmnt = async (tmntId: string): Promise<elimEntryType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntElimEntries = response.data.elimEntries;
    const elimEntries: elimEntryType[] = tmntElimEntries.map((elimEntry: elimEntryType) => {
      return {
        ...blankElimEntry,
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      }
    });
    return elimEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all elim entries for a div
 * 
 * @param {string} divId - id of div to get elim entries for
 * @returns {elimEntryType[] | null} - array of elim entries
 */
export const getAllElimEntriesForDiv = async (divId: string): Promise<elimEntryType[] | null> => {
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneDivUrl + divId,
    });
    if (response.status !== 200) return null;
    const divElimEntries = response.data.elimEntries;
    const elimEntries: elimEntryType[] = divElimEntries.map((elimEntry: elimEntryType) => {
      return {
        ...blankElimEntry,
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      }
    });
    return elimEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all elim entries for a elim
 * 
 * @param {string} elimId - id of elim to get elim entries for
 * @returns {elimEntryType[] | null} - array of elim entries
 */
export const getAllElimEntriesForElim = async (elimId: string): Promise<elimEntryType[] | null> => {
  try {
    if (!isValidBtDbId(elimId, "elm")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneElimUrl + elimId,
    });
    if (response.status !== 200) return null;
    const divElimEntries = response.data.elimEntries;
    const elimEntries: elimEntryType[] = divElimEntries.map((elimEntry: elimEntryType) => {
      return {
        ...blankElimEntry,
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      }
    });
    return elimEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all elim entries for a squad
 * 
 * @param {string} squadId - id of squad to get elim entries for
 * @returns {elimEntryType[] | null} - array of elim entries
 */
export const getAllElimEntriesForSquad = async (squadId: string): Promise<elimEntryType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const divElimEntries = response.data.elimEntries;
    const elimEntries: elimEntryType[] = divElimEntries.map((elimEntry: elimEntryType) => {
      return {
        ...blankElimEntry,
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      }
    });
    return elimEntries;
  } catch (err) {
    return null;
  }
}

/**
 * posts a elim entry
 * 
 * @param {elimEntryType} elimEntry - elimEntry to post
 * @returns {elimEntryType | null} - elimEntry that was posted or null
 */
export const postElimEntry = async (elimEntry: elimEntryType): Promise<elimEntryType | null> => {
  try {
    if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) return null;
    // further sanatation and validation done in POST route
    const elimEntryJSON = JSON.stringify(elimEntry);
    const response = await axios({
      method: "post",
      data: elimEntryJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
    const dbElimEntry = response.data.elimEntry;
    const postedElimEntry: elimEntryType = {
      ...blankElimEntry,
      id: dbElimEntry.id,      
      elim_id: dbElimEntry.elim_id,
      player_id: dbElimEntry.player_id,      
      fee: dbElimEntry.fee,
    };
    return postedElimEntry;
  } catch (err) {
    return null;
  }
}

/**
 * posts many elim entries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries to post
 * @returns {elimEntryType[] | null} - array of elimEntries that were posted or null
 */
export const postManyElimEntries = async (elimEntries: elimEntryType[]): Promise<elimEntryType[] | null> => {
  try {
    if (!elimEntries) return null;
    if (elimEntries.length === 0) return [];
    // further sanatation and validation done in POST route
    const elimEntryJSON = JSON.stringify(elimEntries);
    const response = await axios({
      method: "post",
      data: elimEntryJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbElimEntries = response.data.elimEntries;
    const postedElimEntries: elimEntryType[] = dbElimEntries.map((elimEntry: any) => {
      return {
        ...blankElimEntry,
        id: elimEntry.id,        
        elim_id: elimEntry.elim_id,
        player_id: elimEntry.player_id,        
        fee: elimEntry.fee,
      }
    });
    return postedElimEntries;
  } catch (err) {
    return null;
  }
}

/**
 * updates a elim entry
 * 
 * @param {elimEntryType} elimEntry - elimEntry to update
 * @returns {elimEntryType | null} - elimEntry that was updated
 */
export const putElimEntry = async (elimEntry: elimEntryType): Promise<elimEntryType | null> => {
  try {
    if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) return null;
    // further sanatation and validation done in POST route
    const elimEntryJSON = JSON.stringify(elimEntry);
    const response = await axios({
      method: "put",
      data: elimEntryJSON,
      withCredentials: true,
      url: oneElimEntryUrl + elimEntry.id,
    });
    if (response.status !== 200) return null;
    const dbElimEntry = response.data.elimEntry;
    const puttedElimEntry: elimEntryType = {
      ...blankElimEntry,
      id: dbElimEntry.id,      
      elim_id: dbElimEntry.elim_id,
      player_id: dbElimEntry.player_id,      
      fee: dbElimEntry.fee,
    };
    return puttedElimEntry;
  } catch (err) {
    return null;
  }
}

/**
 * updates, inserts or deletes many elim entries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries to update, insert or delete
 * @returns {putManyReturnType | null} - putManyReturnType has how many of each type updated or null 
 */
export const putManyElimEntries = async (elimEntries: elimEntryType[]): Promise<putManyReturnType | null> => {

  try {
    if (!elimEntries) return null;
    if (elimEntries.length === 0) return noUpdates;
    for (let i = 0; i < elimEntries.length; i++) {
      if (!isValidBtDbId(elimEntries[i].id, "een")) return null;
    }
    // further sanatation and validation done in PUT route
    const elimEntriesJSON = JSON.stringify(elimEntries);
    const response = await axios({
      method: "put",
      data: elimEntriesJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 200) return null;
    const updatedInfo: putManyReturnType = response.data.updateInfo;
    return updatedInfo;
  } catch (err) {
    return null;
  }
}

/**
 * deletes a elim entry
 * 
 * @param {string} id - id of elim entry to delete 
 * @returns {number} - 1 if deleted, -1 on failure
 */
export const deleteElimEntry = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "een")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneElimEntryUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all elim entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of elim entries deleted, -1 on failure
 */
export const deleteAllElimEntriesForSquad = async (squadId: string): Promise<number> => {
  try {
    if (!squadId || !isValidBtDbId(squadId, "sqd")) return -1;
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
 * deletes all elim entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of elim entries deleted, -1 on failure
 */
export const deleteAllElimEntriesForDiv = async (divId: string): Promise<number> => {  
  try {
    if (!divId || !isValidBtDbId(divId, "div")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneDivUrl + divId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all elim entries for a elim
 * 
 * @param {string} elimId - id of elim to delete
 * @returns {number} - number of elim entries deleted, -1 on failure
 */
export const deleteAllElimEntriesForElim = async (elimId: string): Promise<number> => {  
  try {
    if (!elimId || !isValidBtDbId(elimId, "elm")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneElimUrl + elimId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all elim entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of elim entries deleted, -1 on failure
 */
export const deleteAllElimEntriesForTmnt = async (tmntId: string): Promise<number> => {
  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return -1;
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