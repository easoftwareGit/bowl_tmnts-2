/**
 * @jest-environment node
 */
// Tests for src/app/api/bowls/bowl/[id]/route.ts using mocked prisma and auth.
// No database or server needed.
import { NextResponse } from "next/server";
import type { Bowl } from "@prisma/client";
import { GET, PUT, PATCH, DELETE } from "@/app/api/bowls/bowl/[id]/route";
import { prismaMock } from "../../../prismaMock";
import { mockBowls } from "../../../mocks/bowls/mockBowls";
import { requireDirector } from "@/lib/auth/requireDirector";
import {
  maxBowlNameLemgth,
  maxCityLength,
  maxStateLength,
  maxUrlLength,
} from "@/lib/validation/constants";

// Replace the auth check with a mock function each test can control
jest.mock("@/lib/auth/requireDirector", () => ({
  requireDirector: jest.fn(),
}));
const mockRequireDirector = requireDirector as jest.MockedFunction<
  typeof requireDirector
>;

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/bowls/bowl";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// builds a request with an optional JSON body
const jsonRequest = (method: string, body?: unknown) =>
  new Request(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// NextResponse.json() converts Date objects to ISO strings
const toJson = <T,>(data: T) => JSON.parse(JSON.stringify(data));

// mockBowls is sorted by bowl_name: [1] is Diablo Lanes
const diablo = mockBowls[1];
const notFoundId = "bwl_01234567890123456789012345678901"; // valid format, not in "db"
const nonBowlId = "tmt_01234567890123456789012345678901"; // valid format, wrong table

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

beforeEach(() => {
  // default for every test: user is a logged-in director
  mockRequireDirector.mockResolvedValue(null);
});

describe("Bowls - API: /api/bowls/bowl/:id", () => {
  // ---------------------------------------------------------------- GET
  describe("GET by ID", () => {
    it("should get a bowl by ID", async () => {
      prismaMock.bowl.findUnique.mockResolvedValue(diablo);

      const response = await GET(jsonRequest("GET"), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.bowl).toEqual(toJson(diablo));
      expect(prismaMock.bowl.findUnique).toHaveBeenCalledWith({
        where: { id: diablo.id },
      });
    });

    it.each([
      { desc: "ID is invalid", id: "invalid" },
      { desc: "ID is valid, but not a bowl ID", id: nonBowlId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(jsonRequest("GET"), ctx(id));

      expect(response.status).toBe(404);
      // invalid ids are rejected before the database is called
      expect(prismaMock.bowl.findUnique).not.toHaveBeenCalled();
    });

    it("should return 404 when ID is not found", async () => {
      prismaMock.bowl.findUnique.mockResolvedValue(null);

      const response = await GET(jsonRequest("GET"), ctx(notFoundId));

      expect(response.status).toBe(404);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.bowl.findUnique.mockRejectedValue(new Error("connection failed"));

      const response = await GET(jsonRequest("GET"), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error getting bowl - connection failed" });
    });
  });

  // ---------------------------------------------------------------- PUT
  describe("PUT by ID", () => {
    const putData = {
      bowl_name: "Updated Bowl Name",
      city: "Updated City",
      state: "US",
      url: "https://www.updated.com",
    };

    // what the route should send to prisma.bowl.upsert()
    const expectedUpsert = (id: string, data: typeof putData) => ({
      where: { id },
      update: data,
      create: { id, ...data },
    });

    it("should update (or insert) a bowl by ID", async () => {
      // upsert covers both update and insert; which one happens is the database's job
      prismaMock.bowl.upsert.mockResolvedValue({ ...diablo, ...putData });

      const response = await PUT(jsonRequest("PUT", putData), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.bowl).toEqual(toJson({ ...diablo, ...putData }));
      expect(prismaMock.bowl.upsert).toHaveBeenCalledWith(
        expectedUpsert(diablo.id, putData)
      );
    });

    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await PUT(jsonRequest("PUT", putData), ctx(diablo.id));

      expect(response.status).toBe(401);
      expect(prismaMock.bowl.upsert).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await PUT(jsonRequest("PUT", putData), ctx(diablo.id));

      expect(response.status).toBe(403);
      expect(prismaMock.bowl.upsert).not.toHaveBeenCalled();
    });

    it.each([
      { desc: "ID is invalid", id: "invalid" },
      { desc: "ID is valid, but not a bowl ID", id: nonBowlId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await PUT(jsonRequest("PUT", putData), ctx(id));

      expect(response.status).toBe(404);
      expect(prismaMock.bowl.upsert).not.toHaveBeenCalled();
    });

    it.each(["bowl_name", "city", "state", "url"])(
      "should return 422 when %s is missing",
      async (field) => {
        const response = await PUT(
          jsonRequest("PUT", { ...putData, [field]: "" }),
          ctx(diablo.id)
        );

        expect(response.status).toBe(422);
        expect(prismaMock.bowl.upsert).not.toHaveBeenCalled();
      }
    );

    it("should return 422 when url is invalid", async () => {
      const response = await PUT(
        jsonRequest("PUT", { ...putData, url: "invalid url" }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(422);
      expect(prismaMock.bowl.upsert).not.toHaveBeenCalled();
    });

    it("should update a bowl with sanitized data", async () => {
      const toSanitize = {
        bowl_name: "   <script>Test Bowl Name</script>  ",
        city: "%3Cdiv%3ETest City%3C/div%3E%20%3Cp%3E!%3C/p%3E",
        state: "**** TS ****",
        url: "http://example.com/<script>alert('XSS')</script>",
      };
      const sanitized = {
        bowl_name: "scriptTest Bowl Namescript",
        city: "CdivETest CityCdivECpECpE",
        state: "TS",
        url: "http://example.com/%3Cscript%3Ealert('XSS')%3C/script%3E",
      };
      prismaMock.bowl.upsert.mockResolvedValue({ ...diablo, ...sanitized });

      const response = await PUT(jsonRequest("PUT", toSanitize), ctx(diablo.id));

      expect(response.status).toBe(200);
      // the real check: SANITIZED data was sent to the database
      expect(prismaMock.bowl.upsert).toHaveBeenCalledWith(
        expectedUpsert(diablo.id, sanitized)
      );
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.bowl.upsert.mockRejectedValue(new Error("connection failed"));

      const response = await PUT(jsonRequest("PUT", putData), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error upserting bowl - connection failed" });
    });
  });

  // ---------------------------------------------------------------- PATCH
  describe("PATCH by ID", () => {
    // what the route should send to prisma.bowl.update():
    // only the patched field has a value; the rest are undefined (left unchanged)
    const expectedUpdate = (id: string, field: string, value: string) => ({
      where: { id },
      data: {
        bowl_name: undefined,
        city: undefined,
        state: undefined,
        url: undefined,
        [field]: value,
      },
    });

    it.each([
      { field: "bowl_name", value: "new name" },
      { field: "city", value: "new city" },
      { field: "state", value: "NS" },
      { field: "url", value: "http://newurl.com" },
    ])("should patch $field", async ({ field, value }) => {
      const patched = { ...diablo, [field]: value } as Bowl;
      prismaMock.bowl.update.mockResolvedValue(patched);

      const response = await PATCH(
        jsonRequest("PATCH", { [field]: value }),
        ctx(diablo.id)
      );
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.bowl).toEqual(toJson(patched));
      expect(prismaMock.bowl.update).toHaveBeenCalledWith(
        expectedUpdate(diablo.id, field, value)
      );
    });

    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await PATCH(
        jsonRequest("PATCH", { bowl_name: "new name" }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(401);
      expect(prismaMock.bowl.update).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await PATCH(
        jsonRequest("PATCH", { bowl_name: "new name" }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(403);
      expect(prismaMock.bowl.update).not.toHaveBeenCalled();
    });

    it.each([
      { desc: "ID is invalid", id: "invalid" },
      { desc: "ID is valid, but not a bowl ID", id: nonBowlId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await PATCH(
        jsonRequest("PATCH", { bowl_name: "new name" }),
        ctx(id)
      );

      expect(response.status).toBe(404);
      expect(prismaMock.bowl.update).not.toHaveBeenCalled();
    });

    it("should return 404 when ID is not found", async () => {
      // prisma.update() throws P2025 when the record doesn't exist
      prismaMock.bowl.update.mockRejectedValue({ code: "P2025" });

      const response = await PATCH(
        jsonRequest("PATCH", { bowl_name: "new name" }),
        ctx(notFoundId)
      );

      expect(response.status).toBe(404);
    });

    it("should return 400 when just passing in id, no patching done", async () => {
      const response = await PATCH(
        jsonRequest("PATCH", { id: diablo.id }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(400);
      expect(prismaMock.bowl.update).not.toHaveBeenCalled();
    });

    it.each(["bowl_name", "city", "state", "url"])(
      "should return 422 when %s is missing",
      async (field) => {
        const response = await PATCH(
          jsonRequest("PATCH", { [field]: "" }),
          ctx(diablo.id)
        );

        expect(response.status).toBe(422);
        expect(prismaMock.bowl.update).not.toHaveBeenCalled();
      }
    );

    it.each([
      { field: "bowl_name", max: maxBowlNameLemgth },
      { field: "city", max: maxCityLength },
      { field: "state", max: maxStateLength },
      { field: "url", max: maxUrlLength },
    ])("should return 422 when $field is too long", async ({ field, max }) => {
      const response = await PATCH(
        jsonRequest("PATCH", { [field]: "a".repeat(max + 1) }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(422);
      expect(prismaMock.bowl.update).not.toHaveBeenCalled();
    });

    it.each([
      { field: "bowl_name", input: "<script>alert(1)</script>", expected: "scriptalert(1)script" },
      { field: "city", input: "   test city  ****", expected: "test city" },
      { field: "state", input: "   TS  ****", expected: "TS" },
      {
        field: "url",
        input: "http://example.com/<script>alert('XSS')</script>",
        expected: "http://example.com/%3Cscript%3Ealert('XSS')%3C/script%3E",
      },
    ])("should patch with sanitized $field", async ({ field, input, expected }) => {
      prismaMock.bowl.update.mockResolvedValue({ ...diablo, [field]: expected } as Bowl);

      const response = await PATCH(
        jsonRequest("PATCH", { [field]: input }),
        ctx(diablo.id)
      );

      expect(response.status).toBe(200);
      // the real check: SANITIZED value was sent to the database
      expect(prismaMock.bowl.update).toHaveBeenCalledWith(
        expectedUpdate(diablo.id, field, expected)
      );
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.bowl.update.mockRejectedValue(new Error("connection failed"));

      const response = await PATCH(
        jsonRequest("PATCH", { bowl_name: "new name" }),
        ctx(diablo.id)
      );
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error patching bowl - connection failed" });
    });
  });

  // ---------------------------------------------------------------- DELETE
  describe("DELETE by ID", () => {
    it("should delete a bowl by ID", async () => {
      prismaMock.bowl.deleteMany.mockResolvedValue({ count: 1 });

      const response = await DELETE(jsonRequest("DELETE"), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.count).toBe(1);
      expect(prismaMock.bowl.deleteMany).toHaveBeenCalledWith({
        where: { id: diablo.id },
      });
    });

    it("should return count 0 when ID is not found", async () => {
      prismaMock.bowl.deleteMany.mockResolvedValue({ count: 0 });

      const response = await DELETE(jsonRequest("DELETE"), ctx(notFoundId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.count).toBe(0);
    });

    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await DELETE(jsonRequest("DELETE"), ctx(diablo.id));

      expect(response.status).toBe(401);
      expect(prismaMock.bowl.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await DELETE(jsonRequest("DELETE"), ctx(diablo.id));

      expect(response.status).toBe(403);
      expect(prismaMock.bowl.deleteMany).not.toHaveBeenCalled();
    });

    it.each([
      { desc: "ID is invalid", id: "invalid" },
      { desc: "ID is valid, but not a bowl ID", id: nonBowlId },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await DELETE(jsonRequest("DELETE"), ctx(id));

      expect(response.status).toBe(404);
      expect(prismaMock.bowl.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.bowl.deleteMany.mockRejectedValue(new Error("connection failed"));

      const response = await DELETE(jsonRequest("DELETE"), ctx(diablo.id));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error deleting bowl - connection failed" });
    });
  });
});