import { moneyNumber, truncateToTwoDecimals } from "@/lib/currency/convert";

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

describe("truncateToTwoDecimals", () => {
  describe("values already at two or fewer decimals", () => {
    it("returns a whole number unchanged", () => {
      expect(truncateToTwoDecimals(5)).toBe(5);
    });

    it("returns zero unchanged", () => {
      expect(truncateToTwoDecimals(0)).toBe(0);
    });

    it("returns a one-decimal value unchanged", () => {
      expect(truncateToTwoDecimals(1.5)).toBe(1.5);
    });

    it("returns a two-decimal value unchanged", () => {
      expect(truncateToTwoDecimals(1.23)).toBe(1.23);
    });

    it("returns a typical price unchanged", () => {
      expect(truncateToTwoDecimals(19.99)).toBe(19.99);
    });
  });

  describe("drops digits past two decimals (truncates, does not round up)", () => {
    it("truncates a third decimal digit", () => {
      expect(truncateToTwoDecimals(1.239)).toBe(1.23);
    });

    it("truncates 1.999 to 1.99", () => {
      expect(truncateToTwoDecimals(1.999)).toBe(1.99);
    });

    it("truncates a half-cent value down", () => {
      expect(truncateToTwoDecimals(8.675)).toBe(8.67);
    });

    it("truncates 1.005 to 1", () => {
      expect(truncateToTwoDecimals(1.005)).toBe(1);
    });

    it("truncates a sub-cent value to zero", () => {
      expect(truncateToTwoDecimals(0.009)).toBe(0);
    });

    it("truncates a large value", () => {
      expect(truncateToTwoDecimals(1234567.891)).toBe(1234567.89);
    });
  });

  describe("floating-point error correction", () => {
    it("keeps 0.29 as 0.29 (0.29 * 100 = 28.999999999999996)", () => {
      expect(truncateToTwoDecimals(0.29)).toBe(0.29);
    });

    it("keeps 0.57 as 0.57", () => {
      expect(truncateToTwoDecimals(0.57)).toBe(0.57);
    });

    it("keeps 1.15 as 1.15", () => {
      expect(truncateToTwoDecimals(1.15)).toBe(1.15);
    });

    it("keeps 4.35 as 4.35", () => {
      expect(truncateToTwoDecimals(4.35)).toBe(4.35);
    });

    it("cleans up 0.1 + 0.2 to 0.3", () => {
      expect(truncateToTwoDecimals(0.1 + 0.2)).toBe(0.3);
    });
  });

  describe("negative values", () => {
    it("returns a negative two-decimal value unchanged", () => {
      expect(truncateToTwoDecimals(-19.99)).toBe(-19.99);
    });

    it("keeps -0.29 as -0.29", () => {
      expect(truncateToTwoDecimals(-0.29)).toBe(-0.29);
    });

    it("truncates toward zero for negatives", () => {
      expect(truncateToTwoDecimals(-1.239)).toBe(-1.23);
    });

    it("truncates a small negative value to zero", () => {
      // Math.trunc(-0.1) is -0; toBeCloseTo treats -0 and 0 as equal
      expect(truncateToTwoDecimals(-0.001)).toBeCloseTo(0);
    });
  });

  describe("invalid numbers", () => {
    it("returns 0 for NaN", () => {
      expect(truncateToTwoDecimals(NaN)).toBe(0);
    });

    it("returns 0 for Infinity", () => {
      expect(truncateToTwoDecimals(Infinity)).toBe(0);
    });

    it("returns 0 for -Infinity", () => {
      expect(truncateToTwoDecimals(-Infinity)).toBe(0);
    });
  });
});
