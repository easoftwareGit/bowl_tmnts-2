/**
 * @jest-environment node
 */
// Tests for src/lib/auth/guards.ts.
// node environment: NextResponse needs the global Request/Response classes,
// which jsdom doesn't have.
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import {
  hasPrivateRole,
  requireDirector,
  requireSelf,
  requireSelfOrAdmin,
  requireSelfOrDirector,
  requirePrivatePage,
} from "@/lib/auth/guards";

// ---- mocks ----

// auth() would load the real Auth.js config, providers and Prisma
jest.mock("@/auth", () => ({
  __esModule: true,
  auth: jest.fn(),
}));
const mockAuth = auth as unknown as jest.Mock;

// the real redirect() throws to stop rendering; the mock must throw too,
// or requirePrivatePage would keep running after a redirect
class RedirectError extends Error {
  constructor(public url: string) {
    super(`NEXT_REDIRECT ${url}`);
  }
}
jest.mock("next/navigation", () => ({
  __esModule: true,
  redirect: jest.fn((url: string) => {
    throw new RedirectError(url);
  }),
}));
const mockRedirect = redirect as unknown as jest.Mock;

// ---- helpers ----

const selfId = "usr_11111111111111111111111111111111";
const otherId = "usr_22222222222222222222222222222222";

// a logged-in session; pass undefined fields to leave them out
const sessionFor = (user: { id?: string; role?: string }) => ({
  user: { name: "Test User", email: "test@email.com", ...user },
  expires: "2099-01-01T00:00:00.000Z",
});

const loggedInAs = (role: string | undefined, id: string | undefined = selfId) =>
  mockAuth.mockResolvedValue(sessionFor({ id, role }));

// a logged-in session whose user has no id at all
// (loggedInAs can't do this: passing undefined uses its default id)
const loggedInWithoutId = (role: string) =>
  mockAuth.mockResolvedValue(sessionFor({ role }));

const loggedOut = () => mockAuth.mockResolvedValue(null);

// checks a guard's error response: status and { message }
const expectResponse = async (
  res: Response | null,
  status: number,
  message: string,
) => {
  expect(res).not.toBeNull();
  expect(res!.status).toBe(status);
  await expect(res!.json()).resolves.toEqual({ message });
};

const expect401 = (res: Response | null) =>
  expectResponse(res, 401, "not logged in");
const expect403 = (res: Response | null) =>
  expectResponse(res, 403, "not authorized");

beforeEach(() => {
  jest.clearAllMocks();
});

// ---- tests ----

