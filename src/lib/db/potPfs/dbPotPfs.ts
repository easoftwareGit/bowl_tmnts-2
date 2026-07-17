import { privateApi } from "@/lib/api/axios";
import { basePotPfsApi } from "@/lib/api/apiPaths";
import { testBasePotPfsApi } from "../../../../test/testApi";
import type { potPfType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankPotPf } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePotPfsApi
  ? testBasePotPfsApi
  : basePotPfsApi;

const potUrl = url + "/pot/";
const onePotPfUrl = url + "/potPf/";

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
 * @param {any} potPfs - array of potPfs from GET API response
 * @returns {potPfType[]} - array of potPfs
 */
export const extractPotPfs = (potPfs: any): potPfType[] => {
  if (potPfs == null || !Array.isArray(potPfs)) return [];
  return potPfs.map((potPf: any) => mapPotPf(potPf));
};

/**
 * get all potPfs for a pot
 *
 * @param {string} potId - id of pot with potPfs to get
 * @returns {potPfType[]} - array of potPfs
 * @throws {Error} - if potId is invalid or API call fails
 */
export const getAllPotPfsForPot = async (potId: string): Promise<potPfType[]> => {
  if (!isValidBtDbId(potId, "pot")) {
    throw new Error("Invalid pot id");
  }

  try {
    const response = await privateApi.get(potUrl + potId);

    if (!response.data?.potPfs) {
      throw new Error("Error fetching potPfs");
    }

    return extractPotPfs(response.data.potPfs);
  } catch (err) {
    throw new Error(
      `getAllPotPfsForPot failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * update all potPfs for a pot
 *
 * @param {string} potId - id of pot to update potPfs for
 * @param {potPfType[]} potPfs - array of potPfs to update
 * @returns {potPfType[]} - array of updated potPfs
 * @throws {Error} - if potId is invalid or API call fails
 */
export const updateAllPotPfsForPot = async (potId: string, potPfs: potPfType[]): Promise<potPfType[]> => {
  if (!isValidBtDbId(potId, "pot")) {
    throw new Error("Invalid pot id");
  }
  if (!Array.isArray(potPfs)) {
    throw new Error("Invalid potPfs array");
  }

  // potPfs.length = 0 is OK - clears all potPfs for a pot

  try {
    const potPfsJSON = JSON.stringify(potPfs);
    const response = await privateApi.put(potUrl + potId, potPfsJSON);

    // only check if passed potPfs to update
    if (potPfs.length > 0 && !response.data?.potPfs) {
      throw new Error("Error updating potPfs for pot");      
    }

    return response.data.potPfs;
  } catch (err) {
    throw new Error(
      `updateAllPotPfsForPot failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
}
