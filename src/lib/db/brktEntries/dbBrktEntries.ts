import axios from "axios";
import { baseBrktEntriesApi } from "@/lib/db/apiPaths";
import { testBaseBrktEntriesApi } from "../../../../test/testApi";
import { brktEntryType, brktRefundType, brktType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankBrktEntry, blankBrktRefund } from "../initVals";
import { validateBrktEntries } from "@/app/api/brktEntries/validate";

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;

const brktEntryUrl = url + "/brktEntry/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extract brktEntries from GET API response
 *
 * @param {any} brktEntries - array of brktEntries from GET API response
 * @returns {brktEntryType[]} - array of brktEntries
 */
export const extractBrktEntries = (brktEntries: any): brktEntryType[] => {
  if (!brktEntries || !Array.isArray(brktEntries) || brktEntries.length === 0) return [];

  // Helper function to safely convert string → timestamp
  const parseTimestamp = (value: any): number | undefined => {
    if (typeof value === "number") return value; // already a timestamp
    if (typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.getTime(); // Valid? Convert. Invalid? Keep original.
    }
    return undefined; // null or other → undefined
  };

  const hasRefundObjs = brktEntries.some((entry: any) => entry.brkt_refunds != null);

  return brktEntries.map((brktEntry: any) => ({
    ...blankBrktEntry,
    id: brktEntry.id,
    brkt_id: brktEntry.brkt_id,
    player_id: brktEntry.player_id,
    num_brackets: brktEntry.num_brackets,
    num_refunds: hasRefundObjs
      ? brktEntry.brkt_refunds?.num_refunds
      : brktEntry.num_refunds,
    fee: brktEntry.fee,
    time_stamp: parseTimestamp(brktEntry.time_stamp) as number,
  }));

  // const brktsWithRefundObjs = brktEntries.filter((brktEntry: any) => brktEntry.brkt_refunds != null);

  // // if already calcualted num_refunds
  // if (brktsWithRefundObjs.length === 0) {
  //   return brktEntries.map((brktEntry: any) => ({
  //     ...blankBrktEntry,
  //     id: brktEntry.id,
  //     brkt_id: brktEntry.brkt_id,
  //     player_id: brktEntry.player_id,
  //     num_brackets: brktEntry.num_brackets,
  //     num_refunds: brktEntry.num_refunds,
  //     fee: brktEntry.fee,
  //     time_stamp: brktEntry.time_stamp,
  //   }));
  // } else { // else extract num refunds
  //   return brktEntries.map((brktEntry: any) => ({
  //     ...blankBrktEntry,
  //     id: brktEntry.id,
  //     brkt_id: brktEntry.brkt_id,
  //     player_id: brktEntry.player_id,
  //     num_brackets: brktEntry.num_brackets,
  //     num_refunds:
  //       brktEntry.brkt_refunds == null
  //         ? undefined
  //         : brktEntry.brkt_refunds.num_refunds,
  //     fee: brktEntry.fee,
  //     time_stamp: brktEntry.time_stamp,
  //   }));
  // }
};

/**
 * extract brktRefunds from GET API response
 *
 * @param {any} brktEntries - array of brktEntries from GET API response
 * @returns {brktRefundType[]} - array of brktRefunds
 */
export const extractBrktRefunds = (brktEntries: any): brktRefundType[] => {
  if (!brktEntries || !Array.isArray(brktEntries)) return [];
  return brktEntries
    .filter(
      (brktEntry: any) =>
        brktEntry?.brkt_refunds != null && brktEntry?.brkt_refunds?.num_refunds !== 0
    )
    .map((brktEntry: any) => ({
      ...blankBrktRefund,
      brkt_entry_id: brktEntry.id,
      num_refunds: brktEntry.brkt_refunds.num_refunds,
    }));
};

