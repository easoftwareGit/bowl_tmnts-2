/**
 * @jest-environment node
 */
// Tests for src/app/api/tmnts/tmnt/[id]/route.ts using mocked prisma and auth.
// No database or server needed.
import { NextResponse } from "next/server";
import { DELETE } from "@/app/api/tmnts/tmnt/[id]/route";
import { prismaMock } from "../../../../prismaMock";
import { requireDirector } from "@/lib/auth/requireDirector";

// Replace the auth check with a mock function each test can control
jest.mock("@/lib/auth/requireDirector", () => ({
  requireDirector: jest.fn(),
}));
const mockRequireDirector = requireDirector as jest.MockedFunction<
  typeof requireDirector
>;

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/tmnts/tmnt";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// builds the DELETE request for a tmnt
const deleteRequest = (id: string) =>
  new Request(`${url}/${id}`, { method: "DELETE" });

const toDelTmntId = "tmt_e134ac14c5234d708d26037ae812ac33";
const notFoundId = "tmt_01234567890123456789012345678901"; // valid format, not in "db"
const nonTmntId = "evt_01234567890123456789012345678901"; // valid format, wrong table

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

beforeEach(() => {
  // default for every test: user is a logged-in director
  mockRequireDirector.mockResolvedValue(null);
});

describe("Tmnts - API: /api/tmnts/tmnt/:id", () => {
  describe("DELETE by ID", () => {
    it("should delete a tmnt by ID", async () => {
      prismaMock.tmnt.deleteMany.mockResolvedValue({ count: 1 });

      const response = await DELETE(deleteRequest(toDelTmntId), ctx(toDelTmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ count: 1 });
      expect(prismaMock.tmnt.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.tmnt.deleteMany).toHaveBeenCalledWith({
        where: { id: toDelTmntId },
      });
    });

    it("should return count 0 when ID is not found", async () => {
      prismaMock.tmnt.deleteMany.mockResolvedValue({ count: 0 });

      const response = await DELETE(deleteRequest(notFoundId), ctx(notFoundId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ count: 0 });
      expect(prismaMock.tmnt.deleteMany).toHaveBeenCalledWith({
        where: { id: notFoundId },
      });
    });

    it.each([
      { desc: "ID is invalid", id: "test" },
      { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
      { desc: "ID is empty", id: "" },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await DELETE(deleteRequest(id), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      // invalid ids are rejected before the database is called
      expect(prismaMock.tmnt.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 401 when not logged in", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await DELETE(deleteRequest(toDelTmntId), ctx(toDelTmntId));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toEqual({ message: "not logged in" });
      expect(prismaMock.tmnt.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 403 when the user is not a director or admin", async () => {
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await DELETE(deleteRequest(toDelTmntId), ctx(toDelTmntId));
      const body = await response.json();

      expect(response.status).toBe(403);
      expect(body).toEqual({ message: "not authorized" });
      expect(prismaMock.tmnt.deleteMany).not.toHaveBeenCalled();
    });

    it("should check auth before validating the ID", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      const response = await DELETE(deleteRequest("test"), ctx("test"));

      // 401, not 404: auth runs first
      expect(response.status).toBe(401);
      expect(prismaMock.tmnt.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.deleteMany.mockRejectedValue(new Error("connection failed"));

      const response = await DELETE(deleteRequest(toDelTmntId), ctx(toDelTmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "error deleting tmnt - connection failed" });
    });

    it("should return 409 for a Prisma foreign key error", async () => {
      // e.g. child rows reference the tmnt and the relation does not cascade;
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.deleteMany.mockRejectedValue({ code: "P2003" });

      const response = await DELETE(deleteRequest(toDelTmntId), ctx(toDelTmntId));
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body).toEqual({ message: "error deleting tmnt" });
    });
  });
});
