import { sanitize } from "./sanitize";
import type { DateInput, fullStageType, idTypes } from "@/lib/types/types";
import { SquadStage } from "@prisma/client";

export const maxFirstNameLength = 15;
export const maxLastNameLength = 20;
export const maxEmailLength = 30;
export const maxPhoneLength = 20;
export const maxPasswordLength = 20;

export const maxBowlNameLemgth = 30;
export const maxCityLength = 25;
export const maxStateLength = 5;
export const maxUrlLength = 2048;

export const maxToHashLength = 72;
export const bcryptLength = 60; // https://www.npmjs.com/package/bcrypt

export const maxTmntNameLength = 30;
export const maxEventLength = 20;
export const maxReasonLength = 100;

export const minTeamSize = 1;
export const maxTeamSize = 5;
export const minGames = 1;
export const maxGames = 99;
export const minStartLane = 1;
export const maxStartLane = 199;
export const minLaneCount = 2;
export const maxLaneCount = 200;
export const maxBrackets = 999;
export const maxEvents = 10;
export const minHdcpPer = 0;
export const maxHdcpPer = 1.25;
export const minHdcpFrom = 0;
export const maxHdcpFrom = 300;
export const zeroAmount = 0;
export const minFee = 1;
export const maxScore = 300;
export const maxMoney = 999999;
export const maxAverage = maxScore;

export const minSortOrder = 1;
export const maxSortOrder = 1000000;

export const minYear = 1900;
export const maxYear = 2200;
export const minDate = new Date(Date.UTC(minYear, 0, 1, 0, 0, 0, 0));
export const maxDate = new Date(Date.UTC(maxYear, 11, 31, 23, 59, 59, 999));

export const minLane = 1;

// 8.64.15 is max date per
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
export const minTimeStamp = -8.64e15;
export const maxTimeStamp = 8.64e15;

export const idTypeLength = 3; // length of id type, e.g. usr, bwl, div, pot, elm, brk
export const idTypeSeparator = "_"; // separator between id type and id
export const idTypeSeparatorLength = 1; // length of id type separator, e.g
export const uuidLength = 32; // length of a uuid without hyphens, e.g. 123e4567e89b12d3a456426655440000
export const baseIdLength = idTypeLength + idTypeSeparatorLength + uuidLength; // length of a base id, e.g. usr_123e4567e89b12d3a456426655440000

/**
 * checks if string is in a valid email format
 *
 * @param {string} str
 * @return {*}  {boolean} - true: str has a valid email format;
 */
export function isEmail(str: string): boolean {
  if ((str.match(/@/g) || []).length !== 1) {
    return false;
  }
  const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(str);
}

/**
 * checks if string is a valid password
 *  8-20 chars long
 *  at least 1 UPPER case char
 *  at least 1 lower case char
 *  at least 1 digit
 *  at least on special char
 *
 * @param {unknown} str
 * @return {boolean} - true: str has a valid password format;
 */
export function isPassword8to20(str: unknown): boolean {
  if (typeof str !== "string") return false;
  const regex =
    /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,20}$/;
  return regex.test(str);
}

const validRoles = ["ADMIN", "DIRECTOR", "USER"];


// usr - user
// bwl - bowl
// tmt - tournament
// evt - event
// div - division
// sqd - squad
// stg - stage
// lan - lane
// pot - pot
// brk - bracket
// elm - eliminator
// ply - player
// bye - bye player
// den - division entry
// pen - pot entry
// ben - bracket entry
// een - eliminator entry
// gam - game
// obk - one individual bracket
// bsd - bracket seed
export const idTypesArray = [
  'usr', 'bwl', 'tmt', 'evt', 'div', 'sqd', 'stg', 'lan', 'pot', 'brk',
  'elm', 'ply', 'bye', 'den', 'pen', 'ben', 'een', 'gam', 'obk', 'bsd'
] as const;
const validTypes = new Set(idTypesArray);

/**
 * checks if string is a valid BtDb id type
 *
 * @param {unknown} str - string to check
 * @return {boolean} - true: str is a valid BtDb id type; else false
 */