/**
 * Get all brkt entries for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get brkt entries for
 * @returns {brktEntryType[]} - array of brkt entries
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllBrktEntriesForTmnt = async (
  tmntId: string
): Promise<brktEntryType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `getAllBrktEntriesForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status ${response.status} when fetching brktEntries`
    );
  }
  return extractBrktEntries(response.data.brktEntries);
};

/**
 * Get all brkt entries for a div
 *
 * @param {string} divId - id of div to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllBrktEntriesForDiv = async (
  divId: string
): Promise<brktEntryType[] | null> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.get(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `getAllBrktEntriesForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status ${response.status} when fetching brktEntries`
    );
  }
  return extractBrktEntries(response.data.brktEntries);
};

/**
 * Get all brkt entries for a brkt
 *
 * @param {string} brktId - id of brkt to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const getAllBrktEntriesForBrkt = async (
  brktId: string
): Promise<brktEntryType[] | null> => {
  if (!isValidBtDbId(brktId, "brk")) {
    throw new Error("Invalid brkt id");
  }
  let response;
  try {
    response = await axios.get(brktUrl + brktId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `getAllBrktEntriesForBrkt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status ${response.status} when fetching brktEntries`
    );
  }
  return extractBrktEntries(response.data.brktEntries);
};

/**
 * Get all brkt entries for a squad
 *
 * @param {string} squadId - id of squad to get brkt entries for
 * @returns {brktEntryType[] | null} - array of brkt entries
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllBrktEntriesForSquad = async (
  squadId: string
): Promise<brktEntryType[] | null> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `getAllBrktEntriesForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (response.status !== 200) {
    throw new Error(
      `Unexpected status ${response.status} when fetching brktEntries`
    );
  }
  const gotBrktEntries = response.data.brktEntries;
  const brktEntries = gotBrktEntries.map((brktEntry: any) => ({
    ...blankBrktEntry,
    id: brktEntry.id,
    brkt_id: brktEntry.brkt_id,
    player_id: brktEntry.player_id,
    num_brackets: brktEntry.num_brackets,
    num_refunds: brktEntry.num_refunds,
    fee: brktEntry.fee,
    time_stamp: brktEntry.time_stamp,
  }));
  return brktEntries;
};

/**
 * posts a brkt entry
 *
 * @param {brktEntryType} brktEntry - brktEntry to post
 * @returns {brktEntryType} - brktEntry that was posted
 * @throws {Error} - if brktEntry is invalid or API call fails
 */
