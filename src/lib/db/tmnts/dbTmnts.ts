import axios from "axios";
import { baseTmntsApi } from "@/lib/db/apiPaths";
import { testBaseTmntsApi } from "../../../../test/testApi";
import { dataOneTmntType, ioDataErrorsType, tmntsListType, tmntType, YearObj } from "@/lib/types/types";
import { isValidBtDbId, validYear } from "@/lib/validation";
import { removeTimeFromISODateStr, todayYearStr } from "@/lib/dateTools";
import { blankTmnt } from "../initVals";
import { deleteAllTmntEvents, getAllEventsForTmnt } from "../events/dbEvents";
import { deleteAllTmntDivs, getAllDivsForTmnt } from "../divs/dbDivs";
import { deleteAllTmntSquads, getAllSquadsForTmnt } from "../squads/dbSquads";
import { deleteAllTmntLanes, getAllLanesForTmnt } from "../lanes/dbLanes";
import { deleteAllTmntPots, getAllPotsForTmnt } from "../pots/dbPots";
import { deleteAllTmntBrkts, getAllBrktsForTmnt } from "../brkts/dbBrkts";
import { deleteAllTmntElims, getAllElimsForTmnt } from "../elims/dbElims";

const url = testBaseTmntsApi.startsWith("undefined")
  ? baseTmntsApi
  : testBaseTmntsApi;   
const oneTmntUrl = url + "/tmnt/"; 
const userUrl = url + "/user/";
const yearsUrl = url + "/years/";
const upcomingUrl = url + "/upcoming";
const resultsUrl = url + "/results/"

/**
 * gets one tmnt
 * 
 * @param {string} id - id of tmnt to get
 * @returns {tmntType | null} - tmnt or null
 */
export const getTmnt = async (id: string): Promise<tmntType | null> => { 

  try {
    if (!id || !isValidBtDbId(id, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + id,
    });
    if (response.status !== 200) return null
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
  } catch (err) {
    return null;
  }
}

/**
 * gets tmnts of user
 * NOTE: Do not use try / catch blocks here. Need the promise to be 
 * fulfilled or rejected in /src/redux/features/tmnts/yearsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 * 
 * @param {string} userId - id of user to get tmnts
 * @returns {tmntsListType[]} - tmnts of user or null
 */
export const getUserTmnts = async (userId: string): Promise<tmntsListType[]> => {

  if (!userId || !isValidBtDbId(userId, 'usr')) return []
  try {
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: userUrl + userId ,
    });
    if (response.status !== 200) return [];
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
  } catch (err) {
    return [];
  }
}

/**
 * gets array of years
 * NOTE: Do not use try / catch blocks here. Need the promise to be 
 * fulfilled or rejected in /src/redux/features/tmnts/yearsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 * 
 * @returns {YearObj[]} - array of years #'s of tmnts
 */
export const getTmntYears = async (): Promise<YearObj[]> => { 
  
  const response = await axios({
    method: "get",
    withCredentials: true,
    url: yearsUrl + todayYearStr,
  });
  return (response.status === 200) ? response.data.years : [];  
}

/**
 * gets array of tmnts for year
 * NOTE: Do not use try / catch blocks here. Need the promise to be 
 * fulfilled or rejected in /src/redux/features/tmnts/yearsSlice.tsx
 * which will have the appropriate response in the extraReducers.
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
  // validate the year as a number
  if (!validYear(year)) return [];
  const response = await axios({
    method: "get",
    withCredentials: true,
    url: resultsUrl + year,
    params: {
      skip: skip,
      take: take
    }
  });
  if (response.status !== 200) return [];
  const dbTmnts = response.data.tmnts
  const tmntsForYear = dbTmnts.map((tmnt: any) => {
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
  return tmntsForYear
}

/**
 * gets array of upcoming tmnts
 * NOTE: Do not use try / catch blocks here. Need the promise to be 
 * fulfilled or rejected in /src/redux/features/tmnts/yearsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 * 
 * @param {number} skip - number of tmnts to skip in data retrieval
 * @param {number} take - number of tmnts to take in data retrieval
 * @returns {tmntsListType[]} - array of upcoming tmnts
 */
