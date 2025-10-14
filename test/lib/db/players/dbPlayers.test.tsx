import axios, { AxiosError } from "axios";
import { basePlayersApi } from "@/lib/db/apiPaths";
import { testBasePlayersApi } from "../../../testApi";
import { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { mockPlayersToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import {
  deleteAllPlayersForSquad,
  deleteAllPlayersForTmnt,
  deletePlayer,
  getAllPlayersForSquad,
  getAllPlayersForTmnt,
  postManyPlayers,
  postPlayer,
  putPlayer,
  extractPlayers,
} from "@/lib/db/players/dbPlayers";
import { replaceManyPlayers } from "@/lib/db/players/dbPlayersReplaceMany";
import { cloneDeep } from "lodash";

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
  const rePostPlayer = async (player: playerType) => {
    try {
      // if player already in database, then don't re-post
      const getResponse = await axios.get(playerUrl + player.id);
      const found = getResponse.data.player;
      if (found) return;
    } catch (err) {
      if (err instanceof AxiosError) {
        if (err.status !== 404) {
          console.log(err.message);
          return;
        }
      }
    }
    try {
      // if not in database, then re-post
      const playerJSON = JSON.stringify(player);
      const response = await axios({
        method: "post",
        withCredentials: true,
        url: url,
        data: playerJSON,
      });
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
          extraField: "ignore me", // should be ignored
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

      // every *_err field should be blank string
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
      if (!players) return;
      for (let i = 0; i < players.length; i++) {
        if (players[i].id === playersToGet[0].id) {
          expect(players[i].id).toEqual(playersToGet[0].id);
          expect(players[i].squad_id).toEqual(playersToGet[0].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[0].first_name);
          expect(players[i].last_name).toEqual(playersToGet[0].last_name);
          expect(players[i].average).toEqual(playersToGet[0].average);
          expect(players[i].lane).toEqual(playersToGet[0].lane);
          expect(players[i].position).toEqual(playersToGet[0].position);
        } else if (players[i].id === playersToGet[1].id) {
          expect(players[i].id).toEqual(playersToGet[1].id);
          expect(players[i].squad_id).toEqual(playersToGet[1].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[1].first_name);
          expect(players[i].last_name).toEqual(playersToGet[1].last_name);
          expect(players[i].average).toEqual(playersToGet[1].average);
          expect(players[i].lane).toEqual(playersToGet[1].lane);
          expect(players[i].position).toEqual(playersToGet[1].position);
        } else if (players[i].id === playersToGet[2].id) {
          expect(players[i].id).toEqual(playersToGet[2].id);
          expect(players[i].squad_id).toEqual(playersToGet[2].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[2].first_name);
          expect(players[i].last_name).toEqual(playersToGet[2].last_name);
          expect(players[i].average).toEqual(playersToGet[2].average);
          expect(players[i].lane).toEqual(playersToGet[2].lane);
          expect(players[i].position).toEqual(playersToGet[2].position);
        } else if (players[i].id === playersToGet[3].id) {
          expect(players[i].id).toEqual(playersToGet[3].id);
          expect(players[i].squad_id).toEqual(playersToGet[3].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[3].first_name);
          expect(players[i].last_name).toEqual(playersToGet[3].last_name);
          expect(players[i].average).toEqual(playersToGet[3].average);
          expect(players[i].lane).toEqual(playersToGet[3].lane);
          expect(players[i].position).toEqual(playersToGet[3].position);
        } else if (players[i].id === playersToGet[4].id) {
          expect(players[i].id).toEqual(playersToGet[4].id);
          expect(players[i].squad_id).toEqual(playersToGet[4].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[4].first_name);
          expect(players[i].last_name).toEqual(playersToGet[4].last_name);
          expect(players[i].average).toEqual(playersToGet[4].average);
          expect(players[i].lane).toEqual(playersToGet[4].lane);
          expect(players[i].position).toEqual(playersToGet[4].position);
        } else if (players[i].id === playersToGet[5].id) {
          expect(players[i].id).toEqual(playersToGet[5].id);
          expect(players[i].squad_id).toEqual(playersToGet[5].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[5].first_name);
          expect(players[i].last_name).toEqual(playersToGet[5].last_name);
          expect(players[i].average).toEqual(playersToGet[5].average);
          expect(players[i].lane).toEqual(playersToGet[5].lane);
          expect(players[i].position).toEqual(playersToGet[5].position);
        } else if (players[i].id === playersToGet[6].id) {
          expect(players[i].id).toEqual(playersToGet[6].id);
          expect(players[i].squad_id).toEqual(playersToGet[6].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[6].first_name);
          expect(players[i].last_name).toEqual(playersToGet[6].last_name);
          expect(players[i].average).toEqual(playersToGet[6].average);
          expect(players[i].lane).toEqual(playersToGet[6].lane);
          expect(players[i].position).toEqual(playersToGet[6].position);
        } else if (players[i].id === playersToGet[7].id) {
          expect(players[i].id).toEqual(playersToGet[7].id);
          expect(players[i].squad_id).toEqual(playersToGet[7].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[7].first_name);
          expect(players[i].last_name).toEqual(playersToGet[7].last_name);
          expect(players[i].average).toEqual(playersToGet[7].average);
          expect(players[i].lane).toEqual(playersToGet[7].lane);
          expect(players[i].position).toEqual(playersToGet[7].position);
        } else if (players[i].id === playersToGet[8].id) {
          expect(players[i].id).toEqual(playersToGet[8].id);
          expect(players[i].squad_id).toEqual(playersToGet[8].squad_id);
          expect(players[i].first_name).toEqual(playersToGet[8].first_name);
          expect(players[i].last_name).toBeNull();
          expect(players[i].average).toEqual(playersToGet[8].average);
          expect(players[i].lane).toBeNull();
          expect(players[i].position).toBeNull();
        } else {
          expect(true).toBeFalsy();
        }
      }
    });
    it("should return 0 players for not found tmnt", async () => {
      const players = await getAllPlayersForTmnt(notFoundTmntId);
      expect(players).toHaveLength(0);
    });
    it("should throw error if tmmt id is invalid", async () => {
      try {
        await getAllPlayersForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is a valid id, but not a tmnt id", async () => {
      try {
        await getAllPlayersForTmnt(notFoundSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw error if tmnt id is null", async () => {
      try {
        await getAllPlayersForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("getAllPlayersForSquad()", () => {
    it("should get all players for squad", async () => {
      const players = await getAllPlayersForSquad(squadId);
      expect(players).toHaveLength(playersToGet.length);
      if (!players) return;
      for (let i = 0; i < players.length; i++) {
        expect(players[i].id).toEqual(playersToGet[i].id);
        expect(players[i].squad_id).toEqual(playersToGet[i].squad_id);
        expect(players[i].first_name).toEqual(playersToGet[i].first_name);
        expect(players[i].last_name).toEqual(playersToGet[i].last_name);
        expect(players[i].average).toEqual(playersToGet[i].average);
        expect(players[i].lane).toEqual(playersToGet[i].lane);
        expect(players[i].position).toEqual(playersToGet[i].position);
      }
    });
    it("should return 0 players for not found squad", async () => {
      const players = await getAllPlayersForSquad(notFoundSquadId);
      expect(players).toHaveLength(0);
    });
    it("should throw error if squad id is invalid", async () => {
      try {
        await getAllPlayersForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is a valid id, but not a squad id", async () => {
      try {
        await getAllPlayersForSquad(notFoundTmntId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should throw error if squad id is null", async () => {
      try {
        await getAllPlayersForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });

  describe("postPlayer()", () => {
    const playerToPost = {
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
      const response = await axios.get(url);
      const players = response.data.players;
      const toDel = players.find((p: playerType) => p.position === "Z");
      if (toDel) {
        try {
          const delResponse = await axios({
            method: "delete",
            withCredentials: true,
            url: playerUrl + toDel.id,
          });
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
      expect(postedPlayer).not.toBeNull();
      if (!postedPlayer) return;
      createdPlayer = true;
      expect(postedPlayer.id).toEqual(playerToPost.id);
      expect(postedPlayer.squad_id).toEqual(playerToPost.squad_id);
      expect(postedPlayer.first_name).toEqual(playerToPost.first_name);
      expect(postedPlayer.last_name).toEqual(playerToPost.last_name);
      expect(postedPlayer.average).toEqual(playerToPost.average);
      expect(postedPlayer.lane).toEqual(playerToPost.lane);
      expect(postedPlayer.position).toEqual(playerToPost.position);
    });
    it("should post a sanitzed player", async () => {
      const toSanitizse = {
        ...playerToPost,
        first_name: '<script>alert("xss")</script>',
        last_name: "    abcdef***",
        average: 100,
        lane: 2,
        position: " Z*",
      };
      const postedPlayer = await postPlayer(toSanitizse);
      expect(postedPlayer).not.toBeNull();
      if (!postedPlayer) return;
      createdPlayer = true;
      expect(postedPlayer.id).toEqual(toSanitizse.id);
      expect(postedPlayer.squad_id).toEqual(toSanitizse.squad_id);
      expect(postedPlayer.first_name).toEqual("alertxss");
      expect(postedPlayer.last_name).toEqual("abcdef");
      expect(postedPlayer.average).toEqual(toSanitizse.average);
      expect(postedPlayer.lane).toEqual(toSanitizse.lane);
      expect(postedPlayer.position).toEqual("Z");
    });
    it("should throw error when post a player if invalid player id", async () => {
      try {
        const invalidPlayer = {
          ...playerToPost,
          id: "test",
        };
        await postPlayer(invalidPlayer);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
    it("should throw error when post a player if got invalid data", async () => {
      try {
        const invalidPlayer = {
          ...playerToPost,
          lane: -1,
        };
        await postPlayer(invalidPlayer);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "postPlayer failed: Request failed with status code 422"
        );
      }
    });
    it("should throw error when post a player if got null", async () => {
      try {
        await postPlayer(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
    it("should throw error when post a player if got not an object", async () => {
      try {
        await postPlayer("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
  });

  describe("postManyPlayers()", () => {
    let createdPlayers = false;
    const squadId = "sqd_42be0f9d527e4081972ce8877190489d";

    beforeAll(async () => {
      await deleteAllPlayersForSquad(squadId);
    });

    beforeEach(() => {
      createdPlayers = false;
    });

    afterEach(async () => {
      if (createdPlayers) {
        await deleteAllPlayersForSquad(squadId);
      }
    });

    afterAll(async () => {
      await deleteAllPlayersForSquad(squadId);
    });

    it("should post many players", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);
      for (let i = 0; i < mockPlayersToPost.length; i++) {
        expect(players[i].id).toEqual(mockPlayersToPost[i].id);
        expect(players[i].squad_id).toEqual(mockPlayersToPost[i].squad_id);
        expect(players[i].first_name).toEqual(mockPlayersToPost[i].first_name);
        expect(players[i].last_name).toEqual(mockPlayersToPost[i].last_name);
        expect(players[i].average).toEqual(mockPlayersToPost[i].average);
        expect(players[i].lane).toEqual(mockPlayersToPost[i].lane);
        expect(players[i].position).toEqual(mockPlayersToPost[i].position);
      }
    });
    it("should post many players with sanitization", async () => {
      const toSanitize = cloneDeep(mockPlayersToPost);
      toSanitize[0].first_name = "  " + toSanitize[0].first_name + "  ";
      toSanitize[0].last_name = "***" + toSanitize[0].last_name + "***";
      toSanitize[0].position = " A*";
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);
      for (let i = 0; i < toSanitize.length; i++) {
        expect(players[i].first_name).toEqual(mockPlayersToPost[i].first_name);
        expect(players[i].last_name).toEqual(mockPlayersToPost[i].last_name);
        expect(players[i].position).toEqual(mockPlayersToPost[i].position);
      }
    });
    it("should return 0 when passed empty array", async () => {
      const count = await postManyPlayers([]);
      expect(count).toBe(0);
    });
    it("should throw error when invalid player id in first item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockPlayersToPost);
        invalidPlayers[0].id = "test";
        await postManyPlayers(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data at index 0");
      }
    });
    it("should throw error when with invalid player id in second item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockPlayersToPost);
        invalidPlayers[1].id = "test";
        await postManyPlayers(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data at index 1");
      }
    });
    it("should throw error when invalid data in first item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockPlayersToPost);
        invalidPlayers[0].lane = -1;
        await postManyPlayers(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data at index 0");
      }
    });
    it("should throw error when with invalid data in second item", async () => {
      try {
        const invalidPlayers = cloneDeep(mockPlayersToPost);
        invalidPlayers[1].lane = -1;
        await postManyPlayers(invalidPlayers);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data at index 1");
      }
    });
    it("should throw error when passed an non array", async () => {
      try {
        await postManyPlayers("not an array" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid players data");
      }
    });
    it("should throw error when passed null", async () => {
      try {
        await postManyPlayers(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid players data");
      }
    });
  });

  describe("putPlayer()", () => {
    const playerToPut = {
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

    const resetPlayer = {
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
        const response = await axios({
          method: "put",
          data: playerJSON,
          withCredentials: true,
          url: putUrl,
        });
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
      expect(puttedPlayer).not.toBeNull();
      if (!puttedPlayer) return;
      didPut = true;
      expect(puttedPlayer.first_name).toBe(playerToPut.first_name);
      expect(puttedPlayer.last_name).toBe(playerToPut.last_name);
      expect(puttedPlayer.average).toBe(playerToPut.average);
      expect(puttedPlayer.lane).toBe(playerToPut.lane);
      expect(puttedPlayer.position).toBe(playerToPut.position);
    });
    it("should put a sanitized player", async () => {
      const toSanitizse = {
        ...playerToPut,
        first_name: '<script>alert("xss")</script>',
        last_name: "    abcdef***",
        average: 100,
        lane: 2,
        position: " Z*",
      };
      const puttedPlayer = await putPlayer(toSanitizse);
      expect(puttedPlayer).not.toBeNull();
      if (!puttedPlayer) return;
      didPut = true;
      expect(puttedPlayer.first_name).toBe("alertxss");
      expect(puttedPlayer.last_name).toBe("abcdef");
      expect(puttedPlayer.average).toBe(toSanitizse.average);
      expect(puttedPlayer.lane).toBe(toSanitizse.lane);
      expect(puttedPlayer.position).toBe("Z");
    });
    it("should thorw error when trying to put a player when passed an invalid player id", async () => {
      try {
        const invalidPlayer = {
          ...playerToPut,
          id: "test",
        };
        await putPlayer(invalidPlayer);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
    it("should thorw error when trying to put a player with invalid data", async () => {
      try {
        const invalidPlayer = {
          ...playerToPut,
          lane: -1,
        };
        await putPlayer(invalidPlayer);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "putPlayer failed: Request failed with status code 422"
        );
      }
    });
    it("should thorw error when trying to put a player when passed null", async () => {
      try {
        await putPlayer(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
    it("should thorw error when trying to put a player when passed non object", async () => {
      try {
        await putPlayer("test" as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player data");
      }
    });
  });

  describe("replaceManyPlayers()", () => {
    const rmSquadId = "sqd_42be0f9d527e4081972ce8877190489d";
    let createdPlayers = false;

    const playersToDelTmntId = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

    beforeAll(async () => {
      await deleteAllPlayersForTmnt(playersToDelTmntId);
    });

    beforeEach(() => {
      createdPlayers = false;
      // Reset the mocks before each test to ensure test isolation
    });

    afterEach(async () => {
      if (createdPlayers) {
        await deleteAllPlayersForTmnt(playersToDelTmntId);
      }
    });

    it("should update, insert, delete many players", async () => {
      const toInsert: playerType[] = [
        {
          ...initPlayer,
          id: "ply_05be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          first_name: "Art",
          last_name: "Smith",
          average: 222,
          lane: 3,
          position: "C",
        },
        {
          ...initPlayer,
          id: "ply_06be0472be3d476ea1caa99dd05953fa",
          squad_id: "sqd_42be0f9d527e4081972ce8877190489d",
          first_name: "Bob",
          last_name: "Rees",
          average: 223,
          lane: 4,
          position: "C",
        },
      ];

      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          average: 200,
        },
        {
          ...mockPlayersToPost[1],
          average: 201,
        },
        {
          ...toInsert[0],
        },
        {
          ...toInsert[1],
        },
      ];

      const replaceCount = await replaceManyPlayers(playersToUpdate, rmSquadId);
      expect(replaceCount).toBe(playersToUpdate.length);
      const replacedPlayers = await getAllPlayersForSquad(rmSquadId);
      if (!replacedPlayers) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPlayers.length).toEqual(playersToUpdate.length);
      for (let i = 0; i < replacedPlayers.length; i++) {
        if (replacedPlayers[i].id === playersToUpdate[0].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[0].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[0].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[0].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[0].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[0].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[1].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[1].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[1].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[1].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[1].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[1].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[2].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[2].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[2].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[2].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[2].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[2].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[3].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[3].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[3].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[3].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[3].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[3].position
          );
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should replace many players - sanitized first and last names", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          first_name: "<script>alert(1)</script>",
          last_name: "    abcdef***",
        },
        {
          ...mockPlayersToPost[1],
        },
        {
          ...mockPlayersToPost[2],
        },
        {
          ...mockPlayersToPost[3],
        },
      ];

      const replaceCount = await replaceManyPlayers(playersToUpdate, rmSquadId);
      expect(replaceCount).toBe(playersToUpdate.length);
      const replacedPlayers = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!replacedPlayers) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPlayers.length).toEqual(playersToUpdate.length);
      for (let i = 0; i < replacedPlayers.length; i++) {
        if (replacedPlayers[i].id === playersToUpdate[0].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[0].average
          );
          expect(replacedPlayers[i].first_name).toEqual("alert1");
          expect(replacedPlayers[i].last_name).toEqual("abcdef");
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[0].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[0].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[1].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[1].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[1].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[1].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[1].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[1].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[2].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[2].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[2].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[2].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[2].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[2].position
          );
        } else if (replacedPlayers[i].id === playersToUpdate[3].id) {
          expect(replacedPlayers[i].average).toEqual(
            playersToUpdate[3].average
          );
          expect(replacedPlayers[i].first_name).toEqual(
            playersToUpdate[3].first_name
          );
          expect(replacedPlayers[i].last_name).toEqual(
            playersToUpdate[3].last_name
          );
          expect(replacedPlayers[i].lane).toEqual(playersToUpdate[3].lane);
          expect(replacedPlayers[i].position).toEqual(
            playersToUpdate[3].position
          );
        } else {
          expect(true).toBefalsey();
        }
      }
    });
    it("should return 0 when passed an empty array", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const replaceCount = await replaceManyPlayers([], rmSquadId);
      expect(replaceCount).toBe(0);
      const replacedPlayers = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!replacedPlayers) {
        expect(true).toBeFalsy();
        return;
      }
      expect(replacedPlayers.length).toEqual(0);
    });
    it("should throw an error for invalid player ID in first item", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          id: "",
        },
        {
          ...mockPlayersToPost[1],
        },
        {
          ...mockPlayersToPost[2],
        },
        {
          ...mockPlayersToPost[3],
        },
      ];
      await expect(
        replaceManyPlayers(playersToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid player data at index 0");
    });
    it("should throw an error for invalid player ID in third item", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
        },
        {
          ...mockPlayersToPost[1],
        },
        {
          ...mockPlayersToPost[2],
          id: "invalid-id",
        },
        {
          ...mockPlayersToPost[3],
        },
      ];
      await expect(
        replaceManyPlayers(playersToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid player data at index 2");
    });
    it("should throw an error for invalid player data in first item", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
          first_name: "",
        },
        {
          ...mockPlayersToPost[1],
        },
        {
          ...mockPlayersToPost[2],
        },
        {
          ...mockPlayersToPost[3],
        },
      ];
      await expect(
        replaceManyPlayers(playersToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid player data at index 0");
    });
    it("should throw an error for invalid player data in second item", async () => {
      const count = await postManyPlayers(mockPlayersToPost);
      expect(count).toBe(mockPlayersToPost.length);
      createdPlayers = true;
      const players = await getAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      if (!players) {
        expect(true).toBeFalsy();
        return;
      }
      expect(players.length).toEqual(mockPlayersToPost.length);

      const playersToUpdate = [
        {
          ...mockPlayersToPost[0],
        },
        {
          ...mockPlayersToPost[1],
          last_name: "",
        },
        {
          ...mockPlayersToPost[2],
          average: -1,
        },
        {
          ...mockPlayersToPost[3],
        },
      ];
      await expect(
        replaceManyPlayers(playersToUpdate, rmSquadId)
      ).rejects.toThrow("Invalid player data at index 1");
    });
    it("should throw an error if passed null as players", async () => {
      await expect(replaceManyPlayers(null as any, rmSquadId)).rejects.toThrow(
        "Invalid players"
      );
    });
    it("should throw an error if players is not an array", async () => {
      await expect(
        replaceManyPlayers("not-an-array" as any, rmSquadId)
      ).rejects.toThrow("Invalid players");
    });
    it("should throw an error if passed null as squadId", async () => {
      await expect(
        replaceManyPlayers(mockPlayersToPost, null as any)
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed invalid squadId", async () => {
      await expect(
        replaceManyPlayers(mockPlayersToPost, "test")
      ).rejects.toThrow("Invalid squad id");
    });
    it("should throw an error if passed valid id, but not squad id", async () => {
      await expect(
        replaceManyPlayers(mockPlayersToPost, tmntId)
      ).rejects.toThrow("Invalid squad id");
    });
  });

  describe("deletePlayer()", () => {
    // toDel is data from prisma/seeds.ts
    const toDel = {
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
    it("should throw error when trying to delete a player when id is not found", async () => {
      try {
        await deletePlayer(notFoundId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "deletePlayer failed: Request failed with status code 404"
        );
      }
    });
    it("should throw error when trying to delete a player when id is invalid", async () => {
      try {
        await deletePlayer("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player id");
      }
    });
    it("should throw error when trying to delete a player when id is valid, but not a player id", async () => {
      try {
        await deletePlayer(userId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player id");
      }
    });
    it("should throw error when trying to delete a player when id is null", async () => {
      try {
        await deletePlayer(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid player id");
      }
    });
  });

  describe("deleteAllPlayersForTmnt()", () => {
    const delPlayerTmntId = "tmt_d9b1af944d4941f65b2d2d4ac160cdea";

    const rePostToDel = async () => {
      const response = await axios.get(url);
      const players = response.data.players;
      const foundToDel = players.find(
        (p: playerType) => p.id === mockPlayersToPost[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPlayers(mockPlayersToPost);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    afterAll(async () => {
      // cleanup after tests
    });

    it("should delete all players for a tmnt", async () => {
      const deleted = await deleteAllPlayersForTmnt(delPlayerTmntId);
      expect(deleted).toBe(mockPlayersToPost.length);
      didDel = true;
    });
    it("should not delete all players for a tmnt when tmnt id is not found", async () => {
      const deleted = await deleteAllPlayersForTmnt(notFoundTmntId);
      expect(deleted).toBe(0);
    });
    it("should throw an error when tmnt id is invalid", async () => {
      try {
        await deleteAllPlayersForTmnt("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is valid, but not a tmnt id", async () => {
      try {
        await deleteAllPlayersForTmnt(notFoundSquadId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
    it("should throw an error when tmnt id is null", async () => {
      try {
        await deleteAllPlayersForTmnt(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid tmnt id");
      }
    });
  });

  describe("deleteAllPlayersForSquad()", () => {
    const rePostToDel = async () => {
      const response = await axios.get(url);
      const players = response.data.players;
      const foundToDel = players.find(
        (p: playerType) => p.id === mockPlayersToPost[0].id
      );
      if (!foundToDel) {
        try {
          await postManyPlayers(mockPlayersToPost);
        } catch (err) {
          if (err instanceof AxiosError) console.log(err.message);
        }
      }
    };

    let didDel = false;

    beforeAll(async () => {
      await rePostToDel();
    });

    beforeEach(async () => {
      if (didDel) {
        await rePostToDel();
      }
    });

    afterEach(async () => {
      didDel = false;
    });

    it("should delete all players for a squad", async () => {
      const deleted = await deleteAllPlayersForSquad(
        mockPlayersToPost[0].squad_id
      );
      expect(deleted).toBe(mockPlayersToPost.length);
      didDel = true;
    });
    it("should not delete all players for a squad when squad id is not found", async () => {
      const deleted = await deleteAllPlayersForSquad(notFoundSquadId);
      expect(deleted).toBe(0);
    });
    it("should not delete all players for a squad when squad id is invalid", async () => {
      try {
        await deleteAllPlayersForSquad("test");
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should not delete all players for a squad when squad id is valid, but not a squad id", async () => {
      try {
        await deleteAllPlayersForSquad(notFoundTmntId);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
    it("should not delete all players for a squad when squad id is null", async () => {
      try {
        await deleteAllPlayersForSquad(null as any);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid squad id");
      }
    });
  });
});
