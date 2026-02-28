import axios from "axios";
import { baseBrktEntriesApi } from "@/lib/api/apiPaths";
import { testBaseBrktEntriesApi } from "../../../testApi";
import {
  deleteAllBrktEntriesForBrkt,
  deleteAllBrktEntriesForDiv,
  deleteAllBrktEntriesForSquad,
  deleteAllBrktEntriesForTmnt,
  deleteBrktEntry,
  getAllBrktEntriesForBrkt,
  getAllBrktEntriesForDiv,
  getAllBrktEntriesForSquad,
  getAllBrktEntriesForTmnt,
  postBrktEntry,
  postManyBrktEntries,
  putBrktEntry,  
} from "@/lib/db/brktEntries/dbBrktEntries";
import type { brktEntryType } from "@/lib/types/types";
import { initBrktEntry } from "@/lib/db/initVals";

const url = testBaseBrktEntriesApi.startsWith("undefined")
  ? baseBrktEntriesApi
  : testBaseBrktEntriesApi;
const brktEntryUrl = url + "/brktEntry/";
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";   
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const brktId = "brk_5109b54c2cc44ff9a3721de42c80c8c1";
const brktEntryId = "ben_093a0902e01e46dbbe9f111acefc17da";

describe("non standard throw cases", () => { 

  describe('getAllBrktEntriesForTmnt - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });

  })

  describe('getAllBrktEntriesForDiv - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "getAllBrktEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "getAllBrktEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getAllBrktEntriesForBrkt - non standard throw cases', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(brktId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "getAllBrktEntriesForBrkt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "getAllBrktEntriesForBrkt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe('getAllBrktEntriesForSquad - non standard throw cases', () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktEntries"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "getAllBrktEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "getAllBrktEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postBrktEntry - non standard throw cases", () => {

    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: 'ben_0123c6c5556e407291c4b5666b2dccd7',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_brackets: 7,
      num_refunds: 1,
      fee: '45',
      time_stamp: 1739259269537
    }
  
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "Error posting brktEntry"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validBrktEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postBrktEntry(validBrktEntry)).rejects.toThrow(
        "postBrktEntry failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyBrktEntries - non standard throw cases", () => {
    const manyBrktEntries: brktEntryType[] = [
      {
        ...initBrktEntry,
        id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
        player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
        num_brackets: 4,
        num_refunds: 1,
        fee: '20',
        time_stamp: new Date().getTime(),
      },
      {
        ...initBrktEntry,
        id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
        brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
        player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        num_brackets: 4,
        fee: '20',
        time_stamp: new Date().getTime(),
      },
    ];

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyBrktEntries(manyBrktEntries)).rejects.toThrow(
        "Error posting brktEntries"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyBrktEntries),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyBrktEntries(manyBrktEntries)).rejects.toThrow(
        "postManyBrktEntries failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyBrktEntries(manyBrktEntries)).rejects.toThrow(
        "postManyBrktEntries failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBrktEntry - non standard throw cases", () => {

    const validBrktEntry: brktEntryType = {
      ...initBrktEntry,
      id: 'ben_0123c6c5556e407291c4b5666b2dccd7',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_a01758cff1cc4bab9d9133e661bd49b0',
      num_brackets: 10,
      num_refunds: 1,
      fee: '50',
      time_stamp: 1739259269537
    }
  
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "Error putting brktEntry"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        brktEntryUrl + validBrktEntry.id,
        JSON.stringify(validBrktEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putBrktEntry(validBrktEntry)).rejects.toThrow(
        "putBrktEntry failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBrktEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "Error deleting brktEntry"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(brktEntryUrl + brktEntryId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteBrktEntry(brktEntryId)).rejects.toThrow(
        "deleteBrktEntry failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "Error deleting brktEntries for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "Error deleting brktEntries for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllBrktEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllBrktEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktEntriesForBrkt - non standard throw cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "Error deleting brktEntries for brkt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(brktUrl + brktId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "deleteAllBrktEntriesForBrkt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktEntriesForBrkt(brktId)).rejects.toThrow(
        "deleteAllBrktEntriesForBrkt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "Error deleting brktEntries for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})
