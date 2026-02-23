import axios from "axios";
import { basePotEntriesApi } from "@/lib/db/apiPaths";
import { testBasePotEntriesApi } from "../../../testApi";
import type { potEntryType } from "@/lib/types/types";
import { blankPotEntry } from "@/lib/db/initVals";
import { deleteAllPotEntriesForDiv, deleteAllPotEntriesForSquad, deleteAllPotEntriesForTmnt, deletePotEntry, getAllPotEntriesForDiv, getAllPotEntriesForSquad, getAllPotEntriesForTmnt, postManyPotEntries, postPotEntry, putPotEntry } from "@/lib/db/potEntries/dbPotEntries";

const url = testBasePotEntriesApi.startsWith("undefined")
  ? basePotEntriesApi
  : testBasePotEntriesApi;
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const potEntryUrl = url + "/potEntry/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";


jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const potEntryId = 'pen_01be0472be3d476ea1caa99dd05953fa'
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyPotEntries: potEntryType[] = [
  {
    ...blankPotEntry,
    id: 'pen_01be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_a9fd8f787de942a1a92aaa2df3e7c185',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '20'
  },
  {
    ...blankPotEntry,
    id: 'pen_02be0472be3d476ea1caa99dd05953fa',
    pot_id: 'pot_a9fd8f787de942a1a92aaa2df3e7c185',
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
    fee: '20'
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

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching potEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllPotEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllPotEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPotEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPotEntriesForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching potEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForDiv(divId)).rejects.toThrow(
        "getAllPotEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForDiv(divId)).rejects.toThrow(
        "getAllPotEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPotEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching potEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "getAllPotEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "getAllPotEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postPotEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "Error posting potEntry"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPotEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "postPotEntry failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postPotEntry(validPotEntry)).rejects.toThrow(
        "postPotEntry failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyPotEntries - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyPotEntries(manyPotEntries)).rejects.toThrow(
        "Error posting potEntries"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyPotEntries),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyPotEntries(manyPotEntries)).rejects.toThrow(
        "postManyPotEntries failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyPotEntries(manyPotEntries)).rejects.toThrow(
        "postManyPotEntries failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("putPotEntry - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "Error putting potEntry"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        potEntryUrl + validPotEntry.id,
        JSON.stringify(validPotEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "putPotEntry failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putPotEntry(validPotEntry)).rejects.toThrow(
        "putPotEntry failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deletePotEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "Error deleting potEntry"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(potEntryUrl + potEntryId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "deletePotEntry failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePotEntry(potEntryId)).rejects.toThrow(
        "deletePotEntry failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "Error deleting potEntries for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllPotEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllPotEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotEntriesForDiv(divId)).rejects.toThrow(
        "Error deleting potEntries for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllPotEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllPotEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "Error deleting potEntries for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPotEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPotEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})