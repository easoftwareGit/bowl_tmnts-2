import axios from "axios";
import { baseSquadsApi } from "@/lib/db/apiPaths";
import { testBaseSquadsApi } from "../../../../test/testApi";
import { brktEntryType, brktType, dataOneSquadEntriesType, dataOneTmntType, divEntryType, divType, elimEntryType, elimType, oneBrktsAndSeedsType, oneBrktType, playerType, potEntryType, potType, squadType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { removeTimeFromISODateStr } from "@/lib/dateTools";
import { blankBrktEntry, blankDivEntry, blankElimEntry, blankPlayer, blankPotEntry, blankSquad, defaultBrktGames, defaultPlayersPerMatch, initOneBrkt } from "../initVals";
import { btDbUuid } from "@/lib/uuid";
import { BracketList } from "@/components/brackets/bracketListClass";
import { Bracket } from "@/components/brackets/bracketClass";
import { validateSquads } from "@/app/api/squads/validate";

const url = testBaseSquadsApi.startsWith("undefined")
  ? baseSquadsApi
  : testBaseSquadsApi;  
const entriesUrl = url + '/entries/';
const eventUrl = url + "/event/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/"; 
const tmntUrl = url + "/tmnt/";
const withSeedsUrl = url + "/withSeeds/";
   
/**
 * extracts squads from GET APT response
 * 
 * @param {any} squads - array of squads from GET APT response
 * @returns {squadType[]} - array of squads
 */
export const extractSquads = (squads: any): squadType[] => {
  if (!squads || !Array.isArray(squads)) return [];
  return squads.map((squad: any) => ({
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
  }));
}

/**
 * gets all squads for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get squads for
 * @returns {squadType[]} - array of squads
 */
export const getAllSquadsForTmnt = async (tmntId: string): Promise<squadType[]> => {
  if (!isValidBtDbId(tmntId, 'tmt')) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllSquadsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching squads`)
  }
  return extractSquads(response.data.squads);
}

const getBracketListForSquad = (oneBrktsAndSeeds: oneBrktsAndSeedsType[]): BracketList[] => {

  if (!oneBrktsAndSeeds || !Array.isArray(oneBrktsAndSeeds) || oneBrktsAndSeeds.length === 0) return [];
  const brktLists: BracketList[] = [];
  let brktId = '';
  let newBrktList: BracketList | null = null;
  let oneBrktId = '';
  let players: string[] = [];
  oneBrktsAndSeeds.forEach(oneBrktAndSeed => {
    if (oneBrktAndSeed.brkt_id !== brktId) {      
      if (newBrktList) {
        brktLists.push(newBrktList);
      }
      newBrktList = new BracketList(oneBrktAndSeed.brkt_id, defaultPlayersPerMatch, defaultBrktGames);
      brktId = oneBrktAndSeed.brkt_id;
    }
    if (oneBrktAndSeed.seed === 0) { 
      players.length = 0;
      oneBrktId = oneBrktAndSeed.one_brkt_id;
    } 
    players.push(oneBrktAndSeed.player_id);    
    if (oneBrktAndSeed.seed === 7
      && newBrktList
      && oneBrktId === oneBrktAndSeed.one_brkt_id)
    {
      const bracket = new Bracket(newBrktList, oneBrktId);
      bracket.fillBracket(players);
      newBrktList.brackets.push(bracket);
    }
  })
  if (newBrktList) {
    brktLists.push(newBrktList);
  }
  return brktLists;
}

/**
 * get all entries for a squad
 *  
 * @param {string} squadId - id of squad
 * @returns {dataOneSquadEntriesType | null} - all entries for squad
 */
// export const getAllEntriesForSquad = async (squadId: string): Promise<dataOneSquadEntriesType | null> => { 
//   if (!isValidBtDbId(squadId, 'sqd')) return null
//   try {
//     const allTmntEntries: dataOneSquadEntriesType = {
//       squadId: squadId,
//       players: [],
//       divEntries: [],
//       potEntries: [],
//       brktEntries: [],
//       brktLists: [],
//       elimEntries: [],
//     }

//     const aePlayers = await getAllPlayersForSquad(squadId);
//     if (!aePlayers) return null
//     allTmntEntries.players = [...aePlayers];

//     const aeDivs = await getAllDivEntriesForSquad(squadId);
//     if (!aeDivs) return null
//     allTmntEntries.divEntries = [...aeDivs];

//     const aePots = await getAllPotEntriesForSquad(squadId);
//     if (!aePots) return null
//     allTmntEntries.potEntries = [...aePots];

//     const aeBrkts = await getAllBrktEntriesForSquad(squadId);
//     if (!aeBrkts) return null
//     allTmntEntries.brktEntries = [...aeBrkts];

//     const aeElims = await getAllElimEntriesForSquad(squadId);
//     if (!aeElims) return null
//     allTmntEntries.elimEntries = [...aeElims];

//     if (aeBrkts.length > 0) {
//       const aeOneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(squadId);
//       if (!aeOneBrktsAndSeeds) return null
//       populateBracketList(aeOneBrktsAndSeeds);
//     }

//     return allTmntEntries
//   } catch (err) {
//     return null;
//   }
// }

/**
 * gets all players for a squad from squad entries
 * 
 * @param {any[]} squadEntries - entries for a squad
 * @param {string} squadId - squad id
 * @returns {playerType[]} - players for a squad
 */
const getAllPlayersForSquad2 = (squadEntries: any[], squadId: string): playerType[] => {  
  if (!squadEntries || squadEntries.length === 0) return [];
  try {    
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
  if (!squadEntries || squadEntries.length === 0) return [];
  try {    
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
  if (!squadEntries || squadEntries.length === 0) return [];
  try {    
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
  if (!squadEntries || squadEntries.length === 0) return [];
  try {    
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
  if (!squadEntries || squadEntries.length === 0) return [];
  try {    
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

const testingGetAllEntriesForSquad2 = async (curData: dataOneTmntType): Promise<Record<string, any>[] | null> => { 
  const squadId = curData.squads[0].id; // already checked for validity above  
  const response = await axios({
    method: "get",
    withCredentials: true,
    url: entriesUrl + squadId,        
    params: { curData: JSON.stringify(curData) }
  }); 
  return (response.status === 200) ? response.data.squadEntries : null;  
}

/**
 * Get all oneBrkts and seeds for a squad in one array of objects
 * 
 * @param squadId - id of squad to get oneBrkts and seeds for
 * @returns - array of oneBrkts and seeds for squad 
 * @throws {Error} - if squadId is invalid or API call fails
 */
export const getAllOneBrktsAndSeedsForSquad = async (squadId: string): Promise<oneBrktsAndSeedsType[]> => { 
  if (!isValidBtDbId(squadId, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try {
    response = await axios.get(withSeedsUrl + squadId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllOneBrktsAndSeedsForSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching oneBrkts and seeds`)
  }    
  return response.data.oneBrktsAndSeeds;
}

