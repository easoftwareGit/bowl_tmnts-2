import { publicApi, privateApi } from "@/lib/api/axios";
import { baseElimEntriesApi } from "@/lib/api/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import {
  deleteElimEntry,
  getAllElimEntriesForElim,
  getAllElimEntriesForDiv,
  getAllElimEntriesForSquad,
  getAllElimEntriesForTmnt,
  postElimEntry,
  putElimEntry,
} from "@/lib/db/elimEntries/dbElimEntries";
import type { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";

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

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseElimEntriesApi
  ? testBaseElimEntriesApi
  : baseElimEntriesApi;

const elimEntryUrl = url + "/elimEntry/";

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const elimEntryId = "een_01de0472be3d476ea1caa99dd05953fa";
const elimId = "elm_b4c3939adca140898b1912b75b3725f8";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyElimEntries: elimEntryType[] = [
  {
    ...initElimEntry,
    id: "een_01de0472be3d476ea1caa99dd05953fa",
    elim_id: "elm_b4c3939adca140898b1912b75b3725f8",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "5",
  },
  {
    ...initElimEntry,
    id: "een_02de0472be3d476ea1caa99dd05953fa",
    elim_id: "elm_4f176545e4294a0292732cccada91b9d",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "5",
  },
];

const validElimEntry: elimEntryType = {
  ...manyElimEntries[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllElimEntriesForTmnt - non standard throw cases", () => {
    it("should return empty array when response data has no elimEntries", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllElimEntriesForTmnt(tmntId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllElimEntriesForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllElimEntriesForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForSquad - non standard throw cases", () => {
    it("should return empty array when response data has no elimEntries", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllElimEntriesForSquad(squadId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "getAllElimEntriesForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "getAllElimEntriesForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForDiv - non standard throw cases", () => {
    it("should return empty array when response data has no elimEntries", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllElimEntriesForDiv(divId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(divId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimEntriesForDiv(divId)).rejects.toThrow(
        "getAllElimEntriesForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimEntriesForDiv(divId)).rejects.toThrow(
        "getAllElimEntriesForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForElim - non standard throw cases", () => {
    it("should return empty array when response data has no elimEntries", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllElimEntriesForElim(elimId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(elimId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimEntriesForElim(elimId)).rejects.toThrow(
        "getAllElimEntriesForElim failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimEntriesForElim(elimId)).rejects.toThrow(
        "getAllElimEntriesForElim failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postElimEntry - non standard throw cases", () => {
    it("should throw an error when response.data.elimEntry is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "Error posting elimEntry"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElimEntry)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "postElimEntry failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "postElimEntry failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putElimEntry - non standard throw cases", () => {
    it("should throw an error when response.data.elimEntry is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "Error putting elimEntry"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        elimEntryUrl + validElimEntry.id,
        JSON.stringify(validElimEntry)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "putElimEntry failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "putElimEntry failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteElimEntry - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "Error deleting elimEntry"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        elimEntryUrl + elimEntryId
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "deleteElimEntry failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "deleteElimEntry failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});