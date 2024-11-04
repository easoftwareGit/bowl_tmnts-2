import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { startOfToday, addMinutes, isValid, addSeconds, addDays, addMilliseconds, parseISO, parse } from "date-fns";
import { validTime } from "./validation";

const ic: IntlConfig = {
  // locale: window.navigator.language,
  locale: 'en-US'
};

/**
* formats a date into a string using yyyy-MM-dd
* 
* @param date 
* @returns {*} string - date formatted as yyyy-MM-dd  2024-10-26
*/
export const dateTo_UTC_yyyyMMdd = (date: Date): string => {
  if (!isValid(date)) return '';
  return `${date.getUTCFullYear()}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`
}

/**
* formats a date into a string using yyyy-MM-dd
* 
* @param date 
* @returns {*} string - date formatted as yyyy-MM-dd  2024-10-26
*/
export const dateTo_yyyyMMdd = (date: Date): string => {
  if (!isValid(date)) return '';
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
}

/**
* formats a date into a string using yyyy-MM-dd
* 
* @param date 
* @returns {*} string - date formatted as MM/dd/yyyy  10/26/2024
*/
export const dateTo_UTC_MMddyyyy = (date: Date): string => {
  if (!isValid(date)) return '';  
  return `${(date.getUTCMonth() + 1).toString().padStart(2, '0')}/${date.getUTCDate().toString().padStart(2, '0')}/${date.getUTCFullYear()}`
}

