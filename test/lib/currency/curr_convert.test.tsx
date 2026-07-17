// test/lib/currency/curr_convert.test.tsx

import { moneyNumber } from "@/lib/currency/convert";

describe("moneyNumber", () => {
  describe("valid money strings", () => {
    it("converts a whole number string", () => {
      expect(moneyNumber("123")).toBe(123);
    });

    it("converts a decimal string", () => {
      expect(moneyNumber("123.45")).toBe(123.45);
    });

    it("converts a string with commas", () => {
      expect(moneyNumber("1,234")).toBe(1234);
    });

    it("converts a large string with commas", () => {
      expect(moneyNumber("1,234,567.89")).toBe(1234567.89);
    });

    it("converts a currency string", () => {
      expect(moneyNumber("$123.45")).toBe(123.45);
    });

    it("converts a currency string with commas", () => {
      expect(moneyNumber("$1,234.56")).toBe(1234.56);
    });

    it("converts a negative number string", () => {
      expect(moneyNumber("-123.45")).toBe(-123.45);
    });

    it("converts a negative currency string", () => {
      expect(moneyNumber("-$1,234.56")).toBe(-1234.56);
    });

    it("converts zero", () => {
      expect(moneyNumber("0")).toBe(0);
    });

    it("converts zero dollars", () => {
      expect(moneyNumber("$0.00")).toBe(0);
    });
  });

  describe("valid number inputs", () => {
    it("returns the same integer", () => {
      expect(moneyNumber(123)).toBe(123);
    });

    it("returns the same decimal", () => {
      expect(moneyNumber(123.45)).toBe(123.45);
    });

    it("returns the same negative number", () => {
      expect(moneyNumber(-123.45)).toBe(-123.45);
    });

    it("returns zero", () => {
      expect(moneyNumber(0)).toBe(0);
    });
  });

  describe("invalid strings", () => {
    it("returns null for an empty string", () => {
      expect(moneyNumber("")).toBeNull();
    });

    it("returns null for whitespace", () => {
      expect(moneyNumber("   ")).toBeNull();
    });

    it("returns null for alphabetic text", () => {
      expect(moneyNumber("abc")).toBeNull();
    });

    it("returns null for mixed text", () => {
      expect(moneyNumber("123abc")).toBeNull();
    });

    it("returns null for incorrectly placed commas", () => {
      expect(moneyNumber("12,34")).toBeNull();
    });

    it("returns null for multiple consecutive commas", () => {
      expect(moneyNumber("1,,234")).toBeNull();
    });

    it("returns null for a trailing comma", () => {
      expect(moneyNumber("1,234,")).toBeNull();
    });

    it("returns null for a leading comma", () => {
      expect(moneyNumber(",123")).toBeNull();
    });

    it("returns null when the dollar sign is after the digits", () => {
      expect(moneyNumber("123$")).toBeNull();
    });

    it("returns null when the dollar sign is in the middle", () => {
      expect(moneyNumber("1$23")).toBeNull();
    });

    it("returns null for multiple dollar signs", () => {
      expect(moneyNumber("$$123")).toBeNull();
    });

    it("returns null for a misplaced negative sign", () => {
      expect(moneyNumber("$-123")).toBeNull();
    });

    it("returns null for multiple decimal points", () => {
      expect(moneyNumber("123.45.67")).toBeNull();
    });
  });

  describe("invalid non-string inputs", () => {
    it("returns null for null", () => {
      expect(moneyNumber(null)).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(moneyNumber(undefined)).toBeNull();
    });

    it("returns null for NaN", () => {
      expect(moneyNumber(NaN)).toBeNull();
    });

    it("returns null for Infinity", () => {
      expect(moneyNumber(Infinity)).toBeNull();
    });

    it("returns null for -Infinity", () => {
      expect(moneyNumber(-Infinity)).toBeNull();
    });

    it("returns null for a boolean", () => {
      expect(moneyNumber(true)).toBeNull();
    });

    it("returns null for an object", () => {
      expect(moneyNumber({})).toBeNull();
    });

    it("returns null for an array", () => {
      expect(moneyNumber([])).toBeNull();
    });
  });
});