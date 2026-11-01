// Tests for src/lib/db/games/dbGames.ts using a mocked axios instance module.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { baseGamesApi } from "@/lib/api/apiPaths";
import { testBaseGamesApi } from "../../../testApi";
import { getAllGamesForSquad, upsertGamesForSquad } from "@/lib/db/games/dbGames";
import { blankGame } from "@/lib/db/initVals";
import type { gameType } from "@/lib/types/types";
import { cloneDeep } from "lodash";
import { maxGames, maxScore } from "@/lib/validation/constants";

// Replace the axios instance with mock functions each test can control
jest.mock("@/lib/api/axios", () => ({
  privateApi: { get: jest.fn(), put: jest.fn() },
}));
const mockGet = privateApi.get as jest.Mock;
const mockPut = privateApi.put as jest.Mock;

// same url logic as dbGames.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseGamesApi
  ? testBaseGamesApi
  : baseGamesApi;
const squadUrl = url + "/squad/";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const squad2Id = "sqd_1a6c885ee19a49489960389193e8f819";
const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const tmntId = "tmt_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

// Looks like the error axios rejects with for a non-2xx response.
// AxiosError extends Error, and its message is
// "Request failed with status code <status>".
const axiosError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    code: status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    response: { status, data: {} },
  });

const player1Id = "ply_88be0472be3d476ea1caa99dd05953fa";
const player2Id = "ply_be57bef21fc64d199c2f6de4408bd136";
const mockGames: gameType[] = [
  { ...blankGame, id: "gam_00000000000000000000000000000001", player_id: player1Id, squad_id: squadId, game_num: 1, score: 200 },
  { ...blankGame, id: "gam_00000000000000000000000000000002", player_id: player1Id, squad_id: squadId, game_num: 2, score: 210 },
  { ...blankGame, id: "gam_00000000000000000000000000000003", player_id: player1Id, squad_id: squadId, game_num: 3, score: 220 },
  { ...blankGame, id: "gam_00000000000000000000000000000004", player_id: player2Id, squad_id: squadId, game_num: 1, score: 180 },
  { ...blankGame, id: "gam_00000000000000000000000000000005", player_id: player2Id, squad_id: squadId, game_num: 2, score: 190 },
  { ...blankGame, id: "gam_00000000000000000000000000000006", player_id: player2Id, squad_id: squadId, game_num: 3, score: 300 },
];

// what the API sends back (plain JSON, only the api fields)
const apiGameFrom = (game: gameType) => ({
  id: game.id,
  player_id: game.player_id,
  squad_id: game.squad_id,
  game_num: game.game_num,
  score: game.score,
});

// what getAllGamesForSquad returns for an API game
const mappedGameFrom = (game: gameType): gameType => ({
  ...blankGame,
  ...apiGameFrom(game),
});

