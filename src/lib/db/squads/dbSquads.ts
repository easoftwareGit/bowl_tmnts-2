import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../../test/testApi";
import { dataOneSquadEntriesType, squadType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { removeTimeFromISODateStr, startOfDayFromString } from "@/lib/dateTools";
import { blankSquad } from "../initVals";
import { getAllPlayersForSquad } from "../players/dbPlayers";
import { getAllDivEntriesForSquad } from "../divEntries/dbDivEntries";
import { getAllPotEntriesForSquad } from "../potEntries/dbPotEntries";
import { getAllBrktEntriesForSquad, getAllRawBrktEntriesForSquad } from "../brktEntries/dbBrktEntries";
import { getAllElimEntriesForSquad } from "../elimEntries/dbElimEntries";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;  
const oneSquadUrl = url + "/squad/"; 
const oneEventUrl = url + "/event/";
const oneTmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";
   
/**
 * gets all squads for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get squads for
 * @returns {squadType[] | null} - array of squads or null
 */
export const getAllSquadsForTmnt = async (tmntId: string): Promise<squadType[] | null> => {

  try {
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId 
    });
    if (response.status !== 200) return null
    const tmntSquads = response.data.squads
    const squads: squadType[] = tmntSquads.map((squad: any) => {
      return {
        ...blankSquad,
        id: squad.id,
        event_id: squad.event_id,          
        squad_name: squad.squad_name,
        tab_title: squad.squad_name,                
        games: squad.games,          
        lane_count: squad.lane_count,        
        starting_lane: squad.starting_lane,        
        squad_date_str: removeTimeFromISODateStr(squad.squad_date),        
        squad_time: squad.squad_time,        
        sort_order: squad.sort_order,        
      }
    })
    return squads
  } catch (err) {
    return null;
  }  
}

/**
 * get all entries for a squad
 *  
 * @param {string} squadId - id of squad
 * @returns {dataOneSquadEntriesType | null} - all entries for squad
 */
export const getAllEntriesForSquad = async (squadId: string): Promise<dataOneSquadEntriesType | null> => { 
  if (!squadId || !isValidBtDbId(squadId, 'sqd')) return null
  try {
    const allTmntEntries: dataOneSquadEntriesType = {      
      squadId: squadId,
      players: [],
      divEntries: [],
      potEntries: [],
      // brktEntries: [],
      rawBrktEntries: [],
      elimEntries: [],
    }

    const aePlayers = await getAllPlayersForSquad(squadId);
    if (!aePlayers) return null
    allTmntEntries.players = [...aePlayers];

    const aeDivs = await getAllDivEntriesForSquad(squadId);
    if (!aeDivs) return null
    allTmntEntries.divEntries = [...aeDivs];

    const aePots = await getAllPotEntriesForSquad(squadId);
    if (!aePots) return null
    allTmntEntries.potEntries = [...aePots];

    // const aeBrkts = await getAllBrktEntriesForSquad(squadId);
    // if (!aeBrkts) return null
    // allTmntEntries.brktEntries = [...aeBrkts];

    const aeBrkts = await getAllRawBrktEntriesForSquad(squadId);
    if (!aeBrkts) return null
    allTmntEntries.rawBrktEntries = [...aeBrkts];

    const aeElims = await getAllElimEntriesForSquad(squadId);
    if (!aeElims) return null
    allTmntEntries.elimEntries = [...aeElims];

    return allTmntEntries
  } catch (err) {
    return null;
  }
}

/**
 * post a new squad
 * 
 * @param {squadType} squad - squad to post
 * @returns - posted squad or null 
 */  
export const postSquad = async (squad: squadType): Promise<squadType | null> => {

  try {
    if (!squad || !isValidBtDbId(squad.id, 'sqd')) return null
    // further sanatation and validation done in POST route
    const squadJSON = JSON.stringify(squad);
    const response = await axios({
      method: "post",
      data: squadJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null
    const dbSquad = response.data.squad
    const postedSquad: squadType = {
      ...blankSquad,
      id: dbSquad.id,
      event_id: dbSquad.event_id,          
      squad_name: dbSquad.squad_name,
      tab_title: dbSquad.squad_name,                
      games: dbSquad.games,          
      lane_count: dbSquad.lane_count,        
      starting_lane: dbSquad.starting_lane,        
      squad_date_str: removeTimeFromISODateStr(dbSquad.squad_date),        
      squad_time: dbSquad.squad_time,        
      sort_order: dbSquad.sort_order,
    }
    return postedSquad
  } catch (err) {
    return null;
  }
}

/**
 * post many squads
 * 
 * @param {squadType[]} squads - array of squads to post
 * @returns {squadType[] | null} - array of posted squads or null
 */
export const postManySquads = async (squads: squadType[]): Promise<squadType[] | null> => { 

  try {
    // sanatation and validation done in POST route
    const squadJSON = JSON.stringify(squads);
    const response = await axios({
      method: "post",
      data: squadJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null
    const dbSquads = response.data.squads
    const postedSquads: squadType[] = dbSquads.map((squad: any) => {
      return {
        ...blankSquad,
        id: squad.id,
        event_id: squad.event_id,          
        squad_name: squad.squad_name,
        tab_title: squad.squad_name,                
        games: squad.games,          
        lane_count: squad.lane_count,        
        starting_lane: squad.starting_lane,        
        squad_date_str: removeTimeFromISODateStr(squad.squad_date),        
        squad_time: squad.squad_time,        
        sort_order: squad.sort_order,
      }
    })
    return postedSquads
  } catch (err) {
    return null;
  }
}

/**
 * puts a squad
 * 
 * @param {squadType} squad - squad to put
 * @returns - putted squad or null
 */
export const putSquad = async (squad: squadType): Promise<squadType | null> => { 

  try {
    if (!squad || !isValidBtDbId(squad.id, 'sqd')) return null
    // further sanatation and validation done in POST route
    const squadJSON = JSON.stringify(squad);
    const response = await axios({
      method: "put",
      data: squadJSON,
      withCredentials: true,
      url: oneSquadUrl + squad.id,
    });
    if (response.status !== 200) return null
    const dbSquad = response.data.squad
    const puttedSquad: squadType = {
      ...blankSquad,
      id: dbSquad.id,
      event_id: dbSquad.event_id,          
      squad_name: dbSquad.squad_name,
      tab_title: dbSquad.squad_name,                
      games: dbSquad.games,          
      lane_count: dbSquad.lane_count,        
      starting_lane: dbSquad.starting_lane,        
      squad_date_str: removeTimeFromISODateStr(dbSquad.squad_date),        
      squad_time: dbSquad.squad_time,        
      sort_order: dbSquad.sort_order,
    }
    return puttedSquad
  } catch (err) {
    return null;
  }
}

/**
 * deletes a squad
 * 
 * @param {string} id - id of squad to delete
 * @returns {number} - 1 if deleted, -1 if not found or error
 */
export const deleteSquad = async (id: string): Promise<number> => {

  try {
    if (!id || !isValidBtDbId(id, "sqd")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneSquadUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all event squads
 * 
 * @param {string} eventId - id of event to delete all event squads 
 * @returns {number} - # of squads deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllEventSquads = async (eventId: string): Promise<number> => {
  try {
    if (!eventId || !isValidBtDbId(eventId, "evt")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneEventUrl + eventId,
    });
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all tmnt squads
 * 
 * @param tmntId - id of tmnt with squads to delete
 * @returns {number} - # of squads deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntSquads = async (tmntId: string): Promise<number> => {
  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}