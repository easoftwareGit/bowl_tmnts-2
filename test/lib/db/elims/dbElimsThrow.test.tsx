import { publicApi, privateApi } from "@/lib/api/axios";
import { baseElimsApi } from "@/lib/api/apiPaths";
import { testBaseElimsApi } from "../../../../test/testApi";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import {
  deleteElim,
  getAllElimsForSquad,
  getAllElimsForTmnt,
  postElim,
  putElim,
} from "@/lib/db/elims/dbElims";

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

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;
const elimUrl = url + "/elim/";
const tmntUrl = url + "/tmnt/";
const squadUrl = url + "/squad/";

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const elimId = "elm_45d884582e7042bb95b4818ccdd9974c";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const manyElims: elimType[] = [
  {
    ...initElim,
    id: "elm_01758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: divId,
    sort_order: 1,
    start: 1,
    games: 3,
    fee: "5",
  },
  {
    ...initElim,
    id: "elm_02758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: divId,
    sort_order: 2,
    start: 4,
    games: 3,
    fee: "5",
  },
];

const validElim: elimType = {
  ...manyElims[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllElimsForSquad - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimsForSquad(squadId)).rejects.toThrow(
        "getAllElimsForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimsForSquad(squadId)).rejects.toThrow(
        "getAllElimsForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });
  });

  describe("getAllElimsForTmnt - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimsForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimsForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });
  });

  describe("postElim - non standard throw cases", () => {
    it("should throw an error when response.data.elim is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postElim(validElim)).rejects.toThrow("Error posting elim");

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElim)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postElim(validElim)).rejects.toThrow(
        "postElim failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElim)
      );
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postElim(validElim)).rejects.toThrow(
        "postElim failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElim)
      );
    });
  });

  describe("putElim - non standard throw cases", () => {
    it("should throw an error when response.data.elim is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putElim(validElim)).rejects.toThrow("Error putting elim");

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        elimUrl + validElim.id,
        JSON.stringify(validElim)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putElim(validElim)).rejects.toThrow(
        "putElim failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        elimUrl + validElim.id,
        JSON.stringify(validElim)
      );
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putElim(validElim)).rejects.toThrow(
        "putElim failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        elimUrl + validElim.id,
        JSON.stringify(validElim)
      );
    });
  });

  describe("deleteElim - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteElim(elimId)).rejects.toThrow("Error deleting elim");

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(elimUrl + elimId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteElim(elimId)).rejects.toThrow(
        "deleteElim failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(elimUrl + elimId);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteElim(elimId)).rejects.toThrow(
        "deleteElim failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(elimUrl + elimId);
    });
  });
});
