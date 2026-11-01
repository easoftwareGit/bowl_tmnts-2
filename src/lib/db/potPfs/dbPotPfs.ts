import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../../test/testApi";
import type {
  potPfSaveDataType,
  potPfType,
  tmntPotPfSaveDataType,
} from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankPotPf } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;

const tmntUrl = url + "/tmnt/";

/**
 * maps API value to app potPf
 *
 * @param {unknown} value - value from API response
 * @returns {potPfType} mapped potPf
 */
const mapPotPf = (value: unknown): potPfType => {
  const obj = value as Record<string, unknown>;
  return {
    ...blankPotPf,
    id: String(obj.id ?? ""),
    pot_id: String(obj.pot_id ?? ""),
    position: obj.position == null ? null : Number(obj.position),
    amount: obj.amount == null ? null : Number(obj.amount),
  }
};

/**
 * extract potPf data from GET API response
 *
 * @param {unknown} potPfs - array of potPfs from GET API response
 * @returns {potPfType[]} - array of potPfs
 */
export const extractPotPfs = (potPfs: unknown): potPfType[] => {
  if (potPfs == null || !Array.isArray(potPfs)) return [];
  return potPfs.map((potPf: unknown) => mapPotPf(potPf));
};

/**
 * get all potPfs for a tmnt
 *
 * @param {string} tmntId - id of tmnt with potPfs to get
 * @returns {potPfType[]} - array of potPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllPotPfsForTmnt = async (tmntId: string): Promise<potPfType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await privateApi.get(tmntUrl + tmntId);

    if (!response.data?.potPfs) {
      throw new Error("Error fetching potPfs");
    }

    return extractPotPfs(response.data.potPfs);
  } catch (err) {
    throw new Error(
      `getAllPotPfsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * update all potPfs for a tmnt
 * 
 * @param {tmntPotPfSaveDataType} dataToUpdate - data to update
 * - tmntId: id of tmnt to update potPfs for
 * - potIds: array of valid potIds in potPfs
 * - potPfData: array of potPfs to update
 * @returns {potPfType[]} - array of updated potPfs
 * @throws {Error} - if tmntId is invalid or API call fails
 */

export const updateAllPotPfsForTmnt = async (
  dataToUpdate: tmntPotPfSaveDataType
): Promise<potPfType[]> => {

  if (!isValidBtDbId(dataToUpdate.tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }
  if (!Array.isArray(dataToUpdate.potIds)) {
    throw new Error("Invalid potIds array");
  }
  if (!Array.isArray(dataToUpdate.potPfData)) {
    throw new Error("Invalid potPfs array");
  }
  try {
    const tmntPotPfData: potPfSaveDataType = {
      potPfData: dataToUpdate.potPfData,
      potIds: dataToUpdate.potIds
    }
    const potPfJSON = JSON.stringify(tmntPotPfData);
    const response = await privateApi.put(tmntUrl + dataToUpdate.tmntId, potPfJSON);    

    // the API always sends back an array, even when potPfData is empty
    if (!Array.isArray(response.data?.potPfs)) {
      throw new Error("Error updating potPfs for tmnt");
    }

    return extractPotPfs(response.data.potPfs);
  } catch (err) {
    throw new Error(
      `updateAllPotPfsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
}
