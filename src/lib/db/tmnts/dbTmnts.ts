import axios from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../../test/testApi";
import { tmntFullType, tmntsListType, tmntType, YearObj } from "@/lib/types/types";
import { isValidBtDbId, validYear } from "@/lib/validation";
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
import { extractBrktEntries } from "../brktEntries/dbBrktEntries";
import { extractOneBrkts } from "../oneBrkts/dbOneBrkts";
import { extractBrktSeeds } from "../brktSeeds/dbBrktSeeds";
import { extractElimEntries } from "../elimEntries/dbElimEntries";
import { extractPotEntries } from "../potEntries/dbPotEntries";
import { extractPlayers } from "../players/dbPlayers";

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;   
const fullUrl = url + "/full/";
const tmntUrl = url + "/tmnt/"; 
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const upcomingUrl = url + "/upcoming";
const resultsUrl = url + "/results/"

/**
 * gets one tmnt
 * 
 * @param {string} id - id of tmnt to get
 * @returns {tmntType} - tmnt or null
 * @throws {Error} - if id is invalid or API call fails
 */
export const getTmnt = async (id: string): Promise<tmntType> => { 
  if (!isValidBtDbId(id, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + id, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching tmnt`)
  }
  const dbTmnt = response.data.tmnt
  return {
    ...blankTmnt,
    id: dbTmnt.id,
    user_id: dbTmnt.user_id,
    bowl_id: dbTmnt.bowl_id,
    tmnt_name: dbTmnt.tmnt_name,
    start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
    end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
    bowls: {
      bowl_name: dbTmnt.bowls.bowl_name,
      city: dbTmnt.bowls.city,
      state: dbTmnt.bowls.state,
      url: dbTmnt.bowls.url,
    },
  }
}

/**
 * gets tmnts of user
 * 
 * @param {string} userId - id of user to get tmnts
 * @returns {tmntsListType[]} - tmnts of user
 * @throws {Error} - if id is invalid or API call fails
 */
export const getUserTmnts = async (userId: string): Promise<tmntsListType[]> => {
  if (!isValidBtDbId(userId, 'usr')) { 
    throw new Error('Invalid user id');
  }
  let response;
  try {
    response = await axios.get(userUrl + userId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getUserTmnts failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching tmnts`)
  }
  const dbTmnts = response.data.tmnts    
  const userTmntsList = dbTmnts.map((tmnt: any) => {
    return {
      id: tmnt.id,
      user_id: tmnt.user_id,
      tmnt_name: tmnt.tmnt_name,
      start_date_str: removeTimeFromISODateStr(tmnt.start_date),        
      bowls: {
        bowl_name: tmnt.bowls.bowl_name,
        city: tmnt.bowls.city,
        state: tmnt.bowls.state,
        url: tmnt.bowls.url,
      },
    }
  })
  return userTmntsList
}

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
  
  let response;
  try {
    response = await axios.get(yearsUrl + todayYearStr, {
      withCredentials: true
    });    
  } catch (err) {
    throw new Error(`getTmntYears failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching years`)    
  }
  return response.data.years;
}

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
  take?: number
): Promise<tmntsListType[]> => {  
  if (!validYear(year)) {
    throw new Error('Invalid year');
  }
  // Validate pagination
  const validSkip = typeof skip === "number" && Number.isInteger(skip) && skip >= 0;
  const validTake =
    typeof take === "number" && Number.isInteger(take) && take > 0 && take <= 100;
  
  const params: Record<string, number> = {};
  if (validSkip) params.skip = skip!;
  if (validTake) params.take = take!;

  const response = await axios.get(resultsUrl + year, {
    withCredentials: true,
    params,
  });

  if (response.status !== 200) {
    throw new Error(`Failed to fetch tournaments for year ${year} (status ${response.status})`);
  }
  return response.data.tmnts.map((tmnt: any) => ({
    id: tmnt.id,
    user_id: tmnt.user_id,
    tmnt_name: tmnt.tmnt_name,
    start_date_str: removeTimeFromISODateStr(tmnt.start_date),
    bowls: {
      bowl_name: tmnt.bowls.bowl_name,
      city: tmnt.bowls.city,
      state: tmnt.bowls.state,
      url: tmnt.bowls.url,
    },
  }));
}

/**
 * gets array of upcoming tmnts
 * 
 * @param {number} skip - number of tmnts to skip in data retrieval
 * @param {number} take - number of tmnts to take in data retrieval
 * @returns {tmntsListType[]} - array of upcoming tmnts
 */
