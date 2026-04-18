import { publicApi, privateApi } from "@/lib/api/axios";
import { basePotEntriesApi } from "@/lib/api/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import type { potEntryType } from "@/lib/types/types";
import { blankPotEntry } from "@/lib/db/initVals";
import {
  deletePotEntry,
  getAllPotEntriesForDiv,
  getAllPotEntriesForSquad,
  getAllPotEntriesForTmnt,
  postPotEntry,
  putPotEntry,
} from "@/lib/db/potEntries/dbPotEntries";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBasePotEntriesApi
  ? testBasePotEntriesApi
  : basePotEntriesApi;

const potEntryUrl = url + "/potEntry/";

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

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const potEntryId = "pen_01be0472be3d476ea1caa99dd05953fa";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyPotEntries: potEntryType[] = [
  {
    ...blankPotEntry,
    id: "pen_01be0472be3d476ea1caa99dd05953fa",
    pot_id: "pot_a9fd8f787de942a1a92aaa2df3e7c185",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "20",
  },
  {
    ...blankPotEntry,
    id: "pen_02be0472be3d476ea1caa99dd05953fa",
    pot_id: "pot_a9fd8f787de942a1a92aaa2df3e7c185",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "20",
  },
];

const validPotEntry: potEntryType = {
  ...manyPotEntries[0],
};

describe("non standard throw cases", () => {
  describe("getAllPotEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return [] when response.data.potEntries is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllPotEntriesForTmnt(tmntId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllPotEntriesForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllPotEntriesForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPotEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return [] when response.data.potEntries is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllPotEntriesForDiv(divId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(divId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForDiv(divId)).rejects.toThrow(
        "getAllPotEntriesForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForDiv(divId)).rejects.toThrow(
        "getAllPotEntriesForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPotEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return [] when response.data.potEntries is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllPotEntriesForSquad(squadId)).resolves.toEqual([]);

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "getAllPotEntriesForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "getAllPotEntriesForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postPotEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.potEntry is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "Error posting potEntry"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPotEntry)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "postPotEntry failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "postPotEntry failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putPotEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.potEntry is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "Error putting potEntry"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        potEntryUrl + validPotEntry.id,
        JSON.stringify(validPotEntry)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "putPotEntry failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "putPotEntry failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deletePotEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "Error deleting potEntry"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        potEntryUrl + potEntryId
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "deletePotEntry failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "deletePotEntry failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});