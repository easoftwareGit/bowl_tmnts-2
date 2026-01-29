import { sanitize } from "@/lib/validation/sanitize";
import { eventType, divType, squadType, AcdnErrType, elimType, brktType } from "@/lib/types/types";
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
  return `: Error in ${objName} - ${objErrMsg}`
}

/**
 * checks if the event_name property of an event has been used in another event
 * 
 * @param arrOfEvents - array of events to check for duplicate names
 * @param event - event to check if contains a duplicate name
 * @returns {*} boolean: true if a duplicate name
 */
export const isDuplicateEventName = (arrOfEvents: eventType[], event: eventType): boolean => {
  let eventName = sanitize(event.event_name)
  if (eventName.length === 0) return false
  eventName = eventName.toLowerCase()
  let i = 0;
  while (i < arrOfEvents.length) {
    if (arrOfEvents[i].sort_order > event.sort_order) {
      return false;
    }
    if (arrOfEvents[i].id !== event.id &&
        arrOfEvents[i].event_name.trim().toLowerCase() === eventName) {
      return true;
    }
    i++;
  }
  return false;
}

export const isDuplicateDivName = (arrOfDivs: divType[], div: divType): boolean => {
  let divName = sanitize(div.div_name)
  if (divName.length === 0) return false
  divName = divName.toLowerCase()
  let i = 0;
  while (i < arrOfDivs.length) {
    if (arrOfDivs[i].sort_order > div.sort_order) {
      return false;
    }
    if (arrOfDivs[i].id !== div.id &&
        arrOfDivs[i].div_name.trim().toLowerCase() === divName) {
      return true;
    }
    i++;
  } 
  return false;
}

export const isDuplicateSquadName = (arrOfSquads: squadType[], squad: squadType): boolean => {
  let squadName = sanitize(squad.squad_name)
  if (squadName.length === 0) return false
  squadName = squadName.toLowerCase()
  let i = 0;
  while (i < arrOfSquads.length) {
    if (arrOfSquads[i].sort_order > squad.sort_order) {
      return false;
    }        
    if (arrOfSquads[i].id !== squad.id &&
        arrOfSquads[i].squad_name.trim().toLowerCase() === squadName) {
      return true;
    }
    i++;
  }
  return false;
}

export const getElimErrMsg = (elim: elimType): string => {
  if (elim.fee_err) return elim.fee_err;
  if (elim.games_err) return elim.games_err;
  if (elim.start_err) return elim.start_err;
  return '';
}

export const getBrktErrMsg = (brkt: brktType): string => {
  if (brkt.fee_err) return brkt.fee_err;
  if (brkt.first_err) return brkt.first_err;
  if (brkt.fsa_err) return brkt.fsa_err;
  if (brkt.games_err) return brkt.games_err;
  if (brkt.players_err) return brkt.players_err;
  if (brkt.second_err) return brkt.second_err;
  if (brkt.start_err) return brkt.start_err;
  return '';
}

/**
 * checks if the date and time properties of an object has been used in another object
 * 
 * @param arrOfSquads - array of squads to check for duplicate date & time
 * @param squad - squad to check if contains a duplicate date & time
 * @returns {*} boolean: true if a duplicate date & time
 */
export const isDuplicateDateTime = (
  arrOfSquads: squadType[],
  squad: squadType
): boolean => {
  let i = 0;
  while (i < arrOfSquads.length) {
    if (arrOfSquads[i].sort_order >= squad.sort_order) {
      return false;
    }
    if (arrOfSquads[i].squad_date_str === squad.squad_date_str && arrOfSquads[i].squad_time === squad.squad_time) {
      return true
    }
    i++
  }
  return false;
}

export const noAcdnErr: AcdnErrType = {
  errClassName: '',
  message: ''
}