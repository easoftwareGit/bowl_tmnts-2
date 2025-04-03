import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../../test/testApi";
import { brktEntryType, brktType, dataOneSquadEntriesType, dataOneTmntType, divEntryType, divType, elimEntryType, elimType, playerType, potEntryType, potType, squadType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { removeTimeFromISODateStr } from "@/lib/dateTools";
import { blankBrktEntry, blankDivEntry, blankElimEntry, blankPlayer, blankPotEntry, blankSquad } from "../initVals";
import { getAllPlayersForSquad } from "../players/dbPlayers";
import { getAllDivEntriesForSquad } from "../divEntries/dbDivEntries";
import { getAllPotEntriesForSquad } from "../potEntries/dbPotEntries";
import { getAllBrktEntriesForSquad } from "../brktEntries/dbBrktEntries";
import { getAllElimEntriesForSquad } from "../elimEntries/dbElimEntries";
import { btDbUuid } from "@/lib/uuid";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;  
const oneSquadUrl = url + "/squad/"; 
const oneEventUrl = url + "/event/";
const entriesUrl = url + '/entries/';
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
      brktEntries: [],
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

    const aeBrkts = await getAllBrktEntriesForSquad(squadId);
    if (!aeBrkts) return null
    allTmntEntries.brktEntries = [...aeBrkts];

    const aeElims = await getAllElimEntriesForSquad(squadId);
    if (!aeElims) return null
    allTmntEntries.elimEntries = [...aeElims];

    return allTmntEntries
  } catch (err) {
    return null;
  }
}

/**
 * gets all players for a squad from squad entries
 * 
 * @param {any[]} squadEntries - entries for a squad
 * @param {string} squadId - squad id
 * @returns {playerType[]} - players for a squad
 */
const getAllPlayersForSquad2 = (squadEntries: any[], squadId: string):playerType[]  => {
  try {
    if (!squadEntries || squadEntries.length === 0) return [];
    const players: playerType[] = [];
    squadEntries.forEach((entry: any) => {
      const player: playerType = {
        ...blankPlayer,
        id: entry.player_id,
        squad_id: squadId,
        first_name: entry.first_name,
        last_name: entry.last_name,
        average: entry.average,
        lane: entry.lane,
        position: entry.position,
      }
      players.push(player);
    })
    return players;
  } catch (err) {
    return [];
  }
};

/**
 * gets all divEntries for a squad from squad entries
 * 
 * @param {any[]} squadEntries - entries for a squad
 * @param {dataOneTmntType} curData - current tournament data
 * @returns {divEntryType[]} - all divEntries for the squad
 */
const getAllDivEntriesForSquad2 = (squadEntries: any[], curData: dataOneTmntType): divEntryType[] => { 
  try {
    if (!squadEntries || squadEntries.length === 0) return [];
    const divEntries: divEntryType[] = [];
    squadEntries.forEach((entry: any) => {
      curData.divs.forEach((div: divType) => {
        const divFeePropName = `${div.id}_fee`;
        const divHdcpPropName = `${div.id}_hdcp`;
        if (entry[divFeePropName]) {
          const divEntry: divEntryType = {
            ...blankDivEntry,
            id: btDbUuid('den'),
            squad_id: curData.squads[0].id,            
            div_id: div.id,
            player_id: entry.player_id,
            fee: entry[divFeePropName],            
            hdcp: (entry[divHdcpPropName] === null || entry[divHdcpPropName] === undefined) 
              ? 0 : entry[divHdcpPropName],
          }
          divEntries.push(divEntry);
        }        
      })
    })
    return divEntries;
  } catch (err) {
    return [];
  }
}

/**
 * get all potEntries for a squad from squad entries
 * 
 * @param {any[]} squadEntries - entries for a squad
 * @param {dataOneTmntType} curData - current tournament data
 * @returns {potEntryType[]} - potEntries for a squad 
 */
