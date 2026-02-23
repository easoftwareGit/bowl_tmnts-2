import axios from "axios";
import { basePotsApi } from "@/lib/db/apiPaths";
import { testBasePotsApi } from "../../../testApi";
import type { potCategoriesTypes, potType } from "@/lib/types/types";
import { blankPot } from "@/lib/db/initVals";
import { deleteAllPotsForDiv, deleteAllPotsForSquad, deleteAllPotsForTmnt, deletePot, getAllPotsForSquad, getAllPotsForTmnt, postManyPots, postPot, putPot } from "@/lib/db/pots/dbPots";

const url = testBasePotsApi.startsWith("undefined")
  ? basePotsApi
  : testBasePotsApi;
const divUrl = url + "/div/";  
const manyUrl = url + "/many";
const potUrl = url + "/pot/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = 'div_621bfee84e774d5a9dc2e9b6bdc5d31c';
const potId = "pot_761fb6d8a9a04cb4b3372e212da2a3b0";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";

const manyPots: potType[] = [
  {
    ...blankPot,
    id: "pot_01758d99c5494efabb3b0d273cf22e7a",
    squad_id: 'sqd_853edbcc963745b091829e3eadfcf064',
    div_id: 'div_621bfee84e774d5a9dc2e9b6bdc5d31c',
    sort_order: 1,
    fee: '20',
    pot_type: "Game" as potCategoriesTypes,
  },
  {
    ...blankPot,
    id: "pot_02758d99c5494efabb3b0d273cf22e7a",
    squad_id: 'sqd_853edbcc963745b091829e3eadfcf064',
    div_id: 'div_621bfee84e774d5a9dc2e9b6bdc5d31c',
    sort_order: 2,
    fee: '10',
    pot_type: "Last Game" as potCategoriesTypes,
  },
];

const validPot: potType = {
  ...manyPots[0]
}

describe("non standard throw cases", () => { 

  describe("getAllPotsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching pots"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "getAllPotsForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotsForSquad(squadId)).rejects.toThrow(
        "getAllPotsForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPotsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching pots"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "getAllPotsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPotsForTmnt(tmntId)).rejects.toThrow(
        "getAllPotsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postPot - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postPot(validPot)).rejects.toThrow(
        "Error posting pot"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPot),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPot(validPot)).rejects.toThrow(
        "postPot failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postPot(validPot)).rejects.toThrow(
        "postPot failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyPots - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyPots(manyPots)).rejects.toThrow(
        "Error posting pots"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyPots),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyPots(manyPots)).rejects.toThrow(
        "postManyPots failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyPots(manyPots)).rejects.toThrow(
        "postManyPots failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putPot - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putPot(validPot)).rejects.toThrow(
        "Error putting pot"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        potUrl + validPot.id,
        JSON.stringify(validPot),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPot(validPot)).rejects.toThrow(
        "putPot failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putPot(validPot)).rejects.toThrow(
        "putPot failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deletePot - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deletePot(potId)).rejects.toThrow(
        "Error deleting pot"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(potUrl + potId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePot(potId)).rejects.toThrow(
        "deletePot failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePot(potId)).rejects.toThrow(
        "deletePot failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotsForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotsForDiv(divId)).rejects.toThrow(
        "Error deleting pots for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotsForDiv(divId)).rejects.toThrow(
        "deleteAllPotsForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotsForDiv(divId)).rejects.toThrow(
        "deleteAllPotsForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotsForSquad(squadId)).rejects.toThrow(
        "Error deleting pots for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotsForSquad(squadId)).rejects.toThrow(
        "deleteAllPotsForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotsForSquad(squadId)).rejects.toThrow(
        "deleteAllPotsForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPotsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPotsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting pots for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPotsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPotsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPotsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPotsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})