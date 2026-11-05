/**
 * @jest-environment node
 */
// Tests for src/app/api/users/user/[id]/changePassword/route.ts using mocked
// prisma, requireSelf, doCompare and doHash.
// The real isPassword8to20 and isValidBtDbId validation runs.
// No database or server needed.
import { NextResponse } from "next/server";
import type { User } from "@prisma/client";
import { PATCH } from "@/app/api/users/user/[id]/changePassword/route";
import { prismaMock } from "../../../prismaMock";
import { doCompare, doHash } from "@/lib/server/hashServer";
import { requireSelf } from "@/lib/auth/guards";

// Replace the auth check with a mock function each test can control
jest.mock("@/lib/auth/guards", () => ({
  requireSelf: jest.fn(),
}));
const mockRequireSelf = requireSelf as jest.MockedFunction<typeof requireSelf>;

// Replace password compare and hashing with mocks so tests are fast and predictable
jest.mock("@/lib/server/hashServer", () => ({
  doCompare: jest.fn(),
  doHash: jest.fn(),
}));
const mockDoCompare = doCompare as jest.MockedFunction<typeof doCompare>;
const mockDoHash = doHash as jest.MockedFunction<typeof doHash>;

// The URL only needs to be valid; the route reads the id from params, not the URL
const url = "http://localhost:3000/api/users/user/changePassword";

// Next.js passes route params as a Promise; this builds the 2nd argument
const ctx = (id: string) => ({ params: Promise.resolve({ id }) });

// builds a PATCH request with a raw (string) body
const rawRequest = (body: string) =>
  new Request(url, {
    method: "PATCH",
    body,
    headers: { "Content-Type": "application/json" },
  });

// builds a PATCH request with a JSON body
const jsonRequest = (body: unknown) => rawRequest(JSON.stringify(body));

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const notFoundId = "usr_01234567890123456789012345678901"; // valid format, not in "db"
const nonUserId = "tmt_01234567890123456789012345678901"; // valid format, wrong table

const currentPassword = "Test123!";
const newPassword = "321Test!";
const currentHash = "hashed-Test123!";
const newHash = "hashed-321Test!";

