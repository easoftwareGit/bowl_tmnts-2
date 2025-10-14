import { validateEvents } from "@/app/api/events/validate";
import { eventType, validEventsType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { deleteAllEventsForTmnt, postManyEvents } from "./dbEvents";

/**
 * updates, inserts or deletes many events via delete all then post all 
 * 
 * @param {eventType[]} events - array of events to update, insert or delete
 * @param {string} tmntId - id of tmnt
 * @returns {number} number of events saved 
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyEvents = async (events: eventType[], tmntId: string): Promise<number> => {

  if (!events || !Array.isArray(events)) {
    throw new Error("Invalid events");
  }
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let validEvents: validEventsType = { events: [], errorCode: ErrorCode.None };
  if (events.length !== 0) {
    validEvents = validateEvents(events);
  }  
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
  try {
    await deleteAllEventsForTmnt(tmntId); // throws on failure    
    return await postManyEvents(validEvents.events); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace events: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
