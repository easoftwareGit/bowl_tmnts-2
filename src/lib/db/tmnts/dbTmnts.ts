import { publicApi, privateApi } from "@/lib/api/axios";
import { baseTmntsApi } from "@/lib/api/apiPaths";
import { testBaseTmntsApi } from "../../../../test/testApi";
import type {
  fullStageType,
  tmntFullType,
  tmntsListType,
  tmntType,
  YearObj,
} from "@/lib/types/types";
import { isValidBtDbId, validYear } from "@/lib/validation/validation";
import { removeTimeFromISODateStr, todayYearStr } from "@/lib/dateTools";
import { blankTmnt, linkedInitTmntFullData } from "../initVals";
import { extractEvents } from "../events/dbEvents";
import { extractDivs } from "../divs/dbDivs";
import { extractSquads } from "../squads/dbSquads";
import { extractLanes } from "../lanes/dbLanes";
import { extractPots } from "../pots/dbPots";
import { extractBrkts } from "../brkts/dbBrkts";
import { extractElims } from "../elims/dbElims";
import { extractDivEntries } from "../divEntries/dbDivEntries";
import { extractBrktEntries2 } from "../brktEntries/dbBrktEntries";
import { extractOneBrkts } from "../oneBrkts/dbOneBrkts";
import { extractBrktSeeds } from "../brktSeeds/dbBrktSeeds";
import { extractElimEntries } from "../elimEntries/dbElimEntries";
import { extractPotEntries } from "../potEntries/dbPotEntries";
import { extractPlayers } from "../players/dbPlayers";
import { SquadStage } from "@prisma/client";
import { validateFullTmnt } from "@/lib/validation/tmnts/full/validate";
import { ErrorCode } from "@/lib/enums/enums";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseTmntsApi
  ? testBaseTmntsApi
  : baseTmntsApi;

const fullUrl = url + "/full/";
const fullEntriesUrl = url + "/fullEntries/";
const tmntUrl = url + "/tmnt/";
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const upcomingUrl = url + "/upcoming";
const resultsUrl = url + "/results/";

/**
 * gets one tmnt
 *
 * @param {string} id - id of tmnt to get
 * @returns {tmntType} - tmnt
 * @throws {Error} - if id is invalid or API call fails
 */
