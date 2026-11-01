import { privateApi } from "@/lib/api/axios";
import { baseGamesApi } from "@/lib/api/apiPaths";
import { testBaseGamesApi } from "../../../testApi";
import { getAllGamesForSquad, upsertGamesForSquad } from "@/lib/db/games/dbGames";
import type { gameType } from "@/lib/types/types";
import { blankGame } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  privateApi: {
    get: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPrivateGet = privateApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseGamesApi
  ? testBaseGamesApi
  : baseGamesApi;

const squadUrl = url + "/squad/";

const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const game1: gameType = {
  ...blankGame,
  id: "gam_00000000000000000000000000000001",
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
  squad_id: squadId,
  game_num: 1,
  score: 200,
};

// These test what dbGames.ts does today. Where the current behavior is
// probably not what is wanted, the test says so; update it when the
// source is fixed.
describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPrivateGet.mockReset();
    mockPrivatePut.mockReset();
  });

  describe("getAllGamesForSquad - non standard throw cases", () => {
    // current: data.games.map runs outside the try, so a TypeError escapes
    // without the "getAllGamesForSquad failed:" prefix
    it("should throw a TypeError when response.data.games is missing", async () => {
      mockPrivateGet.mockResolvedValue({
        status: 200,
        data: {},
      });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(TypeError);

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw a TypeError when response.data is null", async () => {
      mockPrivateGet.mockResolvedValue({
        status: 200,
        data: null,
      });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(TypeError);
    });

    it("should throw a TypeError when response.data.games is not an array", async () => {
      mockPrivateGet.mockResolvedValue({
        status: 200,
        data: { games: "not an array" },
      });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(TypeError);
    });

    it("should throw with custom message if privateApi.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: Network Error"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: testing 123"
      );
    });
  });

  describe("upsertGamesForSquad - non standard throw cases", () => {
    // current: response.data.games is returned as is, so a missing
    // games array resolves to undefined instead of throwing
    it("should resolve to undefined when response.data.games is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        status: 200,
        data: {},
      });

      await expect(upsertGamesForSquad(squadId, [game1])).resolves.toBeUndefined();

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        squadUrl + squadId,
        JSON.stringify([game1])
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        status: 200,
        data: null,
      });

      await expect(upsertGamesForSquad(squadId, [game1])).rejects.toThrow(
        /^upsertGamesForSquad failed: /
      );
    });

    // current: no mapping, so strings from the API stay strings and
    // fields not sent by the API are not filled from blankGame
    it("should return response.data.games without mapping", async () => {
      const apiGames = [
        { id: game1.id, player_id: game1.player_id, squad_id: squadId, game_num: "1", score: "200" },
      ];
      mockPrivatePut.mockResolvedValue({
        status: 200,
        data: { games: apiGames },
      });

      const games = await upsertGamesForSquad(squadId, [game1]);

      expect(games).toEqual(apiGames);
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(upsertGamesForSquad(squadId, [game1])).rejects.toThrow(
        "upsertGamesForSquad failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(upsertGamesForSquad(squadId, [game1])).rejects.toThrow(
        "upsertGamesForSquad failed: testing 123"
      );
    });

    // current: games.filter throws a TypeError, which the catch wraps
    it("should throw an error when games is null", async () => {
      await expect(
        upsertGamesForSquad(squadId, null as unknown as gameType[])
      ).rejects.toThrow(/^upsertGamesForSquad failed: /);

      expect(mockPrivatePut).not.toHaveBeenCalled();
    });
  });
});
