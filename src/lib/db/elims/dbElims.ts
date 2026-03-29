import { publicApi, privateApi } from "@/lib/api/axios";
import { baseElimsApi } from "@/lib/api/apiPaths";
import { testBaseElimsApi } from "../../../../test/testApi";
import type { elimType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankElim } from "../initVals";

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;
const elimUrl = url + "/elim/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extract elim data from GET API response
 *
 * @param {any} elims - array of elims from GET API response
 * @returns {elimType[]} - array of elims with extracted data
 */
export const extractElims = (elims: any): elimType[] => {
  if (!elims || !Array.isArray(elims)) return [];

  return elims.map((elim: any) => ({
    ...blankElim,
    id: elim.id,
    div_id: elim.div_id,
    squad_id: elim.squad_id,
    start: elim.start,
    games: elim.games,
    fee: elim.fee,
    sort_order: elim.sort_order,
  }));
};

/**
 * get all elims for a squad
 *
 * @param {string} squadId - id of squad to get all elims for
 * @returns {elimType[]} - array of elims
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllElimsForSquad = async (squadId: string): Promise<elimType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  let response;
  try {
    response = await publicApi.get(squadUrl + squadId);
  } catch (err) {
    throw new Error(
      `getAllElimsForSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }

  return extractElims(response.data?.elims);
};

/**
 * get all elims for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get all elims for
 * @returns {elimType[]} - array of elims
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllElimsForTmnt = async (tmntId: string): Promise<elimType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  let response;
  try {
    response = await publicApi.get(tmntUrl + tmntId);
  } catch (err) {
    throw new Error(
      `getAllElimsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }

  return extractElims(response.data?.elims);
};

/**
 * post a new elim
 *
 * @param {elimType} elim - elim to post
 * @returns {elimType} - posted elim
 * @throws {Error} - if elim is invalid or API call fails
 */
export const postElim = async (elim: elimType): Promise<elimType> => {
  if (!elim || !isValidBtDbId(elim.id, "elm")) {
    throw new Error("Invalid elim data");
  }

  let response;
  try {
    const elimJSON = JSON.stringify(elim);
    response = await privateApi.post(url, elimJSON);
  } catch (err) {
    throw new Error(
      `postElim failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.elim) {
    throw new Error("Error posting elim");
  }

  const dbElim = response.data.elim;
  const postedElim: elimType = {
    ...blankElim,
    id: dbElim.id,
    div_id: dbElim.div_id,
    squad_id: dbElim.squad_id,
    start: dbElim.start,
    games: dbElim.games,
    fee: dbElim.fee,
    sort_order: dbElim.sort_order,
  };

  return postedElim;
};

/**
 * update an elim
 *
 * @param {elimType} elim - elim to update
 * @returns {elimType} - updated elim
 * @throws {Error} - if elim is invalid or API call fails
 */
export const putElim = async (elim: elimType): Promise<elimType> => {
  if (!elim || !isValidBtDbId(elim.id, "elm")) {
    throw new Error("Invalid elim data");
  }

  let response;
  try {
    const elimJSON = JSON.stringify(elim);
    response = await privateApi.put(elimUrl + elim.id, elimJSON);
  } catch (err) {
    throw new Error(
      `putElim failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.elim) {
    throw new Error("Error putting elim");
  }

  const dbElim = response.data.elim;
  const puttedElim: elimType = {
    ...blankElim,
    id: dbElim.id,
    div_id: dbElim.div_id,
    squad_id: dbElim.squad_id,
    start: dbElim.start,
    games: dbElim.games,
    fee: dbElim.fee,
    sort_order: dbElim.sort_order,
  };

  return puttedElim;
};

/**
 * delete an elim
 *
 * @param {string} id - id of elim to delete
 * @returns {number} - 1 if success
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteElim = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "elm")) {
    throw new Error("Invalid elim id");
  }

  let response;
  try {
    response = await privateApi.delete(elimUrl + id);
  } catch (err) {
    throw new Error(
      `deleteElim failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (typeof response.data?.count !== "number") {
    throw new Error("Error deleting elim");
  }

  return response.data.count;
};