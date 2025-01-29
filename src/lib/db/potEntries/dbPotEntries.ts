import axios from "axios";
import { basePotEntriesApi } from "@/lib/db/apiPaths";
import { testBasePotEntriesApi } from "../../../../test/testApi";
import { potEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankPotEntry } from "../initVals";

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi; 

const onePotEntryUrl = url + "/potEntry/";
const oneDivUrl = url + "/div/";
const oneSquadUrl = url + "/squad/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all pot entries for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get pot entries for
 * @returns {potEntryType[] | null} - array of pot entries
 */
export const getAllPotEntriesForTmnt = async (tmntId: string): Promise<potEntryType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntPotEntries = response.data.potEntries;
    const potEntries: potEntryType[] = tmntPotEntries.map((potEntry: potEntryType) => {
      return {
        ...blankPotEntry,
        id: potEntry.id,        
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
      }
    });
    return potEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all pot entries for a div
 * 
 * @param {string} divId - id of div to get pot entries for
 * @returns {potEntryType[] | null} - array of pot entries
 */
export const getAllPotEntriesForDiv = async (divId: string): Promise<potEntryType[] | null> => {
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneDivUrl + divId,
    });
    if (response.status !== 200) return null;
    const divPotEntries = response.data.potEntries;
    const potEntries: potEntryType[] = divPotEntries.map((potEntry: potEntryType) => {
      return {
        ...blankPotEntry,
        id: potEntry.id,        
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
      }
    });
    return potEntries;
  } catch (err) {
    return null;
  }
}

/**
 * Get all pot entries for a squad
 * 
 * @param {string} squadId - id of squad to get pot entries for
 * @returns {potEntryType[] | null} - array of pot entries
 */
export const getAllPotEntriesForSquad = async (squadId: string): Promise<potEntryType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const squadPotEntries = response.data.potEntries;
    const potEntries: potEntryType[] = squadPotEntries.map((potEntry: potEntryType) => {
      return {
        ...blankPotEntry,
        id: potEntry.id,        
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
      }
    });
    return potEntries;
  } catch (err) {
    return null;
  }
}

/**
 * posts a div entry
 * 
 * @param {potEntryType} potEntry - potEntry to post
 * @returns {potEntryType | null} - potEntry that was posted or null
 */
export const postPotEntry = async (potEntry: potEntryType): Promise<potEntryType | null> => {
  try {
    if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) return null;
    // further sanatation and validation done in POST route
    const potEntryJSON = JSON.stringify(potEntry);
    const response = await axios({
      method: "post",
      data: potEntryJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
    const dbPotEntry = response.data.potEntry;
    const postedPotEntry: potEntryType = {
      ...blankPotEntry,
      id: dbPotEntry.id,      
      pot_id: dbPotEntry.pot_id,
      player_id: dbPotEntry.player_id,
      fee: dbPotEntry.fee,
    };
    return postedPotEntry;
  } catch (err) {
    return null;
  }
}

/**
 * posts many pot entries
 * 
 * @param {potEntryType[]} potEntries - array of potEntries to post
 * @returns {potEntryType[] | null} - array of potEntries that were posted or null
 */
export const postManyPotEntries = async (potEntries: potEntryType[]): Promise<potEntryType[] | null> => {
  try {
    if (!potEntries) return null;
    if (potEntries.length === 0) return [];
    // further sanatation and validation done in POST route
    const potEntryJSON = JSON.stringify(potEntries);
    const response = await axios({
      method: "post",
      data: potEntryJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbPotEntries = response.data.potEntries;
    const postedPotEntries: potEntryType[] = dbPotEntries.map((potEntry: any) => {
      return {
        ...blankPotEntry,
        id: potEntry.id,
        squad_id: potEntry.squad_id,
        pot_id: potEntry.pot_id,
        player_id: potEntry.player_id,
        fee: potEntry.fee,
      }
    });
    return postedPotEntries;
  } catch (err) {
    return null;
  }
}

/**
 * updates a div entry
 * 
 * @param {potEntryType} potEntry - potEntry to update
 * @returns {potEntryType | null} - potEntry that was updated
 */
export const putPotEntry = async (potEntry: potEntryType): Promise<potEntryType | null> => {
  try {
    if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) return null;
    // further sanatation and validation done in POST route
    const potEntryJSON = JSON.stringify(potEntry);
    const response = await axios({
      method: "put",
      data: potEntryJSON,
      withCredentials: true,
      url: onePotEntryUrl + potEntry.id,
    });
    if (response.status !== 200) return null;
    const dbPotEntry = response.data.potEntry;
    const puttedPotEntry: potEntryType = {
      ...blankPotEntry,
      id: dbPotEntry.id,      
      pot_id: dbPotEntry.pot_id,
      player_id: dbPotEntry.player_id,
      fee: dbPotEntry.fee,
    };
    return puttedPotEntry;
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
export const deletePotEntry = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "pen")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: onePotEntryUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all pot entries for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of pot entries deleted, -1 on failure
 */
export const deleteAllPotEntriesForSquad = async (squadId: string): Promise<number> => {
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
 * deletes all pot entries for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of pot entries deleted, -1 on failure
 */
export const deleteAllPotEntriesForDiv = async (divId: string): Promise<number> => {
  try {
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
 * deletes all pot entries for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of pot entries deleted, -1 on failure
 */
export const deleteAllPotEntriesForTmnt = async (tmntId: string): Promise<number> => {
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