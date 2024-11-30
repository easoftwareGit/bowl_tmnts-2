import { validPlayerFirstName, validPlayerLastName, validAverage, validLane, validPosition, exportedForTesting, validPlayerFkId, sanitizePlayer, validatePlayer } from "@/app/api/players/validate";
import { mockPlayers } from "../../../mocks/tmnts/newTmnt/mockNewTmnt";
import { ErrorCode, maxFirstNameLength, maxLaneCount, maxLastNameLength } from "@/lib/validation";
const { gotPlayerData, validPlayerData } = exportedForTesting;

const playerId = 'ply_88be0472be3d476ea1caa99dd05953fa';
const nonPlayerId = 'bwl_5bcefb5d314fff1ff5da6521a2fa7bde';
const mockPlayer = mockPlayers[0];

jest.mock("../../../../src/app/api/players/validate", () => ({
  ...jest.requireActual("../../../../src/app/api/players/validate"),
  gotPlayerData: jest.fn(),
  validPlayerData: jest.fn()
}))

describe("player table data validation", () => { 

  describe("gotPlayerData function - check for missing data", () => { 
    it('should return ErrorCode.None if no player data is missing', () => { 
      expect(gotPlayerData(mockPlayer)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData if player id is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        id: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if squad id is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        squad_id: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if first name is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        first_name: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if last name is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        last_name: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if average is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        average: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);  
    })
    it('should return ErrorCode.MissingData if lane is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        lane: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);  
    })
    it('should return ErrorCode.MissingData if position is missing', () => {
      const testPlayer = {
        ...mockPlayer,
        position: null as any
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if id is blank', () => { 
      const testPlayer = {
        ...mockPlayer,
        id: ''
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if squad id is blank', () => { 
      const testPlayer = {
        ...mockPlayer,
        squad_id: ''
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if first name is blank', () => { 
      const testPlayer = {
        ...mockPlayer,
        first_name: ''
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if last name is blank', () => { 
      const testPlayer = {
        ...mockPlayer,
        last_name: ''
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if position is blank', () => { 
      const testPlayer = {
        ...mockPlayer,
        position: ''
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if first name sanitized to empty string', () => {
      const testPlayer = {
        ...mockPlayer,
        first_name: '   '
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if last name sanitized to empty string', () => {
      const testPlayer = {
        ...mockPlayer,
        last_name: '*()*'
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData if position sanitized to empty string', () => {
      const testPlayer = {
        ...mockPlayer,
        position: '<>[]'
      }
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MissingData);
    })
  })

  describe('validPlayerFirstName function', () => { 
    it('should return true if first name is valid', () => { 
      expect(validPlayerFirstName('John')).toBe(true);
    })
    it("should return false when over max length", () => {
      const result = validPlayerFirstName("a".repeat(maxFirstNameLength + 1));
      expect(result).toBe(false);
    });
    it("should return false when under min length", () => {
      const result = validPlayerFirstName("");
      expect(result).toBe(false);
    });
    it("should sanitize first name", () => {
      const result = validPlayerFirstName("<script>alert(1)</script>");
      expect(result).toBe(true); // sanitizes to 'alert1'
    });
    it("should return false when passed null", () => {
      const result = validPlayerFirstName(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPlayerFirstName(undefined as any);
      expect(result).toBe(false);
    });
  })

  describe('validPlayerLastName function', () => { 
    it('should return true if last name is valid', () => { 
      expect(validPlayerLastName('Smith')).toBe(true);
    })
    it("should return false when over max length", () => {
      const result = validPlayerLastName("a".repeat(maxLastNameLength + 1));
      expect(result).toBe(false);
    });
    it("should return false when under min length", () => {
      const result = validPlayerLastName("");
      expect(result).toBe(false);
    });
    it("should sanitize last name", () => {
      const result = validPlayerLastName("<script>alert(1)</script>");
      expect(result).toBe(true); // sanitizes to 'alert1'
    });
    it("should return false when passed null", () => {
      const result = validPlayerLastName(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPlayerLastName(undefined as any);
      expect(result).toBe(false);
    });
  })

  describe("validAverage function", () => {
    it("should return true when valid", () => {
      const result = validAverage(100);
      expect(result).toBe(true);
    });
    it("should return false when over max average", () => {
      const result = validAverage(301);
      expect(result).toBe(false);
    });
    it("should return false when under min average", () => {
      const result = validAverage(-1);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validAverage(2.5);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validAverage('abc' as any);
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validAverage(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validAverage(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe("validLane function", () => {
    it("should return true when valid", () => {
      const result = validLane(1);
      expect(result).toBe(true);
    });
    it("should return false when over max lane", () => {
      const result = validLane(maxLaneCount + 1);
      expect(result).toBe(false);
    });
    it("should return false when under min lane", () => {
      const result = validLane(0);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validLane(2.5);
      expect(result).toBe(false);
    });
    it("should return false when non integer number is passed", () => {
      const result = validLane('abc' as any);
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validLane(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validLane(undefined as any);
      expect(result).toBe(false);
    });
  });

  describe('validPosition function', () => { 
    it('should return true if last name is valid', () => { 
      expect(validPosition('A')).toBe(true);
    })
    it("should return false when over max length", () => {
      const result = validPosition("AB");
      expect(result).toBe(false);
    });
    it("should return false when under min length", () => {
      const result = validPosition("");
      expect(result).toBe(false);
    });
    it("should sanitize last name", () => {
      const result = validPosition("<");
      expect(result).toBe(false); // sanitizes to ''
    });
    it("should return false when passed null", () => {
      const result = validPosition(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPosition(undefined as any);
      expect(result).toBe(false);
    });
  })

  describe("validPlayerFkId function", () => { 
    it("should return true for a valid squad_id", () => {
      const result = validPlayerFkId(mockPlayer.squad_id, 'sqd');
      expect(result).toBe(true);
    });
    it("should return false when passwed an invalid squad_id", () => {
      const result = validPlayerFkId('testing', 'sqd');
      expect(result).toBe(false);
    });
    it("should return false for an valid id, but not a squad_id", () => {
      const result = validPlayerFkId(playerId, 'sqd');
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validPlayerFkId(null as any, 'sqd');
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPlayerFkId(undefined as any, 'sqd');
      expect(result).toBe(false);
    });
  })

  describe("validPlayerData function", () => { 
    it("should return ErrorCode.None when valid player data is passed", () => { 
      const result = validPlayerData(mockPlayer);
      expect(result).toBe(ErrorCode.None);
    })
    it("should return ErrorCode.InvalidData when player.id is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: null as any
      });      
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when squad_id is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when first_name is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        first_name: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when last_name is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        last_name: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when average is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        average: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when lane is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        lane: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it("should return ErrorCode.InvalidData when position is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: null as any
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when player_id is blank', () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: ''
      });
      expect(result).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when squad_id is blank', () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: ''
      });
      expect(result).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when first_name is blank', () => {
      const result = validPlayerData({
        ...mockPlayer,
        first_name: ''
      });
      expect(result).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when last_name is blank', () => {
      const result = validPlayerData({
        ...mockPlayer,
        last_name: ''
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when position is blank', () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: ''
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player.id is invalid', () => { 
      const result = validPlayerData({
        ...mockPlayer,
        id: 'abc_123'
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player id is a valid is, but not a player id', () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: nonPlayerId
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when squad_id is invalid', () => { 
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: 'abc_123'
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when squad id is a valid id, but not a squad id', () => { 
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: playerId
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when first_name is invalid', () => { 
      const result = validPlayerData({
        ...mockPlayer,
        first_name: "a".repeat(maxFirstNameLength + 1)
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when last_name is invalid', () => { 
      const result = validPlayerData({
        ...mockPlayer,
        last_name: "a".repeat(maxLastNameLength + 1)
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when average is invalid', () => {
      const result = validPlayerData({
        ...mockPlayer,
        average: -1
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when lane is invalid', () => {
      const result = validPlayerData({
        ...mockPlayer,
        lane: -1
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when position is invalid', () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: "ABC"
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when passed null', () => { 
      const result = validPlayerData(null as any);
      expect(result).toBe(ErrorCode.InvalidData);
    })
  })

  describe('sanitizePlayer function', () => { 
    it('should return a sanitized player when player is already sanitized', () => {
      const result = sanitizePlayer(mockPlayer);
      expect(result).toEqual(mockPlayer);
    })
    it('should return a sanitized player when player when id is invalid', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        id: 'abc_123'
      });
      expect(result.id).toBe('');
    })
    it('should return a sanitized player when squad_id is invalid', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        squad_id: 'abc_123'
      });
      expect(result.squad_id).toBe('');
    })
    it('should return a sanitized player when first_name is not sanitized', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        first_name: '<script>alert(1)</script>'
      });
      expect(result.first_name).toBe('alert1');
    })
    it('should return a sanitized player when last_name is not sanitized', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        last_name: '<script>alert(1)</script>'
      });
      expect(result.last_name).toBe('alert1');
    })
    it('should return a sanitized player when average is not sanitized', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        average: 2.5
      });
      expect(result.average).toBe(2.5); // not valid but sanitied
    })
    it('should return a sanitized player when lane is not sanitized', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        lane: 'abc' as any
      });
      expect(result.lane).toBe(0); // not valid but sanitied
    })
    it('should return a sanitized player when position is not sanitized', () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        position: '<script>alert(1)</script>'
      });
      expect(result.position).toBe('alert1'); // not valid but sanitied
    })
    it('should return null when passed null', () => {
      const result = sanitizePlayer(null as any);
      expect(result).toBe(null);
    })    
  })

  describe('validatePlayer function', () => { 

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should return ErrorCode.None when passed a valid player', () => {
      const result = validatePlayer(mockPlayer);
      expect(result).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.None when all fields are properly sanitied', () => {
      const toSanitize = {
        ...mockPlayer,
        first_name: '<script>alert(1)</script>',
        last_name: '   Last Name ***',                
        position: '<a>A'
      }
      const result = validatePlayer(toSanitize);
      expect(result).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when id is missing', () => { 
      const result = validatePlayer({
        ...mockPlayer,
        id: null as any
      });
      expect(result).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const result = validatePlayer({
        ...mockPlayer,
        id: 'abc_123'
      });
      expect(result).toBe(ErrorCode.InvalidData);
    })
  })

})