describe("dbGames", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockGet.mockReset();
    mockPut.mockReset();
  });

  describe("getAllGamesForSquad()", () => {
    it("should return an array of games", async () => {
      mockGet.mockResolvedValue({
        status: 200,
        data: { games: mockGames.map(apiGameFrom) },
      });

      const games = await getAllGamesForSquad(squadId);

      expect(games).toHaveLength(mockGames.length);
      expect(games).toEqual(mockGames.map(mappedGameFrom));
      games.forEach((game) => {
        expect(game.squad_id).toBe(squadId);
      });
    });

    it("should fill non api fields from blankGame and drop extra api fields", async () => {
      mockGet.mockResolvedValue({
        status: 200,
        data: { games: [{ ...apiGameFrom(mockGames[0]), extra: "not mapped" }] },
      });

      const games = await getAllGamesForSquad(squadId);

      expect(games).toEqual([mappedGameFrom(mockGames[0])]);
      expect(games[0]).not.toHaveProperty("extra");
    });

    it("should call the squad url once with the private api", async () => {
      mockGet.mockResolvedValue({ status: 200, data: { games: [] } });

      await getAllGamesForSquad(squadId);

      expect(mockGet).toHaveBeenCalledTimes(1);
      expect(mockGet).toHaveBeenCalledWith(squadUrl + squadId);
      expect(mockPut).not.toHaveBeenCalled();
    });

    it("should return an empty array if squad has no games", async () => {
      mockGet.mockResolvedValue({ status: 200, data: { games: [] } });

      const games = await getAllGamesForSquad(squad2Id);

      expect(games).toEqual([]);
    });

    it("should return an empty array if squad not found", async () => {
      mockGet.mockResolvedValue({ status: 200, data: { games: [] } });

      const games = await getAllGamesForSquad(notFoundSquadId);

      expect(games).toEqual([]);
    });

    it("should throw when the API call fails", async () => {
      mockGet.mockRejectedValue(axiosError(500));

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        new Error("getAllGamesForSquad failed: Request failed with status code 500")
      );
    });

    it("should throw when the API answers with a status other than 200", async () => {
      mockGet.mockResolvedValue({ status: 204, data: { games: [] } });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        new Error("Unexpected status 204 when fetching games")
      );
    });

    it("should throw error if squadId is invalid", async () => {
      await expect(getAllGamesForSquad("invalidId")).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if squadId is valid, but not a squad id", async () => {
      await expect(getAllGamesForSquad(tmntId)).rejects.toThrow(
        new Error("Invalid squad id")
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should throw error if squadId is null", async () => {
      await expect(
        getAllGamesForSquad(null as unknown as string)
      ).rejects.toThrow(new Error("Invalid squad id"));
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe("upsertGamesForSquad()", () => {
    it("should upsert all games for a squad", async () => {
      mockPut.mockResolvedValue({
        status: 200,
        data: { games: mockGames.map(apiGameFrom) },
      });

      const games = await upsertGamesForSquad(squadId, mockGames);

      expect(games).toHaveLength(mockGames.length);
      expect(games).toEqual(mockGames.map(apiGameFrom));
    });

    it("should put the games as JSON to the squad url with the private api", async () => {
      mockPut.mockResolvedValue({
        status: 200,
        data: { games: mockGames.map(apiGameFrom) },
      });

      await upsertGamesForSquad(squadId, mockGames);

      expect(mockPut).toHaveBeenCalledTimes(1);
      expect(mockPut).toHaveBeenCalledWith(
        squadUrl + squadId,
        JSON.stringify(mockGames)
      );
      expect(mockGet).not.toHaveBeenCalled();
    });

    it("should upsert an empty array of games", async () => {
      mockPut.mockResolvedValue({ status: 200, data: { games: [] } });

      const games = await upsertGamesForSquad(squadId, []);

      expect(games).toEqual([]);
      expect(mockPut).toHaveBeenCalledWith(squadUrl + squadId, "[]");
    });

    it("should throw when the API call fails", async () => {
      mockPut.mockRejectedValue(axiosError(500));

      await expect(upsertGamesForSquad(squadId, mockGames)).rejects.toThrow(
        new Error("upsertGamesForSquad failed: Request failed with status code 500")
      );
    });

    it("should throw when the API answers with a status other than 200", async () => {
      mockPut.mockResolvedValue({ status: 201, data: { games: [] } });

      await expect(upsertGamesForSquad(squadId, mockGames)).rejects.toThrow(
        new Error("upsertGamesForSquad failed: Unexpected status 201 when upserting games")
      );
    });

    describe("invalid args - throws before calling the API", () => {
      const withGame1 = (changes: Partial<gameType>): gameType[] => {
        const games = cloneDeep(mockGames);
        games[1] = { ...games[1], ...changes };
        return games;
      };

      it.each([
        ["squadId is invalid", "invalid", mockGames, "Invalid squad id"],
        ["squadId is null", null as unknown as string, mockGames, "Invalid squad id"],
        ["squadId is valid, but not a squad id", userId, mockGames, "Invalid squad id"],
        ["squadId is valid, but does not appear in games", notFoundSquadId, mockGames, "All games must have passed squad id"],
        ["game data has invalid squad_id", squadId, withGame1({ squad_id: "invalid" }), "All games must have passed squad id"],
        ["game data has missing squad_id", squadId, withGame1({ squad_id: null as never }), "All games must have passed squad id"],
        ["game data has squad id, but not a valid squad id", squadId, withGame1({ squad_id: userId }), "All games must have passed squad id"],
        ["game data has valid but not found squad_id", squadId, withGame1({ squad_id: notFoundSquadId }), "All games must have passed squad id"],
        ["game data has more than 1 squad id", squadId, withGame1({ squad_id: squad2Id }), "All games must have passed squad id"],
      ])("should not upsert when %s", async (_desc, testSquadId, games, expected) => {
        await expect(upsertGamesForSquad(testSquadId, games)).rejects.toThrow(
          new Error(`upsertGamesForSquad failed: ${expected}`)
        );
        expect(mockPut).not.toHaveBeenCalled();
      });
    });

    // The route validates the data. With mocks, these cases become rejections
    // with the status the route answers (taken from the integration tests),
    // so each checks the error is passed on.
    describe("invalid data - route rejects", () => {
      const withGame1 = (changes: Partial<gameType>): gameType[] => {
        const games = cloneDeep(mockGames);
        games[1] = { ...games[1], ...changes };
        return games;
      };

      it.each([
        ["game data has invalid id", withGame1({ id: "invalid" }), 404],
        ["game data has missing id", withGame1({ id: null as never }), 404],
        ["game data has id, but not a valid game id", withGame1({ id: userId }), 404],
        ["game data has invalid player_id", withGame1({ player_id: "invalid" }), 404],
        ["game data has missing player_id", withGame1({ player_id: null as never }), 404],
        ["game data has player id, but not a valid player id", withGame1({ player_id: userId }), 404],
        ["game data has valid but not found player_id", withGame1({ player_id: notFoundPlayerId }), 409],
        ["game data has game_num too low", withGame1({ game_num: 0 }), 404],
        ["game data has game_num too high", withGame1({ game_num: maxGames + 1 }), 404],
        ["game data has missing game_num", withGame1({ game_num: null as never }), 404],
        ["game data has game_num not a number", withGame1({ game_num: "invalid" as never }), 404],
        ["game data has game_num not an integer", withGame1({ game_num: 1.1 }), 404],
        ["game data has score too low", withGame1({ score: -1 }), 404],
        ["game data has score too high", withGame1({ score: maxScore + 1 }), 404],
        ["game data has missing score", withGame1({ score: null as never }), 404],
        ["game data has score not a number", withGame1({ score: "invalid" as never }), 404],
        ["game data has score not an integer", withGame1({ score: 1.1 }), 404],
      ])("should not upsert when %s", async (_desc, games, status) => {
        mockPut.mockRejectedValue(axiosError(status));

        await expect(upsertGamesForSquad(squadId, games)).rejects.toThrow(
          new Error(`upsertGamesForSquad failed: Request failed with status code ${status}`)
        );
        expect(mockPut).toHaveBeenCalledTimes(1);
        expect(mockPut).toHaveBeenCalledWith(squadUrl + squadId, JSON.stringify(games));
      });
    });
  });
});
