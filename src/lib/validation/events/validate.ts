import {
  isValidBtDbId,
  maxEventLength,
  minTeamSize,
  maxTeamSize,
  minGames,
  maxGames,  
  validSortOrder,  
} from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { sanitize, sanitizeCurrency } from "@/lib/validation/sanitize";
import { validBtdbMoney, validMoney } from "@/lib/currency/validate";
import type { eventType, idTypes, validEventsType } from "@/lib/types/types";
import { blankEvent } from "@/lib/db/initVals";
import { isNumber } from "@/lib/validation/validation";

/**
 * checks if money string is valid - blank value is valid
 * valid formats are: ###.##, ##.#, ####
 * 
 * @param {unknown} moneyStr - money string to check
 * @returns {boolean} - true if money string is valid
 */
const gotEventMoney = (moneyStr: unknown): boolean => {
  if (moneyStr == null || typeof moneyStr !== 'string') return false;
  // a blank value for event money is OK
  if (moneyStr === "") return true
  return validMoney(moneyStr, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

/**
 * checks if event object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param event - event to check for missing data
 * @returns {ErrorCode.MISSING_DATA | ErrorCode.NONE | ErrorCode.OTHER_ERROR} - error code
 */
const gotEventData = (event: eventType): ErrorCode => {
  try {
    if (!event) return ErrorCode.MISSING_DATA;
    if (
      !event.id ||
      !event.tmnt_id ||
      !sanitize(event.event_name) ||
      typeof event.team_size !== "number" ||
      typeof event.games !== "number" ||  
      !gotEventMoney(event.added_money) ||
      !gotEventMoney(event.entry_fee) ||
      !gotEventMoney(event.lineage) ||
      !gotEventMoney(event.prize_fund) ||
      !gotEventMoney(event.other) ||
      !gotEventMoney(event.expenses) ||
      !gotEventMoney(event.lpox) ||
      typeof event.sort_order !== "number"
    ) {
      return ErrorCode.MISSING_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

export const validEventName = (eventName: unknown): boolean => {
  if (eventName == null || typeof eventName !== 'string') return false;  
  const sanitized = sanitize(eventName);
  return sanitized.length > 0 && sanitized.length <= maxEventLength;
};
export const validTeamSize = (teamSize: unknown): boolean => {
  if (typeof teamSize !== 'number' || !Number.isInteger(teamSize)) return false 
  return Number.isInteger(teamSize) && teamSize >= minTeamSize && teamSize <= maxTeamSize;
};
export const validGames = (games: unknown): boolean => {
  if (typeof games !== 'number' || !Number.isInteger(games)) return false
  return Number.isInteger(games) && games >= minGames && games <= maxGames;
};
export const validEventMoney = (moneyStr: unknown): boolean => {  
  if (moneyStr == null || typeof moneyStr !== 'string') return false; 
  // min 0, max 999999
  return validBtdbMoney(moneyStr);
};

/**
 * checks if entry equals lpox and
 *   entry equals lineage + prize_fund + other + expenses
 *
 * @param event - event to check
 * @returns {boolean} - true if entry equals lpox
 */
export const entryFeeEqualsLpox = (event: eventType): boolean => {
  if (!event) return false;
  try {
    const entryFee = Number(event.entry_fee);
    const lineage = Number(event.lineage);
    const prizeFund = Number(event.prize_fund);
    const other = Number(event.other);
    const expenses = Number(event.expenses);
    const lpox = Number(event.lpox);
    if (
      isNaN(entryFee) ||
      isNaN(lineage) ||
      isNaN(prizeFund) ||
      isNaN(other) ||
      isNaN(expenses) ||
      isNaN(lpox)
    ) {
      return false;
    }
    return entryFee === lineage + prizeFund + other + expenses && entryFee === lpox;
  } catch (error) {
    return false;
  }
};

/**
 * checks if foreign key is valid
 *
 * @param FkId - foreign key
 * @param idType - id type - 'tmt'
 * @returns {boolean} - true if foreign key is valid
 */
export const validEventFkId = (FkId: string, idType: idTypes): boolean => {
  if (!FkId || !isValidBtDbId(FkId, idType)) {
    return false;
  }
  return idType === "tmt";
};

/**
 * checks if all event money is valid
 *
 * @param {object} event - event object to check
 * @returns {boolean} - true if all event money is valid
 */
export const allEventMoneyValid = (event: eventType): boolean => {
  if (!event) return false;
  if (!validEventMoney(event.added_money)) {
    return false;
  }
  if (!validEventMoney(event.entry_fee)) {
    return false;
  }
  if (!validEventMoney(event.lineage)) {
    return false;
  }
  if (!validEventMoney(event.prize_fund)) {
    return false;
  }
  if (!validEventMoney(event.other)) {
    return false;
  }
  if (!validEventMoney(event.expenses)) {
    return false;
  }
  if (!validEventMoney(event.lpox)) {
    return false;
  }
  return true;
}

/**
 * checks if event data is valid
 *
 * @param event - event object to validate
 * @returns {ErrorCode.NONE | ErrorCode.INVALID_DATA | ErrorCode.OTHER_ERROR} - error code
 */
const validEventData = (event: eventType): ErrorCode => {
  try {
    if (!event) return ErrorCode.INVALID_DATA;
    if (!isValidBtDbId(event.tmnt_id, "tmt")) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validEventName(event.event_name)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validTeamSize(event.team_size)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validGames(event.games)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!allEventMoneyValid(event)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!validSortOrder(event.sort_order)) {
      return ErrorCode.INVALID_DATA;
    }
    if (!entryFeeEqualsLpox(event)) {
      return ErrorCode.INVALID_DATA;
    }
    return ErrorCode.NONE;
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
};

/**
 * sanitizes an event money string
 *   "" is valid, and sanitized to "0"
 *   all 0's is ok, return "0"
 *   sanitizeCurrency removes trailing zeros
 *
 * @param moneyStr - money string to sanitize
 * @returns {string} - sanitized money string
 */
const sanitizedEventMoney = (moneyStr: string): string => {
  if (moneyStr === null
    || moneyStr === undefined
    || typeof moneyStr !== "string") return "";  
  if (moneyStr === "" || moneyStr.replace(/^0+/, '') === "") return "0";
  return sanitizeCurrency(moneyStr);
}

/**
 * sanitizes an event object
 *
 * @param {eventType} event - event to sanitize
 * @returns {eventType} - event object with sanitized data
 */
export const sanitizeEvent = (event: eventType): eventType => {
  if (!event) return null as any;
  const sanitizedEvent = {
    ...blankEvent,    
    event_name: '',
    team_size: null as any,
    games: null as any,
    sort_order: null as any,
  };
  if (isValidBtDbId(event.id, "evt")) {
    sanitizedEvent.id = event.id;
  }
  if (validEventFkId(event.tmnt_id, "tmt")) {
    sanitizedEvent.tmnt_id = event.tmnt_id;
  }
  sanitizedEvent.event_name = sanitize(event.event_name);
  if ((event.team_size === null) || isNumber(event.team_size)) {
    sanitizedEvent.team_size = event.team_size;
  }
  if ((event.games === null) || isNumber(event.games)) {
    sanitizedEvent.games = event.games;
  }
  // sanitizedEventMoney removes trailing zeros
  if (validEventMoney(event.added_money)) {
    sanitizedEvent.added_money = sanitizedEventMoney(event.added_money); 
  }
  if (validEventMoney(event.entry_fee)) {
    sanitizedEvent.entry_fee = sanitizedEventMoney(event.entry_fee);
  }
  if (validEventMoney(event.lineage)) {
    sanitizedEvent.lineage = sanitizedEventMoney(event.lineage);
  }
  if (validEventMoney(event.prize_fund)) {
    sanitizedEvent.prize_fund = sanitizedEventMoney(event.prize_fund);
  }
  if (validEventMoney(event.other)) {
    sanitizedEvent.other = sanitizedEventMoney(event.other);
  }
  if (validEventMoney(event.expenses)) {
    sanitizedEvent.expenses = sanitizedEventMoney(event.expenses);
  }
  if (validEventMoney(event.lpox)) {
    sanitizedEvent.lpox = sanitizedEventMoney(event.lpox);
  }
  if ((event.sort_order === null) || isNumber(event.sort_order)) {
    sanitizedEvent.sort_order = event.sort_order;
  }
  return sanitizedEvent;
};

/**
 * validates an event object
 *
 * @param event - event to validate
 * @returns {ErrorCode} - ErrorCode.NONE: event data is valid, 
 *    ErrorCode.INVALID_DATA: event data is invalid, 
 *    ErrorCode.MISSING_DATA: event data is missing,
 *    ErrorCode.OtherError: an error occurred
 */
export const validateEvent = (event: eventType): ErrorCode => {
  try {
    const errCode = gotEventData(event);
    if (errCode !== ErrorCode.NONE) {
      return errCode;
    }
    return validEventData(event);
  } catch (error) {
    return ErrorCode.OTHER_ERROR;
  }
}

/**
 * sanitizes and validates an array of events
 * 
 * @param {eventType[]} events - array of event to validate
 * @returns {validEventsType} - {events:eventType[], errorCode: ErrorCode.NONE | ErrorCode.MISSING_DATA | ErrorCode.INVALID_DATA | ErrorCode.OtherError}
 */
export const validateEvents = (events: eventType[]): validEventsType => {

  const blankEvents: eventType[] = [];
  const okEvents: eventType[] = [];
  if (!Array.isArray(events) || events.length === 0) {
    return { events: blankEvents, errorCode: ErrorCode.MISSING_DATA };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;
  let tmntId = "";
  while (i < events.length) {
    const sanitized = sanitizeEvent(events[i]);
    const errCode = validateEvent(sanitized);
    if (errCode !== ErrorCode.NONE) { 
      return { events: okEvents, errorCode: errCode };
    }    
    // all events MUST have same tmnt_id
    if (i > 0 && tmntId !== sanitized.tmnt_id) {
      return { events: okEvents, errorCode: ErrorCode.INVALID_DATA };
    }
    // push AFETER errCode is None
    okEvents.push(sanitized);    
    // set tmnt_id AFTER 1st event sanitzied and validated
    if (i === 0) {
      tmntId = sanitized.tmnt_id;
    }
    i++;
  }
  return { events: okEvents, errorCode: ErrorCode.NONE };
};

export const exportedForTesting = {
  gotEventMoney,
  gotEventData,
  sanitizedEventMoney,
  validEventData,
};