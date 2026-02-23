import axios from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import {
  deleteAllPlayersForSquad,
  deleteAllPlayersForTmnt,
  deletePlayer,
  getAllPlayersForSquad,
  getAllPlayersForTmnt,
  postManyPlayers,
  postPlayer,  
  putPlayer,  
} from "@/lib/db/players/dbPlayers";
import type { playerType } from "@/lib/types/types";
import { blankPlayer } from "@/lib/db/initVals";

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi;
const manyUrl = url + "/many";
const playerUrl = url + "/player/";
const squadUrl = url + "/squad/";
const tmntUrl = url + "/tmnt/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const playerId = "ply_000fd8bbd9e34d34a7fa90b4111c6e40";

const manyPlayers: playerType[] = [
  {
    ...blankPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: "A",
  },
  {
    ...blankPlayer,
    id: "ply_be57bef21fc64d199c2f6de4408bd136",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 1,
    position: "B",
  },
];

const validPlayer: playerType = {
  ...manyPlayers[0],
};

describe("non standard throw cases", () => {

  describe("getAllPlayersForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "Unexpected status 500 when fetching players"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(tmntId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "getAllPlayersForTmnt failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "getAllPlayersForTmnt failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPlayersForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.get.mockResolvedValue({
        status: 500,
        data: {},
      });

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "Unexpected status 500 when fetching players"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining(squadId),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "getAllPlayersForSquad failed: Network Error"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "getAllPlayersForSquad failed: testing 123"
      );

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postPlayer - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "Error posting player"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPlayer),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "postPlayer failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "postPlayer failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("postManyPlayers - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 201", async () => {
      mockedAxios.post.mockResolvedValueOnce({
        status: 200,
        data: {},
      });

      await expect(postManyPlayers(manyPlayers)).rejects.toThrow(
        "Error posting players"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        manyUrl,
        JSON.stringify(manyPlayers),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postManyPlayers(manyPlayers)).rejects.toThrow(
        "postManyPlayers failed: Network Error"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.post.mockRejectedValueOnce("testing 123");

      await expect(postManyPlayers(manyPlayers)).rejects.toThrow(
        "postManyPlayers failed: testing 123"
      );

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putPlayer - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.put.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "Error putting player"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        playerUrl + validPlayer.id,
        JSON.stringify(validPlayer),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "putPlayer failed: Network Error"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.put.mockRejectedValueOnce("testing 123");

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "putPlayer failed: testing 123"
      );

      expect(mockedAxios.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deletePlayer - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "Error deleting player"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(playerUrl + playerId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "deletePlayer failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "deletePlayer failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPlayersForSquad - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPlayersForSquad(squadId)).rejects.toThrow(
        "Error deleting players for squad"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(squadUrl + squadId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPlayersForSquad(squadId)).rejects.toThrow(
        "deleteAllPlayersForSquad failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPlayersForSquad(squadId)).rejects.toThrow(
        "deleteAllPlayersForSquad failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });

  describe("deleteAllPlayersForTmnt - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.delete.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(deleteAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "Error deleting players for tmnt"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
      expect(mockedAxios.delete).toHaveBeenCalledWith(tmntUrl + tmntId, {
        withCredentials: true,
      });
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deleteAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPlayersForTmnt failed: Network Error"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.delete.mockRejectedValueOnce("testing 123");

      await expect(deleteAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "deleteAllPlayersForTmnt failed: testing 123"
      );

      expect(mockedAxios.delete).toHaveBeenCalledTimes(1);
    });
  });
});