const getUpcomingTmnts = async (skip?: number, take?: number): Promise<tmntsListType[]> => { 

  // Validate pagination
  const validSkip = typeof skip === "number" && Number.isInteger(skip) && skip >= 0;
  const validTake =
    typeof take === "number" && Number.isInteger(take) && take > 0 && take <= 100;

  const params: Record<string, number> = {};
  if (validSkip) params.skip = skip!;
  if (validTake) params.take = take!;

  const response = await axios.get(upcomingUrl, {
    withCredentials: true,
    params,
  });  
  
  if (response.status !== 200) {
    throw new Error(`Failed to fetch upcoming tournaments (status ${response.status})`);
  }

  return response.data.tmnts.map((tmnt: any) => ({
    id: tmnt.id,
    tmnt_name: tmnt.tmnt_name,
    start_date_str: removeTimeFromISODateStr(tmnt.start_date),
    bowls: {
      bowl_name: tmnt.bowls.bowl_name,
      city: tmnt.bowls.city,
      state: tmnt.bowls.state,
      url: tmnt.bowls.url,
    },
  }));
}

/**
 * get array of tmnts

 * @param {string} year - "": upcoming tmnts, yyyy - tmnts for year yyyy
 *     NOTE: ok to pass year as param, API route checks for valid year
 * @param {number} skip - number of tmnts to skip in data retrieval
 * @param {number} take - number of tmnts to take in data retrieval
 * @returns {data: tmntListType[]} object with array of tmnts from database
 */
export const getTmnts = async (
  year: string,
  skip?: number,
  take?: number
): Promise<tmntsListType[]> => {
  if (year === "") {
    return await getUpcomingTmnts(skip, take);
  } else {
    return await getTmntsForYear(year, skip, take);
  }
};

/**
 * get all data (child, grand child, great grand child) for tmnt
 * 
 * @param {string} tmntId - id of tmnt to get and all data for
 * @returns {tmntFullType} - all data for tmnt 
 */
export const getTmntFullData = async (tmntId: string): Promise<tmntFullType> => {

  if (!isValidBtDbId(tmntId, 'tmt')) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(fullUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getTmntFullData failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.tmntFullData) {
    throw new Error(`Unexpected status ${response.status} when fetching tmnt config`);
  }
  const dbTmntFullData = response.data.tmntFullData;

  const tmntFullData: tmntFullType = {
    ...linkedInitTmntFullData(tmntId),    
  }
  // remove default arrays
  tmntFullData.divs = [];
  tmntFullData.events = [];
  tmntFullData.squads = [];
  tmntFullData.lanes = [];

  // tmnt data
  tmntFullData.tmnt.bowl_id = dbTmntFullData.bowl_id;
  tmntFullData.tmnt.tmnt_name = dbTmntFullData.tmnt_name;
  tmntFullData.tmnt.start_date_str = removeTimeFromISODateStr(dbTmntFullData.start_date);
  tmntFullData.tmnt.end_date_str = removeTimeFromISODateStr(dbTmntFullData.end_date);
  tmntFullData.tmnt.id = dbTmntFullData.id;
  tmntFullData.tmnt.user_id = dbTmntFullData.user_id;
  
  // bowl data
  tmntFullData.tmnt.bowls.bowl_name = dbTmntFullData.bowls.bowl_name;
  tmntFullData.tmnt.bowls.city = dbTmntFullData.bowls.city;
  tmntFullData.tmnt.bowls.state = dbTmntFullData.bowls.state;
  tmntFullData.tmnt.bowls.url = dbTmntFullData.bowls.url;

  // div data
  if (dbTmntFullData.divs && dbTmntFullData.divs.length > 0) {    

    const extractedDivs = extractDivs(dbTmntFullData.divs);
    tmntFullData.divs.push(...extractedDivs);

    dbTmntFullData.divs.forEach((dbDiv: any) => {

      // divEntries data
      const extractedDivEntries = extractDivEntries(dbDiv.div_entries);
      tmntFullData.divEntries.push(...extractedDivEntries);    
      
      const extractedBrkts = extractBrkts(dbDiv.brkts);
      tmntFullData.brkts.push(...extractedBrkts);
      
      dbDiv.brkts.forEach((dbBrkt: any) => {

        // brktEntries data, also gets brktRefunds
        const extractedBrktEntries = extractBrktEntries(dbBrkt.brkt_entries);
        tmntFullData.brktEntries.push(...extractedBrktEntries);

        // one bracket data
        const extractedOneBrkts = extractOneBrkts(dbBrkt.one_brkts);
        tmntFullData.oneBrkts.push(...extractedOneBrkts);

        dbBrkt.one_brkts.forEach((dbOneBrkt: any) => {

          // brkt seed data
          const extractedBrktSeeds = extractBrktSeeds(dbOneBrkt.brkt_seeds);
          tmntFullData.brktSeeds.push(...extractedBrktSeeds);
        });
      });

      // elim data
      const extractedElims = extractElims(dbDiv.elims);
      tmntFullData.elims.push(...extractedElims);

      dbDiv.elims.forEach((dbElim: any) => {

        // elimEntries data
        const extractedElimEntries = extractElimEntries(dbElim.elim_entries);
        tmntFullData.elimEntries.push(...extractedElimEntries);
      });

      // pot data
      const extractedPots = extractPots(dbDiv.pots);
      tmntFullData.pots.push(...extractedPots);
      dbDiv.pots.forEach((dbPot: any) => {

        // potEntries data
        const extractedPotEntries = extractPotEntries(dbPot.pot_entries);
        tmntFullData.potEntries.push(...extractedPotEntries);               
      })
    })
  }

  // event data
  if (dbTmntFullData.events && dbTmntFullData.events.length > 0) {
    const extractedEvents = extractEvents(dbTmntFullData.events);
    tmntFullData.events.push(...extractedEvents);

    dbTmntFullData.events.forEach((dbEvent: any) => {
      
      // squad data
      const extractedSquads = extractSquads(dbEvent.squads);
      tmntFullData.squads.push(...extractedSquads);

      dbEvent.squads.forEach((dbSquad: any) => {

        // lane data
        const extractedLanes = extractLanes(dbSquad.lanes);
        tmntFullData.lanes.push(...extractedLanes);

        // player data
        const extractedPlayers = extractPlayers(dbSquad.players);
        tmntFullData.players.push(...extractedPlayers);
      })      
    })
  }

  return tmntFullData;
}

