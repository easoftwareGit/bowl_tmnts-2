/**
 * @jest-environment node
 */
// Tests for src/app/api/games/squad/[squadId]/route.ts using mocked prisma.
// No database or server needed.
//
// PUT builds one prisma.game.upsert() per game and passes the array to
// prisma.$transaction([...]). Here upsert returns the row it was asked to
// create, and $transaction just awaits the array, so the response holds
// exactly what the route sent to the "db".
//
// isValidBtDbId and validateGames are the REAL functions, so validation
// errors (404) come from the real code.
import type { Game } from "@prisma/client";
import { GET, PUT } from "@/app/api/games/squad/[squadId]/route";
import { prismaMock } from "../../../prismaMock";
import type { gameType } from "@/lib/types/types";
import { maxGames, maxScore } from "@/lib/validation/constants";
import {
  mockGames,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

// The URL only needs to be valid; the route reads squadId from params
const url = "http://localhost:3000/api/games/squad";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (squadId: string) => ({ params: Promise.resolve({ squadId }) });

const getRequest = (squadId: string) => new Request(`${url}/${squadId}`);

// builds a PUT request; a string body is sent as-is (for bad JSON tests)
const putRequest = (squadId: string, body: unknown) =>
  new Request(`${url}/${squadId}`, {
    method: "PUT",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// NextResponse.json() converts Date objects to ISO strings
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

const notFoundSquadId = "sqd_01234567890123456789012345678901";
const notFoundPlayerId = "ply_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";
const squad2Id = "sqd_1a6c885ee19a49489960389193e8f819";

const squadId = mockTmntFullData.squads[0].id;

const dates = {
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
};

// a Game row as prisma would return it
const dbGame = (
  id: string,
  squad_id: string,
  player_id: string,
  game_num: number,
  score: number
): Game => ({ id, squad_id, player_id, game_num, score, ...dates });

// the shape of the rows the route upserts
type upsertArgs = {
  where: { id: string };
  create: Omit<Game, "id" | "createdAt" | "updatedAt">;
};

beforeEach(() => {
  // each upsert "returns" the row it would create, with its id
  prismaMock.game.upsert.mockImplementation(((args: upsertArgs) =>
    Promise.resolve({
      id: args.where.id,
      ...args.create,
      ...dates,
    })) as never);
  // array transaction: resolve every upsert in the array
  prismaMock.$transaction.mockImplementation(((ops: Promise<unknown>[]) =>
    Promise.all(ops)) as never);
});

describe("Games - API: /api/games/squad/:squadId", () => {
  // ---------------------------------------------------------------- GET
  describe("GET all games for squad", () => {
    const getSquadId = "sqd_7116ce5f80164830830a7157eb093396";
    const playerIds = [
      "ply_88be0472be3d476ea1caa99dd05953fa",
      "ply_be57bef21fc64d199c2f6de4408bd136",
      "ply_bb0fd8bbd9e34d34a7fa90b4111c6e40",
    ];
    // 3 players x 6 games, already in route order: player_id, game_num
    const rows: Game[] = playerIds.flatMap((playerId, p) =>
      Array.from({ length: 6 }, (_, g) =>
        dbGame(
          `gam_${p}${g}000000000000000000000000000000`,
          getSquadId,
          playerId,
          g + 1,
          200 + g
        )
      )
    );

    it("should get all games for squad", async () => {
      prismaMock.game.findMany.mockResolvedValue(rows);

      const response = await GET(getRequest(getSquadId), ctx(getSquadId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.games).toHaveLength(18);
      expect(body.games).toEqual(toJson(rows));
      for (let i = 0; i < body.games.length; i++) {
        expect(body.games[i].squad_id).toBe(getSquadId);
        expect(body.games[i].game_num).toBe((i % 6) + 1); // 1...6
      }
    });

    it("should query games by squad, sorted by player_id then game_num", async () => {
      prismaMock.game.findMany.mockResolvedValue([]);

      await GET(getRequest(getSquadId), ctx(getSquadId));

      expect(prismaMock.game.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.game.findMany).toHaveBeenCalledWith({
        where: { squad_id: getSquadId },
        orderBy: [{ player_id: "asc" }, { game_num: "asc" }],
      });
    });

    it("should return status 200 and an empty array when squad is not found", async () => {
      prismaMock.game.findMany.mockResolvedValue([]);

      const response = await GET(
        getRequest(notFoundSquadId),
        ctx(notFoundSquadId)
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.games).toHaveLength(0);
    });

    it.each([
      { desc: "squadId is invalid", id: "invalid" },
      { desc: "squadId is valid, but not a squad id", id: userId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
      expect(prismaMock.game.findMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.game.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(getSquadId), ctx(getSquadId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error getting games for squad - connection failed",
      });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.game.findMany.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest(getSquadId), ctx(getSquadId));

      expect(response.status).toBe(404);
    });
  });

  // ---------------------------------------------------------------- PUT
  describe("PUT all games for a squad", () => {
    it("should upsert all games for a squad", async () => {
      const response = await PUT(putRequest(squadId, mockGames), ctx(squadId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.games).toHaveLength(mockGames.length);
      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.game.upsert).toHaveBeenCalledTimes(mockGames.length);
      for (let i = 0; i < body.games.length; i++) {
        expect(body.games[i].id).toBe(mockGames[i].id);
        expect(body.games[i].squad_id).toBe(squadId);
        expect(body.games[i].player_id).toBe(mockGames[i].player_id);
        expect(body.games[i].game_num).toBe(mockGames[i].game_num);
        expect(body.games[i].score).toBe(mockGames[i].score);
      }
    });

    it("should send each game to prisma.game.upsert with the squad id from the url", async () => {
      await PUT(putRequest(squadId, mockGames), ctx(squadId));

      mockGames.forEach((game, i) => {
        const fields = {
          squad_id: squadId,
          player_id: game.player_id,
          game_num: game.game_num,
          score: game.score,
        };
        expect(prismaMock.game.upsert).toHaveBeenNthCalledWith(i + 1, {
          where: { id: game.id },
          update: fields,
          create: fields,
        });
      });
    });

    it.each([
      { desc: "squadId is invalid", id: "invalid" },
      { desc: "squadId is valid, but not a squad id", id: userId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await PUT(putRequest(id, mockGames), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid squad" });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should return 400 when games is not an array", async () => {
      const response = await PUT(
        putRequest(squadId, mockGames[0]),
        ctx(squadId)
      );
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body).toEqual({ error: "games must be an array" });
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    // each case changes one field of the 2nd game; the real validateGames
    // must reject it before anything reaches the database
    const invalidCases: {
      desc: string;
      field: keyof gameType;
      value: unknown;
    }[] = [
      { desc: "invalid id", field: "id", value: "invalid" },
      { desc: "missing id", field: "id", value: null },
      { desc: "id, but not a valid game id", field: "id", value: userId },
      { desc: "invalid squad_id", field: "squad_id", value: "invalid" },
      { desc: "missing squad_id", field: "squad_id", value: null },
      { desc: "squad id, but not a valid squad id", field: "squad_id", value: userId },
      { desc: "valid but not found squad_id", field: "squad_id", value: notFoundSquadId },
      { desc: "more than 1 squad_id", field: "squad_id", value: squad2Id },
      { desc: "invalid player_id", field: "player_id", value: "invalid" },
      { desc: "missing player_id", field: "player_id", value: null },
      { desc: "player id, but not a valid player id", field: "player_id", value: userId },
      // kept from the integration test, which sets squad_id here
      { desc: "a player id as the squad_id", field: "squad_id", value: notFoundPlayerId },
      { desc: "game_num too low", field: "game_num", value: 0 },
      { desc: "game_num too high", field: "game_num", value: maxGames + 1 },
      { desc: "missing game_num", field: "game_num", value: null },
      { desc: "game_num not a number", field: "game_num", value: "not a number" },
      { desc: "game_num not an integer", field: "game_num", value: 1.5 },
      { desc: "score too low", field: "score", value: -1 },
      { desc: "score too high", field: "score", value: maxScore + 1 },
      { desc: "missing score", field: "score", value: null },
      { desc: "score not a number", field: "score", value: "not a number" },
      { desc: "score not an integer", field: "score", value: 1.5 },
    ];

    it.each(invalidCases)(
      "should not upsert games when game data has $desc",
      async ({ field, value }) => {
        const invalidGames = cloneDeep(mockGames) as unknown as Record<
          string,
          unknown
        >[];
        invalidGames[1][field] = value;

        const response = await PUT(
          putRequest(squadId, invalidGames),
          ctx(squadId)
        );
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "invalid games" });
        expect(prismaMock.game.upsert).not.toHaveBeenCalled();
        expect(prismaMock.$transaction).not.toHaveBeenCalled();
      }
    );

    it("should return 500 when the body is not valid JSON", async () => {
      const response = await PUT(putRequest(squadId, "{not json"), ctx(squadId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.message).toMatch(/^error upserting games for squad - /);
      expect(prismaMock.$transaction).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.$transaction.mockRejectedValue(new Error("connection failed"));

      const response = await PUT(putRequest(squadId, mockGames), ctx(squadId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "error upserting games for squad - connection failed",
      });
    });

    it("should return 409 for a Prisma foreign key error (player not found)", async () => {
      prismaMock.$transaction.mockRejectedValue({ code: "P2003" });

      const response = await PUT(putRequest(squadId, mockGames), ctx(squadId));

      expect(response.status).toBe(409);
    });

    it("should return 409 for a Prisma unique constraint error", async () => {
      prismaMock.$transaction.mockRejectedValue({ code: "P2002" });

      const response = await PUT(putRequest(squadId, mockGames), ctx(squadId));

      expect(response.status).toBe(409);
    });
  });
});
