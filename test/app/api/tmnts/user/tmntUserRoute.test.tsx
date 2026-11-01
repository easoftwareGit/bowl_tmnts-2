/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/user/[userId]/route.ts using mocked prisma and auth.
// No database or server needed.
import { NextResponse } from "next/server";
import type { Tmnt } from "@prisma/client";
import { GET } from "@/app/api/tmnts/user/[userId]/route";
import { prismaMock } from "../../../../prismaMock";
import { requireDirector } from "@/lib/auth/requireDirector";

// Replace the auth check with a mock function each test can control
jest.mock("@/lib/auth/requireDirector", () => ({
  requireDirector: jest.fn(),
}));
const mockRequireDirector = requireDirector as jest.MockedFunction<
  typeof requireDirector
>;

// The URL only needs to be valid; the route reads the userId from params, not the URL
const url = "http://localhost:3000/api/tmnts/user";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (userId: string) => ({ params: Promise.resolve({ userId }) });

// builds the GET request for a user
const getRequest = (userId: string) => new Request(`${url}/${userId}`);

// NextResponse.json() converts Date objects to ISO strings
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundUserId = "usr_01234567890123456789012345678901"; // valid format, not in "db"
const nonUserId = "tmt_f4d563425ba04b7dac3a97c0a90fc2c9"; // valid format, wrong table

const dublinBowl = {
  bowl_name: "Earl Anthony's Dublin Bowl",
  city: "Dublin",
  state: "CA",
  url: "https://www.earlanthonysdublinbowl.com",
};

// rows shaped like the route's select: tmnt columns plus bowl { name, city, state, url },
// already sorted newest to oldest, the way the database would return them
const mockUserTmnts = [
  {
    id: "tmt_ce35f0c119aa49fd9b89aa86cb980a6a",
    tmnt_name: "New Years Eve",
    start_date: new Date("2026-12-31T08:00:00.000Z"),
    end_date: new Date("2026-12-31T08:00:00.000Z"),
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    user_id: userId,
    bowl: dublinBowl,
  },
  {
    id: "tmt_718fe20f53dd4e539692c6c64f991bbe",
    tmnt_name: "2-Day event",
    start_date: new Date("2023-12-20T08:00:00.000Z"),
    end_date: new Date("2023-12-21T08:00:00.000Z"),
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    user_id: userId,
    bowl: dublinBowl,
  },
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    tmnt_name: "Gold Pin",
    start_date: new Date("2022-10-23T07:00:00.000Z"),
    end_date: new Date("2022-10-23T07:00:00.000Z"),
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    user_id: userId,
    bowl: dublinBowl,
  },
];
// the select adds a nested bowl and drops createdAt/updatedAt, so the rows
// don't match the full Tmnt type that findMany's mock expects
const asTmnts = (rows: unknown) => rows as Tmnt[];

// what the route should send to prisma.tmnt.findMany()
const expectedFindMany = (id: string) => ({
  where: { user_id: id },
  select: {
    id: true,
    tmnt_name: true,
    start_date: true,
    end_date: true,
    bowl_id: true,
    user_id: true,
    bowl: {
      select: {
        bowl_name: true,
        city: true,
        state: true,
        url: true,
      },
    },
  },
  orderBy: { start_date: "desc" },
});

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

beforeEach(() => {
  // default for every test: user is a logged-in director
  mockRequireDirector.mockResolvedValue(null);
});

describe("Tmnts - API: /api/tmnts/user/:userId", () => {
  describe("GET tmnts for user", () => {
    it("should get all tmnts for user", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(asTmnts(mockUserTmnts));

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toHaveLength(3);
      expect(body.tmnts).toEqual(toJson(mockUserTmnts));
      expect(body.tmnts[0].user_id).toBe(userId);
      expect(body.tmnts[2].user_id).toBe(userId);
      expect(body.tmnts[0].bowl).toEqual(dublinBowl);
    });

    it("should query by user_id, select tmnt and bowl columns, newest first", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(asTmnts(mockUserTmnts));

      await GET(getRequest(userId), ctx(userId));

      expect(prismaMock.tmnt.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith(
        expectedFindMany(userId)
      );
    });

    it("should return the tmnts in the order the database returns them", async () => {
      // sorting is done by orderBy in the database; the route must not re-sort
      prismaMock.tmnt.findMany.mockResolvedValue(asTmnts(mockUserTmnts));

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(body.tmnts.map((t: { id: string }) => t.id)).toEqual(
        mockUserTmnts.map((t) => t.id)
      );
    });

    it("should return 200 and an empty array when user_id is not found", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue([]);

      const response = await GET(getRequest(notFoundUserId), ctx(notFoundUserId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toHaveLength(0);
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith(
        expectedFindMany(notFoundUserId)
      );
    });

    it.each([
      { desc: "user_id is invalid", id: "test" },
      { desc: "user_id is valid, but not a user ID", id: nonUserId },
      { desc: "user_id is empty", id: "" },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      // invalid ids are rejected before the database is called
      expect(prismaMock.tmnt.findMany).not.toHaveBeenCalled();
    });

    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ message: "not logged in" });
      expect(prismaMock.tmnt.findMany).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual({ message: "not authorized" });
      expect(prismaMock.tmnt.findMany).not.toHaveBeenCalled();
    });

    it("should check auth before validating the user_id", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await GET(getRequest("test"), ctx("test"));

      // 401, not 404: auth runs first
      expect(response.status).toBe(401);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting tmnts for user - connection failed" });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.findMany.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest(userId), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "error getting tmnts for user" });
    });
  });
});
