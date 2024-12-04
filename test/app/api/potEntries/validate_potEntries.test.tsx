import { exportedForTesting, sanitizePotEntry, validatePotEntries, validatePotEntry, validPotEntryFee } from "@/app/api/potEntries/validate";
import { initPotEntry } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation";
import { mockPotEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validPotEntriesType } from "@/lib/types/types";

const { gotPotEntryData, validPotEntryData } = exportedForTesting;

const validPotEntry = {
  ...initPotEntry,
  id: "pen_648e5b64809d441c99815929cf7c66e0",  
  pot_id: "pot_b2a7b02d761b4f5ab5438be84f642c3b",          
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
  fee: '20',
}

const userId = "usr_01234567890123456789012345678901";

describe("tests for potEntry validation", () => { 

  describe('gotPotEntryData()', () => { 

    it('should return ErrorCode.None when all data is present', () => {
      const errorCode = gotPotEntryData(validPotEntry);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when id is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        id: null as any
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when pot_id is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        pot_id: null as any
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        player_id: null as any
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        fee: null as any
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is blank', () => {
      const testPotEntry = {
        ...validPotEntry,
        id: ''
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when pot_id is blank', () => {
      const testPotEntry = {
        ...validPotEntry,
        pot_id: ''
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        player_id: ''
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is missing', () => {
      const testPotEntry = {
        ...validPotEntry,
        fee: ''
      }
      const errorCode = gotPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
  })

  describe('validPotEntryFee()', () => { 

    it('should return true when fee is valid', () => {            
      expect(validPotEntryFee(validPotEntry.fee)).toBe(true);
    })
    it('should return false when fee is blank', () => {      
      expect(validPotEntryFee('')).toBe(false);
    })
    it('should return false when fee is null', () => {      
      expect(validPotEntryFee(null as any)).toBe(false);
    })
    it('should return false when fee is undefined', () => {
      expect(validPotEntryFee(undefined as any)).toBe(false);
    })
    it('should return false when fee is not a number', () => {      
      expect(validPotEntryFee('abc' as any)).toBe(false);
    })
    it('should return false when fee is negative', () => {      
      expect(validPotEntryFee('-1')).toBe(false);
    })
    it('should return false when fee is too big', () => {       
      expect(validPotEntryFee('1234567890')).toBe(false);
    })
  })

  describe('validPotEntryData()', () => { 

    it('should return ErrorCode.None when all data is valid', () => {
      const errorCode = validPotEntryData(validPotEntry);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        id: 'abc'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when id is a valid id, but not a potEntry id', () => {
      const testPotEntry = {
        ...validPotEntry,
        id: userId
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is blank', () => { 
      const testPotEntry = {
        ...validPotEntry,
        id: ''
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is null', () => { 
      const testPotEntry = {
        ...validPotEntry,
        id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is undefined', () => {
      const testPotEntry = {
        ...validPotEntry,
        id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when pot_id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        pot_id: 'abc'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when pot_id is a valid id, but not a potEntry id', () => {
      const testPotEntry = {
        ...validPotEntry,
        pot_id: userId
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when pot_id is blank', () => { 
      const testPotEntry = {
        ...validPotEntry,
        pot_id: ''
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when pot_id is null', () => { 
      const testPotEntry = {
        ...validPotEntry,
        pot_id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when pot_id is undefined', () => {
      const testPotEntry = {
        ...validPotEntry,
        pot_id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when player_id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        player_id: 'abc'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
      const testPotEntry = {
        ...validPotEntry,
        player_id: userId
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is blank', () => { 
      const testPotEntry = {
        ...validPotEntry,
        player_id: ''
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is null', () => { 
      const testPotEntry = {
        ...validPotEntry,
        player_id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is undefined', () => {
      const testPotEntry = {
        ...validPotEntry,
        player_id: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when fee is not a number', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: 'abc'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is too low', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: '-1'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is too high', () => {  
      const testPotEntry = {
        ...validPotEntry,
        fee: '1234567890'
      }
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is blank', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: ''
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is null', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is undefined', () => {
      const testPotEntry = {
        ...validPotEntry,
        fee: null as any
      } 
      const errorCode = validPotEntryData(testPotEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
  })

  describe('sanitizePotEntryData()', () => { 

    it('should return a sanitized potEntry', () => { 
      const testPotEntry = {
        ...validPotEntry,
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry).toEqual(testPotEntry);
    })
    it('should return a sanitized potEntry when id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        id: 'abc'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.id).toEqual('');
    })
    it('should return a sanitized potEntry when pot_id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        pot_id: 'abc'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry); 
      expect(sanitizedPotEntry.pot_id).toEqual('');
    })
    it('should return a sanitized potEntry when player_id is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        player_id: 'abc'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.player_id).toEqual('');
    })  
    it('should return a sanitized potEntry when fee is invalid', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: 'abc'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.fee).toEqual('');
    })
    it('should return a sanitized potEntry when fee is too low', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: '-1'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.fee).toEqual('');
    })
    it('should return a sanitized potEntry when fee is too high', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: '1234567890'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.fee).toEqual('');
    })
    it('should return a sanitized potEntry when fee is sanitzied', () => { 
      const testPotEntry = {
        ...validPotEntry,
        fee: '20.000'
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.fee).toEqual('20.000');
    })
    it('should return a sanitized potEntry when data is not sanitzied', () => { 
      const testPotEntry = {
        ...validPotEntry,
        id: '<script>alert(1)</script>',
        pot_id: '<script>alert(1)</script>',
        player_id: '<script>alert(1)</script>',
        fee: '<script>alert(1)</script>',        
      }
      const sanitizedPotEntry = sanitizePotEntry(testPotEntry);
      expect(sanitizedPotEntry.id).toEqual('');
      expect(sanitizedPotEntry.pot_id).toEqual('');
      expect(sanitizedPotEntry.player_id).toEqual('');
      expect(sanitizedPotEntry.fee).toEqual(''); // sanitized, not valildated
    })    
  })

  describe('validatePotEntry()', () => { 

    describe('valid data', () => { 
      it('should return ErrorCode.None when all data is valid', () => {
        const errorCode = validatePotEntry(validPotEntry);
        expect(errorCode).toBe(ErrorCode.None);
      })
      it('should return ErrorCode.None when all fields are properly sanitized', () => {
        const testDivEntry = {
          ...validPotEntry,
          fee: '20.000',
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.None);
      })
    })
    describe('missing data', () => { 
      it('should return ErrorCode.MissingData when id is missing', () => {
        const testDivEntry = {
          ...validPotEntry,
          id: null as any
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when pot_id is missing', () => {
        const testDivEntry = {
          ...validPotEntry,
          pot_id: null as any
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when player_id is missing', () => {
        const testDivEntry = {
          ...validPotEntry,
          player_id: null as any
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when fee is missing', () => {
        const testDivEntry = {
          ...validPotEntry,
          fee: null as any
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
    })
    describe('invalid data', () => { 
      it('should return ErrorCode.InvalidData when id is invalid', () => {
        const testDivEntry = {
          ...validPotEntry,
          id: 'abc'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when id is a valid id, but not a potEntry id', () => {
        const testDivEntry = {
          ...validPotEntry,
          id: userId
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when div_id is invalid', () => {
        const testDivEntry = {
          ...validPotEntry,
          pot_id: 'abc'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when pot_id is a valid id, but not a pot id', () => {
        const testDivEntry = {
          ...validPotEntry,
          pot_id: userId
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is invalid', () => {
        const testDivEntry = {
          ...validPotEntry,
          player_id: 'abc'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
        const testDivEntry = {
          ...validPotEntry,
          player_id: userId
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is not a number', () => {
        const testDivEntry = {
          ...validPotEntry,
          fee: 'abc'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is too low', () => {
        const testDivEntry = {
          ...validPotEntry,
          fee: '-1'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is too high', () => {
        const testDivEntry = {
          ...validPotEntry,
          fee: '1234567890'
        }
        const errorCode = validatePotEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
    })          
  })

  describe('validatePotEntries()', () => { 
    it('should return ErrorCode.None when all data is valid', () => {
      const potEntriesToValidate = [...mockPotEntriesToPost];
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.None);
      expect(validpotEntries.potEntries.length).toBe(potEntriesToValidate.length);
      for (let i = 0; i < validpotEntries.potEntries.length; i++) {
        expect(validpotEntries.potEntries[i].id).toBe(potEntriesToValidate[i].id);        
        expect(validpotEntries.potEntries[i].pot_id).toBe(potEntriesToValidate[i].pot_id);
        expect(validpotEntries.potEntries[i].player_id).toBe(potEntriesToValidate[i].player_id);
        expect(validpotEntries.potEntries[i].fee).toBe(potEntriesToValidate[i].fee);
      }
    })
    it('should return sanitized potEntries when data is not sanitized', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = '20.000'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.None);
      expect(validpotEntries.potEntries.length).toBe(potEntriesToValidate.length);
      expect(validpotEntries.potEntries[1].fee).toBe('20.000');
    })
    it('should return ErrorCode.MissingData when id is sanitzied to ""', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].id = '<script>alert("xss")</script>'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when pot_id is sanitzied to ""', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].pot_id = 'test'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is sanitzied to ""', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].player_id = ''
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is sanitzied to ""', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = 'abc'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is invalid', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].id = 'abc'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is valid, but not a divEntry id', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].id = userId
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when pot_id is invalid', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].pot_id = 'abc'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when id is null', () => {
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].id = null as any;
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when pot_id is valid, but not a pot id', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].pot_id = userId
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when pot_id is null', () => {
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].pot_id = null as any;
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when player_id is invalid', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].player_id = 'abc'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when player_id is valid, but not a player id', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].player_id = userId
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is null', () => {
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].player_id = null as any;
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when fee is invalid', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = 'abc'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is too low', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = '-1'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is too high', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost]; 
      potEntriesToValidate[1].fee = '1234567890'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee does not match potFee', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = '21'
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when fee is blank', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = ''
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is null', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = null as any
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is undefined', () => { 
      const potEntriesToValidate = [...mockPotEntriesToPost];
      potEntriesToValidate[1].fee = undefined as any
      const validpotEntries: validPotEntriesType = validatePotEntries(potEntriesToValidate);
      expect(validpotEntries.errorCode).toBe(ErrorCode.MissingData);
    })
  })  

})
