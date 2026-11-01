import { requireSelfOrDirector } from "@/lib/auth/requireSelfOrDirector";
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

const session = (user: Record<string, unknown> | null) => ({
  user,
  expires: "2099-01-01",
});

describe("requireSelfOrDirector", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("not logged in - 401", () => {
    it.each([
      ["there is no session", null],
      ["session is undefined", undefined],
      ["session has no user", { expires: "2099-01-01" }],
      ["session user is null", session(null)],
    ])("returns 401 when %s", async (_label, value) => {
      mockAuth.mockResolvedValue(value);

      const res = (await requireSelfOrDirector(userId)) as unknown as MockResponse;

      expect(res).not.toBeNull();
      expect(res.status).toBe(401);
      expect(await res.json()).toEqual({ message: "not logged in" });
    });
  });

  describe("the user themself - allowed", () => {
    it.each(["USER", "DIRECTOR", "ADMIN"])(
      "returns null when a %s asks for their own id",
      async (role) => {
        mockAuth.mockResolvedValue(session({ id: userId, role }));

        expect(await requireSelfOrDirector(userId)).toBeNull();
      }
    );

    it("returns null for their own id even with no role", async () => {
      mockAuth.mockResolvedValue(session({ id: userId }));

      expect(await requireSelfOrDirector(userId)).toBeNull();
    });
  });

  describe("a director or admin - allowed for any id", () => {
    it.each(["DIRECTOR", "ADMIN"])(
      "returns null when a %s asks for another user's id",
      async (role) => {
        mockAuth.mockResolvedValue(session({ id: otherUserId, role }));

        expect(await requireSelfOrDirector(userId)).toBeNull();
      }
    );

    it("returns null for a director whose session has no id", async () => {
      mockAuth.mockResolvedValue(session({ role: "DIRECTOR" }));

      expect(await requireSelfOrDirector(userId)).toBeNull();
    });
  });

  describe("another user who is not a director - 403", () => {
    it.each([
      ["a USER", { id: otherUserId, role: "USER" }],
      ["a user with no role", { id: otherUserId }],
      ["a user with a null role", { id: otherUserId, role: null }],
      ["a user with an unknown role", { id: otherUserId, role: "SUPERUSER" }],
      ["a lowercase director", { id: otherUserId, role: "director" }],
      ["a lowercase admin", { id: otherUserId, role: "admin" }],
      ["a user with no id or role", {}],
    ])("returns 403 for %s asking for another id", async (_label, user) => {
      mockAuth.mockResolvedValue(session(user));

      const res = (await requireSelfOrDirector(userId)) as unknown as MockResponse;

      expect(res.status).toBe(403);
      expect(await res.json()).toEqual({ message: "not authorized" });
    });

    it.each([
      ["differs only by case", userId.toUpperCase()],
      ["has extra spaces", ` ${userId} `],
      ["is only the start of the id", userId.slice(0, 10)],
    ])("returns 403 for a USER when the id %s", async (_label, askedId) => {
      mockAuth.mockResolvedValue(session({ id: userId, role: "USER" }));

      const res = (await requireSelfOrDirector(askedId)) as unknown as MockResponse;

      expect(res.status).toBe(403);
    });

    it("does not treat an empty session id as matching an empty requested id", async () => {
      mockAuth.mockResolvedValue(session({ id: "", role: "USER" }));

      const res = (await requireSelfOrDirector("")) as unknown as MockResponse;

      expect(res).not.toBeNull();
      expect(res.status).toBe(403);
    });
  });

  describe("auth and NextResponse usage", () => {
    it("calls auth exactly once", async () => {
      mockAuth.mockResolvedValue(session({ id: userId, role: "USER" }));

      await requireSelfOrDirector(userId);

      expect(mockAuth).toHaveBeenCalledTimes(1);
    });

    it("does not build a response when allowed", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue(session({ id: userId, role: "USER" }));

      await requireSelfOrDirector(userId);

      expect(NextResponse.json).not.toHaveBeenCalled();
    });

    it("builds the 401 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue(null);

      await requireSelfOrDirector(userId);

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not logged in" },
        { status: 401 }
      );
    });

    it("builds the 403 response with the correct body and status", async () => {
      const { NextResponse } = jest.requireMock("next/server");
      mockAuth.mockResolvedValue(session({ id: otherUserId, role: "USER" }));

      await requireSelfOrDirector(userId);

      expect(NextResponse.json).toHaveBeenCalledTimes(1);
      expect(NextResponse.json).toHaveBeenCalledWith(
        { message: "not authorized" },
        { status: 403 }
      );
    });

    it("propagates errors thrown by auth", async () => {
      mockAuth.mockRejectedValue(new Error("auth failed"));

      await expect(requireSelfOrDirector(userId)).rejects.toThrow("auth failed");
    });
  });
});