import { publicApi, privateApi } from "@/lib/api/axios";
import { basePotsApi } from "@/lib/api/apiPaths";
import { testBasePotsApi } from "../../../../test/testApi";
import type { potType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankPot } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePotsApi
  ? testBasePotsApi
  : basePotsApi;

const potUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extracts pots data from GET API response
 *
 * @param {any} pots - array of pots from GET API response
 * @returns {potType[]} - array of pots with extracted data
 */
export const extractPots = (pots: any): potType[] => {
  if (!pots || !Array.isArray(pots)) return [];

  return pots.map((pot: any) => ({
    ...blankPot,
    id: pot.id,
    div_id: pot.div_id,
    squad_id: pot.squad_id,
    pot_type: pot.pot_type,
    fee: pot.fee,
    sort_order: pot.sort_order,
  }));
};

/**
 * maps a single pot from API response
 *
 * @param {any} pot - pot from API response
 * @returns {potType} - extracted pot
 */
const extractPot = (pot: any): potType => ({
  ...blankPot,
  id: pot.id,
  div_id: pot.div_id,
  squad_id: pot.squad_id,
  pot_type: pot.pot_type,
  fee: pot.fee,
  sort_order: pot.sort_order,
});

/**
 * gets all pots for a squad
 *
 * @param {string} squadId - id of squad to get all pots for
 * @returns {potType[]} - pot array
 * @throws {Error} - if squad id is invalid or API call fails
 */
export const getAllPotsForSquad = async (squadId: string): Promise<potType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);

    if (!response.data) {
      throw new Error("No data returned from API");
    }

    return extractPots(response.data.pots);
  } catch (err) {
    throw new Error(
      `getAllPotsForSquad failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * gets all pots for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get all pots for
 * @returns {potType[]} - pot array
 * @throws {Error} - if tmnt id is invalid or API call fails
 */
export const getAllPotsForTmnt = async (tmntId: string): Promise<potType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);

    if (!response.data) {
      throw new Error("No data returned from API");
    }

    return extractPots(response.data.pots);
  } catch (err) {
    throw new Error(
      `getAllPotsForTmnt failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * post a new pot
 *
 * @param {potType} pot - pot to post
 * @returns {potType} - pot object
 * @throws {Error} - if pot is invalid or API call fails
 */
export const postPot = async (pot: potType): Promise<potType> => {
  if (!pot || !isValidBtDbId(pot.id, "pot")) {
    throw new Error("Invalid pot data");
  }

  try {
    // further sanitation and validation done in POST route
    const potJSON = JSON.stringify(pot);
    const response = await privateApi.post(url, potJSON);

    if (!response.data?.pot) {
      throw new Error("Error posting pot");
    }

    return extractPot(response.data.pot);
  } catch (err) {
    throw new Error(`postPot failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * puts a pot
 *
 * @param {potType} pot - pot to update
 * @returns {potType} - pot object
 * @throws {Error} - if pot is invalid or API call fails
 */
export const putPot = async (pot: potType): Promise<potType> => {
  if (!pot || !isValidBtDbId(pot.id, "pot")) {
    throw new Error("Invalid pot data");
  }

  try {
    // further sanitation and validation done in PUT route
    const potJSON = JSON.stringify(pot);
    const response = await privateApi.put(potUrl + pot.id, potJSON);

    if (!response.data?.pot) {
      throw new Error("Error putting pot");
    }

    return extractPot(response.data.pot);
  } catch (err) {
    throw new Error(`putPot failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * deletes a pot
 *
 * @param {string} id - the id of the pot to delete
 * @returns {number} - 1 if successful
 * @throws {Error} - if id is invalid or API call fails
 */
export const deletePot = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "pot")) {
    throw new Error("Invalid pot id");
  }

  try {
    const response = await privateApi.delete(potUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting pot");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deletePot failed: ${err instanceof Error ? err.message : err}`
    );
  }
};