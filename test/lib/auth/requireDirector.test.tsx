import { requireDirector } from "@/lib/auth/requireDirector";
import { auth } from "@/auth";

// Mock next-auth's auth() so the real module (and its providers / Prisma
// adapter) is never loaded during tests.
jest.mock("@/auth", () => ({
  auth: jest.fn(),
}));

// Mock NextResponse.json so the tests don't depend on the Web Response API
// being available in the Jest test environment (jsdom does not provide it).
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}));

// auth() is overloaded in next-auth, so cast through unknown to a plain mock
const mockAuth = auth as unknown as jest.Mock;

type MockResponse = {
  status: number;
  json: () => Promise<{ message: string }>;
};

describe("requireDirector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("not logged in - 401", () => {
    it("returns 401 when there is no session", async () => {
      mockAuth.mockResolvedValue(null);

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res).not.toBeNull();
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session is undefined", async () => {
      mockAuth.mockResolvedValue(undefined);

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session has no user", async () => {
      mockAuth.mockResolvedValue({ expires: "2099-01-01" });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session user is null", async () => {
      mockAuth.mockResolvedValue({ user: null, expires: "2099-01-01" });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });
  });

  describe("logged in but not authorized - 403", () => {
    it("returns 403 when user has no role", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 when user role is null", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: null },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 when user role is an empty string", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: "" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 when user role is USER", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: "USER" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 for an unknown role", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: "SUPERUSER" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("is case-sensitive: lowercase director is rejected", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: "director" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("is case-sensitive: lowercase admin is rejected", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com", role: "admin" },
        expires: "2099-01-01",
      });

      const res = (await requireDirector()) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });
  });

  describe("authorized - returns null", () => {
    it("returns null for a DIRECTOR", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "director@example.com", role: "DIRECTOR" },
        expires: "2099-01-01",
      });

      const res = await requireDirector();

      expect(res).toBeNull();
    });

    it("returns null for an ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "admin@example.com", role: "ADMIN" },
        expires: "2099-01-01",
      });

      const res = await requireDirector();

      expect(res).toBeNull();
    });
  });

  describe("auth and NextResponse usage", () => {
    it("calls auth exactly once", async () => {
      mockAuth.mockResolvedValue({
        user: { role: "DIRECTOR" },
        expires: "2099-01-01",
      });

      await requireDirector();

      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("does not build a response when allowed", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue({
        user: { role: "ADMIN" },
        expires: "2099-01-01",
      });

      await requireDirector();

      expect(NextResponse.json).not.toHaveBeenCalled();
    });

    it("builds the 401 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue(null);

      await requireDirector();

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not logged in" },
        { status: 401 }
      );
    });

    it("builds the 403 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue({
        user: { role: "USER" },
        expires: "2099-01-01",
      });

      await requireDirector();

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not authorized" },
        { status: 403 }
      );
    });

    it("propagates errors thrown by auth", async () => {
      mockAuth.mockRejectedValue(new Error("auth failed"));

      await expect(requireDirector()).rejects.toThrow("auth failed");
    });
  });
});