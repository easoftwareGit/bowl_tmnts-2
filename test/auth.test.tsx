/**
 * @jest-environment node
 */
// test/auth.test.ts
// Tests for src/auth.ts.
//
// How: NextAuth(config) is mocked, so importing auth.ts just records the
// config object. The tests then call the config's callbacks (jwt, signIn,
// session) and provider functions (authorize, profile) directly.
// The real next-auth never loads.
import NextAuth from "next-auth";
import type { User } from "@prisma/client";
import { prismaMock } from "./prismaMock";
import { authorizeCredentials } from "@/lib/auth/authorizeCredentials";
import { accountLockedCode } from "@/lib/auth/authUtils";
import "@/auth"; // runs NextAuth(config) once, with the mock below

// ---- mocks ----

// NextAuth: record the config; CredentialsSignin: a plain Error subclass
jest.mock("next-auth", () => {
  class CredentialsSignin extends Error {
    code = "credentials";
  }
  return {
    __esModule: true,
    default: jest.fn(() => ({
      auth: jest.fn(),
      handlers: {},
      signIn: jest.fn(),
      signOut: jest.fn(),
    })),
    CredentialsSignin,
  };
});

// providers: return their options, so the tests can call authorize/profile
jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: (options: object) => ({ id: "credentials", ...options }),
}));
jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: (options: object) => ({ id: "google", ...options }),
}));

// the email + password check has its own tests
jest.mock("@/lib/auth/authorizeCredentials", () => ({
  __esModule: true,
  authorizeCredentials: jest.fn(),
}));
const mockAuthorizeCredentials = authorizeCredentials as jest.MockedFunction<
  typeof authorizeCredentials
>;

const newUserId = "usr_11111111111111111111111111111111";
jest.mock("@/lib/uuid", () => ({
  __esModule: true,
  btDbUuid: () => "usr_11111111111111111111111111111111",
}));

// ---- the captured config ----

type Token = Record<string, unknown>;
type JwtArgs = {
  token: Token;
  user?: Record<string, unknown>;
  account?: { provider: string } | null;
  trigger?: "signIn" | "signUp" | "update";
  session?: unknown;
};
type CapturedConfig = {
  pages: { signIn: string };
  session: { strategy: string };
  providers: {
    id: string;
    authorize?: (credentials: unknown) => Promise<unknown>;
    profile?: (profile: Record<string, unknown>) => Record<string, unknown>;
  }[];
  callbacks: {
    jwt: (args: JwtArgs) => Promise<Token | null>;
    signIn: (args: {
      account?: { provider: string } | null;
      profile?: Record<string, unknown>;
    }) => Promise<boolean>;
    session: (args: {
      session: { user?: Record<string, unknown> };
      token: Token;
    }) => Promise<{ user?: Record<string, unknown> }>;
  };
};

// NextAuth was called once, when auth.ts was imported
const config = (NextAuth as unknown as jest.Mock).mock
  .calls[0][0] as CapturedConfig;
const { jwt, signIn, session } = config.callbacks;
const provider = (id: string) => {
  const found = config.providers.find((p) => p.id === id);
  if (!found) throw new Error(`no ${id} provider`);
  return found;
};
const authorize = provider("credentials").authorize!;
const googleProfile = provider("google").profile!;

// ---- test data ----

const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const MINUTE = 60 * 1000;

const adamRow: User = {
  id: userId,
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "DIRECTOR",
  password_hash: "hashed-Test123!",
  failed_pwd_attempts: 0,
  pwd_locked_until: null,
  createdAt: new Date("2025-01-01T00:00:00.000Z"),
  updatedAt: new Date("2025-01-01T00:00:00.000Z"),
};

const appUser = {
  id: userId,
  email: "adam@email.com",
  name: "Adam Smith",
  first_name: "Adam",
  last_name: "Smith",
  role: "DIRECTOR",
};

// a token from an earlier sign-in, last checked `ago` ms ago
const oldToken = (ago: number, patch: Token = {}): Token => ({
  id: userId,
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  name: "Adam Smith",
  role: "DIRECTOR",
  dbCheckedAt: Date.now() - ago,
  ...patch,
});

const googleUserProfile = (patch: Record<string, unknown> = {}) => ({
  sub: "google-sub-123",
  email: "Adam@Gmail.com",
  email_verified: true,
  name: "Adam Smith",
  given_name: "Adam",
  family_name: "Smith",
  picture: "https://example.com/adam.png",
  ...patch,
});

beforeEach(() => {
  // clear, not reset: keeps NextAuth's recorded call (the config)
  jest.clearAllMocks();
  prismaMock.user.findUnique.mockResolvedValue(adamRow);
  prismaMock.user.upsert.mockResolvedValue(adamRow);
});

