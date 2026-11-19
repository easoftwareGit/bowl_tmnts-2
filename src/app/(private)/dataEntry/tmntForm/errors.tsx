import { sanitizeEDS } from "@/lib/validation/sanitize";
import type {
  eventType,
  divType,
  squadType,
  AcdnErrType,
  elimType,
  brktType,
} from "@/lib/types/types";
import styles from "./tmntForm.module.css";

export const objErrClassName = styles.objError;
export const acdnErrClassName = styles.acdnError;

/**
 * formats an error message
 *
 * @param {string} objName - object name
 * @param {string} objErrMsg - error message
 * @returns {string} - formatted error message
 */
export const getAcdnErrMsg = (objName: string, objErrMsg: string): string => {
  return `: Error in ${objName} - ${objErrMsg}`;
};

type Ordered = { id: string; sort_order: number };

/**
 * checks if another item in the array matches item and comes before it.
 *
 * "Comes before" means a different id and a sort_order less than or equal to
 * item's. The array does not need to be sorted. If two different items share a
 * sort_order, both are flagged, so a bad sort_order never hides a duplicate.
 *
 * @param arr - array of items to check against
 * @param item - item to check
 * @param isMatch - returns true if other matches item
 * @returns {boolean} - true if item is a duplicate of an earlier item
 */
const isDuplicateOfEarlier = <T extends Ordered>(
  arr: T[],
  item: T,
  isMatch: (other: T) => boolean,
): boolean =>
  arr.some(
    (other) =>
      other.id !== item.id &&
      other.sort_order <= item.sort_order &&
      isMatch(other),
  );

/**
 * normalizes an Event, Division or Squad name for comparing
 *
 * @param {unknown} name - name to normalize
 * @returns {string} - sanitized, lower case name
 */
const normalizeEDSName = (name: unknown): string =>
  sanitizeEDS(name).toLowerCase();

/**
 * checks if the event_name property of an event has been used in an earlier event
 *
 * @param arrOfEvents - array of events to check for duplicate names
 * @param event - event to check if contains a duplicate name
 * @returns {boolean} - true if a duplicate name
 */
export const isDuplicateEventName = (
  arrOfEvents: eventType[],
  event: eventType,
): boolean => {
  const eventName = normalizeEDSName(event.event_name);
  if (eventName.length === 0) return false;
  return isDuplicateOfEarlier(
    arrOfEvents,
    event,
    (other) => normalizeEDSName(other.event_name) === eventName,
  );
};

/**
 * checks if the div_name property of a div has been used in an earlier div
 *
 * @param arrOfDivs - array of divs to check for duplicate names
 * @param div - div to check if contains a duplicate name
 * @returns {boolean} - true if a duplicate name
 */
export const isDuplicateDivName = (
  arrOfDivs: divType[],
  div: divType,
): boolean => {
  const divName = normalizeEDSName(div.div_name);
  if (divName.length === 0) return false;
  return isDuplicateOfEarlier(
    arrOfDivs,
    div,
    (other) => normalizeEDSName(other.div_name) === divName,
  );
};

/**
 * checks if the squad_name property of a squad has been used in an earlier squad
 *
 * @param arrOfSquads - array of squads to check for duplicate names
 * @param squad - squad to check if contains a duplicate name
 * @returns {boolean} - true if a duplicate name
 */
export const isDuplicateSquadName = (
  arrOfSquads: squadType[],
  squad: squadType,
): boolean => {
  const squadName = normalizeEDSName(squad.squad_name);
  if (squadName.length === 0) return false;
  return isDuplicateOfEarlier(
    arrOfSquads,
    squad,
    (other) => normalizeEDSName(other.squad_name) === squadName,
  );
};

export const getElimErrMsg = (elim: elimType): string => {
  if (elim.fee_err) return elim.fee_err;
  if (elim.games_err) return elim.games_err;
  if (elim.start_err) return elim.start_err;
  return "";
};

export const getBrktErrMsg = (brkt: brktType): string => {
  if (brkt.fee_err) return brkt.fee_err;
  if (brkt.first_err) return brkt.first_err;
  if (brkt.fsa_err) return brkt.fsa_err;
  if (brkt.games_err) return brkt.games_err;
  if (brkt.players_err) return brkt.players_err;
  if (brkt.second_err) return brkt.second_err;
  if (brkt.start_err) return brkt.start_err;
  return "";
};

/**
 * checks if the date and time of a squad have been used in an earlier squad
 *
 * @param arrOfSquads - array of squads to check for duplicate date & time
 * @param squad - squad to check if contains a duplicate date & time
 * @returns {boolean} - true if a duplicate date & time
 */
export const isDuplicateDateTime = (
  arrOfSquads: squadType[],
  squad: squadType,
): boolean =>
  isDuplicateOfEarlier(
    arrOfSquads,
    squad,
    (other) =>
      other.squad_date_str === squad.squad_date_str &&
      other.squad_time === squad.squad_time,
  );

export const noAcdnErr: AcdnErrType = {
  errClassName: "",
  message: "",
};