import { publicApi } from "@/lib/api/axios";
import {
  getAllBrktSeedsForBrkt,
  getAllBrktSeedsForDiv,
  getAllBrktSeedsForOneBrkt,
  getAllBrktSeedsForSquad,
  getAllBrktSeedsForTmnt,
  getBrktSeed,
} from "@/lib/db/brktSeeds/dbBrktSeeds";

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

const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const oneBrktId = "obk_557f12f3875f42baa29fdbd22ee7f2f4";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllBrktSeedsForTmnt - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktSeedsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/tmnt/${tmntId}`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktSeedsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllBrktSeedsForSquad - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "getAllBrktSeedsForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/squad/${squadId}`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "getAllBrktSeedsForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllBrktSeedsForDiv - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "getAllBrktSeedsForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/div/${divId}`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "getAllBrktSeedsForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllBrktSeedsForBrkt - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "getAllBrktSeedsForBrkt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/brkt/${brktId}`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "getAllBrktSeedsForBrkt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllBrktSeedsForOneBrkt - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "getAllBrktSeedsForOneBrkt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/oneBrkt/${oneBrktId}`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "getAllBrktSeedsForOneBrkt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getBrktSeed - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBrktSeed(oneBrktId, 0)).rejects.toThrow(
        "getBrktSeed failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(`/brktSeed/${oneBrktId}/0`)
      );
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getBrktSeed(oneBrktId, 0)).rejects.toThrow(
        "getBrktSeed failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });
});