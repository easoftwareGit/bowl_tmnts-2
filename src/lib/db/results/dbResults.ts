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
 * @returns {any[]} - array of game results
 * @throws {Error} - if divId is invalid or API call fails
 */
export const getGameResultsForDiv = async (divId: string): Promise<any[]> => { 
  if (!isValidBtDbId(divId, 'div')) { 
    throw new Error('Invalid div id');
  }
  let response;
  try { 
    response = await axios.get(gameDivUrl + divId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getGameResultsForDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching games`)
  }    
  return response.data.games
}

/**
 * gets all game results for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get game results for
 * @returns {any[] | null} - array of game results or null
 */
export const getGameResultsForTmnt = async (tmntId: string): Promise<[] | null> => { 
  if (!isValidBtDbId(tmntId, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.get(gameTmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`getGameResultsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching games`)
  }    
  return response.data.games;
}