export const postBrktEntry = async (
  brktEntry: brktEntryType
): Promise<brktEntryType> => {
  if (!brktEntry || !isValidBtDbId(brktEntry.id, "ben")) {
    throw new Error("Invalid brktEntry data");
  }
  let response;
  try {
    // further sanatation and validation done in POST route
    const brktEntryJSON = JSON.stringify(brktEntry);
    response = await axios.post(url, brktEntryJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `postBrktEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 201 || !response.data?.brktEntry) {
    throw new Error("Error posting brktEntry");
  }
  const dbBrktEntry = response.data.brktEntry;
  return {
    ...blankBrktEntry,
    id: dbBrktEntry.id,
    brkt_id: dbBrktEntry.brkt_id,
    player_id: dbBrktEntry.player_id,
    num_brackets: dbBrktEntry.num_brackets,
    num_refunds: dbBrktEntry.num_refunds,
    fee: dbBrktEntry.fee,
    time_stamp: dbBrktEntry.time_stamp,
  };
};

/**
 * posts many brkt entries
 *
 * @param {brktEntryType[]} brktEntries - array of brktEntries to post
 * @returns {number} - number of brktEntries that were posted or -1 if error
 * @throws {Error} - if brktEntries is invalid or API call fails
 */
export const postManyBrktEntries = async (
  brktEntries: brktEntryType[]
): Promise<number> => {
  if (!brktEntries || !Array.isArray(brktEntries)) {
    throw new Error("Invalid brktEntries data");
  }
  if (brktEntries.length === 0) return 0; // not an error, just no data to post
  const validBrktEntries = validateBrktEntries(brktEntries);
  if (
    validBrktEntries.errorCode !== ErrorCode.None ||
    validBrktEntries.brktEntries.length !== brktEntries.length
  ) {
    if (validBrktEntries.brktEntries.length === 0) {
      throw new Error("Invalid brktEntry data at index 0");
    }
    const errorIndex = brktEntries.findIndex(
      (brktEntry) => !isValidBtDbId(brktEntry.id, "ben")
    );
    if (errorIndex < 0) {
      throw new Error(
        `Invalid brktEntry data at index ${validBrktEntries.brktEntries.length}`
      );
    } else {
      throw new Error(`Invalid brktEntry data at index ${errorIndex}`);
    }
  }
  let response;
  try {
    const brktEntryJSON = JSON.stringify(brktEntries);
    response = await axios.post(manyUrl, brktEntryJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `postManyBrktEntries failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting brktEntries");
  }
  return response.data.count;
};

/**
 * updates a brkt entry
 *
 * @param {brktEntryType} brktEntry - brktEntry to update
 * @returns {brktEntryType} - brktEntry that was updated
 * @throws {Error} - if brktEntry is invalid or API call fails
 */
export const putBrktEntry = async (
  brktEntry: brktEntryType
): Promise<brktEntryType> => {
  if (!brktEntry || !isValidBtDbId(brktEntry.id, "ben")) {
    throw new Error("Invalid brktEntry data");
  }
  let response;
  try {
    // further sanatation and validation done in PUT route
    const brktEntryJSON = JSON.stringify(brktEntry);
    response = await axios.put(brktEntryUrl + brktEntry.id, brktEntryJSON, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `putBrktEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 200 || !response.data?.brktEntry) {
    throw new Error("Error putting brktEntry");
  }
  const dbBrktEntry = response.data.brktEntry;
  return {
    ...blankBrktEntry,
    id: dbBrktEntry.id,
    brkt_id: dbBrktEntry.brkt_id,
    player_id: dbBrktEntry.player_id,
    num_brackets: dbBrktEntry.num_brackets,
    num_refunds: dbBrktEntry.num_refunds,
    fee: dbBrktEntry.fee,
    time_stamp: dbBrktEntry.time_stamp,
  };
};

/**
 * deletes a brkt entry
 *
 * @param {string} id - id of brkt entry to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteBrktEntry = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "ben")) {
    throw new Error("Invalid brktEntry id");
  }
  let response;
  try {
    response = await axios.delete(brktEntryUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteBrktEntry failed: ${err instanceof Error ? err.message : err}`
    );
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting brktEntry");
  }
  return response.data.count;
};

/**
 * deletes all brkt entries for a squad
 *
 * @param {string} squadId - id of squad to delete
 * @returns {number} - number of brkt entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllBrktEntriesForSquad = async (
  squadId: string
): Promise<number> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.delete(squadUrl + squadId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteAllBrktEntriesForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (
    response.status !== 200 ||
    typeof response.data?.count !== "number"
  ) {
    throw new Error("Error deleting brktEntries for squad");
  }
  return response.data.count;
};

/**
 * deletes all brkt entries for a div
 *
 * @param {string} divId - id of div to delete
 * @returns {number} - number of brkt entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllBrktEntriesForDiv = async (
  divId: string
): Promise<number> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.delete(divUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteAllBrktEntriesForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting brktEntries for div");
  }
  return response.data.count;
};

/**
 * deletes all brkt entries for a brkt
 *
 * @param {string} brktId - id of brkt to delete
 * @returns {number} - number of brkt entries deleted, -1 on failure
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllBrktEntriesForBrkt = async (
  brktId: string
): Promise<number> => {
  if (!isValidBtDbId(brktId, "brk")) {
    throw new Error("Invalid brkt id");
  }
  let response;
  try {
    response = await axios.delete(brktUrl + brktId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteAllBrktEntriesForBrkt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (
    response.status !== 200 ||
    typeof response.data?.count !== "number"
  ) {
    throw new Error("Error deleting brktEntries for brkt");
  }
  return response.data.count;
};

/**
 * deletes all brkt entries for a tournament
 *
 * @param {string} tmntId - id of tmnt to delete
 * @returns {number} - number of brkt entries deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteAllBrktEntriesForTmnt = async (
  tmntId: string
): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(
      `deleteAllBrktEntriesForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
  if (
    response.status !== 200 ||
    typeof response.data?.count !== "number"
  ) {
    throw new Error("Error deleting brktEntries for tmnt");
  }
  return response.data.count;
};