/**
* formats a date into a string using MM/dd/yyyy
* 
* @param date 
* @returns {*} string - date formatted as MM/dd/yyyy  10/26/2024
*/
export const dateTo_MMddyyyy = (date: Date | string): string => {
  if (typeof date === 'string') { 
    date = parseISO(date);
  }
  if (!isValid(date)) return '';
  return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`
}

/**
 * returns the end of a day from a date string
 * 
 * @param dateStr - string to convert to end of day
 * @returns {Date | null}
 */
export const endOfDayFromString = (dateStr: string): Date | null => {  
  if (!isValid(new Date(dateStr))) return null;
  const d = new Date(dateStr)
  if (!isValid(d)) return null;
  const tsoMins = new Date().getTimezoneOffset()
  return addMilliseconds(addDays(addMinutes(new Date(dateStr), tsoMins), 1), -1)
}

/**
 * returns the day but with now as the time
 * 
 * @param dateStr - string to convert to day at now
 * @returns {Date | null}
 */
export const nowOnDayFromString = (dateStr: string): Date | null => {
  if (!isValid(new Date(dateStr))) return null;
  const d = new Date(dateStr)
  if (!isValid(d)) return null;
  const tsoMins = new Date().getTimezoneOffset()
  const dayNow = addMinutes(new Date(dateStr), tsoMins) 
  const newNow = new Date()
  dayNow.setHours(newNow.getHours())
  dayNow.setMinutes(newNow.getMinutes())
  dayNow.setSeconds(newNow.getSeconds())      
  return dayNow
}

/**
 * returns the start of a day from a date string NO TIME IN STRING
 * 
 * @param dateStr - string to convert to start of day in YYYY-MM-DD or MM/DD/YYYY 
 * @returns {Date | null}
 */
export const startOfDayFromString = (dateStr: string): Date | null => {
  if (!validDateString(dateStr)) return null;
  const d = new Date(dateStr)
  if (!isValid(d)) return null;
  let tsoMins = d.getTimezoneOffset()
  return addMinutes(new Date(dateStr), tsoMins) 
}

/**
 * returns the start of today in yyyy-MM-dd format
 * 
 * @returns {string} - strat of today in yyyy-MM-dd format
 */
export const todayStr = dateTo_UTC_yyyyMMdd(startOfToday())

/**
 * returns today's year as a string in yyyy format
 */
export const todayYearStr = todayStr.substring(0, 4)

/**
 * returns the start of today in MM/dd/yyyy format
 * 
 * @returns {string} - strat of today in MM/dd/yyyy format
 */
export const todayStrMMddyyyy = dateTo_UTC_MMddyyyy(startOfToday())  

export type ymdType = {
  year: number
  month: number
  days: number
}
/**
 * returns the ymd from a date string
 * 
 * @param dateStr - date in YYYY-MM-DD format
 * @returns {ymdType} - {year, month, days} or {year: 0, month: 0, days: 0}
 */
export const getYearMonthDays = (dateStr: string): ymdType => { 
  const ymd: ymdType = { year: 0, month: 0, days: 0 }
  if (!dateStr || dateStr.length !== 10) return ymd;
  const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
  if (!regex.test(dateStr)) return ymd;  
  ymd.year = Number(dateStr.substring(0, 4));
  ymd.month = Number(dateStr.substring(5, 7)) - 1;    
  ymd.days = Number(dateStr.substring(8, 10));
  return ymd
}

/**
 * returns the start of today in UTC 
 * 
 * @returns {Date} - strat of today in UTC
 */
export const startOfTodayUTC = (): Date => { 
  const todayYmd = getYearMonthDays(todayStr)
  return new Date(Date.UTC(todayYmd.year, todayYmd.month, todayYmd.days, 0, 0, 0, 0))
}

/**
 * returns true if dateStr is a valid date string NO TIME IN FORMAT
 * 
 * @param {string} dateStr - string in MM/dd/yyyy or YYYY-MM-DD format 
 * @returns - true if dateStr is a valid date string
 */
export const validDateString = (dateStr: string): boolean => {

  if (!dateStr || dateStr.length === 0) return false
  const noTimeDateStr = dateStr.split('T')[0];
  if (!noTimeDateStr || noTimeDateStr.length !== 10) return false 
  if (!dateStr || dateStr.length !== 10) return false
  if (dateStr[4] === '-') {
    const regex = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
    if (!regex.test(dateStr)) return false;  
    const date = parseISO(dateStr);
    // return isValid(date) && dateStr === date.toISOString().split('T')[0];
    return isValid(date) && dateStr === dateTo_yyyyMMdd(date);
  } else if (dateStr[2] === '/') {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(dateStr)) return false;  
    const date = new Date(dateStr)
    return isValid(date) && dateStr === dateTo_MMddyyyy(date);
  } else {
    return false
  }
}

/**
 * removes time values from an ISO date string
 * 
 * @param {string} dateStr - ISO date string to with time values to remove
 * @returns - string with time values removed YYYY-MM-DD
 */
export const removeTimeFromISODateStr = (dateStr: string): string => {
  if (!dateStr || dateStr.length === 0) return '';
  const noTimeDateStr = dateStr.split('T')[0]; 
  if (!noTimeDateStr || noTimeDateStr.length !== 10) return '' 
  if (validDateString(noTimeDateStr)) {
    return noTimeDateStr
  }
  return ''
}

/**
 * formats a date into a 24 hour time string
 *
 * @param {Date} timeAsDate
 * @return {*} {string} - HH:MM or ''
 */
export const getTimeString = (timeAsDate: Date): string => {  
  if (timeAsDate) {
    const offset = timeAsDate.getTimezoneOffset();
    let currentDateTime = new Date(
      timeAsDate.getFullYear(),
      timeAsDate.getMonth() - 1,
      timeAsDate.getDate(),
      timeAsDate.getHours(),
      timeAsDate.getMinutes() + offset
    );
    const timeStr = currentDateTime.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return twelveHourto24Hour(timeStr);
  }
  return "";
}

/**
 * converts a 12 hour format time into a 24 hour format time 
 * HH:MM AM => HH:MM,  HH:MM PM -> HH+12:MM
 * note: NO SECONDS!!!
 *
 * @param {string} time - a valid 12 hour time w/o seconds HH:MM AM/PM
 * @return {*} {string} - a 24 hour time string
 */
export const twelveHourto24Hour = (time: string): string => {
  try {
    let hours = parseInt(time.substring(0, 2))   
    if (isNaN(hours) || hours < 0 || hours > 23) {
      return ''
    }
    const minutes = parseInt(time.substring(3, 5))
    if (isNaN(minutes) || minutes < 0 || minutes > 59) {
      return ''
    }
    const ampm = time.substring(6).toUpperCase();
    if (ampm.length > 0 && !(ampm.toLowerCase() === 'am' || ampm.toLowerCase() === 'pm')) {
      return ''
    }
    if (ampm === 'PM' && hours !== 12) {
      hours += 12;            
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0
    }
    const hoursStr = hours.toString().padStart(2, '0');
    const minutesStr = minutes.toString().padStart(2, '0');
    return `${hoursStr}:${minutesStr}`;
  } catch (error) {
    return ''
  }
}

/**
 * gets the hours from a 24 hour time string HH:MM
 * 
 * @param {string} time valid 24 hour time => HH:MM
 * @return {*} number - 0 to 23 for the hour 
 */
export const getHoursFromTime = (time: string): number => {
  try {
    if (!validTime(time)) return -1
    const hours = parseInt(time.substring(0, 2))    
    return hours    
  } catch (error) {
    return -1
  }
}

/**
 * gets the minute from a 24 hour time string HH:MM
 * 
 * @param time valid 24 hour time => HH:MM
 * @return {*} number - 0 to 59 for the minute
 */
export const getMinutesFromTime = (time: string): number => {
  try {
    if (!validTime(time)) return -1
    const minutes = parseInt(time.substring(3, 5))
    return minutes
  } catch (error) {
    return -1
  }
}
