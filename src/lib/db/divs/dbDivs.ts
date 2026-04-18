import { publicApi, privateApi } from "@/lib/api/axios";
import { baseDivsApi } from "@/lib/api/apiPaths";
import { testBaseDivsApi } from "../../../../test/testApi";
import type { divType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { blankDiv } from "../initVals";
import { validateDivs } from "@/lib/validation/divs/validate";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseDivsApi
  ? testBaseDivsApi
  : baseDivsApi;

const divUrl = url + "/div/";
const manyUrl = url + "/many";
const tmntUrl = url + "/tmnt/";

/**
 * maps API div to app div
 *
 * @param {any} div - div from API response
 * @returns {divType} mapped div
 */
const mapDiv = (div: any): divType => ({
  ...blankDiv,
  id: div.id,
  tmnt_id: div.tmnt_id,
  div_name: div.div_name,
  tab_title: div.div_name,
  hdcp_per: div.hdcp_per,
  hdcp_per_str: (div.hdcp_per * 100).toFixed(2),
  hdcp_from: div.hdcp_from,
  int_hdcp: div.int_hdcp,
  hdcp_for: div.hdcp_for,
  sort_order: div.sort_order,
});

/**
 * extract div data from GET API response
 *
 * @param {any} divs - array of divs from GET API response
 * @returns {divType[]} - array of divs
 */
export const extractDivs = (divs: any): divType[] => {
  if (!divs || !Array.isArray(divs)) return [];
  return divs.map((div: any) => mapDiv(div));
};

/**
 * get all divs for a tmnt
 *
 * @param {string} tmntId - id of tmnt with divs to get
 * @returns {divType[]} - array of divs
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllDivsForTmnt = async (tmntId: string): Promise<divType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data?.divs) {
      throw new Error("Error fetching divs");
    }

    return extractDivs(response.data.divs);
  } catch (err) {
    throw new Error(
      `getAllDivsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * posts a div
 *
 * @param {divType} div - div to post
 * @returns {divType | null} - div posted or null
 * @throws {Error} - if div is invalid or API call fails
 */
export const postDiv = async (div: divType): Promise<divType | null> => {
  if (!div || !isValidBtDbId(div.id, "div")) {
    throw new Error("Invalid div data");
  }

  try {
    // further sanitation and validation done in POST route
    const divJSON = JSON.stringify(div);
    const response = await privateApi.post(url, divJSON);

    if (!response.data?.div) {
      throw new Error("Error posting div");
    }

    return mapDiv(response.data.div);
  } catch (err) {
    throw new Error(`postDiv failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * post many divs
 *
 * @param {divType[]} divs - array of divs to post
 * @returns {number} - number of divs posted
 * @throws {Error} - if divs are invalid or API call fails
 */
export const postManyDivs = async (divs: divType[]): Promise<number> => {
  if (!divs || !Array.isArray(divs)) {
    throw new Error("Invalid div data");
  }
  if (divs.length === 0) return 0;

  const validDivs = validateDivs(divs);
  if (
    validDivs.errorCode !== ErrorCode.NONE ||
    validDivs.divs.length !== divs.length
  ) {
    if (validDivs.divs.length === 0) {
      throw new Error("Invalid div data at index 0");
    }

    const errorIndex = divs.findIndex((div) => !isValidBtDbId(div.id, "div"));
    if (errorIndex < 0) {
      throw new Error(`Invalid div data at index ${validDivs.divs.length}`);
    } else {
      throw new Error(`Invalid div data at index ${errorIndex}`);
    }
  }

  try {
    const divsJSON = JSON.stringify(divs);
    const response = await privateApi.post(manyUrl, divsJSON);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error posting divs");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `postManyDivs failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * puts a div
 *
 * @param {divType} div - div to put
 * @returns {divType | null} - div put
 * @throws {Error} - if div is invalid or API call fails
 */
export const putDiv = async (div: divType): Promise<divType | null> => {
  if (!div || !isValidBtDbId(div.id, "div")) {
    throw new Error("Invalid div data");
  }

  try {
    // further sanitation and validation done in PUT route
    const divJSON = JSON.stringify(div);
    const response = await privateApi.put(divUrl + div.id, divJSON);

    if (!response.data?.div) {
      throw new Error("Error putting div");
    }

    return mapDiv(response.data.div);
  } catch (err) {
    throw new Error(`putDiv failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * deletes a div
 *
 * @param {string} id - id of div to delete
 * @returns {number} - number of rows deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteDiv = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await privateApi.delete(divUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting div");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteDiv failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * deletes all divs for a tmnt
 *
 * @param {string} tmntId - id of tmnt with divs to delete
 * @returns {number} - number of rows deleted
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const deleteAllDivsForTmnt = async (
  tmntId: string
): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await privateApi.delete(tmntUrl + tmntId);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting divs for tmnt");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteAllDivsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};