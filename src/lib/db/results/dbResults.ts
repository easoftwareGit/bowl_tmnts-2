import { publicApi } from "@/lib/api/axios";
import { baseResultsApi } from "@/lib/api/apiPaths";
import { testBaseResultsApi } from "../../../../test/testApi";
import { isValidBtDbId } from "@/lib/validation/validation";

const url = testBaseResultsApi.startsWith("undefined")
  ? baseResultsApi
  : testBaseResultsApi;

const gameDivUrl = url + "/games/div/";
const gameTmntUrl = url + "/games/tmnt/";

/**
 * gets all game results for a div
 *
 * @param {string} divId - id of div to get game results for
 * @returns {any[]} - array of game results
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getGameResultsForDiv = async (divId: string): Promise<any[]> => {
  if (!isValidBtDbId(divId, "div")) {
    throw new Error("Invalid div id");
  }

  try {
    const response = await publicApi.get(gameDivUrl + divId);

    if (!response.data?.games) {
      throw new Error("Invalid API response: missing games");
    }

    return response.data.games;
  } catch (err) {
    throw new Error(
      `getGameResultsForDiv failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * gets all game results for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get game results for
 * @returns {any[] | null} - array of game results or null
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getGameResultsForTmnt = async (
  tmntId: string
): Promise<any[] | null> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(gameTmntUrl + tmntId);

    if (!response.data?.games) {
      throw new Error("Invalid API response: missing games");
    }

    return response.data.games;
  } catch (err) {
    throw new Error(
      `getGameResultsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};
