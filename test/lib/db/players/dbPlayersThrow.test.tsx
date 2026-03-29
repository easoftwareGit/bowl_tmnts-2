import { publicApi, privateApi } from "@/lib/api/axios";
import { basePlayersApi } from "@/lib/api/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import {
  deletePlayer,
  getAllPlayersForSquad,
  getAllPlayersForTmnt,
  postPlayer,
  putPlayer,
} from "@/lib/db/players/dbPlayers";
import type { playerType } from "@/lib/types/types";
import { blankPlayer } from "@/lib/db/initVals";

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi;
const playerUrl = url + "/player/";

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
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("getAllPlayersForTmnt - non standard throw cases", () => {
    it("should throw an error when response.data.players is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "getAllPlayersForTmnt failed: Error fetching players"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(expect.stringContaining(tmntId));
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "getAllPlayersForTmnt failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPlayersForTmnt(tmntId)).rejects.toThrow(
        "getAllPlayersForTmnt failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getAllPlayersForSquad - non standard throw cases", () => {
    it("should throw an error when response.data.players is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "getAllPlayersForSquad failed: Error fetching players"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(expect.stringContaining(squadId));
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "getAllPlayersForSquad failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getAllPlayersForSquad(squadId)).rejects.toThrow(
        "getAllPlayersForSquad failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("postPlayer - non standard throw cases", () => {
    it("should throw an error when response.data.player is missing", async () => {
      mockedPrivateApi.post.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "postPlayer failed: Error posting player"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.post).toHaveBeenCalledWith(
        url,
        JSON.stringify(validPlayer)
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce(new Error("Network Error"));

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "postPlayer failed: Network Error"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockedPrivateApi.post.mockRejectedValueOnce("testing 123");

      await expect(postPlayer(validPlayer)).rejects.toThrow(
        "postPlayer failed: testing 123"
      );

      expect(mockedPrivateApi.post).toHaveBeenCalledTimes(1);
    });
  });

  describe("putPlayer - non standard throw cases", () => {
    it("should throw an error when response.data.player is missing", async () => {
      mockedPrivateApi.put.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "putPlayer failed: Error putting player"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.put).toHaveBeenCalledWith(
        playerUrl + validPlayer.id,
        JSON.stringify(validPlayer)
      );
    });

    it("should throw with custom message if privateApi.put rejects", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce(new Error("Network Error"));

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "putPlayer failed: Network Error"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.put rejects with non-error", async () => {
      mockedPrivateApi.put.mockRejectedValueOnce("testing 123");

      await expect(putPlayer(validPlayer)).rejects.toThrow(
        "putPlayer failed: testing 123"
      );

      expect(mockedPrivateApi.put).toHaveBeenCalledTimes(1);
    });
  });

  describe("deletePlayer - non standard throw cases", () => {
    it("should throw an error when response.data.count is missing", async () => {
      mockedPrivateApi.delete.mockResolvedValueOnce({
        data: {},
      } as any);

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "deletePlayer failed: Error deleting player"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.delete).toHaveBeenCalledWith(playerUrl + playerId);
    });

    it("should throw with custom message if privateApi.delete rejects", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce(new Error("Network Error"));

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "deletePlayer failed: Network Error"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.delete rejects with non-error", async () => {
      mockedPrivateApi.delete.mockRejectedValueOnce("testing 123");

      await expect(deletePlayer(playerId)).rejects.toThrow(
        "deletePlayer failed: testing 123"
      );

      expect(mockedPrivateApi.delete).toHaveBeenCalledTimes(1);
    });
  });
});
