import {
  sanitizeLane,
  validateLane,
  validLaneNumber,
  validEventFkId,
  exportedForTesting,
  validateLanes,
} from "@/app/api/lanes/validate";
import { initLane } from "@/lib/db/initVals";
import { ErrorCode, maxLaneCount } from "@/lib/validation";
import { mockLanesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validLanesType } from "@/lib/types/types";

const { gotLaneData, validLaneData } = exportedForTesting;

const laneId = 'lan_7b5b9d9e6b6e4c5b9f6b7d9e7f9b6c5d';

const validLane = {
  ...initLane,  
  lane_number: 29,
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
}

describe("tests for lane validation", () => { 

  describe('getLaneData function', () => {
    it('should return ErrorCode.None when all data is valid', () => { 
      expect(gotLaneData(validLane)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when squad_id is missing', () => {
      const testLane = {
        ...validLane,
        squad_id: null as any
      }
      expect(gotLaneData(testLane)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when lane_number is missing', () => {
      const testLane = {
        ...validLane,
        lane_number: null as any
      }
      expect(gotLaneData(testLane)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when in_use is missing', () => {
      const testLane = {
        ...validLane,
        in_use: null as any
      }
      expect(gotLaneData(testLane)).toBe(ErrorCode.MissingData);
    })

  })

  describe('validLaneNumber function', () => { 
    it('should return true when lane_number is valid', () => {
      expect(validLaneNumber(1)).toBe(true) // odd
      expect(validLaneNumber(2)).toBe(true) // even
    })
    it('should return false when lane_number is too low', () => {
      expect(validLaneNumber(0)).toBe(false)
    })
    it('should return false when lane_number is too high', () => {
      expect(validLaneNumber(maxLaneCount + 1)).toBe(false)
    })
    it('should return false when lane_number is not an integer', () => {
      expect(validLaneNumber(5.5)).toBe(false)
    })
    it('should return false when lane_number is null', () => {
      expect(validLaneNumber(null as any)).toBe(false)
    })
    it('should return false when lane_number is undefined', () => {
      expect(validLaneNumber(undefined as any)).toBe(false)
    })
  })

  describe('validEventFkId function', () => { 
    it('should return true for valid event_id', () => {
      expect(validEventFkId(validLane.squad_id, 'sqd')).toBe(true)
    })
    it('should return false for invalid foreign key id', () => {
      expect(validEventFkId('abc_def', 'sqd')).toBe(false)
    })
    it('should return false if foreign key id type does not match id type', () => { 
      expect(validEventFkId(validLane.squad_id, 'usr')).toBe(false)
    })
    it('should return false for an empty foreign key id', () => { 
      expect(validEventFkId('', 'sqd')).toBe(false)      
    })
    it('should return false for an null foreign key id', () => { 
      expect(validEventFkId(null as any, 'sqd')).toBe(false)
    })
    it('should return false for an null key type', () => { 
      expect(validEventFkId(validLane.squad_id, null as any)).toBe(false)
    })
  })  

  describe('validLaneData function', () => { 
    it('should return ErrorCode.None when all data is valid', () => { 
      expect((validLaneData(validLane))).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when lane_number is missing', () => {
      const testLane = {
        ...validLane,
        lane_number: 201
      }
      expect(validLaneData(testLane)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is invalid', () => {
      const testLane = {
        ...validLane,
        squad_id: 'abc_123'
      }
      expect(validLaneData(testLane)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is valid id, but wrong type', () => {
      const testLane = {
        ...validLane,
        squad_id: 'usr_12345678901234567890123456789012'
      }
      expect(validLaneData(testLane)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when lane_number is missing', () => {
      const testLane = {
        ...validLane,
        lane_number: 201
      }
      expect(validLaneData(testLane)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when in_use is missing', () => {
      const testLane = {
        ...validLane,
        in_use: null as any 
      }
      expect(validLaneData(testLane)).toBe(ErrorCode.InvalidData);
    })

  })

  describe('sanitizeLane function', () => { 
    it('should return a sanitized lane when lane is already sanitized', () => {
      const testLane = {
        ...validLane,
        id: '',
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.id).toEqual('')
      expect(sanitizedLane.squad_id).toEqual(validLane.squad_id)
      expect(sanitizedLane.lane_number).toEqual(validLane.lane_number)
    })
    it('should return a sanitized lane when lane has an id', () => {
      const testLane = {
        ...validLane,
        id: laneId,
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.id).toEqual(laneId)
    })
    it('should return a sanitized lane when lane has an invalid id', () => {
      const testLane = {
        ...validLane,
        id: 'abc_123',
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.id).toEqual('')
    })
    it('should return a sanitized lane when lane is NOT already sanitized', () => {
      // no numerical fields
      const testLane = {
        ...validLane,        
        squad_id: 'abc_123'
      }
      const sanitizedLane = sanitizeLane(testLane)      
      expect(sanitizedLane.squad_id).toEqual('')
    })    
    it('should return a sanitized lane when numerical fields are null', () => {
      const testLane = {
        ...validLane,
        lane_number: null as any,        
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.lane_number).toBeNull()
    })    
    it('should return a sanitized lane when numerical fields are null', () => {
      const testLane = {
        ...validLane,
        lane_number: null as any,        
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.lane_number).toBeNull()
    })    
    it('should return a sanitized lane when numerical fields are not numbers', () => {
      const testLane = {
        ...validLane,
        lane_number: 'abc' as any,        
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.lane_number).toBeNull()
    })    
    it('should return a sanitized lane when numerical fields are too low', () => {
      const testLane = {
        ...validLane,
        lane_number: 0,
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.lane_number).toEqual(0)
    })    
    it('should return a sanitized lane when numerical fields are too high', () => {
      const testLane = {
        ...validLane,
        lane_number: 201,
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.lane_number).toEqual(201)
    })    
    it('should return a sanitized lane when boolean fields are non-boolean', () => {
      const testLane = {
        ...validLane,
        in_use: 'abc' as any,
      }
      const sanitizedLane = sanitizeLane(testLane)
      expect(sanitizedLane.in_use).toBe(true)
    })    
    it('should return null when pass a null lane', () => {
      expect(sanitizeLane(null as any)).toBe(null)
    })
    it('should return null when pass an undefined lane', () => {
      expect(sanitizeLane(undefined as any)).toBe(null)
    })    
  })

  describe('validateLane function', () => { 

    describe('validLane function - valid data', () => { 
      it('should return ErrorCode.None when all data is valid', () => { 
        expect(validateLane(validLane)).toBe(ErrorCode.None);
      })
      // no test for sanitized data, since there is no strings to sanitize
    })

    describe('validLane function - missing data', () => { 
      it('should return ErrorCode.MissingData when lane_number is missing', () => {
        const testLane = {
          ...validLane,
          lane_number: null as any
        }
        expect(validateLane(testLane)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when squad_id is missing', () => {
        const testLane = {
          ...validLane,
          squad_id: null as any
        }
        expect(validateLane(testLane)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when in_use is missing', () => {
        const testLane = {
          ...validLane,
          in_use: null as any
        }
        expect(validateLane(testLane)).toBe(ErrorCode.MissingData);        
      })
    })

    describe('validLane function - invalid data', () => { 
      it('should return ErrorCode.InvalidData when lane_number is invalid', () => {
        const testLane = {
          ...validLane,
          lane_number: 201
        }
        expect(validateLane(testLane)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when squad_id is invalid', () => {
        const testLane = {
          ...validLane,
          squad_id: 'abc_123'
        }
        expect(validateLane(testLane)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.MissingData when in_use is invalid', () => {
        const testLane = {
          ...validLane,
          in_use: 'abc_123' as any
        }
        expect(validateLane(testLane)).toBe(ErrorCode.MissingData);
      })
    })  
  })

  describe('validateLanes function', () => { 

    it('should validate lanes', () => { 
      const lanesToValidate = [...mockLanesToPost] 
      const validLanes: validLanesType = validateLanes(lanesToValidate)
      expect(validLanes.errorCode).toEqual(ErrorCode.None);
      expect(validLanes.lanes.length).toEqual(lanesToValidate.length);
      for (let i = 0; i < validLanes.lanes.length; i++) { 
        expect(validLanes.lanes[i].id).toEqual(lanesToValidate[i].id);
        expect(validLanes.lanes[i].squad_id).toEqual(lanesToValidate[i].squad_id);
        expect(validLanes.lanes[i].lane_number).toEqual(lanesToValidate[i].lane_number);
        expect(validLanes.lanes[i].in_use).toEqual(lanesToValidate[i].in_use);
      }
    })
    // no test for sanitized data, since there is no strings to sanitize
    it('should return ErrorCode.InvalidData when data is invalid', () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
          lane_number: 999
        },
        {
          ...mockLanesToPost[1],          
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const validLanes = validateLanes(invalidLanes)
      expect(validLanes.errorCode).toEqual(ErrorCode.InvalidData);
      expect(validLanes.lanes.length).toEqual(0);
    })
    it('should return ErrorCode.InvalidData and return lanes length 1 when 2nd lane has missing data', () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
        },
        {
          ...mockLanesToPost[1],    
          lane_number: 999
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const validLanes = validateLanes(invalidLanes)
      expect(validLanes.errorCode).toEqual(ErrorCode.InvalidData);
      expect(validLanes.lanes.length).toEqual(1);
    })
    it('should return ErrorCode.MissingData and return lanes length 1 when 2nd lane has missing data', () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
        },
        {
          ...mockLanesToPost[1],    
          lane_number: null as any
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const validLanes = validateLanes(invalidLanes)
      expect(validLanes.errorCode).toEqual(ErrorCode.MissingData);
      expect(validLanes.lanes.length).toEqual(1);
    })
    it('should return ErrorCode.MissingData when squad_id os not a valid squad_id', () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],
        },
        {
          ...mockLanesToPost[1],    
          squad_id: laneId
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const validLanes = validateLanes(invalidLanes)
      expect(validLanes.errorCode).toEqual(ErrorCode.MissingData);
      expect(validLanes.lanes.length).toEqual(1);
    })
    it('should return ErrorCode.MissingData when in_use is missing', () => { 
      const invalidLanes = [
        {
          ...mockLanesToPost[0],          
        },
        {
          ...mockLanesToPost[1],
          in_use: null as any
        },
        {
          ...mockLanesToPost[2],
        },
        {
          ...mockLanesToPost[3],
        },
      ]
      const validLanes = validateLanes(invalidLanes)
      expect(validLanes.errorCode).toEqual(ErrorCode.MissingData);
      expect(validLanes.lanes.length).toEqual(1);
    })
    it('should return ErrorCode.MissingData when passed an empty array', async () => { 
      const validSquads = validateLanes([]);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.lanes.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed null', async () => { 
      const validSquads = validateLanes(null as any);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.lanes.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed undefined', async () => { 
      const validSquads = validateLanes(undefined as any);
      expect(validSquads.errorCode).toBe(ErrorCode.MissingData);
      expect(validSquads.lanes.length).toBe(0);
    })

  })

})