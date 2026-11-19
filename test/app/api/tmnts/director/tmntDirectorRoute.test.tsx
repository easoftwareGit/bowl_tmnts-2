/**
 * @jest-environment node
 */
// test/app/api/tmnts/director/tmntDirectorRoute.test.tsx
// Tests for src/app/api/tmnts/tmnt/[id]/director/route.ts using mocked prisma.
// No database or server needed.
// This is a PUBLIC route (no auth check), so there is no requireDirector mock.
import { GET } from "@/app/api/tmnts/tmnt/[id]/director/route";
import { prismaMock } from "../../../../prismaMock";

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/tmnts/tmnt";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// builds the GET request for a tmnt's director
const getRequest = (id: string) => new Request(`${url}/${id}/director`);

const tmntId = "tmt_fd99387c33d9c78aba290286576ddce5";
const notFoundId = "tmt_01234567890123456789012345678901"; // valid format, not in "db"
const nonTmntId = "usr_01234567890123456789012345678901"; // valid format, wrong table

// the only 4 user fields the route may ask for and return
const whitelist = ["email", "first_name", "last_name", "phone"];

// what prisma returns for the select in the route: { users: { 4 fields } }
const director = {
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  phone: "+18005551212",
};

// the exact query the route must send to prisma
const expectedQuery = (id: string) => ({
  where: { id },
  select: {
    users: {
      select: {
        first_name: true,
        last_name: true,
        email: true,
        phone: true,
      },
    },
  },
});

describe("Tmnts - API: /api/tmnts/tmnt/:id/director", () => {
  describe("GET", () => {
    it("should get the director for a tmnt", async () => {
      // the mock only holds the selected fields, not a full Tmnt row
      prismaMock.tmnt.findUnique.mockResolvedValue({ users: director } as never);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ director });
    });

    it("should ask the database for only the 4 whitelisted user fields", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue({ users: director } as never);

      await GET(getRequest(tmntId), ctx(tmntId));

      expect(prismaMock.tmnt.findUnique).toHaveBeenCalledTimes(1);
      // exact match: any extra field (id, role, password_hash...) fails this
      expect(prismaMock.tmnt.findUnique).toHaveBeenCalledWith(expectedQuery(tmntId));

      // also check the select keys directly, so a failure names the field
      const args = prismaMock.tmnt.findUnique.mock.calls[0][0];
      const userSelect = (
        args.select?.users as { select: Record<string, boolean> } | undefined
      )?.select;
      expect(Object.keys(userSelect ?? {}).sort()).toEqual(whitelist);
      // only the users relation is selected from tmnt, no tmnt columns
      expect(Object.keys(args.select ?? {})).toEqual(["users"]);
    });

    it("should return only the 4 whitelisted fields", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue({ users: director } as never);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(Object.keys(body)).toEqual(["director"]);
      expect(Object.keys(body.director).sort()).toEqual(whitelist);
      expect(body.director).not.toHaveProperty("id");
      expect(body.director).not.toHaveProperty("role");
      expect(body.director).not.toHaveProperty("password_hash");
    });

    it("should return phone as null when the director has no phone", async () => {
      // phone is optional (String?) in the User model
      const noPhone = { ...director, phone: null };
      prismaMock.tmnt.findUnique.mockResolvedValue({ users: noPhone } as never);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.director).toEqual(noPhone);
      expect(Object.keys(body.director).sort()).toEqual(whitelist);
    });

    it("should return 404 when the tmnt is not found", async () => {
      prismaMock.tmnt.findUnique.mockResolvedValue(null);

      const response = await GET(getRequest(notFoundId), ctx(notFoundId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
      expect(prismaMock.tmnt.findUnique).toHaveBeenCalledWith(
        expectedQuery(notFoundId),
      );
    });

    it("should return 404 when the tmnt has no director", async () => {
      // users is required in the schema, but the route guards against it
      prismaMock.tmnt.findUnique.mockResolvedValue({ users: null } as never);

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
    });

    it.each([
      { desc: "ID is invalid", id: "test" },
      { desc: "ID is valid, but not a tmnt ID", id: nonTmntId },
      { desc: "ID is empty", id: "" },
    ])("should return 404 when $desc", async ({ id }) => {
      const response = await GET(getRequest(id), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      // bad ids never reach the database
      expect(prismaMock.tmnt.findUnique).not.toHaveBeenCalled();
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.tmnt.findUnique.mockRejectedValue(new Error("connection failed"));

      const response = await GET(getRequest(tmntId), ctx(tmntId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "Error getting tournament director - connection failed",
      });
    });

    it("should return 404 for a Prisma 'record not found' error", async () => {
      // standardCatchReturn only checks err.code, so a plain object works
      prismaMock.tmnt.findUnique.mockRejectedValue({ code: "P2025" });

      const response = await GET(getRequest(tmntId), ctx(tmntId));

      expect(response.status).toBe(404);
    });
  });
});
