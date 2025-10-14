import axios from "axios";
import { baseGamesApi } from "@/lib/db/apiPaths";
import { testBaseGamesApi } from "../../../../test/testApi";
import { getAllGamesForSquad } from "@/lib/db/games/dbGames";

const url = testBaseGamesApi.startsWith("undefined")
  ? baseGamesApi
  : testBaseGamesApi;  
const squadUrl = url + "/squad/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const squadId = "sqd_7116ce5f80164830830a7157eb093396";

describe("non standard throw cases", () => { 

  describe("getAllGamesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching games"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllGamesForSquad(squadId)).rejects.toThrow(
        "getAllGamesForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

})