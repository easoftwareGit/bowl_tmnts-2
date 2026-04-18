import { publicApi, privateApi } from "@/lib/api/axios";
import { baseOneBrktsApi } from "@/lib/api/apiPaths";
import { testBaseOneBrktsApi } from "../../../testApi";
import {
  deleteOneBrkt,
  getAllOneBrktsForBrkt,
  getAllOneBrktsForDiv,
  getAllOneBrktsForSquad,
  getAllOneBrktsForTmnt,
  getOneBrkt,
  postOneBrkt,
} from "@/lib/db/oneBrkts/dbOneBrkts";
import type { oneBrktType } from "@/lib/types/types";
import { blankOneBrkt } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseOneBrktsApi
  ? testBaseOneBrktsApi
  : baseOneBrktsApi;
  
const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const oneBrktId = "obk_557f12f3875f42baa29fdbd22ee7f2f4";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const manyOneBrkts: oneBrktType[] = [
  {
    ...blankOneBrkt,
    id: "obk_b0b2bc5682f042269cf0aaa8c32b25b8",
    brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
    bindex: 0,
  },
  {
    ...blankOneBrkt,
    id: "obk_b1b2bc5682f042269cf0aaa8c32b25b8",
    brkt_id: "brk_12344698f47e4d64935547923e2bdbfb",
    bindex: 1,
  },
];

const validOneBrkt: oneBrktType = {
  ...manyOneBrkts[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllOneBrktsForTmnt() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkts is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllOneBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllOneBrktsForTmnt failed: Error fetching oneBrkts"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllOneBrktsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllOneBrktsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllOneBrktsForSquad() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkts is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllOneBrktsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsForSquad failed: Error fetching oneBrkts"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsForSquad(squadId)).rejects.toThrow(
        "getAllOneBrktsForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllOneBrktsForDiv() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkts is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllOneBrktsForDiv(divId)).rejects.toThrow(
        "getAllOneBrktsForDiv failed: Error fetching oneBrkts"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(divId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsForDiv(divId)).rejects.toThrow(
        "getAllOneBrktsForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsForDiv(divId)).rejects.toThrow(
        "getAllOneBrktsForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllOneBrktsForBrkt() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkts is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getAllOneBrktsForBrkt(brktId)).rejects.toThrow(
        "getAllOneBrktsForBrkt failed: Error fetching oneBrkts"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(brktId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllOneBrktsForBrkt(brktId)).rejects.toThrow(
        "getAllOneBrktsForBrkt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllOneBrktsForBrkt(brktId)).rejects.toThrow(
        "getAllOneBrktsForBrkt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getOneBrkt() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkt is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getOneBrkt(oneBrktId)).rejects.toThrow(
        "getOneBrkt failed: Error fetching oneBrkt"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(oneBrktId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getOneBrkt(oneBrktId)).rejects.toThrow(
        "getOneBrkt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getOneBrkt(oneBrktId)).rejects.toThrow(
        "getOneBrkt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postOneBrkt() - non standard throw cases", () => {
    it("should throw an error when response.data.oneBrkt is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      });

      await expect(postOneBrkt(validOneBrkt)).rejects.toThrow(
        "postOneBrkt failed: Error posting oneBrkt"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validOneBrkt)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postOneBrkt(validOneBrkt)).rejects.toThrow(
        "postOneBrkt failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postOneBrkt(validOneBrkt)).rejects.toThrow(
        "postOneBrkt failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteOneBrkt() - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      });

      await expect(deleteOneBrkt(oneBrktId)).rejects.toThrow(
        "deleteOneBrkt failed: Error deleting oneBrkt"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        expect.stringContaining(oneBrktId)
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteOneBrkt(oneBrktId)).rejects.toThrow(
        "deleteOneBrkt failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteOneBrkt(oneBrktId)).rejects.toThrow(
        "deleteOneBrkt failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});
