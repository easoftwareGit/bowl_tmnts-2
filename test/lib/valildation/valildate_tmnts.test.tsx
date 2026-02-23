import { validTmntName, sanitizeTmnt, validateTmnt, exportedForTesting, validTmntDates, validTmntFkId } from "@/lib/validation/tmnts/valildate";
import type { tmntType } from "@/lib/types/types";
import { mockTmnt } from "../../mocks/tmnts/mockTmnt";
import { ErrorCode } from "@/lib/enums/enums";
const { gotTmntData, validTmntData } = exportedForTesting;

const startDate1Str = '2020-01-30';
const startDate2Str = '2020-01-31';
const endDate1Str = '2020-01-30';
const endDate2Str = '2020-01-31'; 
const tooPastDateStr = '1899-12-31';
const tooFutureDateStr = '2201-02-01';

const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const nonTmntId = 'evt_5bcefb5d314fff1ff5da6521a2fa7bde';

describe('tmnt table data validation', () => { 

  describe('gotTmntData function - checks for missing data', () => { 
    let testTmnt: tmntType;    

    it('should return a None error code when valid tmntData object', () => { 
      testTmnt = {
        ...mockTmnt,
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.NONE)      
    })
    it('should return missing data error code when no id', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when no tmnt_name', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when no start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date_str: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when no end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date_str: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when no bowl_id', () => {
      testTmnt = {
        ...mockTmnt,
        bowl_id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when no user_id', () => {
      testTmnt = {
        ...mockTmnt,
        user_id: ''
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when tmnt_name contains only special characters', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '!$%^&'
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return missing data error code when tmnt_name properly sanitized', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '  ****  %%% '
      }
      expect(gotTmntData(testTmnt)).toBe(ErrorCode.MISSING_DATA)
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

    it('should return true for valid start_date and end_date, both the same date', () => {
      expect(validTmntDates(startDate1Str, startDate1Str)).toBe(true)
      expect(validTmntDates(new Date(startDate1Str) as any, startDate1Str as any)).toBe(false)
      expect(validTmntDates(startDate1Str, new Date(startDate1Str) as any)).toBe(false)
    })
    it('should return true for valid start_date and end_date, end after start', () => {
      expect(validTmntDates(startDate1Str, endDate2Str)).toBe(true)  
    })
    it('should return true for empty start and end_date', () => {
      expect(validTmntDates(null as any, null as any)).toBe(false)      
    })
    it('should return false for start_date after end_date', () => {
      expect(validTmntDates(startDate2Str, endDate1Str)).toBe(false)      
    })
    it('should return false for invalid start_date', () => {
      expect(validTmntDates('2020-01-32' as any, endDate2Str)).toBe(false)
    })
    it('should return false for invalid end_date', () => {
      expect(validTmntDates(startDate2Str, '2020-01-32' as any)).toBe(false)
      expect(validTmntDates(startDate1Str, '2020-13-01' as any)).toBe(false)
    })
    it('should return false for valid start date and empty end date', () => { 
      expect(validTmntDates(startDate1Str, null as any)).toBe(false)      
    })
    it('should return false for valid end date and empty start date', () => { 
      expect(validTmntDates(null as any, endDate1Str)).toBe(false)
    })
    it('should return false for start date too old and valid end date', () => {
      expect(validTmntDates(tooPastDateStr, endDate1Str)).toBe(false)
    })
    it('should return false for start date too in the future and valid end date ', () => {
      expect(validTmntDates(tooFutureDateStr, endDate1Str)).toBe(false)
    })
    it('should return false for start date and end date too old', () => {
      expect(validTmntDates(startDate1Str, tooPastDateStr)).toBe(false)
    })
    it('should return false for valid start date and end date too in the future', () => {
      expect(validTmntDates(startDate1Str, tooFutureDateStr)).toBe(false)
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
      expect(validTmntData(testTmnt)).toBe(ErrorCode.NONE)
    })
    it('should return invalid data error code when id is blank', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when id is blank', () => { 
      testTmnt = {
        ...mockTmnt,
        id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when id is invalid', () => { 
      testTmnt = {
        ...mockTmnt,
        id: 'test'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when tmnt_name is valid but not a tmnt id', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: nonTmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when tmnt_name too long', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '12345678901234567890123456789012345678901234567890'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when tmnt_name contains only special characters', () => { 
      testTmnt = {
        ...mockTmnt,
        tmnt_name: '!$%^&'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })    
    it('should return invalid data error code when non date start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date_str: 'abc' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when invalid start_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date_str: '2020-01-32' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when non date end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date_str: 'abc' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when invalid end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        end_date_str: '2020-02-32' as any        
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when start_date is after end_date', () => { 
      testTmnt = {
        ...mockTmnt,
        start_date_str: startDate2Str,
        end_date_str: endDate1Str
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when no bowl_id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when invalid bowl_id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: 'abc'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when got bowl_id, but not a valid bowl id', () => { 
      testTmnt = {
        ...mockTmnt,
        bowl_id: tmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when no user_id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: ''
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when invalid user_id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: 'abc'
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when got user_id, but not a valid user id', () => { 
      testTmnt = {
        ...mockTmnt,
        user_id: tmntId,
      }
      expect(validTmntData(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when tmnt is null', () => { 
      expect(validTmntData(null as any)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return invalid data error code when tmnt is undefined', () => { 
      expect(validTmntData(undefined as any)).toBe(ErrorCode.INVALID_DATA)
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
      expect(sanitized.start_date_str).toEqual(mockTmnt.start_date_str)
      expect(sanitized.end_date_str).toEqual(mockTmnt.end_date_str)
      expect(sanitized.bowl_id).toEqual(mockTmnt.bowl_id)
      expect(sanitized.user_id).toEqual(mockTmnt.user_id)            
    })
    it('should return a sanitized tmnt object - no sanitizing - date as strings', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '2020-01-01' as any,
        end_date_str: '2020-01-01' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.id).toEqual(testTmnt.id)
      expect(sanitized.tmnt_name).toEqual(testTmnt.tmnt_name)
      expect(sanitized.start_date_str).toEqual(testTmnt.start_date_str)
      expect(sanitized.end_date_str).toEqual(testTmnt.end_date_str)
      expect(sanitized.bowl_id).toEqual(testTmnt.bowl_id)
      expect(sanitized.user_id).toEqual(testTmnt.user_id)            
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
        start_date_str: startDate1Str,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date_str).toEqual(startDate1Str)
    })
    it('should return a blank start date for an invalid start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '2020-01-32',        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date_str).toBe('')
    })
    it('should return a blank start date for html code in start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: "<script>alert('hello')</script>",                
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date_str).toBe('')
    })
    it('should return a blank start date for a non date start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: 'abc' as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date_str).toEqual('')      
    })
    it('should return a blank start date for a null start date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: null as any,        
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.start_date_str).toBe('')      
    })
    it('should return a valid end_date for a valid end date' , () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: startDate1Str, // need both start and end so end is valid
        end_date_str: endDate1Str
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date_str).toEqual(endDate1Str)
    })
    it('should return a blank end date for an invalid end date', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '2020-02-30' as any,
        end_date_str: '2020-02-30' as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date_str).toBe('')
    })
    it('should return a blank end date for an html code in end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: startDate1Str,
        end_date_str: "<script>alert('hello')</script>" as any,
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date_str).toBe('')
    })
    it('should return a blank end date for a non date end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: startDate1Str,
        end_date_str: 'abc',
      }
      const sanitized = sanitizeTmnt(testTmnt)      
      expect(sanitized.end_date_str).toBe('')
    })
    it('should return a blank end date for a blank end date', () => { 
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: startDate1Str,
        end_date_str: '',
      }
      const sanitized = sanitizeTmnt(testTmnt)
      expect(sanitized.end_date_str).toBe('')      
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
    it('should return ErrorCode.NONE whenfor a valid tmnt object', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.NONE)
    })
    it('should return ErrorCode.MISSING_DATA when id is blank', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when id is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when id is valid, but not a tmnt is', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        id: nonTmntId,
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.NONE when tmnt_name is sanitized and valid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '  Test* Name ',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.NONE)
    })
    it('should return ErrorCode.MISSING_DATA when tmnt_name is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when tmnt_name is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        tmnt_name: '***',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })    
    it('should return ErrorCode.MISSING_DATA when start_date is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when start_date is invalid MM/DD/YYYY', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '02/32/2020',        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })    
    it('should return ErrorCode.INVALID_DATA when start_date is invalid YYYY-MM-DD', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        start_date_str: '2020-02-32',        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })    
    it('should return ErrorCode.MISSING_DATA when end_date is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date_str: '',        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when end_date is invalid MM/DD/YYYY', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date_str: '02/32/2020' as any,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when end_date is invalid YYYY-MM-DD', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        end_date_str: '2020-02-32' as any,        
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.MISSING_DATA when bowl_id is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when bowl_id is inavlid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when bowl_id is valid but not a bowl id', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        bowl_id: mockTmnt.user_id,
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
    it('should return ErrorCode.MISSING_DATA when user_id is missing', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: '',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.MISSING_DATA)
    })
    it('should return ErrorCode.INVALID_DATA when user_id is invalid', () => {
      const testTmnt: tmntType = {
        ...mockTmnt,
        user_id: 'test',
      }
      expect(validateTmnt(testTmnt)).toBe(ErrorCode.INVALID_DATA)
    })
  })
  
})