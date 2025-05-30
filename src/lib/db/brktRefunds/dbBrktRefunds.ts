import axios from "axios";
import { baseBrktRefundsApi } from "@/lib/db/apiPaths";
import { testBaseBrktRefundsApi } from "../../../../test/testApi";
import { brktRefundType, putManyReturnType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankBrktRefund, noUpdates } from "../initVals";

const url = testBaseBrktRefundsApi.startsWith("undefined")
  ? baseBrktRefundsApi
  : testBaseBrktRefundsApi; 

const oneBrktRefundUrl = url + "/brktRefund/";
const oneBrktUrl = url + "/brkt/";
const oneDivUrl = url + "/div/";
const oneSquadUrl = url + "/squad/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";   

/**
 * Get all brkt refunds for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get brkt refunds for
 * @returns {brktRefundType[] | null} - array of brkt refunds
 */
export const getAllBrktRefundsForTmnt = async (tmntId: string): Promise<brktRefundType[] | null> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null;
    const tmntBrktRefunds = response.data.brktRefunds;
    const brktRefunds: brktRefundType[] = tmntBrktRefunds.map((brktRefund: brktRefundType) => {
      return {
        ...blankBrktRefund,
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,
      }
    });
    return brktRefunds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt refunds for a div
 * 
 * @param {string} divId - id of div to get brkt refunds for
 * @returns {brktRefundType[] | null} - array of brkt refunds
 */
export const getAllBrktRefundsForDiv = async (divId: string): Promise<brktRefundType[] | null> => {
  try {
    if (!isValidBtDbId(divId, "div")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneDivUrl + divId,
    });
    if (response.status !== 200) return null;
    const divBrktRefunds = response.data.brktRefunds;
    const brktRefunds: brktRefundType[] = divBrktRefunds.map((brktRefund: brktRefundType) => {
      return {
        ...blankBrktRefund,
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,
      }
    });
    return brktRefunds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt refunds for a brkt
 * 
 * @param {string} brktId - id of brkt to get brkt refunds for
 * @returns {brktRefundType[] | null} - array of brkt refunds
 */
export const getAllBrktRefundsForBrkt = async (brktId: string): Promise<brktRefundType[] | null> => {
  try {
    if (!isValidBtDbId(brktId, "brk")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneBrktUrl + brktId,
    });
    if (response.status !== 200) return null;
    const dbBrktRefunds = response.data.brktRefunds;
    const brktRefunds: brktRefundType[] = dbBrktRefunds.map((brktRefund: brktRefundType) => {
      return {
        ...blankBrktRefund,
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,
      }
    });
    return brktRefunds;
  } catch (err) {
    return null;
  }
}

/**
 * Get all brkt refunds for a squad
 * 
 * @param {string} squadId - id of squad to get brkt refunds for
 * @returns {brktRefundType[] | null} - array of brkt refunds
 */
export const getAllBrktRefundsForSquad = async (squadId: string): Promise<brktRefundType[] | null> => {
  try {
    if (!isValidBtDbId(squadId, "sqd")) return null;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneSquadUrl + squadId,
    });
    if (response.status !== 200) return null;
    const squadBrktRefunds = response.data.brktRefunds;
    const brktRefunds: brktRefundType[] = squadBrktRefunds.map((brktRefund: brktRefundType) => {
      return {
        ...blankBrktRefund,
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,
      }
    });
    return brktRefunds;
  } catch (err) {
    return null;
  }
}

/**
 * posts a brkt refund
 * 
 * @param {brktRefundType} brktRefund - brktRefund to post
 * @returns {brktRefundType | null} - brktRefund that was posted or null
 */
