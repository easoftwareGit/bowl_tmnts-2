import axios from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../../test/testApi";
import { potType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;  
const onePotUrl = url + "/pot/";
const oneSquadUrl = url + "/squad/";
const oneDivUrl = url + "/div/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * gets all pots for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get all pots for
 * @returns {potType[] | null} - pot array or null
 */
export const getAllPotsForTmnt = async (tmntId: string): Promise<potType[] | null> => {

  try {
    if (!tmntId || !isValidBtDbId(tmntId, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200)
      ? response.data.pots
      : null
  } catch (err) {
    return null;
  }  
}

/**
 * post a new pot
 * 
 * @param {potType} pot - pot to post
 * @returns {potType | null} - pot object or null
 */
export const postPot = async (pot: potType): Promise<potType | null> => {  

  try {
    if (!pot || !isValidBtDbId(pot.id, 'pot')) return null
    // further sanatation and validation done in POST route
    const potJSON = JSON.stringify(pot);
    const response = await axios({
      method: "post",
      data: potJSON,
      withCredentials: true,
      url: url,
    });
    return (response.status === 201)
      ? response.data.pot
      : null
  } catch (err) {
    return null;
  }
}

/**
 * post many pots
 * 
 * @param {potType[]} pots - array of pot objects
 * @returns {potType[] | null} - array of pot objects or null
 */
export const postManyPots = async (pots: potType[]): Promise<potType[] | null> => {

  try {
    if (!pots) return null            
    if (pots.length === 0) return []
    // further sanatation and validation done in POST route
    const potJSON = JSON.stringify(pots);
    const response = await axios({
      method: "post",
      data: potJSON,
      withCredentials: true,
      url: manyUrl,
    });
    return (response.status === 201)
      ? response.data.pots
      : null
  } catch (err) {
    return null;
  }
}

/**
 * updates a pot
 * 
 * @param {potType} pot - pot to update
 * @returns {potType | null} - pot object or null
 */
export const putPot = async (pot: potType): Promise<potType | null> => { 
  
  try {
    if (!pot || !isValidBtDbId(pot.id, 'pot')) return null
    // further sanatation and validation done in POST route
    const potJSON = JSON.stringify(pot);
    const response = await axios({
      method: "put",
      data: potJSON,
      withCredentials: true,
      url: onePotUrl + pot.id,
    });
    return (response.status === 200)
      ? response.data.pot
      : null
  } catch (err) {
    return null;
  }
}

/**
 * deletes a pot
 * 
 * @param {string} id - the id of the pot to delete
 * @returns {number} - 1 if successful, -1 if not
 */
export const deletePot = async (id: string): Promise<number> => {
  try {
    if (!id || !isValidBtDbId(id, 'pot')) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: onePotUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all pots for a squad
 * 
 * @param {string} squadId - id of squad to delete all pots from
 * @returns {number} - # of pots deleted, -1 if squadId is invalid or an error
 */
export const deleteAllSquadPots = async (squadId: string): Promise<number> => {
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
 * 
 * @param {string} divId - id of div to delete all pots from
 * @returns {number} - # of pots deleted, -1 if divId is invalid or an error
 */
export const deleteAllDivPots = async (divId: string): Promise<number> => {
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
 * deletes all pots for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all pots from
 * @returns {number} - # of pots deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntPots = async (tmntId: string): Promise<number> => {
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