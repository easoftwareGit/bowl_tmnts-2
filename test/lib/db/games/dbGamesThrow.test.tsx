import { privateApi } from "@/lib/api/axios";
import { baseGamesApi } from "@/lib/api/apiPaths";
import { testBaseGamesApi } from "../../../../test/testApi";
import { getAllGamesForSquad, upsertGamesForSquad } from "@/lib/db/games/dbGames";
import { mockGames } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseGamesApi
  ? testBaseGamesApi
  : baseGamesApi;
const gamesSuadUrl = url + "/squad/";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  privateApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPrivateGet = privateApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// const mockedAxios = axios as jest.Mocked<typeof axios>;

const squadId = "sqd_7116ce5f80164830830a7157eb093396";

describe("non standard throw cases", () => { 

  describe("getAllGamesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockPrivateGet.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching games"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(
        expect.stringContaining(squadId),        
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: Network Error"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: testing 123"
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("upsertGamesForSquad - non standard throw cases", () => {
    
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockPrivatePut.mockResolvedValue({   
        status: 500,
        data: {},
      });

      await expect(upsertGamesForSquad(mockGames[0].squad_id, mockGames)).rejects.toThrow(
        "upsertGamesForSquad failed: Unexpected status 500 when upserting games"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        gamesSuadUrl + mockGames[0].squad_id,
        JSON.stringify(mockGames),
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(upsertGamesForSquad(mockGames[0].squad_id, mockGames)).rejects.toThrow(
        "upsertGamesForSquad failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(upsertGamesForSquad(mockGames[0].squad_id, mockGames)).rejects.toThrow(
        "upsertGamesForSquad failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw when squad id is invalid", async () => {

      await expect(
        upsertGamesForSquad("invalid", mockGames)
      ).rejects.toThrow(
        "upsertGamesForSquad failed: Invalid squad id"
      );

      expect(mockPrivatePut).not.toHaveBeenCalled();
    });

    it("should throw when games contain different squad ids", async () => {

      const invalidGames = mockGames.map((game) => ({
        ...game,
      }));

      invalidGames[0].squad_id = "sqd_different12345678901234567890";

      await expect(
        upsertGamesForSquad(mockGames[0].squad_id, invalidGames)
      ).rejects.toThrow(
        "upsertGamesForSquad failed: All games must have passed squad id"
      );

      expect(mockPrivatePut).not.toHaveBeenCalled();
    });    
  });

})