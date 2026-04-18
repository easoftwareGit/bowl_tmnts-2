import { publicApi, privateApi } from "@/lib/api/axios";
import { baseElimEntriesApi } from "@/lib/api/apiPaths";
import { testBaseElimEntriesApi } from "../../../../test/testApi";
import type { elimEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankElimEntry } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseElimEntriesApi
  ? testBaseElimEntriesApi
  : baseElimEntriesApi;

const elimEntryUrl = url + "/elimEntry/";
const elimUrl = url + "/elim/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

export const extractElimEntries = (elimEntries: any): elimEntryType[] => {
  if (!elimEntries || !Array.isArray(elimEntries)) return [];

  return elimEntries.map((elimEntry: any) => ({
    ...blankElimEntry,
    id: elimEntry.id,
    elim_id: elimEntry.elim_id,
    player_id: elimEntry.player_id,
    fee: elimEntry.fee + "",
  }));
};

/**
 * Get all elim entries for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllElimEntriesForTmnt = async (
  tmntId: string
): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  let response;
  try {
    response = await publicApi.get(tmntUrl + tmntId);
  } catch (err) {
    throw new Error(
      `getAllElimEntriesForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  return extractElimEntries(response.data?.elimEntries);
};

/**
 * Get all elim entries for a div
 *
 * @param {string} divId - id of div to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllElimEntriesForDiv = async (
  divId: string
): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  let response;
  try {
    response = await publicApi.get(divUrl + divId);
  } catch (err) {
    throw new Error(
      `getAllElimEntriesForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  return extractElimEntries(response.data?.elimEntries);
};

/**
 * Get all elim entries for a elim
 *
 * @param {string} elimId - id of elim to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if elimId is invalid or API call fails
 */
export const getAllElimEntriesForElim = async (
  elimId: string
): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(elimId, "elm")) {
    throw new Error("Invalid elim id");
  }

  let response;
  try {
    response = await publicApi.get(elimUrl + elimId);
  } catch (err) {
    throw new Error(
      `getAllElimEntriesForElim failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  return extractElimEntries(response.data?.elimEntries);
};

/**
 * Get all elim entries for a squad
 *
 * @param {string} squadId - id of squad to get elim entries for
 * @returns {elimEntryType[]} - array of elim entries
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllElimEntriesForSquad = async (
  squadId: string
): Promise<elimEntryType[]> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  let response;
  try {
    response = await publicApi.get(squadUrl + squadId);
  } catch (err) {
    throw new Error(
      `getAllElimEntriesForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }

  return extractElimEntries(response.data?.elimEntries);
};

/**
 * posts a elim entry
 *
 * @param {elimEntryType} elimEntry - elimEntry to post
 * @returns {elimEntryType} - elimEntry that was posted
 * @throws {Error} - if elimEntry is invalid or API call fails
 */
export const postElimEntry = async (
  elimEntry: elimEntryType
): Promise<elimEntryType> => {
  if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) {
    throw new Error("Invalid elimEntry data");
  }

  let response;
  try {
    const elimEntryJSON = JSON.stringify(elimEntry);
    response = await privateApi.post(url, elimEntryJSON);
  } catch (err) {
    throw new Error(
      `postElimEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.elimEntry) {
    throw new Error("Error posting elimEntry");
  }

  const dbElimEntry = response.data.elimEntry;
  return {
    ...blankElimEntry,
    id: dbElimEntry.id,
    elim_id: dbElimEntry.elim_id,
    player_id: dbElimEntry.player_id,
    fee: dbElimEntry.fee,
  };
};

/**
 * updates a elim entry
 *
 * @param {elimEntryType} elimEntry - elimEntry to update
 * @returns {elimEntryType | null} - elimEntry that was updated
 * @throws {Error} - if elimEntry is invalid or API call fails
 */
export const putElimEntry = async (
  elimEntry: elimEntryType
): Promise<elimEntryType | null> => {
  if (!elimEntry || !isValidBtDbId(elimEntry.id, "een")) {
    throw new Error("Invalid elimEntry data");
  }

  let response;
  try {
    // further sanitation and validation done in PUT route
    const elimEntryJSON = JSON.stringify(elimEntry);
    response = await privateApi.put(elimEntryUrl + elimEntry.id, elimEntryJSON);
  } catch (err) {
    throw new Error(
      `putElimEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (!response.data?.elimEntry) {
    throw new Error("Error putting elimEntry");
  }

  const dbElimEntry = response.data.elimEntry;
  return {
    ...blankElimEntry,
    id: dbElimEntry.id,
    elim_id: dbElimEntry.elim_id,
    player_id: dbElimEntry.player_id,
    fee: dbElimEntry.fee,
  };
};

/**
 * deletes a elim entry
 *
 * @param {string} id - id of elim entry to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteElimEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "een")) {
    throw new Error("Invalid elimEntry id");
  }

  let response;
  try {
    response = await privateApi.delete(elimEntryUrl + id);
  } catch (err) {
    throw new Error(
      `deleteElimEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }

  if (typeof response.data?.count !== "number") {
    throw new Error("Error deleting elimEntry");
  }

  return response.data.count;
};

export const exportedForTesting = {
  extractElimEntries,
};
