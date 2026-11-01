import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowls, upsertBowl } from "@/lib/db/bowls/dbBowls";
import type { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    put: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;

const oneBowlUrl = url + "/bowl/";

const testBowlId = "bwl_012342f8b85942929f2584318b3d49a2";
const testBowlName = "Test Bowl";

const bowlToUpsert: bowlType = {
  ...initBowl,
  id: testBowlId,
  bowl_name: testBowlName,
  city: "Somehwere",
  state: "CA",
  url: "https://www.google.com",
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPublicGet.mockReset();
    mockPrivatePut.mockReset();
  });

  describe("getBowls - non standard throw cases", () => {
    it("should throw an error when response.data.bowls is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: Invalid bowls response"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(url);
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: Invalid bowls response"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getBowls()).rejects.toThrow(
        "getBowls failed: testing 123"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("upsertBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(upsertBowl(bowlToUpsert)).rejects.toThrow(
        "upsertBowl failed: Error upserting bowl"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        oneBowlUrl + bowlToUpsert.id,
        JSON.stringify(bowlToUpsert)
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePut.mockResolvedValue({
        data: null,
      });

      await expect(upsertBowl(bowlToUpsert)).rejects.toThrow(
        "upsertBowl failed: Error upserting bowl"
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(upsertBowl(bowlToUpsert)).rejects.toThrow(
        "upsertBowl failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(upsertBowl(bowlToUpsert)).rejects.toThrow(
        "upsertBowl failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw before calling the API when the bowl id is invalid", async () => {
      await expect(
        upsertBowl({ ...bowlToUpsert, id: "invalid" })
      ).rejects.toThrow("Invalid bowl data");

      expect(mockPrivatePut).not.toHaveBeenCalled();
    });
  });
});
