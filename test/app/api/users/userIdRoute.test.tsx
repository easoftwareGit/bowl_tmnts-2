/**
 * @jest-environment node
 */
// Tests for src/app/api/users/user/[id]/route.ts using mocked prisma, auth and doHash.
// The real sanitizeUser, validateUser, toPublicUser and publicUserWithHashSelect run.
// No database or server needed.
//
// Auth:
//   GET          -> requireSelfOrDirector(id): the user themself, or a director/admin
//   PATCH/DELETE -> requireDirector(): a director/admin only
import { NextResponse } from "next/server";
import type { Prisma, User } from "@prisma/client";
import { GET, PATCH, DELETE } from "@/app/api/users/user/[id]/route";
import { prismaMock } from "../../../prismaMock";
import { doHash } from "@/lib/server/hashServer";
import { requireDirector, requireSelfOrDirector } from "@/lib/auth/guards";
import { publicUserWithHashSelect } from "@/lib/server/publicUser";
import {
  maxEmailLength,
  maxFirstNameLength,
  maxLastNameLength,
  maxPhoneLength,
} from "@/lib/validation/constants";

// Replace the auth checks with mock functions each test can control
jest.mock("@/lib/auth/guards", () => ({
  requireDirector: jest.fn(),
  requireSelfOrDirector: jest.fn(),
}));
const mockRequireDirector = requireDirector as jest.MockedFunction<
  typeof requireDirector
>;
const mockRequireSelfOrDirector = requireSelfOrDirector as jest.MockedFunction<
  typeof requireSelfOrDirector
>;

// Replace password hashing with a mock so tests are fast and predictable
jest.mock("@/lib/server/hashServer", () => ({
  doHash: jest.fn(),
}));
const mockDoHash = doHash as jest.MockedFunction<typeof doHash>;

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/users/user";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// builds a request with an optional JSON body
const jsonRequest = (method: string, body?: unknown) =>
  new Request(url, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });

// builds a request with a raw (possibly invalid) text body
const rawRequest = (method: string, body: string) =>
  new Request(url, {
    method,
    body,
    headers: { "Content-Type": "application/json" },
  });

const hashedPassword = "hashed-Test123!";
const newHashedPassword = "hashed-321Test!";

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundId = "usr_01234567890123456789012345678901"; // valid format, not in "db"
const nonUserId = "tmt_01234567890123456789012345678901"; // valid format, wrong table

// what prisma returns when the route uses select: publicUserWithHashSelect
type SelectedUser = Prisma.UserGetPayload<{
  select: typeof publicUserWithHashSelect;
}>;

// prismaMock types findUnique/update as returning a full User, but with a
// select prisma only returns the selected fields, so cast the selected row.
const dbRow = (row: SelectedUser) => row as unknown as User;

// a row shaped like what the route's select returns
const adamRow: SelectedUser = {
  id: userId,
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "ADMIN",
  password_hash: hashedPassword,
};

