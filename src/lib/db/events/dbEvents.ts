import axios from "axios";
import { baseEventsApi } from "@/lib/db/apiPaths";
import { testBaseEventsApi } from "../../../../test/testApi";
import { eventType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankEvent } from "../initVals";
import { validateEvents } from "@/app/api/events/validate";

const url = testBaseEventsApi.startsWith("undefined")
  ? baseEventsApi
  : testBaseEventsApi;   
const eventUrl = url + "/event/"; 
const manyUrl = url + "/many";
const tmntUrl = url + "/tmnt/";  

/**
 * extracts events from GET API response
 * 
 * @param {any} events - array of events from GET API response
 * @returns {eventType[]} - array of events 
 */
export const extractEvents = (events: any): eventType[] => {
  if (!events || !Array.isArray(events)) return [];
  return events.map((event: any) => ({
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
  }));
}

/**
 * gets events for a tmnt
 * 
 * @param {string} tmntId - id of tmnt to get events for
 * @returns {eventType[]} - array of events
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllEventsForTmnt = async (tmntId: string): Promise<eventType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`getAllEventsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching events`)
  }
  return extractEvents(response.data.events)
}

/**
 * posts an event
 * 
 * @param {eventType} event - event to post
 * @returns - event posted
 * @throws {Error} - if event is invalid or API call fails
 */  
export const postEvent = async (event: eventType): Promise<eventType> => {
  if (!event || !isValidBtDbId(event.id, 'evt')) { 
    throw new Error("Invalid event data");
  }
  let response;
  try {
    // further sanatation and validation done in POST route
    const eventJSON = JSON.stringify(event);
    response = await axios.post(url, eventJSON, { withCredentials: true });    
  } catch (err) {
    throw new Error(`postEvent failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.event) {
    throw new Error('Error posting event')
  }
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
  return postedEvent;
}

/**
 * posts many events
 * 
 * @param {eventType[]} events - array of events to post
 * @returns {number} - number of events posted
 * @throws {Error} - if events are invalid or API call fails
 */
export const postManyEvents = async (events: eventType[]): Promise<number> => {
  if (!events || !Array.isArray(events)) { 
    throw new Error("Invalid event data");
  }
  if (events.length === 0) return 0; // not an error, just no events to post
  const validEvents = validateEvents(events);
  if (validEvents.errorCode !== ErrorCode.None
    || validEvents.events.length !== events.length)
  { 
    if (validEvents.events.length === 0) {      
      throw new Error('Invalid event data at index 0');
    }
    const errorIndex = events.findIndex(event => !isValidBtDbId(event.id, "evt"));
    if (errorIndex < 0) {
      throw new Error(`Invalid event data at index ${validEvents.events.length}`);
    } else {
      throw new Error(`Invalid event data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const eventsJSON = JSON.stringify(events);  
    response = await axios.post(manyUrl, eventsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyEvents failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting events");
  }
  return response.data.count;  
}

/**
 * puts an event
 * 
 * @param {eventType} event - event to put
 * @returns - event putted
 * @throws {Error} - if event is invalid or API call fails
 */  
export const putEvent = async (event: eventType): Promise<eventType> => {
  if (!event || !isValidBtDbId(event.id, 'evt')) { 
    throw new Error("Invalid event data");
  }
  let response;
  try {  
    const eventJSON = JSON.stringify(event);  
    response = await axios.put(eventUrl + event.id, eventJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`putEvent failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.event) {
    throw new Error("Error putting event");
  }
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
}

/**
 * deletes an event
 * 
 * @param {string} id - id of event to delete
 * @returns - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */  
export const deleteEvent = async (id: string): Promise<number> => { 
  if (!isValidBtDbId(id, "evt")) { 
    throw new Error("Invalid event id");
  }
  let response;
  try {
    response = await axios.delete(eventUrl + id, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteEvent failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting event");
  }
  return response.data.count;
}

/**
 * deletes all events for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with events to delete
 * @returns - # of rows deleted
 */
export const deleteAllEventsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteAllEventsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.count !== "number") {
    throw new Error("Error deleting events for tmnt");
  }
  return response.data.count
}