const getAllPotEntriesForSquad2 = (squadEntries: any[], curData: dataOneTmntType): potEntryType[] => { 
  try {
    if (!squadEntries || squadEntries.length === 0) return [];
    const potEntries: potEntryType[] = [];
    squadEntries.forEach((entry: any) => {
      curData.pots.forEach((pot: potType) => {
        const potFeePropName = `${pot.id}_fee`;
        if (entry[potFeePropName]) {
          const potEntry: potEntryType = {
            ...blankPotEntry,
            id: btDbUuid('pen'),
            pot_id: pot.id,
            player_id: entry.player_id,
            fee: entry[potFeePropName],
          }
          potEntries.push(potEntry);
        }        
      })
    })
    return potEntries;
  } catch (err) {
    return [];
  }
}

/**
 * Get all bracket entries for a squad from squad entries
 * 
 * @param {any[]} squadEntries - all entries for a squad
 * @param {dataOneTmntType} curData - current tournament data
 * @returns {brktEntryType[]} - all brktEntries for the squad
 */
const getAllBrktEntriesForSquad2 = (squadEntries: any[], curData: dataOneTmntType): brktEntryType[] => { 
  try {
    if (!squadEntries || squadEntries.length === 0) return [];
    const brktEntries: brktEntryType[] = [];
    squadEntries.forEach((entry: any) => {
      curData.brkts.forEach((brkt: brktType) => {
        const brktNumBrktsPropName = `${brkt.id}_num_brackets`;
        const brktFeePropName =  `${brkt.id}_fee`;
        if (entry[brktNumBrktsPropName]) {
          const brktEntry: brktEntryType = {
            ...blankBrktEntry,
            id: btDbUuid('ben'),
            brkt_id: brkt.id,
            player_id: entry.player_id,
            num_brackets: entry[brktNumBrktsPropName],
            fee: entry[brktFeePropName],
          }
          brktEntries.push(brktEntry);
        }        
      })
    })
    return brktEntries;
  } catch (err) {
    return [];
  }
}

/**
 * gets elimEntries for a squad from squad entries
 * 
 * @param {any[]} squadEntries - entries for a squad
 * @param {dataOneTmntType} curData - current tournament data
 * @returns {elimEntryType[]} - elimEntries for a squad
 */
const getAllElimEntriesForSquad2 = (squadEntries: any[], curData: dataOneTmntType): elimEntryType[] => { 
  try {
    if (!squadEntries || squadEntries.length === 0) return [];
    const elimEntries: elimEntryType[] = [];
    squadEntries.forEach((entry: any) => {
      curData.elims.forEach((elim: elimType) => {
        const elimFeePropName = `${elim.id}_fee`;
        if (entry[elimFeePropName]) {
          const elimEntry: elimEntryType = {
            ...blankElimEntry,
            id: btDbUuid('een'),
            elim_id: elim.id,
            player_id: entry.player_id,
            fee: entry[elimFeePropName],
          }
          elimEntries.push(elimEntry);
        }        
      })
    })
    return elimEntries;
  } catch (err) {
    return [];
  }
}

/**
 * get all entries for a squad
 *  
 * @param {string} squadId - id of squad
 * @returns {dataOneSquadEntriesType | null} - all entries for squad
 */
export const getAllEntriesForSquad2 = async (curData: dataOneTmntType): Promise<dataOneSquadEntriesType | null> => {
  if (!curData
    || !curData.squads
    || curData.squads.length === 0 
    || !isValidBtDbId(curData.squads[0].id, 'sqd')
    || !curData.divs
    || curData.divs.length === 0
    || !curData.pots
    || !curData.brkts
    || !curData.elims) return null
  try {
    const squadID = curData.squads[0].id;
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: entriesUrl + squadID,        
      params: { curData: JSON.stringify(curData) }
    });    
    if (response.status !== 200) return null;
    const squadEntries = response.data.squadEntries;
    const allTmntEntries: dataOneSquadEntriesType = {      
      squadId: curData.squads[0].id,
      players: getAllPlayersForSquad2(squadEntries, curData.squads[0].id),
      divEntries: getAllDivEntriesForSquad2(squadEntries, curData),
      potEntries: getAllPotEntriesForSquad2(squadEntries, curData),     
      brktEntries: getAllBrktEntriesForSquad2(squadEntries, curData),
      elimEntries: getAllElimEntriesForSquad2(squadEntries, curData)
    }
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