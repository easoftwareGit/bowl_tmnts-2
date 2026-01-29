import { exportedForTesting, sanitizeDivEntry, validateDivEntries, validateDivEntry, validDivEntryFee } from "@/lib/validation/divEntries/validate";
import { initDivEntry } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation/validation";
import { mockDivEntriesToPost } from "../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validDivEntriesType } from "@/lib/types/types";

const { gotDivEntryData, validDivEntryData } = exportedForTesting;

const validDivEntry = {
  ...initDivEntry,
  id: "den_652fc6c5556e407291c4b5666b2dccd7",  
  squad_id: 'sqd_7116ce5f80164830830a7157eb093396',
  div_id: 'div_f30aea2c534f4cfe87f4315531cef8ef',
  player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
  fee: '80'
}

const userId = "usr_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";

describe("tests for divEntry validation", () => { 

  describe('gotDivEntryData()', () => { 

    it('should return ErrorCode.NONE when all data is present', () => {
      const errorCode = gotDivEntryData(validDivEntry);
      expect(errorCode).toBe(ErrorCode.NONE);
    })
    it('should return ErrorCode.MISSING_DATA when id is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        id: null as any
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: null as any
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when div_id is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        div_id: null as any
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        player_id: null as any
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        fee: null as any
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when id is blank', () => {
      const testDivEntry = {
        ...validDivEntry,
        id: ''
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is blank', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: ''
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when div_id is blank', () => {
      const testDivEntry = {
        ...validDivEntry,
        div_id: ''
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        player_id: ''
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is missing', () => {
      const testDivEntry = {
        ...validDivEntry,
        fee: ''
      }
      const errorCode = gotDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    
  })

  describe('validDivEntryFee()', () => { 

    it('should return true when fee is valid', () => {            
      expect(validDivEntryFee(validDivEntry.fee)).toBe(true);
    })
    it('should return false when fee is blank', () => {      
      expect(validDivEntryFee('')).toBe(false);
    })
    it('should return false when fee is null', () => {      
      expect(validDivEntryFee(null as any)).toBe(false);
    })
    it('should return false when fee is undefined', () => {
      expect(validDivEntryFee(undefined as any)).toBe(false);
    })
    it('should return false when fee is not a number', () => {      
      expect(validDivEntryFee('abc' as any)).toBe(false);
    })
    it('should return false when fee is negative', () => {      
      expect(validDivEntryFee('-1')).toBe(false);
    })
    it('should return false when fee is too big', () => {       
      expect(validDivEntryFee('1234567890')).toBe(false);
    })
    it('should retur true when fee has non integer decimal', () => {       
      expect(validDivEntryFee('1.1')).toBe(true);
    })
  })

  describe('validDivEntryData()', () => { 
    it('should return ErrorCode.NONE when all data is valid', () => {
      const errorCode = validDivEntryData(validDivEntry);
      expect(errorCode).toBe(ErrorCode.NONE);
    })
    it('should return ErrorCode.INVALID_DATA when id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        id: 'abc'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })    
    it('should return ErrorCode.INVALID_DATA when id is a valid id, but not a divEntry id', () => {
      const testDivEntry = {
        ...validDivEntry,
        id: userId
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when id is blank', () => { 
      const testDivEntry = {
        ...validDivEntry,
        id: ''
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when id is null', () => { 
      const testDivEntry = {
        ...validDivEntry,
        id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when id is undefined', () => {
      const testDivEntry = {
        ...validDivEntry,
        id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);      
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is invalid', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: 'abc'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is a valid id, but not a squad id', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: userId
      }      
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is blank', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: ''
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is null', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: null as any
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when squad_id is undefined', () => {
      const testDivEntry = {
        ...validDivEntry,
        squad_id: null as any
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when div_id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        div_id: 'abc'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when div_id is a valid id, but not a divEntry id', () => {
      const testDivEntry = {
        ...validDivEntry,
        div_id: userId
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when div_id is blank', () => { 
      const testDivEntry = {
        ...validDivEntry,
        div_id: ''
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when div_id is null', () => { 
      const testDivEntry = {
        ...validDivEntry,
        div_id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when div_id is undefined', () => {
      const testDivEntry = {
        ...validDivEntry,
        div_id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);      
    })
    it('should return ErrorCode.INVALID_DATA when player_id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        player_id: 'abc'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is a valid id, but not a player id', () => {
      const testDivEntry = {
        ...validDivEntry,
        player_id: userId
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is blank', () => { 
      const testDivEntry = {
        ...validDivEntry,
        player_id: ''
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is null', () => { 
      const testDivEntry = {
        ...validDivEntry,
        player_id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when player_id is undefined', () => {
      const testDivEntry = {
        ...validDivEntry,
        player_id: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);      
    })
    it('should return ErrorCode.INVALID_DATA when fee is not a number', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: 'abc'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is too low', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: '-1'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is too high', () => {  
      const testDivEntry = {
        ...validDivEntry,
        fee: '1234567890'
      }
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is blank', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: ''
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is null', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is undefined', () => {
      const testDivEntry = {
        ...validDivEntry,
        fee: null as any
      } 
      const errorCode = validDivEntryData(testDivEntry);
      expect(errorCode).toBe(ErrorCode.INVALID_DATA);      
    })
  })

  describe('sanitizeDivEntryData()', () => { 
    it('should return a sanitized divEntry', () => { 
      const testDivEntry = {
        ...validDivEntry,
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry).toEqual(testDivEntry);
    })
    it('should return a sanitized divEntry when id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        id: 'abc'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.id).toEqual('');
    })
    it('should return a sanitized divEntry when div_id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        div_id: 'abc'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry); 
      expect(sanitizedDivEntry.div_id).toEqual('');
    })
    it('should return a sanitized divEntry when player_id is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        player_id: 'abc'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.player_id).toEqual('');
    })  
    it('should return a sanitized divEntry when fee is invalid', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: 'abc'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.fee).toEqual('');
    })
    it('should return a sanitized divEntry when fee is too low', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: '-1'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.fee).toEqual('');
    })
    it('should return a sanitized divEntry when fee is too high', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: '1234567890'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.fee).toEqual('');
    })
    it('should return a sanitized divEntry when fee is sanitzied', () => { 
      const testDivEntry = {
        ...validDivEntry,
        fee: '80.000'
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.fee).toEqual('80.000');
    })
    it('should return a sanitized divEntry when data is not sanitzied', () => { 
      const testDivEntry = {
        ...validDivEntry,
        id: '<script>alert(1)</script>',
        div_id: '<script>alert(1)</script>',
        player_id: '<script>alert(1)</script>',
        fee: '<script>alert(1)</script>',        
      }
      const sanitizedDivEntry = sanitizeDivEntry(testDivEntry);
      expect(sanitizedDivEntry.id).toEqual('');
      expect(sanitizedDivEntry.div_id).toEqual('');
      expect(sanitizedDivEntry.player_id).toEqual('');
      expect(sanitizedDivEntry.fee).toEqual(''); // sanitized, not valildated
    })    

  })

  describe('validateDivEntry()', () => { 

    describe('valid data', () => { 
      it('should return ErrorCode.NONE when all data is valid', () => {
        const errorCode = validateDivEntry(validDivEntry);
        expect(errorCode).toBe(ErrorCode.NONE);
      })
      it('should return ErrorCode.NONE when all fields are properly sanitized', () => {
        const testDivEntry = {
          ...validDivEntry,
          fee: '80.000',
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.NONE);
      })
    })
    describe('missing data', () => { 
      it('should return ErrorCode.MISSING_DATA when id is missing', () => {
        const testDivEntry = {
          ...validDivEntry,
          id: null as any
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when div_id is missing', () => {
        const testDivEntry = {
          ...validDivEntry,
          div_id: null as any
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when player_id is missing', () => {
        const testDivEntry = {
          ...validDivEntry,
          player_id: null as any
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MISSING_DATA);
      })
      it('should return ErrorCode.MISSING_DATA when fee is missing', () => {
        const testDivEntry = {
          ...validDivEntry,
          fee: null as any
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.MISSING_DATA);
      })
    })
    describe('invalid data', () => { 
      it('should return ErrorCode.INVALID_DATA when id is invalid', () => {
        const testDivEntry = {
          ...validDivEntry,
          id: 'abc'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when id is a valid id, but not a divEntry id', () => {
        const testDivEntry = {
          ...validDivEntry,
          id: userId
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when div_id is invalid', () => {
        const testDivEntry = {
          ...validDivEntry,
          div_id: 'abc'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when div_id is a valid id, but not a div id', () => {
        const testDivEntry = {
          ...validDivEntry,
          div_id: userId
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when player_id is invalid', () => {
        const testDivEntry = {
          ...validDivEntry,
          player_id: 'abc'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when player_id is a valid id, but not a player id', () => {
        const testDivEntry = {
          ...validDivEntry,
          player_id: userId
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when fee is not a number', () => {
        const testDivEntry = {
          ...validDivEntry,
          fee: 'abc'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when fee is too low', () => {
        const testDivEntry = {
          ...validDivEntry,
          fee: '-1'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
      it('should return ErrorCode.INVALID_DATA when fee is too high', () => {
        const testDivEntry = {
          ...validDivEntry,
          fee: '1234567890'
        }
        const errorCode = validateDivEntry(testDivEntry);
        expect(errorCode).toBe(ErrorCode.INVALID_DATA);
      })
    })      
    
  })

  describe('validateDivEntries()', () => { 
    it('should return ErrorCode.NONE when all data is valid', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.NONE);
      expect(validDivEntries.divEntries.length).toBe(divEntriesToValidate.length);
      for (let i = 0; i < validDivEntries.divEntries.length; i++) {
        expect(validDivEntries.divEntries[i].id).toBe(divEntriesToValidate[i].id);
        expect(validDivEntries.divEntries[i].squad_id).toBe(divEntriesToValidate[i].squad_id);
        expect(validDivEntries.divEntries[i].div_id).toBe(divEntriesToValidate[i].div_id);
        expect(validDivEntries.divEntries[i].player_id).toBe(divEntriesToValidate[i].player_id);
        expect(validDivEntries.divEntries[i].fee).toBe(divEntriesToValidate[i].fee);
      }
    })
    it('should return sanitized divEntries when data is not sanitized', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = '85.000'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.NONE);
      expect(validDivEntries.divEntries.length).toBe(divEntriesToValidate.length);
      expect(validDivEntries.divEntries[1].fee).toBe('85.000');
    })
    it('should return ErrorCode.MISSING_DATA when id is sanitzied to ""', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].id = '<script>alert("xss")</script>'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is sanitzied to ""', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].squad_id = 'test'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when div_id is sanitzied to ""', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].div_id = 'test'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is sanitzied to ""', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].player_id = ''
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is sanitzied to ""', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when id is invalid', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].id = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when id is valid, but not a divEntry id', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].id = userId
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })    
    it('should return ErrorCode.MISSING_DATA when div_id is invalid', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].div_id = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })    
    it('should return ErrorCode.MISSING_DATA when id is null', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].id = null as any;
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);      
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is null', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].squad_id = null as any;
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is invalid', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].squad_id = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when squad_id is valid, but not a squad id', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].squad_id = userId
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when div_id is valid, but not a div id', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].div_id = userId
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when div_id is null', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].div_id = null as any;
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);      
    })
    it('should return ErrorCode.MISSING_DATA when player_id is invalid', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].player_id = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })    
    it('should return ErrorCode.MISSING_DATA when player_id is valid, but not a player id', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].player_id = userId
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when player_id is null', () => {
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].player_id = null as any;
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);      
    })
    it('should return ErrorCode.MISSING_DATA when fee is invalid', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = 'abc'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is too low', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = '-1'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is too high', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost]; 
      divEntriesToValidate[1].fee = '1234567890'
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.INVALID_DATA when fee is blank', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = ''
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
    it('should return ErrorCode.MISSING_DATA when fee is null', () => { 
      const divEntriesToValidate = [...mockDivEntriesToPost];
      divEntriesToValidate[1].fee = null as any
      const validDivEntries: validDivEntriesType = validateDivEntries(divEntriesToValidate);
      expect(validDivEntries.errorCode).toBe(ErrorCode.MISSING_DATA);
    })
  })

})