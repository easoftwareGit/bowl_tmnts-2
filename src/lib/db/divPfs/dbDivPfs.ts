import { privateApi } from "@/lib/api/axios";
import { baseDivPfsApi } from "@/lib/api/apiPaths";
import { testBaseDivPfsApi } from "../../../../test/testApi";
import type { divPfType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankDivPf } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivPfsApi
  ? testBaseDivPfsApi
  : baseDivPfsApi;

const divUrl = url + "/div/";
const oneDivPfUrl = url + "/divPf/";

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
 * get all divPfs for a div
 *
 * @param {string} divId - id of div with divPfs to get
 * @returns {divPfType[]} - array of divPfs
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllDivPfsForDiv = async (divId: string): Promise<divPfType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await privateApi.get(divUrl + divId);

    if (!response.data?.divPfs) {
      throw new Error("Error fetching divPfs");
    }

    return extractDivPfs(response.data.divPfs);
  } catch (err) {
    throw new Error(
      `getAllDivPfsForDiv failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * update all divPfs for a div
 *
 * @param {string} divId - id of div to update divPfs for
 * @param {divPfType[]} divPfs - array of divPfs to update
 * @returns {divPfType[]} - array of updated divPfs
 * @throws {Error} - if divId is invalid or API call fails
 */
export const updateAllDivPfsForDiv = async (divId: string, divPfs: divPfType[]): Promise<divPfType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  if (!Array.isArray(divPfs)) {
    throw new Error("Invalid divPfs array");
  }

  // divPfs.length = 0 is OK - clears all divPfs for a div

  try {
    const divPfsJSON = JSON.stringify(divPfs);
    const response = await privateApi.put(divUrl + divId, divPfsJSON);

    // only check if passed divPfs to update
    if (divPfs.length > 0 && !response.data?.divPfs) {
      throw new Error("Error updating divPfs for div");      
    }

    return response.data.divPfs;
  } catch (err) {
    throw new Error(
      `updateAllDivPfsForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
}
