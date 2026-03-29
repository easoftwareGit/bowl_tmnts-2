import { publicApi } from "@/lib/api/axios";
import {
  getGameResultsForDiv,
  getGameResultsForTmnt,
} from "@/lib/db/results/dbResults";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;

const divId = "div_578834e04e5e4885bbae79229d8b96e8";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getGameResultsForDiv - non standard throw cases", () => {
    it("should throw an error when response.data.games is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: Invalid API response: missing games"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(divId)
      );
    });

    it("should throw an error when response.data is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({});

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: Invalid API response: missing games"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(divId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getGameResultsForDiv(divId)).rejects.toThrow(
        "getGameResultsForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getGameResultsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.games is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({
        data: {},
      });

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: Invalid API response: missing games"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw an error when response.data is missing", async () => {
      mockedPublicApi.get.mockResolvedValue({});

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: Invalid API response: missing games"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getGameResultsForTmnt(tmntId)).rejects.toThrow(
        "getGameResultsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });
});
