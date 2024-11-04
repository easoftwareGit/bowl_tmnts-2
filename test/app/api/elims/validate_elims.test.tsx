import {
  sanitizeElim,
  validateElim,
  validStart,
  validGames,
  validElimFkId,
  validElimMoney,
  exportedForTesting,
  validateElims
} from "@/app/api/elims/validate";
import { initElim } from "@/lib/db/initVals";
import { elimType, validElimsType } from "@/lib/types/types";
import { ErrorCode, minGames, maxGames } from "@/lib/validation";
import { mockElimsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

const { gotElimData, validElimData } = exportedForTesting;

const elimId = 'elm_45d884582e7042bb95b4818ccdd9974c'
const nonElimId = 'usr_45d884582e7042bb95b4818ccdd9974c';

const validElim = {
  ...initElim,
  id: "elm_45d884582e7042bb95b4818ccdd9974c",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
  sort_order: 1,
  start: 1,
  games: 3,
  fee: '5',
} as elimType;

describe("tests for eliminator validation", () => { 

  describe('gotElimData function', () => {
    it('should return ErrorCode.None when all data is present', () => { 
      expect(gotElimData(validElim)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when id is missing', () => {
      const testElim = {
        ...validElim,
        id: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })  
    it('should return ErrorCode.MissingData when div_id is missing', () => {
      const testElim = {
        ...validElim,
        div_id: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })  
    it('should return ErrorCode.MissingData when squad_id is missing', () => {
      const testElim = {
        ...validElim,
        squad_id: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when start is missing', () => {
      const testElim = {
        ...validElim,
        start: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when games is missing', () => {
      const testElim = {
        ...validElim,
        games: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is missing', () => {
      const testElim = {
        ...validElim,
        fee: ''
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when sort_order is missing', () => {
      const testElim = {
        ...validElim,
        sort_order: null as any
      }
      expect(gotElimData(testElim)).toBe(ErrorCode.MissingData);
    })
  })

  describe('validStart function', () => { 
    it('should return true when start is valid', () => { 
      expect(validStart(1)).toBe(true);
    })
    it('should return false when start is invalid', () => {
      expect(validStart(0)).toBe(false);
      expect(validStart(maxGames + 1)).toBe(false);
      expect(validStart('abc' as any)).toBe(false);
    })
    it('should return false when start is null', () => {
      expect(validStart(null as any)).toBe(false);
    })
    it('should return false when start is undefined', () => {
      expect(validStart(undefined as any)).toBe(false);
    })
  })

  describe('validGames function', () => { 
    it('should return true when start is valid', () => {
      expect(validGames(3)).toBe(true);
    })
    it('should return false when start is invalid', () => {
      expect(validGames(minGames - 1)).toBe(false);
      expect(validGames(maxGames + 1)).toBe(false);
      expect(validGames('abc' as any)).toBe(false);
    })
    it('should return false when start is null', () => {
      expect(validGames(null as any)).toBe(false);
    })
    it('should return false when start is undefined', () => {
      expect(validGames(undefined as any)).toBe(false);
    })
  })

  describe('validElimMoney function', () => {
    it('should return true when fee is valid', () => {
      expect(validElimMoney('5')).toBe(true);
    })
    it('should return false when fee is invalid', () => {
      expect(validElimMoney('')).toBe(false);
      expect(validElimMoney('-1')).toBe(false);
      expect(validElimMoney('0.9')).toBe(false);
      expect(validElimMoney('1234567890')).toBe(false);
      expect(validElimMoney('abc' as any)).toBe(false);
    })
    it('should return false when fee is null', () => {
      expect(validElimMoney(null as any)).toBe(false);
    })
    it('should return false when fee is undefined', () => {
      expect(validElimMoney(undefined as any)).toBe(false);
    })
  })

  describe("validElimFkId function", () => {
    it("should return true for valid tmnt_id", () => {
      expect(validElimFkId(validElim.div_id, "div")).toBe(true);
      expect(validElimFkId(validElim.squad_id, "sqd")).toBe(true);
    });
    it("should return false for invalid foreign key id", () => {
      expect(validElimFkId("abc_def", "div")).toBe(false);
    });
    it("should return false if foreign key id type does not match id type", () => {
      expect(validElimFkId(validElim.div_id, "usr")).toBe(false);
    });
    it("should return false for an empty foreign key id", () => {
      expect(validElimFkId("", "bwl")).toBe(false);
    });
    it("should return false for an null foreign key id", () => {
      expect(validElimFkId(null as any, "div")).toBe(false);
    });
    it("should return false for an null key type", () => {
      expect(validElimFkId(validElim.div_id, null as any)).toBe(false);
    });
  });

  describe('validElimData function', () => { 
    it('should return ErrorCode.None for valid eliminator data', () => { 
      expect(validElimData(validElim)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when id is blank', () => { 
      const invalidElim = {
        ...validElim,
        id: '',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const invalidElim = {
        ...validElim,
        id: 'test',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is valid, but not a elim id', () => { 
      const invalidElim = {
        ...validElim,
        id: nonElimId,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_id is blank', () => { 
      const invalidElim = {
        ...validElim,
        div_id: '',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when div_id is invalid', () => { 
      const invalidElim = {
        ...validElim,
        div_id: '<script>alert(1)</script>',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_id is valid, but not a div id', () => { 
      const invalidElim = {
        ...validElim,
        div_id: nonElimId,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is blank', () => { 
      const invalidElim = {
        ...validElim,
        squad_id: '',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when squad_id is invalid', () => { 
      const invalidElim = {
        ...validElim,
        squad_id: 'abc_123',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is valid, but not a squad id', () => { 
      const invalidElim = {
        ...validElim,
        squad_id: nonElimId,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when start is too low', () => { 
      const invalidElim = {
        ...validElim,
        start: -1,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when start is too high', () => { 
      const invalidElim = {
        ...validElim,
        start: 1000,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when games is too low', () => { 
      const invalidElim = {
        ...validElim,
        games: 0,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when games is too high', () => { 
      const invalidElim = {
        ...validElim,
        games: 1000,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is too low', () => { 
      const invalidElim = {
        ...validElim,
        fee: '0',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is to high', () => { 
      const invalidElim = {
        ...validElim,
        fee: '1234567890',
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when sort_order is too low', () => { 
      const invalidElim = {
        ...validElim,
        sort_order: -1,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when sort_order is too high', () => { 
      const invalidElim = {
        ...validElim,
        sort_order: 1234567890,
      }
      expect(validateElim(invalidElim)).toBe(ErrorCode.InvalidData);
    })

  })

  describe('sanitizeElim function', () => { 
    it('should return sanitized elim for valid eliminator data', () => { 
      const testElim = {
        ...validElim,  
        id: '',
      }
      const sanitizedElim = sanitizeElim(testElim);
      expect(sanitizedElim.div_id).toEqual(testElim.div_id)
      expect(sanitizedElim.squad_id).toEqual(testElim.squad_id)
      expect(sanitizedElim.start).toEqual(testElim.start)
      expect(sanitizedElim.games).toEqual(testElim.games)            
      expect(sanitizedElim.fee).toEqual(testElim.fee)
      expect(sanitizedElim.sort_order).toEqual(testElim.sort_order)
    })
    it('should return sanitized elim when elim has an id', () => { 
      const testElim = {
        ...validElim,  
        id: elimId,
      }
      const sanitizedElim = sanitizeElim(testElim);
      expect(sanitizedElim.id).toEqual(elimId)
    })
    it('should return sanitized elim when elim has an invalid id', () => { 
      const testElim = {
        ...validElim,  
        id: 'test123',
      }
      const sanitizedElim = sanitizeElim(testElim);
      expect(sanitizedElim.id).toEqual('')
    })
    it('should return sanitized elim when elim is not sanitzed', () => { 
      // no numerical fields
      const testElim = {
        ...initElim,
        div_id: '<script>alert(1)</script>',
        squad_id: "usr_12345678901234567890123456789012",
        fee: '1234567890',
      }
      const sanitizedBrkt = sanitizeElim(testElim);
      expect(sanitizedBrkt.div_id).toEqual('')
      expect(sanitizedBrkt.squad_id).toEqual('')
      expect(sanitizedBrkt.fee).toEqual('')
    })
    it('should return sanitized elim when numerical values are null', () => { 
      const testElim = {
        ...initElim,
        start: null as any,
        games: null as any,
        sort_order: null as any,
      }
      const sanitizedBrkt = sanitizeElim(testElim);
      expect(sanitizedBrkt.start).toBeNull()
      expect(sanitizedBrkt.games).toBeNull()      
      expect(sanitizedBrkt.sort_order).toBeNull()
    })
    it('should return sanitized elim when numerical values are not numbers', () => { 
      const testElim = {
        ...initElim,
        start: 'abc' as any,
        games: ['abc', 'def'] as any,
        sort_order: new Date() as any,
      }
      const sanitizedBrkt = sanitizeElim(testElim);
      expect(sanitizedBrkt.start).toBeNull()
      expect(sanitizedBrkt.games).toBeNull()      
      expect(sanitizedBrkt.sort_order).toBeNull()
    })
    it('should return sanitized elim when numerical values are too low', () => { 
      const testElim = {
        ...initElim,
        start: 0,
        games: 0,
        sort_order: 0
      }
      const sanitizedBrkt = sanitizeElim(testElim);
      expect(sanitizedBrkt.start).toEqual(0)
      expect(sanitizedBrkt.games).toEqual(0)      
      expect(sanitizedBrkt.sort_order).toEqual(0)
    })
    it('should return sanitized elim when numerical values are too high', () => { 
      const testElim = {
        ...initElim,
        start: 100,
        games: 100,
        sort_order: 1234567
      }
      const sanitizedBrkt = sanitizeElim(testElim);
      expect(sanitizedBrkt.start).toEqual(100)
      expect(sanitizedBrkt.games).toEqual(100)      
      expect(sanitizedBrkt.sort_order).toEqual(1234567)
    })

    it('should return sanitized null when passed null', () => {
      expect(sanitizeElim(null as any)).toBe(null);
    })
    it('should return sanitized null when passed undefined', () => {
      expect(sanitizeElim(undefined as any)).toBe(null);
    })
  })

  describe('validateElim function', () => { 

    describe('ValidateElim function - valid eliminator data', () => { 
      it('should return ErrorCode.None for valid eliminator data', () => { 
        expect(validateElim(validElim)).toBe(ErrorCode.None);
      })
      it('should return ErrorCode.None when all fields are properly sanitized', () => { 
        const validTestElim = {
          ...validElim,
          fee: '5.000',
          first: '25.0',
          second: '10.0000',
          admin: '5.00',
        }
        expect(validateElim(validTestElim)).toBe(ErrorCode.None);
      })
    })

    describe('ValidateElim function - missing data', () => { 
      it('should return ErrorCode.MissingData when div_id is missing', () => { 
        const testElim = {
          ...validElim,
          div_id: '',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when squad_id is missing', () => { 
        const testElim = {
          ...validElim,
          squad_id: '',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when start is missing', () => { 
        const testElim = {
          ...validElim,
          start: null as any,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when games is missing', () => { 
        const testElim = {
          ...validElim,
          games: null as any,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when fee is missing', () => { 
        const testElim = {
          ...validElim,
          fee: '',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when sort_order is missing', () => { 
        const testElim = {
          ...validElim,
          sort_order: null as any,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.MissingData);
      })
    })

    describe('ValidateElim function - invalid data', () => { 
      it('should return ErrorCode.InvalidData when id is invalid', () => { 
        const testElim = {
          ...validElim,
          id: '<script>alert(1)</script>',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when div_id is invalid', () => { 
        const testElim = {
          ...validElim,
          div_id: '<script>alert(1)</script>',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when squad_id is invalid', () => { 
        const testElim = {
          ...validElim,
          squad_id: 'abc_123',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when start is invalid', () => { 
        const testElim = {
          ...validElim,
          start: -1,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when games is invalid', () => { 
        const testElim = {
          ...validElim,
          games: 0,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is invalid', () => { 
        const testElim = {
          ...validElim,
          fee: '1234567890',
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when sort_order is invalid', () => { 
        const testElim = {
          ...validElim,
          sort_order: -1,
        }
        expect(validateElim(testElim)).toBe(ErrorCode.InvalidData);
      })
    })

  })

  describe('validateElims function', () => { 

    it('should validate elims', () => { 
      const elimsToValidate = [...mockElimsToPost];
      const validElims: validElimsType = validateElims(elimsToValidate);
      expect(validElims.errorCode).toBe(ErrorCode.None);
      expect(validElims.elims.length).toBe(elimsToValidate.length);
      for (let i = 0; i < validElims.elims.length; i++) {
        expect(validElims.elims[i].id).toEqual(elimsToValidate[i].id);
        expect(validElims.elims[i].squad_id).toEqual(elimsToValidate[i].squad_id);
        expect(validElims.elims[i].div_id).toEqual(elimsToValidate[i].div_id);
        expect(validElims.elims[i].start).toEqual(elimsToValidate[i].start);
        expect(validElims.elims[i].games).toEqual(elimsToValidate[i].games);        
        expect(validElims.elims[i].fee).toEqual(elimsToValidate[i].fee);
      }
    })
    // no sanitize test because there are no strings to sanitize
    it('should return ErrorCode.InvalidData when data is invalid', () => { 
      const invalidElims = [
        {
          ...mockElimsToPost[0],
          start: -1
        },
        {
          ...mockElimsToPost[1],
        },
        {
          ...mockElimsToPost[2],
        },
        {
          ...mockElimsToPost[3],
        },
      ]
      const validElims: validElimsType = validateElims(invalidElims);
      expect(validElims.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when data is invalid (sanitize clears invalid Fee', () => {
      const invalidElims = [
        {
          ...mockElimsToPost[0],
          fee: '1234567'
        },
        {
          ...mockElimsToPost[1],
        },
        {
          ...mockElimsToPost[2],
        },
        {
          ...mockElimsToPost[3],
        },
      ]
      const validElims: validElimsType = validateElims(invalidElims);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when squad_id is not a valid squad_id', () => { 
      const invalidElims = [
        {
          ...mockElimsToPost[0],          
        },
        {
          ...mockElimsToPost[1],
          squad_id: mockElimsToPost[0].id 
        },
        {
          ...mockElimsToPost[2],
        },
        {
          ...mockElimsToPost[3],
        },
      ]
      const validElims: validElimsType = validateElims(invalidElims);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when div_id is not a valid div_id', () => { 
      const invalidElims = [
        {
          ...mockElimsToPost[0],          
        },
        {
          ...mockElimsToPost[1],          
        },
        {
          ...mockElimsToPost[2],
          div_id: mockElimsToPost[0].id 
        },
        {
          ...mockElimsToPost[3],
        },
      ]
      const validElims: validElimsType = validateElims(invalidElims);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when passed an empty array', async () => { 
      const validElims = validateElims([]);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
      expect(validElims.elims.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed null', async () => { 
      const validElims = validateElims(null as any);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
      expect(validElims.elims.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed undefined', async () => { 
      const validElims = validateElims(undefined as any);
      expect(validElims.errorCode).toBe(ErrorCode.MissingData);
      expect(validElims.elims.length).toBe(0);
    })  

  })

})
