/**
 * @jest-environment node
 */
// test/onlyAuth.test.tsx
// tests for src/auth.ts
//
// auth.ts passes one big config object to NextAuth(). The NextAuth mock
// below saves that object, so the tests can call each piece directly:
// - the Credentials provider's authorize()
// - the Google provider's profile()
// - the session, jwt and signIn callbacks
//
// Everything auth.ts imports (prisma, authorizeCredentials, etc.) is mocked,
// so no database or network is used.
//
// auth.ts reads env vars when it is first imported, so it is loaded with
// loadAuth() (jest.isolateModules + require) after the env vars are set,
// not with a normal import at the top of the file.

import { prismaMock } from "./prismaMock";

// the shared Prisma mock from test/prismaMock.ts (jest.config loads it for
// every test file). These names keep the rest of the tests unchanged.
const mockFindUnique = prismaMock.user.findUnique as unknown as jest.Mock;
const mockUpsert = prismaMock.user.upsert as unknown as jest.Mock;

// ---------- mocks ----------
// jest.mock factories may only use outside variables whose names start with
// "mock". The factories call these lazily, so they always use the current fn.

type TestConfig = {
  pages: { signIn: string };
  session: { strategy: string };
  providers: Provider[];
  callbacks: Callbacks;
};

let mockCapturedConfig: TestConfig | undefined;

const mockAuthorizeCredentials = jest.fn();
const mockIsBetaRegistrationOpen = jest.fn();
const mockBtDbUuid = jest.fn();

jest.mock("next-auth", () => {
  class CredentialsSignin extends Error {
    code = "credentials";
  }
  return {
    __esModule: true,
    CredentialsSignin,
    default: (config: TestConfig) => {
      mockCapturedConfig = config;
      return {
        auth: "mock-auth",
        handlers: "mock-handlers",
        signIn: "mock-signIn",
        signOut: "mock-signOut",
      };
    },
  };
});

jest.mock("next-auth/providers/credentials", () => ({
  __esModule: true,
  default: (options: object) => ({ id: "credentials", ...options }),
}));

jest.mock("next-auth/providers/google", () => ({
  __esModule: true,
  default: (options: object) => ({ id: "google", ...options }),
}));

jest.mock("@/lib/auth/authUtils", () => ({
  accountLockedCode: "account_locked",
  normalizeEmail: (email: string) => email.trim().toLowerCase(),
}));

jest.mock("@/lib/auth/authorizeCredentials", () => ({
  authorizeCredentials: (...args: unknown[]) =>
    mockAuthorizeCredentials(...args),
}));

jest.mock("@/lib/uuid", () => ({
  btDbUuid: (...args: unknown[]) => mockBtDbUuid(...args),
}));

jest.mock("@/lib/auth/registration", () => ({
  isBetaRegistrationOpen: () => mockIsBetaRegistrationOpen(),
}));

// ---------- types for calling the callbacks ----------

type Token = Record<string, unknown>;
type SessionArg = { user?: Record<string, unknown> };

type Callbacks = {
  session: (args: { session: SessionArg; token: Token }) => Promise<SessionArg>;
  jwt: (args: {
    token: Token;
    user?: Record<string, unknown>;
    account?: { provider: string } | null;
    trigger?: string;
    session?: unknown;
  }) => Promise<Token | null>;
  signIn: (args: {
    account?: { provider: string } | null;
    profile?: Record<string, unknown>;
  }) => Promise<boolean | string>;
};

type Provider = {
  id: string;
  name?: string;
  credentials?: Record<string, unknown>;
  clientId?: string;
  clientSecret?: string;
  authorize?: (credentials: unknown) => Promise<unknown>;
  profile?: (profile: Record<string, unknown>) => unknown;
};

// ---------- helpers ----------

const ORIGINAL_ENV = process.env;

/** sets env vars, loads a fresh copy of src/auth.ts, returns its pieces */
function loadAuth(env: Record<string, string | undefined> = {}) {
  process.env = {
    ...ORIGINAL_ENV,
    GOOGLE_CLIENT_ID: "test-google-id",
    GOOGLE_CLIENT_SECRET: "test-google-secret",
    AUTH_DB_RECHECK_MINUTES: undefined,
    ...env,
  };
  // undefined in process.env becomes the string "undefined", so remove it
  for (const key of Object.keys(process.env)) {
    if (process.env[key] === undefined) delete process.env[key];
  }

  mockCapturedConfig = undefined;
  let mod: Record<string, unknown> = {};
  jest.isolateModules(() => {
    mod = require("@/auth");
  });

  const config = mockCapturedConfig as TestConfig | undefined;
  if (!config) throw new Error("NextAuth was not called");

  const credentials = config.providers.find((p) => p.id === "credentials");
  const google = config.providers.find((p) => p.id === "google");
  if (!credentials || !google) throw new Error("provider missing");

  return { mod, config, callbacks: config.callbacks, credentials, google };
}

