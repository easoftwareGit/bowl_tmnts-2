import {
  sanitizeSquad,
  validateSquad,
  validSquadName,
  validGames,
  validStartingLane,
  validLaneCount,
  validLaneConfig,    
  validSquadDate,
  validSquadTime,  
  validEventFkId,
  exportedForTesting,
  sanitizedTime,
  validateSquads
} from "@/app/api/squads/validate";
import { initSquad } from "@/lib/db/initVals";
import { ErrorCode, maxEventLength, maxSortOrder } from "@/lib/validation";
import { startOfTodayUTC } from "@/lib/dateTools";
import { compareAsc } from "date-fns";
import { mockSquadsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validSquadsType } from "@/lib/types/types";
import { mock } from "node:test";

const { gotSquadData, validSquadData } = exportedForTesting;

const squadId = 'sqd_7116ce5f80164830830a7157eb093396';

const validSquad = {
  ...initSquad,
  event_id: 'evt_cb97b73cb538418ab993fc867f860510',
  squad_name: 'Test Squad',
  games: 6,
  starting_lane: 1,
  lane_count: 12,
  squad_date: new Date(Date.UTC(2022, 9, 23, 0, 0, 0, 0)),  // month - 1
  squad_time: '12:00',
  sort_order: 1
}

describe('tests for squad validation', () => { 

  describe('getSquadData function', () => {

    it('should return ErrorCode.None when all data is valid', () => {
      expect(gotSquadData(validSquad)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.None when all data is valid, but no start time', () => { 
      const testSquad = {
        ...validSquad,
        squad_time: ''
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.MissingData when event_id is missing', () => {
      const testSquad = {
        ...validSquad,
        event_id: ''
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.MissingData when squad_name is missing', () => {
      const testSquad = {
        ...validSquad,
        squad_name: ''
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData)
    })
    it('should return ErrorCode.MissingData when games is missing', () => {
      const testSquad = {
        ...validSquad,
        games: null as any
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData) 
    })
    it('should return ErrorCode.MissingData when starting_lane is missing', () => {
      const testSquad = {
        ...validSquad,
        starting_lane: null as any
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData) 
    })
    it('should return ErrorCode.MissingData when lane_count is missing', () => {
      const testSquad = {
        ...validSquad,
        lane_count: null as any
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData) 
    })
    it('should return ErrorCode.MissingData when squad_date is missing', () => {
      const testSquad = {
        ...validSquad,
        squad_date: null as any
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData)       
    })
    it('should return ErrorCode.MissingData when sort_order is missing', () => {
      const testSquad = {
        ...validSquad,
        sort_order: null as any
      }
      expect(gotSquadData(testSquad)).toBe(ErrorCode.MissingData) 
    })
  })

  describe('validSquadName function', () => {
    it('should return true when name is valid', () => {
      expect(validSquadName('Test Squad')).toBe(true)
    })
    it('should return false when name is invalid', () => {
      const result = validSquadName('a'.repeat(maxEventLength + 1))
      expect(result).toBe(false)
    })
    it('should return false when name is empty', () => {      
      expect(validSquadName('')).toBe(false)
    })
    it('should return false when name is null', () => {      
      expect(validSquadName(null as any)).toBe(false)
    })
    it('should return false when name is undefined', () => {      
      expect(validSquadName(undefined as any)).toBe(false)
    })
    it('should return false when name is just special characters', () => { 
      expect(validSquadName('!@#$%^&*()')).toBe(false)
    })
    it('should sanitize event name', () => {
      const result = validSquadName('<script>alert(1)</script>')
      expect(result).toBe(true) // sanitizes to 'alert1'
    })

  })

  describe('validGames function', () => {
    it('should return true when games is valid', () => {
      expect(validGames(6)).toBe(true)
    })
    it('should return false when games is too low', () => {
      expect(validGames(0)).toBe(false)
    })
    it('should return false when games is too high', () => {
      expect(validGames(100)).toBe(false)
    })
    it('should return false when games is not an integer', () => {
      expect(validGames(5.5)).toBe(false)
    })
    it('should return false when games is null', () => {
      expect(validGames(null as any)).toBe(false)
    })
    it('should return false when games is undefined', () => {
      expect(validGames(undefined as any)).toBe(false)
    })
  })

  describe('validStartingLane function', () => {
    it('should return true when starting_lane is valid', () => {
      expect(validStartingLane(1)).toBe(true)
    })
    it('should return false when starting_lane is too low', () => {
      expect(validStartingLane(0)).toBe(false)
    })
    it('should return false when starting_lane is too high', () => {
      expect(validStartingLane(201)).toBe(false)
    })
    it('should return false when strating_lane is even', () => {
      expect(validStartingLane(2)).toBe(false)
    })
    it('should return false when starting_lane is not an integer', () => {
      expect(validStartingLane(5.5)).toBe(false)
    })
    it('should return false when starting_lane is null', () => {
      expect(validStartingLane(null as any)).toBe(false)
    })
    it('should return false when starting_lane is undefined', () => {
      expect(validStartingLane(undefined as any)).toBe(false)
    })
  })

  describe('validLaneCount function', () => {
    it('should return true when lane_count is valid', () => {
      expect(validLaneCount(2)).toBe(true)
    })
    it('should return false when lane_count is too low', () => {
      expect(validLaneCount(1)).toBe(false)
    })
    it('should return false when lane_count is too high', () => {
      expect(validLaneCount(202)).toBe(false)
    })
    it('should return false when lane_count is odd', () => {
      expect(validLaneCount(3)).toBe(false)
    })
    it('should return false when lane_count is not an integer', () => {
      expect(validLaneCount(5.5)).toBe(false)
    })
    it('should return false when lane_count is null', () => {
      expect(validLaneCount(null as any)).toBe(false)
    })
    it('should return false when lane_count is undefined', () => {
      expect(validLaneCount(undefined as any)).toBe(false)
    })
  })

  describe('validLaneConfig function', () => {
    it('should return true when lane_config is valid', () => {
      expect(validLaneConfig(1, 2)).toBe(true)
    })
    it('should return false when staringLane is too low', () => {
      expect(validLaneConfig(0, 2)).toBe(false)
    })
    it('should return false when stratingLane is too high', () => {
      expect(validLaneConfig(201, 2)).toBe(false)
    })
    it('should return false when stratingLane is even', () => {
      expect(validLaneConfig(2, 2)).toBe(false)
    })
    it('should return false when startingLane is not an integer', () => {
      expect(validLaneConfig(5.5, 2)).toBe(false)
    })
    it('should return false when stratingLane is null', () => {
      expect(validLaneConfig(null as any, 2)).toBe(false)
    })
    it('should return false when startingLane is undefined', () => {
      expect(validLaneConfig(undefined as any, 2)).toBe(false)
    })
    it('should return false when laneCount is too low', () => {
      expect(validLaneConfig(1, 0)).toBe(false)
    })
    it('should return false when laneCount is too high', () => {
      expect(validLaneConfig(1, 202)).toBe(false)
    })
    it('should return false when laneCount is odd', () => {
      expect(validLaneConfig(1, 3)).toBe(false)
    })
    it('should return false when laneCount is not an integer', () => {
      expect(validLaneConfig(1, 5.5)).toBe(false)
    })
    it('should return false when laneCount is null', () => {
      expect(validLaneConfig(1, null as any)).toBe(false)
    })
    it('should return false when laneCount is undefined', () => {
      expect(validLaneConfig(1, undefined as any)).toBe(false)
    })
    it('should return false when startingLane + laneCount is too high', () => {
      expect(validLaneConfig(100, 103)).toBe(false)
    })
  })

  describe('validSquadDate function', () => { 
    const tooPastDate = new Date(Date.UTC(1899, 11, 31, 0, 0, 0, 0)) // 1899-12-31
    const tooFutureDate = new Date(Date.UTC(2201, 1, 1, 0, 0, 0, 0)) // 2201-02-01

    const tooPastDateStr = '1899-12-31'
    const tooFutureDateStr = '2201-02-01';


    it('should return true when date is valid', () => {
      expect(validSquadDate(startOfTodayUTC())).toBe(true)
    })
    it('should return true when date is a date, not string date', () => { 
      expect(validSquadDate(new Date() as any)).toBe(true)
    })
    it('should return false when date is not valid UTC Full Date', () => {
      expect(validSquadDate('2022-02-32' as any)).toBe(false)
    })
    it('should return false when date is null', () => {
      expect(validSquadDate(null as any)).toBe(false)
    })
    it('should return false when date is undefined', () => {
      expect(validSquadDate(undefined as any)).toBe(false)
    })
    it('should return false when date is not valid date string', () => {
      expect(validSquadDate('abc' as any)).toBe(false)
    })
    it('should return false when date is in the future', () => { 
      expect(validSquadDate(tooFutureDate)).toBe(false)
      expect(validSquadDate(tooFutureDateStr as any)).toBe(false)
    })
    it('should return false when date is in the past', () => { 
      expect(validSquadDate(tooPastDate)).toBe(false)
      expect(validSquadDate(tooPastDateStr as any)).toBe(false)
    })
  })

  describe('validSquadTime function', () => { 
    it('should return true when time is valid', () => {
      expect(validSquadTime('10:00')).toBe(true)
      expect(validSquadTime('10:00 AM')).toBe(true)
      expect(validSquadTime('10:00 PM')).toBe(true)
      expect(validSquadTime('13:00')).toBe(true)
      expect(validSquadTime('23:59')).toBe(true)      
      expect(validSquadTime('00:00')).toBe(true)      
    })
    it('should return true for empty string or null', () => { 
      expect(validSquadTime('')).toBe(true)
      expect(validSquadTime(null)).toBe(true)
    })
    it('should return false when time is not valid', () => {
      expect(validSquadTime('13:00 AM')).toBe(false)
      expect(validSquadTime('10:60')).toBe(false)
      expect(validSquadTime('24:00')).toBe(false)
      expect(validSquadTime('1:00')).toBe(false)
      expect(validSquadTime('1:00 PM')).toBe(false)
    })
    it('should return false when time is undefined', () => {
      expect(validSquadTime(undefined as any)).toBe(false)
    })
    it('should return false when time is not a valid string', () => {
      expect(validSquadTime('abc')).toBe(false)
    })
    it('should return false when time is a number', () => {
      expect(validSquadTime(10 as any)).toBe(false)
    })
  })

  describe('sanitizedTime', () => {
    it('should return the input string when it matches the 5-character time format', () => {
      const input = '12:34';
      const result = sanitizedTime(input);
      expect(result).toBe(input);
    });
    it('should return an empty string when the time string has incorrect length', () => {
      const input = '1234';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
    it('should return the input string when it matches the 8-character time format', () => {
        const input = '12:34 PM';
        const result = sanitizedTime(input);
        expect(result).toBe(input);
    });
    it('should return an empty string when the input is empty', () => {
      const input = '';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
    it('should return an empty string when the time string is empty', () => {
      const input = '';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
    it('should return an empty string when the time string is empty', () => {
      const input = '';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
    it('should return null when input is null', () => {
      const input = null;
      const result = sanitizedTime(input as any);
      expect(result).toBe(null);
    });
    it('should return empty string when time format is partial', () => {
      const input = '12:3';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
    it('should return empty string when time has html code', () => {
      const input = '<script>alert(1)</script>';
      const result = sanitizedTime(input);
      expect(result).toBe('');
    });
  });

  describe('validEventFkId function', () => { 
    it('should return true for valid event_id', () => {
      expect(validEventFkId(validSquad.event_id, 'evt')).toBe(true)
    })
    it('should return false for invalid foreign key id', () => {
      expect(validEventFkId('abc_def', 'evt')).toBe(false)
    })
    it('should return false if foreign key id type does not match id type', () => { 
      expect(validEventFkId(validSquad.event_id, 'usr')).toBe(false)
    })
    it('should return false for an empty foreign key id', () => { 
      expect(validEventFkId('', 'evt')).toBe(false)      
    })
    it('should return false for an null foreign key id', () => { 
      expect(validEventFkId(null as any, 'evt')).toBe(false)
    })
    it('should return false for an null key type', () => { 
      expect(validEventFkId(validSquad.event_id, null as any)).toBe(false)
    })
  })  

  describe('validSquadData function', () => {
    it('should return ErrorCode.None for valid squad data', () => {
      expect(validSquadData(validSquad)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.None for missing squad_time', () => {
      const stillValidSquad = {
        ...validSquad,
        squad_time: ''
      }
      expect(validSquadData(stillValidSquad)).toBe(ErrorCode.None)
    })
    it('should return ErrorCode.InvalidData for event_id missing', () => {
      const invalidSquad = {
        ...validSquad,
        event_id: ''
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for invalid event_id', () => {
      const invalidSquad = {
        ...validSquad,
        event_id: 'abc'
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData when event_id is a valid id, but not evt type', () => {
      const invalidSquad = {
        ...validSquad,
        event_id: 'usr_12345678901234567890123456789012'
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for missing squad_name', () => {
      const invalidSquad = {
        ...validSquad,
        squad_name: ''
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for games invalid', () => {
      const invalidSquad = {
        ...validSquad,
        games: 0
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for starting_lane invalid', () => {
      const invalidSquad = {
        ...validSquad,
        starting_lane: 2
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for lane_count invalid', () => {
      const invalidSquad = {
        ...validSquad,
        lane_count: 201
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for starting lane valid, lane count valiud, but the combo is invalid', () => {  
      const invalidSquad = {
        ...validSquad,
        starting_lane: 101,
        lane_count: 103
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for invalid squad_date', () => {
      const invalidSquad = {
        ...validSquad,
        squad_date: new Date(Date.UTC(1899, 0, 1, 0, 0, 0, 0))
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for invalid squad_time', () => {
      const invalidSquad = {
        ...validSquad,
        squad_time: '13:13:13'
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
    it('should return ErrorCode.InvalidData for invalid sort_order', () => {
      const invalidSquad = {
        ...validSquad,
        sort_order: -1
      }
      expect(validSquadData(invalidSquad)).toBe(ErrorCode.InvalidData)
    })
  })

  describe('sanitizeSquad function', () => {
    it('should return a sanitized squad when squad is already sanitized', () => {
      const testSquad = {
        ...validSquad,
        id: '',
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.id).toEqual('')
      expect(sanitizedSquad.event_id).toEqual(testSquad.event_id)
      expect(sanitizedSquad.squad_name).toEqual(testSquad.squad_name)
      expect(sanitizedSquad.games).toEqual(testSquad.games)
      expect(sanitizedSquad.starting_lane).toEqual(testSquad.starting_lane)
      expect(sanitizedSquad.lane_count).toEqual(testSquad.lane_count)
      expect(compareAsc(sanitizedSquad.squad_date, testSquad.squad_date)).toEqual(0)
      expect(sanitizedSquad.squad_time).toEqual(testSquad.squad_time)
      expect(sanitizedSquad.sort_order).toEqual(testSquad.sort_order)
    })
    it('should return a sanitized squad when squad has an id', () => {
      const testSquad = {
        ...validSquad,
        id: squadId,
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.id).toEqual(squadId)
    })
    it('should return a sanitized squad when squad has an invalid id', () => {
      const testSquad = {
        ...validSquad,
        id: 'test123',
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.id).toEqual('')
    })
    it('should return a sanitized squad when squad is NOT already sanitized', () => {
      // do not incluide numerical fields
      const testSquad = {
        ...validSquad,
        event_id: 'abc_123',
        squad_name: '  Test Squad**  ',
        squad_date: new Date(Date.UTC(2022, 13, 32, 0, 0, 0, 0)),  // month - 1 
        squad_time: '23:59',
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.event_id).toEqual('')
      expect(sanitizedSquad.squad_name).toEqual('Test Squad')
      expect(compareAsc(sanitizedSquad.squad_date, new Date(Date.UTC(2022, 13, 32, 0, 0, 0, 0)))).toEqual(0)
      expect(sanitizedSquad.squad_time).toEqual('23:59')
    })
    it('should return a sanitized squad when numerical values are null', () => {
      const testSquad = {
        ...validSquad,
        games: null as any,
        starting_lane: null as any,
        lane_count: null as any,
        sort_order: null as any
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.games).toBeNull
      expect(sanitizedSquad.starting_lane).toBeNull()
      expect(sanitizedSquad.lane_count).toBeNull()
      expect(sanitizedSquad.sort_order).toBeNull()
    })
    it('should return a sanitized squad when numerical values are not numbers', () => {
      const testSquad = {
        ...validSquad,
        games: 'abc' as any,
        starting_lane: ['abc', '123'] as any,
        lane_count: new Date() as any,
        sort_order: {text: 'abc'} as any
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.games).toBeNull
      expect(sanitizedSquad.starting_lane).toBeNull()
      expect(sanitizedSquad.lane_count).toBeNull()
      expect(sanitizedSquad.sort_order).toBeNull()
    })
    it('should return a sanitized squad when numerical values are too low', () => {
      const testSquad = {
        ...validSquad,
        games: 0,
        starting_lane: 0,
        lane_count: 0,
        sort_order: 0
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.games).toEqual(0)
      expect(sanitizedSquad.starting_lane).toEqual(0)
      expect(sanitizedSquad.lane_count).toEqual(0)
      expect(sanitizedSquad.sort_order).toEqual(0)
    })
    it('should return a sanitized squad when numerical values are too high', () => {
      const testSquad = {
        ...validSquad,
        games: 123,
        starting_lane: 201,
        lane_count: 201,
        sort_order: 1234567
      }
      const sanitizedSquad = sanitizeSquad(testSquad)
      expect(sanitizedSquad.games).toEqual(123)
      expect(sanitizedSquad.starting_lane).toEqual(201)
      expect(sanitizedSquad.lane_count).toEqual(201)
      expect(sanitizedSquad.sort_order).toEqual(1234567)
    })

    it('should return null when passed a null squad', () => {
      const sanitizedSquad = sanitizeSquad(null as any)
      expect(sanitizedSquad).toEqual(null)
    })
    it('should return null when passed undefined squad', () => {
      const sanitizedSquad = sanitizeSquad(undefined as any)
      expect(sanitizedSquad).toEqual(null)
    })
  })

  describe('validateSquad function', () => {

    describe('validateSquad function - valid data', () => {
      it('should return ErrorCode.None when passed a valid squad', () => {
        expect(validateSquad(validSquad)).toBe(ErrorCode.None)
      })
      it('should return ErrorCode.None when all fields are properly sanitized', () => {
        const validTestSquad = {
          ...validSquad,        
          squad_name: '  Test Squad**  ',
          games: 6,
          starting_lane: 1,
          lane_count: 20,
          squad_date: new Date(Date.UTC(2024, 0, 1, 0, 0, 0, 0)),  // month - 1 
          squad_time: '12:00 PM',
          sort_order: 1
        }
        expect(validateSquad(validTestSquad)).toBe(ErrorCode.None)
      })      
    })

    describe('validateSquad function - missing data', () => {      
      it('should return ErrorCode.MissingData when passed a squad with missing event_id', () => {
        const missingSquad = {
          ...validSquad,
          event_id: '',
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with missing squad_name', () => {
        const missingSquad = {
          ...validSquad,
          squad_name: '',
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with squad_name is just special characters', () => {
        const missingSquad = {
          ...validSquad,
          squad_name: '*****',
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with missing games', () => {
        const missingSquad = {
          ...validSquad,
          games: null as any,
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with missing starting_lane', () => {
        const missingSquad = {
          ...validSquad,
          starting_lane: null as any,
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with missing lane_count', () => {
        const missingSquad = {
          ...validSquad,
          lane_count: null as any,
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      it('should return ErrorCode.MissingData when passed a squad with missing squad_date', () => {
        const missingSquad = {
          ...validSquad,
          squad_date: null as any,
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
      // missing squad time is OK
      it('should return ErrorCode.MissingData when passed a squad with missing sort_order', () => {
        const missingSquad = {
          ...validSquad,
          sort_order: null as any,
        }
        expect(validateSquad(missingSquad)).toBe(ErrorCode.MissingData)
      })
    })

    describe('validdateSquad function - invalid data', () => {
      it('should return ErrorCode.InvalidData when passed a squad with invalid event_id', () => {
        const invalidSquad = {
          ...validSquad,
          event_id: 'abc',
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid squad_name', () => {
        const invalidSquad = {
          ...validSquad,
          squad_name: 'This squad name is way too long and should exceed the maximum length allowed',
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid games', () => {
        const invalidSquad = {
          ...validSquad,
          games: 123,
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid starting_lane', () => {
        const invalidSquad = {
          ...validSquad,
          starting_lane: -1,
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid lane_count', () => {
        const invalidSquad = {
          ...validSquad,
          lane_count: -1,
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid lane_config', () => {
        const invalidSquad = {
          ...validSquad,
          starting_lane: 101,
          lane_count: 102,
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid squad_date', () => {
        const invalidSquad = {
          ...validSquad,
          squad_date: '2022-13-30' as any,  
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid squad_time', () => { 
        const invalidSquad = {
          ...validSquad,
          squad_time: '24:00',
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
      it('should return ErrorCode.InvalidData when passed a squad with invalid sort_order', () => { 
        const invalidSquad = {
          ...validSquad,
          sort_order: maxSortOrder + 1,
        }
        expect(validateSquad(invalidSquad)).toBe(ErrorCode.InvalidData)
      })
    })
  })

  describe('validateSquads function', () => { 

    it('should validate squads', () => { 
      const squadsToValidate = [...mockSquadsToPost]
      const validSquads: validSquadsType = validateSquads(squadsToValidate);
      expect(validSquads.errorCode).toBe(ErrorCode.None);
      expect(validSquads.squads.length).toBe(squadsToValidate.length);

      for (let i = 0; i < validSquads.squads.length; i++) { 
        expect(validSquads.squads[i].id).toEqual(mockSquadsToPost[i].id);
        expect(validSquads.squads[i].event_id).toEqual(mockSquadsToPost[i].event_id);
        expect(validSquads.squads[i].squad_name).toEqual(mockSquadsToPost[i].squad_name);
        expect(validSquads.squads[i].games).toEqual(mockSquadsToPost[i].games);
        expect(validSquads.squads[i].starting_lane).toEqual(mockSquadsToPost[i].starting_lane);
        expect(validSquads.squads[i].lane_count).toEqual(mockSquadsToPost[i].lane_count);
        expect(validSquads.squads[i].squad_date).toEqual(mockSquadsToPost[i].squad_date);
        expect(validSquads.squads[i].squad_time).toEqual(mockSquadsToPost[i].squad_time);
        expect(validSquads.squads[i].sort_order).toEqual(mockSquadsToPost[i].sort_order);
      }
    })
    it('should return ErrorCode.None and sanitize squads', async () => {
      const toSanitzie = [
        {
          ...mockSquadsToPost[0],
          squad_name: '   ' + mockSquadsToPost[0].squad_name + '  *** ',
        },
        {
          ...mockSquadsToPost[1],
          squad_name: '<script>' + mockSquadsToPost[1].squad_name + '</script>',
        },
      ]
      const validSquads = validateSquads(toSanitzie);
      expect(validSquads.errorCode).toBe(ErrorCode.None);      
      expect(validSquads.squads[0].squad_name).toBe(mockSquadsToPost[0].squad_name);
      expect(validSquads.squads[1].squad_name).toBe(mockSquadsToPost[1].squad_name);
    })
    it('should return ErrorCode.MissingData when required data is missing', async () => { 
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],
          squad_name: '',
        },
        {
          ...mockSquadsToPost[1],
        },
      ]
      const validSquads = validateSquads(invalidSquads);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(0);
    })
    it('should return ErrorCode.MissingData and return squads length 1 when 1st squad is valid, 2nd is not', async () => { 
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],          
        },
        {
          ...mockSquadsToPost[1],
          event_id: squadId,
        },
      ]
      const validSquads = validateSquads(invalidSquads);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(1);
    })
    it('should return ErrorCode.InvalidData when required data is invalid', async () => { 
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],
          games: 100,
        },
        {
          ...mockSquadsToPost[1],          
        },  
      ]
      const validSquads = validateSquads(invalidSquads);
      expect(validSquads.errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.MissingData when event_id is not a valid event id', async () => { 
      const invalidSquads = [
        {
          ...mockSquadsToPost[0],          
        },
        {
          ...mockSquadsToPost[1],
          event_id: squadId,
        },
      ]
      const validSquads = validateSquads(invalidSquads);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(1);
    })
    it('should return ErrorCode.MissingData when passed an empty array', async () => { 
      const validSquads = validateSquads([]);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed null', async () => { 
      const validSquads = validateSquads(null as any);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed undefined', async () => { 
      const validSquads = validateSquads(undefined as any);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.squads.length).toBe(0);
    })

  })

})