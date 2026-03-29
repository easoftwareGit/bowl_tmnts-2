import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../../test/testApi";
import type { brktDataFromPrismaType, brktEntryType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankBrktEntry } from "../initVals";
import { isBrktDataFromPrisma } from "@/lib/validation/typeGuards";

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;

const brktEntryUrl = url + "/brktEntry/";
const tmntUrl = url + "/tmnt/";

type ApiBrktEntry = {
  id?: string;
  brkt_id?: string;
  player_id?: string;
  num_brackets?: number;
  num_refunds?: number;
  fee?: string;
  time_stamp?: number | string;
  brkt_refunds?: {
    num_refunds?: number;
  } | null;
  brkt?: {
    fee?: string | number;
  } | null;
};

type GetBrktEntriesResponse = {
  brktEntries?: ApiBrktEntry[];
};

type PostPutBrktEntryResponse = {
  brktEntry?: ApiBrktEntry;
};

type DeleteBrktEntryResponse = {
  count?: number;
};

const toErrorMessage = (err: unknown): string =>
  err instanceof Error ? err.message : String(err);

/**
 * Extracts brkt entries from prisma data
 * 
 * @param {unknown} brkt - brkt data from prisma
 * @returns {brktEntryType[]} - array of brkt entries 
 */
export const extractBrktEntries2 = (brkt: unknown): brktEntryType[] => {
  if (!isBrktDataFromPrisma(brkt)) return [];

  const parseTimestamp = (value: unknown): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date.getTime();
    }
    return undefined;
  };

  const typedBrkt = brkt as brktDataFromPrismaType;
  const hasRefundObjs = typedBrkt.brkt_entries.some(
    (entry) => entry.brkt_refunds != null
  );

  return typedBrkt.brkt_entries.map((brktEntry) => {
    const brktFeeNum = Number(typedBrkt?.fee);

    return {
      ...blankBrktEntry,
      id: brktEntry.id ?? "",
      brkt_id: brktEntry.brkt_id ?? "",
      player_id: brktEntry.player_id ?? "",
      num_brackets: brktEntry.num_brackets ?? 0,
      num_refunds: hasRefundObjs ? brktEntry.brkt_refunds?.num_refunds ?? 0 : 0,
      fee: brktEntry.num_brackets > 0 ? String(brktFeeNum * brktEntry.num_brackets) : "",
      time_stamp: parseTimestamp(brktEntry.time_stamp) ?? 0,
    };
  })
}

/**
 * extract brktEntries from GET API response
 *
 * @param {unknown} brktEntries - array of brktEntries from GET API response
 * @returns {brktEntryType[]} - array of brktEntries
 */
export const extractBrktEntries = (brktEntries: unknown): brktEntryType[] => {
  if (!Array.isArray(brktEntries) || brktEntries.length === 0) return [];

  const parseTimestamp = (value: unknown): number | undefined => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date.getTime();
    }
    return undefined;
  };

  const typedBrktEntries = brktEntries as ApiBrktEntry[];
  const hasRefundObjs = typedBrktEntries.some(
    (entry) => entry.brkt_refunds != null
  );

  return typedBrktEntries.map((brktEntry) => {
    const brktFeeNum = Number(brktEntry.brkt?.fee);

    return {
      ...blankBrktEntry,
      id: brktEntry.id ?? "",
      brkt_id: brktEntry.brkt_id ?? "",
      player_id: brktEntry.player_id ?? "",
      num_brackets: brktEntry.num_brackets ?? 0,
      num_refunds: hasRefundObjs
        ? brktEntry.brkt_refunds?.num_refunds ?? 0
        : brktEntry.num_refunds ?? 0,
      fee:
        brktEntry.brkt?.fee != null &&
        !Number.isNaN(brktFeeNum) &&
        Number.isSafeInteger(brktFeeNum)
          ? (brktFeeNum * (brktEntry.num_brackets ?? 0)).toString()
          : "0",
      time_stamp: parseTimestamp(brktEntry.time_stamp) ?? 0,
    };
  });
};

const mapApiBrktEntryToBrktEntry = (dbBrktEntry: ApiBrktEntry): brktEntryType => ({
  ...blankBrktEntry,
  id: dbBrktEntry.id ?? "",
  brkt_id: dbBrktEntry.brkt_id ?? "",
  player_id: dbBrktEntry.player_id ?? "",
  num_brackets: dbBrktEntry.num_brackets ?? 0,
  num_refunds: dbBrktEntry.num_refunds ?? 0,
  fee: dbBrktEntry.fee ?? "0",
  time_stamp:
    typeof dbBrktEntry.time_stamp === "number"
      ? dbBrktEntry.time_stamp
      : typeof dbBrktEntry.time_stamp === "string"
      ? new Date(dbBrktEntry.time_stamp).getTime()
      : 0,
});

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
    response = await publicApi.get(tmntUrl + tmntId, {
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

  try {
    const brktEntryJSON = JSON.stringify(brktEntry);
    const response = await privateApi.post<PostPutBrktEntryResponse>(
      url,
      brktEntryJSON
    );

    if (!response.data?.brktEntry) {
      throw new Error("Error posting brktEntry");
    }

    return mapApiBrktEntryToBrktEntry(response.data.brktEntry);
  } catch (err) {
    throw new Error(`postBrktEntry failed: ${toErrorMessage(err)}`);
  }
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

  try {
    const brktEntryJSON = JSON.stringify(brktEntry);
    const response = await privateApi.put<PostPutBrktEntryResponse>(
      brktEntryUrl + brktEntry.id,
      brktEntryJSON
    );

    if (!response.data?.brktEntry) {
      throw new Error("Error putting brktEntry");
    }

    return mapApiBrktEntryToBrktEntry(response.data.brktEntry);
  } catch (err) {
    throw new Error(`putBrktEntry failed: ${toErrorMessage(err)}`);
  }
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

  try {
    const response = await privateApi.delete<DeleteBrktEntryResponse>(
      brktEntryUrl + id
    );

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting brktEntry");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(`deleteBrktEntry failed: ${toErrorMessage(err)}`);
  }
};