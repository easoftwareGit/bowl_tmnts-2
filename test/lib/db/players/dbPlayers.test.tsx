import { AxiosError } from "axios";
import { publicApi, privateApi } from "@/lib/api/axios";
import { basePlayersApi } from "@/lib/api/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import {
  deletePlayer,
  getAllPlayersForSquad,
  getAllPlayersForTmnt,
  postPlayer,
  putPlayer,
  extractPlayers,
} from "@/lib/db/players/dbPlayers";

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar,
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode.

const url = testBasePlayersApi.startsWith("undefined")
  ? basePlayersApi
  : testBasePlayersApi;
const playerUrl = url + "/player/";

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const squadId = "sqd_7116ce5f80164830830a7157eb093396";
const notFoundId = "ply_00000000000000000000000000000000";
const notFoundTmntId = "tmt_00000000000000000000000000000000";
const notFoundSquadId = "sqd_00000000000000000000000000000000";
const userId = "usr_01234567890123456789012345678901";

const playersToGet: playerType[] = [
  {
    ...initPlayer,
    id: "ply_88be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Doe",
    average: 220,
    lane: 1,
    position: "A",
  },
  {
    ...initPlayer,
    id: "ply_be57bef21fc64d199c2f6de4408bd136",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "James",
    last_name: "Bennett",
    average: 221,
    lane: 1,
    position: "B",
  },
  {
    ...initPlayer,
    id: "ply_8bc2b34cf25e4081ba6a365e89ff49d8",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Olivia",
    last_name: "Morgan",
    average: 210,
    lane: 1,
    position: "C",
  },
  {
    ...initPlayer,
    id: "ply_89be0472be3d476ea1caa99dd05953fa",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Joan",
    last_name: "Doe",
    average: 200,
    lane: 1,
    position: "D",
  },
  {
    ...initPlayer,
    id: "ply_8b0fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "William",
    last_name: "Harris",
    average: 211,
    lane: 2,
    position: "E",
  },
  {
    ...initPlayer,
    id: "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "John",
    last_name: "Dope",
    average: 219,
    lane: 2,
    position: "F",
  },
  {
    ...initPlayer,
    id: "ply_bb1fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Jane",
    last_name: "Dope",
    average: 201,
    lane: 2,
    position: "G",
  },
  {
    ...initPlayer,
    id: "ply_bb2fd8bbd9e34d34a7fa90b4111c6e40",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Bob",
    last_name: "Smith",
    average: 222,
    lane: 2,
    position: "H",
  },
  {
    ...initPlayer,
    id: "bye_ad8539071682476db842c59a4ec62dc7",
    squad_id: "sqd_7116ce5f80164830830a7157eb093396",
    first_name: "Bye",
    last_name: null as any,
    average: 0,
    lane: null as any,
    position: null as any,
  },
];

