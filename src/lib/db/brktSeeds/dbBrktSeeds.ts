import axios from "axios";
import { brktSeedsApi } from "@/lib/db/apiPaths";
import { testBrktSeedsApi } from "../../../../test/testApi";
import { brktSeedType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { validCompositKey } from "@/app/api/brktSeeds/validate";

const url = testBrktSeedsApi.startsWith("undefined")
  ? brktSeedsApi
  : testBrktSeedsApi;  

const oneBrktSeedUrl = url + "/brktSeed/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const oneBrktUrl = url + "/oneBrkt/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all brktSeeds for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brktSeeds for
 * @returns {brktSeedType[] | null} - array of brktSeeds for tmnt
 */
export const getAllBrktSeedsForTmnt = async (tmntId: string): Promise<brktSeedType[] | null> => { 
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: tmntUrl + tmntId,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brktSeeds for a squad
 * 
 * @param {squadId} squadId - id of squad to get brktSeeds for
 * @returns {brktSeedType[] | null} - array of brktSeeds for squad
 */
export const getAllBrktSeedsForSquad = async (squadId: string): Promise<brktSeedType[] | null> => { 
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: squadUrl + squadId,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brktSeeds for a div
 * 
 * @param {string} divId - id of div to get brktSeeds for
 * @returns {brktSeedType[] | null} - array of brktSeeds for squad
 */
export const getAllBrktSeedsForDiv = async (divId: string): Promise<brktSeedType[] | null> => { 
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: divUrl + divId,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brktSeeds for a bracket 
 * 
 * @param {string} brktId - id of brackets to get brktSeeds for
 * @returns {brktSeedType[] | null} - array of brktSeeds for squad
 */
export const getAllBrktSeedsForBrkt = async (brktId: string): Promise<brktSeedType[] | null> => { 
  try {
    if (!isValidBtDbId(brktId, "brk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: brktUrl + brktId,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brktSeeds for a oneBrkt 
 * 
 * @param {string} oneBrktId - id of oneBrkt to get brktSeeds for
 * @returns {brktSeedType[] | null} - array of brktSeeds for squad
 */
export const getAllBrktSeedsForOneBrkt = async (oneBrktId: string): Promise<brktSeedType[] | null> => { 
  try {
    if (!isValidBtDbId(oneBrktId, "obk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneBrktUrl + oneBrktId,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * Get one brktSeed
 * 
 * @param {string} oneBrktId - oneBrktId of brktSeed to get
 * @param {string | number} seed - seed of brktSeed to get
 * @returns {brktSeedType | null} - brktSeed or null 
 */
export const getBrktSeed = async (oneBrktId: string, seed: string | number): Promise<brktSeedType | null> => { 
  try {
    if (!validCompositKey(oneBrktId, seed)) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneBrktSeedUrl + oneBrktId + "/" + seed,
    });
    if (response.status !== 200) return null;    
    return response.data.brktSeed;
  } catch (err) {
    return null;
  }
}

/**
 * posts one brktSeed
 * 
 * @param {brktSeedType} brktSeed - brktSeed to post
 * @returns {brktSeedType | null} - brktSeed that was posted or null 
 */
export const postBrktSeed = async (brktSeed: brktSeedType): Promise<brktSeedType | null> => {
  try {
    if (!brktSeed || !validCompositKey(brktSeed.one_brkt_id, brktSeed.seed)) return null;
    // further sanatation and validation done in POST route
    const brktSeedJSON = JSON.stringify(brktSeed);
    const response = await axios({
      method: "post",
      data: brktSeedJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;    
    return response.data.brktSeed;
  } catch (err) {
    return null;
  }
}

/**
 * posts many brktSeeds
 * 
 * @param {brktSeedType[]} brktSeeds - array of brktSeeds to post
 * @returns {brktSeedType[] | null} - array of brktSeeds that were posted or null 
 */
export const postManyBrktSeeds = async (brktSeeds: brktSeedType[]): Promise<brktSeedType[] | null> => {
  try {
    if (!brktSeeds) return null;
    if (brktSeeds.length === 0) return [];
    // further sanatation and validation done in POST route
    const brktSeedsJSON = JSON.stringify(brktSeeds);
    const response = await axios({
      method: "post",
      data: brktSeedsJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    return response.data.brktSeeds;
  } catch (err) {
    return null;
  }
}

/**
 * deletes a brktSeed
 * 
 * @param {string} oneBrktId - oneBrktId of brktSeed to delete
 * @param {string | number} seed - seed of brktSeed to delete
 * @returns {number} - 1 if deleted, -1 on failure 
 */
export const deleteBrktSeed = async (oneBrktId: string, seed: string | number): Promise<number> => {
  try {
    if (!validCompositKey(oneBrktId, seed)) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneBrktSeedUrl + oneBrktId + "/" + seed,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brktSeeds for a oneBrkt
 * 
 * @param {string} oneBrktId - oneBrktId of brktSeeds to delete
 * @returns {number} - # of brktSeeds deleted, -1 on failure 
 */
export const deleteAllBrktSeedsForOneBrkt = async (oneBrktId: string): Promise<number> => {  
  try {
    if (!isValidBtDbId(oneBrktId, 'obk')) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneBrktUrl + oneBrktId,
    });
    return (response.status === 200) ? response.data.deleted.count : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brktSeeds for a brktId
 * 
 * @param {string} brktId - brktId of brktSeeds to delete
 * @returns {number} - # of brktSeeds deleted, -1 on failure 
 */
export const deleteAllBrktSeedsForBrkt = async (brktId: string): Promise<number> => {
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
 * deletes all brktSeeds for a div
 * 
 * @param {string} divId - id of div to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted, -1 on failure
 */
export const deleteAllBrktSeedsForDiv = async (divId: string): Promise<number> => {
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
 * deletes all brktSeeds for a squad
 * 
 * @param {string} squadId - id of squad to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted, -1 on failure
 */
export const deleteAllBrktSeedsForSquad = async (squadId: string): Promise<number> => {
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
 * deletes all brktSeeds for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted, -1 on failure
 */
export const deleteAllBrktSeedsForTmnt = async (tmntId: string): Promise<number> => {
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