const NOW = new Date("2026-11-11T12:00:00Z").getTime();
const MINUTE = 60 * 1000;

const dbUser = {
  id: "usr_123",
  email: "jane@example.com",
  first_name: "Jane",
  last_name: "Doe",
  role: "DIRECTOR",
};

const tokenUserSelect = {
  id: true,
  email: true,
  first_name: true,
  last_name: true,
  role: true,
};

/** a Google profile for signIn(); override any field */
function googleProfile(overrides: Record<string, unknown> = {}) {
  return {
    sub: "google-sub-1",
    email: "  New.User@Example.com ",
    email_verified: true,
    name: "New User",
    given_name: "New",
    family_name: "User",
    picture: "https://example.com/pic.png",
    ...overrides,
  };
}

// ---------- tests ----------

let loaded: ReturnType<typeof loadAuth>;

beforeAll(() => {
  loaded = loadAuth();
});

beforeEach(() => {
  mockFindUnique.mockReset();
  mockUpsert.mockReset();
  mockAuthorizeCredentials.mockReset();
  mockIsBetaRegistrationOpen.mockReset();
  mockBtDbUuid.mockReset().mockReturnValue("usr_new-uuid");
  jest.spyOn(Date, "now").mockReturnValue(NOW);
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => {
  process.env = ORIGINAL_ENV;
});

describe("auth.ts setup", () => {
  it("exports auth, handlers, signIn and signOut from NextAuth", () => {
    expect(loaded.mod.auth).toBe("mock-auth");
    expect(loaded.mod.handlers).toBe("mock-handlers");
    expect(loaded.mod.signIn).toBe("mock-signIn");
    expect(loaded.mod.signOut).toBe("mock-signOut");
  });

  it("uses /login as the sign-in page", () => {
    expect(loaded.config.pages.signIn).toBe("/login");
  });

  it("uses the jwt session strategy", () => {
    expect(loaded.config.session.strategy).toBe("jwt");
  });

  it("has exactly the credentials and google providers", () => {
    expect(loaded.config.providers.map((p) => p.id)).toEqual([
      "credentials",
      "google",
    ]);
  });

  it("sets up the credentials provider's email and password fields", () => {
    expect(loaded.credentials.name).toBe("Email and Password");
    expect(loaded.credentials.credentials).toEqual({
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    });
  });

  it("passes the Google client id and secret from env", () => {
    expect(loaded.google.clientId).toBe("test-google-id");
    expect(loaded.google.clientSecret).toBe("test-google-secret");
  });
});

describe("credentials authorize()", () => {
  const creds = { email: "jane@example.com", password: "Test123!" };

  it("returns the user when the credentials are valid", async () => {
    const user = { ...dbUser, name: "Jane Doe" };
    mockAuthorizeCredentials.mockResolvedValue({ status: "ok", user });

    await expect(loaded.credentials.authorize!(creds)).resolves.toBe(user);
    expect(mockAuthorizeCredentials).toHaveBeenCalledWith(creds);
  });

  it("returns null when the credentials are invalid", async () => {
    mockAuthorizeCredentials.mockResolvedValue({ status: "invalid" });

    await expect(loaded.credentials.authorize!(creds)).resolves.toBeNull();
  });

  it("throws an error with code account_locked when the account is locked", async () => {
    mockAuthorizeCredentials.mockResolvedValue({ status: "locked" });

    await expect(loaded.credentials.authorize!(creds)).rejects.toMatchObject({
      code: "account_locked",
    });
  });

  it("lets errors from authorizeCredentials pass through", async () => {
    mockAuthorizeCredentials.mockRejectedValue(new Error("db down"));

    await expect(loaded.credentials.authorize!(creds)).rejects.toThrow(
      "db down"
    );
  });
});

describe("google profile()", () => {
  it("keeps only id, name, normalized email and image", () => {
    const result = loaded.google.profile!(googleProfile());

    expect(result).toEqual({
      id: "google-sub-1",
      name: "New User",
      email: "new.user@example.com",
      image: "https://example.com/pic.png",
    });
  });
});

describe("session callback", () => {
  it("copies the token fields onto session.user and builds the name", async () => {
    const result = await loaded.callbacks.session({
      session: { user: {} },
      token: {
        id: "usr_123",
        first_name: "Jane",
        last_name: "Doe",
        role: "ADMIN",
      },
    });

    expect(result.user).toEqual({
      id: "usr_123",
      first_name: "Jane",
      last_name: "Doe",
      role: "ADMIN",
      name: "Jane Doe",
    });
  });

  it("uses defaults when the token is missing fields", async () => {
    const result = await loaded.callbacks.session({
      session: { user: {} },
      token: {},
    });

    expect(result.user).toEqual({
      id: "",
      first_name: "",
      last_name: "",
      role: "USER",
      name: "",
    });
  });

  it("trims the name when one part is empty", async () => {
    const result = await loaded.callbacks.session({
      session: { user: {} },
      token: { id: "usr_1", first_name: "Jane", role: "USER" },
    });

    expect(result.user?.name).toBe("Jane");
  });

  it("returns the session unchanged when there is no session.user", async () => {
    const session = {};
    const result = await loaded.callbacks.session({
      session,
      token: { id: "usr_123", role: "ADMIN" },
    });

    expect(result).toBe(session);
    expect(result).toEqual({});
  });
});

describe("jwt callback", () => {
  describe("credentials sign-in", () => {
    it("copies the user onto the token without reading the database", async () => {
      const user = { ...dbUser, name: "Jane Doe" };

      const token = await loaded.callbacks.jwt({
        token: {},
        user,
        account: { provider: "credentials" },
      });

      expect(token).toEqual({
        id: "usr_123",
        email: "jane@example.com",
        first_name: "Jane",
        last_name: "Doe",
        role: "DIRECTOR",
        name: "Jane Doe",
        dbCheckedAt: NOW,
      });
      expect(mockFindUnique).not.toHaveBeenCalled();
    });
  });

  describe("google sign-in", () => {
    const googleUser = { id: "google-sub-1", email: " Jane@Example.com " };
    const account = { provider: "google" };

    it("reads the user from the database by normalized email", async () => {
      mockFindUnique.mockResolvedValue(dbUser);

      const token = await loaded.callbacks.jwt({
        token: {},
        user: googleUser,
        account,
      });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { email: "jane@example.com" },
        select: tokenUserSelect,
      });
      expect(token).toEqual({
        id: "usr_123", // database id, not the Google sub
        email: "jane@example.com",
        first_name: "Jane",
        last_name: "Doe",
        role: "DIRECTOR",
        name: "Jane Doe",
        dbCheckedAt: NOW,
      });
    });

    it("defaults a null role to USER", async () => {
      mockFindUnique.mockResolvedValue({ ...dbUser, role: null });

      const token = await loaded.callbacks.jwt({
        token: {},
        user: googleUser,
        account,
      });

      expect(token?.role).toBe("USER");
    });

    it("returns null when the Google user has no email", async () => {
      const token = await loaded.callbacks.jwt({
        token: {},
        user: { id: "google-sub-1" },
        account,
      });

      expect(token).toBeNull();
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it("returns null when the user is not in the database", async () => {
      mockFindUnique.mockResolvedValue(null);

      const token = await loaded.callbacks.jwt({
        token: {},
        user: googleUser,
        account,
      });

      expect(token).toBeNull();
    });
  });

  describe("later requests (no user)", () => {
    const freshToken = () => ({
      id: "usr_123",
      email: "old@example.com",
      first_name: "Old",
      last_name: "Name",
      role: "USER",
      name: "Old Name",
      dbCheckedAt: NOW - 1 * MINUTE,
    });

    it("returns the token unchanged when it was checked recently", async () => {
      const token = freshToken();

      const result = await loaded.callbacks.jwt({ token });

      expect(result).toEqual(freshToken());
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it("does not recheck at exactly 5 minutes", async () => {
      const token = { ...freshToken(), dbCheckedAt: NOW - 5 * MINUTE };

      await loaded.callbacks.jwt({ token });

      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it("rechecks the database after 5 minutes and syncs the token", async () => {
      mockFindUnique.mockResolvedValue(dbUser);
      const token = { ...freshToken(), dbCheckedAt: NOW - 5 * MINUTE - 1 };

      const result = await loaded.callbacks.jwt({ token });

      expect(mockFindUnique).toHaveBeenCalledWith({
        where: { id: "usr_123" },
        select: tokenUserSelect,
      });
      expect(result).toEqual({
        id: "usr_123",
        email: "jane@example.com",
        first_name: "Jane",
        last_name: "Doe",
        role: "DIRECTOR",
        name: "Jane Doe",
        dbCheckedAt: NOW,
      });
    });

    it("rechecks when the token has no dbCheckedAt", async () => {
      mockFindUnique.mockResolvedValue(dbUser);
      const token: Token = freshToken();
      delete token.dbCheckedAt;

      const result = await loaded.callbacks.jwt({ token });

      expect(mockFindUnique).toHaveBeenCalled();
      expect(result?.dbCheckedAt).toBe(NOW);
    });

    it("rechecks on update() even when the token is fresh", async () => {
      mockFindUnique.mockResolvedValue(dbUser);

      const result = await loaded.callbacks.jwt({
        token: freshToken(),
        trigger: "update",
      });

      expect(mockFindUnique).toHaveBeenCalled();
      expect(result?.first_name).toBe("Jane");
    });

    it("ignores the update() payload from the browser and uses the database", async () => {
      mockFindUnique.mockResolvedValue({ ...dbUser, role: "USER" });

      const result = await loaded.callbacks.jwt({
        token: freshToken(),
        trigger: "update",
        session: { user: { role: "ADMIN", first_name: "Hacker" } },
      });

      expect(result?.role).toBe("USER");
      expect(result?.first_name).toBe("Jane");
    });

    it("defaults a null role to USER on recheck", async () => {
      mockFindUnique.mockResolvedValue({ ...dbUser, role: null });

      const result = await loaded.callbacks.jwt({
        token: freshToken(),
        trigger: "update",
      });

      expect(result?.role).toBe("USER");
    });

    it("returns null when the token has no id", async () => {
      const token: Token = freshToken();
      delete token.id;

      const result = await loaded.callbacks.jwt({ token, trigger: "update" });

      expect(result).toBeNull();
      expect(mockFindUnique).not.toHaveBeenCalled();
    });

    it("returns null when the user was deleted from the database", async () => {
      mockFindUnique.mockResolvedValue(null);

      const result = await loaded.callbacks.jwt({
        token: freshToken(),
        trigger: "update",
      });

      expect(result).toBeNull();
    });
  });

  describe("AUTH_DB_RECHECK_MINUTES", () => {
    it("uses the recheck time from the env var", async () => {
      const custom = loadAuth({ AUTH_DB_RECHECK_MINUTES: "10" });
      mockFindUnique.mockResolvedValue(dbUser);

      // 6 minutes old: still fresh with a 10-minute window
      await custom.callbacks.jwt({
        token: { id: "usr_123", dbCheckedAt: NOW - 6 * MINUTE },
      });
      expect(mockFindUnique).not.toHaveBeenCalled();

      // 11 minutes old: recheck
      await custom.callbacks.jwt({
        token: { id: "usr_123", dbCheckedAt: NOW - 11 * MINUTE },
      });
      expect(mockFindUnique).toHaveBeenCalledTimes(1);
    });
  });
});

describe("signIn callback", () => {
  const google = { provider: "google" };

  it("allows credentials sign-in without reading the database", async () => {
    const result = await loaded.callbacks.signIn({
      account: { provider: "credentials" },
    });

    expect(result).toBe(true);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("rejects a Google profile with no email", async () => {
    const result = await loaded.callbacks.signIn({
      account: google,
      profile: googleProfile({ email: undefined }),
    });

    expect(result).toBe(false);
  });

  it("rejects a Google profile when there is no profile", async () => {
    const result = await loaded.callbacks.signIn({ account: google });

    expect(result).toBe(false);
  });

  it("rejects an email Google has not verified", async () => {
    const result = await loaded.callbacks.signIn({
      account: google,
      profile: googleProfile({ email_verified: false }),
    });

    expect(result).toBe(false);
    expect(mockFindUnique).not.toHaveBeenCalled();
  });

  it("lets an existing user sign in, even when beta registration is closed", async () => {
    mockFindUnique.mockResolvedValue({ id: "usr_123" });
    mockIsBetaRegistrationOpen.mockReturnValue(false);

    const result = await loaded.callbacks.signIn({
      account: google,
      profile: googleProfile(),
    });

    expect(result).toBe(true);
    expect(mockFindUnique).toHaveBeenCalledWith({
      where: { email: "new.user@example.com" },
      select: { id: true },
    });
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("sends a new user to /login?error=no_account when beta registration is closed", async () => {
    mockFindUnique.mockResolvedValue(null);
    mockIsBetaRegistrationOpen.mockReturnValue(false);

    const result = await loaded.callbacks.signIn({
      account: google,
      profile: googleProfile(),
    });

    expect(result).toBe("/login?error=no_account");
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  describe("new user, beta registration open", () => {
    beforeEach(() => {
      mockFindUnique.mockResolvedValue(null);
      mockIsBetaRegistrationOpen.mockReturnValue(true);
      mockUpsert.mockResolvedValue({});
    });

    it("creates the user as a DIRECTOR and returns true", async () => {
      const result = await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile(),
      });

      expect(result).toBe(true);
      expect(mockBtDbUuid).toHaveBeenCalledWith("usr");
      expect(mockUpsert).toHaveBeenCalledWith({
        where: { email: "new.user@example.com" },
        create: {
          id: "usr_new-uuid",
          email: "new.user@example.com",
          first_name: "New",
          last_name: "User",
          role: "DIRECTOR",
        },
        update: {},
      });
    });

    it("trims the first and last names", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({ given_name: "  New ", family_name: " User  " }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("New");
      expect(create.last_name).toBe("User");
    });

    it("uses 'none' for a missing first name", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({ given_name: undefined }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("none");
      expect(create.last_name).toBe("User");
    });

    it("uses 'none' for a missing last name", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({ family_name: undefined }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("New");
      expect(create.last_name).toBe("none");
    });

    it("uses profile.name as the first name when both names are missing", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({
          given_name: undefined,
          family_name: undefined,
          name: "Cher",
        }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("Cher");
      expect(create.last_name).toBe("none");
    });

    it("treats whitespace-only names as missing", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({
          given_name: "   ",
          family_name: "  ",
          name: "Cher",
        }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("Cher");
      expect(create.last_name).toBe("none");
    });

    it("uses 'none' for both names when every name is missing", async () => {
      await loaded.callbacks.signIn({
        account: google,
        profile: googleProfile({
          given_name: undefined,
          family_name: undefined,
          name: undefined,
        }),
      });

      const { create } = mockUpsert.mock.calls[0][0];
      expect(create.first_name).toBe("none");
      expect(create.last_name).toBe("none");
    });
  });
});

// /**
//  * @jest-environment node
//  */
// // test/auth.test.ts
// // Tests for src/auth.ts.
// //
// // How: NextAuth(config) is mocked, so importing auth.ts just records the
// // config object. The tests then call the config's callbacks (jwt, signIn,
// // session) and provider functions (authorize, profile) directly.
// // The real next-auth never loads.
// import NextAuth from "next-auth";
// import type { User } from "@prisma/client";
// import { prismaMock } from "./prismaMock";
// import { authorizeCredentials } from "@/lib/auth/authorizeCredentials";
// import { accountLockedCode } from "@/lib/auth/authUtils";
// import { isBetaRegistrationOpen } from "@/lib/auth/registration";
// import "@/auth"; // runs NextAuth(config) once, with the mock below

// // ---- mocks ----

// // NextAuth: record the config; CredentialsSignin: a plain Error subclass
// jest.mock("next-auth", () => {
//   class CredentialsSignin extends Error {
//     code = "credentials";
//   }
//   return {
//     __esModule: true,
//     default: jest.fn(() => ({
//       auth: jest.fn(),
//       handlers: {},
//       signIn: jest.fn(),
//       signOut: jest.fn(),
//     })),
//     CredentialsSignin,
//   };
// });

// // providers: return their options, so the tests can call authorize/profile
// jest.mock("next-auth/providers/credentials", () => ({
//   __esModule: true,
//   default: (options: object) => ({ id: "credentials", ...options }),
// }));
// jest.mock("next-auth/providers/google", () => ({
//   __esModule: true,
//   default: (options: object) => ({ id: "google", ...options }),
// }));

// // the email + password check has its own tests
// jest.mock("@/lib/auth/authorizeCredentials", () => ({
//   __esModule: true,
//   authorizeCredentials: jest.fn(),
// }));
// const mockAuthorizeCredentials = authorizeCredentials as jest.MockedFunction<
//   typeof authorizeCredentials
// >;

// const newUserId = "usr_11111111111111111111111111111111";
// jest.mock("@/lib/uuid", () => ({
//   __esModule: true,
//   btDbUuid: () => "usr_11111111111111111111111111111111",
// }));

// // REGISTRATION_MODE decides whether new Google users may sign up;
// // mock it so these tests don't depend on the local .env file
// jest.mock("@/lib/auth/registration", () => ({
//   __esModule: true,
//   isBetaRegistrationOpen: jest.fn(),
// }));
// const mockIsOpen = isBetaRegistrationOpen as jest.MockedFunction<
//   typeof isBetaRegistrationOpen
// >;

// // ---- the captured config ----

// type Token = Record<string, unknown>;
// type JwtArgs = {
//   token: Token;
//   user?: Record<string, unknown>;
//   account?: { provider: string } | null;
//   trigger?: "signIn" | "signUp" | "update";
//   session?: unknown;
// };
// type CapturedConfig = {
//   pages: { signIn: string };
//   session: { strategy: string };
//   providers: {
//     id: string;
//     authorize?: (credentials: unknown) => Promise<unknown>;
//     profile?: (profile: Record<string, unknown>) => Record<string, unknown>;
//   }[];
//   callbacks: {
//     jwt: (args: JwtArgs) => Promise<Token | null>;
//     signIn: (args: {
//       account?: { provider: string } | null;
//       profile?: Record<string, unknown>;
//     }) => Promise<boolean | string>;
//     session: (args: {
//       session: { user?: Record<string, unknown> };
//       token: Token;
//     }) => Promise<{ user?: Record<string, unknown> }>;
//   };
// };

// // NextAuth was called once, when auth.ts was imported
// const config = (NextAuth as unknown as jest.Mock).mock
//   .calls[0][0] as CapturedConfig;
// const { jwt, signIn, session } = config.callbacks;
// const provider = (id: string) => {
//   const found = config.providers.find((p) => p.id === id);
//   if (!found) throw new Error(`no ${id} provider`);
//   return found;
// };
// const authorize = provider("credentials").authorize!;
// const googleProfile = provider("google").profile!;

// // ---- test data ----

// const userId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
// const MINUTE = 60 * 1000;

// const adamRow: User = {
//   id: userId,
//   email: "adam@email.com",
//   first_name: "Adam",
//   last_name: "Smith",
//   phone: "+18005551212",
//   role: "DIRECTOR",
//   password_hash: "hashed-Test123!",
//   failed_pwd_attempts: 0,
//   pwd_locked_until: null,
//   createdAt: new Date("2025-01-01T00:00:00.000Z"),
//   updatedAt: new Date("2025-01-01T00:00:00.000Z"),
// };

// const appUser = {
//   id: userId,
//   email: "adam@email.com",
//   name: "Adam Smith",
//   first_name: "Adam",
//   last_name: "Smith",
//   role: "DIRECTOR",
// };

// // a token from an earlier sign-in, last checked `ago` ms ago
// const oldToken = (ago: number, patch: Token = {}): Token => ({
//   id: userId,
//   email: "adam@email.com",
//   first_name: "Adam",
//   last_name: "Smith",
//   name: "Adam Smith",
//   role: "DIRECTOR",
//   dbCheckedAt: Date.now() - ago,
//   ...patch,
// });

// const googleUserProfile = (patch: Record<string, unknown> = {}) => ({
//   sub: "google-sub-123",
//   email: "Adam@Gmail.com",
//   email_verified: true,
//   name: "Adam Smith",
//   given_name: "Adam",
//   family_name: "Smith",
//   picture: "https://example.com/adam.png",
//   ...patch,
// });

// beforeEach(() => {
//   // clear, not reset: keeps NextAuth's recorded call (the config)
//   jest.clearAllMocks();
//   mockIsOpen.mockReturnValue(true);
//   prismaMock.user.findUnique.mockResolvedValue(adamRow);
//   prismaMock.user.upsert.mockResolvedValue(adamRow);
// });

// describe("auth.ts", () => {
//   describe("config", () => {
//     it("uses /login as the sign-in page", () => {
//       expect(config.pages.signIn).toBe("/login");
//     });

//     it("uses JWT sessions", () => {
//       expect(config.session.strategy).toBe("jwt");
//     });

//     it("has credentials and google providers", () => {
//       expect(config.providers.map((p) => p.id)).toEqual(["credentials", "google"]);
//     });
//   });

//   describe("credentials authorize", () => {
//     const creds = { email: "adam@email.com", password: "Test123!" };

//     it("passes the credentials to authorizeCredentials", async () => {
//       mockAuthorizeCredentials.mockResolvedValue({ status: "ok", user: appUser });

//       await authorize(creds);

//       expect(mockAuthorizeCredentials).toHaveBeenCalledWith(creds);
//     });

//     it("returns the user when the login is ok", async () => {
//       mockAuthorizeCredentials.mockResolvedValue({ status: "ok", user: appUser });

//       await expect(authorize(creds)).resolves.toEqual(appUser);
//     });

//     it("returns null when the login is invalid", async () => {
//       mockAuthorizeCredentials.mockResolvedValue({ status: "invalid" });

//       await expect(authorize(creds)).resolves.toBeNull();
//     });

//     it("throws an error with the account_locked code when locked", async () => {
//       mockAuthorizeCredentials.mockResolvedValue({ status: "locked" });

//       await expect(authorize(creds)).rejects.toMatchObject({
//         code: accountLockedCode,
//       });
//     });
//   });

//   describe("google profile", () => {
//     it("maps the Google profile and lower cases the email", () => {
//       expect(googleProfile(googleUserProfile())).toEqual({
//         id: "google-sub-123",
//         name: "Adam Smith",
//         email: "adam@gmail.com",
//         image: "https://example.com/adam.png",
//       });
//     });
//   });

//   describe("signIn callback", () => {
//     const google = { provider: "google" };

//     beforeEach(() => {
//       // most Google tests below are a brand-new user; the existing-user
//       // tests set findUnique back to adamRow
//       prismaMock.user.findUnique.mockResolvedValue(null);
//     });

//     it("allows credentials sign-in without touching the database", async () => {
//       await expect(signIn({ account: { provider: "credentials" } })).resolves.toBe(true);
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//       expect(mockIsOpen).not.toHaveBeenCalled();
//     });

//     it("refuses when Google sends no email", async () => {
//       const result = await signIn({
//         account: google,
//         profile: googleUserProfile({ email: undefined }),
//       });

//       expect(result).toBe(false);
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//     });

//     // SECURITY
//     it.each([
//       ["false", false],
//       ["missing", undefined],
//     ])("refuses a Google email whose email_verified is %s", async (_label, verified) => {
//       const result = await signIn({
//         account: google,
//         profile: googleUserProfile({ email_verified: verified }),
//       });

//       expect(result).toBe(false);
//       // refused before any lookup, so an unverified email can't probe for accounts
//       expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//     });

//     it("looks the user up by the lower case email, selecting only the id", async () => {
//       await signIn({ account: google, profile: googleUserProfile() });

//       expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
//         where: { email: "adam@gmail.com" },
//         select: { id: true },
//       });
//     });

//     it("lets a database error from the lookup stop the sign-in", async () => {
//       prismaMock.user.findUnique.mockRejectedValue(new Error("connection failed"));

//       await expect(
//         signIn({ account: google, profile: googleUserProfile() }),
//       ).rejects.toThrow("connection failed");
//       expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//     });

//     describe("existing user", () => {
//       beforeEach(() => {
//         prismaMock.user.findUnique.mockResolvedValue(adamRow);
//       });

//       it("signs in without creating or changing the row", async () => {
//         await expect(
//           signIn({ account: google, profile: googleUserProfile() }),
//         ).resolves.toBe(true);
//         expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//       });

//       it("signs in even when registration is closed", async () => {
//         mockIsOpen.mockReturnValue(false);

//         await expect(
//           signIn({ account: google, profile: googleUserProfile() }),
//         ).resolves.toBe(true);
//         // the registration mode only matters for new users
//         expect(mockIsOpen).not.toHaveBeenCalled();
//       });
//     });

//     // SECURITY: after launch, only ADMIN creates accounts
//     describe("new user, registration closed", () => {
//       beforeEach(() => {
//         mockIsOpen.mockReturnValue(false);
//       });

//       it("redirects to the login page with the no_account error", async () => {
//         await expect(
//           signIn({ account: google, profile: googleUserProfile() }),
//         ).resolves.toBe("/login?error=no_account");
//       });

//       it("does not create a user", async () => {
//         await signIn({ account: google, profile: googleUserProfile() });

//         expect(mockIsOpen).toHaveBeenCalledTimes(1);
//         expect(prismaMock.user.upsert).not.toHaveBeenCalled();
//       });
//     });

//     describe("new user, beta registration open", () => {
//       it("signs in after creating the user", async () => {
//         await expect(
//           signIn({ account: google, profile: googleUserProfile() }),
//         ).resolves.toBe(true);
//         expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
//       });

//       it("upserts by the lower case email", async () => {
//         await signIn({ account: google, profile: googleUserProfile() });

//         expect(prismaMock.user.upsert).toHaveBeenCalledWith(
//           expect.objectContaining({ where: { email: "adam@gmail.com" } }),
//         );
//       });

//       it("creates the user as DIRECTOR with a usr_ id", async () => {
//         await signIn({ account: google, profile: googleUserProfile() });

//         expect(prismaMock.user.upsert).toHaveBeenCalledWith(
//           expect.objectContaining({
//             create: {
//               id: newUserId,
//               email: "adam@gmail.com",
//               first_name: "Adam",
//               last_name: "Smith",
//               role: "DIRECTOR",
//             },
//           }),
//         );
//       });

//       // if two first sign-ins race, the second upsert finds the row the
//       // first created; it must leave that row as it is
//       it("does not change the row if it already exists by then", async () => {
//         await signIn({ account: google, profile: googleUserProfile() });

//         expect(prismaMock.user.upsert).toHaveBeenCalledWith(
//           expect.objectContaining({ update: {} }),
//         );
//       });

//       it("trims Google's first and last names", async () => {
//         await signIn({
//           account: google,
//           profile: googleUserProfile({ given_name: "  Adam ", family_name: " Smith  " }),
//         });

//         const { create } = prismaMock.user.upsert.mock.calls[0][0];
//         expect(create.first_name).toBe("Adam");
//         expect(create.last_name).toBe("Smith");
//       });

//       it("uses 'none' when Google has no first or last name", async () => {
//         await signIn({
//           account: google,
//           profile: googleUserProfile({ given_name: "Adam", family_name: undefined }),
//         });

//         const { create } = prismaMock.user.upsert.mock.calls[0][0];
//         expect(create.first_name).toBe("Adam");
//         expect(create.last_name).toBe("none");
//       });

//       it("uses the full name as the first name when both names are missing", async () => {
//         await signIn({
//           account: google,
//           profile: googleUserProfile({ given_name: "", family_name: "  " }),
//         });

//         const { create } = prismaMock.user.upsert.mock.calls[0][0];
//         expect(create.first_name).toBe("Adam Smith");
//         expect(create.last_name).toBe("none");
//       });

//       it("lets a database error from the upsert stop the sign-in", async () => {
//         prismaMock.user.upsert.mockRejectedValue(new Error("connection failed"));

//         await expect(
//           signIn({ account: google, profile: googleUserProfile() }),
//         ).rejects.toThrow("connection failed");
//       });
//     });
//   });

//   describe("jwt callback", () => {
//     describe("credentials sign-in", () => {
//       it("copies the user into the token without a database call", async () => {
//         const before = Date.now();
//         const token = await jwt({
//           token: {},
//           user: appUser,
//           account: { provider: "credentials" },
//         });

//         expect(token).toMatchObject({
//           id: userId,
//           email: "adam@email.com",
//           first_name: "Adam",
//           last_name: "Smith",
//           name: "Adam Smith",
//           role: "DIRECTOR",
//         });
//         expect(token?.dbCheckedAt).toBeGreaterThanOrEqual(before);
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });
//     });

//     describe("google sign-in", () => {
//       const google = { provider: "google" };

//       it("reads id, names and role from the database by lower case email", async () => {
//         const token = await jwt({
//           token: {},
//           user: { email: "Adam@Email.com", name: "Google Name" },
//           account: google,
//         });

//         expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
//           expect.objectContaining({ where: { email: "adam@email.com" } }),
//         );
//         // names come from the database, not from Google's "Google Name"
//         expect(token).toMatchObject({
//           id: userId,
//           email: "adam@email.com",
//           first_name: "Adam",
//           last_name: "Smith",
//           name: "Adam Smith",
//           role: "DIRECTOR",
//         });
//       });

//       it("refuses the sign-in when the user has no email", async () => {
//         const token = await jwt({ token: {}, user: { name: "Adam" }, account: google });

//         expect(token).toBeNull();
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });

//       it("refuses the sign-in when the user is not in the database", async () => {
//         prismaMock.user.findUnique.mockResolvedValue(null);

//         const token = await jwt({
//           token: {},
//           user: { email: "adam@email.com" },
//           account: google,
//         });

//         expect(token).toBeNull();
//       });
//     });

//     describe("periodic database check", () => {
//       it("does not query the database when the token was checked recently", async () => {
//         const token = oldToken(4 * MINUTE);

//         const result = await jwt({ token });

//         expect(result).toBe(token);
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });

//       // the old code compared against 5 ms, so this would have queried
//       it("does not query the database a few seconds after the last check", async () => {
//         await jwt({ token: oldToken(5000) });

//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });

//       it("re-reads the user after 5 minutes and updates the token", async () => {
//         prismaMock.user.findUnique.mockResolvedValue({
//           ...adamRow,
//           first_name: "Adam J.",
//           email: "adam.j@email.com",
//           role: "ADMIN",
//         });
//         const before = Date.now();

//         const token = await jwt({ token: oldToken(6 * MINUTE) });

//         expect(prismaMock.user.findUnique).toHaveBeenCalledWith(
//           expect.objectContaining({ where: { id: userId } }),
//         );
//         expect(token).toMatchObject({
//           email: "adam.j@email.com",
//           first_name: "Adam J.",
//           name: "Adam J. Smith",
//           role: "ADMIN",
//         });
//         expect(token?.dbCheckedAt).toBeGreaterThanOrEqual(before);
//       });

//       it("checks a token that has never been checked", async () => {
//         await jwt({ token: oldToken(0, { dbCheckedAt: undefined }) });

//         expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
//       });

//       it("ends the session when the user was deleted", async () => {
//         prismaMock.user.findUnique.mockResolvedValue(null);

//         await expect(jwt({ token: oldToken(6 * MINUTE) })).resolves.toBeNull();
//       });

//       it("ends the session when the token has no id", async () => {
//         const token = await jwt({ token: oldToken(6 * MINUTE, { id: undefined }) });

//         expect(token).toBeNull();
//         expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
//       });
//     });

//     // SECURITY: the update() payload comes from the browser
//     describe("useSession().update()", () => {
//       it("re-reads the user from the database, even right after a check", async () => {
//         await jwt({ token: oldToken(1000), trigger: "update", session: {} });

//         expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
//       });

//       it("ignores names and email sent in the update payload", async () => {
//         const token = await jwt({
//           token: oldToken(1000),
//           trigger: "update",
//           session: {
//             email: "someone.else@email.com",
//             first_name: "Hacker",
//             last_name: "Person",
//             role: "ADMIN",
//           },
//         });

//         // values come from adamRow in the database
//         expect(token).toMatchObject({
//           email: "adam@email.com",
//           first_name: "Adam",
//           last_name: "Smith",
//           role: "DIRECTOR",
//         });
//       });

//       it("picks up a name saved to the database before update()", async () => {
//         prismaMock.user.findUnique.mockResolvedValue({ ...adamRow, first_name: "Adam J." });

//         const token = await jwt({ token: oldToken(1000), trigger: "update", session: {} });

//         expect(token?.first_name).toBe("Adam J.");
//         expect(token?.name).toBe("Adam J. Smith");
//       });
//     });
//   });

//   describe("session callback", () => {
//     it("copies id, names and role from the token", async () => {
//       const result = await session({
//         session: { user: {} },
//         token: oldToken(0),
//       });

//       expect(result.user).toMatchObject({
//         id: userId,
//         first_name: "Adam",
//         last_name: "Smith",
//         name: "Adam Smith",
//         role: "DIRECTOR",
//       });
//     });

//     it("uses defaults when the token is missing fields", async () => {
//       const result = await session({ session: { user: {} }, token: {} });

//       expect(result.user).toMatchObject({
//         id: "",
//         first_name: "",
//         last_name: "",
//         name: "",
//         role: "USER",
//       });
//     });

//     it("leaves a session with no user alone", async () => {
//       const result = await session({ session: {}, token: oldToken(0) });

//       expect(result).toEqual({});
//     });

//     it("never puts the password hash in the session", async () => {
//       const result = await session({
//         session: { user: {} },
//         token: oldToken(0, { password_hash: "hashed-Test123!" }),
//       });

//       expect(JSON.stringify(result)).not.toContain("hashed-Test123!");
//     });
//   });
// });

