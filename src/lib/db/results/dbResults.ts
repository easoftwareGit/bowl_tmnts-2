import axios from "axios";
import { baseResultsApi } from "@/lib/db/apiPaths";
import { testBaseResultsApi } from "../../../../test/testApi";
import { isValidBtDbId } from "@/lib/validation";

const url = testBaseResultsApi.startsWith("undefined")
  ? baseResultsApi
  : testBaseResultsApi;

const gameDivUrl = url + "/games/div/";
const gameTmntUrl = url + "/games/tmnt/";

/**
 * gets all game results for a div
 * 
 * @param {string} divId - id of div to get game results for
 * @returns {any[] | null} - array of game results or null
 */
export const getGameResultsForDiv = async (divId: string): Promise<[] | null> => { 

  try {
    if (!isValidBtDbId(divId, 'div')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: gameDivUrl + divId,
    });
    if (response.status !== 200) return null
    return response.data.games
  } catch (err) {
    return null
  }
}

/**
 * gets all game results for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get game results for
 * @returns {any[] | null} - array of game results or null
 */
export const getGameResultsForTmnt = async (tmntId: string): Promise<[] | null> => { 
  try {
    if (!isValidBtDbId(tmntId, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: gameTmntUrl + tmntId,
    });
    if (response.status !== 200) return null
    return response.data.games
  } catch (err) {
    return null
  }
}