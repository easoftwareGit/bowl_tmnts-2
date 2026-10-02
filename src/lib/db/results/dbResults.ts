import { publicApi } from "@/lib/api/axios";
import { baseResultsApi } from "@/lib/api/apiPaths";
import { testBaseResultsApi } from "../../../../test/testApi";
import { isValidBtDbId } from "@/lib/validation/validation";
import {
  tmntGameResult,
  tgrGameKey,
  tgrHdcpKey,
  totalPlusHdcpSqlName
} from "@/lib/types/resultsTypes";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseResultsApi
  ? testBaseResultsApi
  : baseResultsApi;

const gameTmntUrl = url + "/games/tmnt/";

/**
 * gets the number of games in the tournament
 *
 * @param {tmntGameResult[]} gameResults
 * @return {*} 
 */
const gameCount = (gameResults: tmntGameResult[]) => {
  const gameNumRegex = /^Game \d+$/;
  const gameKeys = Object.keys(gameResults[0]).filter((key) => gameNumRegex.test(key));
  return gameKeys.length;
};

/**
 * gets the scores + hdcp for each game, only if there is a score
 *
 * @param {tmntGameResult[]} gameResults - raw data from db
 * @return {tmntGameResult[]} - data with scores + hdcp and total + total hdcp
 */
const getHdcpGameScores = (gameResults: tmntGameResult[]): tmntGameResult[] => {
  const numGames = gameCount(gameResults);
  gameResults.forEach((gameResult) => {
    let totalHdcp = 0;    
    for (let i = 1; i <= numGames; i++) {
      const score = gameResult[tgrGameKey(i)];
      if (score != null) {
        gameResult[tgrHdcpKey(i)] = score + gameResult.hdcp;
        totalHdcp += gameResult.hdcp;        
      }      
    }
    gameResult.total_hdcp = totalHdcp;
    gameResult[totalPlusHdcpSqlName] = gameResult.total + totalHdcp;
  })
  return gameResults
};

/**
 * gets all game results for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get game results for
 * @returns {tmntGameResult[] | null} - array of game results or null
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getGameResultsForTmnt = async (
  tmntId: string
): Promise<tmntGameResult[] | null> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(gameTmntUrl + tmntId);

    if (!response.data?.games) {
      throw new Error("Invalid API response: missing games");
    }

    const tmntResults = response.data.games as tmntGameResult[];
    if (tmntResults.length === 0) {
      return tmntResults;
    }

    // get handicaps and then sort by total + total_hdcp
    return getHdcpGameScores(tmntResults)
      .sort((a, b) =>
        (b[totalPlusHdcpSqlName] ?? 0) -
        (a[totalPlusHdcpSqlName] ?? 0)
      );

  } catch (err) {
    throw new Error(
      `getGameResultsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};
