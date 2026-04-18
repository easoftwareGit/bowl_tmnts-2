import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import {
  deleteBrktEntry,
  postBrktEntry,
  putBrktEntry,
} from "@/lib/db/brktEntries/dbBrktEntries";
import type { brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockPrivatePost = privateApi.post as jest.Mock;
const mockPrivatePut = privateApi.put as jest.Mock;
const mockPrivateDelete = privateApi.delete as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseBrktEntriesApi
  ? testBaseBrktEntriesApi
  : baseBrktEntriesApi;  
const brktEntryUrl = url + "/brktEntry/" // ||  `${url}/brktEntry/`;

const brktEntryId = "ben_093a0902e01e46dbbe9f111acefc17da";

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("postBrktEntry - non standard throw cases", () => {
    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: "ben_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      num_brackets: 7,
      num_refunds: 1,
      fee: "45",
      time_stamp: 1739259269537,
    };

    it("should throw an error when response.data.brktEntry is missing", async () => {
      mockPrivatePost.mockResolvedValueOnce({
        data: {},
      });

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Error posting brktEntry"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(
        url,
        JSON.stringify(validBrktEntry)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: testing 123"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBrktEntry - non standard throw cases", () => {
    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: "ben_0123c6c5556e407291c4b5666b2dccd7",
      brkt_id: "brk_aa3da3a411b346879307831b6fdadd5f",
      player_id: "ply_a01758cff1cc4bab9d9133e661bd49b0",
      num_brackets: 10,
      num_refunds: 1,
      fee: "50",
      time_stamp: 1739259269537,
    };

    it("should throw an error when response.data.brktEntry is missing", async () => {
      mockPrivatePut.mockResolvedValueOnce({
        data: {},
      });

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Error putting brktEntry"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
      expect(mockPrivatePut).toHaveBeenCalledWith(
        brktEntryUrl + validBrktEntry.id,
        JSON.stringify(validBrktEntry)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockPrivatePut.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Network Error"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockPrivatePut.mockRejectedValueOnce("testing 123");

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: testing 123"
      );

      expect(mockPrivatePut).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBrktEntry - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockPrivateDelete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: Error deleting brktEntry"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
      expect(mockPrivateDelete).toHaveBeenCalledWith(brktEntryUrl + brktEntryId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockPrivateDelete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: Network Error"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockPrivateDelete.mockRejectedValueOnce("testing 123");

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: testing 123"
      );

      expect(mockPrivateDelete).toHaveBeenCalledTimes(1);
    });
  });
});