// must match the constants in route.ts (they are not exported)
const MAX_PWD_ATTEMPTS = 5;
const PWD_LOCK_MS = 15 * 60 * 1000;
// the 429 message the route sends for N minutes left
const lockedMessage = (minutes: number) =>
  `Too many attempts, try again in ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;

const validBody = { currentPassword, newPassword };

// the only fields the route reads from the user row
const pwdSelect = { password_hash: true, pwd_locked_until: true };

// what the route saves after a successful change
const successData = {
  password_hash: newHash,
  failed_pwd_attempts: 0,
  pwd_locked_until: null,
};

// a row shaped like the User model in prisma/schema.prisma
const adamRow: User = {
  id: userId,
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "USER",
  password_hash: currentHash,
  failed_pwd_attempts: 0,
  pwd_locked_until: null,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

const userRow = (patch: Partial<User> = {}): User => ({ ...adamRow, ...patch });

// lock times relative to now
const lockedFor = (ms: number) => new Date(Date.now() + ms);

// checks a response body never leaks a password, a hash or the lockout fields
const expectNoSecrets = (body: unknown) => {
  const text = JSON.stringify(body);
  [
    currentPassword,
    newPassword,
    currentHash,
    newHash,
    "password_hash",
    "failed_pwd_attempts",
    "pwd_locked_until",
  ].forEach((secret) => expect(text).not.toContain(secret));
};

// checks that nothing past validation ran
const expectNoPasswordWork = () => {
  expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  expect(mockDoCompare).not.toHaveBeenCalled();
  expect(mockDoHash).not.toHaveBeenCalled();
  expect(prismaMock.user.update).not.toHaveBeenCalled();
};

const notLoggedIn = () =>
  NextResponse.json({ message: "not logged in" }, { status: 401 });
const notAuthorized = () =>
  NextResponse.json({ message: "not authorized" }, { status: 403 });

beforeEach(() => {
  // default for every test: the logged-in user is changing their own password,
  // the user exists, the current password matches and hashing works
  mockRequireSelf.mockReset();
  mockRequireSelf.mockResolvedValue(null);
  mockDoCompare.mockReset();
  mockDoCompare.mockResolvedValue(true);
  mockDoHash.mockReset();
  mockDoHash.mockImplementation(
    async (password: string) => "hashed-" + password,
  );
  prismaMock.user.findUnique.mockResolvedValue(adamRow);
  prismaMock.user.update.mockResolvedValue(adamRow);
});

describe("Users - API: /api/users/user/:id/changePassword", () => {
  describe("PATCH", () => {
    describe("success", () => {
      it("should change the password", async () => {
        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body).toEqual({ success: true });
      });

      it("should look up the user by the URL id, reading only the password fields", async () => {
        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { id: userId },
          select: pwdSelect,
        });
      });

      it("should compare the current password with the saved hash", async () => {
        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(mockDoCompare).toHaveBeenCalledTimes(1);
        expect(mockDoCompare).toHaveBeenCalledWith(currentPassword, currentHash);
      });

      it("should hash the new password", async () => {
        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(mockDoHash).toHaveBeenCalledTimes(1);
        expect(mockDoHash).toHaveBeenCalledWith(newPassword);
      });

      it("should save only the new hash and reset the lockout fields", async () => {
        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: successData,
        });
      });

      it("should reset failed attempts left from earlier wrong passwords", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ failed_pwd_attempts: 3 }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(200);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: successData,
        });
      });

      it("should change the password when an old lock has expired", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ pwd_locked_until: lockedFor(-60 * 1000) }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(200);
        expect(mockDoCompare).toHaveBeenCalled();
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: successData,
        });
      });

      // shortest and longest passwords isPassword8to20 allows
      it.each([
        ["8", "Abcde1!x"],
        ["20", "Abcde1!x" + "y".repeat(12)],
      ])("should accept a new password of %s characters", async (len, pwd) => {
        expect(pwd.length).toBe(Number(len));

        const response = await PATCH(
          jsonRequest({ currentPassword, newPassword: pwd }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(mockDoHash).toHaveBeenCalledWith(pwd);
      });

      it("should only send success, never passwords, hashes or lockout fields", async () => {
        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(Object.keys(body)).toEqual(["success"]);
        expectNoSecrets(body);
      });

      it("should ignore extra fields in the body", async () => {
        const response = await PATCH(
          jsonRequest({
            ...validBody,
            id: notFoundId,
            password_hash: "sneaky-hash",
            failed_pwd_attempts: 0,
            pwd_locked_until: null,
            role: "ADMIN",
          }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
          where: { id: userId },
          select: pwdSelect,
        });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: successData,
        });
      });
    });

    describe("auth", () => {
      it("should check that the user is changing their own password", async () => {
        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(mockRequireSelf).toHaveBeenCalledTimes(1);
        expect(mockRequireSelf).toHaveBeenCalledWith(userId);
      });

      it.each([
        ["not logged in", notLoggedIn, 401],
        ["not the same user", notAuthorized, 403],
      ] as const)(
        "should return %s error and not touch the database",
        async (_label, authError, status) => {
          mockRequireSelf.mockResolvedValue(authError());

          const response = await PATCH(jsonRequest(validBody), ctx(userId));
          const body = await response.json();

          expect(response.status).toBe(status);
          expect(body).toEqual(await authError().json());
          expectNoPasswordWork();
        },
      );

      it("should check auth before checking the ID", async () => {
        mockRequireSelf.mockResolvedValue(notLoggedIn());

        // an invalid id would give 404 if it were checked first
        const response = await PATCH(jsonRequest(validBody), ctx("test"));

        expect(response.status).toBe(401);
      });

      it("should check auth before reading the body", async () => {
        mockRequireSelf.mockResolvedValue(notAuthorized());

        // bad JSON would give 400 if the body were read first
        const response = await PATCH(rawRequest("not json"), ctx(userId));

        expect(response.status).toBe(403);
      });
    });

    describe("invalid ID", () => {
      it.each([
        ["invalid", "test"],
        ["valid, but not a user ID", nonUserId],
      ])(
        "should return 404 and not touch the database when ID is %s",
        async (_label, id) => {
          const response = await PATCH(jsonRequest(validBody), ctx(id));
          const body = await response.json();

          expect(response.status).toBe(404);
          expect(body).toEqual({ error: "invalid request" });
          expectNoPasswordWork();
        },
      );

      it("should return 404 when the user is not found", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const response = await PATCH(jsonRequest(validBody), ctx(notFoundId));
        const body = await response.json();

        expect(response.status).toBe(404);
        expect(body).toEqual({ error: "not found" });
        expect(mockDoCompare).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });
    });

    describe("invalid body", () => {
      it.each([
        ["not JSON", "not json"],
        ["empty", ""],
        ["null", "null"],
        ["a string", '"Test123!"'],
        ["a number", "42"],
        ["a boolean", "true"],
        ["an array", "[]"],
        ["an array of passwords", JSON.stringify([currentPassword, newPassword])],
      ])(
        "should return 400 invalid JSON when the body is %s",
        async (_label, raw) => {
          const response = await PATCH(rawRequest(raw), ctx(userId));
          const body = await response.json();

          expect(response.status).toBe(400);
          expect(body).toEqual({ error: "invalid JSON" });
          expectNoPasswordWork();
        },
      );

      it.each([
        ["an empty object", {}],
        ["missing currentPassword", { newPassword }],
        ["missing newPassword", { currentPassword }],
        ["currentPassword is empty", { currentPassword: "", newPassword }],
        ["newPassword is empty", { currentPassword, newPassword: "" }],
        ["currentPassword is null", { currentPassword: null, newPassword }],
        ["newPassword is null", { currentPassword, newPassword: null }],
        ["currentPassword is a number", { currentPassword: 12345678, newPassword }],
        ["newPassword is a number", { currentPassword, newPassword: 12345678 }],
        ["currentPassword is an object", { currentPassword: { $ne: "" }, newPassword }],
        ["newPassword is an array", { currentPassword, newPassword: [newPassword] }],
        ["currentPassword is too short", { currentPassword: "Tst12!", newPassword }],
        ["newPassword is too short", { currentPassword, newPassword: "Tst12!" }],
        [
          "currentPassword is too long",
          { currentPassword: "Test123!" + "a".repeat(13), newPassword },
        ],
        [
          "newPassword is too long",
          { currentPassword, newPassword: "Test123!" + "a".repeat(13) },
        ],
      ])("should return 400 Invalid password when %s", async (_label, sent) => {
        const response = await PATCH(jsonRequest(sent), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Invalid password" });
        expectNoPasswordWork();
      });

      it("should return 400 when the new password is the same as the current one", async () => {
        const response = await PATCH(
          jsonRequest({ currentPassword, newPassword: currentPassword }),
          ctx(userId),
        );
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "New password must be different" });
        expectNoPasswordWork();
      });

      it("should treat passwords that differ only by case as different", async () => {
        // "Test123!" vs "tEST123!": the route compares exactly
        const response = await PATCH(
          jsonRequest({ currentPassword, newPassword: "tEST123!" }),
          ctx(userId),
        );

        expect(response.status).toBe(200);
        expect(mockDoHash).toHaveBeenCalledWith("tEST123!");
      });
    });

    describe("user cannot change the password", () => {
      it("should return 429 when the account is locked", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ pwd_locked_until: lockedFor(10 * 60 * 1000) }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(429);
        expect(body).toEqual({ error: lockedMessage(10) });
        // a locked user cannot even try the password
        expect(mockDoCompare).not.toHaveBeenCalled();
        expect(mockDoHash).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 429 when locked, even with the wrong password", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ pwd_locked_until: lockedFor(10 * 60 * 1000) }),
        );
        mockDoCompare.mockResolvedValue(false);

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(429);
        // failed attempts are not counted while locked
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should check the lock before checking for a saved password", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({
            password_hash: null,
            pwd_locked_until: lockedFor(10 * 60 * 1000),
          }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(429);
      });

      it.each([
        ["null", null],
        ["empty", ""],
      ] as const)(
        "should return 400 when the saved hash is %s (no password)",
        async (_label, hash) => {
          prismaMock.user.findUnique.mockResolvedValue(
            userRow({ password_hash: hash }),
          );

          const response = await PATCH(jsonRequest(validBody), ctx(userId));
          const body = await response.json();

          expect(response.status).toBe(400);
          expect(body).toEqual({ error: "User has no password" });
          expect(mockDoCompare).not.toHaveBeenCalled();
          expect(mockDoHash).not.toHaveBeenCalled();
          expect(prismaMock.user.update).not.toHaveBeenCalled();
        },
      );

      it.each([
        ["15 minutes", 15 * 60 * 1000, 15],
        ["10 minutes", 10 * 60 * 1000, 10],
        ["90 seconds", 90 * 1000, 2],
        ["61 seconds", 61 * 1000, 2],
        ["60 seconds", 60 * 1000, 1],
        ["30 seconds", 30 * 1000, 1],
        ["1 second", 1000, 1],
      ])(
        "should say how long is left when the lock has %s left",
        async (_label, msLeft, minutes) => {
          prismaMock.user.findUnique.mockResolvedValue(
            userRow({ pwd_locked_until: lockedFor(msLeft) }),
          );

          const response = await PATCH(jsonRequest(validBody), ctx(userId));
          const body = await response.json();

          expect(response.status).toBe(429);
          expect(body).toEqual({ error: lockedMessage(minutes) });
        },
      );

      it("should send a Retry-After header in seconds", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ pwd_locked_until: lockedFor(10 * 60 * 1000) }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const retryAfter = Number(response.headers.get("Retry-After"));

        // a few ms pass between building the row and the route running
        expect(retryAfter).toBeGreaterThan(590);
        expect(retryAfter).toBeLessThanOrEqual(600);
      });      
    });

    describe("wrong current password", () => {
      beforeEach(() => {
        mockDoCompare.mockResolvedValue(false);
      });

      it("should return 400 and not change the password", async () => {
        prismaMock.user.update.mockResolvedValue(
          userRow({ failed_pwd_attempts: 1 }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Current Password is incorrect" });
        expect(mockDoHash).not.toHaveBeenCalled();
        expectNoSecrets(body);
      });

      it("should add one to the failed attempts", async () => {
        prismaMock.user.update.mockResolvedValue(
          userRow({ failed_pwd_attempts: 1 }),
        );

        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { failed_pwd_attempts: { increment: 1 } },
        });
      });

      it("should count a wrong password after an old lock has expired", async () => {
        prismaMock.user.findUnique.mockResolvedValue(
          userRow({ pwd_locked_until: lockedFor(-60 * 1000) }),
        );
        prismaMock.user.update.mockResolvedValue(
          userRow({ failed_pwd_attempts: 1 }),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body).toEqual({ error: "Current Password is incorrect" });
        expect(prismaMock.user.update).toHaveBeenCalledWith({
          where: { id: userId },
          data: { failed_pwd_attempts: { increment: 1 } },
        });
      });

      it.each([1, 2, MAX_PWD_ATTEMPTS - 1])(
        "should NOT lock the account after %i failed attempts",
        async (attempts) => {
          prismaMock.user.update.mockResolvedValue(
            userRow({ failed_pwd_attempts: attempts }),
          );

          const response = await PATCH(jsonRequest(validBody), ctx(userId));
          const body = await response.json();

          expect(response.status).toBe(400);
          expect(body).toEqual({ error: "Current Password is incorrect" });
          // only the increment, no lock
          expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
        },
      );

      it.each([MAX_PWD_ATTEMPTS, MAX_PWD_ATTEMPTS + 1])(
        "should lock the account for 15 minutes after %i failed attempts and return 429",
        async (attempts) => {
          prismaMock.user.update
            .mockResolvedValueOnce(userRow({ failed_pwd_attempts: attempts }))
            .mockResolvedValueOnce(userRow());

          const before = Date.now();
          const response = await PATCH(jsonRequest(validBody), ctx(userId));
          const after = Date.now();
          const body = await response.json();

          // the attempt that causes the lock tells the user right away
          expect(response.status).toBe(429);
          expect(body).toEqual({ error: lockedMessage(15) });
          expectNoSecrets(body);
          expect(prismaMock.user.update).toHaveBeenCalledTimes(2);

          // 2nd update: reset the counter and set the lock time
          const lockArgs = prismaMock.user.update.mock.calls[1][0];
          expect(lockArgs.where).toEqual({ id: userId });
          expect(lockArgs.data.failed_pwd_attempts).toBe(0);

          const lockedUntil = lockArgs.data.pwd_locked_until as Date;
          expect(lockedUntil).toBeInstanceOf(Date);
          expect(lockedUntil.getTime()).toBeGreaterThanOrEqual(
            before + PWD_LOCK_MS,
          );
          expect(lockedUntil.getTime()).toBeLessThanOrEqual(
            after + PWD_LOCK_MS,
          );
        },
      );

      it("should never save a new hash when the current password is wrong", async () => {
        prismaMock.user.update
          .mockResolvedValueOnce(
            userRow({ failed_pwd_attempts: MAX_PWD_ATTEMPTS }),
          )
          .mockResolvedValueOnce(userRow());

        await PATCH(jsonRequest(validBody), ctx(userId));

        expect(mockDoHash).not.toHaveBeenCalled();
        prismaMock.user.update.mock.calls.forEach(([args]) => {
          expect(args.data).not.toHaveProperty("password_hash");
        });
      });

      it("should send a 15 minute Retry-After header when the lock is set", async () => {
        prismaMock.user.update
          .mockResolvedValueOnce(userRow({ failed_pwd_attempts: MAX_PWD_ATTEMPTS }))
          .mockResolvedValueOnce(userRow());

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(429);
        expect(Number(response.headers.get("Retry-After"))).toBe(15 * 60);
      });      
    });

    describe("errors", () => {
      it("should return 500 when hashing the new password returns nothing", async () => {
        mockDoHash.mockResolvedValue("");

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({ error: "Error hashing password" });
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 500 when the auth check throws", async () => {
        mockRequireSelf.mockRejectedValue(new Error("auth failed"));

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - auth failed",
        });
        expectNoPasswordWork();
      });

      it("should return 500 when findUnique throws", async () => {
        prismaMock.user.findUnique.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - connection failed",
        });
        expect(mockDoCompare).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 500 when comparing passwords throws", async () => {
        mockDoCompare.mockRejectedValue(new Error("compare failed"));

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - compare failed",
        });
        expect(mockDoHash).not.toHaveBeenCalled();
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 500 when hashing throws", async () => {
        mockDoHash.mockRejectedValue(new Error("hash failed"));

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - hash failed",
        });
        expect(prismaMock.user.update).not.toHaveBeenCalled();
      });

      it("should return 500 when saving the new hash throws", async () => {
        prismaMock.user.update.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - connection failed",
        });
      });

      it("should return 500 when counting a failed attempt throws", async () => {
        mockDoCompare.mockResolvedValue(false);
        prismaMock.user.update.mockRejectedValue(
          new Error("connection failed"),
        );

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - connection failed",
        });
        expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      });

      it("should return 500 when saving the lock throws", async () => {
        mockDoCompare.mockResolvedValue(false);
        prismaMock.user.update
          .mockResolvedValueOnce(
            userRow({ failed_pwd_attempts: MAX_PWD_ATTEMPTS }),
          )
          .mockRejectedValueOnce(new Error("connection failed"));

        const response = await PATCH(jsonRequest(validBody), ctx(userId));
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body).toEqual({
          message: "Error changing password - connection failed",
        });
        expect(prismaMock.user.update).toHaveBeenCalledTimes(2);
      });

      it("should return 404 when the user is deleted before saving the new hash", async () => {
        prismaMock.user.update.mockRejectedValue({ code: "P2025" });

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(404);
      });

      it("should return 404 when the user is deleted before counting a failed attempt", async () => {
        mockDoCompare.mockResolvedValue(false);
        prismaMock.user.update.mockRejectedValue({ code: "P2025" });

        const response = await PATCH(jsonRequest(validBody), ctx(userId));

        expect(response.status).toBe(404);
      });
    });
  });
});