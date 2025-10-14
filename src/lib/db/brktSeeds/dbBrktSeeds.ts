import axios from "axios";
import { brktSeedsApi } from "@/lib/db/apiPaths";
import { testBrktSeedsApi } from "../../../../test/testApi";
import { Brkt_Seed } from "@prisma/client";
import { brktSeedType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { validateBrktSeeds, validCompositKey } from "@/app/api/brktSeeds/validate";
import { blankBrktSeed } from "../initVals";

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
 * extracts brktSeeds from API response
 * 
 * @param {any} brktSeeds - array of brktSeeds from GET API response
 * @returns {brktSeedType[]} - array of brktSeeds with extracted data 
 */
export const extractBrktSeeds = (brktSeeds: any): brktSeedType[] => {
  if (!brktSeeds || !Array.isArray(brktSeeds)) return [];  
  return brktSeeds.map((brktSeed: any) => ({
    ...blankBrktSeed,
    one_brkt_id: brktSeed.one_brkt_id,      
    seed: brktSeed.seed,
    player_id: brktSeed.player_id
  }));
}

/**
 * Get all brktSeeds for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for tmnt 
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllBrktSeedsForTmnt = async (tmntId: string): Promise<brktSeedType[]> => { 
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  };
  let response;
  try { 
    response = await axios.get(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktSeedsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeeds`)
  }    
  return extractBrktSeeds(response.data.brktSeeds);
}

/**
 * Get all brktSeeds for a squad
 * 
 * @param {squadId} squadId - id of squad to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllBrktSeedsForSquad = async (squadId: string): Promise<brktSeedType[] | null> => { 
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktSeedsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeeds`)
  }
  return extractBrktSeeds(response.data.brktSeeds);
}

/**
 * Get all brktSeeds for a div
 * 
 * @param {string} divId - id of div to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllBrktSeedsForDiv = async (divId: string): Promise<brktSeedType[]> => { 
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try { 
    response = await axios.get(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktSeedsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeeds`)
  }
  return extractBrktSeeds(response.data.brktSeeds);
}

/**
 * Get all brktSeeds for a bracket 
 * 
 * @param {string} brktId - id of brackets to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const getAllBrktSeedsForBrkt = async (brktId: string): Promise<brktSeedType[]> => { 
  if (!isValidBtDbId(brktId, "brk")) {
    throw new Error("Invalid brkt id");
  }
  let response;
  try { 
    response = await axios.get(brktUrl + brktId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktSeedsForBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeeds`)
  }
  return extractBrktSeeds(response.data.brktSeeds);
}

/**
 * Get all brktSeeds for a oneBrkt 
 * 
 * @param {string} oneBrktId - id of oneBrkt to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if oneBrktId is invalid or API call fails
 */
export const getAllBrktSeedsForOneBrkt = async (oneBrktId: string): Promise<brktSeedType[]> => { 
  if (!isValidBtDbId(oneBrktId, "obk")) {
    throw new Error("Invalid oneBrkt id");
  }
  let response;
  try { 
    response = await axios.get(oneBrktUrl + oneBrktId, {
      withCredentials: true,
    });
  } catch (err) { 
    throw new Error(`getAllBrktSeedsForOneBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeeds`)
  }
  return extractBrktSeeds(response.data.brktSeeds);  
}

/**
 * Get one brktSeed
 * 
 * @param {string} oneBrktId - oneBrktId of brktSeed to get
 * @param {string | number} seed - seed of brktSeed to get
 * @returns {brktSeedType} - brktSeed
 * @throws {Error} - if oneBrktId or seed is invalid or API call fails
 */
export const getBrktSeed = async (oneBrktId: string, seed: string | number): Promise<brktSeedType> => { 
  if (!validCompositKey(oneBrktId, seed)) { 
    throw new Error("Invalid oneBrktId or seed");
  };
  let response;
  try { 
    response = await axios.get(oneBrktSeedUrl + oneBrktId + "/" + seed, {
      withCredentials: true,
    })
  } catch (err) {
    throw new Error(`getBrktSeed failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brktSeed`)
  }
  const brktSeed: brktSeedType = {
    ...blankBrktSeed,
    one_brkt_id: response.data.brktSeed.one_brkt_id,      
    seed: response.data.brktSeed.seed,
    player_id: response.data.brktSeed.player_id
  }
  return brktSeed;
}

/**
 * posts many brktSeeds
 * 
 * @param {brktSeedType[]} brktSeeds - array of brktSeeds to post
 * @returns {number} - number of brktSeeds that were posted 
 * @throws {Error} - if brktSeeds are invalid or API call fails
 */
export const postManyBrktSeeds = async (brktSeeds: brktSeedType[]): Promise<number> => {
  if (!brktSeeds || !Array.isArray(brktSeeds)) { 
    throw new Error("Invalid brktSeeds data");
  }
  if (brktSeeds.length === 0) return 0; // no error, just no brktSeeds to post
  const validBrktSeeds = validateBrktSeeds(brktSeeds);
  if (validBrktSeeds.errorCode !== ErrorCode.None
    || validBrktSeeds.brktSeeds.length !== brktSeeds.length)
  {
    if (validBrktSeeds.brktSeeds.length === 0) { 
      throw new Error("Invalid brktSeed data at index 0");
    }
    const errorIndex = brktSeeds.findIndex(brktSeed => !validCompositKey(brktSeed.one_brkt_id, brktSeed.seed));
    if (errorIndex < 0) {
      throw new Error(`Invalid brktSeed data at index ${validBrktSeeds.brktSeeds.length}`);
    } else {
      throw new Error(`Invalid brktSeed data at index ${errorIndex}`);
    }
  }
  let response;
  try {   
    const brktSeedsJSON = JSON.stringify(brktSeeds);  
    response = await axios.post(manyUrl, brktSeedsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyBrktSeeds failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting brktSeeds");
  }
  return response.data.count;
}

/**
 * deletes all brktSeeds for a oneBrkt
 * 
 * @param {string} oneBrktId - oneBrktId of brktSeeds to delete
 * @returns {number} - # of brktSeeds deleted
 * @throws {Error} - if oneBrktId is invalid or API call fails
 */
export const deleteAllBrktSeedsForOneBrkt = async (oneBrktId: string): Promise<number> => {  
  if (!isValidBtDbId(oneBrktId, 'obk')) { 
    throw new Error("Invalid oneBrkt id");
  };
  let response;
  try {    
    response = await axios.delete(oneBrktUrl + oneBrktId, {
      withCredentials: true
    })
  } catch (err) {
    throw new Error(`deleteAllBrktSeedsForOneBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting brktSeeds for oneBrkt");
  }
  return response.data.deleted.count;
}

/**
 * deletes all brktSeeds for a brktId
 * 
 * @param {string} brktId - brktId of brktSeeds to delete
 * @returns {number} - # of brktSeeds deleted
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const deleteAllBrktSeedsForBrkt = async (brktId: string): Promise<number> => {
  if (!isValidBtDbId(brktId, "brk")) { 
    throw new Error("Invalid brkt id");
  }
  let response;
  try {
    response = await axios.delete(brktUrl + brktId, {
      withCredentials: true
    })    
  } catch (err) {
    throw new Error(`deleteAllBrktSeedsForBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting brktSeeds for brkt");
  }
  return response.data.deleted.count;
}

/**
 * deletes all brktSeeds for a div
 * 
 * @param {string} divId - id of div to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted
 * @throws {Error} - if divId is invalid or API call fails
 */
export const deleteAllBrktSeedsForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, "div")) { 
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.delete(divUrl + divId, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`deleteAllBrktSeedsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting brktSeeds for div");
  }
  return response.data.deleted.count;
}

/**
 * deletes all brktSeeds for a squad
 * 
 * @param {string} squadId - id of squad to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted, -1 on failure
 */
export const deleteAllBrktSeedsForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {  
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true
    })
  } catch (err) {
    throw new Error(`deleteAllBrktSeedsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting brktSeeds for squad");
  }
  return response.data.deleted.count;
}

/**
 * deletes all brktSeeds for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all brktSeeds from
 * @returns {number} - # of brktSeeds deleted, -1 on failure
 */
export const deleteAllBrktSeedsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true
    })
  } catch (err) {
    throw new Error(`deleteAllBrktSeedsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting brktSeeds for tmnt");
  }
  return response.data.deleted.count;
}
