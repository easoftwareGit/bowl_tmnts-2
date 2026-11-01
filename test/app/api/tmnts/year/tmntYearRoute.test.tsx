/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/years/[year]/route.ts using mocked prisma.
// No database or server needed.
import { NextRequest } from "next/server";
import { GET } from "@/app/api/tmnts/years/[year]/route";
import { prismaMock } from "../../../../prismaMock";
import { endOfDayFromString } from "@/lib/dateTools";

// The URL only needs to be valid; the route reads the year from params, not the URL
const url = "http://localhost:3000/api/tmnts/years";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (year: string) => ({ params: Promise.resolve({ year }) });

// builds the GET request for a year
const getRequest = (year: string) => new NextRequest(`${url}/${year}`);

// rows shaped like the raw SQL result: SELECT DISTINCT ... AS "year"
const mockYears = [{ year: 2024 }, { year: 2023 }, { year: 2022 }];

describe("Tmnts - API: /api/tmnts/years/:year", () => {
  describe("GET", () => {
    it("should get the tmnt years up to and including the year", async () => {
      // what prisma.$queryRawUnsafe() returns for this test
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockYears);

      const response = await GET(getRequest("2024"), ctx("2024"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.years).toHaveLength(3);
      expect(body.years).toEqual(mockYears);
    });

    it("should pass the end of the last day of the year to the database", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockYears);

      await GET(getRequest("2024"), ctx("2024"));

      expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledTimes(1);
      const [sql, lastDOY] = prismaMock.$queryRawUnsafe.mock.calls[0];
      // the year is passed as a $1 parameter, never put in the SQL text
      expect(sql).toContain("$1");
      expect(sql).not.toContain("2024");
      expect(lastDOY).toEqual(endOfDayFromString("2024-12-31"));
    });

    it("should query distinct years from Tmnt, newest first", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue(mockYears);

      await GET(getRequest("2024"), ctx("2024"));

      const [sql] = prismaMock.$queryRawUnsafe.mock.calls[0];
      expect(sql).toMatch(/SELECT DISTINCT/i);
      expect(sql).toContain('FROM "Tmnt"');
      expect(sql).toMatch(/start_date\s*<=\s*\$1/);
      expect(sql).toMatch(/ORDER BY "year" DESC/i);
    });

    it("should return an empty array when there are no tmnts", async () => {
      prismaMock.$queryRawUnsafe.mockResolvedValue([]);

      const response = await GET(getRequest("2024"), ctx("2024"));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.years).toEqual([]);
    });

    // runs the same test once for each invalid year
    it.each(["", "abcd", "20a4", "24", "20244", "2024; DROP TABLE"])(
      "should return 400 and not query the database for invalid year '%s'",
      async (year) => {
        const response = await GET(getRequest(year), ctx(year));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Invalid parameter" });
        expect(prismaMock.$queryRawUnsafe).not.toHaveBeenCalled();
      }
    );

    it("should return 500 when the database throws", async () => {
      prismaMock.$queryRawUnsafe.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest("2024"), ctx("2024"));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting years - connection failed" });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.$queryRawUnsafe.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest("2024"), ctx("2024"));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ message: "error getting years" });
    });
  });
});
