import axios from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../../test/testApi";
import { brktType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankBrkt } from "../initVals";
import { validateBrkts } from "@/app/api/brkts/validate";

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;   
const oneBrktUrl = url + "/brkt/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * extract brkt data from GET API response
 * 
 * @param {any} brkts - array of brkts from GET API response
 * @returns {brktType[]} - array of brkts  
 */
export const extractBrkts = (brkts: any): brktType[] => {
  if (!brkts || !Array.isArray(brkts)) return [];
  return brkts.map((brkt: any) => ({
    ...blankBrkt,
    id: brkt.id,
    squad_id: brkt.squad_id,
    div_id: brkt.div_id,
    start: brkt.start,
    games: brkt.games,
    players: brkt.players,
    fee: brkt.fee,
    first: brkt.first,
    second: brkt.second,
    admin: brkt.admin,
    fsa: brkt.fsa,
    sort_order: brkt.sort_order,
  }));
}

/**
 * get all brkts for tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brkts for
 * @returns {brktType[]} - array of brkts 
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllBrktsForTmnt = async (tmntId: string): Promise<brktType[]> => {
  if (!isValidBtDbId(tmntId, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.get(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brkts`)
  }
  return extractBrkts(response.data.brkts);
}

/**
 * get all brkts for squad
 * 
 * @param {string} squadId - id of squad to get brkts for
 * @returns {brktType[]} - array of brkts 
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllBrktsForSquad = async (squadId: string): Promise<brktType[] | null> => {
  if (!isValidBtDbId(squadId, 'sqd')) { 
    throw new Error('Invalid squad id');
  }
  let response;
  try { 
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getAllBrktsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching brkts`)
  }
  return extractBrkts(response.data.brkts);
}

/**
 * post a new brkt
 *
 * @param {brktType} brkt - bracket to post
 * @returns {brktType} - brkt object
 * @throws {Error} - if brkt is invalid or API call fails
 */
export const postBrkt = async (brkt: brktType): Promise<brktType> => {
  if (!brkt || !isValidBtDbId(brkt.id, 'brk')) { 
    throw new Error('Invalid brkt data');
  }
  try { 
    // further sanatation and validation done in POST route
    const brktJSON = JSON.stringify(brkt);
    const response = await axios.post(url, brktJSON, {
      withCredentials: true
    })
    if (response.status !== 201) { 
      throw new Error("Error posting brkt")
    }
    const dbBrkt = response.data.brkt
    const postedBrkt = {
      ...blankBrkt,
      id: dbBrkt.id,
      squad_id: dbBrkt.squad_id,
      div_id: dbBrkt.div_id,
      start: dbBrkt.start,
      games: dbBrkt.games,
      players: dbBrkt.players,
      fee: dbBrkt.fee,
      first: dbBrkt.first,
      second: dbBrkt.second,
      admin: dbBrkt.admin,
      fsa: dbBrkt.fsa,
      sort_order: dbBrkt.sort_order,
    }
    return postedBrkt
  } catch (err) { 
    throw new Error(`postBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * post many brkts
 * 
 * @param {brktType[]} brkts - array of brkts to post
 * @returns {number} - number of brkts posted
 * @throws {Error} - if brkts are invalid or API call fails 
 */
export const postManyBrkts = async (brkts: brktType[]): Promise<number> => { 

  if (!brkts || !Array.isArray(brkts)) { 
    throw new Error("Invalid brkts data");
  }
  if (brkts.length === 0) return 0; // not an error, just no data to post
  const validBrkts = validateBrkts(brkts);
  if (validBrkts.errorCode !== ErrorCode.None
    || validBrkts.brkts.length !== brkts.length)
  {
    if (validBrkts.brkts.length === 0) {
      throw new Error("Invalid brkt data at index 0");
    }
    const errorIndex = brkts.findIndex(brkt => !isValidBtDbId(brkt.id, "brk"));
    if (errorIndex < 0) {
      throw new Error(`Invalid brkt data at index ${validBrkts.brkts.length}`);
    } else {
      throw new Error(`Invalid brkt data at index ${errorIndex}`);
    }
  } 
  let response;
  try {   
    const brktsJSON = JSON.stringify(validBrkts.brkts);
    response = await axios.post(manyUrl, brktsJSON, {
      withCredentials: true
    })
  } catch (err) { 
    throw new Error(`postManyBrkts failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting brkts");
  }
  return response.data.count;
}

/**
 * updates a brkt
 * 
 * @param {brktType} brkt - brkt to update
 * @returns {brktType | null} - brkt object
 * @throws {Error} - if brkt is invalid or API call fails
 */
export const putBrkt = async (brkt: brktType): Promise<brktType | null> => { 
  if (!brkt || !isValidBtDbId(brkt.id, 'brk')) { 
    throw new Error('Invalid brkt data');
  }
  try { 
    // further sanatation and validation done in PUT route
    const brktJSON = JSON.stringify(brkt);
    const response = await axios.put(oneBrktUrl + brkt.id, brktJSON, {
      withCredentials: true      
    })
    if (response.status !== 200 || !response.data?.brkt) {
      throw new Error('Error putting brkt');
    }
    const dbBrkt = response.data.brkt;
    return {
      ...blankBrkt,
      id: dbBrkt.id,
      squad_id: dbBrkt.squad_id,
      div_id: dbBrkt.div_id,
      start: dbBrkt.start,
      games: dbBrkt.games,
      players: dbBrkt.players,
      fee: dbBrkt.fee,
      first: dbBrkt.first,
      second: dbBrkt.second,
      admin: dbBrkt.admin,
      fsa: dbBrkt.fsa,
      sort_order: dbBrkt.sort_order,
    }
  } catch (err) { 
    throw new Error(`putBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * delete a brkt
 * 
 * @param {string} id - id of brkt to delete
 * @returns {number} - 1 if successful
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteBrkt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, 'brk')) { 
    throw new Error('Invalid brkt id');
  }
  try { 
    const response = await axios.delete(oneBrktUrl + id, {
      withCredentials: true
    })
    if (response.status !== 200) {
      throw new Error('Error deleting brkt');
    }
    return 1
  } catch (err) { 
    throw new Error(`deleteBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * deletes all brkts for a squad
 * 
 * @param {string} squadId - id of squad to delete all brkts from
 * @returns {number} - # of brkts deleted
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const deleteAllBrktsForSquad = async (squadId: string): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  try { 
    const response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
    if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
      throw new Error("Error deleting brkts for squad");
    }
    return response.data.deleted.count;
  } catch (err) {
    throw new Error(`deleteAllBrktsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * deletes all brkts for a div
 * 
 * @param {string} divId - id of div to delete all brkts from
 * @returns {number} - # of brkts deleted
 * @throws {Error} - if divId is invalid or API call fails
 */
export const deleteAllBrktsForDiv = async (divId: string): Promise<number> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  try { 
    const response = await axios.delete(divUrl + divId, {
      withCredentials: true,
    });
    if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
      throw new Error("Error deleting brkts for div");
    }
    return response.data.deleted.count;
  } catch (err) {
    throw new Error(`deleteAllBrktsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
}

/**
 * deletes all brkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all brkts from
 * @returns {number} - # of brkts deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllBrktsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  try {
    const response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
    if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
      throw new Error("Error deleting brkts for tmnt");
    }
    return response.data.deleted.count;
  } catch (err) {
    throw new Error(`deleteAllBrktsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
}