/**
 * get all entries for a squad
 *  
 * @param {dataOneTmntType} curData - current tournament data
 * @returns {dataOneSquadEntriesType} - all entries for squad
 * @throws {Error} - if curData is invalid or API call fails
 */
export const getAllEntriesForSquad2 = async (curData: dataOneTmntType): Promise<dataOneSquadEntriesType> => {

  if (!curData) { 
    throw new Error("Invalid curData data");
  };
  if (!curData.squads
    || curData.squads.length === 0
    || !isValidBtDbId(curData.squads[0].id, 'sqd')
  ) { 
    throw new Error("Invalid squad data");
  }
  if (!curData.divs || curData.divs.length === 0) { 
    throw new Error("Invalid div data");
  }
  if (!curData.pots) { 
    throw new Error("Invalid pot data");
  }
  if (!curData.brkts) { 
    throw new Error("Invalid brkt data");
  }
  if (!curData.elims) { 
    throw new Error("Invalid elim data");
  }
  let response;
  const squadId = curData.squads[0].id; // already checked for validity above
  try {
    response = await axios.get(entriesUrl + squadId, {
      withCredentials: true,
      params: { curData: JSON.stringify(curData) }
    });    
  } catch (err) {
    throw new Error(`getAllEntriesForSquad2 failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching entries`);
  }
  const squadEntries = response.data.squadEntries;

  const oneBrktsAndSeeds = await getAllOneBrktsAndSeedsForSquad(squadId);
  if (!oneBrktsAndSeeds) { 
    throw new Error("Invalid oneBrktsAndSeeds data");
  };

  const allTmntEntries: dataOneSquadEntriesType = {      
    squadId: curData.squads[0].id,
    players: getAllPlayersForSquad2(squadEntries, curData.squads[0].id),
    divEntries: getAllDivEntriesForSquad2(squadEntries, curData),
    potEntries: getAllPotEntriesForSquad2(squadEntries, curData),     
    brktEntries: getAllBrktEntriesForSquad2(squadEntries, curData),
    brktLists: getBracketListForSquad(oneBrktsAndSeeds),
    elimEntries: getAllElimEntriesForSquad2(squadEntries, curData)
  }
  return allTmntEntries
}