export const isValidBtDbType = (str: unknown): boolean => {
  if (typeof str !== "string") return false;
  return validTypes.has(str as idTypes);
};

/**
 * checks if string is a valid role
 * 
 * @param str {unknown} - string to check
 * @returns {boolean} - true: str is a valid role, else false
 */
export const isValidRole = (str: unknown): boolean => {
  if (typeof str !== "string") return false;
  return validRoles.includes(str);
};

/**
 * checks if string is a valid BtDb id
 *  id starts with a valid id type
 *  id is in correct format
 *    3 lowercase letters - valid id type
 *    1 underscore
 *    32 hexidecimals in lowercase
 *
 * @param id {unknown} - the id string to check
 * @param idType {idTypes} - the desired id type (usr, bwl, ...)
 * @returns {boolean} - true: str is a valid BtDb id
 */
export function isValidBtDbId(id: unknown, idType: idTypes): boolean {
  if (!id || !idType || typeof id !== "string" || typeof idType !== "string")
    return false;
  if (!id.startsWith(idType)) return false;
  if (!isValidBtDbType(idType)) return false;
  const regex = /^[a-z]{3}_[a-f0-9]{32}$/;
  return regex.test(id);
}

/**
 * checks if a year is valid = four digits and between 1900 and 2100 inclusive
 *
 * @param {string} year - in YYYY format
 * @return {boolean} - true if year is a valid year
 */
export const validYear = (year: string): boolean => {
  if (!year || year.length !== 4) return false;
  const yearNum = parseInt(year, 10) || 0;
  if (yearNum < minYear || yearNum > maxYear) return false;
  return true;
};

/**
 *
 * @param {string} time - time string to validate
 * @returns {boolean} - true if time is a valid time
 */
export const validTime = (time: string): boolean => {
  // 12 hour: HH:MM AM/PM or 24 hour: HH:MM
  if (!time || !(time.length === 5 || time.length === 8)) return false;
  const regex =
    time.length === 5
      ? /^(1[0-9]|0?[0-9]|2[0-3]):[0-5][0-9]$/
      : /^(0[0-9]|1[0-2]):[0-5][0-9]\s(?:AM|PM|am|pm)$/;
  return regex.test(time);
};

/**
 * checks if an object is a valid date object
 *
 * @param d {unknown} - object to check if a valid date object
 * @returns {boolean} - true if a valid date object, otherwise false
 */
const isValidDateObject = (d: unknown): d is Date =>
  d instanceof Date && !isNaN(d.getTime());

/**
 * converts value to a valid date or null
 *
 * @param value {DateInput} - value to convert to a valid date or to null
 * @returns {Date | null} - valid date or null
 */
export const toValidDateOrNull = (value: DateInput): Date | null => {
  if (value == null) return null; // returns null for null or undefined

  if (isValidDateObject(value)) return value;

  // if value is a number, then treat value as milliseconds
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d; // Valid? Convert. Invalid? Keep original.
  }

  // if value is a string, then treat value as ISO string or "1234567890123"
  if (typeof value === "string") {
    const trimmed = value.trim(); // remove leading and trailing whitespace
    if (!trimmed) return null;

    // if a valid ISO numeric string, then convert to Date
    if (/^\d+$/.test(trimmed)) {
      const d = new Date(Number(trimmed));
      return Number.isNaN(d.getTime()) ? null : d;
    }

    // let it through and let Date.parse() handle it
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // if got here, not a valid date, so return null
  return null;
};

/**
 * check if two values are numerically equal
 * 
 * @param {any} a - first value to compare
 * @param {any} b - second value to compare
 * @returns {boolean} - true if values are numerically equal 
 */
export const safeNumericEqual = (a: any, b: any): boolean => {
  const numA = Number(a);
  const numB = Number(b);
  if (!Number.isFinite(numA) || !Number.isFinite(numB)) return false;
  return numA === numB;
}

/**
 * checks if numStr is a valid positive integer
 *
 * @param {string} numStr - number to test
 * @returns {boolean} - true if numStr is a valid positive integer
 */
