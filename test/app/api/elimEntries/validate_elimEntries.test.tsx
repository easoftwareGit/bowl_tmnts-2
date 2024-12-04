import { exportedForTesting, sanitizeElimEntry, validateElimEntries, validateElimEntry, validElimEntryFee } from "@/app/api/elimEntries/validate";
import { initElimEntry } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation";
import { mockElimEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validElimEntriesType } from "@/lib/types/types";

const { gotElimEntryData, validElimEntryData } = exportedForTesting;

const validElimEntry = {
  ...initElimEntry,
  id: "een_23d6f8f1de844604a8828d4bb8a5a910",
  elim_id: "elm_45d884582e7042bb95b4818ccdd9974c",
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
  fee: '5',
}

const userId = "usr_01234567890123456789012345678901";
const notFoundSquadId = "sqd_01234567890123456789012345678901";

describe("tests for elimEntry validation", () => { 

  describe('gotElimEntryData()', () => { 

    it('should return ErrorCode.None when all data is present', () => {
      const errorCode = gotElimEntryData(validElimEntry);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when id is missing', () => {
      const testElimEntry = {
        ...validElimEntry,
        id: null as any
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when elim_id is missing', () => {
      const testElimEntry = {
        ...validElimEntry,
        elim_id: null as any
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is missing', () => {
      const testElimEntry = {
        ...validElimEntry,
        player_id: null as any
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is missing', () => {
      const testElimEntry = {
        ...validElimEntry,
        fee: null as any
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is blank', () => {
      const testElimEntry = {
        ...validElimEntry,
        id: ''
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when elim_id is blank', () => {
      const testElimEntry = {
        ...validElimEntry,
        elim_id: ''
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is blank', () => {
      const testElimEntry = {
        ...validElimEntry,
        player_id: ''
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is blank', () => {
      const testElimEntry = {
        ...validElimEntry,
        fee: ''
      }
      const errorCode = gotElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    
  })

  describe('validElimEntryFee()', () => { 

    it('should return true when fee is valid', () => {            
      expect(validElimEntryFee(validElimEntry.fee)).toBe(true);
    })
    it('should return false when fee is blank', () => {      
      expect(validElimEntryFee('')).toBe(false);
    })
    it('should return false when fee is null', () => {      
      expect(validElimEntryFee(null as any)).toBe(false);
    })
    it('should return false when fee is undefined', () => {
      expect(validElimEntryFee(undefined as any)).toBe(false);
    })
    it('should return false when fee is not a number', () => {      
      expect(validElimEntryFee('abc' as any)).toBe(false);
    })
    it('should return false when fee is negative', () => {      
      expect(validElimEntryFee('-1')).toBe(false);
    })
    it('should return false when fee is too big', () => {       
      expect(validElimEntryFee('1234567890')).toBe(false);
    })
    it('should retur true when fee has non integer decimal', () => {       
      expect(validElimEntryFee('1.1')).toBe(true);
    })
  })

  describe('validElimEntryData()', () => { 
    it('should return ErrorCode.None when all data is valid', () => {
      const errorCode = validElimEntryData(validElimEntry);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        id: 'abc'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when id is a valid id, but not a elimEntry id', () => {
      const testElimEntry = {
        ...validElimEntry,
        id: userId
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is blank', () => { 
      const testElimEntry = {
        ...validElimEntry,
        id: ''
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is null', () => { 
      const testElimEntry = {
        ...validElimEntry,
        id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is undefined', () => {
      const testElimEntry = {
        ...validElimEntry,
        id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when elim_id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        elim_id: 'abc'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when elim_id is a valid id, but not a elimEntry id', () => {
      const testElimEntry = {
        ...validElimEntry,
        elim_id: userId
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when elim_id is blank', () => { 
      const testElimEntry = {
        ...validElimEntry,
        elim_id: ''
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when elim_id is null', () => { 
      const testElimEntry = {
        ...validElimEntry,
        elim_id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when elim_id is undefined', () => {
      const testElimEntry = {
        ...validElimEntry,
        elim_id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when player_id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        player_id: 'abc'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
      const testElimEntry = {
        ...validElimEntry,
        player_id: userId
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is blank', () => { 
      const testElimEntry = {
        ...validElimEntry,
        player_id: ''
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is null', () => { 
      const testElimEntry = {
        ...validElimEntry,
        player_id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is undefined', () => {
      const testElimEntry = {
        ...validElimEntry,
        player_id: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when fee is not a number', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: 'abc'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is too low', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: '-1'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is too high', () => {  
      const testElimEntry = {
        ...validElimEntry,
        fee: '1234567890'
      }
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is blank', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: ''
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is null', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is undefined', () => {
      const testElimEntry = {
        ...validElimEntry,
        fee: null as any
      } 
      const errorCode = validElimEntryData(testElimEntry);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
  })

  describe('sanitizeElimEntryData()', () => { 
    it('should return a sanitized elimEntry', () => { 
      const testElimEntry = {
        ...validElimEntry,
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry).toEqual(testElimEntry);
    })
    it('should return a sanitized elimEntry when id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        id: 'abc'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.id).toEqual('');
    })
    it('should return a sanitized elimEntry when elim_id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        elim_id: 'abc'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry); 
      expect(sanitizedElimEntry.elim_id).toEqual('');
    })
    it('should return a sanitized elimEntry when player_id is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        player_id: 'abc'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.player_id).toEqual('');
    })  
    it('should return a sanitized elimEntry when fee is invalid', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: 'abc'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.fee).toEqual('');
    })
    it('should return a sanitized elimEntry when fee is too low', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: '-1'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.fee).toEqual('');
    })
    it('should return a sanitized elimEntry when fee is too high', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: '1234567890'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.fee).toEqual('');
    })
    it('should return a sanitized elimEntry when fee is sanitzied', () => { 
      const testElimEntry = {
        ...validElimEntry,
        fee: '80.000'
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.fee).toEqual('80.000');
    })
    it('should return a sanitized elimEntry when data is not sanitzied', () => { 
      const testElimEntry = {
        ...validElimEntry,
        id: '<script>alert(1)</script>',
        elim_id: '<script>alert(1)</script>',
        player_id: '<script>alert(1)</script>',        
        fee: '<script>alert(1)</script>',        
      }
      const sanitizedElimEntry = sanitizeElimEntry(testElimEntry);
      expect(sanitizedElimEntry.id).toEqual('');
      expect(sanitizedElimEntry.elim_id).toEqual('');
      expect(sanitizedElimEntry.player_id).toEqual('');      
      expect(sanitizedElimEntry.fee).toEqual(''); // sanitized, not valildated
    })    

  })

  describe('validateElimEntry()', () => { 

    describe('valid data', () => { 
      it('should return ErrorCode.None when all data is valid', () => {
        const errorCode = validateElimEntry(validElimEntry);
        expect(errorCode).toBe(ErrorCode.None);
      })
      it('should return ErrorCode.None when all fields are properly sanitized', () => {
        const testElimEntry = {
          ...validElimEntry,
          fee: '80.000',
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.None);
      })
    })
    describe('missing data', () => { 
      it('should return ErrorCode.MissingData when id is missing', () => {
        const testElimEntry = {
          ...validElimEntry,
          id: null as any
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when elim_id is missing', () => {
        const testElimEntry = {
          ...validElimEntry,
          elim_id: null as any
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when player_id is missing', () => {
        const testElimEntry = {
          ...validElimEntry,
          player_id: null as any
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when fee is missing', () => {
        const testElimEntry = {
          ...validElimEntry,
          fee: null as any
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
    })
    describe('invalid data', () => { 
      it('should return ErrorCode.InvalidData when id is invalid', () => {
        const testElimEntry = {
          ...validElimEntry,
          id: 'abc'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when id is a valid id, but not a elimEntry id', () => {
        const testElimEntry = {
          ...validElimEntry,
          id: userId
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when elim_id is invalid', () => {
        const testElimEntry = {
          ...validElimEntry,
          elim_id: 'abc'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when elim_id is a valid id, but not a div id', () => {
        const testElimEntry = {
          ...validElimEntry,
          elim_id: userId
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is invalid', () => {
        const testElimEntry = {
          ...validElimEntry,
          player_id: 'abc'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
        const testElimEntry = {
          ...validElimEntry,
          player_id: userId
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is not a number', () => {
        const testElimEntry = {
          ...validElimEntry,
          fee: 'abc'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is too low', () => {
        const testElimEntry = {
          ...validElimEntry,
          fee: '-1'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is too high', () => {
        const testElimEntry = {
          ...validElimEntry,
          fee: '1234567890'
        }
        const errorCode = validateElimEntry(testElimEntry);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
    })      
    
  })

  describe('validateElimEntries()', () => { 
    it('should return ErrorCode.None when all data is valid', () => {
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.None);
      expect(validElimEntries.elimEntries.length).toBe(elimEntriesToValidate.length);
      for (let i = 0; i < validElimEntries.elimEntries.length; i++) {
        expect(validElimEntries.elimEntries[i].id).toBe(elimEntriesToValidate[i].id);        
        expect(validElimEntries.elimEntries[i].elim_id).toBe(elimEntriesToValidate[i].elim_id);
        expect(validElimEntries.elimEntries[i].player_id).toBe(elimEntriesToValidate[i].player_id);
        expect(validElimEntries.elimEntries[i].fee).toBe(elimEntriesToValidate[i].fee);
      }
    })
    it('should return sanitized elimEntries when data is not sanitized', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = '85.000'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.None);
      expect(validElimEntries.elimEntries.length).toBe(elimEntriesToValidate.length);
      expect(validElimEntries.elimEntries[1].fee).toBe('85.000');
    })
    it('should return ErrorCode.MissingData when id is sanitzied to ""', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].id = '<script>alert("xss")</script>'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when elim_id is sanitzied to ""', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].elim_id = 'test'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is sanitzied to ""', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].player_id = ''
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is sanitzied to ""', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = 'abc'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is invalid', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].id = 'abc'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is valid, but not a elimEntry id', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].id = userId
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when elim_id is invalid', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].elim_id = 'abc'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when id is null', () => {
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].id = null as any;
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when elim_id is valid, but not a div id', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].elim_id = userId
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when elim_id is null', () => {
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].elim_id = null as any;
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when player_id is invalid', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].player_id = 'abc'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when player_id is valid, but not a player id', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].player_id = userId
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is null', () => {
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].player_id = null as any;
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.MissingData when fee is invalid', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = 'abc'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is too low', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = '-1'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is too high', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost]; 
      elimEntriesToValidate[1].fee = '1234567890'
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when fee is blank', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = ''
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is null', () => { 
      const elimEntriesToValidate = [...mockElimEntriesToPost];
      elimEntriesToValidate[1].fee = null as any
      const validElimEntries: validElimEntriesType = validateElimEntries(elimEntriesToValidate);
      expect(validElimEntries.errorCode).toBe(ErrorCode.MissingData);
    })
  })

})