import { publicApi, privateApi } from "@/lib/api/axios";
import { baseBrktsApi } from "@/lib/api/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import type { brktType } from "@/lib/types/types";
import {
  mockTmntFullData,
  brktId1,
  tmntId,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  deleteBrkt,
  getAllBrktsForTmnt,
  postBrkt,
  putBrkt,
} from "@/lib/db/brkts/dbBrkts";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi;
const oneBrktUrl = url + "/brkt/";

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const manyBrkts: brktType[] = [
  {
    ...mockTmntFullData.brkts[0],
  },
  {
    ...mockTmntFullData.brkts[1],
  },
];

const validBrkt = manyBrkts[0];

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBrktsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.brkts is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktsForTmnt failed: Error fetching brkts"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postBrkt - non standard throw cases", () => {
    it("should throw an error when response.data.brkt is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "postBrkt failed: Error posting brkt"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validBrkt)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "postBrkt failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "postBrkt failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBrkt - non standard throw cases", () => {
    it("should throw an error when response.data.brkt is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "putBrkt failed: Error putting brkt"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        oneBrktUrl + validBrkt.id,
        JSON.stringify(validBrkt)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "putBrkt failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "putBrkt failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBrkt - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteBrkt(brktId1)).rejects.toThrow(
        "deleteBrkt failed: Error deleting brkt"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        oneBrktUrl + brktId1
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteBrkt(brktId1)).rejects.toThrow(
        "deleteBrkt failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteBrkt(brktId1)).rejects.toThrow(
        "deleteBrkt failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});