export const validPositiveInt = (numStr: string): boolean => {
  if (!numStr) return false;
  return /^[1-9]\d*$/.test(numStr);
};

/**
 * checks if a numeber is odd
 *
 * @param num - number to test
 * @returns {boolean} - true if number is odd
 */
export const isOdd = (num: number): boolean => {
  return num % 2 !== 0;
};

/**
 * checks if a numeber is even
 *
 * @param num - number to test
 * @returns {boolean} - true if number is odd
 */
export const isEven = (num: number): boolean => {
  return !isOdd(num);
};

/**
 * checks to see if value is a number
 *
 * @param value - value to test
 * @returns {boolean} - true if value is a number
 */
export const isNumber = (value: any): boolean => {
  return typeof value === "number" && isFinite(value);
};

/**
 * checks to see if value is an integer
 *
 * @param value {unknown} - value to test
 * @returns {boolean} - true if value is an integer, else false
 */
export const validInteger = (value: unknown): boolean => {
  if (value == null || !Number.isInteger(value)) return false;
  const numVal = Number(value);
  if (numVal < Number.MIN_SAFE_INTEGER || numVal > Number.MAX_SAFE_INTEGER)
    return false;
  return true;
};

/**
 * checks if object has a valid sort_order
 *
 * @param sortOrder - sort_order value
 * @returns {boolean} - true if object has a valid sort_order
 */
export const validSortOrder = (sortOrder: unknown): boolean => {
  if (sortOrder == null || !Number.isInteger(sortOrder)) return false;
  const sortOrderNumber = Number(sortOrder); 
  return (sortOrderNumber < minSortOrder || sortOrderNumber > maxSortOrder)    
    ? false
    : true;
};

/**
 * validates a name string
 *
 * @param {string} name - name to validate
 * @param {number} maxLength - max length of name
 * @returns {boolean} - true if name is valid
 */
export const isValidName = (name: string, maxLength: number): boolean => {
  const sanitized = sanitize(name);
  return sanitized.length > 0 && sanitized.length <= maxLength;
};

/**
 * validates a timestamp
 *
 * @param {number} timestamp - timestamp to validate
 * @returns {boolean} - true if timestamp is valid
 */
export const isValidTimeStamp = (timestamp: number): boolean => {
  if (isNaN(timestamp) || timestamp === null) return false;
  // 8.64.15 is max date per
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_epoch_timestamps_and_invalid_date
  return (
    timestamp >= minTimeStamp && timestamp <= maxTimeStamp && Number.isInteger(timestamp)
  );
};

/**
 * checks if value is a fullStageType
 * 
 * @param {unknown} value - value to check
 * @returns {boolean} - true if value is a fullStageType object otherwise false 
 */
export const isFullStageType = (value: unknown): value is fullStageType => {

  const squadStageValues = Object.values(SquadStage) as SquadStage[];

  if (value == null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;

  // id / squad_id / stage_override_reason must be strings
  if (typeof obj.id !== "string") return false;
  if (typeof obj.squad_id !== "string") return false;
  if (obj.stage_override_reason != null && typeof obj.stage_override_reason !== "string") return false;

  const isSquadStage = (value: unknown): value is SquadStage => (
    typeof value === "string" &&
    squadStageValues.includes(value as SquadStage)    
  )
  if (!isSquadStage(obj.stage)) return false;

  // if (typeof obj.stage !== "string") return false; // basic check
  
  // stage_override_enabled must be boolean
  if (typeof obj.stage_override_enabled !== "boolean") return false;

  
  const isDateLike = (x: unknown): boolean =>
    (x instanceof Date && !isNaN(x.getTime())) ||
    (typeof x === "string" && !Number.isNaN(Date.parse(x)));
  // nullable dates: allow Date or ISO string
  const isDateLikeOrNull = (x: unknown): boolean =>
    x === null || isDateLike(x);

  if (!isDateLike(obj.stage_set_at)) return false;
  if (!isDateLikeOrNull(obj.scores_started_at)) return false;
  if (!isDateLikeOrNull(obj.stage_override_at)) return false;

  return true;
};

export const exportedForTesting = {
  isValidDateObject,
};