describe("guards", () => {
  describe("hasPrivateRole", () => {
    it.each(["DIRECTOR", "ADMIN"])("allows %s", (role) => {
      expect(hasPrivateRole(role)).toBe(true);
    });

    // exact match only: no case folding or trimming
    it.each([
      ["USER", "USER"],
      ["an empty string", ""],
      ["null", null],
      ["undefined", undefined],
      ["lower case", "director"],
      ["mixed case", "Admin"],
      ["padded", " ADMIN "],
      ["a near miss", "DIRECTORS"],
    ])("refuses %s", (_label, role) => {
      expect(hasPrivateRole(role)).toBe(false);
    });
  });

  describe("requireDirector", () => {
    it("returns 401 when not logged in", async () => {
      loggedOut();
      await expect401(await requireDirector());
    });

    it("returns 401 when the session has no user", async () => {
      mockAuth.mockResolvedValue({ expires: "2099-01-01T00:00:00.000Z" });
      await expect401(await requireDirector());
    });

    it.each([
      ["USER", "USER"],
      ["no role", undefined],
    ])("returns 403 for a user with %s", async (_label, role) => {
      loggedInAs(role);
      await expect403(await requireDirector());
    });

    it.each(["DIRECTOR", "ADMIN"])("allows %s", async (role) => {
      loggedInAs(role);
      await expect(requireDirector()).resolves.toBeNull();
    });

    it("calls auth() once", async () => {
      loggedInAs("DIRECTOR");
      await requireDirector();
      expect(mockAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe("requireSelf", () => {
    it("returns 401 when not logged in", async () => {
      loggedOut();
      await expect401(await requireSelf(selfId));
    });

    it("returns 401 when the session user has no id", async () => {
      loggedInWithoutId("DIRECTOR");
      await expect401(await requireSelf(selfId));
    });

    it("returns 401 when the session user id is empty", async () => {
      loggedInAs("DIRECTOR", "");
      await expect401(await requireSelf(""));
    });

    it("allows the user whose id is in the URL", async () => {
      loggedInAs("USER", selfId);
      await expect(requireSelf(selfId)).resolves.toBeNull();
    });

    // self only: no role gets around it
    it.each(["USER", "DIRECTOR", "ADMIN"])(
      "returns 403 for a %s asking for another user's id",
      async (role) => {
        loggedInAs(role, selfId);
        await expect403(await requireSelf(otherId));
      },
    );
  });

  describe("requireSelfOrAdmin", () => {
    it("returns 401 when not logged in", async () => {
      loggedOut();
      await expect401(await requireSelfOrAdmin(selfId));
    });

    it.each(["USER", "DIRECTOR", "ADMIN"])(
      "allows a %s asking for their own id",
      async (role) => {
        loggedInAs(role, selfId);
        await expect(requireSelfOrAdmin(selfId)).resolves.toBeNull();
      },
    );

    it("allows an ADMIN asking for another user's id", async () => {
      loggedInAs("ADMIN", selfId);
      await expect(requireSelfOrAdmin(otherId)).resolves.toBeNull();
    });

    // SECURITY: in beta every new account is a DIRECTOR, so a director
    // must never reach another user's account through this guard
    it("returns 403 for a DIRECTOR asking for another user's id", async () => {
      loggedInAs("DIRECTOR", selfId);
      await expect403(await requireSelfOrAdmin(otherId));
    });

    it("returns 403 for a USER asking for another user's id", async () => {
      loggedInAs("USER", selfId);
      await expect403(await requireSelfOrAdmin(otherId));
    });

    it("does not treat a missing session id as matching an empty id", async () => {
      loggedInWithoutId("USER");
      await expect403(await requireSelfOrAdmin(""));
    });
  });

  describe("requireSelfOrDirector", () => {
    it("returns 401 when not logged in", async () => {
      loggedOut();
      await expect401(await requireSelfOrDirector(selfId));
    });

    it("allows a USER asking for their own id", async () => {
      loggedInAs("USER", selfId);
      await expect(requireSelfOrDirector(selfId)).resolves.toBeNull();
    });

    // this is the documented (and dangerous) behavior; see the WARNING in guards.ts
    it.each(["DIRECTOR", "ADMIN"])(
      "allows a %s asking for any user's id",
      async (role) => {
        loggedInAs(role, selfId);
        await expect(requireSelfOrDirector(otherId)).resolves.toBeNull();
      },
    );

    it("returns 403 for a USER asking for another user's id", async () => {
      loggedInAs("USER", selfId);
      await expect403(await requireSelfOrDirector(otherId));
    });

    it("does not treat a missing session id as matching an empty id", async () => {
      loggedInWithoutId("USER");
      await expect403(await requireSelfOrDirector(""));
    });
  });

  describe("requirePrivatePage", () => {
    it("redirects to /login when not logged in", async () => {
      loggedOut();

      await expect(requirePrivatePage()).rejects.toMatchObject({ url: "/login" });
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/login");
    });

    it("redirects to /login when the session has no user", async () => {
      mockAuth.mockResolvedValue({ expires: "2099-01-01T00:00:00.000Z" });

      await expect(requirePrivatePage()).rejects.toMatchObject({ url: "/login" });
    });

    it.each([
      ["USER", "USER"],
      ["no role", undefined],
    ])("redirects a user with %s to /denied", async (_label, role) => {
      loggedInAs(role);

      await expect(requirePrivatePage()).rejects.toMatchObject({ url: "/denied" });
      expect(mockRedirect).toHaveBeenCalledTimes(1);
      expect(mockRedirect).toHaveBeenCalledWith("/denied");
    });

    it.each(["DIRECTOR", "ADMIN"])(
      "returns the session for a %s without redirecting",
      async (role) => {
        const session = sessionFor({ id: selfId, role });
        mockAuth.mockResolvedValue(session);

        await expect(requirePrivatePage()).resolves.toBe(session);
        expect(mockRedirect).not.toHaveBeenCalled();
      },
    );
  });
});