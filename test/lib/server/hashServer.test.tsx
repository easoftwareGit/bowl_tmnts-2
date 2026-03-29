import { doCompare, doHash } from "@/lib/server/hashServer";
import { bcryptLength, maxToHashLength } from "@/lib/validation/constants";

describe("hashServer", () => {
  // Keep env stable across tests
  const originalSaltRounds = process.env.SALT_ROUNDS;
  const originalTestSaltRounds = process.env.TEST_SALT_ROUNDS;

  beforeAll(() => {
    // Ensure consistent/fast hashing in tests
    process.env.SALT_ROUNDS = "4";
    delete process.env.TEST_SALT_ROUNDS;
  });

  afterAll(() => {
    process.env.SALT_ROUNDS = originalSaltRounds;
    process.env.TEST_SALT_ROUNDS = originalTestSaltRounds;
  });

  describe("doHash()", () => {
    it("returns a bcrypt hash for a normal string", async () => {
      const hashed = await doHash("some string");

      // strong-ish assertions:
      expect(typeof hashed).toBe("string");
      expect(hashed).not.toBe("");
      expect(hashed).toHaveLength(bcryptLength);

      // typical bcrypt prefix ($2a/$2b/$2y)
      expect(hashed.startsWith("$2")).toBe(true);
    });

    it("returns different hashes for the same input (due to salt)", async () => {
      const h1 = await doHash("same input");
      const h2 = await doHash("same input");

      expect(h1).not.toBe("");
      expect(h2).not.toBe("");
      expect(h1).not.toEqual(h2);
    });

    it("returns empty string when passed an empty string", async () => {
      const hashed = await doHash("");
      expect(hashed).toBe("");
    });

    it("returns empty string when passed a string too long", async () => {
      const hashed = await doHash("a".repeat(maxToHashLength + 1));
      expect(hashed).toBe("");
    });

    it("returns empty string when passed null", async () => {
      const hashed = await doHash(null as any);
      expect(hashed).toBe("");
    });

    it("returns empty string when passed undefined", async () => {
      const hashed = await doHash(undefined as any);
      expect(hashed).toBe("");
    });
  });

  describe("doCompare()", () => {
    it("returns true when toHash and hashed match", async () => {
      const pw = "Test123!";
      const hashed = await doHash(pw);

      expect(hashed).not.toBe("");
      const match = await doCompare(pw, hashed);
      expect(match).toBe(true);
    });

    it("returns false when toHash and hashed do not match", async () => {
      const hashed = await doHash("Test123!");
      const match = await doCompare("some other password", hashed);
      expect(match).toBe(false);
    });

    it("returns false when toHash is blank", async () => {
      const hashed = await doHash("Test123!");
      const match = await doCompare("", hashed);
      expect(match).toBe(false);
    });

    it("returns false when hashed is blank", async () => {
      const match = await doCompare("Test123!", "");
      expect(match).toBe(false);
    });

    it("returns false when toHash is too long", async () => {
      const hashed = await doHash("Test123!");
      const match = await doCompare("a".repeat(maxToHashLength + 1), hashed);
      expect(match).toBe(false);
    });

    it("returns false when hashed is wrong length (too long)", async () => {
      const match = await doCompare("Test123!", "a".repeat(bcryptLength + 1));
      expect(match).toBe(false);
    });

    it("returns false when hashed is wrong length (same length but not bcrypt)", async () => {
      // your function only checks length, then bcrypt compare will throw -> catch -> false
      const match = await doCompare("Test123!", "a".repeat(bcryptLength));
      expect(match).toBe(false);
    });

    it("returns false when toHash is null", async () => {
      const hashed = await doHash("Test123!");
      const match = await doCompare(null as any, hashed);
      expect(match).toBe(false);
    });

    it("returns false when toHash is undefined", async () => {
      const hashed = await doHash("Test123!");
      const match = await doCompare(undefined as any, hashed);
      expect(match).toBe(false);
    });

    it("returns false when hashed is null", async () => {
      const match = await doCompare("Test123!", null as any);
      expect(match).toBe(false);
    });

    it("returns false when hashed is undefined", async () => {
      const match = await doCompare("Test123!", undefined as any);
      expect(match).toBe(false);
    });
  });
});