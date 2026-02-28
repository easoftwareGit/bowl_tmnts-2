import axios from "axios";
import { brktSeedsApi } from "@/lib/api/apiPaths";
import { testBrktSeedsApi } from "../../../testApi";
import type { brktSeedType } from "@/lib/types/types";
import { initBrktSeed } from "@/lib/db/initVals";
import { deleteAllBrktSeedsForBrkt, deleteAllBrktSeedsForDiv, deleteAllBrktSeedsForOneBrkt, deleteAllBrktSeedsForSquad, deleteAllBrktSeedsForTmnt, getAllBrktSeedsForBrkt, getAllBrktSeedsForDiv, getAllBrktSeedsForOneBrkt, getAllBrktSeedsForSquad, getAllBrktSeedsForTmnt, getBrktSeed, postManyBrktSeeds } from "@/lib/db/brktSeeds/dbBrktSeeds";

const url = testBrktSeedsApi.startsWith("undefined")
  ? brktSeedsApi
  : testBrktSeedsApi;  
const brktUrl = url + "/brkt/";
const divUrl = url + "/div/";
const oneBrktUrl = url + "/oneBrkt/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const brktId = 'brk_5109b54c2cc44ff9a3721de42c80c8c1';
const divId = 'div_f30aea2c534f4cfe87f4315531cef8ef';
const oneBrktId = 'obk_557f12f3875f42baa29fdbd22ee7f2f4';
const playerId = 'ply_88be0472be3d476ea1caa99dd05953fa';
const squadId = 'sqd_7116ce5f80164830830a7157eb093396';
const tmntId = 'tmt_fd99387c33d9c78aba290286576ddce5';
const userId = 'usr_01234567890123456789012345678901';

const manyBrktSeeds: brktSeedType[] = [
  {
    ...initBrktSeed,
    one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
    seed: 0,
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
  }, 
  {
    ...initBrktSeed,
    one_brkt_id: 'obk_b0b2bc5682f042269cf0aaa8c32b25b8',
    seed: 1,
    player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
  },
]
const validBrktSeed = manyBrktSeeds[0];

describe("non standard throw cases", () => { 

  describe('getAllBrktSeedsForTmnt - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktSeedsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "getAllBrktSeedsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getAllBrktSeedsForSquad - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "getAllBrktSeedsForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "getAllBrktSeedsForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getAllBrktSeedsForDiv - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "getAllBrktSeedsForDiv failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "getAllBrktSeedsForDiv failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getAllBrktSeedsForBrkt - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(brktId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "getAllBrktSeedsForBrkt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "getAllBrktSeedsForBrkt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getAllBrktSeedsForOneBrkt - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeeds"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(oneBrktId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "getAllBrktSeedsForOneBrkt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "getAllBrktSeedsForOneBrkt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe('getBrktSeed - non standard throw cases', () => { 
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getBrktSeed(oneBrktId, 0)).rejects.toThrow(
        "Unexpected status 500 when fetching brktSeed"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(oneBrktId + "/" + "0"),        
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getBrktSeed(oneBrktId, 0)).rejects.toThrow(
        "getBrktSeed failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getBrktSeed(oneBrktId, 0)).rejects.toThrow(
        "getBrktSeed failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("postManyBrktSeeds - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyBrktSeeds(manyBrktSeeds)).rejects.toThrow(
        "Error posting brktSeeds"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyBrktSeeds),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyBrktSeeds(manyBrktSeeds)).rejects.toThrow(
        "postManyBrktSeeds failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyBrktSeeds(manyBrktSeeds)).rejects.toThrow(
        "postManyBrktSeeds failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktSeedsForOneBrkt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "Error deleting brktSeeds for oneBrkt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        oneBrktUrl + oneBrktId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "deleteAllBrktSeedsForOneBrkt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktSeedsForOneBrkt(oneBrktId)).rejects.toThrow(
        "deleteAllBrktSeedsForOneBrkt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktSeedsForBrkt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "Error deleting brktSeeds for brkt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        brktUrl + brktId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "deleteAllBrktSeedsForBrkt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktSeedsForBrkt(brktId)).rejects.toThrow(
        "deleteAllBrktSeedsForBrkt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktSeedsForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "Error deleting brktSeeds for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "deleteAllBrktSeedsForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktSeedsForDiv(divId)).rejects.toThrow(
        "deleteAllBrktSeedsForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktSeedsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "Error deleting brktSeeds for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktSeedsForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktSeedsForSquad(squadId)).rejects.toThrow(
        "deleteAllBrktSeedsForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllBrktSeedsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting brktSeeds for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktSeedsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllBrktSeedsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllBrktSeedsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})