// a full row, like prisma returns with NO select (used to prove toPublicUser
// still strips the private fields if a select is ever removed)
const adamFullRow: User = {
  ...adamRow,
  failed_pwd_attempts: 5,
  pwd_locked_until: new Date("2026-12-31T00:00:00.000Z"),
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

// the only fields the browser should ever get
const publicKeys = [
  "email",
  "first_name",
  "has_password",
  "id",
  "last_name",
  "phone",
  "role",
].sort();

// what toPublicUser(row) should send to the browser
const toPublic = (row: SelectedUser) => {
  const { password_hash: hash, ...rest } = row;
  return { ...rest, has_password: !!hash };
};

// checks a response body never leaks the password, its hash or the lockout fields
const expectNoSecrets = (body: unknown, ...secrets: string[]) => {
  const text = JSON.stringify(body);
  expect(text).not.toContain("password_hash");
  expect(text).not.toContain("failed_pwd_attempts");
  expect(text).not.toContain("pwd_locked_until");
  secrets.forEach((secret) => expect(text).not.toContain(secret));
};

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

beforeEach(() => {
  // default for every test: user is a logged-in director (so both auth
  // checks pass), hashing works
  mockRequireDirector.mockReset();
  mockRequireDirector.mockResolvedValue(null);
  mockRequireSelfOrDirector.mockReset();
  mockRequireSelfOrDirector.mockResolvedValue(null);
  mockDoHash.mockReset();
  mockDoHash.mockImplementation(
    async (password: string) => "hashed-" + password,
  );
});

describe("Users - API: /api/users/user/:id", () => {
  describe("GET", () => {
    it("should get a user by ID", async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.user).toEqual(toPublic(adamRow));
    });

    it("should only select the public fields and password_hash", async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

      await GET(jsonRequest("GET"), ctx(userId));

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: publicUserWithHashSelect,
      });
    });

    it("should return only the public fields", async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(Object.keys(body.user).sort()).toEqual(publicKeys);
    });

    it("should check that the caller is the user themself or a director", async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

      await GET(jsonRequest("GET"), ctx(userId));

      expect(mockRequireSelfOrDirector).toHaveBeenCalledTimes(1);
      expect(mockRequireSelfOrDirector).toHaveBeenCalledWith(userId);
    });

    it("should not use the director-only check", async () => {
      // a regular USER reading their own account: the self check allows it,
      // and the director-only check must not be consulted
      mockRequireDirector.mockResolvedValue(notAuthorized());
      prismaMock.user.findUnique.mockResolvedValue(
        dbRow({ ...adamRow, role: "USER" }),
      );

      const response = await GET(jsonRequest("GET"), ctx(userId));

      expect(response.status).toBe(200);
      expect(mockRequireDirector).not.toHaveBeenCalled();
    });

    it.each([
      ["not logged in", notLoggedIn, 401],
      ["not the user and not a director", notAuthorized, 403],
    ] as const)(
      "should return %s error and not touch the database",
      async (_label, authError, status) => {
        mockRequireSelfOrDirector.mockResolvedValue(authError());

        const response = await GET(jsonRequest("GET"), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(status);
        expect(body).toEqual(await authError().json());
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      },
    );

    it("should check auth before checking the ID", async () => {
      mockRequireSelfOrDirector.mockResolvedValue(notLoggedIn());

      // an invalid id would give 404 if it were checked first
      const response = await GET(jsonRequest("GET"), ctx("test"));

      expect(response.status).toBe(401);
      expect(mockRequireSelfOrDirector).toHaveBeenCalledWith("test");
    });

    it("should return 500 when the auth check throws", async () => {
      mockRequireSelfOrDirector.mockRejectedValue(new Error("auth failed"));

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "Error getting user by id - auth failed",
      });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("should return has_password true and never the password hash", async () => {
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(body.user.has_password).toBe(true);
      expect(body.user).not.toHaveProperty("password_hash");
      expectNoSecrets(body, hashedPassword);
    });

    it.each([
      ["null", null],
      ["empty", ""],
    ] as const)(
      "should return has_password false when password_hash is %s",
      async (_label, hash) => {
        prismaMock.user.findUnique.mockResolvedValue(
          dbRow({ ...adamRow, password_hash: hash }),
        );

        const response = await GET(jsonRequest("GET"), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user.has_password).toBe(false);
      },
    );

    it("should never return private fields even if the database returns them", async () => {
      // e.g. if the select were removed from the route
      prismaMock.user.findUnique.mockResolvedValue(adamFullRow);

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.user).not.toHaveProperty("password_hash");
      expect(body.user).not.toHaveProperty("failed_pwd_attempts");
      expect(body.user).not.toHaveProperty("pwd_locked_until");
      expectNoSecrets(body, hashedPassword, "2026-12-31T00:00:00.000Z");
    });

    it.each([
      ["invalid", "test"],
      ["valid, but not a user ID", nonUserId],
    ])("should NOT get a user when ID is %s", async (_label, id) => {
      const response = await GET(jsonRequest("GET"), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
    });

    it("should NOT get a user when ID is not found", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const response = await GET(jsonRequest("GET"), ctx(notFoundId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.user.findUnique.mockRejectedValue(
        new Error("connection failed"),
      );

      const response = await GET(jsonRequest("GET"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "Error getting user by id - connection failed",
      });
    });
  });

  describe("PATCH", () => {
    // prisma.user.update returns the selected fields with the patch applied
    const patchedRow = (patch: Partial<SelectedUser>): SelectedUser => ({
      ...adamRow,
      ...patch,
    });

    // checks that nothing was hashed or saved
    const expectNoUpdate = () => {
      expect(mockDoHash).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    };

    beforeEach(() => {
      // default for every PATCH test: the user exists
      prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));
    });

    describe("auth", () => {
      it.each([
        ["not logged in", notLoggedIn, 401],
        ["not a director", notAuthorized, 403],
      ] as const)(
        "should return %s error and not touch the database",
        async (_label, authError, status) => {
          mockRequireDirector.mockResolvedValue(authError());

          const response = await PATCH(
            jsonRequest("PATCH", { first_name: "Zach" }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(status);
          expect(body).toEqual(await authError().json());
          expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
          expectNoUpdate();
        },
      );

      it("should stay director-only, even for a user patching their own id", async () => {
        // the self check would allow this user, but PATCH must not use it
        mockRequireSelfOrDirector.mockResolvedValue(null);
        mockRequireDirector.mockResolvedValue(notAuthorized());

        const response = await PATCH(
          jsonRequest("PATCH", { role: "ADMIN" }),
          ctx(userId),
        );

        expect(response.status).toBe(403);
        expect(mockRequireDirector).toHaveBeenCalledTimes(1);
        expect(mockRequireSelfOrDirector).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should check auth before checking the ID", async () => {
        mockRequireDirector.mockResolvedValue(notLoggedIn());

        // an invalid id would give 404 if it were checked first
        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx("test"),
        );

        expect(response.status).toBe(401);
      });

      it("should check auth before reading the body", async () => {
        mockRequireDirector.mockResolvedValue(notLoggedIn());

        // invalid JSON would give 400 if it were read first
        const response = await PATCH(
          rawRequest("PATCH", "not json"),
          ctx(userId),
        );

        expect(response.status).toBe(401);
      });

      it("should return 500 when the auth check throws", async () => {
        mockRequireDirector.mockRejectedValue(new Error("auth failed"));

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ message: "Error patching user - auth failed" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expectNoUpdate();
      });
    });

    describe("success", () => {
      it("should only select the public fields and password_hash", async () => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ first_name: "Zach" })),
        );

        await PATCH(jsonRequest("PATCH", { first_name: "Zach" }), ctx(userId));

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { id: userId },
          select: publicUserWithHashSelect,
        });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { first_name: "Zach" },
          select: publicUserWithHashSelect,
        });
      });

      it.each([
        ["first_name", "Zach"],
        ["last_name", "Jones"],
        ["email", "zach@email.com"],
        ["phone", "+18005559999"],
        ["role", "DIRECTOR"],
      ] as const)("should patch only the user %s", async (field, value) => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ [field]: value } as Partial<SelectedUser>)),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { [field]: value }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user[field]).toBe(value);
        // only the sent field goes to the database
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { [field]: value },
          select: publicUserWithHashSelect,
        });
        expect(mockDoHash).not.toHaveBeenCalled();
      });

      it("should patch several fields at once", async () => {
        const patch = { first_name: "Zach", last_name: "Jones", role: "USER" };
        prismaMock.user.update.mockResolvedValue(dbRow(patchedRow(patch)));

        const response = await PATCH(jsonRequest("PATCH", patch), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user).toEqual(toPublic(patchedRow(patch)));
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: patch,
          select: publicUserWithHashSelect,
        });
      });

      it("should patch a user password and save only the hash", async () => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ password_hash: newHashedPassword })),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { password: "321Test!" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(mockDoHash).toHaveBeenCalledTimes(1);
        expect(mockDoHash).toHaveBeenCalledWith("321Test!");
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { password_hash: newHashedPassword },
          select: publicUserWithHashSelect,
        });
        expect(body.user.has_password).toBe(true);
        expectNoSecrets(body, "321Test!", newHashedPassword);
      });

      it("should return the public user from the database row", async () => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ first_name: "Zach" })),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(body.user).toEqual(toPublic(patchedRow({ first_name: "Zach" })));
        expect(Object.keys(body.user).sort()).toEqual(publicKeys);
        expectNoSecrets(body, hashedPassword);
      });

      it("should never return private fields even if the database returns them", async () => {
        // e.g. if the select were removed from the route
        prismaMock.user.findUnique.mockResolvedValue(adamFullRow);
        prismaMock.user.update.mockResolvedValue({
          ...adamFullRow,
          first_name: "Zach",
        });

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user).not.toHaveProperty("password_hash");
        expect(body.user).not.toHaveProperty("failed_pwd_attempts");
        expect(body.user).not.toHaveProperty("pwd_locked_until");
        expectNoSecrets(body, hashedPassword, "2026-12-31T00:00:00.000Z");
      });

      it("should patch a user when phone is set to empty", async () => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ phone: "" })),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { phone: "" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user.phone).toBe("");
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { phone: "" },
          select: publicUserWithHashSelect,
        });
      });

      it.each([
        ["null", null],
        ["empty", ""],
      ] as const)(
        "should patch other fields when the saved phone is %s",
        async (_label, phone) => {
          prismaMock.user.findUnique.mockResolvedValue(
            dbRow({ ...adamRow, phone }),
          );
          prismaMock.user.update.mockResolvedValue(
            dbRow(patchedRow({ phone, first_name: "Zach" })),
          );

          const response = await PATCH(
            jsonRequest("PATCH", { first_name: "Zach" }),
            ctx(userId),
          );

          expect(response.status).toBe(200);
          expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: { first_name: "Zach" },
            select: publicUserWithHashSelect,
          });
        },
      );

      // A phone saved before E.164 formatting must not block patching
      // other fields, and must not be rewritten unless phone is sent.
      it("should patch other fields when the saved phone is not in E.164 format", async () => {
        const oldPhoneRow = { ...adamRow, phone: "8005551212" };
        prismaMock.user.findUnique.mockResolvedValue(dbRow(oldPhoneRow));
        prismaMock.user.update.mockResolvedValue(
          dbRow({ ...oldPhoneRow, first_name: "Zach" }),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { first_name: "Zach" },
          select: publicUserWithHashSelect,
        });
      });

      it("should patch a user with an empty body (nothing changes)", async () => {
        prismaMock.user.update.mockResolvedValue(dbRow(adamRow));

        const response = await PATCH(jsonRequest("PATCH", {}), ctx(userId));

        expect(response.status).toBe(200);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: {},
          select: publicUserWithHashSelect,
        });
      });

      // Only first_name, last_name, email, phone, password and role can be patched.
      // Anything else in the body must never reach the database.
      it("should ignore fields that are not allowed to be patched", async () => {
        prismaMock.user.update.mockResolvedValue(dbRow(adamRow));

        const response = await PATCH(
          jsonRequest("PATCH", {
            id: notFoundId,
            password_hash: "sneaky-hash",
            has_password: false,
            failed_pwd_attempts: 0,
            pwd_locked_until: null,
            createdAt: "2020-01-01T00:00:00.000Z",
            updatedAt: "2020-01-01T00:00:00.000Z",
          }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(mockDoHash).not.toHaveBeenCalled();
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: {},
          select: publicUserWithHashSelect,
        });
      });

      it("should use the URL id, not an id in the body", async () => {
        prismaMock.user.update.mockResolvedValue(
          dbRow(patchedRow({ first_name: "Zach" })),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { id: notFoundId, first_name: "Zach" }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { id: userId },
          select: publicUserWithHashSelect,
        });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { first_name: "Zach" },
          select: publicUserWithHashSelect,
        });
      });

      it.each([
        ["first_name", "<script>abc</script>", "scriptabcscript"],
        ["last_name", "   Jones ***", "Jones"],
      ] as const)(
        "should patch a user with sanitized %s",
        async (field, sent, saved) => {
          prismaMock.user.update.mockResolvedValue(
            dbRow(patchedRow({ [field]: saved } as Partial<SelectedUser>)),
          );

          const response = await PATCH(
            jsonRequest("PATCH", { [field]: sent }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(200);
          expect(body.user[field]).toBe(saved);
          // the real check: the route sent SANITIZED data to the database
          expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: { [field]: saved },
            select: publicUserWithHashSelect,
          });
        },
      );
    });

    describe("password rules", () => {
      it("should NOT patch a user to remove the password when they have one", async () => {
        const response = await PATCH(
          jsonRequest("PATCH", { password: "" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({ error: "invalid data" });
        expectNoUpdate();
      });

      // A user with no password (e.g. Google login) has password_hash null or "".
      it.each([
        ["null", null],
        ["empty", ""],
      ] as const)(
        "should allow an empty password when the saved hash is %s (no password)",
        async (_label, hash) => {
          const noPassRow = dbRow({ ...adamRow, password_hash: hash });
          prismaMock.user.findUnique.mockResolvedValue(noPassRow);
          prismaMock.user.update.mockResolvedValue(noPassRow);

          const response = await PATCH(
            jsonRequest("PATCH", { password: "" }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(200);
          expect(body.user.has_password).toBe(false);
          expect(mockDoHash).not.toHaveBeenCalled();
          // the saved hash is left alone (null stays null)
          expect(prismaMock.user.update).toHaveBeenCalledWith({
            where: { id: userId },
            data: {},
            select: publicUserWithHashSelect,
          });
        },
      );

      it.each([
        ["null", null],
        ["empty", ""],
      ] as const)(
        "should NOT add a password when the saved hash is %s (no password)",
        async (_label, hash) => {
          prismaMock.user.findUnique.mockResolvedValue(
            dbRow({ ...adamRow, password_hash: hash }),
          );

          const response = await PATCH(
            jsonRequest("PATCH", { password: "321Test!" }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "invalid data" });
          expectNoUpdate();
        },
      );

      it("should patch other fields for a no-password user without sending password", async () => {
        const noPassRow = { ...adamRow, password_hash: null };
        prismaMock.user.findUnique.mockResolvedValue(dbRow(noPassRow));
        prismaMock.user.update.mockResolvedValue(
          dbRow({ ...noPassRow, first_name: "Zach" }),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.user.has_password).toBe(false);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { first_name: "Zach" },
          select: publicUserWithHashSelect,
        });
      });
    });

    describe("not found / bad id", () => {
      it.each([
        ["invalid", "test"],
        ["valid, but not a user ID", nonUserId],
      ])("should NOT patch a user when ID is %s", async (_label, id) => {
        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(id),
        );
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "invalid request" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expectNoUpdate();
      });

      it("should NOT patch a user when ID is not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(notFoundId),
        );
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "not found" });
        expectNoUpdate();
      });

      it("should return 404 when the user is deleted before the update", async () => {
        prismaMock.user.update.mockRejectedValue({ code: "P2025" });

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );

        expect(response.status).toBe(404);
      });
    });

    describe("bad request body - 400", () => {
      it("should return 400 for a body that is not valid JSON", async () => {
        const response = await PATCH(
          rawRequest("PATCH", "not json"),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expectNoUpdate();
      });

      it("should return 400 for an empty body", async () => {
        const response = await PATCH(jsonRequest("PATCH"), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expectNoUpdate();
      });

      // valid JSON, but not an object of user fields
      it.each([
        ["null", null],
        ["an array", ["first_name"]],
        ["a string", "abc"],
        ["a number", 5],
        ["a boolean", true],
      ])("should return 400 when the body is %s", async (_label, value) => {
        const response = await PATCH(jsonRequest("PATCH", value), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "invalid JSON" });
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
        expectNoUpdate();
      });
    });

    describe("missing / invalid data - 422", () => {
      it.each(["first_name", "last_name", "email"])(
        "should NOT patch a user when %s is missing",
        async (field) => {
          const response = await PATCH(
            jsonRequest("PATCH", { [field]: "" }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoUpdate();
        },
      );

      it.each(["first_name", "last_name"])(
        "should NOT patch a user when %s sanitizes to blank",
        async (field) => {
          const response = await PATCH(
            jsonRequest("PATCH", { [field]: "<>   ****   " }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "missing data" });
          expectNoUpdate();
        },
      );

      it.each(["email", "phone", "password"])(
        "should NOT patch a user with an invalid %s",
        async (field) => {
          const response = await PATCH(
            jsonRequest("PATCH", { [field]: "test" }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "invalid data" });
          expectNoUpdate();
        },
      );

      it.each([
        ["first_name", maxFirstNameLength + 1],
        ["last_name", maxLastNameLength + 1],
        ["email", maxEmailLength + 1],
        ["phone", maxPhoneLength + 1],
      ] as const)(
        "should NOT patch a user when %s is too long",
        async (field, len) => {
          const response = await PATCH(
            jsonRequest("PATCH", { [field]: "a".repeat(len) }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "invalid data" });
          expectNoUpdate();
        },
      );

      it("should NOT patch a user with a valid-format email that is too long", async () => {
        const domain = "@email.com";
        const email = "a".repeat(maxEmailLength + 1 - domain.length) + domain;

        const response = await PATCH(
          jsonRequest("PATCH", { email }),
          ctx(userId),
        );

        expect(response.status).toBe(422);
        expectNoUpdate();
      });

      it.each([
        ["unknown", "test"],
        ["lowercase", "director"],
        ["empty", ""],
        ["null", null],
        ["number", 1],
      ] as const)(
        "should NOT patch a user with an invalid role (%s)",
        async (_label, role) => {
          const response = await PATCH(
            jsonRequest("PATCH", { role }),
            ctx(userId),
          );
          const body = await response.json();

          expect(response.status).toBe(422);
          expect(body).toEqual({ error: "invalid data" });
          expectNoUpdate();
        },
      );

      it("should NOT patch anything when one field in the body is invalid", async () => {
        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach", email: "test" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(422);
        expect(body).toEqual({ error: "invalid data" });
        expectNoUpdate();
      });

      // SECURITY: non-string values must never be saved. Depending on which
      // helper sees them first they give 422 or 500, so only check that
      // nothing was hashed or saved.
      it.each([
        ["email", 12345],
        ["email", { $ne: "" }],
        ["phone", 8005559999],
        ["password", true],
        ["password", { $ne: "" }],
      ])(
        "should NOT patch a user when %s is not a string (%p)",
        async (field, value) => {
          const response = await PATCH(
            jsonRequest("PATCH", { [field]: value }),
            ctx(userId),
          );

          expect(response.status).not.toBe(200);
          expectNoUpdate();
        },
      );
    });

    describe("database errors", () => {
      it("should return 409 when the email is a duplicate", async () => {
        prismaMock.user.update.mockRejectedValue({ code: "P2002" });

        const response = await PATCH(
          jsonRequest("PATCH", { email: "chad@email.com" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(409);
        expect(body.message).toContain("Error patching user");
      });

      it("should return 500 when findUnique throws", async () => {
        prismaMock.user.findUnique.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error patching user - connection failed",
        });
        expectNoUpdate();
      });

      it("should return 500 when hashing fails", async () => {
        mockDoHash.mockRejectedValue(new Error("hash failed"));

        const response = await PATCH(
          jsonRequest("PATCH", { password: "321Test!" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ message: "Error patching user - hash failed" });
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 500 when update throws", async () => {
        prismaMock.user.update.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await PATCH(
          jsonRequest("PATCH", { first_name: "Zach" }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error patching user - connection failed",
        });
      });
    });
  });

  describe("DELETE", () => {
    it.each([
      ["not logged in", notLoggedIn, 401],
      ["not a director", notAuthorized, 403],
    ] as const)(
      "should return %s error and not touch the database",
      async (_label, authError, status) => {
        mockRequireDirector.mockResolvedValue(authError());

        const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(status);
        expect(body).toEqual(await authError().json());
        expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
      },
    );

    it("should stay director-only, even for a user deleting their own id", async () => {
      // the self check would allow this user, but DELETE must not use it
      mockRequireSelfOrDirector.mockResolvedValue(null);
      mockRequireDirector.mockResolvedValue(notAuthorized());

      const response = await DELETE(jsonRequest("DELETE"), ctx(userId));

      expect(response.status).toBe(403);
      expect(mockRequireDirector).toHaveBeenCalledTimes(1);
      expect(mockRequireSelfOrDirector).not.toHaveBeenCalled();
      expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
    });

    it("should check auth before checking the ID", async () => {
      mockRequireDirector.mockResolvedValue(notLoggedIn());

      // an invalid id would give 404 if it were checked first
      const response = await DELETE(jsonRequest("DELETE"), ctx("test"));

      expect(response.status).toBe(401);
    });

    it("should return 500 when the auth check throws", async () => {
      mockRequireDirector.mockRejectedValue(new Error("auth failed"));

      const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({ message: "Error deleting user - auth failed" });
      expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
    });

    it("should delete a user by ID", async () => {
      prismaMock.user.deleteMany.mockResolvedValue({ count: 1 });

      const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body).toEqual({ count: 1 });
      expect(prismaMock.user.deleteMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.deleteMany).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it("should NOT delete a user when ID is not found", async () => {
      prismaMock.user.deleteMany.mockResolvedValue({ count: 0 });

      const response = await DELETE(jsonRequest("DELETE"), ctx(notFoundId));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "not found" });
    });

    it.each([
      ["invalid", "test"],
      ["valid, but not a user ID", nonUserId],
    ])("should NOT delete a user when ID is %s", async (_label, id) => {
      const response = await DELETE(jsonRequest("DELETE"), ctx(id));
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body).toEqual({ error: "invalid request" });
      expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
    });

    it("should return 409 when the user still has tournaments", async () => {
      // foreign key: Tmnt rows point at this user
      prismaMock.user.deleteMany.mockRejectedValue({ code: "P2003" });

      const response = await DELETE(jsonRequest("DELETE"), ctx(userId));

      expect(response.status).toBe(409);
    });

    it("should return 500 when the database throws", async () => {
      prismaMock.user.deleteMany.mockRejectedValue(
        new Error("connection failed"),
      );

      const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body).toEqual({
        message: "Error deleting user - connection failed",
      });
    });
  });
});


