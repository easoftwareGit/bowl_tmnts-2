/**
 * @jest-environment node
 */
// test/middleware.test.tsx
// tests for src/middleware.ts
//
// NextAuth and NextResponse are mocked so the test runs in plain Jest:
// - NextAuth(config).auth(handler) returns the handler itself, so the
//   default export of middleware.ts IS our handler and we can call it
//   directly with a fake request.
// - NextResponse.redirect / next return simple objects we can inspect.

import NextAuth from "next-auth";
import { authConfig } from "@/auth-config";
import middleware, { config } from "@/middleware";

jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    // auth(handler) => handler, so the middleware export is the raw handler
    auth: (handler: unknown) => handler,
  })),
}));

jest.mock("next/server", () => ({
  NextResponse: {
    redirect: jest.fn((url: URL | string) => ({
      type: "redirect",
      url: url.toString(),
    })),
    next: jest.fn(() => ({ type: "next" })),
  },
}));

// NextAuth() runs once, when middleware.ts is imported. Save its calls now,
// before any clearMocks/resetMocks setting in jest.config wipes them.
const nextAuthCalls = (NextAuth as jest.Mock).mock.calls.slice();

// ---------- helpers ----------

const ORIGIN = "http://localhost:3000";

type FakeAuth = { user?: { role?: string } } | null;

type FakeReq = {
  nextUrl: URL;
  url: string;
  auth: FakeAuth;
};

type MockResponse = { type: "redirect"; url: string } | { type: "next" };

// the real type from next-auth is complex; our mock makes it a plain function
const handler = middleware as unknown as (req: FakeReq) => MockResponse;

/** builds a fake NextAuthRequest for a path like "/reports?tmnt=1" */
function makeReq(path: string, auth: FakeAuth): FakeReq {
  const url = `${ORIGIN}${path}`;
  return { nextUrl: new URL(url), url, auth };
}

/** logged-in session with the given role */
function session(role?: string): FakeAuth {
  return { user: { role } };
}

/** all the paths the matcher protects (one or more per matcher entry) */
const protectedPaths = [
  "/dataEntry",
  "/dataEntry/newTmnt",
  "/dataEntry/editTmnt/tmt_123",
  "/reports",
  "/reports/results",
  "/hello",
  "/secret",
  "/user",
  "/user/account",
];

const nonDataEntryPaths = protectedPaths.filter(
  (p) => !p.startsWith("/dataEntry")
);

// ---------- tests ----------

describe("middleware", () => {
  describe("setup", () => {
    it("creates NextAuth with the Edge-safe authConfig", () => {
      expect(nextAuthCalls).toHaveLength(1);
      expect(nextAuthCalls[0][0]).toBe(authConfig);
    });
  });

  describe("not logged in", () => {
    it.each(protectedPaths)("redirects %s to /login", (path) => {
      const res = handler(makeReq(path, null));

      expect(res.type).toBe("redirect");
      const url = new URL((res as { url: string }).url);
      expect(url.origin).toBe(ORIGIN);
      expect(url.pathname).toBe("/login");
    });

    it.each(protectedPaths)("sets callbackUrl to %s", (path) => {
      const res = handler(makeReq(path, null));

      const url = new URL((res as { url: string }).url);
      expect(url.searchParams.get("callbackUrl")).toBe(path);
    });

    it("keeps the querystring in callbackUrl", () => {
      const path = "/reports/results?tmnt=tmt_123&div=2";
      const res = handler(makeReq(path, null));

      const url = new URL((res as { url: string }).url);
      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("callbackUrl")).toBe(path);
    });

    it("redirects to /login even for /dataEntry (login check runs before the role check)", () => {
      const res = handler(makeReq("/dataEntry", null));

      const url = new URL((res as { url: string }).url);
      expect(url.pathname).toBe("/login");
    });
  });

  describe("logged in, /dataEntry role check", () => {
    it.each(["DIRECTOR", "ADMIN"])("lets a %s through", (role) => {
      const res = handler(makeReq("/dataEntry", session(role)));
      expect(res).toEqual({ type: "next" });
    });

    it.each(["DIRECTOR", "ADMIN"])(
      "lets a %s into nested dataEntry pages",
      (role) => {
        const res = handler(
          makeReq("/dataEntry/editTmnt/tmt_123", session(role))
        );
        expect(res).toEqual({ type: "next" });
      }
    );

    it("sends a USER to /denied", () => {
      const res = handler(makeReq("/dataEntry", session("USER")));

      expect(res).toEqual({ type: "redirect", url: `${ORIGIN}/denied` });
    });

    it("sends a USER on a nested dataEntry page to /denied", () => {
      const res = handler(makeReq("/dataEntry/newTmnt", session("USER")));

      expect(res).toEqual({ type: "redirect", url: `${ORIGIN}/denied` });
    });

    it("sends a user with no role to /denied", () => {
      const res = handler(makeReq("/dataEntry", session(undefined)));

      expect(res).toEqual({ type: "redirect", url: `${ORIGIN}/denied` });
    });

    it("sends a session with no user object to /denied", () => {
      const res = handler(makeReq("/dataEntry", {}));

      expect(res).toEqual({ type: "redirect", url: `${ORIGIN}/denied` });
    });

    it("treats roles as case-sensitive", () => {
      const res = handler(makeReq("/dataEntry", session("admin")));

      expect(res).toEqual({ type: "redirect", url: `${ORIGIN}/denied` });
    });

    it("does not add a callbackUrl to the /denied redirect", () => {
      const res = handler(makeReq("/dataEntry", session("USER")));

      const url = new URL((res as { url: string }).url);
      expect(url.search).toBe("");
    });
  });

  describe("logged in, pages without a role check", () => {
    it.each(nonDataEntryPaths)("lets a USER into %s", (path) => {
      const res = handler(makeReq(path, session("USER")));
      expect(res).toEqual({ type: "next" });
    });

    it.each(nonDataEntryPaths)("lets a user with no role into %s", (path) => {
      const res = handler(makeReq(path, {}));
      expect(res).toEqual({ type: "next" });
    });
  });

  describe("config.matcher", () => {
    it("protects exactly the expected routes", () => {
      expect(config.matcher).toEqual([
        "/dataEntry/:path*",
        "/reports/:path*",
        "/hello",
        "/secret",
        "/user/:path*",
      ]);
    });

    it.each(["/login", "/denied"])(
      "does not match %s (would cause a redirect loop)",
      (path) => {
        const hit = config.matcher.some((m) => m.startsWith(path));
        expect(hit).toBe(false);
      }
    );

    it("does not include /api (route handlers check auth() themselves)", () => {
      const hit = config.matcher.some((m) => m.startsWith("/api"));
      expect(hit).toBe(false);
    });
  });
});