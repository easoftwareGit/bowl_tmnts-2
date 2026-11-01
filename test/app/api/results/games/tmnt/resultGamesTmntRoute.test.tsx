/**
 * @jest-environment node
 */
// Tests for src/app/api/results/games/tmnt/[tmntId]/route.ts using mocked prisma.
// No database or server needed.
// getTmntGamesSql is tested on its own, so these tests use the real function
// only to build the SQL the route should pass to $queryRawUnsafe.
import { NextRequest } from "next/server";
import { GET } from "@/app/api/results/games/tmnt/[tmntId]/route";
import { getTmntGamesSql } from "@/app/api/results/games/getSql";
import { prismaMock } from "../../../../../prismaMock";

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/results/games/tmnt/";

const tmntId = "tmt_fe8ac53dad0f400abe6354210a8f4cd1";
const notFoundTmntId = "tmt_01234567890123456789012345678901";
const userId = "usr_01234567890123456789012345678901";

// calls GET the way Next.js does, with params as a Promise
const callGet = (id: string) =>
  GET(new NextRequest(url + id), { params: Promise.resolve({ tmntId: id }) });

// rows shaped like the SQL's final SELECT, 6 games per squad
const mockGames = [
  {
    player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
    div_id: "div_f30aea2c534f4cfe87f4315531cef8ef",
    div_name: "Scratch",
    sort_order: 1,
    tmnt_name: "Gold Pin",
    start_date: "2022-10-23T07:00:00.000Z",
    full_name: "John Doe",
    average: 220,
    hdcp: 0,
    "Game 1": 211,
    "Game 2": 222,
    "Game 3": 233,
    "Game 4": 244,
    "Game 5": 255,
    "Game 6": 266,
    total: 1431,
  },
  {
    player_id: "ply_be57bef21fc64d199c2f6de4408bd136",
    div_id: "div_29b9225d8dd44a4eae276f8bde855729",
    div_name: "Hdcp",
    sort_order: 2,
    tmnt_name: "Gold Pin",
    start_date: "2022-10-23T07:00:00.000Z",
    full_name: "James Bennett",
    average: 200,
    hdcp: 18,
    "Game 1": 190,
    "Game 2": 200,
    "Game 3": 210,
    "Game 4": 180,
    "Game 5": 205,
    "Game 6": 195,
    total: 1180,
  },
];

// the arguments the route sends to prisma.squad.findMany()
const expectedFindManyArgs = (id: string) => ({
  select: {
    games: true,
  },
  where: {
    event: {
      tmnt_id: id,
    },
  },
  distinct: ["games"],
});

describe("Results - API: /api/results/games/tmnt/:tmntId", () => {
  describe("GET", () => {
    it("should get the game results for the tmnt", async () => {
      // the tmnt's squads all have 6 games
      prismaMock.squad.findMany.mockResolvedValue([{ games: 6 }] as never);
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockGames as never);

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.games).toHaveLength(2);
      expect(body.games).toEqual(mockGames);
    });

    it("should ask the database for the distinct squad games for the tmnt", async () => {
      prismaMock.squad.findMany.mockResolvedValue([{ games: 6 }] as never);
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockGames as never);

      await callGet(tmntId);

      expect(prismaMock.squad.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.squad.findMany).toHaveBeenCalledWith(
        expectedFindManyArgs(tmntId)
      );
    });

    it("should run the tmnt games SQL for the tmnt and squad games", async () => {
      prismaMock.squad.findMany.mockResolvedValue([{ games: 6 }] as never);
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockGames as never);

      await callGet(tmntId);

      const expectedSql = getTmntGamesSql(tmntId, 6);
      // make sure the test is not comparing two empty strings
      expect(expectedSql).not.toBe("");
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(expectedSql);
    });

    it("should use the games from the first squad row", async () => {
      // distinct games can return more than one row; the route uses the first
      prismaMock.squad.findMany.mockResolvedValue([
        { games: 3 },
        { games: 6 },
      ] as never);
      prismaMock.$queryRawUnsafe.mockResolvedValue([] as never);

      await callGet(tmntId);

      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
        getTmntGamesSql(tmntId, 3)
      );
    });

    it("should return an empty array when the games query finds no rows", async () => {
      prismaMock.squad.findMany.mockResolvedValue([{ games: 6 }] as never);
      prismaMock.$queryRawUnsafe.mockResolvedValue([] as never);

      const response = await callGet(notFoundTmntId);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.games).toEqual([]);
    });

    it("should return an empty array when the tmnt has no squads", async () => {
      prismaMock.squad.findMany.mockResolvedValue([]);

      const response = await callGet(notFoundTmntId);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ games: [] });
      // no squads, so the games query is never run
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return an empty array when the squad has no games", async () => {
      prismaMock.squad.findMany.mockResolvedValue([{ games: 0 }] as never);

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ games: [] });
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return an empty array when findMany returns null", async () => {
      prismaMock.squad.findMany.mockResolvedValue(null as never);

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ games: [] });
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return 404 when the tmnt id is invalid", async () => {
      const response = await callGet("invalid");
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
      // the database is never touched for a bad id
      expect(prismaMock.squad.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return 404 when the id is valid but not a tmnt id", async () => {
      const response = await callGet(userId);
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
      expect(prismaMock.squad.findMany).not.toHaveBeenCalled();
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return 500 when the squad games count is not valid", async () => {
      // -1 passes the route's !games check but fails validGames, so
      // getTmntGamesSql returns ''
      expect(getTmntGamesSql(tmntId, -1)).toBe("");
      prismaMock.squad.findMany.mockResolvedValue([{ games: -1 }] as never);

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "could not get game results for tmnt" });
      // no SQL, so the games query is never run
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return 500 when getting the squads throws", async () => {
      prismaMock.squad.findMany.mockRejectedValue(
        new Error("connection failed")
      );

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "error getting game results for tmnt" });
      expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
    });

    it("should return 500 when the games query throws", async () => {
      prismaMock.squad.findMany.mockResolvedValue([{ games: 6 }] as never);
      prismaMock.$queryRawUnsafe.mockRejectedValue(
        new Error("connection failed")
      );

      const response = await callGet(tmntId);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ error: "error getting game results for tmnt" });
    });
  });
});
