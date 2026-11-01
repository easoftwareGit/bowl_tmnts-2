/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/results/[year]/route.ts using mocked prisma.
// No database or server needed.
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tmnts/results/[year]/route";
import { prismaMock } from "../../../../../prismaMock";
import { endOfToday } from "date-fns";
import { maxYear, minYear } from "@/lib/validation/constants";

// The URL only needs to be valid; the route reads the year from params, not the URL
const url = "http://localhost:3000/api/tmnts/results";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (year: string) => ({ params: Promise.resolve({ year }) });

// builds the GET request for a year, with optional skip and take query params
const getRequest = (year: string, query = "") =>
  new NextRequest(`${url}/${year}${query}`);

// NextResponse.json() converts Date objects to ISO strings, so compare the
// response body to a JSON round-tripped copy of the mock data
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

// rows shaped like the route's select: tmnt fields plus the bowl's fields,
// newest first like the route's orderBy
const mockResults = [
  {
    id: "tmt_fd99387c33d9c78aba290286576ddce5",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Gold Pin",
    start_date: new Date("2022-10-23T07:00:00.000Z"),
    bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    bowl: {
      bowl_name: "Earl Anthony's Dublin Bowl",
      city: "Dublin",
      state: "CA",
      url: "https://www.earlanthonysdublinbowl.com",
    },
  },
  {
    id: "tmt_56d916ece6b50e6293300248c6792316",
    user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    tmnt_name: "Yosemite Open",
    start_date: new Date("2022-01-02T08:00:00.000Z"),
    bowl_id: "bwl_8b4a5c35ad1247049532ff53a12def0a",
    bowl: {
      bowl_name: "Yosemite Lanes",
      city: "Modesto",
      state: "CA",
      url: "http://yosemitelanesbowling.com",
    },
  },
];

// the select the route sends to prisma
const expectedSelect = {
  id: true,
  user_id: true,
  tmnt_name: true,
  start_date: true,
  bowl_id: true,
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

describe("Tmnts - API: /api/tmnts/results/:year", () => {
  describe("GET", () => {
    it("should get the tmnt results for the year", async () => {
      // what prisma.tmnt.findMany() returns for this test
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      const response = await GET(getRequest("2022"), ctx("2022"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toHaveLength(2);
      expect(body.tmnts).toEqual(toJson(mockResults));
      // the bowl info is under "bowl" (singular)
      expect(body.tmnts[0].bowl.bowl_name).toBe("Earl Anthony's Dublin Bowl");
    });

    it("should ask the database for Jan 1st to Dec 31st (UTC) of a past year, newest first", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("2022"), ctx("2022"));

      // no skip or take in the URL, so both are undefined
      expect(prismaMock.tmnt.findMany).toHaveBeenCalledWith({
        where: {
          start_date: {
            lte: new Date("2022-12-31T23:59:59.999Z"),
            gte: new Date("2022-01-01T00:00:00.000Z"),
          },
        },
        orderBy: [{ start_date: "desc" }],
        select: expectedSelect,
        skip: undefined,
        take: undefined,
      });
    });

    it("should stop at the end of today when the year is the current year", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue([]);
      const thisYear = endOfToday().getFullYear().toString();

      await GET(getRequest(thisYear), ctx(thisYear));

      const args = findManyArgs();
      expect(args?.where?.start_date).toEqual({
        lte: endOfToday(),
        gte: new Date(`${thisYear}-01-01T00:00:00.000Z`),
      });
    });

    it("should pass skip and take to the database as numbers", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("2022", "?skip=10&take=5"), ctx("2022"));

      const args = findManyArgs();
      expect(args?.skip).toBe(10);
      expect(args?.take).toBe(5);
    });

    it("should pass only skip when take is missing", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("2022", "?skip=3"), ctx("2022"));

      const args = findManyArgs();
      expect(args?.skip).toBe(3);
      expect(args?.take).toBeUndefined();
    });

    it("should pass only take when skip is missing", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("2022", "?take=20"), ctx("2022"));

      const args = findManyArgs();
      expect(args?.skip).toBeUndefined();
      expect(args?.take).toBe(20);
    });

    it("should treat empty skip and take as not set", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue(mockResults as any);

      await GET(getRequest("2022", "?skip=&take="), ctx("2022"));

      const args = findManyArgs();
      expect(args?.skip).toBeUndefined();
      expect(args?.take).toBeUndefined();
    });

    it("should return an empty array when there are no tmnt results for the year", async () => {
      prismaMock.tmnt.findMany.mockResolvedValue([]);

      const response = await GET(getRequest("2000"), ctx("2000"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.tmnts).toEqual([]);
    });

    // runs the same test once for each invalid year
    it.each([
      ["not a number", "test"],
      ["less than minYear", (minYear - 1).toString()],
      ["more than maxYear", (maxYear + 1).toString()],
    ])(
      "should return 400 and not query the database when the year is %s",
      async (_label, year) => {
        const response = await GET(getRequest(year), ctx(year));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Invalid parameter" });
        expect(prismaMock.tmnt.findMany).not.toHaveBeenCalled();
      }
    );

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.findMany.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest("2022"), ctx("2022"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting tmnts - connection failed" });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.findMany.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest("2022"), ctx("2022"));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "error getting tmnts" });
    });
  });
});
