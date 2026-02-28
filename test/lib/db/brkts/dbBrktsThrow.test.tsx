import axios from "axios";
import { baseBrktsApi } from "@/lib/api/apiPaths";
import { testBaseBrktsApi } from "../../../testApi";
import type { brktType } from "@/lib/types/types";
import { initBrkt } from "@/lib/db/initVals";
import { deleteAllBrktsForDiv, deleteAllBrktsForSquad, deleteAllBrktsForTmnt, deleteBrkt, getAllBrktsForTmnt, postBrkt, postManyBrkts, putBrkt } from "@/lib/db/brkts/dbBrkts";

const url = testBaseBrktsApi.startsWith("undefined")
  ? baseBrktsApi
  : testBaseBrktsApi; 
const oneBrktUrl = url + "/brkt/";
const squadUrl = url + "/squad/";
const divUrl = url + "/div/";
const tmntUrl = url + "/tmnt/";
const manyUrl = url + "/many";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const brktId = "brk_ce24c5cc04f6463d89f24e6e19a12601"
const divId = "div_1f42042f9ef24029a0a2d48cc276a087";
const squadId = 'sqd_1a6c885ee19a49489960389193e8f819';
const tmntId = 'tmt_56d916ece6b50e6293300248c6792316';

const manyBrkts: brktType[] = [
  {
    ...initBrkt,
    id: "brk_ce24c5cc04f6463d89f24e6e19a12601",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
    div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
    sort_order: 1,
    start: 1,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
  },
  {
    ...initBrkt,
    id: "brk_ce24c5cc04f6463d89f24e6e19a12602",
    squad_id: "sqd_3397da1adc014cf58c44e07c19914f72",
    div_id: "div_66d39a83d7a84a8c85d28d8d1b2c7a90",
    sort_order: 2,
    start: 2,
    games: 3,
    players: 8,
    fee: '5',
    first: '25',
    second: '10',
    admin: '5',
    fsa: '40',
  },
];
const validBrkt = manyBrkts[0];

describe("non standard throw cases", () => { 

  describe("getAllBrktsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching brkts"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postBrkt - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "Error posting brkt"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validBrkt),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "postBrkt failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postBrkt(validBrkt)).rejects.toThrow(
        "postBrkt failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("postManyBrkts - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyBrkts(manyBrkts)).rejects.toThrow(
        "Error posting brkts"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyBrkts),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyBrkts(manyBrkts)).rejects.toThrow(
        "postManyBrkts failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyBrkts(manyBrkts)).rejects.toThrow(
        "postManyBrkts failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putBrkt - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "Error putting brkt"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        oneBrktUrl + validBrkt.id,
        JSON.stringify(validBrkt),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "putBrkt failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putBrkt(validBrkt)).rejects.toThrow(
        "putBrkt failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteBrkt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteBrkt(brktId)).rejects.toThrow(
        "Error deleting brkt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(oneBrktUrl + brktId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteBrkt(brktId)).rejects.toThrow(
        "deleteBrkt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteBrkt(brktId)).rejects.toThrow(
        "deleteBrkt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktsForSquad(squadId)).rejects.toThrow(
        "Error deleting brkts for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktsForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktsForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktsForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktsForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });  

  describe("deleteAllBrktsForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktsForDiv(divId)).rejects.toThrow(
        "Error deleting brkts for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktsForDiv(divId)).rejects.toThrow(
        "deleteAllBrktsForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktsForDiv(divId)).rejects.toThrow(
        "deleteAllBrktsForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });  

  describe("deleteAllBrktsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting brkts for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });  

})