describe("auth.ts", () => {
  describe("config", () => {
    it("uses /login as the sign-in page", () => {
      expect(config.pages.signIn).toBe("/login");
    });

    it("uses JWT sessions", () => {
      expect(config.session.strategy).toBe("jwt");
    });

    it("has credentials and google providers", () => {
      expect(config.providers.map((p) => p.id)).toEqual(["credentials", "google"]);
    });
  });

  describe("credentials authorize", () => {
    const creds = { email: "adam@email.com", password: "Test123!" };

    it("passes the credentials to authorizeCredentials", async () => {
      mockAuthorizeCredentials.mockResolvedValue({ status: "ok", user: appUser });

      await authorize(creds);

      expect(mockAuthorizeCredentials).toHaveBeenCalledWith(creds);
    });

    it("returns the user when the login is ok", async () => {
      mockAuthorizeCredentials.mockResolvedValue({ status: "ok", user: appUser });

      await expect(authorize(creds)).resolves.toEqual(appUser);
    });

    it("returns null when the login is invalid", async () => {
      mockAuthorizeCredentials.mockResolvedValue({ status: "invalid" });

      await expect(authorize(creds)).resolves.toBeNull();
    });

    it("throws an error with the account_locked code when locked", async () => {
      mockAuthorizeCredentials.mockResolvedValue({ status: "locked" });

      await expect(authorize(creds)).rejects.toMatchObject({
        code: accountLockedCode,
      });
    });
  });

  describe("google profile", () => {
    it("maps the Google profile and lower cases the email", () => {
      expect(googleProfile(googleUserProfile())).toEqual({
        id: "google-sub-123",
        name: "Adam Smith",
        email: "adam@gmail.com",
        image: "https://example.com/adam.png",
      });
    });
  });

  describe("signIn callback", () => {
    const google = { provider: "google" };

    it("allows credentials sign-in without touching the database", async () => {
      await expect(signIn({ account: { provider: "credentials" } })).resolves.toBe(true);
      expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    });

    it("throws when Google sends no email", async () => {
      await expect(
        signIn({ account: google, profile: googleUserProfile({ email: undefined }) }),
      ).rejects.toThrow("No Profile email");
    });

    // SECURITY
    it.each([
      ["false", false],
      ["missing", undefined],
    ])("refuses a Google email whose email_verified is %s", async (_label, verified) => {
      const result = await signIn({
        account: google,
        profile: googleUserProfile({ email_verified: verified }),
      });

      expect(result).toBe(false);
      expect(prismaMock.user.upsert).not.toHaveBeenCalled();
    });

    it("upserts by the lower case email", async () => {
      await signIn({ account: google, profile: googleUserProfile() });

      expect(prismaMock.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: "adam@gmail.com" } }),
      );
    });

    it("creates new Google users as DIRECTOR with a usr_ id", async () => {
      await signIn({ account: google, profile: googleUserProfile() });

      expect(prismaMock.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: {
            id: newUserId,
            email: "adam@gmail.com",
            first_name: "Adam",
            last_name: "Smith",
            role: "DIRECTOR",
          },
        }),
      );
    });

    it("does not overwrite an existing user's names", async () => {
      await signIn({ account: google, profile: googleUserProfile() });

      expect(prismaMock.user.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: {} }),
      );
    });

    it("trims Google's first and last names", async () => {
      await signIn({
        account: google,
        profile: googleUserProfile({ given_name: "  Adam ", family_name: " Smith  " }),
      });

      const { create } = prismaMock.user.upsert.mock.calls[0][0];
      expect(create.first_name).toBe("Adam");
      expect(create.last_name).toBe("Smith");
    });

    it("uses 'none' when Google has no first or last name", async () => {
      await signIn({
        account: google,
        profile: googleUserProfile({ given_name: "Adam", family_name: undefined }),
      });

      const { create } = prismaMock.user.upsert.mock.calls[0][0];
      expect(create.first_name).toBe("Adam");
      expect(create.last_name).toBe("none");
    });

    it("uses the full name as the first name when both names are missing", async () => {
      await signIn({
        account: google,
        profile: googleUserProfile({ given_name: "", family_name: "  " }),
      });

      const { create } = prismaMock.user.upsert.mock.calls[0][0];
      expect(create.first_name).toBe("Adam Smith");
      expect(create.last_name).toBe("none");
    });

    it("lets a database error stop the sign-in", async () => {
      prismaMock.user.upsert.mockRejectedValue(new Error("connection failed"));

      await expect(
        signIn({ account: google, profile: googleUserProfile() }),
      ).rejects.toThrow("connection failed");
    });
  });

  describe("jwt callback", () => {
    describe("credentials sign-in", () => {
      it("copies the user into the token without a database call", async () => {
        const before = Date.now();
        const token = await jwt({
          token: {},
          user: appUser,
          account: { provider: "credentials" },
        });

        expect(token).toMatchObject({
          id: userId,
          email: "adam@email.com",
          first_name: "Adam",
          last_name: "Smith",
          name: "Adam Smith",
          role: "DIRECTOR",
        });
        expect(token?.dbCheckedAt).toBeGreaterThanOrEqual(before);
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });
    });

    describe("google sign-in", () => {
      const google = { provider: "google" };

      it("reads id, names and role from the database by lower case email", async () => {
        const token = await jwt({
          token: {},
          user: { email: "Adam@Email.com", name: "Google Name" },
          account: google,
        });

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({ where: { email: "adam@email.com" } }),
        );
        // names come from the database, not from Google's "Google Name"
        expect(token).toMatchObject({
          id: userId,
          email: "adam@email.com",
          first_name: "Adam",
          last_name: "Smith",
          name: "Adam Smith",
          role: "DIRECTOR",
        });
      });

      it("refuses the sign-in when the user has no email", async () => {
        const token = await jwt({ token: {}, user: { name: "Adam" }, account: google });

        expect(token).toBeNull();
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });

      it("refuses the sign-in when the user is not in the database", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        const token = await jwt({
          token: {},
          user: { email: "adam@email.com" },
          account: google,
        });

        expect(token).toBeNull();
      });
    });

    describe("periodic database check", () => {
      it("does not query the database when the token was checked recently", async () => {
        const token = oldToken(4 * MINUTE);

        const result = await jwt({ token });

        expect(result).toBe(token);
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });

      // the old code compared against 5 ms, so this would have queried
      it("does not query the database a few seconds after the last check", async () => {
        await jwt({ token: oldToken(5000) });

        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });

      it("re-reads the user after 5 minutes and updates the token", async () => {
        prismaMock.user.findUnique.mockResolvedValue({
          ...adamRow,
          first_name: "Adam J.",
          email: "adam.j@email.com",
          role: "ADMIN",
        });
        const before = Date.now();

        const token = await jwt({ token: oldToken(6 * MINUTE) });

        expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
          expect.objectContaining({ where: { id: userId } }),
        );
        expect(token).toMatchObject({
          email: "adam.j@email.com",
          first_name: "Adam J.",
          name: "Adam J. Smith",
          role: "ADMIN",
        });
        expect(token?.dbCheckedAt).toBeGreaterThanOrEqual(before);
      });

      it("checks a token that has never been checked", async () => {
        await jwt({ token: oldToken(0, { dbCheckedAt: undefined }) });

        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      });

      it("ends the session when the user was deleted", async () => {
        prismaMock.user.findUnique.mockResolvedValue(null);

        await expect(jwt({ token: oldToken(6 * MINUTE) })).resolves.toBeNull();
      });

      it("ends the session when the token has no id", async () => {
        const token = await jwt({ token: oldToken(6 * MINUTE, { id: undefined }) });

        expect(token).toBeNull();
        expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
      });
    });

    // SECURITY: the update() payload comes from the browser
    describe("useSession().update()", () => {
      it("re-reads the user from the database, even right after a check", async () => {
        await jwt({ token: oldToken(1000), trigger: "update", session: {} });

        expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
      });

      it("ignores names and email sent in the update payload", async () => {
        const token = await jwt({
          token: oldToken(1000),
          trigger: "update",
          session: {
            email: "someone.else@email.com",
            first_name: "Hacker",
            last_name: "Person",
            role: "ADMIN",
          },
        });

        // values come from adamRow in the database
        expect(token).toMatchObject({
          email: "adam@email.com",
          first_name: "Adam",
          last_name: "Smith",
          role: "DIRECTOR",
        });
      });

      it("picks up a name saved to the database before update()", async () => {
        prismaMock.user.findUnique.mockResolvedValue({ ...adamRow, first_name: "Adam J." });

        const token = await jwt({ token: oldToken(1000), trigger: "update", session: {} });

        expect(token?.first_name).toBe("Adam J.");
        expect(token?.name).toBe("Adam J. Smith");
      });
    });
  });

  describe("session callback", () => {
    it("copies id, names and role from the token", async () => {
      const result = await session({
        session: { user: {} },
        token: oldToken(0),
      });

      expect(result.user).toMatchObject({
        id: userId,
        first_name: "Adam",
        last_name: "Smith",
        name: "Adam Smith",
        role: "DIRECTOR",
      });
    });

    it("uses defaults when the token is missing fields", async () => {
      const result = await session({ session: { user: {} }, token: {} });

      expect(result.user).toMatchObject({
        id: "",
        first_name: "",
        last_name: "",
        name: "",
        role: "USER",
      });
    });

    it("leaves a session with no user alone", async () => {
      const result = await session({ session: {}, token: oldToken(0) });

      expect(result).toEqual({});
    });

    it("never puts the password hash in the session", async () => {
      const result = await session({
        session: { user: {} },
        token: oldToken(0, { password_hash: "hashed-Test123!" }),
      });

      expect(JSON.stringify(result)).not.toContain("hashed-Test123!");
    });
  });
});