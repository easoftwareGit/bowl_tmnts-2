import {
  dateTo_UTC_yyyyMMdd,
  dateTo_UTC_MMddyyyy,
  todayStr,
  twelveHourto24Hour,
  getHoursFromTime, 
  getMinutesFromTime,
  dateTo_yyyyMMdd,
  dateTo_MMddyyyy,    
  startOfDayFromString,
  endOfDayFromString,
  nowOnDayFromString,
  getYearMonthDays,
  getTimeString,
  startOfTodayUTC,
  validDateString,
  removeTimeFromISODateStr,  
} from "@/lib/dateTools";
import { startOfToday } from "date-fns";

describe("tests for dateTools", () => {
  
  describe("dateTo_UTC_yyyyMMdd", () => {
    it("should format a date into a UTC string using yyyy-MM-dd", () => {
      const date = new Date("2022-01-01");
      const formattedDate = dateTo_UTC_yyyyMMdd(date);
      expect(formattedDate).toBe("2022-01-01");
    });
  });

  describe("dateTo_yyyyMMdd", () => {

    // correctly formats a typical date in the middle of the year
    it('should format a typical date in the middle of the year correctly', () => {
      const date = new Date(2024, 9, 26); // October 26, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-10-26');
    });

    // handles dates with single-digit months correctly
    it('should handle dates with single-digit months correctly', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-01-05');
    });

    // correctly formats a date at the end of the year
    it('should format a date at the end of the year correctly', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-12-31');
    });

    // correctly formats a date at the beginning of the year
    it('should format a date at the beginning of the year correctly', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-01-01');
    });

    // correctly formats a date in a leap year
    it('should format a date in a leap year correctly', () => {
      const date = new Date(2020, 1, 29); // February 29, 2020 (leap year)
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2020-02-29');
    });

    // handles dates with single-digit days correctly
    it('should handle single-digit days correctly', () => {
      const date = new Date(2024, 9, 6); // October 6, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-10-06');
    });

    // returns an empty string for an invalid date object
    it('should return empty string when given an invalid date object', () => {
      const date = new Date('invalid-date');
      const result = dateTo_UTC_yyyyMMdd(date);
      expect(result).toBe('');
    });
  });

  describe("dateTo_UTC_MMddyyyy", () => {
    it("should format a date into a UTC string using MM/dd/yyyy", () => {
      const date = new Date("2022-01-01");
      const formattedDate = dateTo_UTC_MMddyyyy(date);
      expect(formattedDate).toBe("01/01/2022");
    });
  });

  describe("dateTo_MMddyyyy", () => {
    describe('pass a date', () => { 
      it('should format a typical date in the middle of the year correctly', () => {
        const date = new Date(2024, 9, 26); // October 26, 2024
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('10/26/2024');
      });
      it('should handle dates with single-digit months correctly', () => {
        const date = new Date(2024, 0, 5); // January 5, 2024
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('01/05/2024');
      });
      it('should format a date at the end of the year correctly', () => {
        const date = new Date(2024, 11, 31); // December 31, 2024
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('12/31/2024');
      });
      it('should format a date at the beginning of the year correctly', () => {
        const date = new Date(2024, 0, 1); // January 1, 2024
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('01/01/2024');
      });
      it('should format a date in a leap year correctly', () => {
        const date = new Date(2020, 1, 29); // February 29, 2020 (leap year)
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('02/29/2020');
      });
      it('should handle single-digit days correctly', () => {
        const date = new Date(2024, 9, 6); // October 6, 2024
        const formattedDate = dateTo_MMddyyyy(date);
        expect(formattedDate).toBe('10/06/2024');
      });
      it('should return empty string when given an invalid date object', () => {
        const date = new Date('invalid-date');
        const result = dateTo_MMddyyyy(date);
        expect(result).toBe('');
      });
    })
    describe('pass a string', () => { 
      it('should format a typical date in the middle of the year correctly', () => {
        const date = new Date(2024, 9, 26); // October 26, 2024
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('10/26/2024');
        const formattedDate2 = dateTo_MMddyyyy('2024-10-26');
        expect(formattedDate2).toBe('10/26/2024');
      });
      it('should handle dates with single-digit months correctly', () => {
        const date = new Date(2024, 0, 5); // January 5, 2024
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('01/05/2024');
        const formattedDate2 = dateTo_MMddyyyy('2024-01-05');
        expect(formattedDate2).toBe('01/05/2024');
      });
      it('should format a date at the end of the year correctly', () => {
        const date = new Date(2024, 11, 31); // December 31, 2024
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('12/31/2024');
        const formattedDate2 = dateTo_MMddyyyy('2024-12-31');
        expect(formattedDate2).toBe('12/31/2024');
      });
      it('should format a date at the beginning of the year correctly', () => {
        const date = new Date(2024, 0, 1); // January 1, 2024
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('01/01/2024');
        const formattedDate2 = dateTo_MMddyyyy('2024-01-01');
        expect(formattedDate2).toBe('01/01/2024');
      });
      it('should format a date in a leap year correctly', () => {
        const date = new Date(2020, 1, 29); // February 29, 2020 (leap year)
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('02/29/2020');
        const formattedDate2 = dateTo_MMddyyyy('2020-02-29');
        expect(formattedDate2).toBe('02/29/2020');
      });
      it('should handle single-digit days correctly', () => {
        const date = new Date(2024, 9, 6); // October 6, 2024
        const formattedDate = dateTo_MMddyyyy(date.toISOString());
        expect(formattedDate).toBe('10/06/2024');
        const formattedDate2 = dateTo_MMddyyyy('2024-10-06');
        expect(formattedDate2).toBe('10/06/2024');
      });
      it('should return empty string when given an invalid date object', () => {
        const date = new Date('invalid-date');
        const result = dateTo_MMddyyyy(date);
        expect(result).toBe('');
      });
    })

  });

  describe('startOfDayFromString', () => {
    it('should return null if the input date string is invalid', () => {
      expect(startOfDayFromString('invalid-date')).toBeNull();
      expect(startOfDayFromString('2024-13-01')).toBeNull();
    });  
    it('should return the start of the day for a valid date string', () => {
      const dateStr = '2024-10-26';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay?.getFullYear()).toBe(2024);
      expect(startOfDay?.getMonth()).toBe(9); // month - 1
      expect(startOfDay?.getDate()).toBe(26);
      expect(startOfDay?.getHours()).toBe(0);
      expect(startOfDay?.getMinutes()).toBe(0);
      expect(startOfDay?.getSeconds()).toBe(0);
    });  
    it('should return the start of the day for first day of the year', () => {
      const dateStr = '2020-01-01';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay?.getFullYear()).toBe(2020);
      expect(startOfDay?.getMonth()).toBe(0); // month - 1
      expect(startOfDay?.getDate()).toBe(1);
      expect(startOfDay?.getHours()).toBe(0);
      expect(startOfDay?.getMinutes()).toBe(0);
      expect(startOfDay?.getSeconds()).toBe(0);
    });  
    it('should return the start of the day for last day of the year', () => {
      const dateStr = '2020-12-31';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay?.getFullYear()).toBe(2020);
      expect(startOfDay?.getMonth()).toBe(11);
      expect(startOfDay?.getDate()).toBe(31);
      expect(startOfDay?.getHours()).toBe(0);
      expect(startOfDay?.getMinutes()).toBe(0);
      expect(startOfDay?.getSeconds()).toBe(0);
    });  
    it('should return the start of the day for July 1st of the year', () => {
      const dateStr = '2020-07-01';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay?.getFullYear()).toBe(2020);
      expect(startOfDay?.getMonth()).toBe(6); // month - 1
      expect(startOfDay?.getDate()).toBe(1);
      expect(startOfDay?.getHours()).toBe(0);
      expect(startOfDay?.getMinutes()).toBe(0);
      expect(startOfDay?.getSeconds()).toBe(0);
    });  
    it('should return the start of the day for Feb 29th of the leap year', () => {
      const dateStr = '2020-02-29';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay?.getFullYear()).toBe(2020);
      expect(startOfDay?.getMonth()).toBe(1);
      expect(startOfDay?.getDate()).toBe(29);
      expect(startOfDay?.getHours()).toBe(0);
      expect(startOfDay?.getMinutes()).toBe(0);
      expect(startOfDay?.getSeconds()).toBe(0);
    });  
    it('should return the null Feb 29th of the non leap year', () => {
      const dateStr = '2021-02-29';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay).toBeNull();
    });  
    it('should return null for Feb 30th', () => {
      const dateStr = '2020-02-30';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay).toBeNull();
    });  
    it('should return null for Apr 31st', () => {
      const dateStr = '2020-04-31';      
      const startOfDay = startOfDayFromString(dateStr)
      expect(startOfDay).toBeNull();
    });  

  });

  describe('endOfDayFromString', () => {
    it('should return null if the input date string is invalid', () => {
      expect(endOfDayFromString('invalid-date')).toBeNull();
      expect(endOfDayFromString('2024-13-01')).toBeNull();
    });
  
    it('should return the end of the day for a valid date string', () => {
      const dateStr = '2024-10-26';      
      const endOfDay = endOfDayFromString(dateStr)
      expect(endOfDay?.getFullYear()).toBe(2024);
      expect(endOfDay?.getMonth()).toBe(9);
      expect(endOfDay?.getDate()).toBe(26);
      expect(endOfDay?.getHours()).toBe(23);
      expect(endOfDay?.getMinutes()).toBe(59);
      expect(endOfDay?.getSeconds()).toBe(59);
      expect(endOfDay?.getMilliseconds()).toBe(999);
    });  
  });

  describe('nowOnDayFromString', () => {
    it('should return null if the input date string is invalid', () => {
      expect(nowOnDayFromString('invalid-date')).toBeNull();
      expect(nowOnDayFromString('2024-13-01')).toBeNull();
    });
  
    it('should return the now on the day for a valid date string', () => {
      const dateStr = '2024-10-26';      
      const nowOnDay = nowOnDayFromString(dateStr)
      const now = new Date();
      expect(nowOnDay?.getFullYear()).toBe(2024);
      expect(nowOnDay?.getMonth()).toBe(9);
      expect(nowOnDay?.getDate()).toBe(26);
      expect(nowOnDay?.getHours()).toBe(now.getHours());
      expect(nowOnDay?.getMinutes()).toBe(now.getMinutes());
      expect(nowOnDay?.getSeconds()).toBe(now.getSeconds());
    });  
  });

  describe("todayStr", () => {
    it("should return the current date formatted as yyyy-MM-dd", () => {
      const today = new Date(startOfToday());
      const formattedDate = dateTo_UTC_yyyyMMdd(today);
      expect(todayStr).toBe(formattedDate);
    });
  });

  describe('startOfTodayUTC', () => {

    // ensures that the startOfTodayUTC function returns the start of today in UTC consistently
    it('should return the start of today in UTC consistently', () => {
      const result = startOfTodayUTC();
      const expected = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth(), result.getUTCDate(), 0, 0, 0, 0));
      expect(result).toEqual(expected);
    });
  });

  describe('todayStrMMddyyyy', () => {
    it('should return the start of the day formatted as MM/dd/yyyy', () => { 
      const result = dateTo_MMddyyyy(startOfTodayUTC()); // todayStrMMddyyyy(); 
      const sod = startOfTodayUTC();
      const expected = `${(sod.getMonth() + 1).toString().padStart(2, '0')}/${sod.getDate().toString().padStart(2, '0')}/${sod.getFullYear()}`      
      expect(result).toBe(expected);
    })
  });

  describe('validDateString', () => {    
    it('should return true when the date string is in valid format', () => {
      const result = validDateString('2023-10-15');
      expect(result).toBe(true);
      const result2 = validDateString('10/15/2023');
      expect(result2).toBe(true);
    });
    it('should return true when the date string is in valid format with leading 0 in month', () => {
      const result = validDateString('2023-03-15');
      expect(result).toBe(true);
      const result2 = validDateString('03/15/2023');
      expect(result2).toBe(true);
    });
    it('should return true when the date string is in valid format with leading 0 in day', () => {
      const result = validDateString('2023-10-05');
      expect(result).toBe(true);
      const result2 = validDateString('10/05/2023');
      expect(result2).toBe(true);
    });
    it('should return false when the input is an empty string', () => {
      const result = validDateString('');
      expect(result).toBe(false);
    });
    it('should return false when the input is null', () => {
      const result = validDateString(null as any);
      expect(result).toBe(false);
    })
    it('should return false when the date string is a full date with time', () => {
      const result = validDateString('2023-10-05T14:30:00.000Z');
      expect(result).toBe(false);
    })
    it('should return false when the date string is in valid format not in valid month', () => {
      const result = validDateString('2023-13-05');
      expect(result).toBe(false);
      const result2 = validDateString('13/13/2023');
      expect(result2).toBe(false);
    });
    it('should return false when the date string is in valid format but not valid day', () => {
      const result = validDateString('2023-02-30');
      expect(result).toBe(false);
      const result2 = validDateString('02/30/2023');
      expect(result2).toBe(false);
    });
    it('should return false when the date string has extra characters', () => {
      const result = validDateString('2023-10-05extra');
      expect(result).toBe(false);
      const result2 = validDateString('10/05/2023extra');
      expect(result2).toBe(false);
    });
    it('should return false when the date string is missing characters', () => {
      const result = validDateString('2023-10');
      expect(result).toBe(false);
      const result2 = validDateString('10/2023');
      expect(result2).toBe(false);
    });
    it('should return false when the date string contains non-numeric characters', () => {
      const result = validDateString('2023-10-0A');
      expect(result).toBe(false);
      const result2 = validDateString('10/0A/2023');
      expect(result2).toBe(false);
    });
    it('should return false when the date string has leading spaces', () => {
      const result = validDateString('   2023-10-05');
      expect(result).toBe(false);
      const result2 = validDateString('   10/05/2023');
    });
    it('should return false when the date string has different separators', () => {
      const result = validDateString('2023/10/05');
      expect(result).toBe(false);
      const result2 = validDateString('10-05-2023');
      expect(result2).toBe(false);
    });
    it('should return true for valid leap year date string', () => {
      const result = validDateString('2024-02-29');
      expect(result).toBe(true);
      const result2 = validDateString('02/29/2024');
      expect(result2).toBe(true);
    });
    it('should return false when the date string is an invalid leap year date', () => {
      const result = validDateString('2021-02-29');
      expect(result).toBe(false);
      const result2 = validDateString('2021/02/29');
      expect(result2).toBe(false);
    });
  });

  describe('removeTimeFromISODateStr', () => {
    it('should return date string without time when given a valid ISO date string with time', () => {
      const input = '2023-10-05T14:48:00.000Z';
      const expectedOutput = '2023-10-05';
      const result = removeTimeFromISODateStr(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return empty string when given an invalid ISO date string', () => {
      const input = 'invalid-date-string';
      const expectedOutput = '';
      const result = removeTimeFromISODateStr(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return date string without time when given a valid ISO date string with time', () => {
        const input = '2023-10-05T14:48:00.000Z';
        const expectedOutput = '2023-10-05';
        const result = removeTimeFromISODateStr(input);
        expect(result).toBe(expectedOutput);
    });
    it('should return empty string when given a null value', () => {
      const input = null;
      const expectedOutput = '';
      const result = removeTimeFromISODateStr(input as any);
      expect(result).toBe(expectedOutput);
    });
    it('should return empty string when given an empty string', () => {
      const input = '';
      const expectedOutput = '';
      const result = removeTimeFromISODateStr(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return empty string when given an invalid ISO date string', () => {
      const input = '2023-13-05T14:48:00.000Z';
      const result = removeTimeFromISODateStr(input);
      expect(result).toBe('');
    });
    it('should return empty string when given a string with only time part', () => {
      const input = '14:48:00.000Z';
      const expectedOutput = '';
      const result = removeTimeFromISODateStr(input);
      expect(result).toBe(expectedOutput);
    });
  });

  describe('getYearMonthDays', () => {

    it('should return correct year, month, and days when given a valid date string', () => {
      const dateStr = '2023-10-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 9, days: 5 });
    });
    it('should return default ymd object when given an empty string', () => {
      const dateStr = '';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: 0, days: 0 });
    });
    it('should return correct year, month, and days when given a valid date string', () => {
      const dateStr = '2023-10-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 9, days: 5 });
    });
    it('should handle single-digit months and days correctly', () => {
      const dateStr = '2023-03-07';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 2, days: 7 });
    });
    it('should return correct year, month, and days for a leap year date', () => {
      const dateStr = '2020-02-29';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2020, month: 1, days: 29 });
    });
    it('should return default ymd object for invalid date format', () => {
      const dateStr = '2023-13-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: 0, days: 0 });
    });
    it('should return default ymd object for date strings with invalid month values', () => {
      const dateStr = '2023-13-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: 0, days: 0 });
    });
    it('should return empty object when given a date string with non-numeric characters', () => {
      const dateStr = '2023-1a-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: 0, days: 0 });
    });
    it('should handle trimmed date strings with extra whitespace', () => {
      const dateStr = '  2023-10-05  '.trim();
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 9, days: 5 });
    });
    it('should return correct year, month, and days when given a valid date string with hyphens as delimiters', () => {
      const dateStr = '2023-10-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 9, days: 5 });
    });
    it('should return correct year, month, and days when given a date string at the end of the month', () => {
      const dateStr = '2023-01-31';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 0, days: 31 });
    });
    it('should return correct year, month, and days when given a date string at the boundary of year changes', () => {
      const dateStr = '2022-12-31';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2022, month: 11, days: 31 });
    });
  });

  describe('getTimeString', () => {

    it('should return 24-hour time string when given a valid Date object', () => {
      const date = new Date('2023-10-10T14:30:00Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should return empty string when given an invalid Date object', () => {
      const invalidDate = new Date('invalid-date-string');
      const result = getTimeString(invalidDate);
      expect(result).toBe('');
    });
    it('should return 24-hour time string when given a valid Date object with different time zones', () => {
      const date = new Date('2023-10-10T14:30:00Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should return correct time string for dates in the current year', () => {
      const date = new Date('2023-10-10T14:30:00Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should process dates with non-zero minutes offset accurately', () => {
      const date = new Date('2023-10-10T14:30:00Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should handle dates with varying hours and minutes correctly', () => {
      const date = new Date('2023-10-10T14:30:00Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should return 24-hour time string for midnight (00:00)', () => {
      const date = new Date('2023-10-10T00:00:00Z');
      const result = getTimeString(date);
      expect(result).toBe('00:00');
    });
    it('should process noon (12:00 PM) correctly', () => {
      const date = new Date('2023-10-10T12:00:00Z');
      const result = getTimeString(date);
      expect(result).toBe('12:00');
    });
    it('should handle dates with timezone offsets causing day change', () => {
      const date = new Date('2023-10-10T23:45:00Z');
      const result = getTimeString(date);
      expect(result).toBe('23:45');
    });
    it('should process dates with seconds and milliseconds accurately', () => {
      const date = new Date('2023-10-10T14:30:45.123Z');
      const result = getTimeString(date);
      expect(result).toBe('14:30');
    });
    it('should return 24-hour time string when given a Date object with daylight saving time changes', () => {
      const date = new Date('2023-03-26T02:30:00Z'); // Daylight Saving Time change
      const result = getTimeString(date);
      expect(result).toBe('02:30');
    });
  });

  describe("twelveHourto24Hour", () => {
    it("should convert 12-hour time to 24-hour time", () => {
      expect(twelveHourto24Hour("01:00 PM")).toEqual("13:00");
      expect(twelveHourto24Hour("12:30 AM")).toEqual("00:30");
      expect(twelveHourto24Hour("11:45 PM")).toEqual("23:45");
      expect(twelveHourto24Hour("13:00")).toEqual("13:00");
      expect(twelveHourto24Hour("00:00")).toEqual("00:00");
    });

    it("should return an empty string if the input is invalid", () => {
      expect(twelveHourto24Hour("-1:00")).toEqual("");
      expect(twelveHourto24Hour("01:-1")).toEqual("");
      expect(twelveHourto24Hour("1:0")).toEqual("");
      expect(twelveHourto24Hour("AB:00")).toEqual("");
      expect(twelveHourto24Hour("12:XY")).toEqual("");
      expect(twelveHourto24Hour("12:60 PM")).toEqual("");
      expect(twelveHourto24Hour("25:00 PM")).toEqual("");
      expect(twelveHourto24Hour("")).toEqual("");
    });
  });

  describe('getHoursFromTime', () => {
    it('should return the correct hours from a valid time string', () => {
      expect(getHoursFromTime('09:30')).toBe(9)
      expect(getHoursFromTime('15:45')).toBe(15)
    })
  
    it('should return -1 for an invalid time string', () => {
      expect(getHoursFromTime('abc')).toBe(-1)
      expect(getHoursFromTime('')).toBe(-1)
      expect(getHoursFromTime('12:60')).toBe(-1)
      expect(getHoursFromTime('25:00')).toBe(-1)
      expect(getHoursFromTime('-1:00')).toBe(-1)
    })
  })  

  describe('getMinutesFromTime', () => {
    it('should return the correct minutes from a valid time string', () => {
      const time = '12:34'
      const result = getMinutesFromTime(time)
      expect(result).toBe(34)
    })
  
    it('should return -1 for an invalid time string', () => {
      const time = '12:34:56'
      const result = getMinutesFromTime(time)
      expect(result).toBe(-1)
      expect(getMinutesFromTime('ab:09')).toBe(-1)
    })
  
    it('should return -1 for an empty time string', () => {
      const time = ''
      const result = getMinutesFromTime(time)
      expect(result).toBe(-1)
    })
  })
});