// /**
//  * @jest-environment node
//  */
// // Tests for src/app/api/users/user/[id]/route.ts using mocked prisma, auth and doHash.
// // The real sanitizeUser, validateUser, toPublicUser and publicUserWithHashSelect run.
// // No database or server needed.
// //
// // Auth:
// //   GET          -> requireSelfOrDirector(id): the user themself, or a director/admin
// //   PATCH/DELETE -> requireDirector(): a director/admin only
// import { NextResponse } from "next/server";
// import type { Prisma, User } from "@prisma/client";
// import { GET, PATCH, DELETE } from "@/app/api/users/user/[id]/route";
// import { prismaMock } from "../../../prismaMock";
// import { doHash } from "@/lib/server/hashServer";
// import { requireDirector } from "@/lib/auth/requireDirector";
// import { requireSelfOrDirector } from "@/lib/auth/requireSelfOrDirector";
// import { publicUserWithHashSelect } from "@/lib/server/publicUser";

// // Replace the auth checks with mock functions each test can control
// jest.mock("@/lib/auth/requireDirector", () => ({
//   requireDirector: jest.fn(),
// }));
// const mockRequireDirector = requireDirector as jest.MockedFunction<
//   typeof requireDirector
// >;

// jest.mock("@/lib/auth/requireSelfOrDirector", () => ({
//   requireSelfOrDirector: jest.fn(),
// }));
// const mockRequireSelfOrDirector = requireSelfOrDirector as jest.MockedFunction<
//   typeof requireSelfOrDirector
// >;

