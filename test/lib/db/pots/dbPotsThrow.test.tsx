import { publicApi, privateApi } from "@/lib/api/axios";
import { basePotsApi } from "@/lib/api/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import type { potCategoriesTypes, potType } from "@/lib/types/types";
import { blankPot } from "@/lib/db/initVals";
import {
  deletePot,
  getAllPotsForSquad,
  getAllPotsForTmnt,
  postPot,
  putPot,
} from "@/lib/db/pots/dbPots";

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;
const potUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

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

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const potId = "pot_761fb6d8a9a04cb4b3372e212da2a3b0";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyPots: potType[] = [
  {
    ...blankPot,
    id: "pot_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
    div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
    sort_order: 1,
    fee: "20",
    pot_type: "Game" as potCategoriesTypes,
  },
  {
    ...blankPot,
    id: "pot_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: "sqd_853edbcc963745b091829e3eadfcf064",
    div_id: "div_621bfee84e774d5a9dc2e9b6bdc5d31c",
    sort_order: 2,
    fee: "10",
    pot_type: "Last Game" as potCategoriesTypes,
  },
];

const validPot: potType = {
  ...manyPots[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPotsForSquad - non standard throw cases", () => {
    it("should throw an error when response.data is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: undefined,
      } as any);

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "getAllPotsForSquad failed: No data returned from API"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "getAllPotsForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "getAllPotsForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });
  });

  describe("getAllPotsForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: undefined,
      } as any);

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "getAllPotsForTmnt failed: No data returned from API"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "getAllPotsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "getAllPotsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });
  });

  describe("postPot - non standard throw cases", () => {
    it("should throw an error when response.data.pot is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postPot(validPot)).rejects.toThrow("postPot failed: Error posting pot");

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPot)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPot(validPot)).rejects.toThrow(
        "postPot failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPot)
      );
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postPot(validPot)).rejects.toThrow(
        "postPot failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPot)
      );
    });
  });

  describe("putPot - non standard throw cases", () => {
    it("should throw an error when response.data.pot is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putPot(validPot)).rejects.toThrow("putPot failed: Error putting pot");

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        potUrl + validPot.id,
        JSON.stringify(validPot)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPot(validPot)).rejects.toThrow(
        "putPot failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        potUrl + validPot.id,
        JSON.stringify(validPot)
      );
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putPot(validPot)).rejects.toThrow(
        "putPot failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        potUrl + validPot.id,
        JSON.stringify(validPot)
      );
    });
  });

  describe("deletePot - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deletePot(potId)).rejects.toThrow(
        "deletePot failed: Error deleting pot"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(potUrl + potId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePot(potId)).rejects.toThrow(
        "deletePot failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(potUrl + potId);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePot(potId)).rejects.toThrow(
        "deletePot failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(potUrl + potId);
    });
  });
});