import { publicApi } from "@/lib/api/axios";
import { brktSeedsApi } from "@/lib/api/apiPaths";
import { testBrktSeedsApi } from "../../../../test/testApi";
import type { brktSeedType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { validCompositKey } from "@/lib/validation/brktSeeds/validate";
import { blankBrktSeed } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBrktSeedsApi
  ? testBrktSeedsApi
  : brktSeedsApi;  

const oneBrktSeedUrl = url + "/brktSeed/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const oneBrktUrl = url + "/oneBrkt/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

/**
 * extracts brktSeeds from API response
 *
 * @param {any} brktSeeds - array of brktSeeds from GET API response
 * @returns {brktSeedType[]} - array of brktSeeds with extracted data
 */
export const extractBrktSeeds = (brktSeeds: any): brktSeedType[] => {
  if (!brktSeeds || !Array.isArray(brktSeeds)) return [];
  return brktSeeds.map((brktSeed: any) => ({
    ...blankBrktSeed,
    one_brkt_id: brktSeed.one_brkt_id,
    seed: brktSeed.seed,
    player_id: brktSeed.player_id,
  }));
};

/**
 * Get all brktSeeds for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for tmnt
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllBrktSeedsForTmnt = async (
  tmntId: string
): Promise<brktSeedType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);
    return extractBrktSeeds(response.data.brktSeeds);
  } catch (err) {
    throw new Error(
      `getAllBrktSeedsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all brktSeeds for a squad
 *
 * @param {squadId} squadId - id of squad to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllBrktSeedsForSquad = async (
  squadId: string
): Promise<brktSeedType[] | null> => {
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }

  try {
    const response = await publicApi.get(squadUrl + squadId);
    return extractBrktSeeds(response.data.brktSeeds);
  } catch (err) {
    throw new Error(
      `getAllBrktSeedsForSquad failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all brktSeeds for a div
 *
 * @param {string} divId - id of div to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getAllBrktSeedsForDiv = async (
  divId: string
): Promise<brktSeedType[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await publicApi.get(divUrl + divId);
    return extractBrktSeeds(response.data.brktSeeds);
  } catch (err) {
    throw new Error(
      `getAllBrktSeedsForDiv failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Get all brktSeeds for a bracket
 *
 * @param {string} brktId - id of brackets to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if brktId is invalid or API call fails
 */
export const getAllBrktSeedsForBrkt = async (
  brktId: string
): Promise<brktSeedType[]> => {
  if (!isValidBtDbId(brktId, "brk")) {
    throw new Error("Invalid brkt id");
  }

  try {
    const response = await publicApi.get(brktUrl + brktId);
    return extractBrktSeeds(response.data.brktSeeds);
  } catch (err) {
    throw new Error(
      `getAllBrktSeedsForBrkt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get all brktSeeds for a oneBrkt
 *
 * @param {string} oneBrktId - id of oneBrkt to get brktSeeds for
 * @returns {brktSeedType[]} - array of brktSeeds for squad
 * @throws {Error} - if oneBrktId is invalid or API call fails
 */
export const getAllBrktSeedsForOneBrkt = async (
  oneBrktId: string
): Promise<brktSeedType[]> => {
  if (!isValidBtDbId(oneBrktId, "obk")) {
    throw new Error("Invalid oneBrkt id");
  }

  try {
    const response = await publicApi.get(oneBrktUrl + oneBrktId);
    return extractBrktSeeds(response.data.brktSeeds);
  } catch (err) {
    throw new Error(
      `getAllBrktSeedsForOneBrkt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * Get one brktSeed
 *
 * @param {string} oneBrktId - oneBrktId of brktSeed to get
 * @param {string | number} seed - seed of brktSeed to get
 * @returns {brktSeedType} - brktSeed
 * @throws {Error} - if oneBrktId or seed is invalid or API call fails
 */
export const getBrktSeed = async (
  oneBrktId: string,
  seed: string | number
): Promise<brktSeedType> => {
  if (!validCompositKey(oneBrktId, seed)) {
    throw new Error("Invalid oneBrktId or seed");
  }

  try {
    const response = await publicApi.get(oneBrktSeedUrl + oneBrktId + "/" + seed);

    if (!response.data?.brktSeed) {
      return { ...blankBrktSeed };
    }

    return {
      ...blankBrktSeed,
      one_brkt_id: response.data.brktSeed.one_brkt_id,
      seed: response.data.brktSeed.seed,
      player_id: response.data.brktSeed.player_id,
    };
  } catch (err) {
    throw new Error(
      `getBrktSeed failed: ${err instanceof Error ? err.message : err}`
    );
  }
};