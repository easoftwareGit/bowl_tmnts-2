import axios from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../../test/testApi";
import { divEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankDivEntry } from "../initVals";

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi; 

const oneDivEntryUrl = url + "/divEntry/";
const oneDivUrl = url + "/div/";
const oneSquadUrl = url + "/squad/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all div entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get div entries for
 * @returns {divEntryType[] | null} - array of div entries
 */
export const getAllDivEntriesForTmnt = async (tmntId: string): Promise<divEntryType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntDivEntries = response.data.divEntries;
    const divEntries: divEntryType[] = tmntDivEntries.map((divEntry: divEntryType) => {
      return {
        ...blankDivEntry,
        id: divEntry.id,
        squad_id: divEntry.squad_id,
        div_id: divEntry.div_id,
        player_id: divEntry.player_id,
        fee: divEntry.fee,
      }
    });
    return divEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all div entries for a div
 * 
 * @param {string} divId - id of div to get div entries for
 * @returns {divEntryType[] | null} - array of div entries
 */
export const getAllDivEntriesForDiv = async (divId: string): Promise<divEntryType[] | null> => {
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneDivUrl + divId,
    });
    if (response.status !== 200) return null;
    const divDivEntries = response.data.divEntries;
    const divEntries: divEntryType[] = divDivEntries.map((divEntry: divEntryType) => {
      return {
        ...blankDivEntry,
        id: divEntry.id,
        squad_id: divEntry.squad_id,
        div_id: divEntry.div_id,
        player_id: divEntry.player_id,
        fee: divEntry.fee,
      }
    });
    return divEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all div entries for a squad
 * 
 * @param {string} squadId - id of squad to get div entries for
 * @returns {divEntryType[] | null} - array of div entries
 */
export const getAllDivEntriesForSquad = async (squadId: string): Promise<divEntryType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const divDivEntries = response.data.divEntries;
    const divEntries: divEntryType[] = divDivEntries.map((divEntry: divEntryType) => {
      return {
        ...blankDivEntry,
        id: divEntry.id,
        squad_id: divEntry.squad_id,
        div_id: divEntry.div_id,
        player_id: divEntry.player_id,
        fee: divEntry.fee,
      }
    });
    return divEntries;
  } catch (err) {
    return null;
  }
}

/**
 * posts a div entry
 * 
 * @param {divEntryType} divEntry - divEntry to post
 * @returns {divEntryType | null} - divEntry that was posted or null
 */
export const postDivEntry = async (divEntry: divEntryType): Promise<divEntryType | null> => {
  try {
    if (!divEntry || !isValidBtDbId(divEntry.id, "den")) return null;
    // further sanatation and validation done in POST route
    const divEntryJSON = JSON.stringify(divEntry);
    const response = await axios({
      method: "post",
      data: divEntryJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
    const dbDivEntry = response.data.divEntry;
    const postedDivEntry: divEntryType = {
      ...blankDivEntry,
      id: dbDivEntry.id,
      squad_id: dbDivEntry.squad_id,
      div_id: dbDivEntry.div_id,
      player_id: dbDivEntry.player_id,
      fee: dbDivEntry.fee,
    };
    return postedDivEntry;
  } catch (err) {
    return null;
  }
}

/**
 * posts many div entries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries to post
 * @returns {divEntryType[] | null} - array of divEntries that were posted or null
 */
export const postManyDivEntries = async (divEntries: divEntryType[]): Promise<divEntryType[] | null> => {
  try {
    if (!divEntries) return null;
    if (divEntries.length === 0) return [];
    // further sanatation and validation done in POST route
    const divEntryJSON = JSON.stringify(divEntries);
    const response = await axios({
      method: "post",
      data: divEntryJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbDivEntries = response.data.divEntries;
    const postedDivEntries: divEntryType[] = dbDivEntries.map((divEntry: any) => {
      return {
        ...blankDivEntry,
        id: divEntry.id,
        squad_id: divEntry.squad_id,
        div_id: divEntry.div_id,
        player_id: divEntry.player_id,
        fee: divEntry.fee,
      }
    });
    return postedDivEntries;
  } catch (err) {
    return null;
  }
}

/**
 * updates a div entry
 * 
 * @param {divEntryType} divEntry - divEntry to update
 * @returns {divEntryType | null} - divEntry that was updated
 */
export const putDivEntry = async (divEntry: divEntryType): Promise<divEntryType | null> => {
  try {
    if (!divEntry || !isValidBtDbId(divEntry.id, "den")) return null;
    // further sanatation and validation done in POST route
    const divEntryJSON = JSON.stringify(divEntry);
    const response = await axios({
      method: "put",
      data: divEntryJSON,
      withCredentials: true,
      url: oneDivEntryUrl + divEntry.id,
    });
    if (response.status !== 200) return null;
    const dbDivEntry = response.data.divEntry;
    const puttedDivEntry: divEntryType = {
      ...blankDivEntry,
      id: dbDivEntry.id,
      squad_id: dbDivEntry.squad_id,
      div_id: dbDivEntry.div_id,
      player_id: dbDivEntry.player_id,
      fee: dbDivEntry.fee,
    };
    return puttedDivEntry;
  } catch (err) {
    return null;
  }
}

/**
 * deletes a div entry
 * 
 * @param {string} id - id of div entry to delete 
 * @returns {number} - 1 if deleted, -1 on failure
 */
export const deleteDivEntry = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "den")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneDivEntryUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all div entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of div entries deleted, -1 on failure
 */
export const deleteAllDivEntriesForSquad = async (squadId: string): Promise<number> => {
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
 * deletes all div entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of div entries deleted, -1 on failure
 */
export const deleteAllDivEntriesForDiv = async (divId: string): Promise<number> => {  
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
 * deletes all div entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of div entries deleted, -1 on failure
 */
export const deleteAllDivEntriesForTmnt = async (tmntId: string): Promise<number> => {
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