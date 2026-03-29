import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktsApi } from "@/lib/api/apiPaths";
import { testBaseBrktsApi } from "../../../../test/testApi";
import type { brktType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankBrkt } from "../initVals";

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;

const oneBrktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extract brkt data from GET API response
 *
 * @param {any} brkts - array of brkts from GET API response
 * @returns {brktType[]} - array of brkts
 */
export const extractBrkts = (brkts: any): brktType[] => {
  if (!brkts || !Array.isArray(brkts)) return [];

  return brkts.map((brkt: any) => ({
    ...blankBrkt,
    id: brkt.id,
    squad_id: brkt.squad_id,
    div_id: brkt.div_id,
    start: brkt.start,
    games: brkt.games,
    players: brkt.players,
    fee: brkt.fee,
    first: brkt.first,
    second: brkt.second,
    admin: brkt.admin,
    fsa: (Number(brkt.fee) * brkt.players).toString(),
    sort_order: brkt.sort_order,
  }));
};

/**
 * extract single brkt from API response
 *
 * @param {any} dbBrkt - brkt from API response
 * @returns {brktType} - brkt object
 */
const extractBrkt = (dbBrkt: any): brktType => ({
  ...blankBrkt,
  id: dbBrkt.id,
  squad_id: dbBrkt.squad_id,
  div_id: dbBrkt.div_id,
  start: dbBrkt.start,
  games: dbBrkt.games,
  players: dbBrkt.players,
  fee: dbBrkt.fee,
  first: dbBrkt.first,
  second: dbBrkt.second,
  admin: dbBrkt.admin,
  fsa: dbBrkt.fsa,
  sort_order: dbBrkt.sort_order,
});

/**
 * get all brkts for tmnt
 *
 * @param {string} tmntId - id of tmnt to get brkts for
 * @returns {brktType[]} - array of brkts
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllBrktsForTmnt = async (tmntId: string): Promise<brktType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data?.brkts) {
      throw new Error("Error fetching brkts");
    }

    return extractBrkts(response.data.brkts);
  } catch (err) {
    throw new Error(
      `getAllBrktsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * get all brkts for squad
 *
 * @param {string} squadId - id of squad to get brkts for
 * @returns {brktType[]} - array of brkts
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllBrktsForSquad = async (
  squadId: string
): Promise<brktType[] | null> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);

    if (!response.data?.brkts) {
      throw new Error("Error fetching brkts");
    }

    return extractBrkts(response.data.brkts);
  } catch (err) {
    throw new Error(
      `getAllBrktsForSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * get all brkts for div
 *
 * @param {string} divId - id of div to get brkts for
 * @returns {brktType[]} - array of brkts
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllBrktsForDiv = async (
  divId: string
): Promise<brktType[] | null> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await publicApi.get(divUrl + divId);

    if (!response.data?.brkts) {
      throw new Error("Error fetching brkts");
    }

    return extractBrkts(response.data.brkts);
  } catch (err) {
    throw new Error(
      `getAllBrktsForDiv failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * post a new brkt
 *
 * @param {brktType} brkt - bracket to post
 * @returns {brktType} - brkt object
 * @throws {Error} - if brkt is invalid or API call fails
 */
export const postBrkt = async (brkt: brktType): Promise<brktType> => {
  if (!brkt || !isValidBtDbId(brkt.id, "brk")) {
    throw new Error("Invalid brkt data");
  }

  try {
    // further sanitation and validation done in POST route
    const brktJSON = JSON.stringify(brkt);
    const response = await privateApi.post(url, brktJSON);

    if (!response.data?.brkt) {
      throw new Error("Error posting brkt");
    }

    return extractBrkt(response.data.brkt);
  } catch (err) {
    throw new Error(`postBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * updates a brkt
 *
 * @param {brktType} brkt - brkt to update
 * @returns {brktType | null} - brkt object
 * @throws {Error} - if brkt is invalid or API call fails
 */
export const putBrkt = async (brkt: brktType): Promise<brktType | null> => {
  if (!brkt || !isValidBtDbId(brkt.id, "brk")) {
    throw new Error("Invalid brkt data");
  }

  try {
    // further sanitation and validation done in PUT route
    const brktJSON = JSON.stringify(brkt);
    const response = await privateApi.put(oneBrktUrl + brkt.id, brktJSON);

    if (!response.data?.brkt) {
      throw new Error("Error putting brkt");
    }

    return extractBrkt(response.data.brkt);
  } catch (err) {
    throw new Error(`putBrkt failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * delete a brkt
 *
 * @param {string} id - id of brkt to delete
 * @returns {number} - count of deleted records
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteBrkt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "brk")) {
    throw new Error("Invalid brkt id");
  }

  try {
    const response = await privateApi.delete(oneBrktUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting brkt");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteBrkt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};