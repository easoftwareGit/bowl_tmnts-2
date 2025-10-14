import axios from "axios";
import { baseElimEntriesApi } from "@/lib/db/apiPaths";
import { testBaseElimEntriesApi } from "../../../testApi";
import {
  deleteAllElimEntriesForElim,
  deleteAllElimEntriesForDiv,
  deleteAllElimEntriesForSquad,
  deleteAllElimEntriesForTmnt,
  deleteElimEntry,
  getAllElimEntriesForElim,
  getAllElimEntriesForDiv,
  getAllElimEntriesForSquad,
  getAllElimEntriesForTmnt,
  postElimEntry,
  postManyElimEntries,
  putElimEntry,
} from "@/lib/db/elimEntries/dbElimEntries";
import { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";

const url = testBaseElimEntriesApi.startsWith("undefined")
  ? baseElimEntriesApi
  : testBaseElimEntriesApi;
const elimEntryUrl = url + "/elimEntry/";
const elimUrl = url + "/elim/";
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const elimEntryId = "een_01de0472be3d476ea1caa99dd05953fa";
const elimId = "elm_b4c3939adca140898b1912b75b3725f8";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";


const manyElimEntries: elimEntryType[] = [
  {
    ...initElimEntry,
    id: 'een_01de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
  {
    ...initElimEntry,
    id: 'een_02de0472be3d476ea1caa99dd05953fa',
    elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
    player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
    fee: '5'
  },
];

const validElimEntry: elimEntryType = {
  ...manyElimEntries[0],
};

describe("non standard throw cases", () => {

  describe("getAllElimEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
  
    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });
  
      await expect(getAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching elimEntries"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
  
      await expect(getAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllElimEntriesForTmnt failed: Network Error"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");
  
      await expect(getAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "getAllElimEntriesForTmnt failed: testing 123"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
  
    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });
  
      await expect(getAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching elimEntries"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
  
      await expect(getAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "getAllElimEntriesForSquad failed: Network Error"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");
  
      await expect(getAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "getAllElimEntriesForSquad failed: testing 123"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
  
    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });
  
      await expect(getAllElimEntriesForDiv(divId)).rejects.toThrow(
        "Unexpected status 500 when fetching elimEntries"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(divId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
  
      await expect(getAllElimEntriesForDiv(divId)).rejects.toThrow(
        "getAllElimEntriesForDiv failed: Network Error"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");
  
      await expect(getAllElimEntriesForDiv(divId)).rejects.toThrow(
        "getAllElimEntriesForDiv failed: testing 123"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllElimEntriesForElim - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });
  
    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });
  
      await expect(getAllElimEntriesForElim(elimId)).rejects.toThrow(
        "Unexpected status 500 when fetching elimEntries"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(elimId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));
  
      await expect(getAllElimEntriesForElim(elimId)).rejects.toThrow(
        "getAllElimEntriesForElim failed: Network Error"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");
  
      await expect(getAllElimEntriesForElim(elimId)).rejects.toThrow(
        "getAllElimEntriesForElim failed: testing 123"
      );
  
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("postElimEntry - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "Error posting elimEntry"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElimEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "postElimEntry failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postElimEntry(validElimEntry)).rejects.toThrow(
        "postElimEntry failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyElimEntries - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyElimEntries(manyElimEntries)).rejects.toThrow(
        "Error posting elimEntries"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyElimEntries),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyElimEntries(manyElimEntries)).rejects.toThrow(
        "postManyElimEntries failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyElimEntries(manyElimEntries)).rejects.toThrow(
        "postManyElimEntries failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putElimEntry - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "Error putting elimEntry"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        elimEntryUrl + validElimEntry.id,
        JSON.stringify(validElimEntry),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "putElimEntry failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putElimEntry(validElimEntry)).rejects.toThrow(
        "putElimEntry failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteElimEntry - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "Error deleting elimEntry"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(elimEntryUrl + elimEntryId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "deleteElimEntry failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteElimEntry(elimEntryId)).rejects.toThrow(
        "deleteElimEntry failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("deleteAllElimEntriesForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "Error deleting elimEntries for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllElimEntriesForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimEntriesForSquad(squadId)).rejects.toThrow(
        "deleteAllElimEntriesForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimEntriesForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimEntriesForDiv(divId)).rejects.toThrow(
        "Error deleting elimEntries for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllElimEntriesForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimEntriesForDiv(divId)).rejects.toThrow(
        "deleteAllElimEntriesForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimEntriesForElim - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimEntriesForElim(elimId)).rejects.toThrow(
        "Error deleting elimEntries for elim"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(elimUrl + elimId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimEntriesForElim(elimId)).rejects.toThrow(
        "deleteAllElimEntriesForElim failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimEntriesForElim(elimId)).rejects.toThrow(
        "deleteAllElimEntriesForElim failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimEntriesForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "Error deleting elimEntries for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllElimEntriesForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimEntriesForTmnt(tmntId)).rejects.toThrow(
        "deleteAllElimEntriesForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})