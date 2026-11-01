/**
 * @jest-environment node
 */
// test/lib/auth/authorizeCredentials.test.ts
// Tests for src/lib/auth/authorizeCredentials.ts using mocked prisma and bcrypt.
import type { User } from "@prisma/client";
import { compare } from "bcrypt";
import { prismaMock } from "../../prismaMock";
import { authorizeCredentials } from "@/lib/auth/authorizeCredentials";
import { maxPwdAttempts, pwdLockMinutes } from "@/lib/auth/authUtils";

jest.mock("bcrypt", () => ({
  compare: jest.fn(),
}));
const mockCompare = compare as jest.MockedFunction<
  (data: string, encrypted: string) => Promise<boolean>
>;

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const password = "Test123!";
const passwordHash = "hashed-Test123!";
const lockMs = pwdLockMinutes * 60 * 1000;

const adamRow: User = {
  id: userId,
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "DIRECTOR",
  password_hash: passwordHash,
  failed_pwd_attempts: 0,
  pwd_locked_until: null,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

const userRow = (patch: Partial<User> = {}): User => ({ ...adamRow, ...patch });

const minutesFromNow = (minutes: number) =>
  new Date(Date.now() + minutes * 60 * 1000);

const login = (email: unknown = adamRow.email, pwd: unknown = password) =>
  authorizeCredentials({ email, password: pwd });

beforeEach(() => {
  jest.resetAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(adamRow);
  prismaMock.user.update.mockResolvedValue(adamRow);
  mockCompare.mockResolvedValue(true);
});

describe("authorizeCredentials", () => {
  describe("success", () => {
    it("returns ok and the user for the right password", async () => {
      const result = await login();

      expect(result).toEqual({
        status: "ok",
        user: {
          id: userId,
          email: "adam@email.com",
          name: "Adam Smith",
          first_name: "Adam",
          last_name: "Smith",
          role: "DIRECTOR",
        },
      });
    });

    it("never returns the password, hash or lockout fields", async () => {
      const result = await login();
      const text = JSON.stringify(result);

      expect(text).not.toContain(password);
      expect(text).not.toContain(passwordHash);
      expect(text).not.toContain("failed_pwd_attempts");
      expect(text).not.toContain("pwd_locked_until");
    });

    it("looks the user up by the lower case, trimmed email", async () => {
      await login("  Adam@Email.COM ");

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: "adam@email.com" } }),
      );
    });

    it("compares the password exactly as sent", async () => {
      await login(adamRow.email, " Test123! ");

      expect(mockCompare).toHaveBeenCalledWith(" Test123! ", passwordHash);
    });

    it("does not write to the database when there is nothing to reset", async () => {
      await login();

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it("resets old failed attempts", async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        userRow({ failed_pwd_attempts: 3 }),
      );

      const result = await login();

      expect(result.status).toBe("ok");
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { failed_pwd_attempts: 0, pwd_locked_until: null },
      });
    });

    it("logs in and clears the lock once the lock has expired", async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        userRow({ pwd_locked_until: minutesFromNow(-1) }),
      );

      const result = await login();

      expect(result.status).toBe("ok");
      expect(mockCompare).toHaveBeenCalled();
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { failed_pwd_attempts: 0, pwd_locked_until: null },
      });
    });
  });

  describe("invalid", () => {
    it.each([
      ["no credentials", undefined],
      ["empty email", { email: "", password }],
      ["only spaces email", { email: "   ", password }],
      ["empty password", { email: adamRow.email, password: "" }],
      ["missing email", { password }],
      ["missing password", { email: adamRow.email }],
      ["non-string email", { email: 123, password }],
      ["object email", { email: { $ne: "" }, password }],
      ["non-string password", { email: adamRow.email, password: true }],
    ])("returns invalid without touching the database for %s", async (_label, creds) => {
      const result = await authorizeCredentials(creds as never);

      expect(result).toEqual({ status: "invalid" });
      expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("returns invalid when no user has the email", async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await login("nobody@email.com");

      expect(result).toEqual({ status: "invalid" });
      expect(mockCompare).not.toHaveBeenCalled();
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });

    it.each([
      ["null", null],
      ["empty", ""],
    ])("returns invalid when the saved hash is %s (Google-only user)", async (_label, hash) => {
      prismaMock.user.findUnique.mockResolvedValue(userRow({ password_hash: hash }));

      const result = await login();

      expect(result).toEqual({ status: "invalid" });
      expect(mockCompare).not.toHaveBeenCalled();
      // no password to guess, so nothing is counted
      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe("wrong password", () => {
    beforeEach(() => {
      mockCompare.mockResolvedValue(false);
    });

    it("adds 1 to the failed attempts and returns invalid", async () => {
      prismaMock.user.update.mockResolvedValue(userRow({ failed_pwd_attempts: 1 }));

      const result = await login(adamRow.email, "wrongpass");

      expect(result).toEqual({ status: "invalid" });
      expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { failed_pwd_attempts: { increment: 1 } },
        select: { failed_pwd_attempts: true },
      });
    });

    it.each(Array.from({ length: maxPwdAttempts - 1 }, (_, i) => i + 1))(
      "does NOT lock after %i wrong passwords",
      async (attempts) => {
        prismaMock.user.update.mockResolvedValue(
          userRow({ failed_pwd_attempts: attempts }),
        );

        const result = await login(adamRow.email, "wrongpass");

        expect(result).toEqual({ status: "invalid" });
        expect(prismaMock.user.update).toHaveBeenCalledTimes(1);
      },
    );

    it.each([maxPwdAttempts, maxPwdAttempts + 1])(
      "locks the account after %i wrong passwords and returns locked",
      async (attempts) => {
        prismaMock.user.update
          .mockResolvedValueOnce(userRow({ failed_pwd_attempts: attempts }))
          .mockResolvedValueOnce(userRow());

        const before = Date.now();
        const result = await login(adamRow.email, "wrongpass");
        const after = Date.now();

        expect(result).toEqual({ status: "locked" });
        expect(prismaMock.user.update).toHaveBeenCalledTimes(2);

        const lockArgs = prismaMock.user.update.mock.calls[1][0];
        expect(lockArgs.where).toEqual({ id: userId });
        expect(lockArgs.data.failed_pwd_attempts).toBe(0);

        const lockedUntil = lockArgs.data.pwd_locked_until as Date;
        expect(lockedUntil.getTime()).toBeGreaterThanOrEqual(before + lockMs);
        expect(lockedUntil.getTime()).toBeLessThanOrEqual(after + lockMs);
      },
    );

    it("never logs in with a wrong password, even when locking", async () => {
      prismaMock.user.update
        .mockResolvedValueOnce(userRow({ failed_pwd_attempts: maxPwdAttempts }))
        .mockResolvedValueOnce(userRow());

      const result = await login(adamRow.email, "wrongpass");

      expect(result.status).not.toBe("ok");
    });

    it("counts a wrong password after an expired lock", async () => {
      prismaMock.user.findUnique.mockResolvedValue(
        userRow({ pwd_locked_until: minutesFromNow(-1) }),
      );
      prismaMock.user.update.mockResolvedValue(userRow({ failed_pwd_attempts: 1 }));

      const result = await login(adamRow.email, "wrongpass");

      expect(result).toEqual({ status: "invalid" });
      expect(prismaMock.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { failed_pwd_attempts: { increment: 1 } },
        }),
      );
    });
  });

  describe("locked account", () => {
    beforeEach(() => {
      prismaMock.user.findUnique.mockResolvedValue(
        userRow({ pwd_locked_until: minutesFromNow(10) }),
      );
    });

    it("returns locked without checking the password", async () => {
      const result = await login();

      expect(result).toEqual({ status: "locked" });
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it("refuses even the RIGHT password while locked", async () => {
      mockCompare.mockResolvedValue(true);

      const result = await login();

      expect(result).toEqual({ status: "locked" });
    });

    it("does not count attempts made while locked", async () => {
      await login(adamRow.email, "wrongpass");

      expect(prismaMock.user.update).not.toHaveBeenCalled();
    });
  });

  describe("errors", () => {
    it("throws when the database throws (NextAuth reports a sign-in error)", async () => {
      prismaMock.user.findUnique.mockRejectedValue(new Error("connection failed"));

      await expect(login()).rejects.toThrow("connection failed");
    });

    it("throws when bcrypt throws", async () => {
      mockCompare.mockRejectedValue(new Error("compare failed"));

      await expect(login()).rejects.toThrow("compare failed");
    });
  });
});