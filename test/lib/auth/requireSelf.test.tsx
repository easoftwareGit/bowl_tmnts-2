import { requireSelf } from "@/lib/auth/requireSelf";
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

const userId = "usr_5bf5e3c1a2b44d6e8f9a0b1c2d3e4f50";
const otherUserId = "usr_0a1b2c3d4e5f46a7b8c9d0e1f2a3b4c5";

describe("requireSelf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("not logged in - 401", () => {
    it("returns 401 when there is no session", async () => {
      mockAuth.mockResolvedValue(null);

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res).not.toBeNull();
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session is undefined", async () => {
      mockAuth.mockResolvedValue(undefined);

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session has no user", async () => {
      mockAuth.mockResolvedValue({ expires: "2099-01-01" });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session user is null", async () => {
      mockAuth.mockResolvedValue({ user: null, expires: "2099-01-01" });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session user has no id", async () => {
      mockAuth.mockResolvedValue({
        user: { email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session user id is null", async () => {
      mockAuth.mockResolvedValue({
        user: { id: null, email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 when session user id is an empty string", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "", email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });

    it("returns 401 (not null) when session id is empty and requested id is empty", async () => {
      mockAuth.mockResolvedValue({
        user: { id: "", email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf("")) as unknown as MockResponse;

      expect(res).not.toBeNull();
      expect(res.status).toBe(401);
    });
  });

  describe("logged in as a different user - 403", () => {
    it("returns 403 when the session user id does not match", async () => {
      mockAuth.mockResolvedValue({
        user: { id: otherUserId, email: "other@example.com" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 when the requested id is an empty string", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      const res = (await requireSelf("")) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("is case-sensitive: ids differing only by case are rejected", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId.toUpperCase())) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("does not trim: ids with extra whitespace are rejected", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(` ${userId} `)) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("does not allow a partial match (prefix of the session id)", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId.slice(0, 10))) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it("returns 403 for a different user even if they are a DIRECTOR or ADMIN", async () => {
      mockAuth.mockResolvedValue({
        user: { id: otherUserId, role: "ADMIN" },
        expires: "2099-01-01",
      });

      const res = (await requireSelf(userId)) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });
  });

  describe("authorized - returns null", () => {
    it("returns null when the session user id matches", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId, email: "user@example.com" },
        expires: "2099-01-01",
      });

      const res = await requireSelf(userId);

      expect(res).toBeNull();
    });

    it("returns null regardless of the user's role", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId, role: "USER" },
        expires: "2099-01-01",
      });

      const res = await requireSelf(userId);

      expect(res).toBeNull();
    });
  });

  describe("auth and NextResponse usage", () => {
    it("calls auth exactly once", async () => {
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      await requireSelf(userId);

      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("does not build a response when allowed", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue({
        user: { id: userId },
        expires: "2099-01-01",
      });

      await requireSelf(userId);

      expect(NextResponse.json).not.toHaveBeenCalled();
    });

    it("builds the 401 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue(null);

      await requireSelf(userId);

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not logged in" },
        { status: 401 }
      );
    });

    it("builds the 403 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue({
        user: { id: otherUserId },
        expires: "2099-01-01",
      });

      await requireSelf(userId);

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not authorized" },
        { status: 403 }
      );
    });

    it("propagates errors thrown by auth", async () => {
      mockAuth.mockRejectedValue(new Error("auth failed"));

      await expect(requireSelf(userId)).rejects.toThrow("auth failed");
    });
  });
});