/**
 * posts a tmnt
 * 
 * @param {tmntType} tmnt - tmnt to post
 * @returns {tmntType} - tmnt posted
 * @throws {Error} - if data is invalid or API call fails 
 */  
export const postTmnt = async (tmnt: tmntType): Promise<tmntType> => {
  
  if (!tmnt || !isValidBtDbId(tmnt.id, 'tmt')) { 
    throw new Error('Invalid tmnt data');
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const tmntJSON = JSON.stringify(tmnt);
    response = await axios.post(url, tmntJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`postTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.tmnt) {
    throw new Error("Error posting tmnt");
  }
  const dbTmnt = response.data.tmnt
  // do not return bowls in tmnt
  return {
    ...blankTmnt,
    id: dbTmnt.id,
    user_id: dbTmnt.user_id,
    bowl_id: dbTmnt.bowl_id,
    tmnt_name: dbTmnt.tmnt_name,
    start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
    end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
  }
}

/**
 * puts a tmnt
 * 
 * @param {tmntType} tmnt - tmnt to put 
 * @returns {tmntType} - putted tmnt 
 * @throws {Error} - if data is invalid or API call fails
 */
export const putTmnt = async (tmnt: tmntType): Promise<tmntType> => { 
  if (!tmnt || !isValidBtDbId(tmnt.id, 'tmt')) { 
    throw new Error('Invalid tmnt data');
  }
  let response;
  try { 
    // further sanatation and validation done in PUT route
    const tmntJSON = JSON.stringify(tmnt);
    response = await axios.put(tmntUrl + tmnt.id, tmntJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.tmnt) {
    throw new Error("Error putting tmnt");
  }
  const dbTmnt = response.data.tmnt
  // do not return bowls in tmnt
  return {
    ...blankTmnt,
    id: dbTmnt.id,
    user_id: dbTmnt.user_id,
    bowl_id: dbTmnt.bowl_id,
    tmnt_name: dbTmnt.tmnt_name,
    start_date_str: removeTimeFromISODateStr(dbTmnt.start_date),
    end_date_str: removeTimeFromISODateStr(dbTmnt.end_date),
  }
}

/**
 * deletes a tmnt
 * 
 * @param {string} id - id of tmnt to delete
 * @returns {number} - 1 on success
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteTmnt = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, 'tmt')) { 
    throw new Error('Invalid tmnt id');
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting tmnt");
  }
  return response.data.count;
}

export const exportedForTesting = {  
  getTmntsForYear,
  getUpcomingTmnts
}
