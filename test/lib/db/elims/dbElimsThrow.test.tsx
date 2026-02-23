import axios from "axios";
import { baseElimsApi } from "@/lib/db/apiPaths";
import { testBaseElimsApi } from "../../../../test/testApi";
import type { elimType } from "@/lib/types/types";
import { initElim } from "@/lib/db/initVals";
import { deleteAllElimsForDiv, deleteAllElimsForSquad, deleteAllElimsForTmnt, deleteElim, getAllElimsForSquad, getAllElimsForTmnt, postElim, postManyElims, putElim } from "@/lib/db/elims/dbElims";

const url = testBaseElimsApi.startsWith("undefined")
  ? baseElimsApi
  : testBaseElimsApi;   
const divUrl = url + "/div/";
const elimUrl = url + "/elim/";
const manyUrl = url + "/many";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const divId = "div_f30aea2c534f4cfe87f4315531cef8ef";
const elimId = "elm_45d884582e7042bb95b4818ccdd9974c";
const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";

const manyElims: elimType[] = [
  {
    ...initElim,
    id: "elm_01758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: divId,
    sort_order: 1,
    start: 1,
    games: 3,
    fee: '5',
  },
  {
    ...initElim,
    id: "elm_02758d99c5494efabb3b0d273cf22e7b",
    squad_id: squadId,
    div_id: divId,
    sort_order: 2,
    start: 4,
    games: 3,
    fee: '5',
  },
];

const validElim: elimType = {
  ...manyElims[0],
};

describe("non standard throw cases", () => { 

  describe("getAllElimsForSquad - non standard throw cases", () => { 

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllElimsForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching elims"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimsForSquad(squadId)).rejects.toThrow(
        "getAllElimsForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimsForSquad(squadId)).rejects.toThrow(
        "getAllElimsForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("getAllElimsForTmnt - non standard throw cases", () => { 

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllElimsForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching elims"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllElimsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimsForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllElimsForTmnt(tmntId)).rejects.toThrow(
        "getAllElimsForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  })

  describe("postElim - non standard throw cases", () => { 

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postElim(validElim)).rejects.toThrow(
        "Error posting elim"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validElim),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postElim(validElim)).rejects.toThrow(
        "postElim failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postElim(validElim)).rejects.toThrow(
        "postElim failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyElims - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyElims(manyElims)).rejects.toThrow(
        "Error posting elims"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyElims),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyElims(manyElims)).rejects.toThrow(
        "postManyElims failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyElims(manyElims)).rejects.toThrow(
        "postManyElims failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putElim - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putElim(validElim)).rejects.toThrow(
        "Error putting elim"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        elimUrl + validElim.id,
        JSON.stringify(validElim),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putElim(validElim)).rejects.toThrow(
        "putElim failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putElim(validElim)).rejects.toThrow(
        "putElim failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });
  
  describe("deleteElim - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteElim(elimId)).rejects.toThrow(
        "Error deleting elim"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(elimUrl + elimId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteElim(elimId)).rejects.toThrow(
        "deleteElim failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteElim(elimId)).rejects.toThrow(
        "deleteElim failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimsForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimsForSquad(squadId)).rejects.toThrow(
        "Error deleting elims for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimsForSquad(squadId)).rejects.toThrow(
        "deleteAllElimsForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimsForSquad(squadId)).rejects.toThrow(
        "deleteAllElimsForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimsForDiv - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimsForDiv(divId)).rejects.toThrow(
        "Error deleting elims for div"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(divUrl + divId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimsForDiv(divId)).rejects.toThrow(
        "deleteAllElimsForDiv failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimsForDiv(divId)).rejects.toThrow(
        "deleteAllElimsForDiv failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllElimsForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllElimsForTmnt(tmntId)).rejects.toThrow(
        "Error deleting elims for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllElimsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllElimsForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllElimsForTmnt(tmntId)).rejects.toThrow(
        "deleteAllElimsForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

})