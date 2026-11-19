/**
 * @jest-environment node
 */
// test/auth-config.test.tsx
// tests for src/auth-config.ts
//
// auth-config.ts is the Edge-safe NextAuth config that middleware.ts uses.
// It only has a type import from next-auth (removed when compiled), so
// nothing needs to be mocked: the tests import the real object and call
// its session callback directly.

import fs from "fs";
import path from "path";
import { authConfig } from "@/auth-config";

// ---------- helpers ----------

type SessionArg = { user?: Record<string, unknown>; expires?: string };

// the real NextAuth callback type needs many more fields than these tests use
const sessionCallback = authConfig.callbacks.session as unknown as (args: {
  session: SessionArg;
  token: Record<string, unknown>;
}) => Promise<SessionArg>;

const fullToken = {
  id: "usr_123",
  email: "jane@example.com",
  first_name: "Jane",
  last_name: "Doe",
  role: "DIRECTOR",
  name: "Jane Doe",
  dbCheckedAt: 1700000000000,
};

// ---------- tests ----------

describe("authConfig", () => {
  describe("settings", () => {
    it("uses /login as the sign-in page", () => {
      expect(authConfig.pages.signIn).toBe("/login");
    });

    it("uses the jwt session strategy (no database needed)", () => {
      expect(authConfig.session.strategy).toBe("jwt");
    });

    it("has no providers, so middleware stays Edge-safe", () => {
      expect(authConfig.providers).toEqual([]);
    });

    it("has only a session callback (no jwt or signIn that could need the database)", () => {
      expect(Object.keys(authConfig.callbacks)).toEqual(["session"]);
    });
  });

  describe("Edge safety", () => {
    // middleware runs on the Edge runtime, which can't load prisma, bcrypt,
    // or other Node-only packages. This file must only import types.
    const source = fs.readFileSync(
      path.join(__dirname, "..", "src", "auth-config.ts"),
      "utf8"
    );

    const importLines = source
      .split(/\r?\n/)
      .filter((line) => /^\s*import\s/.test(line));

    it("only has type imports", () => {
      const runtimeImports = importLines.filter(
        (line) => !/^\s*import\s+type\s/.test(line)
      );
      expect(runtimeImports).toEqual([]);
    });

    it.each(["prisma", "bcrypt", "@/lib", "@/auth\""])(
      "does not import %s",
      (name) => {
        expect(importLines.some((line) => line.includes(name))).toBe(false);
      }
    );
  });

  describe("session callback", () => {
    it("copies id, first_name, last_name and role from the token", async () => {
      const result = await sessionCallback({
        session: { user: {} },
        token: fullToken,
      });

      expect(result.user).toEqual({
        id: "usr_123",
        first_name: "Jane",
        last_name: "Doe",
        role: "DIRECTOR",
      });
    });

    it("keeps the fields already on session.user", async () => {
      const result = await sessionCallback({
        session: {
          user: {
            name: "Jane Doe",
            email: "jane@example.com",
            image: "https://example.com/pic.png",
          },
        },
        token: fullToken,
      });

      expect(result.user).toEqual({
        name: "Jane Doe",
        email: "jane@example.com",
        image: "https://example.com/pic.png",
        id: "usr_123",
        first_name: "Jane",
        last_name: "Doe",
        role: "DIRECTOR",
      });
    });

    it("overwrites old values on session.user with the token's values", async () => {
      const result = await sessionCallback({
        session: { user: { id: "old", role: "USER" } },
        token: fullToken,
      });

      expect(result.user?.id).toBe("usr_123");
      expect(result.user?.role).toBe("DIRECTOR");
    });

    it("does not copy other token fields onto session.user", async () => {
      const result = await sessionCallback({
        session: { user: {} },
        token: fullToken,
      });

      expect(result.user).not.toHaveProperty("dbCheckedAt");
      expect(result.user).not.toHaveProperty("email");
      expect(result.user).not.toHaveProperty("name");
    });

    it("sets missing token fields to undefined (no defaults, unlike auth.ts)", async () => {
      const result = await sessionCallback({
        session: { user: {} },
        token: {},
      });

      expect(result.user).toEqual({
        id: undefined,
        first_name: undefined,
        last_name: undefined,
        role: undefined,
      });
    });

    it("returns the same session object it was given", async () => {
      const session = { user: {}, expires: "2026-12-31T00:00:00.000Z" };

      const result = await sessionCallback({ session, token: fullToken });

      expect(result).toBe(session);
      expect(result.expires).toBe("2026-12-31T00:00:00.000Z");
    });

    it("returns the session unchanged when there is no session.user", async () => {
      const session = { expires: "2026-12-31T00:00:00.000Z" };

      const result = await sessionCallback({ session, token: fullToken });

      expect(result).toBe(session);
      expect(result).toEqual({ expires: "2026-12-31T00:00:00.000Z" });
    });
  });
});