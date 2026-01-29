import {
  validPlayerFirstName,
  validPlayerLastName,
  validAverage,
  validLane,
  validPosition,  
  validPlayerFkId,
  sanitizePlayer,
  validatePlayer,
  validatePlayers,
  exportedForTesting,
  validPlayerId,
} from "@/lib/validation/players/validate";
import { mockPlayers } from "../../mocks/tmnts/newTmnt/mockNewTmnt";
import {
  ErrorCode,
  maxAverage,
  maxFirstNameLength,
  maxLaneCount,
  maxLastNameLength,
  maxStartLane,
} from "@/lib/validation/validation";
import { cloneDeep } from "lodash";
import { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";

const { gotPlayerData, validPlayerData } = exportedForTesting;

const playerId = "ply_88be0472be3d476ea1caa99dd05953fa";
const nonPlayerId = "bwl_5bcefb5d314fff1ff5da6521a2fa7bde";
const mockPlayer = mockPlayers[0];
const testByeId = "bye_0123456789abcdef0123456789abcdef";

const byePlayer = cloneDeep(mockPlayer);
byePlayer.id = testByeId;
byePlayer.first_name = "Bye";
byePlayer.last_name = null as any;
byePlayer.average = 0;
byePlayer.lane = null as any;
byePlayer.position = null as any;

describe("player table data validation", () => {
  describe("gotPlayerData function - regular player", () => {
    it("should return ErrorCode.NONE if no player data is missing", () => {
      expect(gotPlayerData(mockPlayer)).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.MISSING_DATA if player id is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        id: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if squad id is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        squad_id: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if first name is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        first_name: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if last name is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        last_name: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if average is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        average: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if lane is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        lane: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if position is missing", () => {
      const testPlayer = {
        ...mockPlayer,
        position: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if id is blank", () => {
      const testPlayer = {
        ...mockPlayer,
        id: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if squad id is blank", () => {
      const testPlayer = {
        ...mockPlayer,
        squad_id: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if first name is blank", () => {
      const testPlayer = {
        ...mockPlayer,
        first_name: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if last name is blank", () => {
      const testPlayer = {
        ...mockPlayer,
        last_name: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if position is blank", () => {
      const testPlayer = {
        ...mockPlayer,
        position: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if first name sanitized to empty string", () => {
      const testPlayer = {
        ...mockPlayer,
        first_name: "   ",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if last name sanitized to empty string", () => {
      const testPlayer = {
        ...mockPlayer,
        last_name: "*()*",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if position sanitized to empty string", () => {
      const testPlayer = {
        ...mockPlayer,
        position: "<>[]",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
  });

  describe("gotPlayerData function - bye player", () => {
    const testByeId = "bye_0123456789abcdef0123456789abcdef";
    const byePlayer: playerType = {
      ...initPlayer,
      id: testByeId,
      squad_id: mockPlayers[0].squad_id,
      first_name: "Bye",
      last_name: null as any,
      average: 0,
      lane: null as any,
      position: null as any,
    };
    it("should return ErrorCode.NONE if no player data is missing", () => {
      expect(gotPlayerData(byePlayer)).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.MISSING_DATA if player id is missing", () => {
      const testPlayer = {
        ...byePlayer,
        id: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if squad id is missing", () => {
      const testPlayer = {
        ...byePlayer,
        squad_id: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if first name is missing", () => {
      const testPlayer = {
        ...byePlayer,
        first_name: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if average is missing", () => {
      const testPlayer = {
        ...byePlayer,
        average: null as any,
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if id is blank", () => {
      const testPlayer = {
        ...byePlayer,
        id: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if squad id is blank", () => {
      const testPlayer = {
        ...byePlayer,
        squad_id: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.MISSING_DATA if first name is blank", () => {
      const testPlayer = {
        ...byePlayer,
        first_name: "",
      };
      expect(gotPlayerData(testPlayer)).toBe(ErrorCode.MISSING_DATA);
    });
  });

  describe('validPlayerId function', () => { 
    it("should return true if player id is valid", () => {
      expect(validPlayerId(playerId)).toBe(true);
    });
    it("should return false if player id is invalid", () => {
      expect(validPlayerId("invalid_id")).toBe(false);
    });
    it("should return false if passed a valid id, but not a player id", () => {
      expect(validPlayerId(mockPlayer.squad_id)).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validPlayerId(null as any);
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPlayerId(undefined as any);
      expect(result).toBe(false);
    });
  })

  describe("validPlayerFirstName function", () => {
    it("should return true if first name is valid", () => {
      expect(validPlayerFirstName("John")).toBe(true);
    });
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
  });

  describe("validPlayerLastName function", () => {
    it("should return true if last name is valid", () => {
      expect(validPlayerLastName("Smith")).toBe(true);
    });
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
  });

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
      const result = validAverage("abc" as any);
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
      const result = validLane("abc" as any);
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

  describe("validPosition function", () => {
    it("should return true if last name is valid", () => {
      expect(validPosition("A")).toBe(true);
    });
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
  });

  describe("validPlayerFkId function", () => {
    it("should return true for a valid squad_id", () => {
      const result = validPlayerFkId(mockPlayer.squad_id, "sqd");
      expect(result).toBe(true);
    });
    it("should return false when passwed an invalid squad_id", () => {
      const result = validPlayerFkId("testing", "sqd");
      expect(result).toBe(false);
    });
    it("should return false for an valid id, but not a squad_id", () => {
      const result = validPlayerFkId(playerId, "sqd");
      expect(result).toBe(false);
    });
    it("should return false when passed null", () => {
      const result = validPlayerFkId(null as any, "sqd");
      expect(result).toBe(false);
    });
    it("should return false when passed undefined", () => {
      const result = validPlayerFkId(undefined as any, "sqd");
      expect(result).toBe(false);
    });
  });

  describe("validPlayerData function - regular player", () => {
    it("should return ErrorCode.NONE when valid player data is passed", () => {
      const result = validPlayerData(mockPlayer);
      expect(result).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.INVALID_DATA when player.id is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when first_name is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        first_name: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when last_name is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        last_name: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when average is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        average: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when lane is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        lane: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is missing", () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when player_id is blank", () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is blank", () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when first_name is blank", () => {
      const result = validPlayerData({
        ...mockPlayer,
        first_name: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when last_name is blank", () => {
      const result = validPlayerData({
        ...mockPlayer,
        last_name: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is blank", () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when player.id is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: "abc_123",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when player id is a valid is, but not a player id", () => {
      const result = validPlayerData({
        ...mockPlayer,
        id: nonPlayerId,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: "abc_123",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad id is a valid id, but not a squad id", () => {
      const result = validPlayerData({
        ...mockPlayer,
        squad_id: playerId,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when first_name is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        first_name: "a".repeat(maxFirstNameLength + 1),
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when last_name is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        last_name: "a".repeat(maxLastNameLength + 1),
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when average is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        average: -1,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when lane is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        lane: -1,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is invalid", () => {
      const result = validPlayerData({
        ...mockPlayer,
        position: "ABC",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when passed null", () => {
      const result = validPlayerData(null as any);
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("validPlayerData function - bye player", () => {
    it("should return ErrorCode.NONE when valid player data is passed", () => {
      const result = validPlayerData(byePlayer);
      expect(result).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.INVALID_DATA when player.id is missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        id: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        squad_id: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when first_name is missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        first_name: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when last_name is NOT missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        last_name: "test",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when average is missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        average: null as any,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when lane is NOT missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        lane: 1,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when position is NOT missing", () => {
      const result = validPlayerData({
        ...byePlayer,
        position: "A",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when player_id is blank", () => {
      const result = validPlayerData({
        ...byePlayer,
        id: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is blank", () => {
      const result = validPlayerData({
        ...byePlayer,
        squad_id: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when first_name is blank", () => {
      const result = validPlayerData({
        ...byePlayer,
        first_name: "",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad_id is invalid", () => {
      const result = validPlayerData({
        ...byePlayer,
        squad_id: "abc_123",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when squad id is a valid id, but not a squad id", () => {
      const result = validPlayerData({
        ...byePlayer,
        squad_id: playerId,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it('should return ErrorCode.INVALID_DATA when first_name is NOT "Bye"', () => {
      const result = validPlayerData({
        ...byePlayer,
        first_name: "abc",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when average is invalid", () => {
      const result = validPlayerData({
        ...byePlayer,
        average: 123,
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("sanitizePlayer function - regular player", () => {
    it("should return a sanitized player when player is already sanitized", () => {
      const result = sanitizePlayer(mockPlayer);
      expect(result).toEqual(mockPlayer);
    });
    it("should return a sanitized player when player when id is invalid", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        id: "abc_123",
      });
      expect(result.id).toBe("");
    });
    it("should return a sanitized player when squad_id is invalid", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        squad_id: "abc_123",
      });
      expect(result.squad_id).toBe("");
    });
    it("should return a sanitized player when first_name is not sanitized", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        first_name: "<script>alert(1)</script>",
      });
      expect(result.first_name).toBe("alert1");
    });
    it("should return a sanitized player when last_name is not sanitized", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        last_name: "<script>alert(1)</script>",
      });
      expect(result.last_name).toBe("alert1");
    });
    it("should return a sanitized player when average is not sanitized", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        average: 2.5,
      });
      expect(result.average).toBe(2.5); // not valid but sanitied
    });
    it("should return a sanitized player when average is not", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        average: "<script>alert(1)</script>" as any,
      });
      expect(result.average).toBe(-1); // not valid but sanitied
    });
    it("should return a sanitized player when lane is not sanitized", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        lane: "abc" as any,
      });
      expect(result.lane).toBe(0); // not valid but sanitied
    });
    it("should return a sanitized player when position is not sanitized", () => {
      const result = sanitizePlayer({
        ...mockPlayer,
        position: "<script>alert(1)</script>",
      });
      expect(result.position).toBe("alert1"); // not valid but sanitied
    });
    it("should return null when passed null", () => {
      const result = sanitizePlayer(null as any);
      expect(result).toBe(null);
    });
  });

  describe("sanitizePlayer function - bye player", () => {
    it("should return a sanitized player when player is already sanitized", () => {
      const result = sanitizePlayer(byePlayer);
      expect(result).toEqual(byePlayer);
    });
    it("should return a sanitized player when player when id is invalid", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        id: "abc_123",
      });
      expect(result.id).toBe("");
    });
    it("should return a sanitized player when squad_id is invalid", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        squad_id: "abc_123",
      });
      expect(result.squad_id).toBe("");
    });
    it("should return a sanitized player when first_name is not sanitized", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        first_name: "<script>alert(1)</script>",
      });
      expect(result.first_name).toBe("alert1");
    });
    it("should return a sanitized player when last_name is not sanitized", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        last_name: "<script>alert(1)</script>",
      });
      expect(result.last_name).toBe("alert1");
    });
    it("should return a sanitized player when average is not sanitized", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        average: 2.5,
      });
      expect(result.average).toBe(2.5); // not valid but sanitied
    });
    it("should return a sanitized player when average is not", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        average: "<script>alert(1)</script>" as any,
      });
      expect(result.average).toBe(-1); // not valid but sanitied
    });
    it("should return a sanitized player when lane is not sanitized", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        lane: "abc" as any,
      });
      expect(result.lane).toBe(0); // not valid but sanitied
    });
    it("should return a sanitized player when position is not sanitized", () => {
      const result = sanitizePlayer({
        ...byePlayer,
        position: "<script>alert(1)</script>",
      });
      expect(result.position).toBe("alert1"); // not valid but sanitied
    });
  });

  describe("validatePlayer function - regular player", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should return ErrorCode.NONE when passed a valid player", () => {
      const result = validatePlayer(mockPlayer);
      expect(result).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.NONE when all fields are properly sanitied", () => {
      const toSanitize = {
        ...mockPlayer,
        first_name: "<script>alert(1)</script>",
        last_name: "   Last Name ***",
        position: "<a>A",
      };
      const result = validatePlayer(toSanitize);
      expect(result).toBe(ErrorCode.NONE);
    });
    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const result = validatePlayer({
        ...mockPlayer,
        id: null as any,
      });
      expect(result).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const result = validatePlayer({
        ...mockPlayer,
        id: "abc_123",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("validatePlayer function - bye player", () => {
    it("should return ErrorCode.NONE when passed a valid bye player", () => {
      const result = validatePlayer(byePlayer);
      expect(result).toBe(ErrorCode.NONE);
    });
    // no sanitization - only valid values are:
    //   id - valid bye id
    //   first_name - Bye
    //   last_name - null
    //   average - 0
    //   lane - null
    //   position - null
    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const result = validatePlayer({
        ...byePlayer,
        id: null as any,
      });
      expect(result).toBe(ErrorCode.MISSING_DATA);
    });
    it("should return ErrorCode.INVALID_DATA when id is invalid", () => {
      const result = validatePlayer({
        ...byePlayer,
        id: "abc_123",
      });
      expect(result).toBe(ErrorCode.INVALID_DATA);
    });
  });

  describe("validatePlayers function", () => {
    const allPlayers = [...mockPlayers, byePlayer];
    const byeIndex = allPlayers.length - 1;

    it("should return ErrorCode.NONE when passed valid players", () => {
      const result = validatePlayers(allPlayers);
      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.players.length).toBe(allPlayers.length);
    });
    it("should return ErrorCode.NONE when properly sanitize players", () => {
      const toSanitize = cloneDeep(allPlayers);
      toSanitize[0].first_name = "<script>alert(1)</script>";
      toSanitize[0].last_name = "   Last Name ***";
      toSanitize[0].position = "<a>A";
      const result = validatePlayers(toSanitize);
      expect(result.errorCode).toBe(ErrorCode.NONE);
      expect(result.players.length).toBe(allPlayers.length);
    });
    it("should return ErrorCode.INVALID_DATA when all squad ids do not match", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[1].squad_id = "sqd_0123456789abcdef0123456789abcdef";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(1);
    });
    it("should return ErrorCode.MISSING_DATA when id is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].id = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when id is invalid", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[1].id = "abc_123";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(1);
    });
    it("should return ErrorCode.MISSING_DATA when first_name is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].first_name = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when first_name is blank", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].first_name = "";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when last_name is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].last_name = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when last_name is blank", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].last_name = "";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when average is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].average = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when lane is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].lane = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when position is missing", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].position = null as any;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.MISSING_DATA when position is blank", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].position = "";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.MISSING_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when first name is too long", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].first_name = "a".repeat(maxFirstNameLength + 1);
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when last name is too long", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].last_name = "a".repeat(maxLastNameLength + 1);
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when average is too high", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].average = maxAverage + 1;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when average is too low", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].average = -1;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when lane is too high", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].lane = maxStartLane + 1;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when lane is too low", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].lane = 0;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it("should return ErrorCode.INVALID_DATA when position is too long", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[0].position = "AA";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(0);
    });
    it('should return ErrorCode.INVALID_DATA when bye player first name is not "Bye"', () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[byeIndex].first_name = "Not Bye";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(invalidData.length - 1);
    });
    it("should return ErroCode.InvalidData when bye player last name is not null", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[byeIndex].last_name = "Not null";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(invalidData.length - 1);
    });
    it("should return ErrorCode.INVALID_DATA when bye player average is not 0", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[byeIndex].average = 1;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(invalidData.length - 1);
    });
    it("should return ErrorCode.INVALID_DATA when bye player lane is not null", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[byeIndex].lane = 1;
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(invalidData.length - 1);
    });
    it("should return ErrorCode.INVALID_DATA when bye player position is not null", () => {
      const invalidData = cloneDeep(allPlayers);
      invalidData[byeIndex].position = "A";
      const result = validatePlayers(invalidData);
      expect(result.errorCode).toBe(ErrorCode.INVALID_DATA);
      expect(result.players.length).toBe(invalidData.length - 1);
    });
  });
});
