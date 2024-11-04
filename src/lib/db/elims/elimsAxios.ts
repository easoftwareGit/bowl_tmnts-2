import axios from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../../test/testApi";
import { elimType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;   
const oneElimUrl = url + "/elim/";
const oneSquadUrl = url + "/squad/";
const oneDivUrl = url + "/div/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * get all elims for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get all elims for
 * @returns {elimType[] | null} - array of elims or null
 */
export const getAllElimsForTmnt = async (tmntId: string): Promise<elimType[] | null> => {

  try {
    if (!tmntId || !isValidBtDbId(tmntId, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200)
      ? response.data.elims
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post a new elim
 * 
 * @param {elimType} elim - elim to post
 * @returns {elimType | null} - posted elim or null
 */
export const postElim = async (elim: elimType): Promise<elimType | null> => {
  
  try {
    if (!elim || !isValidBtDbId(elim.id, 'elm')) return null
    // further sanatation and validation done in POST route
    const elimJSON = JSON.stringify(elim);
    const response = await axios({
      method: "post",
      data: elimJSON,
      withCredentials: true,
      url: url,
    });
    return (response.status === 201)
      ? response.data.elim
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post many elims
 * 
 * @param {elimType[]} elims - array of elims to post
 * @returns {elimType[] | null} - array of posted elims or null
 */
export const postManyElims = async (elims: elimType[]): Promise<elimType[] | null> => { 

  try {
    if (!elims) return null
    if (elims.length === 0) return []
    // further sanatation and validation done in POST route
    const elimJSON = JSON.stringify(elims);
    const response = await axios({
      method: "post",
      data: elimJSON,
      withCredentials: true,
      url: manyUrl,
    });
    return (response.status === 201)
      ? response.data.elims
      : null
  } catch (err) {
    return null;
  }
}

/**
 * update an elim
 * 
 * @param {elimType} elim - elim to update
 * @returns {elimType | null} - updated elim or null
 */
export const putElim = async (elim: elimType): Promise<elimType | null> => { 

  try {
    if (!elim || !isValidBtDbId(elim.id, 'elm')) return null
    // further sanatation and validation done in POST route
    const elimJSON = JSON.stringify(elim);
    const response = await axios({
      method: "put",
      data: elimJSON,
      withCredentials: true,
      url: oneElimUrl + elim.id,
    });
    return (response.status === 200)
      ? response.data.elim
      : null
  } catch (err) {
    return null;
  }
}

/**
 * delete an elim
 * 
 * @param {string} id - id of elim to delete
 * @returns {number} - 1 if success, -1 if failure
 */
export const deleteElim = async (id: string): Promise<number> => {
  try {
    if (!id || !isValidBtDbId(id, 'elm')) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneElimUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * delete all elims for a squad
 * 
 * @param squadId - id of squad to delete all elims from
 * @returns - # of elims deleted, -1 if squadId is invalid or an error
 */
export const deleteAllSquadElims = async (squadId: string): Promise<number> => {
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
 * delete all elims for a div
 * 
 * @param divId - id of div to delete all elims from
 * @returns - # of elims deleted, -1 if divId is invalid or an error
 */
export const deleteAllDivElims = async (divId: string): Promise<number> => {
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
 * delete all elims for a tmnt
 * 
 * @param tmntId - id of tmnt to delete all elims from
 * @returns - # of elims deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntElims = async (tmntId: string): Promise<number> => {
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