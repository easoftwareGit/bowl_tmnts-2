import axios from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../../test/testApi";
import { eventType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankEvent } from "../initVals";

const url = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;   
const oneEventUrl = url + "/event/"; 
const oneTmntUrl = url + "/tmnt/";  
const manyUrl = url + "/many";

/**
 * gets events for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get events for
 * @returns {eventType[] | null} - array of events or null
 */
export const getAllEventsForTmnt = async (tmntId: string): Promise<eventType[] | null> => {

  try {
    if (!tmntId || !isValidBtDbId(tmntId, "tmt")) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null
    const dbEvents = response.data.events
    const events: eventType[] = dbEvents.map((event: any) => {
      return {
        ...blankEvent,
        id: event.id,
        tmnt_id: event.tmnt_id,
        event_name: event.event_name,
        tab_title: event.event_name,
        team_size: event.team_size,        
        games: event.games,        
        entry_fee: event.entry_fee,        
        lineage: event.lineage,        
        prize_fund: event.prize_fund,        
        other: event.other,        
        expenses: event.expenses,        
        added_money: event.added_money,        
        lpox: event.entry_fee,
        sort_order: event.sort_order,              
      }
    })
    return events
  } catch (err) {
    return null;
  }
}

/**
 * posts an event
 * 
 * @param {eventType} event - event to post
 * @returns - event posted or null
 */  
export const postEvent = async (event: eventType): Promise<eventType | null> => {
  
  try {
    if (!event || !isValidBtDbId(event.id, 'evt')) return null
    // further sanatation and validation done in POST route
    const eventJSON = JSON.stringify(event);    
    const response = await axios({
      method: "post",
      data: eventJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null
    const dbEvent = response.data.event
    const postedEvent: eventType = {
      ...blankEvent,
      id: dbEvent.id,
      tmnt_id: dbEvent.tmnt_id,
      event_name: dbEvent.event_name,
      tab_title: dbEvent.event_name,
      team_size: dbEvent.team_size,        
      games: dbEvent.games,        
      entry_fee: dbEvent.entry_fee,        
      lineage: dbEvent.lineage,        
      prize_fund: dbEvent.prize_fund,        
      other: dbEvent.other,        
      expenses: dbEvent.expenses,        
      added_money: dbEvent.added_money,        
      lpox: dbEvent.entry_fee,        
      sort_order: dbEvent.sort_order,
    }
    return postedEvent
  } catch (err) {
    return null;
  }
}

/**
 * posts many events
 * 
 * @param {eventType[]} events - array of events to post
 * @returns {eventType[] | null} - array of events posted or null
 */
export const postManyEvents = async (events: eventType[]): Promise<eventType[] | null> => {

  try {    
    // sanatation and validation done in POST route
    const eventJSON = JSON.stringify(events);    
    const response = await axios({
      method: "post",
      data: eventJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null
    const dbEvents = response.data.events
    const postedEvents: eventType[] = dbEvents.map((event: any) => {
      return {
        ...blankEvent,
        id: event.id,
        tmnt_id: event.tmnt_id,
        event_name: event.event_name,
        tab_title: event.event_name,
        team_size: event.team_size,        
        games: event.games,        
        entry_fee: event.entry_fee,        
        lineage: event.lineage,        
        prize_fund: event.prize_fund,        
        other: event.other,        
        expenses: event.expenses,        
        added_money: event.added_money,        
        lpox: event.entry_fee,        
        sort_order: event.sort_order,
      }
    })
    return postedEvents
  } catch (err) {
    return null;
  }
}

/**
 * puts an event
 * 
 * @param {eventType} event - event to put
 * @returns - event putted or null
 */  
export const putEvent = async (event: eventType): Promise<eventType | null> => {
  
  try {
    if (!event || !isValidBtDbId(event.id, 'evt')) return null
    // further sanatation and validation done in POST route
    const eventJSON = JSON.stringify(event);    
    const response = await axios({
      method: "put",
      data: eventJSON,
      withCredentials: true,
      url: oneEventUrl + event.id,
    });
    if (response.status !== 200) return null
    const dbEvent = response.data.event
    const puttedEvent: eventType = {
      ...blankEvent,
      id: dbEvent.id,
      tmnt_id: dbEvent.tmnt_id,
      event_name: dbEvent.event_name,
      tab_title: dbEvent.event_name,
      team_size: dbEvent.team_size,        
      games: dbEvent.games,        
      entry_fee: dbEvent.entry_fee,        
      lineage: dbEvent.lineage,        
      prize_fund: dbEvent.prize_fund,        
      other: dbEvent.other,        
      expenses: dbEvent.expenses,        
      added_money: dbEvent.added_money,        
      lpox: dbEvent.entry_fee,        
      sort_order: dbEvent.sort_order,
    }
    return puttedEvent
  } catch (err) {
    return null;
  }
}

/**
 * deletes an event
 * 
 * @param {string} id - id of event to delete
 * @returns - 1 if deleted, -1 if not found or error
 */  
export const deleteEvent = async (id: string): Promise<number> => { 

  try {
    if (!id || !isValidBtDbId(id, "evt")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneEventUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all events for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with events to delete
 * @returns - # of rows deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllTmntEvents = async (tmntId: string): Promise<number> => {
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