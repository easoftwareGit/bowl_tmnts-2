import { publicApi, privateApi } from "@/lib/api/axios";
import { baseOneBrktsApi } from "@/lib/api/apiPaths";
import { testBaseOneBrktsApi } from "../../../../test/testApi";
import type { oneBrktType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankOneBrkt } from "../initVals";

const url = testBaseOneBrktsApi.startsWith("undefined")
  ? baseOneBrktsApi
  : testBaseOneBrktsApi;

const oneOneBrktUrl = url + "/oneBrkt/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * Extract oneBrkts from GET API response
 *
 * @param {any} oneBrkts - array of oneBrkts from GET API response
 * @returns {oneBrktType[]} - array of oneBrkts
 */
export const extractOneBrkts = (oneBrkts: any): oneBrktType[] => {
  if (!oneBrkts || !Array.isArray(oneBrkts)) return [];

  return oneBrkts.map((oneBrkt: any) => ({
    ...blankOneBrkt,
    id: oneBrkt.id,
    brkt_id: oneBrkt.brkt_id,
    bindex: oneBrkt.bindex,
  }));
};

/**
 * Get all oneBrkts for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for tmnt
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllOneBrktsForTmnt = async (
  tmntId: string
): Promise<oneBrktType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data?.oneBrkts) {
      throw new Error("Error fetching oneBrkts");
    }

    return extractOneBrkts(response.data.oneBrkts);
  } catch (err) {
    throw new Error(
      `getAllOneBrktsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all oneBrkts for a squad
 *
 * @param {string} squadId - id of squad to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for squad
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllOneBrktsForSquad = async (
  squadId: string
): Promise<oneBrktType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);

    if (!response.data?.oneBrkts) {
      throw new Error("Error fetching oneBrkts");
    }

    return extractOneBrkts(response.data.oneBrkts);
  } catch (err) {
    throw new Error(
      `getAllOneBrktsForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all oneBrkts for a div
 *
 * @param {string} divId - id of div to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for div
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllOneBrktsForDiv = async (
  divId: string
): Promise<oneBrktType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await publicApi.get(divUrl + divId);

    if (!response.data?.oneBrkts) {
      throw new Error("Error fetching oneBrkts");
    }

    return extractOneBrkts(response.data.oneBrkts);
  } catch (err) {
    throw new Error(
      `getAllOneBrktsForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all oneBrkts for a brkt
 *
 * @param {string} brktId - id of brkt to get oneBrkts for
 * @returns {oneBrktType[]} - array of oneBrkts for brkt
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const getAllOneBrktsForBrkt = async (
  brktId: string
): Promise<oneBrktType[]> => {
  if (!isValidBtDbId(brktId, "brk")) {
    throw new Error("Invalid brkt id");
  }

  try {
    const response = await publicApi.get(brktUrl + brktId);

    if (!response.data?.oneBrkts) {
      throw new Error("Error fetching oneBrkts");
    }

    return extractOneBrkts(response.data.oneBrkts);
  } catch (err) {
    throw new Error(
      `getAllOneBrktsForBrkt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get one oneBrkt
 *
 * @param {string} oneBrktId - id of oneBrkt to get
 * @returns {oneBrktType} - oneBrkt
 * @throws {Error} - if oneBrktId is invalid or API call fails
 */
export const getOneBrkt = async (oneBrktId: string): Promise<oneBrktType> => {
  if (!isValidBtDbId(oneBrktId, "obk")) {
    throw new Error("Invalid oneBrkt id");
  }

  try {
    const response = await publicApi.get(oneOneBrktUrl + oneBrktId);

    if (!response.data?.oneBrkt) {
      throw new Error("Error fetching oneBrkt");
    }

    const dbOneBrkt = response.data.oneBrkt;

    return {
      ...blankOneBrkt,
      id: dbOneBrkt.id,
      brkt_id: dbOneBrkt.brkt_id,
      bindex: dbOneBrkt.bindex,
    };
  } catch (err) {
    throw new Error(
      `getOneBrkt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * posts one oneBrkt
 *
 * @param {oneBrktType} oneBrkt - oneBrkt to post
 * @returns {oneBrktType} - oneBrkt that was posted
 * @throws {Error} - if oneBrkt is invalid or API call fails
 */
export const postOneBrkt = async (
  oneBrkt: oneBrktType
): Promise<oneBrktType> => {
  if (!oneBrkt || !isValidBtDbId(oneBrkt.id, "obk")) {
    throw new Error("Invalid oneBrkt data");
  }

  try {
    const oneBrktJSON = JSON.stringify(oneBrkt);
    const response = await privateApi.post(url, oneBrktJSON);

    if (!response.data?.oneBrkt) {
      throw new Error("Error posting oneBrkt");
    }

    return response.data.oneBrkt;
  } catch (err) {
    throw new Error(
      `postOneBrkt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * deletes oneBrkt
 *
 * @param {string} id - id of oneBrkt to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteOneBrkt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "obk")) {
    throw new Error("Invalid oneBrkt id");
  }

  try {
    const response = await privateApi.delete(oneOneBrktUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting oneBrkt");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteOneBrkt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};