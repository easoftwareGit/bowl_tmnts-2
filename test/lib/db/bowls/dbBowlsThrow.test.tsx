import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBowlsApi } from "@/lib/api/apiPaths";
import { testBaseBowlsApi } from "../../../testApi";
import { getBowl, getBowls, postBowl, putBowl } from "@/lib/db/bowls/dbBowls";
import type { bowlType } from "@/lib/types/types";
import { initBowl } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivatePost = privateApi.post as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseBowlsApi
  ? testBaseBowlsApi
  : baseBowlsApi;

const oneBowlUrl =  url + '/bowl/';

const notFoundId = "bwl_00000000000000000000000000000000";
const testBowlId = "bwl_012342f8b85942929f2584318b3d49a2";
const testBowlName = "Test Bowl";

const bowlToPost: bowlType = {
  ...initBowl,
  id: testBowlId,
  bowl_name: testBowlName,
  city: "Somehwere",
  state: "CA",
  url: "https://www.google.com",
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
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

  describe("getBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: Invalid bowl response"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(oneBowlUrl + notFoundId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(getBowl(notFoundId)).rejects.toThrow(
        "getBowl failed: testing 123"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });
  });

  describe("postBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPrivatePost.mockResolvedValue({
        data: {},
      });

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: Error posting bowl"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(
        url,
        JSON.stringify(bowlToPost)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(postBowl(bowlToPost)).rejects.toThrow(
        "postBowl failed: testing 123"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBowl - non standard throw cases", () => {
    it("should throw an error when response.data.bowl is missing", async () => {
      mockPrivatePut.mockResolvedValue({
        data: {},
      });

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: Error putting bowl"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        oneBowlUrl + bowlToPost.id,
        JSON.stringify(bowlToPost)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(putBowl(bowlToPost)).rejects.toThrow(
        "putBowl failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });
  });
});