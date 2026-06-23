import { publicApi, privateApi } from "@/lib/api/axios";
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
 * maps API divPf to app divPf
 *
 * @param {any} divPf - divPf from API response
 * @returns {divPfType} mapped divPf
 */
const mapDivPf = (divPf: any): divPfType => ({
  ...blankDivPf,
  id: divPf.id,
  div_id: divPf.div_id,
  position: divPf.position,
  amount: Number(divPf.amount),
});

/**
 * extract divPf data from GET API response
 *
 * @param {any} divPfs - array of divPfs from GET API response
 * @returns {divPfType[]} - array of divPfs
 */
export const extractDivPfs = (divPfs: any): divPfType[] => {
  if (!divPfs || !Array.isArray(divPfs)) return [];
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
    const response = await publicApi.get(divUrl + divId);

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