export const getTmnt = async (id: string): Promise<tmntType> => {
  if (!isValidBtDbId(id, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + id);

    if (!response.data?.tmnt) {
      throw new Error("Missing tmnt data");
    }

    const dbTmnt = response.data.tmnt;
    return {
      ...blankTmnt,
      id: dbTmnt.id,
      user_id: dbTmnt.user_id,
      bowl_id: dbTmnt.bowl_id,
      tmnt_name: dbTmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
      end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
      bowl: {
        bowl_name: dbTmnt.bowl.bowl_name,
        city: dbTmnt.bowl.city,
        state: dbTmnt.bowl.state,
        url: dbTmnt.bowl.url,
      },
    };
  } catch (err) {
    throw new Error(`getTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * gets tmnts of user
 *
 * @param {string} userId - id of user to get tmnts
 * @returns {tmntsListType[]} - tmnts of user
 * @throws {Error} - if id is invalid or API call fails
 */
export const getUserTmnts = async (
  userId: string,
): Promise<tmntsListType[]> => {
  if (!isValidBtDbId(userId, "usr")) {
    throw new Error("Invalid user id");
  }

  try {
    const response = await publicApi.get(userUrl + userId);

    if (!response.data?.tmnts) {
      throw new Error("Missing tmnts data");
    }

    const dbTmnts = response.data.tmnts;
    return dbTmnts.map((tmnt: any) => ({
      id: tmnt.id,
      user_id: tmnt.user_id,
      tmnt_name: tmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(tmnt.start_date),
      bowl: {
        bowl_name: tmnt.bowl.bowl_name,
        city: tmnt.bowl.city,
        state: tmnt.bowl.state,
        url: tmnt.bowl.url,
      },
    }));
  } catch (err) {
    throw new Error(
      `getUserTmnts failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

/**
 * gets array of years
 * NOTE: Do not use try / catch blocks here. Need the promise to be
 * fulfilled or rejected in /src/redux/features/tmnts/yearsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 *
 * @returns {YearObj[]} - array of years #'s of tmnts
 * @throws {Error} - if API call fails
 */
export const getTmntYears = async (): Promise<YearObj[]> => {
  const response = await publicApi.get(yearsUrl + todayYearStr);

  if (!response.data?.years) {
    throw new Error("getTmntYears failed: Missing years data");
  }

  return response.data.years;
};

/**
 * gets array of tmnts for year
 *
 * @param {string} year - year for tmnts or "" for all years
 * @param {number} skip - number of tmnts to skip
 * @param {number} take - number of tmnts to take
 * @returns {tmntsListType[]} - array of tmnts for year
 */
const getTmntsForYear = async (
  year: string,
  skip?: number,
  take?: number,
): Promise<tmntsListType[]> => {
  if (!validYear(year)) {
    throw new Error("Invalid year");
  }

  const validSkip =
    typeof skip === "number" && Number.isInteger(skip) && skip >= 0;
  const validTake =
    typeof take === "number" &&
    Number.isInteger(take) &&
    take > 0 &&
    take <= 100;

  const params: Record<string, number> = {};
  if (validSkip) params.skip = skip;
  if (validTake) params.take = take;

  try {
    const response = await publicApi.get(resultsUrl + year, { params });

    if (!response.data?.tmnts) {
      throw new Error(`Missing tournaments data for year ${year}`);
    }

    return response.data.tmnts.map((tmnt: any) => ({
      id: tmnt.id,
      user_id: tmnt.user_id,
      tmnt_name: tmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(tmnt.start_date),
      bowl: {
        bowl_name: tmnt.bowl.bowl_name,
        city: tmnt.bowl.city,
        state: tmnt.bowl.state,
        url: tmnt.bowl.url,
      },
    }));
  } catch (err) {
    throw new Error(
      `getTmntsForYear failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

/**
 * gets array of upcoming tmnts
 *
 * @param {number} skip - number of tmnts to skip in data retrieval
 * @param {number} take - number of tmnts to take in data retrieval
 * @returns {tmntsListType[]} - array of upcoming tmnts
 */
const getUpcomingTmnts = async (
  skip?: number,
  take?: number,
): Promise<tmntsListType[]> => {
  const validSkip =
    typeof skip === "number" && Number.isInteger(skip) && skip >= 0;
  const validTake =
    typeof take === "number" &&
    Number.isInteger(take) &&
    take > 0 &&
    take <= 100;

  const params: Record<string, number> = {};
  if (validSkip) params.skip = skip;
  if (validTake) params.take = take;

  try {
    const response = await publicApi.get(upcomingUrl, { params });

    if (!response.data?.tmnts) {
      throw new Error("Missing upcoming tournaments data");
    }

    return response.data.tmnts.map((tmnt: any) => ({
      id: tmnt.id,
      tmnt_name: tmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(tmnt.start_date),
      bowl: {
        bowl_name: tmnt.bowl.bowl_name,
        city: tmnt.bowl.city,
        state: tmnt.bowl.state,
        url: tmnt.bowl.url,
      },
    }));
  } catch (err) {
    throw new Error(
      `getUpcomingTmnts failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

/**
 * get array of tmnts
 *
 * @param {string} year - "": upcoming tmnts, yyyy - tmnts for year yyyy
 *     NOTE: ok to pass year as param, API route checks for valid year
 * @param {number} skip - number of tmnts to skip in data retrieval
 * @param {number} take - number of tmnts to take in data retrieval
 * @returns {tmntsListType[]} - array of tmnts from database
 */
export const getTmnts = async (
  year: string,
  skip?: number,
  take?: number,
): Promise<tmntsListType[]> => {
  if (year === "") {
    return await getUpcomingTmnts(skip, take);
  }
  return await getTmntsForYear(year, skip, take);
};

/**
 * get all data (child, grand child, great grand child) for tmnt
 *
 * @param {string} tmntId - id of tmnt to get and all data for
 * @returns {tmntFullType} - all data for tmnt
 */
export const getTmntFullData = async (
  tmntId: string,
): Promise<tmntFullType> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  let response;
  try {
    response = await publicApi.get(fullUrl + tmntId);
  } catch (err) {
    throw new Error(
      `getTmntFullData failed: ${err instanceof Error ? err.message : err}`,
    );
  }

  if (!response.data?.tmntFullData) {
    throw new Error("getTmntFullData failed: Missing tmntFullData");
  }

  const dbTmntFullData = response.data.tmntFullData;

  const tmntFullData: tmntFullType = {
    ...linkedInitTmntFullData(tmntId),
  };

  tmntFullData.divs = [];
  tmntFullData.events = [];
  tmntFullData.squads = [];
  tmntFullData.lanes = [];

  tmntFullData.tmnt.bowl_id = dbTmntFullData.bowl_id;
  tmntFullData.tmnt.tmnt_name = dbTmntFullData.tmnt_name;
  tmntFullData.tmnt.start_date_str = removeTimeFromISODateStr(
    dbTmntFullData.start_date,
  );
  tmntFullData.tmnt.end_date_str = removeTimeFromISODateStr(
    dbTmntFullData.end_date,
  );
  tmntFullData.tmnt.id = dbTmntFullData.id;
  tmntFullData.tmnt.user_id = dbTmntFullData.user_id;

  tmntFullData.tmnt.bowl.bowl_name = dbTmntFullData.bowl.bowl_name;
  tmntFullData.tmnt.bowl.city = dbTmntFullData.bowl.city;
  tmntFullData.tmnt.bowl.state = dbTmntFullData.bowl.state;
  tmntFullData.tmnt.bowl.url = dbTmntFullData.bowl.url;

  if (dbTmntFullData.divs && dbTmntFullData.divs.length > 0) {
    const extractedDivs = extractDivs(dbTmntFullData.divs);
    tmntFullData.divs.push(...extractedDivs);

    dbTmntFullData.divs.forEach((dbDiv: any) => {
      const extractedDivEntries = extractDivEntries(dbDiv.div_entries);
      tmntFullData.divEntries.push(...extractedDivEntries);

      const extractedBrkts = extractBrkts(dbDiv.brkts);
      tmntFullData.brkts.push(...extractedBrkts);

      dbDiv.brkts.forEach((dbBrkt: any) => {
        const extractedBrktEntries = extractBrktEntries2(dbBrkt);
        tmntFullData.brktEntries.push(...extractedBrktEntries);

        const extractedOneBrkts = extractOneBrkts(dbBrkt.one_brkts);
        tmntFullData.oneBrkts.push(...extractedOneBrkts);

        dbBrkt.one_brkts.forEach((dbOneBrkt: any) => {
          const extractedBrktSeeds = extractBrktSeeds(dbOneBrkt.brkt_seeds);
          tmntFullData.brktSeeds.push(...extractedBrktSeeds);
        });
      });

      const extractedElims = extractElims(dbDiv.elims);
      tmntFullData.elims.push(...extractedElims);

      dbDiv.elims.forEach((dbElim: any) => {
        const extractedElimEntries = extractElimEntries(dbElim.elim_entries);
        tmntFullData.elimEntries.push(...extractedElimEntries);
      });

      const extractedPots = extractPots(dbDiv.pots);
      tmntFullData.pots.push(...extractedPots);

      dbDiv.pots.forEach((dbPot: any) => {
        const extractedPotEntries = extractPotEntries(dbPot.pot_entries);
        tmntFullData.potEntries.push(...extractedPotEntries);
      });
    });
  }

  if (dbTmntFullData.events && dbTmntFullData.events.length > 0) {
    const extractedEvents = extractEvents(dbTmntFullData.events);
    tmntFullData.events.push(...extractedEvents);

    let gotStage = false;
    dbTmntFullData.events.forEach((dbEvent: any) => {
      const extractedSquads = extractSquads(dbEvent.squads);
      tmntFullData.squads.push(...extractedSquads);

      dbEvent.squads.forEach((dbSquad: any) => {
        if (!gotStage) {
          tmntFullData.stage = dbSquad.stage;
          gotStage = true;
        }

        const extractedLanes = extractLanes(dbSquad.lanes);
        tmntFullData.lanes.push(...extractedLanes);

        const extractedPlayers = extractPlayers(dbSquad.players);
        tmntFullData.players.push(...extractedPlayers);
      });
    });
  }

  const missing: string[] = [];
  if (tmntFullData.divs.length === 0) missing.push("Div");
  if (tmntFullData.events.length === 0) missing.push("Event");
  if (tmntFullData.squads.length === 0) missing.push("Squad");
  if (tmntFullData.lanes.length === 0) missing.push("Lane");

  if (missing.length > 0) {
    throw new Error(
      `getTmntFullData failed: tournament "${tmntId}" is missing required child data: ${missing.join(
        ", ",
      )}`,
    );
  }

  return tmntFullData;
};

/**
 * posts a tmnt - just the tmnt row and no child data
 *
 * @param {tmntType} tmnt - tmnt to post
 * @returns {tmntType} - tmnt posted
 * @throws {Error} - if data is invalid or API call fails
 */
export const postTmnt = async (tmnt: tmntType): Promise<tmntType> => {
  if (!tmnt || !isValidBtDbId(tmnt.id, "tmt")) {
    throw new Error("Invalid tmnt data");
  }

  try {
    const tmntJSON = JSON.stringify(tmnt);
    const response = await privateApi.post(url, tmntJSON);

    if (!response.data?.tmnt) {
      throw new Error("Error posting tmnt");
    }

    const dbTmnt = response.data.tmnt;
    return {
      ...blankTmnt,
      id: dbTmnt.id,
      user_id: dbTmnt.user_id,
      bowl_id: dbTmnt.bowl_id,
      tmnt_name: dbTmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
      end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
    };
  } catch (err) {
    throw new Error(`postTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * puts a tmnt - just the tmnt row and no child data
 *
 * @param {tmntType} tmnt - tmnt to put
 * @returns {tmntType} - put tmnt
 * @throws {Error} - if data is invalid or API call fails
 */
export const putTmnt = async (tmnt: tmntType): Promise<tmntType> => {
  if (!tmnt || !isValidBtDbId(tmnt.id, "tmt")) {
    throw new Error("Invalid tmnt data");
  }

  try {
    const tmntJSON = JSON.stringify(tmnt);
    const response = await privateApi.put(tmntUrl + tmnt.id, tmntJSON);

    if (!response.data?.tmnt) {
      throw new Error("Error putting tmnt");
    }

    const dbTmnt = response.data.tmnt;
    return {
      ...blankTmnt,
      id: dbTmnt.id,
      user_id: dbTmnt.user_id,
      bowl_id: dbTmnt.bowl_id,
      tmnt_name: dbTmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
      end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
    };
  } catch (err) {
    throw new Error(`putTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
};

/**
 * replaces full tmnt data, tmnt table and all child/grandchild tables
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<boolean>} - true on success or throws error
 */
export const replaceTmntFullData = async (
  tmntFullData: tmntFullType,
): Promise<boolean> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {
    throw new Error("invalid tmntFullData data");
  }

  const stageDate = new Date();
  const stageDateStr = stageDate.toISOString();
  tmntFullData.stage.stage_set_at = stageDateStr;
  tmntFullData.stage.scores_started_at =
    tmntFullData.stage.stage === SquadStage.SCORES ? stageDateStr : null;
  tmntFullData.stage.stage_override_at = tmntFullData.stage.stage_override_enabled
    ? stageDateStr
    : null;

  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }

  try {
    const tmntJSON = JSON.stringify(tmntFullData);
    const response = await privateApi.put(
      fullUrl + tmntFullData.tmnt.id,
      tmntJSON,
    );

    if (!response.data?.success) {
      throw new Error("Error replacing full tmnt");
    }

    return response.data.success;
  } catch (err) {
    throw new Error(
      `replaceTmntFullData failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

/**
 * replaces full tmnt entries data
 * replaces players, divEntries, potEntries, brktEntries, brktRefunds,
 * onebrkts, brktSeeds, and elimEntries
 * DOES NOT replace tmnt, events, divs, squads, lanes, pots, brkts, or elims
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {Promise<{ success: true; stage: fullStageType }>} - success and stage
 */
export const replaceTmntEntriesData = async (
  tmntFullData: tmntFullType,
): Promise<{ success: true; stage: fullStageType }> => {
  if (tmntFullData == null || typeof tmntFullData !== "object") {
    throw new Error("invalid tmntFullData data");
  }

  const stageDate = new Date();
  const stageDateStr = stageDate.toISOString();
  tmntFullData.stage.stage_set_at = stageDateStr;
  tmntFullData.stage.scores_started_at =
    tmntFullData.stage.stage === SquadStage.SCORES ? stageDateStr : null;
  tmntFullData.stage.stage_override_at = tmntFullData.stage.stage_override_enabled
    ? stageDateStr
    : null;

  const validateResult = validateFullTmnt(tmntFullData);
  if (validateResult.errorCode !== ErrorCode.NONE) {
    throw new Error(validateResult.message);
  }

  try {
    const tmntJSON = JSON.stringify(tmntFullData);
    const response = await privateApi.put(
      fullEntriesUrl + tmntFullData.tmnt.id,
      tmntJSON,
    );

    if (!response.data?.success || !response.data?.stage) {
      throw new Error("Error replacing full tmnt entries");
    }

    return response.data;
  } catch (err) {
    throw new Error(
      `replaceTmntFullEntriesData failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

/**
 * deletes a tmnt
 *
 * @param {string} id - id of tmnt to delete
 * @returns {number} - 1 on success
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteTmnt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await privateApi.delete(tmntUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting tmnt");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteTmnt failed: ${err instanceof Error ? err.message : err}`,
    );
  }
};

export const exportedForTesting = {
  getTmntsForYear,
  getUpcomingTmnts,
};
