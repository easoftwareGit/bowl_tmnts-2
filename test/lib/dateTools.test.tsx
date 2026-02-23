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
  getMonthDay,
  getTimeString,
  startOfTodayUTC,
  validDateString,
  removeTimeFromISODateStr,
  valid_yyyyMMdd,
  yyyyMMdd_To_ddMMyyyy,
  ymdType,
  dateStringToTimeStamp,
  toIso,  
} from "@/lib/dateTools";
import { addDays, addMinutes, compareAsc, startOfToday } from "date-fns";

describe("tests for dateTools", () => {
  
  describe("dateTo_UTC_yyyyMMdd", () => {
    it("should format a date into a UTC string using yyyy-MM-dd", () => {
      const date = new Date("2022-01-01");
      const formattedDate = dateTo_UTC_yyyyMMdd(date);
      expect(formattedDate).toBe("2022-01-01");
    });
  });

  describe("dateTo_yyyyMMdd", () => {
    
    it('should format a typical date in the middle of the year correctly', () => {
      const date = new Date(2024, 9, 26); // October 26, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-10-26');
    });
    it('should handle dates with single-digit months correctly', () => {
      const date = new Date(2024, 0, 5); // January 5, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-01-05');
    });
    it('should format a date at the end of the year correctly', () => {
      const date = new Date(2024, 11, 31); // December 31, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-12-31');
    });
    it('should format a date at the beginning of the year correctly', () => {
      const date = new Date(2024, 0, 1); // January 1, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-01-01');
    });
    it('should format a date in a leap year correctly', () => {
      const date = new Date(2020, 1, 29); // February 29, 2020 (leap year)
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2020-02-29');
    });
    it('should handle single-digit days correctly', () => {
      const date = new Date(2024, 9, 6); // October 6, 2024
      const formattedDate = dateTo_yyyyMMdd(date);
      expect(formattedDate).toBe('2024-10-06');
    });    
    it('should return empty string when given an invalid date object', () => {
      const date = new Date('invalid-date');
      const result = dateTo_UTC_yyyyMMdd(date);
      expect(result).toBe('');
    });
    it('should return same date as todayStr', () => { 
      const todayDate = startOfDayFromString(todayStr) as Date;
      const formattedDate = dateTo_yyyyMMdd(todayDate);
      expect(formattedDate).toBe(todayStr);
    })
    it('should return tomarrow when added 1 day to today', () => { 
      const todayDate = startOfDayFromString(todayStr) as Date;
      const tomorrowDate = addDays(todayDate, 1);
      const formattedDate = dateTo_yyyyMMdd(tomorrowDate);
      expect(formattedDate).not.toBe(todayStr);
      expect(compareAsc(tomorrowDate, todayDate)).toBe(1);
    })

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
      const eoToday = endOfDayFromString(todayStr) as Date
      if (!eoToday) throw new Error('endOfDayFromString failed')
      const ymd: ymdType = getYearMonthDays(todayStr);
      expect(eoToday.getFullYear()).toBe(ymd.year);
      expect(eoToday.getMonth()).toBe(ymd.month); 
      expect(eoToday.getDate()).toBe(ymd.days);
      expect(eoToday.getHours()).toBe(23);
      expect(eoToday.getMinutes()).toBe(59);
      expect(eoToday.getSeconds()).toBe(59);
      expect(eoToday.getMilliseconds()).toBe(999);
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

  describe('valid_yyyyMMdd', () => { 
    it('should return true for valid YYYY-MM-DD date string', () => { 
      const result = valid_yyyyMMdd('2023-10-05');
      expect(result).toBe(true);
    })
    it('should return false for invalid YYYY-MM-DD date string', () => { 
      const result = valid_yyyyMMdd('2023-13-05');
      expect(result).toBe(false);
    })
    it('should return false for invalid date string with time', () => {
      const result = valid_yyyyMMdd('2023-10-05T14:48:00.000Z');
      expect(result).toBe(false);
    })
    it('should return false for invalid date string just text', () => {
      const result = valid_yyyyMMdd('invalid-date-string');
      expect(result).toBe(false);
    })
    it('should return false for invalid date string not in YYYY-MM-DD format', () => {
      const result = valid_yyyyMMdd('2024-10-5');
      expect(result).toBe(false);
    })
    it('should return false for invalid date string in MM/DD/YYYY format', () => {
      const result = valid_yyyyMMdd('10/05/2023');
      expect(result).toBe(false);
    })
    it('should return false for empty string', () => { 
      const result = valid_yyyyMMdd('');
      expect(result).toBe(false);
    })
    it('should return false for null', () => { 
      const result = valid_yyyyMMdd(null as any);
      expect(result).toBe(false);
    })
    it('should return false for undefined', () => { 
      const result = valid_yyyyMMdd(undefined as any);
      expect(result).toBe(false);
    })
  })

  describe('yyyyMMdd_To_ddMMyyyy', () => { 
    it('should return correct date string when given a valid YYYY-MM-DD date string', () => { 
      const result = yyyyMMdd_To_ddMMyyyy('2023-10-05');
      expect(result).toBe('10/05/2023');
    })
    it('should return empty string when given an invalid YYYY-MM-DD date string', () => { 
      const result = yyyyMMdd_To_ddMMyyyy('2023-13-05');
      expect(result).toBe('');
    })
    it('should return empty string when given an invalid date string with time', () => {
      const result = yyyyMMdd_To_ddMMyyyy('2023-10-05T14:48:00.000Z');
      expect(result).toBe('');
    })
    it('should return empty string when given an invalid date string just text', () => {
      const result = yyyyMMdd_To_ddMMyyyy('invalid-date-string');
      expect(result).toBe('');
    })
    it('should return empty string when given an invalid date string not in YYYY-MM-DD format', () => {
      const result = yyyyMMdd_To_ddMMyyyy('2024-10-5');
      expect(result).toBe('');
    })
    it('should return empty string when given an invalid date string in MM/DD/YYYY format', () => {
      const result = yyyyMMdd_To_ddMMyyyy('10/05/2023');
      expect(result).toBe('');
    })
    it('should return empty string when given an empty string', () => {
      const result = yyyyMMdd_To_ddMMyyyy('');
      expect(result).toBe('');
    })
    it('should return empty string when given null', () => {
      const result = yyyyMMdd_To_ddMMyyyy(null as any);
      expect(result).toBe('');
    })
    it('should return empty string when given undefined', () => {
      const result = yyyyMMdd_To_ddMMyyyy(undefined as any);
      expect(result).toBe('');
    })  
  })

  describe('getYearMonthDays', () => {

    it('should return correct year, month, and days when given a valid date string', () => {
      const dateStr = '2023-10-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 2023, month: 9, days: 5 });
    });
    it('should return default ymd object when given an empty string', () => {
      const dateStr = '';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: -1, days: 0 });
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
      expect(result).toEqual({ year: 0, month: -1, days: 0 });
    });
    it('should return default ymd object for date strings with invalid month values', () => {
      const dateStr = '2023-13-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: -1, days: 0 });
    });
    it('should return empty object when given a date string with non-numeric characters', () => {
      const dateStr = '2023-1a-05';
      const result = getYearMonthDays(dateStr);
      expect(result).toEqual({ year: 0, month: -1, days: 0 });
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

  describe('getMonthDay', () => {

    it('should return formatted month and day when given valid date string', () => {
      const dateStr = '2023-12-25';
      const result = getMonthDay(dateStr);
      expect(result).toBe('Dec 25');
    });
    it('should return empty string when given empty date string', () => {
      const dateStr = '';
      const result = getMonthDay(dateStr);
      expect(result).toBe('');
    });
    it('should return formatted month and day when given valid date string', () => {
      const dateStr = '2023-12-25';
      const result = getMonthDay(dateStr);
      expect(result).toBe('Dec 25');
    });
    it('should return formatted month and day with leading zero removed for single digit days', () => {
      const dateStr = '2023-01-05';
      const result = getMonthDay(dateStr);
      expect(result).toBe('Jan 05');
    });
    it('should return empty string when given invalid date format', () => {
      const invalidDateStr = '12-25-2023';
      const result = getMonthDay(invalidDateStr);
      expect(result).toBe('');
    });
    it('should return empty string when date string length is incorrect', () => {
      const dateStr = '2023-12-2';
      const result = getMonthDay(dateStr);
      expect(result).toBe('');
    });
    it('should return empty string when given date string with invalid month number', () => {
      const invalidMonthDateStr1 = '2023-00-15';
      const invalidMonthDateStr2 = '2023-13-15';
      const result1 = getMonthDay(invalidMonthDateStr1);
      const result2 = getMonthDay(invalidMonthDateStr2);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
    it('should return empty string when given invalid day number', () => {
      const invalidDateStr1 = '2023-12-00';
      const invalidDateStr2 = '2023-12-32';
      const result1 = getMonthDay(invalidDateStr1);
      const result2 = getMonthDay(invalidDateStr2);
      expect(result1).toBe('');
      expect(result2).toBe('');
    });
    it('should return empty string when date string has incorrect separators', () => {
      const dateStr = '2023/12/25';
      const result = getMonthDay(dateStr);
      expect(result).toBe('');
    });
    it('should preserve leading zero in day number when given valid date string', () => {
      const dateStr = '2023-01-05';
      const result = getMonthDay(dateStr);
      expect(result).toBe('Jan 05');
    });
    it('should return the same month and day for different years', () => {
      const dateStr1 = '2023-12-25';
      const dateStr2 = '2022-12-25';
      const dateStr3 = '2021-12-25';
      const result1 = getMonthDay(dateStr1);
      const result2 = getMonthDay(dateStr2);
      const result3 = getMonthDay(dateStr3);
      expect(result1).toBe('Dec 25');
      expect(result2).toBe('Dec 25');
      expect(result3).toBe('Dec 25');
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

  describe('dateStringToTimeStamp', () => {

    it('should convert ISO date string to Unix timestamp number when given valid date', () => {
      const isoDateString = '2023-12-25T10:30:00.000Z';
      const expectedTimestamp = new Date('2023-12-25T10:30:00.000Z').getTime();
      const result = dateStringToTimeStamp(isoDateString);
      expect(result).toBe(expectedTimestamp);
    });
    it('should return NaN when given invalid date string format', () => {
      const invalidDateString = 'not-a-date';
      const result = dateStringToTimeStamp(invalidDateString);
      expect(result).toBeNaN();
    });
    it('should convert ISO date string with timezone offset to Unix timestamp number', () => {
      const isoDateStringWithOffset = '2023-12-25T10:30:00.000+02:00';
      const expectedTimestamp = new Date('2023-12-25T08:30:00.000Z').getTime();
      const result = dateStringToTimeStamp(isoDateStringWithOffset);
      expect(result).toBe(expectedTimestamp);
    });
    it('should convert UTC ISO date string to Unix timestamp number when given valid date', () => {
      const utcIsoDateString = '2023-12-25T10:30:00.000Z';
      const expectedTimestamp = new Date('2023-12-25T10:30:00.000Z').getTime();
      const result = dateStringToTimeStamp(utcIsoDateString);
      expect(result).toBe(expectedTimestamp);
    });
    it('should convert date string with time components to Unix timestamp number', () => {
      const dateString = '2023-12-25T15:45:30.000Z';
      const expectedTimestamp = new Date('2023-12-25T15:45:30.000Z').getTime();
      const result = dateStringToTimeStamp(dateString);
      expect(result).toBe(expectedTimestamp);
    });
    it('should convert ISO date string from different years to Unix timestamp number', () => {
      const isoDateString = '1999-01-01T00:00:00.000Z';
      const expectedTimestamp = new Date('1999-01-01T00:00:00.000Z').getTime();
      const result = dateStringToTimeStamp(isoDateString);
      expect(result).toBe(expectedTimestamp);
    });
    it('should return NaN when given an empty string', () => {
      const emptyString = '';
      const result = dateStringToTimeStamp(emptyString);
      expect(result).toBeNaN();
    });
    it('should return NaN when input is null or undefined', () => {
      const resultNull = dateStringToTimeStamp(null as any);
      const resultUndefined = dateStringToTimeStamp(undefined as any);
      expect(resultNull).toBeNaN();
      expect(resultUndefined).toBeNaN();
    });
    it('should return NaN when input is not a string', () => {
      const nonStringInput = 12345;
      const result = dateStringToTimeStamp(nonStringInput as any);
      expect(result).toBeNaN();
    });
    it('should return NaN when given a malformed ISO date string', () => {
      const malformedIsoDateString = '2023-13-40T25:61:00.000Z';
      const result = dateStringToTimeStamp(malformedIsoDateString);
      expect(result).toBeNaN();
    });
    it('should return negative timestamp for dates before 1970', () => {
      const isoDateString = '1965-12-25T10:30:00.000Z';
      const expectedTimestamp = new Date('1965-12-25T10:30:00.000Z').getTime();
      const result = dateStringToTimeStamp(isoDateString);
      expect(result).toBe(expectedTimestamp);
    });
    it('should correctly handle daylight savings time transition', () => {
      const isoDateString = '2023-03-12T02:30:00.000Z'; // Date during DST transition
      const expectedTimestamp = new Date('2023-03-12T02:30:00.000Z').getTime();
      const result = dateStringToTimeStamp(isoDateString);
      expect(result).toBe(expectedTimestamp);
    });
  });

  describe("toIso", () => {
    it("should return ISO string for a valid Date", () => {
      const d = new Date("2024-10-26T12:34:56.789Z");
      expect(toIso(d)).toBe("2024-10-26T12:34:56.789Z");
    });

    it("should return null when given null", () => {
      expect(toIso(null)).toBeNull();
    });

    it("should return null when given undefined", () => {
      expect(toIso(undefined)).toBeNull();
    });

    it("should return null for an invalid Date object (no throw)", () => {
      const bad = new Date("invalid-date");
      expect(toIso(bad)).toBeNull();
    });

    it("should not throw for an invalid Date object", () => {
      const bad = new Date("invalid-date");
      expect(() => toIso(bad)).not.toThrow();
    });
  });

});
