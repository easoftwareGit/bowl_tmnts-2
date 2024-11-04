import axios from "axios";
import { baseBrktsApi } from "@/lib/db/apiPaths";
import { testBaseBrktsApi } from "../../../../test/testApi";
import { brktType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;   
const oneBrktUrl = url + "/brkt/";
const oneSquadUrl = url + "/squad/";
const oneDivUrl = url + "/div/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * get all brkts for tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brkts for
 * @returns {brktType[] | null} - array of brkts or null
 */
export const getAllBrktsForTmnt = async (tmntId: string): Promise<brktType[] | null> => {

  try {
    if (!tmntId || !isValidBtDbId(tmntId, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200)
      ? response.data.brkts
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post a new brkt
 *
 * @param {brktType} brkt - bracket to post
 * @returns {brktType | null } - brkt object or null
 */
export const postBrkt = async (brkt: brktType): Promise<brktType | null> => {
    
  try {
    if (!brkt || !isValidBtDbId(brkt.id, 'brk')) return null
    // further sanatation and validation done in POST route
    const brktJSON = JSON.stringify(brkt);
    const response = await axios({
      method: "post",
      data: brktJSON,
      withCredentials: true,
      url: url,
    });
    return (response.status === 201)
      ? response.data.brkt
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post many brkts
 * 
 * @param {brktType[]} brkts - array of brkts to post
 * @returns {brktType[] | null} - array of brkts or null
 */
export const postManyBrkts = async (brkts: brktType[]): Promise<brktType[] | null> => { 

  try {
    if (!brkts) return null
    if (brkts.length === 0) return []
    // further sanatation and validation done in POST route
    const brktJSON = JSON.stringify(brkts);
    const response = await axios({
      method: "post",
      data: brktJSON,
      withCredentials: true,
      url: manyUrl,
    });
    return (response.status === 201)
      ? response.data.brkts
      : null
  } catch (err) {
    return null;
  }
}

/**
 * updates a brkt
 * 
 * @param {brktType} brkt - brkt to update
 * @returns {brktType | null} - brkt object or null
 */
export const putBrkt = async (brkt: brktType): Promise<brktType | null> => { 

  try {
    if (!brkt || !isValidBtDbId(brkt.id, 'brk')) return null
    // further sanatation and validation done in POST route
    const brktJSON = JSON.stringify(brkt);
    const response = await axios({
      method: "put",
      data: brktJSON,
      withCredentials: true,
      url: oneBrktUrl + brkt.id,
    });
    return (response.status === 200)
      ? response.data.brkt
      : null
  } catch (err) {
    return null;
  }
}

/**
 * delete a brkt
 * 
 * @param {string} id - id of brkt to delete
 * @returns {number} - 1 if successful, -1 if not
 */
export const deleteBrkt = async (id: string): Promise<number> => {
  try {
    if (!id || !isValidBtDbId(id, 'brk')) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneBrktUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brkts for a squad
 * 
 * @param {string} squadId - id of squad to delete all brkts from
 * @returns {number} - # of brkts deleted, -1 if squadId is invalid or an error
 */
export const deleteAllSquadBrkts = async (squadId: string): Promise<number> => {
  try {
    if (!squadId || !isValidBtDbId(squadId, 'sqd')) return -1
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
 * deletes all brkts for a div
 * 
 * @param {string} divId - id of div to delete all brkts from
 * @returns {number} - # of brkts deleted, -1 if divId is invalid or an error
 */
export const deleteAllDivBrkts = async (divId: string): Promise<number> => {
  try {
    if (!divId || !isValidBtDbId(divId, 'div')) return -1
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
 * deletes all brkts for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all brkts from
 * @returns {number} - # of brkts deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntBrkts = async (tmntId: string): Promise<number> => {
  try {
    if (!tmntId || !isValidBtDbId(tmntId, 'tmt')) return -1
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