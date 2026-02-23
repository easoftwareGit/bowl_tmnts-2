import axios from "axios";
import { baseDivEntriesApi } from "@/lib/db/apiPaths";
import { testBaseDivEntriesApi } from "../../../testApi";
import {
  deleteAllDivEntriesForDiv,
  deleteAllDivEntriesForSquad,
  deleteAllDivEntriesForTmnt,
  deleteDivEntry,
  getAllDivEntriesForDiv,
  getAllDivEntriesForSquad,
  getAllDivEntriesForTmnt,
  postDivEntry,
  postManyDivEntries,
  putDivEntry,
} from "@/lib/db/divEntries/dbDivEntries";
import type { divEntryType } from "@/lib/types/types";
import { initDivEntry } from "@/lib/db/initVals";

const url = testBaseDivEntriesApi.startsWith("undefined")
  ? baseDivEntriesApi
  : testBaseDivEntriesApi;
const divUrl = url + "/div/";
const divEntryUrl = url + "/divEntry/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";


jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divEntryId = "den_652fc6c5556e407291c4b5666b2dccd7";
const divId = 'div_f30aea2c534f4cfe87f4315531cef8ef'
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

  describe("getAllDivEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching divEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllDivEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllDivEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllDivEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching divEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "getAllDivEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "getAllDivEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllDivEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllDivEntriesForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching divEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllDivEntriesForDiv(divId)).rejects.toThrow(
        "getAllDivEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllDivEntriesForDiv(divId)).rejects.toThrow(
        "getAllDivEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postDivEntry - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "Error posting divEntry"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validDivEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "postDivEntry failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postDivEntry(validDivEntry)).rejects.toThrow(
        "postDivEntry failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyDivEntries - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyDivEntries(manyDivEntries)).rejects.toThrow(
        "Error posting divEntries"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyDivEntries),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyDivEntries(manyDivEntries)).rejects.toThrow(
        "postManyDivEntries failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyDivEntries(manyDivEntries)).rejects.toThrow(
        "postManyDivEntries failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putDivEntry - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "Error putting divEntry"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        divEntryUrl + validDivEntry.id,
        JSON.stringify(validDivEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "putDivEntry failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putDivEntry(validDivEntry)).rejects.toThrow(
        "putDivEntry failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("deleteDivEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "Error deleting divEntry"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divEntryUrl + divEntryId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "deleteDivEntry failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteDivEntry(divEntryId)).rejects.toThrow(
        "deleteDivEntry failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllDivEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "Error deleting divEntries for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllDivEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllDivEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllDivEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllDivEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllDivEntriesForDiv(divId)).rejects.toThrow(
        "Error deleting divEntries for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllDivEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllDivEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllDivEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllDivEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllDivEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "Error deleting divEntries for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllDivEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllDivEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})