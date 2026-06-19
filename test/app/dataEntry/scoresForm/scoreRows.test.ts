import {
  scoreEntryData,
  extractGameScores,
  populateScoreRows,
} from "@/app/dataEntry/scoresForm/scoreRows";

import {
  mockTmntFullData,
  mockGames,
  squadId1,
  playerId1,
  playerId2,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";


// const mockBtDbUuid = jest.fn();
const mockIsValidBtDbId = jest.fn();

// IMPORTANT: mock btDbUuid so tests don't depend on random UUIDs
jest.mock("@/lib/uuid", () => {
  let counters: Record<string, number> = {};

  return {
    __esModule: true,
    btDbUuid: (prefix: string) => {
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}_${counters[prefix]}`;
    },
    // helper for resetting between tests (not used in app code)
    __resetCounters: () => {
      counters = {};
    },
  };
});

jest.mock(
  "@/lib/validation/validation",
  () => ({
    isValidBtDbId: (...args: unknown[]) =>
      mockIsValidBtDbId(...args),
  }),
);

describe("scoreRows", () => {

  beforeEach(() => {
    jest.clearAllMocks();

    mockIsValidBtDbId.mockReturnValue(
      true,
    );
  });

  describe("scoreEntryData", () => {

    it("contains expected default values", () => {
      expect(scoreEntryData).toEqual({
        id: "",
        player_id: "",
        first_name: "",
        last_name: "",
        average: 0,
        lanePos: "",
        total: null,
        plus_minus: null,
      });
    });

  });

  describe("extractGameScores", () => {

    it("returns empty array when no scores changed", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      const result = extractGameScores(
        rows,
        mockGames,
        squadId1,
      );

      expect(result).toEqual([]);
    });

    it("returns edited game when score changed", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      rows[0].game_1 = 300;

      const result = extractGameScores(
        rows,
        mockGames,
        squadId1,
      );

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        player_id: playerId1,
        game_num: 1,
        score: 300,
      });
    }); 

    it("creates a new game when score did not previously exist", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        [],
      );

      rows[0].game_1 = 250;

      const result = extractGameScores(
        rows,
        [],
        squadId1,
      );

      expect(result).toHaveLength(1);

      expect(result[0]).toMatchObject({
        squad_id: squadId1,
        player_id: playerId1,
        game_num: 1,
        score: 250,
      });

      expect(result[0].id).toMatch(/^gam_/);
    });

    it("ignores null scores", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        [],
      );

      const result = extractGameScores(
        rows,
        [],
        squadId1,
      );

      expect(result).toEqual([]);
    });

    it("ignores blank string scores", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        [],
      );

      rows[0].game_1 = "";

      const result = extractGameScores(
        rows,
        [],
        squadId1,
      );

      expect(result).toEqual([]);
    });

  });

  describe("populateScoreRows", () => {

    it("creates one score row for each player", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      expect(rows).toHaveLength(
        mockTmntFullData.players.length,
      );
    });

    it("copies player information", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      expect(rows[0]).toMatchObject({
        id: playerId1,
        player_id: playerId1,
        first_name: "John",
        last_name: "Doe",
        average: 220,
        lanePos: "29-A",
      });
    });  

    it("creates all game columns", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        [],
      );

      expect(rows[0]).toHaveProperty(
        "game_1",
      );

      expect(rows[0]).toHaveProperty(
        "game_6",
      );
    });  

    it("loads existing game scores", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      expect(rows[0].game_1).toBe(201);
      expect(rows[0].game_2).toBe(202);
      expect(rows[0].game_6).toBe(206);
    });  

    it("calculates total score", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        mockGames,
      );

      expect(rows[0].total).toBe(
        1221,
      );
    });  

    it("skips players with invalid ids", () => {
      mockIsValidBtDbId.mockImplementation(
        (id: string) =>
          id.startsWith("ply"),
      );

      const data = {
        ...mockTmntFullData,
        players: [
          ...mockTmntFullData.players,
          {
            ...mockTmntFullData.players[0],
            id: "bad_id",
          },
        ],
      };

      const rows = populateScoreRows(
        data,
        mockGames,
      );

      expect(rows).toHaveLength(
        mockTmntFullData.players.length,
      );
    });  

    it("initializes totals when no games exist", () => {
      const rows = populateScoreRows(
        mockTmntFullData,
        [],
      );

      expect(rows[0].total).toBe(0);
      expect(rows[0].plus_minus).toBe(0);
    });

  });  

});