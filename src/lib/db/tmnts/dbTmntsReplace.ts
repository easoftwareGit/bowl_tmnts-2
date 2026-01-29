import axios from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../../test/testApi";
import { tmntFullType } from "@/lib/types/types";
import { ErrorCode } from "@/lib/validation/validation";
import { validateFullTmnt } from "@/app/api/tmnts/full/validate";

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;   
const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";

/**
 * replaces full tmnt data, tmnt table and all child/grandchild tables
 * 
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<boolean>} - true on success or throws error 
 */
export const replaceTmntFullData = async (
  tmntFullData: tmntFullType
): Promise<boolean> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {      
    throw new Error("invalid tmntFullData data");
  }
  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }
  
  let response;
  try { 
    const tmntJSON = JSON.stringify(tmntFullData);
    response = await axios.put(fullUrl + tmntFullData.tmnt.id, tmntJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`replaceTmntFullData failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.success) {
    throw new Error("Error replacing full tmnt");
  }
  return response.data.success;
};

/**
 * replaces full tmnt entries data
 * replaces players, divEntries, potEntries, brktEntries, brktRefunds, 
 * onebrkts, brktSeeds, and elimEntries
 * DOES NOT replace tmnt, events, divs, squads, lanes, pots, brkts, or elims
 * 
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<boolean>} - true on success or throws error 
 */
export const replaceTmntEntriesData = async (
  tmntFullData: tmntFullType
): Promise<boolean> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {      
    throw new Error("invalid tmntFullData data");
  }
  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }
  
  let response;
  try { 
    const tmntJSON = JSON.stringify(tmntFullData);
    response = await axios.put(fullEntriesUrl + tmntFullData.tmnt.id, tmntJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`replaceTmntFullEntriesData failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.success) {
    throw new Error("Error replacing full tmnt entries");
  }
  return response.data.success;
};