// // Replace password hashing with a mock so tests are fast and predictable
// jest.mock("@/lib/server/hashServer", () => ({
//   doHash: jest.fn(),
// }));
// const mockDoHash = doHash as jest.MockedFunction<typeof doHash>;

// // The URL only needs to be valid; the route reads the id from params, not the URL
// const url = "http://localhost:3000/api/users/user";

// // Next.js passes route params as a Promise; this builds the 2nd argument
// const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// // builds a request with an optional JSON body
// const jsonRequest = (method: string, body?: unknown) =>
//   new Request(url, {
//     method,
//     body: body === undefined ? undefined : JSON.stringify(body),
//     headers: { "Content-Type": "application/json" },
//   });

// const hashedPassword = "hashed-Test123!";
// const newHashedPassword = "hashed-321Test!";

// const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
// const notFoundId = "usr_01234567890123456789012345678901"; // valid format, not in "db"
// const nonUserId = "tmt_01234567890123456789012345678901"; // valid format, wrong table

// // what prisma returns when the route uses select: publicUserWithHashSelect
// type SelectedUser = Prisma.UserGetPayload<{
//   select: typeof publicUserWithHashSelect;
// }>;

// // prismaMock types findUnique/update as returning a full User, but with a
// // select prisma only returns the selected fields, so cast the selected row.
// const dbRow = (row: SelectedUser) => row as unknown as User;

