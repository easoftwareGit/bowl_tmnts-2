import { publicApi, privateApi } from "@/lib/api/axios";
import { basePotEntriesApi } from "@/lib/api/apiPaths";
import { testBasePotEntriesApi } from "../../../../test/testApi";
import type { potEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankPotEntry } from "../initVals";

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi;

const divUrl = url + "/div/";
const potEntryUrl = url + "/potEntry/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * Extracts potEntries from GET API response
 *
 * @param {unknown} potEntries - array of potEntries from GET API response
 * @returns {potEntryType[]} - array of potEntries with extracted data
 */
export const extractPotEntries = (potEntries: unknown): potEntryType[] => {
  if (!Array.isArray(potEntries)) return [];

  return potEntries.map((potEntry: any) => ({
    ...blankPotEntry,
    id: potEntry.id,
    pot_id: potEntry.pot_id,
    player_id: potEntry.player_id,
    fee: potEntry.fee + "",
  }));
};

/**
 * Get all pot entries for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get pot entries for
 * @returns {potEntryType[]} - array of pot entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllPotEntriesForTmnt = async (
  tmntId: string
): Promise<potEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);
    return extractPotEntries(response.data?.potEntries);
  } catch (err) {
    throw new Error(
      `getAllPotEntriesForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all pot entries for a div
 *
 * @param {string} divId - id of div to get pot entries for
 * @returns {potEntryType[]} - array of pot entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllPotEntriesForDiv = async (
  divId: string
): Promise<potEntryType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await publicApi.get(divUrl + divId);
    return extractPotEntries(response.data?.potEntries);
  } catch (err) {
    throw new Error(
      `getAllPotEntriesForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all pot entries for a squad
 *
 * @param {string} squadId - id of squad to get pot entries for
 * @returns {potEntryType[]} - array of pot entries
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllPotEntriesForSquad = async (
  squadId: string
): Promise<potEntryType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);
    return extractPotEntries(response.data?.potEntries);
  } catch (err) {
    throw new Error(
      `getAllPotEntriesForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * posts a pot entry
 *
 * @param {potEntryType} potEntry - potEntry to post
 * @returns {potEntryType} - potEntry that was posted
 * @throws {Error} - if potEntry is invalid or API call fails
 */
export const postPotEntry = async (
  potEntry: potEntryType
): Promise<potEntryType> => {
  if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) {
    throw new Error("Invalid potEntry data");
  }

  try {
    // further sanitation and validation done in POST route
    const response = await privateApi.post(url, JSON.stringify(potEntry));

    if (!response.data?.potEntry) {
      throw new Error("Error posting potEntry");
    }

    return response.data.potEntry;
  } catch (err) {
    throw new Error(
      `postPotEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * puts a pot entry
 *
 * @param {potEntryType} potEntry - potEntry to update
 * @returns {potEntryType} - potEntry that was updated
 * @throws {Error} - if potEntry is invalid or API call fails
 */
export const putPotEntry = async (
  potEntry: potEntryType
): Promise<potEntryType> => {
  if (!potEntry || !isValidBtDbId(potEntry.id, "pen")) {
    throw new Error("Invalid potEntry data");
  }

  try {
    // further sanitation and validation done in PUT route
    const response = await privateApi.put(
      potEntryUrl + potEntry.id,
      JSON.stringify(potEntry)
    );

    if (!response.data?.potEntry) {
      throw new Error("Error putting potEntry");
    }

    const dbPotEntry = response.data.potEntry;
    return {
      ...blankPotEntry,
      id: dbPotEntry.id,
      pot_id: dbPotEntry.pot_id,
      player_id: dbPotEntry.player_id,
      fee: dbPotEntry.fee,
    };
  } catch (err) {
    throw new Error(
      `putPotEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * deletes a pot entry
 *
 * @param {string} id - id of pot entry to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deletePotEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "pen")) {
    throw new Error("Invalid potEntry id");
  }

  try {
    const response = await privateApi.delete(potEntryUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting potEntry");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deletePotEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
};