export const postBrktRefund = async (brktRefund: brktRefundType): Promise<brktRefundType | null> => {
  try {
    if (!brktRefund || !isValidBtDbId(brktRefund.id, "brf")) return null;
    // further sanatation and validation done in POST route
    const brktRefundJSON = JSON.stringify(brktRefund);
    const response = await axios({
      method: "post",
      data: brktRefundJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null;
    const dbBrktRefund = response.data.brktRefund;
    const postedBrktRefund: brktRefundType = {
      ...blankBrktRefund,
      id: dbBrktRefund.id,      
      brkt_id: dbBrktRefund.brkt_id,
      player_id: dbBrktRefund.player_id,
      num_refunds: dbBrktRefund.num_refunds,      
    };
    return postedBrktRefund;
  } catch (err) {
    return null;
  }
}

/**
 * posts many brkt refunds
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds to post
 * @returns {brktRefundType[] | null} - array of brktRefunds that were posted or null
 */
export const postManyBrktRefunds = async (brktRefunds: brktRefundType[]): Promise<brktRefundType[] | null> => {
  try {
    if (!brktRefunds) return null;
    if (brktRefunds.length === 0) return [];
    // further sanatation and validation done in POST route
    const brktRefundJSON = JSON.stringify(brktRefunds);
    const response = await axios({
      method: "post",
      data: brktRefundJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null;
    const dbBrktRefunds = response.data.brktRefunds;
    const postedBrktRefunds: brktRefundType[] = dbBrktRefunds.map((brktRefund: any) => {
      return {
        ...blankBrktRefund,
        id: brktRefund.id,        
        brkt_id: brktRefund.brkt_id,
        player_id: brktRefund.player_id,
        num_refunds: brktRefund.num_refunds,        
      }
    });
    return postedBrktRefunds;
  } catch (err) {
    return null;
  }
}

/**
 * updates a brkt refund
 * 
 * @param {brktRefundType} brktRefund - brktRefund to update
 * @returns {brktRefundType | null} - brktRefund that was updated
 */
export const putBrktRefund = async (brktRefund: brktRefundType): Promise<brktRefundType | null> => {
  try {
    if (!brktRefund || !isValidBtDbId(brktRefund.id, "brf")) return null;
    // further sanatation and validation done in POST route
    const brktRefundJSON = JSON.stringify(brktRefund);
    const response = await axios({
      method: "put",
      data: brktRefundJSON,
      withCredentials: true,
      url: oneBrktRefundUrl + brktRefund.id,
    });
    if (response.status !== 200) return null;
    const dbBrktRefund = response.data.brktRefund;
    const puttedBrktRefund: brktRefundType = {
      ...blankBrktRefund,
      id: dbBrktRefund.id,      
      brkt_id: dbBrktRefund.brkt_id,
      player_id: dbBrktRefund.player_id,
      num_refunds: dbBrktRefund.num_refunds,      
    };
    return puttedBrktRefund;
  } catch (err) {
    return null;
  }
}

/**
 * updates, inserts or deletes many brkt refunds
 * 
 * @param {brktRefundType[]} brktRefunds - array of brktRefunds to update, insert or delete
 * @returns {putManyReturnType | null} - putManyReturnType has how many of each type updated or null 
 */
export const putManyBrktRefunds = async (brktRefunds: brktRefundType[]): Promise<putManyReturnType | null> => {

  try {
    if (!brktRefunds) return null;
    if (brktRefunds.length === 0) return noUpdates;
    for (let i = 0; i < brktRefunds.length; i++) {
      if (!isValidBtDbId(brktRefunds[i].id, "brf")) return null;
    }
    // further sanatation and validation done in PUT route
    const brktEntriesJSON = JSON.stringify(brktRefunds);
    const response = await axios({
      method: "put",
      data: brktEntriesJSON,
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
 * deletes a brkt refund
 * 
 * @param {string} id - id of brkt refund to delete 
 * @returns {number} - 1 if deleted, -1 on failure
 */
export const deleteBrktRefund = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "brf")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneBrktRefundUrl + id,
    });
    return (response.status === 200) ? 1 : -1    
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brkt refunds for a squad
 * 
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 */
export const deleteAllBrktRefundsForSquad = async (squadId: string): Promise<number> => {
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
 * deletes all brkt refunds for a div
 * 
 * @param {string} divId - id of div to delete
 * @returns {number} - number of brkt refunds deleted, -1 on failure
 */
export const deleteAllBrktRefundsForDiv = async (divId: string): Promise<number> => {  
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
 * deletes all brkt refunds for a brkt
 * 
 * @param {string} brktId - id of brkt to delete
 * @returns {number} - number of brkt refunds deleted, -1 on failure
 */
export const deleteAllBrktRefundsForBrkt = async (brktId: string): Promise<number> => {  
  try {
    if (!brktId || !isValidBtDbId(brktId, "brk")) return -1;
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneBrktUrl + brktId,
    });    
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all brkt refunds for a tournament
 * 
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of brkt refunds deleted, -1 on failure
 */
export const deleteAllBrktRefundsForTmnt = async (tmntId: string): Promise<number> => {
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