// // a row shaped like what the route's select returns
// const adamRow: SelectedUser = {
//   id: userId,
//   email: "adam@email.com",
//   first_name: "Adam",
//   last_name: "Smith",
//   phone: "+18005551212",
//   role: "ADMIN",
//   password_hash: hashedPassword,
// };

// // a full row, like prisma returns with NO select (used to prove toPublicUser
// // still strips the private fields if a select is ever removed)
// const adamFullRow: User = {
//   ...adamRow,
//   failed_pwd_attempts: 5,
//   pwd_locked_until: new Date("2026-12-31T00:00:00.000Z"),
//   createdAt: new Date("2025-01-01T00:00:00.000Z"),
//   updatedAt: new Date("2025-01-01T00:00:00.000Z"),
// };

// // the only fields the browser should ever get
// const publicKeys = [
//   "email",
//   "first_name",
//   "has_password",
//   "id",
//   "last_name",
//   "phone",
//   "role",
// ].sort();

// // what toPublicUser(row) should send to the browser
// const toPublic = (row: SelectedUser) => {
//   const { password_hash: hash, ...rest } = row;
//   return { ...rest, has_password: !!hash };
// };

// // checks a response body never leaks the password, its hash or the lockout fields
// const expectNoSecrets = (body: unknown, ...secrets: string[]) => {
//   const text = JSON.stringify(body);
//   expect(text).not.toContain("password_hash");
//   expect(text).not.toContain("failed_pwd_attempts");
//   expect(text).not.toContain("pwd_locked_until");
//   secrets.forEach((secret) => expect(text).not.toContain(secret));
// };

// const notLoggedIn = () =>
//   NextResponse.json({ message: "not logged in" }, { status: 401 });
// const notAuthorized = () =>
//   NextResponse.json({ message: "not authorized" }, { status: 403 });

// beforeEach(() => {
//   // default for every test: user is a logged-in director (so both auth
//   // checks pass), hashing works
//   mockRequireDirector.mockReset();
//   mockRequireDirector.mockResolvedValue(null);
//   mockRequireSelfOrDirector.mockReset();
//   mockRequireSelfOrDirector.mockResolvedValue(null);
//   mockDoHash.mockReset();
//   mockDoHash.mockImplementation(async (password: string) => "hashed-" + password);
// });

