import {
  isValidBtDbId,
  maxEventLength,
  minTeamSize,
  maxTeamSize,
  minGames,
  maxGames,
  ErrorCode,
  maxMoney,
  validSortOrder,  
} from "@/lib/validation";
import { sanitize, sanitizeCurrency } from "@/lib/sanitize";
import { validBtdbMoney, validMoney } from "@/lib/currency/validate";
import { eventType, idTypes, validEventsType } from "@/lib/types/types";
import { blankEvent } from "@/lib/db/initVals";
import { isNumber } from "@/lib/validation";

/**
 * checks if money string is valid - blank value is valid
 * valid formats are: ###.##, ##.#, ####
 * 
 * @param {string} moneyStr - money string to check
 * @returns - true if money string is valid
 */
const gotEventMoney = (moneyStr: string): boolean => {
  // a blank value for event money is OK
  if (moneyStr === "") return true
  return validMoney(moneyStr, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
}

/**
 * checks if event object has missing data - DOES NOT SANITIZE OR VALIDATE
 *
 * @param event - event to check for missing data
 * @returns {ErrorCode.MissingData | ErrorCode.None | ErrorCode.OtherError} - error code
 */
const gotEventData = (event: eventType): ErrorCode => {
  try {
    if (!event) return ErrorCode.MissingData;
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
      return ErrorCode.MissingData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
  }
};

export const validEventName = (eventName: string): boolean => {
  if (!eventName) return false;
  const sanitized = sanitize(eventName);
  return sanitized.length > 0 && sanitized.length <= maxEventLength;
};
export const validTeamSize = (teamSize: number): boolean => {
  if (typeof teamSize !== 'number') return false 
  return Number.isInteger(teamSize) && teamSize >= minTeamSize && teamSize <= maxTeamSize;
};
export const validGames = (games: number): boolean => {
  if (typeof games !== 'number') return false
  return Number.isInteger(games) && games >= minGames && games <= maxGames;
};
export const validEventMoney = (moneyStr: string): boolean => {
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
 * @returns {ErrorCode.None | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
const validEventData = (event: eventType): ErrorCode => {
  try {
    if (!event) return ErrorCode.InvalidData;
    if (!isValidBtDbId(event.tmnt_id, "tmt")) {
      return ErrorCode.InvalidData;
    }
    if (!validEventName(event.event_name)) {
      return ErrorCode.InvalidData;
    }
    if (!validTeamSize(event.team_size)) {
      return ErrorCode.InvalidData;
    }
    if (!validGames(event.games)) {
      return ErrorCode.InvalidData;
    }
    if (!allEventMoneyValid(event)) {
      return ErrorCode.InvalidData;
    }
    if (!validSortOrder(event.sort_order)) {
      return ErrorCode.InvalidData;
    }
    if (!entryFeeEqualsLpox(event)) {
      return ErrorCode.InvalidData;
    }
    return ErrorCode.None;
  } catch (error) {
    return ErrorCode.OtherError;
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
 * @param event - event to sanitize
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
 * @returns {ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError} - error code
 */
export function validateEvent(event: eventType): ErrorCode {
  try {
    const errCode = gotEventData(event);
    if (errCode !== ErrorCode.None) {
      return errCode;
    }
    return validEventData(event);
  } catch (error) {
    return ErrorCode.OtherError;
  }
}

/**
 * sanitizea and validates an array of events
 * 
 * @param {eventType[]} events - array of event to validate
 * @returns {validEventsType} - {events:eventType[], errorCode: ErrorCode.None | ErrorCode.MissingData | ErrorCode.InvalidData | ErrorCode.OtherError}
 */
export const validateEvents = (events: eventType[]): validEventsType => {

  const blankEvents: eventType[] = [];
  const okEvents: eventType[] = [];
  if (!Array.isArray(events) || events.length === 0) {
    return { events: blankEvents, errorCode: ErrorCode.MissingData };
  };
  // cannot use forEach because if got an errror need exit loop
  let i = 0;
  let tmntId = "";
  while (i < events.length) {
    const toPost = sanitizeEvent(events[i]);
    const errCode = validateEvent(toPost);
    if (errCode !== ErrorCode.None) { 
      return { events: okEvents, errorCode: errCode };
    }    
    // all events MUST have same tmnt_id
    if (i > 0 && tmntId !== toPost.tmnt_id) {
      return { events: okEvents, errorCode: ErrorCode.InvalidData };
    }
    // push AFETER errCode is None
    okEvents.push(toPost);    
    // set tmnt_id AFTER 1st event sanitzied and validated
    if (i === 0) {
      tmntId = toPost.tmnt_id;
    }
    i++;
  }
  return { events: okEvents, errorCode: ErrorCode.None };
};

export const exportedForTesting = {
  gotEventMoney,
  gotEventData,
  sanitizedEventMoney,
  validEventData,
};