describe("dbPlayers()", () => {
  const expectPlayerToMatch = (actual: playerType, expected: playerType) => {
    expect(actual.id).toEqual(expected.id);
    expect(actual.squad_id).toEqual(expected.squad_id);
    expect(actual.first_name).toEqual(expected.first_name);
    expect(actual.last_name).toEqual(expected.last_name);
    expect(actual.average).toEqual(expected.average);
    expect(actual.lane).toEqual(expected.lane);
    expect(actual.position).toEqual(expected.position);
  };

  const rePostPlayer = async (player: playerType) => {
    try {
      // if player already in database, then don't re-post
      const getResponse = await publicApi.get(playerUrl + player.id);
      const found = getResponse.data?.player;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.response?.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }

    try {
      // if not in database, then re-post
      const playerJSON = JSON.stringify(player);
      await privateApi.post(url, playerJSON);
    } catch (err) {
      if (err instanceof AxiosError) console.log(err.message);
    }
  };

  describe("extractPlayers", () => {
    it("should return an empty array when given an empty array", () => {
      const result = extractPlayers([]);
      expect(result).toEqual([]);
    });

    it("should correctly map raw players to playerType", () => {
      const rawPlayers = [
        {
          id: "ply_123",
          squad_id: "sqd_456",
          first_name: "John",
          last_name: "Doe",
          average: 200,
          lane: 12,
          position: "A",
          extraField: "ignore me",
        },
      ];

      const result = extractPlayers(rawPlayers);

      const expected: playerType = {
        ...initPlayer,
        id: "ply_123",
        squad_id: "sqd_456",
        first_name: "John",
        last_name: "Doe",
        average: 200,
        lane: 12,
        position: "A",
      };

      expect(result).toEqual([expected]);
    });

    it("should fill missing fields with defaults from blankPlayer", () => {
      const rawPlayers = [
        {
          id: "ply_111",
          squad_id: "sqd_222",
          first_name: "Alice",
          last_name: "Smith",
          average: 180,
          lane: 5,
          position: "B",
        },
      ];

      const result = extractPlayers(rawPlayers);

      expect(result[0].first_name_err).toBe("");
      expect(result[0].last_name_err).toBe("");
      expect(result[0].average_err).toBe("");
      expect(result[0].lane_err).toBe("");
      expect(result[0].position_err).toBe("");
    });

    it("should process multiple players", () => {
      const rawPlayers = [
        {
          id: "ply_1",
          squad_id: "sqd_1",
          first_name: "Bob",
          last_name: "Lee",
          average: 190,
          lane: 1,
          position: "C",
        },
        {
          id: "ply_2",
          squad_id: "sqd_1",
          first_name: "Carol",
          last_name: "White",
          average: 170,
          lane: 2,
          position: "D",
        },
      ];

      const result = extractPlayers(rawPlayers);

      expect(result).toHaveLength(2);
      expect(result[0].first_name).toBe("Bob");
      expect(result[1].first_name).toBe("Carol");
    });
  });

  describe("getAllPlayersForTmnt()", () => {
    it("should get all players for tmnt", async () => {
      const players = await getAllPlayersForTmnt(tmntId);

      expect(players).toHaveLength(playersToGet.length);

      for (const expectedPlayer of playersToGet) {
        const found = players.find((p) => p.id === expectedPlayer.id);
        expect(found).toBeDefined();
        if (found) {
          expectPlayerToMatch(found, expectedPlayer);
        }
      }
    });

    it("should return 0 players for not found tmnt", async () => {
      const players = await getAllPlayersForTmnt(notFoundTmntId);
      expect(players).toHaveLength(0);
    });

    it("should throw error if tmmt id is invalid", async () => {
      await expect(getAllPlayersForTmnt("test")).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      await expect(getAllPlayersForTmnt(notFoundSquadId)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });

    it("should throw error if tmnt id is null", async () => {
      await expect(getAllPlayersForTmnt(null as any)).rejects.toThrow(
        "Invalid tmnt id"
      );
    });
  });

  describe("getAllPlayersForSquad()", () => {
    it("should get all players for squad", async () => {
      const players = await getAllPlayersForSquad(squadId);

      expect(players).toHaveLength(playersToGet.length);

      for (let i = 0; i < players.length; i++) {
        expectPlayerToMatch(players[i], playersToGet[i]);
      }
    });

    it("should return 0 players for not found squad", async () => {
      const players = await getAllPlayersForSquad(notFoundSquadId);
      expect(players).toHaveLength(0);
    });

    it("should throw error if squad id is invalid", async () => {
      await expect(getAllPlayersForSquad("test")).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      await expect(getAllPlayersForSquad(notFoundTmntId)).rejects.toThrow(
        "Invalid squad id"
      );
    });

    it("should throw error if squad id is null", async () => {
      await expect(getAllPlayersForSquad(null as any)).rejects.toThrow(
        "Invalid squad id"
      );
    });
  });

  describe("postPlayer()", () => {
    const playerToPost: playerType = {
      ...initPlayer,
      id: "ply_000fd8bbd9e34d34a7fa90b4111c6e40",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "Jim",
      last_name: "Green",
      average: 201,
      lane: 3,
      position: "Z",
    };

    let createdPlayer = false;

    const deletePostedPlayer = async () => {
      const response = await publicApi.get(url);
      const players = response.data?.players ?? [];
      const toDel = players.find((p: playerType) => p.position === "Z");

      if (toDel) {
        try {
          await privateApi.delete(playerUrl + toDel.id);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    beforeAll(async () => {
      await deletePostedPlayer();
    });

    beforeEach(() => {
      createdPlayer = false;
    });

    afterEach(async () => {
      if (createdPlayer) {
        await deletePostedPlayer();
      }
    });

    it("should post one player", async () => {
      const postedPlayer = await postPlayer(playerToPost);

      createdPlayer = true;

      expect(postedPlayer).not.toBeNull();
      expectPlayerToMatch(postedPlayer, playerToPost);
    });

    it("should post a sanitzed player", async () => {
      const toSanitizse: playerType = {
        ...playerToPost,
        first_name: '<script>N</script>',
        last_name: "    abcdef***",
        average: 100,
        lane: 2,
        position: " Z*",
      };

      const postedPlayer = await postPlayer(toSanitizse);

      createdPlayer = true;

      expect(postedPlayer.id).toEqual(toSanitizse.id);
      expect(postedPlayer.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedPlayer.first_name).toEqual("scriptNscript");
      expect(postedPlayer.last_name).toEqual("abcdef");
      expect(postedPlayer.average).toEqual(toSanitizse.average);
      expect(postedPlayer.lane).toEqual(toSanitizse.lane);
      expect(postedPlayer.position).toEqual("Z");
    });

    it("should throw error when post a player if invalid player id", async () => {
      const invalidPlayer = {
        ...playerToPost,
        id: "test",
      };

      await expect(postPlayer(invalidPlayer)).rejects.toThrow(
        "Invalid player data"
      );
    });

    it("should throw error when post a player if got invalid data", async () => {
      const invalidPlayer = {
        ...playerToPost,
        lane: -1,
      };

      await expect(postPlayer(invalidPlayer)).rejects.toThrow(
        "postPlayer failed: Request failed with status code 422"
      );
    });

    it("should throw error when post a player if got null", async () => {
      await expect(postPlayer(null as any)).rejects.toThrow(
        "Invalid player data"
      );
    });

    it("should throw error when post a player if got not an object", async () => {
      await expect(postPlayer("test" as any)).rejects.toThrow(
        "Invalid player data"
      );
    });
  });

  describe("putPlayer()", () => {
    const playerToPut: playerType = {
      ...initPlayer,
      id: "ply_88be0472be3d476ea1caa99dd05953fa",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "Steve",
      last_name: "Smith",
      average: 176,
      lane: 5,
      position: "C",
    };

    const putUrl = playerUrl + playerToPut.id;

    const resetPlayer: playerType = {
      ...initPlayer,
      id: "ply_88be0472be3d476ea1caa99dd05953fa",
      squad_id: "sqd_7116ce5f80164830830a7157eb093396",
      first_name: "John",
      last_name: "Doe",
      average: 220,
      lane: 1,
      position: "A",
    };

    const doReset = async () => {
      try {
        const playerJSON = JSON.stringify(resetPlayer);
        await privateApi.put(putUrl, playerJSON);
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    };

    let didPut = false;

    beforeAll(async () => {
      await doReset();
    });

    beforeEach(() => {
      didPut = false;
    });

    afterEach(async () => {
      if (!didPut) return;
      await doReset();
    });

    it("should put a player", async () => {
      const puttedPlayer = await putPlayer(playerToPut);

      didPut = true;

      expect(puttedPlayer).not.toBeNull();
      expect(puttedPlayer.first_name).toBe(playerToPut.first_name);
      expect(puttedPlayer.last_name).toBe(playerToPut.last_name);
      expect(puttedPlayer.average).toBe(playerToPut.average);
      expect(puttedPlayer.lane).toBe(playerToPut.lane);
      expect(puttedPlayer.position).toBe(playerToPut.position);
    });

    it("should put a sanitized player", async () => {
      const toSanitizse: playerType = {
        ...playerToPut,
        first_name: '<script>N</script>',
        last_name: "    abcdef***",
        average: 100,
        lane: 2,
        position: " Z*",
      };

      const puttedPlayer = await putPlayer(toSanitizse);

      didPut = true;

      expect(puttedPlayer.first_name).toBe("scriptNscript");
      expect(puttedPlayer.last_name).toBe("abcdef");
      expect(puttedPlayer.average).toBe(toSanitizse.average);
      expect(puttedPlayer.lane).toBe(toSanitizse.lane);
      expect(puttedPlayer.position).toBe("Z");
    });

    it("should thorw error when trying to put a player when passed an invalid player id", async () => {
      const invalidPlayer = {
        ...playerToPut,
        id: "test",
      };

      await expect(putPlayer(invalidPlayer)).rejects.toThrow(
        "Invalid player data"
      );
    });

    it("should thorw error when trying to put a player with invalid data", async () => {
      const invalidPlayer = {
        ...playerToPut,
        lane: -1,
      };

      await expect(putPlayer(invalidPlayer)).rejects.toThrow(
        "putPlayer failed: Request failed with status code 422"
      );
    });

    it("should thorw error when trying to put a player when passed null", async () => {
      await expect(putPlayer(null as any)).rejects.toThrow(
        "Invalid player data"
      );
    });

    it("should thorw error when trying to put a player when passed non object", async () => {
      await expect(putPlayer("test" as any)).rejects.toThrow(
        "Invalid player data"
      );
    });
  });

  describe("deletePlayer()", () => {
    const toDel: playerType = {
      ...initPlayer,
      id: "ply_91c5aa1c14644e03b6735abd1480ee32",
      squad_id: "sqd_1a6c885ee19a49489960389193e8f819",
      first_name: "Mia",
      last_name: "Clark",
      average: 190,
      lane: 1,
      position: "Y",
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostPlayer(toDel);
    });

    beforeEach(() => {
      didDel = false;
    });

    afterEach(async () => {
      if (!didDel) {
        await rePostPlayer(toDel);
      }
    });

    it("should delete a player", async () => {
      const deleted = await deletePlayer(toDel.id);
      expect(deleted).toBe(1);
      didDel = true;
    });

    it("should return 0 when trying to delete a player when id is not found", async () => {
      const deleted = await deletePlayer(notFoundId);
      expect(deleted).toBe(0);
    });

    it("should throw error when trying to delete a player when id is invalid", async () => {
      await expect(deletePlayer("test")).rejects.toThrow("Invalid player id");
    });

    it("should throw error when trying to delete a player when id is valid, but not a player id", async () => {
      await expect(deletePlayer(userId)).rejects.toThrow("Invalid player id");
    });

    it("should throw error when trying to delete a player when id is null", async () => {
      await expect(deletePlayer(null as any)).rejects.toThrow(
        "Invalid player id"
      );
    });
  });
});