// describe("Users - API: /api/users/user/:id", () => {

//   describe("GET", () => {
//     it("should get a user by ID", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user).toEqual(toPublic(adamRow));
//     });

//     it("should only select the public fields and password_hash", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

//       await GET(jsonRequest("GET"), ctx(userId));

//       expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//         where: { id: userId },
//         select: publicUserWithHashSelect,
//       });
//     });

//     it("should return only the public fields", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(Object.keys(body.user).sort()).toEqual(publicKeys);
//     });

//     it("should check that the caller is the user themself or a director", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

//       await GET(jsonRequest("GET"), ctx(userId));

//       expect(mockRequireSelfOrDirector).toHaveBeenCalledTimes(1);
//       expect(mockRequireSelfOrDirector).toHaveBeenCalledWith(userId);
//     });

//     it("should not use the director-only check", async () => {
//       // a regular USER reading their own account: the self check allows it,
//       // and the director-only check must not be consulted
//       mockRequireDirector.mockResolvedValue(notAuthorized());
//       prismaMock.user.findUnique.mockResolvedValue(dbRow({ ...adamRow, role: "USER" }));

//       const response = await GET(jsonRequest("GET"), ctx(userId));

//       expect(response.status).toBe(200);
//       expect(mockRequireDirector).not.toHaveBeenCalled();
//     });

//     it.each([
//       ["not logged in", notLoggedIn, 401],
//       ["not the user and not a director", notAuthorized, 403],
//     ] as const)("should return %s error and not touch the database", async (_label, authError, status) => {
//       mockRequireSelfOrDirector.mockResolvedValue(authError());

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(status);
//       expect(body).toEqual(await authError().json());
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//     });

//     it("should check auth before checking the ID", async () => {
//       mockRequireSelfOrDirector.mockResolvedValue(notLoggedIn());

//       // an invalid id would give 404 if it were checked first
//       const response = await GET(jsonRequest("GET"), ctx("test"));

//       expect(response.status).toBe(401);
//       expect(mockRequireSelfOrDirector).toHaveBeenCalledWith("test");
//     });

//     it("should return 500 when the auth check throws", async () => {
//       mockRequireSelfOrDirector.mockRejectedValue(new Error("auth failed"));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error getting user by id - auth failed" });
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//     });

//     it("should return has_password true and never the password hash", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(body.user.has_password).toBe(true);
//       expect(body.user).not.toHaveProperty("password_hash");
//       expectNoSecrets(body, hashedPassword);
//     });

//     it.each([
//       ["null", null],
//       ["empty", ""],
//     ] as const)("should return has_password false when password_hash is %s", async (_label, hash) => {
//       prismaMock.user.findUnique.mockResolvedValue(dbRow({ ...adamRow, password_hash: hash }));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user.has_password).toBe(false);
//     });

//     it("should never return private fields even if the database returns them", async () => {
//       // e.g. if the select were removed from the route
//       prismaMock.user.findUnique.mockResolvedValue(adamFullRow);

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user).not.toHaveProperty("password_hash");
//       expect(body.user).not.toHaveProperty("failed_pwd_attempts");
//       expect(body.user).not.toHaveProperty("pwd_locked_until");
//       expectNoSecrets(body, hashedPassword, "2026-12-31T00:00:00.000Z");
//     });

//     it.each([
//       ["invalid", "test"],
//       ["valid, but not a user ID", nonUserId],
//     ])("should NOT get a user when ID is %s", async (_label, id) => {
//       const response = await GET(jsonRequest("GET"), ctx(id));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid request" });
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//     });

//     it("should NOT get a user when ID is not found", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(null);

//       const response = await GET(jsonRequest("GET"), ctx(notFoundId));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "not found" });
//     });

//     it("should return 500 when the database throws", async () => {
//       prismaMock.user.findUnique.mockRejectedValue(new Error("connection failed"));

//       const response = await GET(jsonRequest("GET"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error getting user by id - connection failed" });
//     });
//   });

//   describe("PATCH", () => {
//     // prisma.user.update returns the selected fields with the patch applied
//     const patchedRow = (patch: Partial<SelectedUser>): SelectedUser => ({
//       ...adamRow,
//       ...patch,
//     });

//     beforeEach(() => {
//       // default for every PATCH test: the user exists
//       prismaMock.user.findUnique.mockResolvedValue(dbRow(adamRow));
//     });

//     it.each([
//       ["not logged in", notLoggedIn, 401],
//       ["not a director", notAuthorized, 403],
//     ] as const)("should return %s error and not touch the database", async (_label, authError, status) => {
//       mockRequireDirector.mockResolvedValue(authError());

//       const response = await PATCH(jsonRequest("PATCH", { first_name: "Zach" }), ctx(userId));

//       expect(response.status).toBe(status);
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//       expect(mockDoHash).not.toHaveBeenCalled();
//     });

//     it("should stay director-only, even for a user patching their own id", async () => {
//       // the self check would allow this user, but PATCH must not use it
//       mockRequireSelfOrDirector.mockResolvedValue(null);
//       mockRequireDirector.mockResolvedValue(notAuthorized());

//       const response = await PATCH(jsonRequest("PATCH", { role: "ADMIN" }), ctx(userId));