const getUpcomingTmnts = async (skip?: number, take?: number): Promise<tmntsListType[]> => { 

  const response = await axios({
    method: "get",
    withCredentials: true,
    url: upcomingUrl,
    params: {
      skip: skip,
      take: take
    }
  });
  if (response.status !== 200) return [];
  const dbUpcoming = response.data.tmnts
  const upcomingTmnts = dbUpcoming.map((tmnt: any) => {
    return {
      id: tmnt.id,
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
  return upcomingTmnts  
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
 * get all data for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get data for
 * @returns {dataOneTmntType | null} - all data for tmnt
 */
export const getAllDataForTmnt = async (tmntId: string): Promise<dataOneTmntType | null> => {

  if (!tmntId || !isValidBtDbId(tmntId, 'tmt')) return null
  try {
    const allTmntData: dataOneTmntType = {
      tmnt: { ...blankTmnt },
      events: [],
      divs: [],
      squads: [],
      lanes: [],
      pots: [],      
      brkts: [],      
      elims: [],
    }
    const adTmnt = await getTmnt(tmntId);
    if (!adTmnt) return null
    allTmntData.tmnt = { ...adTmnt };

    const adEvents = await getAllEventsForTmnt(tmntId);
    if (!adEvents || adEvents.length === 0) return null
    allTmntData.events = [...adEvents];

    const adDivs = await getAllDivsForTmnt(tmntId);
    if (!adDivs || adDivs.length === 0) return null
    allTmntData.divs = [...adDivs];

    const adSquads = await getAllSquadsForTmnt(tmntId);
    if (!adSquads || adSquads.length === 0) return null
    allTmntData.squads = [...adSquads];

    const adLanes = await getAllLanesForTmnt(tmntId);
    if (!adLanes || adLanes.length === 0) return null
    allTmntData.lanes = [...adLanes];

    const adPots = await getAllPotsForTmnt(tmntId);
    if (!adPots) return null
    allTmntData.pots = [...adPots];

    const adBrkts = await getAllBrktsForTmnt(tmntId);
    if (!adBrkts) return null
    allTmntData.brkts = [...adBrkts];

    const adElims = await getAllElimsForTmnt(tmntId);
    if (!adElims) return null
    allTmntData.elims = [...adElims];

    return allTmntData
  } catch (err) {
    return null;
  }
}

/**
 * posts a tmnt
 * 
 * @param {tmntType} tmnt - tmnt to post
 * @returns - tmnt posted or null
 */  
export const postTmnt = async (tmnt: tmntType): Promise<tmntType | null> => {
  
  // all sanatation and validation done in POST route

  try {
    if (!tmnt || !isValidBtDbId(tmnt.id, 'tmt')) return null
    // further sanatation and validation done in POST route
    const tmntJSON = JSON.stringify(tmnt);
    const response = await axios({
      method: "post",
      data: tmntJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null
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
  } catch (err) {
    return null;
  }
}

/**
 * puts a tmnt
 * 
 * @param {tmntType} tmnt - tmnt to put 
 * @returns putted tmnt or null
 */
export const putTmnt = async (tmnt: tmntType): Promise<tmntType | null> => { 
  
  try {
    if (!tmnt || !isValidBtDbId(tmnt.id, 'tmt')) return null
    // further sanatation and validation done in POST route
    const tmntJSON = JSON.stringify(tmnt);
    const response = await axios({
      method: "put",
      data: tmntJSON,
      withCredentials: true,
      url: oneTmntUrl + tmnt.id,
    });
    if (response.status !== 200) return null
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
  } catch (err) {
    return null;
  }
}

/**
 * deletes a tmnt
 * 
 * @param {string} id - id of tmnt to delete
 * @returns - true if deleted, false if not
 */
export const deleteTmnt = async (id: string): Promise<boolean> => {

  try {
    if (!id || !isValidBtDbId(id, 'tmt')) return false
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneTmntUrl + id,
    });
    return (response.status === 200);
  } catch (err) {
    return false;
  }
}

/**
 * deletes all data for tmnt
 * 
 * @param {string} tmntId - id of tmnt to delete all data for
 * @returns {ioDataErrorsType} - save code: 0 for good delete, <0 for error
 */
export const deleteAllDataForTmnt = async (tmntId: string): Promise<ioDataErrorsType> => {
  const elimDelCount = await deleteAllTmntElims(tmntId);
  const brktsDelCount = await deleteAllTmntBrkts(tmntId);  
  const potsDelCount = await deleteAllTmntPots(tmntId);
  const lanesDelCount = await deleteAllTmntLanes(tmntId);
  const squadsDelCount = await deleteAllTmntSquads(tmntId);
  const divsDelCount = await deleteAllTmntDivs(tmntId);
  const eventsDelCount = await deleteAllTmntEvents(tmntId);
  const tmntDel = await deleteTmnt(tmntId);

  if (elimDelCount < 0) return ioDataErrorsType.Elims;
  if (brktsDelCount < 0) return ioDataErrorsType.Brkts;
  if (potsDelCount < 0) return ioDataErrorsType.Pots;
  if (lanesDelCount < 0) return ioDataErrorsType.Lanes;
  if (squadsDelCount < 0) return ioDataErrorsType.Squads;
  if (divsDelCount < 0) return ioDataErrorsType.Divs;
  if (eventsDelCount < 0) return ioDataErrorsType.Events;
  if (!tmntDel) return ioDataErrorsType.Tmnt;
  return ioDataErrorsType.None
}

export const exportedForTesting = {  
  getTmntsForYear,
  getUpcomingTmnts
}
