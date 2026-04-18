import { publicApi, privateApi } from "@/lib/api/axios";
import { baseEventsApi } from "@/lib/api/apiPaths";
import { testBaseEventsApi } from "../../../../test/testApi";
import type { eventType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { blankEvent } from "../initVals";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseEventsApi
  ? testBaseEventsApi
  : baseEventsApi;

const eventUrl = url + "/event/";
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
    lpox: event.entry_fee, // no need to calculate, fee = lpox
    sort_order: event.sort_order,
  }));
};

/**
 * maps one db event object to eventType
 *
 * @param {any} event - event from API response
 * @returns {eventType} - mapped event
 */
const mapEvent = (event: any): eventType => ({
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
});

/**
 * gets events for a tmnt
 *
 * @param {string} tmntId - id of tmnt to get events for
 * @returns {eventType[]} - array of events
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllEventsForTmnt = async (
  tmntId: string
): Promise<eventType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error("Invalid tmnt id");
  }

  try {
    const response = await publicApi.get(tmntUrl + tmntId);
    return extractEvents(response.data?.events);
  } catch (err) {
    throw new Error(
      `getAllEventsForTmnt failed: ${
        err instanceof Error ? err.message : err
      }`
    );
  }
};

/**
 * posts an event
 *
 * @param {eventType} event - event to post
 * @returns {eventType} - event posted
 * @throws {Error} - if event is invalid or API call fails
 */
export const postEvent = async (event: eventType): Promise<eventType> => {
  if (!event || !isValidBtDbId(event.id, "evt")) {
    throw new Error("Invalid event data");
  }

  try {
    // further sanitation and validation done in POST route
    const eventJSON = JSON.stringify(event);
    const response = await privateApi.post(url, eventJSON);

    if (!response.data?.event) {
      throw new Error("Error posting event");
    }

    return mapEvent(response.data.event);
  } catch (err) {
    throw new Error(
      `postEvent failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * puts an event
 *
 * @param {eventType} event - event to put
 * @returns {eventType} - event put
 * @throws {Error} - if event is invalid or API call fails
 */
export const putEvent = async (event: eventType): Promise<eventType> => {
  if (!event || !isValidBtDbId(event.id, "evt")) {
    throw new Error("Invalid event data");
  }

  try {
    const eventJSON = JSON.stringify(event);
    const response = await privateApi.put(eventUrl + event.id, eventJSON);

    if (!response.data?.event) {
      throw new Error("Error putting event");
    }

    return mapEvent(response.data.event);
  } catch (err) {
    throw new Error(
      `putEvent failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * deletes an event
 *
 * @param {string} id - id of event to delete
 * @returns {number} - 1 if deleted
 * @throws {Error} - if id is invalid or API call fails
 */
export const deleteEvent = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "evt")) {
    throw new Error("Invalid event id");
  }

  try {
    const response = await privateApi.delete(eventUrl + id);

    if (typeof response.data?.count !== "number") {
      throw new Error("Error deleting event");
    }

    return response.data.count;
  } catch (err) {
    throw new Error(
      `deleteEvent failed: ${err instanceof Error ? err.message : err}`
    );
  }
};
