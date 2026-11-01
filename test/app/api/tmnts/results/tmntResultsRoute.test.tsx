/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/results/route.ts using mocked prisma.
// No database or server needed.
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tmnts/results/route";
import { prismaMock } from "../../../../prismaMock";
import { endOfDayFromString, todayStr } from "@/lib/dateTools";

// The URL only needs to be valid; no server is running
const url = "http://localhost:3000/api/tmnts/results";

// builds the GET request, with optional skip and take query params
const getRequest = (query = "") => new NextRequest(url + query);

// NextResponse.json() converts Date objects to ISO strings, so compare the
// response body to a JSON round-tripped copy of the mock data
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

// rows shaped like the route's select: tmnt fields plus the bowl's fields,
// newest first like the route's orderBy
const mockResults = [
  {
    id: "tmt_0123388a8fc4641a2e37233f1d6bebd1",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Christmas Classic",
    start_date: new Date("2024-12-20T08:00:00.000Z"),
    bowl: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanesbowling.com",
    },
  },
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    start_date: new Date("2022-10-23T07:00:00.000Z"),
    bowl: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
    },
  },
];

// the select the route sends to prisma
const expectedSelect = {
  id: true,
  user_id: true,
  tmnt_name: true,
  start_date: true,
  bowl: {
    select: {
      bowl_name: true,
      city: true,
      state: true,
      url: true,
    },
  },
};

// returns the one argument object passed to prisma.tmnt.findMany()
const findManyArgs = () => {
  expect(prismaMock.tmnt.findMany).toHaveBeenCalledTimes(1);
  return prismaMock.tmnt.findMany.mock.calls[0][0];
};

describe("Tmnts - API: /api/tmnts/results", () => {
  describe("GET", () => {
    it("should get the tmnt results", async () => {
      // what prisma.tmnt.findMany() returns for this test
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      const response = await GET(getRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toHaveLength(2);
      expect(body.tmnts).toEqual(toJson(mockResults));
      // the bowl info is under "bowl" (singular)
      expect(body.tmnts[0].bowl.bowl_name).toBe("Yosemite Lanes");
    });

    it("should ask the database for tmnts up to the end of today, newest first", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest());

      // no skip or take in the URL, so both are undefined
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        where: {
          start_date: {
            lte: endOfDayFromString(todayStr),
          },
        },
        orderBy: [{ start_date: "desc" }],
        select: expectedSelect,
        skip: undefined,
        take: undefined,
      });
    });

    it("should pass skip and take to the database as numbers", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("?skip=10&take=5"));

      const args = findManyArgs();
      expect(args?.skip).toBe(10);
      expect(args?.take).toBe(5);
    });

    it("should pass only skip when take is missing", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("?skip=3"));

      const args = findManyArgs();
      expect(args?.skip).toBe(3);
      expect(args?.take).toBeUndefined();
    });

    it("should pass only take when skip is missing", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("?take=20"));

      const args = findManyArgs();
      expect(args?.skip).toBeUndefined();
      expect(args?.take).toBe(20);
    });

    it("should treat empty skip and take as not set", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("?skip=&take="));

      const args = findManyArgs();
      expect(args?.skip).toBeUndefined();
      expect(args?.take).toBeUndefined();
    });

    it("should return an empty array when there are no tmnt results", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue([]);

      const response = await GET(getRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toEqual([]);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest());
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting tmnts - connection failed" });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.findMany.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest());
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "error getting tmnts" });
    });
  });
});