//       expect(response.status).toBe(403);
//       expect(mockRequireDirector).toHaveBeenCalledTimes(1);
//       expect(mockRequireSelfOrDirector).not.toHaveBeenCalled();
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it("should only select the public fields and password_hash", async () => {
//       prismaMock.user.update.mockResolvedValue(dbRow(patchedRow({ first_name: "Zach" })));

//       await PATCH(jsonRequest("PATCH", { first_name: "Zach" }), ctx(userId));

//       expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//         where: { id: userId },
//         select: publicUserWithHashSelect,
//       });
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { first_name: "Zach" },
//         select: publicUserWithHashSelect,
//       });
//     });

//     it.each([
//       ["first_name", "Zach"],
//       ["last_name", "Jones"],
//       ["email", "zach@email.com"],
//       ["phone", "+18005559999"],
//       ["role", "DIRECTOR"],
//     ] as const)("should patch only the user %s", async (field, value) => {
//       prismaMock.user.update.mockResolvedValue(
//         dbRow(patchedRow({ [field]: value } as Partial<SelectedUser>))
//       );

//       const response = await PATCH(
//         jsonRequest("PATCH", { [field]: value }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user[field]).toBe(value);
//       // only the sent field goes to the database
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { [field]: value },
//         select: publicUserWithHashSelect,
//       });
//       expect(mockDoHash).not.toHaveBeenCalled();
//     });

//     it("should patch several fields at once", async () => {
//       const patch = { first_name: "Zach", last_name: "Jones", role: "USER" };
//       prismaMock.user.update.mockResolvedValue(dbRow(patchedRow(patch)));

//       const response = await PATCH(jsonRequest("PATCH", patch), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user).toEqual(toPublic(patchedRow(patch)));
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: patch,
//         select: publicUserWithHashSelect,
//       });
//     });

//     it("should patch a user password and save only the hash", async () => {
//       prismaMock.user.update.mockResolvedValue(
//         dbRow(patchedRow({ password_hash: newHashedPassword }))
//       );

//       const response = await PATCH(
//         jsonRequest("PATCH", { password: "321Test!" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(mockDoHash).toHaveBeenCalledWith("321Test!");
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { password_hash: newHashedPassword },
//         select: publicUserWithHashSelect,
//       });
//       expect(body.user.has_password).toBe(true);
//       expectNoSecrets(body, "321Test!", newHashedPassword);
//     });

//     it("should return the public user from the database row", async () => {
//       prismaMock.user.update.mockResolvedValue(dbRow(patchedRow({ first_name: "Zach" })));

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(body.user).toEqual(toPublic(patchedRow({ first_name: "Zach" })));
//       expect(Object.keys(body.user).sort()).toEqual(publicKeys);
//       expectNoSecrets(body, hashedPassword);
//     });

//     it("should never return private fields even if the database returns them", async () => {
//       // e.g. if the select were removed from the route
//       prismaMock.user.findUnique.mockResolvedValue(adamFullRow);
//       prismaMock.user.update.mockResolvedValue({ ...adamFullRow, first_name: "Zach" });

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user).not.toHaveProperty("password_hash");
//       expect(body.user).not.toHaveProperty("failed_pwd_attempts");
//       expect(body.user).not.toHaveProperty("pwd_locked_until");
//       expectNoSecrets(body, hashedPassword, "2026-12-31T00:00:00.000Z");
//     });

//     it("should patch a user when phone is set to empty", async () => {
//       prismaMock.user.update.mockResolvedValue(dbRow(patchedRow({ phone: "" })));

//       const response = await PATCH(jsonRequest("PATCH", { phone: "" }), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user.phone).toBe("");
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { phone: "" },
//         select: publicUserWithHashSelect,
//       });
//     });

//     // Only first_name, last_name, email, phone, password and role can be patched.
//     // Anything else in the body must never reach the database.
//     it("should ignore fields that are not allowed to be patched", async () => {
//       prismaMock.user.update.mockResolvedValue(dbRow(adamRow));

//       const response = await PATCH(
//         jsonRequest("PATCH", {
//           id: notFoundId,
//           password_hash: "sneaky-hash",
//           failed_pwd_attempts: 0,
//           pwd_locked_until: null,
//           createdAt: "2020-01-01T00:00:00.000Z",
//           updatedAt: "2020-01-01T00:00:00.000Z",
//         }),
//         ctx(userId)
//       );

//       expect(response.status).toBe(200);
//       expect(mockDoHash).not.toHaveBeenCalled();
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: {},
//         select: publicUserWithHashSelect,
//       });
//     });

//     it("should use the URL id, not an id in the body", async () => {
//       prismaMock.user.update.mockResolvedValue(dbRow(patchedRow({ first_name: "Zach" })));

//       const response = await PATCH(
//         jsonRequest("PATCH", { id: notFoundId, first_name: "Zach" }),
//         ctx(userId)
//       );

//       expect(response.status).toBe(200);
//       expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//         where: { id: userId },
//         select: publicUserWithHashSelect,
//       });
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { first_name: "Zach" },
//         select: publicUserWithHashSelect,
//       });
//     });

//     it.each([
//       ["invalid", "test"],
//       ["valid, but not a user ID", nonUserId],
//     ])("should NOT patch a user when ID is %s", async (_label, id) => {
//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(id)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid request" });
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it("should NOT patch a user when ID is not found", async () => {
//       prismaMock.user.findUnique.mockResolvedValue(null);

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(notFoundId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "not found" });
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it.each(["first_name", "last_name", "email"])(
//       "should NOT patch a user when %s is missing",
//       async (field) => {
//         const response = await PATCH(
//           jsonRequest("PATCH", { [field]: "" }),
//           ctx(userId)
//         );
//         const body = await response.json();

//         expect(response.status).toBe(422);
//         expect(body).toEqual({ error: "missing data" });
//         expect(prismaMock.user.update).not.toHaveBeenCalled();
//       }
//     );

//     it("should NOT patch a user to remove the password when they have one", async () => {
//       const response = await PATCH(jsonRequest("PATCH", { password: "" }), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(422);
//       expect(body).toEqual({ error: "invalid data" });
//       expect(mockDoHash).not.toHaveBeenCalled();
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     // A user with no password (e.g. Google login) has password_hash null or "".
//     it.each([
//       ["null", null],
//       ["empty", ""],
//     ] as const)(
//       "should allow an empty password when the saved hash is %s (no password)",
//       async (_label, hash) => {
//         const noPassRow = dbRow({ ...adamRow, password_hash: hash });
//         prismaMock.user.findUnique.mockResolvedValue(noPassRow);
//         prismaMock.user.update.mockResolvedValue(noPassRow);

//         const response = await PATCH(jsonRequest("PATCH", { password: "" }), ctx(userId));
//         const body = await response.json();

//         expect(response.status).toBe(200);
//         expect(body.user.has_password).toBe(false);
//         expect(mockDoHash).not.toHaveBeenCalled();
//         // the saved hash is left alone (null stays null)
//         expect(prismaMock.user.update).toHaveBeenCalledWith({
//           where: { id: userId },
//           data: {},
//           select: publicUserWithHashSelect,
//         });
//       }
//     );

//     it.each([
//       ["null", null],
//       ["empty", ""],
//     ] as const)(
//       "should NOT add a password when the saved hash is %s (no password)",
//       async (_label, hash) => {
//         prismaMock.user.findUnique.mockResolvedValue(dbRow({ ...adamRow, password_hash: hash }));

//         const response = await PATCH(
//           jsonRequest("PATCH", { password: "321Test!" }),
//           ctx(userId)
//         );
//         const body = await response.json();

//         expect(response.status).toBe(422);
//         expect(body).toEqual({ error: "invalid data" });
//         expect(mockDoHash).not.toHaveBeenCalled();
//         expect(prismaMock.user.update).not.toHaveBeenCalled();
//       }
//     );

//     it.each(["email", "phone", "password"])(
//       "should NOT patch a user with an invalid %s",
//       async (field) => {
//         const response = await PATCH(
//           jsonRequest("PATCH", { [field]: "test" }),
//           ctx(userId)
//         );
//         const body = await response.json();

//         expect(response.status).toBe(422);
//         expect(body).toEqual({ error: "invalid data" });
//         expect(mockDoHash).not.toHaveBeenCalled();
//         expect(prismaMock.user.update).not.toHaveBeenCalled();
//       }
//     );

//     it.each([
//       ["first_name", 51],
//       ["last_name", 51],
//       ["email", 256],
//       ["phone", 256],
//     ] as const)("should NOT patch a user when %s is too long", async (field, len) => {
//       const response = await PATCH(
//         jsonRequest("PATCH", { [field]: "a".repeat(len) }),
//         ctx(userId)
//       );

//       expect(response.status).toBe(422);
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it.each([
//       ["unknown", "test"],
//       ["lowercase", "director"],
//       ["empty", ""],
//       ["null", null],
//       ["number", 1],
//     ] as const)("should NOT patch a user with an invalid role (%s)", async (_label, role) => {
//       const response = await PATCH(jsonRequest("PATCH", { role }), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(422);
//       expect(body).toEqual({ error: "invalid data" });
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it.each([
//       ["first_name", "<script>abc</script>", "scriptabcscript"],
//       ["last_name", "   Jones ***", "Jones"],
//     ] as const)("should patch a user with sanitized %s", async (field, sent, saved) => {
//       prismaMock.user.update.mockResolvedValue(
//         dbRow(patchedRow({ [field]: saved } as Partial<SelectedUser>))
//       );

//       const response = await PATCH(jsonRequest("PATCH", { [field]: sent }), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body.user[field]).toBe(saved);
//       // the real check: the route sent SANITIZED data to the database
//       expect(prismaMock.user.update).toHaveBeenCalledWith({
//         where: { id: userId },
//         data: { [field]: saved },
//         select: publicUserWithHashSelect,
//       });
//     });

//     it("should return 409 when the email is a duplicate", async () => {
//       prismaMock.user.update.mockRejectedValue({ code: "P2002" });

//       const response = await PATCH(
//         jsonRequest("PATCH", { email: "chad@email.com" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(409);
//       expect(body.message).toContain("Error patching user");
//     });

//     it("should return 404 when the user is deleted before the update", async () => {
//       prismaMock.user.update.mockRejectedValue({ code: "P2025" });

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(userId)
//       );

//       expect(response.status).toBe(404);
//     });

//     it("should return 500 when findUnique throws", async () => {
//       prismaMock.user.findUnique.mockRejectedValue(new Error("connection failed"));

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error patching user - connection failed" });
//       expect(prismaMock.user.update).not.toHaveBeenCalled();
//     });

//     it("should return 500 when update throws", async () => {
//       prismaMock.user.update.mockRejectedValue(new Error("connection failed"));

//       const response = await PATCH(
//         jsonRequest("PATCH", { first_name: "Zach" }),
//         ctx(userId)
//       );
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error patching user - connection failed" });
//     });
//   });

//   describe("DELETE", () => {
//     it.each([
//       ["not logged in", notLoggedIn, 401],
//       ["not a director", notAuthorized, 403],
//     ] as const)("should return %s error and not touch the database", async (_label, authError, status) => {
//       mockRequireDirector.mockResolvedValue(authError());

//       const response = await DELETE(jsonRequest("DELETE"), ctx(userId));

//       expect(response.status).toBe(status);
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
//     });

//     it("should stay director-only, even for a user deleting their own id", async () => {
//       // the self check would allow this user, but DELETE must not use it
//       mockRequireSelfOrDirector.mockResolvedValue(null);
//       mockRequireDirector.mockResolvedValue(notAuthorized());

//       const response = await DELETE(jsonRequest("DELETE"), ctx(userId));

//       expect(response.status).toBe(403);
//       expect(mockRequireDirector).toHaveBeenCalledTimes(1);
//       expect(mockRequireSelfOrDirector).not.toHaveBeenCalled();
//       expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
//     });

//     it("should delete a user by ID", async () => {
//       prismaMock.user.deleteMany.mockResolvedValue({ count: 1 });

//       const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(200);
//       expect(body).toEqual({ count: 1 });
//       expect(prismaMock.user.deleteMany).toHaveBeenCalledWith({
//         where: { id: userId },
//       });
//     });

//     it("should NOT delete a user when ID is not found", async () => {
//       prismaMock.user.deleteMany.mockResolvedValue({ count: 0 });

//       const response = await DELETE(jsonRequest("DELETE"), ctx(notFoundId));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "not found" });
//     });

//     it.each([
//       ["invalid", "test"],
//       ["valid, but not a user ID", nonUserId],
//     ])("should NOT delete a user when ID is %s", async (_label, id) => {
//       const response = await DELETE(jsonRequest("DELETE"), ctx(id));
//       const body = await response.json();

//       expect(response.status).toBe(404);
//       expect(body).toEqual({ error: "invalid request" });
//       expect(prismaMock.user.deleteMany).not.toHaveBeenCalled();
//     });

//     it("should return 409 when the user still has tournaments", async () => {
//       // foreign key: Tmnt rows point at this user
//       prismaMock.user.deleteMany.mockRejectedValue({ code: "P2003" });

//       const response = await DELETE(jsonRequest("DELETE"), ctx(userId));

//       expect(response.status).toBe(409);
//     });

//     it("should return 500 when the database throws", async () => {
//       prismaMock.user.deleteMany.mockRejectedValue(new Error("connection failed"));

//       const response = await DELETE(jsonRequest("DELETE"), ctx(userId));
//       const body = await response.json();

//       expect(response.status).toBe(500);
//       expect(body).toEqual({ message: "Error deleting user - connection failed" });
//     });
//   });
// });
