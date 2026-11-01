/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/route.ts using mocked prisma.
// No database or server needed.
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tmnts/route";
import { prismaMock } from "../../../prismaMock";

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/tmnts";

// NextResponse.json() converts Date objects to ISO strings, so compare the
// response body to a JSON round-tripped copy of the mock data
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

// fixed dates for the rows prisma "returns"
const dates = {
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

// rows shaped like the Tmnt model in prisma/schema.prisma
const mockTmnts = [
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    tmnt_name: "Gold Pin",
    start_date: new Date("2022-10-23T07:00:00.000Z"),
    end_date: new Date("2022-10-23T07:00:00.000Z"),
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    ...dates,
  },
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",
    tmnt_name: "Yosemite 6 Gamer",
    start_date: new Date("2022-01-02T08:00:00.000Z"),
    end_date: new Date("2022-01-02T08:00:00.000Z"),
    user_id: "usr_516a113083983234fc316e31fb695b85",
    bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    ...dates,
  },
  {
    id: "tmt_d9b1af944d4941f65b2d2d4ac160cdea",
    tmnt_name: "Coconut 5 Gamer",
    start_date: new Date("2022-08-21T07:00:00.000Z"),
    end_date: new Date("2022-08-21T07:00:00.000Z"),
    user_id: "usr_a24894ed10c5dd835d5cbbfea7ac6dca",
    bowl_id: "bwl_ff4cd62b03f24017beea81c1d6e047e7",
    ...dates,
  },
  {
    id: "tmt_718fe20f53dd4e539692c6c64f991bbe",
    tmnt_name: "2-Day event",
    start_date: new Date("2023-12-20T08:00:00.000Z"),
    end_date: new Date("2023-12-21T08:00:00.000Z"),
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    ...dates,
  },
];

describe("Tmnts - API: /api/tmnts", () => {
  describe("GET", () => {
    it("should get all tmnts", async () => {
      // what prisma.tmnt.findMany() returns for this test
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts);

      const response = await GET(new NextRequest(url));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toHaveLength(4);
      expect(body.tmnts).toEqual(toJson(mockTmnts));
    });

    it("should not pass skip or take when they are not in the url", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts);

      await GET(new NextRequest(url));

      expect(prismaMock.tmnt.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
      });
    });

    it("should pass skip and take to the database as numbers", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts.slice(1, 3));

      const response = await GET(new NextRequest(url + "?skip=1&take=2"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toEqual(toJson(mockTmnts.slice(1, 3)));
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        skip: 1,
        take: 2,
      });
    });

    it("should pass only skip when take is not in the url", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts.slice(2));

      await GET(new NextRequest(url + "?skip=2"));

      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        skip: 2,
        take: undefined,
      });
    });

    it("should pass only take when skip is not in the url", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts.slice(0, 3));

      await GET(new NextRequest(url + "?take=3"));

      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: 3,
      });
    });

    it("should treat empty skip and take as not set", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockTmnts);

      await GET(new NextRequest(url + "?skip=&take="));

      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
      });
    });

    it("should return an empty array when there are no tmnts", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue([]);

      const response = await GET(new NextRequest(url));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toEqual([]);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(new NextRequest(url));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting tmnts - connection failed" });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.findMany.mockRejectedValue({ code: "P2025" });

      const response = await GET(new NextRequest(url));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "error getting tmnts" });
    });
  });
});
