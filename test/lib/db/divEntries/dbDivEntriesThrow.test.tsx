import { publicApi, privateApi } from "@/lib/api/axios";
import { baseDivEntriesApi } from "@/lib/api/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import {
  deleteDivEntry,
  getAllDivEntriesForDiv,
  getAllDivEntriesForSquad,
  getAllDivEntriesForTmnt,
  postDivEntry,
  putDivEntry,
} from "@/lib/db/divEntries/dbDivEntries";
import type { divEntryType } from "@/lib/types/types";
import { initDivEntry } from "@/lib/db/initVals";

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
const url = process.env.NODE_ENV === "test" && testBaseDivEntriesApi
  ? testBaseDivEntriesApi
  : baseDivEntriesApi;

const divEntryUrl = url + "/divEntry/";
const divUrl = url + "/div/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

const divEntryId = "den_652fc6c5556e407291c4b5666b2dccd7";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const squadId = "sqd_42be0f9d527e4081972ce8877190489d";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyDivEntries: divEntryType[] = [
  {
    ...initDivEntry,
    id: "den_652fc6c5556e407291c4b5666b2dccd7",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    fee: "80",
  },
  {
    ...initDivEntry,
    id: "den_ef36111c721147f7a2bf2702056947ce",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    fee: "80",
  },
];

const validDivEntry: divEntryType = {
  ...manyDivEntries[0],
};

describe("non standard throw cases", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllDivEntriesForTmnt - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllDivEntriesForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllDivEntriesForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(tmntUrl + tmntId);
    });
  });

  describe("getAllDivEntriesForSquad - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "getAllDivEntriesForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "getAllDivEntriesForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(squadUrl + squadId);
    });
  });

  describe("getAllDivEntriesForDiv - non standard throw cases", () => {
    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForDiv(divId)).rejects.toThrow(
        "getAllDivEntriesForDiv failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(divUrl + divId);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForDiv(divId)).rejects.toThrow(
        "getAllDivEntriesForDiv failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(divUrl + divId);
    });
  });

  describe("postDivEntry - non standard throw cases", () => {
    it("should throw an error when response.data.divEntry is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "Error posting divEntry"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDivEntry)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "postDivEntry failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDivEntry)
      );
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "postDivEntry failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDivEntry)
      );
    });
  });

  describe("putDivEntry - non standard throw cases", () => {
    it("should throw an error when response.data.divEntry is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "Error putting divEntry"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        divEntryUrl + validDivEntry.id,
        JSON.stringify(validDivEntry)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "putDivEntry failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        divEntryUrl + validDivEntry.id,
        JSON.stringify(validDivEntry)
      );
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "putDivEntry failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        divEntryUrl + validDivEntry.id,
        JSON.stringify(validDivEntry)
      );
    });
  });

  describe("deleteDivEntry - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "Error deleting divEntry"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        divEntryUrl + divEntryId
      );
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "deleteDivEntry failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        divEntryUrl + divEntryId
      );
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "deleteDivEntry failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(
        divEntryUrl + divEntryId
      );
    });
  });
});