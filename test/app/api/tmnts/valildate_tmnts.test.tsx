import { validTmntName, sanitizeTmnt, validateTmnt, exportedForTesting, validTmntDates, validTmntFkId } from "@/app/api/tmnts/valildate";
import { tmntType } from "@/lib/types/types";
import { mockTmnt } from "../../../mocks/tmnts/mockTmnt";
import { ErrorCode } from "@/lib/validation";
import { compareAsc } from "date-fns";
import { dateTo_yyyyMMdd } from "@/lib/dateTools";
const { gotTmntData, validTmntData } = exportedForTesting;

const startDate1 = new Date(Date.UTC(2020, 0, 30, 0, 0, 0, 0)) // 2020-01-30, month - 1
const startDate2 = new Date(Date.UTC(2020, 0, 31, 0, 0, 0, 0)) // 2020-01-30, month - 1
const endDate1 = new Date(Date.UTC(2020, 0, 30, 0, 0, 0, 0)) // 2020-01-30, month - 1
const endDate2 = new Date(Date.UTC(2020, 0, 31, 0, 0, 0, 0)) // 2020-01-30, month - 1

const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const nonTmntId = 'evt_5bcefb5d314fff1ff5da6521a2fa7bde';

describe('tmnt table data validation', () => { 

  describe('gotTmntData function - checks for missing data', () => { 
    let testTmnt: tmntType;    

    it('should return a None error code when valid tmntData object', () => { 
      testTmnt = {
        ...mockTmnt,
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.None)      
    })
    it('should return missing data error code when no id', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when no tmnt_name', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when no start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date: null as any        
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when no end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date: null as any        
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when no bowl_id', () => {
      testTmnt = {
        ...mockTmnt,
        bowl_id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when no user_id', () => {
      testTmnt = {
        ...mockTmnt,
        user_id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when tmnt_name contains only special characters', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '!$%^&'
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return missing data error code when tmnt_name properly sanitized', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '  ****  %%% '
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MissingData)
    })
  })

  describe('validTmntName function', () => {
    it('should return true for valid tmnt_name', () => {
      expect(validTmntName('Valid Tournament Name')).toBe(true)
    })
    it('should return false for blank tmnt_name', () => {
      expect(validTmntName('')).toBe(false)
    })
    it('should return false for tmnt_name that is too long', () => {
      expect(validTmntName('12345678901234567890123456789012345678901234567890')).toBe(false)
    })
    it('should return false for tmnt_name with oonly special characters', () => {
      expect(validTmntName('!$%^&')).toBe(false)
    })
    it('should return false for tmnt_name with only spaces', () => {
      expect(validTmntName('  ')).toBe(false)
    })
    it('should return false for tmnt_name with only spaces and special characters', () => {
      expect(validTmntName('  !$%^&  ')).toBe(false)
    })
    it('should return true for tmnt name with some specail characters, but also has valid text', () => {
      expect(validTmntName('  ***  Valid Tournament Name  ++ ')).toBe(true)
    })
    it('should return false for tmnt_name that contails HTML tags', () => { 
      // sanitized to alert'hello'
      expect(validTmntName("<script>alert('hello')</script>")).toBe(true)  
    })
  })

  describe('validTmntDates function', () => { 
    const tooPastDate = new Date(Date.UTC(1899, 11, 31, 0, 0, 0, 0)) // 1899-12-31
    const tooFutureDate = new Date(Date.UTC(2201, 1, 1, 0, 0, 0, 0)) // 2200-02-01

    const startDate1Str = '2020-01-30'
    const startDate2Str = '2020-01-31'
    const endDate1Str = '2020-01-30'
    const endDate2Str = '2020-01-31'

    const tooPastDateStr = '1899-12-31';
    const tooFutureDateStr = '2201-02-01';

    it('should return true for valid start_date and end_date, both the same date', () => {
      expect(validTmntDates(startDate1, startDate1)).toBe(true)
      expect(validTmntDates(startDate1Str as any, startDate1Str as any)).toBe(true)
    })
    it('should return true for valid start_date and end_date, end after start', () => {
      expect(validTmntDates(startDate1, endDate2)).toBe(true)  
      expect(validTmntDates(startDate1Str as any, endDate2Str as any)).toBe(true)  
    })
    it('should return true for empty start and end_date', () => {
      expect(validTmntDates(null as any, null as any)).toBe(false)      
    })
    it('should return false for start_date after end_date', () => {
      expect(validTmntDates(startDate2, endDate1)).toBe(false)      
      expect(validTmntDates(startDate2Str as any, endDate1 as any)).toBe(false)      
    })
    it('should return false for invalid start_date', () => {
      expect(validTmntDates('2020-01-32' as any, endDate2)).toBe(false)
      expect(validTmntDates('2020-13-01' as any, endDate2)).toBe(false)
    })
    it('should return false for invalid end_date', () => {
      expect(validTmntDates(startDate2, '2020-01-32' as any)).toBe(false)
      expect(validTmntDates(startDate1, '2020-13-01' as any)).toBe(false)
    })
    it('should return false for valid start date and empty end date', () => { 
      expect(validTmntDates(startDate1, null as any)).toBe(false)      
    })
    it('should return false for valid end date and empty start date', () => { 
      expect(validTmntDates(null as any, endDate1)).toBe(false)
    })
    it('should return false for start date too old and valid end date', () => {
      expect(validTmntDates(tooPastDate, endDate1)).toBe(false)
      expect(validTmntDates(tooPastDateStr as any, endDate1Str as any)).toBe(false)
    })
    it('should return false for start date too in the future and valid end date ', () => {
      expect(validTmntDates(tooFutureDate, endDate1)).toBe(false)
      expect(validTmntDates(tooFutureDateStr as any, endDate1Str as any)).toBe(false)
    })
    it('should return false for start date and end date too old', () => {
      expect(validTmntDates(startDate1, tooPastDate)).toBe(false)
      expect(validTmntDates(startDate1Str as any, tooPastDate as any)).toBe(false)
    })
    it('should return false for valid start date and end date too in the future', () => {
      expect(validTmntDates(startDate1, tooFutureDate)).toBe(false)
      expect(validTmntDates(startDate1Str as any, tooFutureDateStr as any)).toBe(false)      
    })
  })
  
  describe('validTmntFkId function', () => { 
    it('should return true for valid bowl_id', () => {
      expect(validTmntFkId(mockTmnt.bowl_id, 'bwl')).toBe(true)
    })
    it('should return true for valid user_id', () => {
      expect(validTmntFkId(mockTmnt.user_id, 'usr')).toBe(true)
    })
    it('should return false for invalid foreign key id', () => {
      expect(validTmntFkId('abc_def', 'bwl')).toBe(false)
    })
    it('should return false if foreign key id type does not match id type', () => { 
      expect(validTmntFkId(mockTmnt.bowl_id, 'usr')).toBe(false)
    })
    it('should return false for a blank foreign key id', () => { 
      expect(validTmntFkId('', 'bwl')).toBe(false)
    })
    it('should return false for an null foreign key id', () => { 
      expect(validTmntFkId(null as any, 'bwl')).toBe(false)
    })
    it('should return false for an null key type', () => { 
      expect(validTmntFkId(mockTmnt.bowl_id, null as any)).toBe(false)
    })

  })

  describe('validTmntData function - invalid data', () => {
    let testTmnt: tmntType;

    it('should return None error code when valid tmntData object', () => {
      testTmnt = {
        ...mockTmnt,
      } 
      expect(validTmntData(testTmnt)).toBe(ErrorCode.None)
    })
    it('should return invalid data error code when id is blank', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when id is blank', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when id is invalid', () => { 
      testTmnt = {
        ...mockTmnt,
        id: 'test'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when tmnt_name is valid but not a tmnt id', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: nonTmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when tmnt_name too long', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '12345678901234567890123456789012345678901234567890'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when tmnt_name contains only special characters', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '!$%^&'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })    
    it('should return invalid data error code when non date start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date: 'abc' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when invalid start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date: '2020-01-32' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when non date end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date: 'abc' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when invalid end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date: '2020-02-32' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when start_date is after end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date: startDate2,
        end_date: endDate1
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when no bowl_id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when invalid bowl_id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: 'abc'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when got bowl_id, but not a valid bowl id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: tmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when no user_id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when invalid user_id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: 'abc'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when got user_id, but not a valid user id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: tmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when tmnt is null', () => { 
      expect(validTmntData(null as any)).toBe(ErrorCode.InvalidData)
    })
    it('should return invalid data error code when tmnt is undefined', () => { 
      expect(validTmntData(undefined as any)).toBe(ErrorCode.InvalidData)
    })
  })

  describe("sanitizeTmnt function", () => { 
    it('should return a sanitized tmnt object - no sanitizing - date as date values', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,                
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.id).toEqual(mockTmnt.id)
      expect(sanitized.tmnt_name).toEqual(mockTmnt.tmnt_name)
      expect(compareAsc(sanitized.start_date, mockTmnt.start_date)).toEqual(0)
      expect(compareAsc(sanitized.end_date, mockTmnt.end_date)).toEqual(0)
      expect(sanitized.bowl_id).toEqual(mockTmnt.bowl_id)
      expect(sanitized.user_id).toEqual(mockTmnt.user_id)            
    })
    it('should return a sanitized tmnt object - no sanitizing - date as strings', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: '2020-01-01' as any,
        end_date: '2020-01-01' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.id).toEqual(mockTmnt.id)
      expect(sanitized.tmnt_name).toEqual(mockTmnt.tmnt_name)
      expect(dateTo_yyyyMMdd(sanitized.start_date)).toEqual('2020-01-01')
      expect(dateTo_yyyyMMdd(sanitized.end_date)).toEqual('2020-01-01')
      expect(sanitized.bowl_id).toEqual(mockTmnt.bowl_id)
      expect(sanitized.user_id).toEqual(mockTmnt.user_id)            
    })
    it('should return a sanitized tmnt object when event has an invalid id', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: 'test',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.id).toEqual('')
    })
    it('should return a sanitized tmnt name', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '   T>e<s@t-N#aকm😀e  ',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.tmnt_name).toEqual('Test-Name')
    })
    it('should remove HTML tags from tmnt name', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: "<script>alert('hello')</script>",
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.tmnt_name).toEqual("alert'hello'")
    })
    it('should return a valid start_date for a valid start date' , () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: startDate1,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toEqual(startDate1)
    })
    it('should return a valid start_date for a valid start date string', () => {
      const dateStr = dateTo_yyyyMMdd(startDate1) // startDate1.toISOString();
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: dateStr as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(dateTo_yyyyMMdd(sanitized.start_date)).toEqual(dateStr)
    })
    it('should return a valid start_date for a valid start date string', () => {
      const dateStr = dateTo_yyyyMMdd(startDate1) // startDate1.toISOString();
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: dateStr as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(dateTo_yyyyMMdd(sanitized.start_date)).toEqual(dateStr)      
    })
    it('should return a null start date for an invalid start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: '2020-01-32' as any,
        end_date: '2020-01-32' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toBeNull()
    })
    it('should return a null start date for html code in start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: "<script>alert('hello')</script>" as any,        
        end_date: '2020-01-32' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toBeNull()
    })
    it('should return a null start date for html code in start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: "<script>alert('hello')</script>" as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toBeNull()
      expect(sanitized.start_date).toBeNull()
    })
    it('should return a null start date for a non date start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: 'abc' as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toEqual(null)
      expect(sanitized.start_date).toEqual(null)
    })
    it('should return a null start date for a null start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: null as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toBeNull()
      expect(sanitized.start_date).toBeNull()
    })
    it('should return a valid end_date for a valid end date' , () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: startDate1, // need both start and end so end is valid
        end_date: endDate1
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date).toEqual(endDate1)
    })
    it('should return a valid start_date for a valid start date string', () => {
      const dateStr = dateTo_yyyyMMdd(endDate1) // endDate1.toISOString();
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: startDate1, // need both start and end so end is valid
        end_date: dateStr as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(dateTo_yyyyMMdd(sanitized.end_date)).toEqual(dateStr)
    })
    it('should return a valid start_date for a valid start date string', () => {
      const dateStr = dateTo_yyyyMMdd(endDate1) // endDate1.toISOString();
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: startDate1, // need both start and end so end is valid
        end_date: dateStr as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toEqual(startDate1)
      expect(sanitized.start_date).toEqual(startDate1)
    })
    it('should return a null end date for an invalid end date', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: '2020-02-30' as any,
        end_date: '2020-02-30' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date).toBeNull()
    })
    it('should return a null end date for an html code in end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: "<script>alert('hello')</script>" as any,        
        end_date: '2020-02-30' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date).toBeNull()
    })
    it('should return a null end date for an html code in end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: "<script>alert('hello')</script>" as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date).toBeNull()
      expect(sanitized.start_date).toBeNull()
    })
    it('should return a null end date for a non date end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date: 'abc' as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date).toEqual(null)
      expect(sanitized.end_date).toEqual(null)
    })
    it('should return a null end date for a null end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date: null as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date).toBeNull()
      expect(sanitized.end_date).toBeNull()
    })
    it('should return a blank bowl_id for an invalid bowl_id', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: 'abc',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.bowl_id).toEqual('')
    })
    it('should return a blank bowl_id for an valid id, but wrong id type', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: mockTmnt.user_id,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.bowl_id).toEqual('')
    })
    it('should return a blank user_id for an invalid user_id', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: 'abc',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.user_id).toEqual('')
    })
    it('should return a blank user_id for a blank user_id', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: '',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.user_id).toEqual('')
    })
    it('should return a blank user_id for an valid id, but wrong id type', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: mockTmnt.bowl_id,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.user_id).toEqual('')
    })

  })

  describe("validateTmnt function", () => {
    it('should return ErrorCode.None whenfor a valid tmnt object', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.MissingData when id is blank', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData when id is valid, but not a tmnt is', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: nonTmntId,
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.None when tmnt_name is sanitized and valid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '  Test* Name ',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.MissingData when tmnt_name is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when tmnt_name is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '***',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })    
    it('should return ErrorCode.MissingData when start_date is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: null as any,      
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when start_date is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date: '02/32/2020' as any,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })    
    it('should return ErrorCode.MissingData when end_date is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date: null as any,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when end_date is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date: '02/32/2020' as any,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.MissingData when bowl_id is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when bowl_id is inavlid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData when bowl_id is valid but not a bowl id', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: mockTmnt.user_id,
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.MissingData when user_id is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.InvalidData when user_id is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.InvalidData)
    })
  })
  
})