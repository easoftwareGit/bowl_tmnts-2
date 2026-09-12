import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../../test/testApi";
import type {
  divPfSaveDataType,
  divPfType,
  tmntDivPfSaveDataType,
} from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankDivPf } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;

const tmntUrl = url + "/tmnt/";

/**
 * maps API value to app divPf
 *
 * @param {unknown} value - value from API response
 * @returns {divPfType} mapped divPf
 */
const mapDivPf = (value: unknown): divPfType => {
  const obj = value as Record<string, unknown>;
  return {
    ...blankDivPf,
    id: String(obj.id ?? ""),
    div_id: String(obj.div_id ?? ""),
    position: obj.position == null ? null : Number(obj.position),
    amount: obj.amount == null ? null : Number(obj.amount),
  }
};

/**
 * extract divPf data from GET API response
 *
 * @param {any} divPfs - array of divPfs from GET API response
 * @returns {divPfType[]} - array of divPfs
 */
export const extractDivPfs = (divPfs: any): divPfType[] => {
  if (divPfs == null || !Array.isArray(divPfs)) return [];
  return divPfs.map((divPf: any) => mapDivPf(divPf));
};

/**
 * get all divPfs for a tmnt
 *
 * @param {string} tmntId - id of tmnt with divPfs to get
 * @returns {divPfType[]} - array of divPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllDivPfsForTmnt = async (tmntId: string): Promise<divPfType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await privateApi.get(tmntUrl + tmntId);

    if (!response.data?.divPfs) {
      throw new Error("Error fetching divPfs");
    }

    return extractDivPfs(response.data.divPfs);
  } catch (err) {
    throw new Error(
      `getAllDivPfsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * update all divPfs for a tmnt
 * 
 * @param {tmntDivPfSaveDataType} dataToUpdate - data to update
 * - tmntId: id of tmnt to update divPfs for
 * - divIds: array of valid divIds in divPfs
 * - divPfData: array of divPfs to update
 * @returns {divPfType[]} - array of updated divPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */

export const updateAllDivPfsForTmnt = async (
  dataToUpdate: tmntDivPfSaveDataType
): Promise<divPfType[]> => {

  if (!isValidBtDbId(dataToUpdate.tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }
  if (!Array.isArray(dataToUpdate.divIds)) {
    throw new Error("Invalid divIds array");
  }
  if (!Array.isArray(dataToUpdate.divPfData)) {
    throw new Error("Invalid divPfs array");
  }
  try {
    const tmntDivPfData: divPfSaveDataType = {
      divPfData: dataToUpdate.divPfData,
      divIds: dataToUpdate.divIds
    }
    const divPfJSON = JSON.stringify(tmntDivPfData);
    const response = await privateApi.put(tmntUrl + dataToUpdate.tmntId, divPfJSON);    

    // only check if passed divPfs to update
    if (dataToUpdate.divPfData.length > 0 && !response.data?.divPfs) {
      throw new Error("Error updating divPfs for tmnt");
    }

    return response.data.divPfs;
  } catch (err) {
    throw new Error(
      `updateAllDivPfsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
}
