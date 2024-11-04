import {
  sanitizeBrkt,
  validateBrkt,
  validStart,
  validGames,
  validPlayers,
  validBrktFkId,
  exportedForTesting,
  validBrktMoney,
  validFsa,
  validateBrkts,
} from "@/app/api/brkts/validate";
import { defaultBrktGames, defaultBrktPlayers, initBrkt } from "@/lib/db/initVals";
import { brktType, validBrktsType } from "@/lib/types/types";
import { ErrorCode, maxGames, maxSortOrder } from "@/lib/validation";
import { mockBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";

const { gotBrktData, validBrktData } = exportedForTesting;

const brktId = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';

const validBrkt = {
  ...initBrkt,
  id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",
  squad_id: "sqd_7116ce5f80164830830a7157eb093396",
  div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",  
  start: 1,
  games: 3,
  players: 8,
  fee: '5',
  first: '25',
  second: '10',
  admin: '5',
  fsa: '40',
  sort_order: 1,
} as brktType;

describe("tests for bracket validation", () => { 

  describe('gotBrktData function', () => {
    it('should return ErrorCode.None when all data is present', () => { 
      expect(gotBrktData(validBrkt)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when div_id is missing', () => {
      const testBrkt = {
        ...validBrkt,
        div_id: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when squad_id is missing', () => {
      const testBrkt = {
        ...validBrkt,
        squad_id: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when start is missing', () => {
      const testBrkt = {
        ...validBrkt,
        start: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when games is missing', () => {
      const testBrkt = {
        ...validBrkt,
        games: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when players is missing', () => {
      const testBrkt = {
        ...validBrkt,
        players: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fee is missing', () => {
      const testBrkt = {
        ...validBrkt,
        fee: ''
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when first is missing', () => {
      const testBrkt = {
        ...validBrkt,
        first: ''
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when second is missing', () => {
      const testBrkt = {
        ...validBrkt,
        second: ''
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when admin is missing', () => {
      const testBrkt = {
        ...validBrkt,
        admin: ''
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when fsa is missing', () => {
      const testBrkt = {
        ...validBrkt,
        fsa: ''
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when sort_order is missing', () => {
      const testBrkt = {
        ...validBrkt,
        sort_order: null as any
      }
      expect(gotBrktData(testBrkt)).toBe(ErrorCode.MissingData);
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
      expect(validGames(defaultBrktGames)).toBe(true);
    })
    it('should return false when start is invalid', () => {
      expect(validGames(defaultBrktGames - 1)).toBe(false);
      expect(validGames(defaultBrktGames + 1)).toBe(false);
      expect(validGames('abc' as any)).toBe(false);
    })
    it('should return false when start is null', () => {
      expect(validGames(null as any)).toBe(false);
    })
    it('should return false when start is undefined', () => {
      expect(validGames(undefined as any)).toBe(false);
    })
  })

  describe('validPlayers function', () => { 
    it('should return true when start is valid', () => {
      expect(validPlayers(defaultBrktPlayers)).toBe(true);
    })
    it('should return false when start is invalid', () => {
      expect(validPlayers(defaultBrktPlayers - 1)).toBe(false);
      expect(validPlayers(defaultBrktPlayers + 1)).toBe(false);
      expect(validPlayers('abc' as any)).toBe(false);
    })
    it('should return false when start is null', () => {
      expect(validPlayers(null as any)).toBe(false);
    })
    it('should return false when start is undefined', () => {
      expect(validPlayers(undefined as any)).toBe(false);
    })
  })

  describe('validBrktMoney function', () => {
    it('should return true when fee is valid', () => {
      expect(validBrktMoney('5')).toBe(true);
    })
    it('should return false when fee is invalid', () => {
      expect(validBrktMoney('')).toBe(false);
      expect(validBrktMoney('-1')).toBe(false);
      expect(validBrktMoney('0.9')).toBe(false);
      expect(validBrktMoney('1234567890')).toBe(false);
      expect(validBrktMoney('abc' as any)).toBe(false);
    })
    it('should return false when fee is null', () => {
      expect(validBrktMoney(null as any)).toBe(false);
    })
    it('should return false when fee is undefined', () => {
      expect(validBrktMoney(undefined as any)).toBe(false);
    })
  })

  describe('validFsa function', () => {
    it('should return true when fsa is valid', () => {
      expect(validFsa(validBrkt)).toBe(true);
    })
    it('should return false when fsa is invalid - only fee is changed', () => {
      const testBrkt = {
        ...validBrkt,
        fee: '6'
      }
      expect(validFsa(testBrkt)).toBe(false);
    })
    it('should return false when fsa is invalid - only first is changed', () => {
      const testBrkt = {
        ...validBrkt,
        first: '26'
      }
      expect(validFsa(testBrkt)).toBe(false);
    })
    it('should return false when fsa is invalid - only second is changed', () => {
      const testBrkt = {
        ...validBrkt,
        second: '11'
      }
      expect(validFsa(testBrkt)).toBe(false);
    })
    it('should return false when fsa is invalid - only admin is changed', () => {
      const testBrkt = {
        ...validBrkt,
        admin: '6'
      }
      expect(validFsa(testBrkt)).toBe(false);
    })
    it('should return false when fsa is invalid - only fsa is changed', () => {
      const testBrkt = {
        ...validBrkt,
        fsa: '41'
      }
      expect(validFsa(testBrkt)).toBe(false);
    })
    it('should return false when bracket is null', () => {
      expect(validFsa(null as any)).toBe(false);
    })
    it('should return false when backet is undefined', () => {
      expect(validFsa(undefined as any)).toBe(false);
    })
  })

  describe("validBrktFkId function", () => {
    it("should return true for valid tmnt_id", () => {
      expect(validBrktFkId(validBrkt.div_id, "div")).toBe(true);
      expect(validBrktFkId(validBrkt.squad_id, "sqd")).toBe(true);
    });
    it("should return false for invalid foreign key id", () => {
      expect(validBrktFkId("abc_def", "div")).toBe(false);
    });
    it("should return false if foreign key id type does not match id type", () => {
      expect(validBrktFkId(validBrkt.div_id, "usr")).toBe(false);
    });
    it("should return false for an empty foreign key id", () => {
      expect(validBrktFkId("", "bwl")).toBe(false);
    });
    it("should return false for an null foreign key id", () => {
      expect(validBrktFkId(null as any, "div")).toBe(false);
    });
    it("should return false for an null key type", () => {
      expect(validBrktFkId(validBrkt.div_id, null as any)).toBe(false);
    });
  });

  describe('validBrktData function', () => { 
    it('should return ErrorCode.None for valid bracket data', () => {
      expect(validBrktData(validBrkt)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when div_id is missing', () => {
      const testBrkt = {
        ...validBrkt,
        div_id: ''
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_id is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        div_id: 'abc_123'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when div_id is valid, but not div type", () => {
      const testBrkt = {
        ...validBrkt,
        div_id: 'usr_12345678901234567890123456789012'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is missing', () => {
      const testBrkt = {
        ...validBrkt,
        squad_id: ''
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad_id is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        squad_id: 'abc_123'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when squad_id is valid, but not squad type", () => {
      const testBrkt = {
        ...validBrkt,
        squad_id: 'usr_12345678901234567890123456789012'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when start is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        start: -1
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when games is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        games: maxGames + 1
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when players is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        players: -1
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fee is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        fee: '-1'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when fsa is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        fsa: '41'
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when sort_order is invalid', () => {
      const testBrkt = {
        ...validBrkt,
        sort_order: -1
      }
      expect(validBrktData(testBrkt)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when passed null', () => {
      expect(validBrktData(null as any)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when passed undefined', () => {
      expect(validBrktData(undefined as any)).toBe(ErrorCode.InvalidData);
    })
  })

  describe('sanitizeBrkt function', () => { 
    it('should return sanitized brkt for valid bracket data', () => { 
      const testBrkt = {
        ...validBrkt,  
        id: '',
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.div_id).toEqual(testBrkt.div_id)
      expect(sanitizedBrkt.squad_id).toEqual(testBrkt.squad_id)
      expect(sanitizedBrkt.start).toEqual(testBrkt.start)
      expect(sanitizedBrkt.games).toEqual(testBrkt.games)      
      expect(sanitizedBrkt.players).toEqual(testBrkt.players)
      expect(sanitizedBrkt.fee).toEqual(testBrkt.fee)
      expect(sanitizedBrkt.first).toEqual(testBrkt.first)
      expect(sanitizedBrkt.second).toEqual(testBrkt.second)
      expect(sanitizedBrkt.admin).toEqual(testBrkt.admin)
      expect(sanitizedBrkt.fsa).toEqual(testBrkt.fsa)
      expect(sanitizedBrkt.sort_order).toEqual(testBrkt.sort_order)
    })
    it('should return sanitized brkt when bracket has an id', () => { 
      const testBrkt = {
        ...validBrkt,  
        id: brktId,
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.id).toEqual(brktId)
    })
    it('should return sanitized brkt when bracket has an invalid id', () => { 
      const testBrkt = {
        ...validBrkt,  
        id: 'test123',
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.id).toEqual('')
    })
    it('should return sanitized brkt when bracket is not sanitzed', () => { 
      // no numerical fields
      const testBrkt = {
        ...initBrkt,
        div_id: '<script>alert(1)</script>',
        squad_id: "usr_12345678901234567890123456789012",
        fee: '1234567890',
        first: 'abc',
        second: '<script>alert(1)</script>',
        admin: '-1',
        fsa: '******',
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.div_id).toEqual('')
      expect(sanitizedBrkt.squad_id).toEqual('')
      expect(sanitizedBrkt.start).toEqual(1)
      expect(sanitizedBrkt.games).toEqual(3)
      expect(sanitizedBrkt.players).toEqual(8)
      expect(sanitizedBrkt.fee).toEqual('')
      expect(sanitizedBrkt.first).toEqual('')
      expect(sanitizedBrkt.second).toEqual('')
      expect(sanitizedBrkt.admin).toEqual('')
      expect(sanitizedBrkt.fsa).toEqual('')
      expect(sanitizedBrkt.sort_order).toEqual(1)
    })
    it('should return sanitized brkt when numerical field are null', () => { 
      const testBrkt = {
        ...initBrkt,
        start: null as any,
        games: null as any,
        players: null as any,
        sort_order: null as any
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.start).toBeNull()
      expect(sanitizedBrkt.games).toBeNull()
      expect(sanitizedBrkt.players).toBeNull()
      expect(sanitizedBrkt.sort_order).toBeNull()
    })
    it('should return sanitized brkt when numerical field are not numbers', () => { 
      const testBrkt = {
        ...initBrkt,
        start: 'abc' as any,
        games: ['abc', 'def'] as any,
        players: new Date() as any,
        sort_order: {text: 'abc'} as any
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.start).toBeNull()
      expect(sanitizedBrkt.games).toBeNull()
      expect(sanitizedBrkt.players).toBeNull()
      expect(sanitizedBrkt.sort_order).toBeNull()
    })
    it('should return sanitized brkt when numerical field are too low', () => { 
      const testBrkt = {
        ...initBrkt,
        start: 0,
        games: 0,
        players: 0,
        sort_order: 0
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.start).toEqual(0)
      expect(sanitizedBrkt.games).toEqual(0)
      expect(sanitizedBrkt.players).toEqual(0)
      expect(sanitizedBrkt.sort_order).toEqual(0)
    })
    it('should return sanitized brkt when numerical field are too high', () => { 
      const testBrkt = {
        ...initBrkt,
        start: 100,
        games: 10,
        players: 10,
        sort_order: 1234567
      }
      const sanitizedBrkt = sanitizeBrkt(testBrkt);
      expect(sanitizedBrkt.start).toEqual(100)
      expect(sanitizedBrkt.games).toEqual(10)
      expect(sanitizedBrkt.players).toEqual(10)
      expect(sanitizedBrkt.sort_order).toEqual(1234567)
    })
    it('should return sanitized null when passed null', () => {
      expect(sanitizeBrkt(null as any)).toBe(null);
    })
    it('should return sanitized null when passed undefined', () => {
      expect(sanitizeBrkt(undefined as any)).toBe(null);
    })
  })

  describe('validateBrkt function', () => { 

    describe('validateBrkt - valid bracket', () => { 
      it('should return ErrorCode.None for valid bracket', () => { 
        expect(validateBrkt(validBrkt)).toBe(ErrorCode.None);
      })
      it('should return ErrorCode.None when all fields are properly sanitized', () => { 
        const validTestBrkt = {
          ...validBrkt,
          fee: '5.000',
          first: '25.0',
          second: '10.0000',
          admin: '5.00',
        }
        expect(validateBrkt(validTestBrkt)).toBe(ErrorCode.None);
      })
    })

    describe('validateBrkt - missing data', () => { 
      it('should return ErrorCode.MissingData when div_id is missing', () => {
        const testBrkt = {
          ...validBrkt,
          div_id: null as any
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when squad_id is missing', () => {
        const testBrkt = {
          ...validBrkt,
          squad_id: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when start is missing', () => {
        const testBrkt = {
          ...validBrkt,
          start: null as any
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when games is missing', () => {
        const testBrkt = {
          ...validBrkt,
          games: null as any
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when players is missing', () => {
        const testBrkt = {
          ...validBrkt,
          players: null as any
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when fee is missing', () => {
        const testBrkt = {
          ...validBrkt,
          fee: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when first is missing', () => {
        const testBrkt = {
          ...validBrkt,
          first: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when second is missing', () => {
        const testBrkt = {
          ...validBrkt,
          second: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when admin is missing', () => {
        const testBrkt = {
          ...validBrkt,
          admin: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when fsa is missing', () => {
        const testBrkt = {
          ...validBrkt,
          fsa: ''
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when sort_order is missing', () => {
        const testBrkt = {
          ...validBrkt,
          sort_order: null as any
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.MissingData);
      })
    })

    describe('validdateBrkt - invalid data', () => { 
      it('should return ErrorCode.InvalidData when div_id is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          div_id: 'abc_123'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when squad_id is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          squad_id: 'abc_123'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when start is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          start: -1
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when games is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          games: maxGames + 1
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when players is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          players: 100 
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fee is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          fee: '0.9'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when first is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          first: '-1'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when second is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          second: '-1'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when admin is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          admin: '1234567890'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when fsa is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          fsa: '41'
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when sort_order is invalid', () => {
        const testBrkt = {
          ...validBrkt,
          sort_order: maxSortOrder + 1
        }
        expect(validateBrkt(testBrkt)).toBe(ErrorCode.InvalidData);
      })
    })
  })

  describe('validateBrkts function', () => { 

    it('should validate brkts', () => { 
      const brktsToValidate = [...mockBrktsToPost];
      const validBrkts: validBrktsType = validateBrkts(brktsToValidate);
      expect(validBrkts.errorCode).toBe(ErrorCode.None);
      expect(validBrkts.brkts.length).toBe(brktsToValidate.length);
      for (let i = 0; i < validBrkts.brkts.length; i++) {
        expect(validBrkts.brkts[i].id).toEqual(brktsToValidate[i].id);
        expect(validBrkts.brkts[i].squad_id).toEqual(brktsToValidate[i].squad_id);
        expect(validBrkts.brkts[i].div_id).toEqual(brktsToValidate[i].div_id);
        expect(validBrkts.brkts[i].start).toEqual(brktsToValidate[i].start);
        expect(validBrkts.brkts[i].games).toEqual(brktsToValidate[i].games);
        expect(validBrkts.brkts[i].players).toEqual(brktsToValidate[i].players);
        expect(validBrkts.brkts[i].fee).toEqual(brktsToValidate[i].fee);
        expect(validBrkts.brkts[i].first).toEqual(brktsToValidate[i].first);
        expect(validBrkts.brkts[i].second).toEqual(brktsToValidate[i].second);
        expect(validBrkts.brkts[i].admin).toEqual(brktsToValidate[i].admin);
        expect(validBrkts.brkts[i].fsa).toEqual(brktsToValidate[i].fsa);
      }
    })
    // no sanitize test because there are no strings to sanitize
    it('should return ErrorCode.InvalidData when data is invalid', () => { 
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],
          start: -1
        },
        {
          ...mockBrktsToPost[1],
        },
        {
          ...mockBrktsToPost[2],
        },
        {
          ...mockBrktsToPost[3],
        },
      ]
      const validBrkts: validBrktsType = validateBrkts(invalidBrkts);
      expect(validBrkts.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when data is invalid (sanitize clears invalid Fee', () => {
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],
          fee: '1234567'
        },
        {
          ...mockBrktsToPost[1],
        },
        {
          ...mockBrktsToPost[2],
        },
        {
          ...mockBrktsToPost[3],
        },
      ]
      const validBrkts: validBrktsType = validateBrkts(invalidBrkts);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when squad_id is not a valid squad_id', () => { 
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],          
        },
        {
          ...mockBrktsToPost[1],
          squad_id: mockBrktsToPost[0].id 
        },
        {
          ...mockBrktsToPost[2],
        },
        {
          ...mockBrktsToPost[3],
        },
      ]
      const validBrkts: validBrktsType = validateBrkts(invalidBrkts);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when div_id is not a valid div_id', () => { 
      const invalidBrkts = [
        {
          ...mockBrktsToPost[0],          
        },
        {
          ...mockBrktsToPost[1],          
        },
        {
          ...mockBrktsToPost[2],
          div_id: mockBrktsToPost[0].id 
        },
        {
          ...mockBrktsToPost[3],
        },
      ]
      const validBrkts: validBrktsType = validateBrkts(invalidBrkts);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when passed an empty array', async () => { 
      const validBrkts = validateBrkts([]);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
      expect(validBrkts.brkts.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed null', async () => { 
      const validBrkts = validateBrkts(null as any);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
      expect(validBrkts.brkts.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when passed undefined', async () => { 
      const validBrkts = validateBrkts(undefined as any);
      expect(validBrkts.errorCode).toBe(ErrorCode.MissingData);
      expect(validBrkts.brkts.length).toBe(0);
    })  

  })

})