/**
 * post a new squad
 * 
 * @param {squadType} squad - squad to post
 * @returns {squadType} - posted squad 
 * @throws {Error} - if data is invalid or API call fails
 */  
export const postSquad = async (squad: squadType): Promise<squadType> => {
  if (!squad || !isValidBtDbId(squad.id, 'sqd')) { 
    throw new Error("Invalid squad data");
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const squadJSON = JSON.stringify(squad);
    response = await axios.post(url, squadJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`postSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.squad) {
    throw new Error("Error posting squad");
  }
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
}

/**
 * post many squads
 * 
 * @param {squadType[]} squads - array of squads to post
 * @returns {number} - number of posted squads
 * @throws {Error} - if data is invalid or API call fails
 */
export const postManySquads = async (squads: squadType[]): Promise<number> => { 
  if (!squads || !Array.isArray(squads)) { 
    throw new Error("Invalid squads data");
  }
  if (squads.length === 0) return 0; // not an error, just no data to post
  const validSquads = validateSquads(squads);
  if (validSquads.errorCode !== ErrorCode.None
    || validSquads.squads.length !== squads.length)
  { 
    if (validSquads.squads.length === 0) {      
      throw new Error('Invalid squad data at index 0');
    }
    const errorIndex = squads.findIndex(squad => !isValidBtDbId(squad.id, "sqd"));
    if (errorIndex < 0) {
      throw new Error(`Invalid squad data at index ${validSquads.squads.length}`);
    } else {
      throw new Error(`Invalid squad data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const squadsJSON = JSON.stringify(squads);  
    response = await axios.post(manyUrl, squadsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManySquads failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting squads");
  }
  return response.data.count;
}

/**
 * puts a squad
 * 
 * @param {squadType} squad - squad to put
 * @returns {squadType} - putted squad
 * @throws {Error} - if data is invalid or API call fails
 */
export const putSquad = async (squad: squadType): Promise<squadType> => { 
  if (!squad || !isValidBtDbId(squad.id, 'sqd')) { 
    throw new Error("Invalid squad data");
  }
  let response;
  try { 
    // further sanatation and validation done in PUT route
    const squadJSON = JSON.stringify(squad);
    response = await axios.put(squadUrl + squad.id, squadJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.squad) {
    throw new Error("Error putting squad");
  }
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
  return puttedSquad;
}

/**
 * deletes a squad
 * 
 * @param {string} id - id of squad to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteSquad = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "sqd")) { 
    throw new Error("Invalid squad id");
  }
  let response;
  try { 
    response = await axios.delete(squadUrl + id, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteSquad failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error("Error deleting squad");
  }
  return 1;
}

/**
 * deletes all squads for an event
 * 
 * @param {string} eventId - id of event to delete all event squads 
 * @returns {number} - # of squads deleted
 * @throws {Error} - if eventId is invalid or API call fails
 */
export const deleteAllSquadsForEvent = async (eventId: string): Promise<number> => {
  if (!isValidBtDbId(eventId, "evt")) { 
    throw new Error("Invalid event id");
  }
  let response;
  try { 
    response = await axios.delete(eventUrl + eventId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllSquadsForEvent failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting squads for event");
  }
  return response.data.deleted.count
}

/**
 * deletes all squads for a tmnt
 * 
 * @param tmntId - id of tmnt with squads to delete
 * @returns {number} - # of squads deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllSquadsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try { 
    response = await axios.delete(tmntUrl + tmntId, {
      withCredentials: true,
    });
  } catch (err) {
    throw new Error(`deleteAllSquadsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting squads for tmnt");
  }
  return response.data.deleted.count
}

export const exportedForTesting = {
  getAllPlayersForSquad2,
  getAllDivEntriesForSquad2,
  getAllPotEntriesForSquad2, 
  getAllBrktEntriesForSquad2,
  getAllElimEntriesForSquad2,
  getBracketListForSquad,  
  testingGetAllEntriesForSquad2,
}