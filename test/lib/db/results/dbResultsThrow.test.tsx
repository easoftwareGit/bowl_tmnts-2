import axios from "axios";
import { baseResultsApi } from "@/lib/db/apiPaths";
import { testBaseResultsApi } from "../../../testApi";
import { getGameResultsForDiv, getGameResultsForTmnt } from "@/lib/db/results/dbResults";

const url = testBaseResultsApi.startsWith("undefined")
  ? baseResultsApi
  : testBaseResultsApi; 

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = 'div_578834e04e5e4885bbae79229d8b96e8';
const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';

describe("non standard throw cases", () => { 

  describe("getGameResultsForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching games"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getGameResultsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching games"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

})