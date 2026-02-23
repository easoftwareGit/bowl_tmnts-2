import {
  isEmail,
  isPassword8to20,
  isValidBtDbId,
  validYear,
  validTime,
  isValidBtDbType,
  isOdd,
  isEven,
  isNumber,  
  validSortOrder,
  maxSortOrder,
  validPositiveInt,
  isValidRole,
  isValidName,
  isValidTimeStamp,
  validInteger,
  toValidDateOrNull,
  safeNumericEqual,
  exportedForTesting,
  isFullStageType
} from "@/lib/validation/validation";
import { initDiv, initEvent } from "@/lib/db/initVals";
import type { fullStageType } from "@/lib/types/types";
import { SquadStage } from "@prisma/client";

const { isValidDateObject } = exportedForTesting;

describe("tests for validation functions", () => {

  describe("isEmail function", () => {
    it("should return true for a valid email", () => {
      expect(isEmail("test@example.com")).toBe(true);
    });

    it('should return false for an invalid email without "@" symbol', () => {
      expect(isEmail("testexample.com")).toBe(false);
    });

    it("should return false for an invalid email without domain", () => {
      expect(isEmail("test@example")).toBe(false);
    });

    it("should return false for an invalid email with special characters", () => {
      expect(isEmail("test.@example.com")).toBe(false);
    });

    it("should return false for an invalid blank email", () => {
      expect(isEmail("")).toBe(false);
    });

    it('should return false for an email without "@" symbol', () => {
      expect(isEmail("testexample.com")).toBe(false);
    });
    it('should return false for an email with multiple "@" symbols', () => {
      expect(isEmail("test@exam@ple.com")).toBe(false);
    });
    it("should return false for an email with consecutive dots", () => {
      expect(isEmail("test@example..com")).toBe(false);
    });
    it("should return true for a valid email with numbers in local part", () => {
      expect(isEmail("test123@example.com")).toBe(true);
    });
    it("should return true for a valid email with hyphen in domain", () => {
      expect(isEmail("test@example-test.com")).toBe(true);
    });
    it("should return false for invalid chars in email", () => {
      expect(isEmail("test@exa!mple.com")).toBe(false);
      expect(isEmail("test@exa<>mple.com")).toBe(false);
      expect(isEmail("test@exa|mple.com")).toBe(false);
      expect(isEmail("test@exa^mple.com")).toBe(false);
    });
  });

  describe("isPassword8To20 function", () => {
    it("should return true for a valid password", () => {
      expect(isPassword8to20("Test123!")).toBe(true);
    });
    it("should return false for an invalid password (no upper case)", () => {
      expect(isPassword8to20("test123!")).toBe(false);
    });
    it("should return false for an invalid password (no lower case)", () => {
      expect(isPassword8to20("TEST123!")).toBe(false);
    });
    it("should return false for an invalid password (no digits)", () => {
      expect(isPassword8to20("TESTtest!")).toBe(false);
    });
    it("should return false for an invalid password (no special char)", () => {
      expect(isPassword8to20("TEST1234")).toBe(false);
    });
    it("should return false for an invalid password (less than 8 chars long)", () => {
      expect(isPassword8to20("Test12!")).toBe(false);
    });
    it("should return false for an invalid password (more than 20 chars long)", () => {
      expect(isPassword8to20("Test12345!Test12345!1")).toBe(false);
    });
  });

  describe("isValidBtDbType function", () => {
    it("should return true for valid BtDb type", () => {
      expect(isValidBtDbType("bwl")).toBe(true);
    });
    it("should return true for valid BtDb type", () => {
      expect(isValidBtDbType("tmt")).toBe(true);
    });
    it("should return false for invalid BtDb type", () => {
      expect(isValidBtDbType("bad")).toBe(false);
    });
    it("should return true for blank BtDb type", () => {
      expect(isValidBtDbType("")).toBe(false);
    });
    it("should return true for too long valid BtDb type", () => {
      expect(isValidBtDbType("tmtbwl")).toBe(false);
    });
  });

  describe("isValidBtDbId function", () => {
    it("valid BtDb id should return true for user (usr) id", () => {
      expect(isValidBtDbId("usr_5bcefb5d314fff1ff5da6521a2fa7bde", "usr")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for bowl (bwl) id", () => {
      expect(isValidBtDbId("bwl_561540bd64974da9abdd97765fdb3659", "bwl")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for tournament (tmt) id", () => {
      expect(isValidBtDbId("tmt_fd99387c33d9c78aba290286576ddce5", "tmt")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for event (tvt) id", () => {
      expect(isValidBtDbId("evt_cb97b73cb538418ab993fc867f860510", "evt")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for division (div) id", () => {
      expect(isValidBtDbId("div_f30aea2c534f4cfe87f4315531cef8ef", "div")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for squad (sqd) id", () => {
      expect(isValidBtDbId("sqd_7116ce5f80164830830a7157eb093396", "sqd")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for pot (pot) id", () => {
      expect(isValidBtDbId("pot_b2a7b02d761b4f5ab5438be84f642c3b", "pot")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for bracket (brk) id", () => {
      expect(isValidBtDbId("brk_5109b54c2cc44ff9a3721de42c80c8c1", "brk")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for eliminator (elm) id", () => {
      expect(isValidBtDbId("elm_45d884582e7042bb95b4818ccdd9974c", "elm")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for player (ply) id", () => {
      expect(isValidBtDbId("ply_7116ce5f80164830830a7157eb093399", "ply")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for game (gam) id", () => {
      expect(isValidBtDbId("gam_7116ce5f80164830830a7157eb093399", "gam")).toBe(
        true
      );
    });
    
    it("valid BtDb id should return true for divison entry (den) id", () => {
      expect(isValidBtDbId("den_7116ce5f80164830830a7157eb093399", "den")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for pot entry (pen) id", () => {
      expect(isValidBtDbId("pen_7116ce5f80164830830a7157eb093399", "pen")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for bracket entry (ben) id", () => {
      expect(isValidBtDbId("ben_7116ce5f80164830830a7157eb093399", "ben")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for eliminator entry (een) id", () => {
      expect(isValidBtDbId("een_7116ce5f80164830830a7157eb093399", "een")).toBe(
        true
      );
    });

    it("valid BtDb id should return true for one individual bracket (obk) id", () => {
      expect(isValidBtDbId("obk_7116ce5f80164830830a7157eb093399", "obk")).toBe(
        true
      );
    });
    
    it("valid BtDb id should return true for bracket seed (bsd) id", () => {
      expect(isValidBtDbId("bsd_7116ce5f80164830830a7157eb093399", "bsd")).toBe(
        true
      );
    });

    it("invalid BtDb id with invalid uuid too short should return false", () => {
      expect(isValidBtDbId("inv_id", "usr")).toBe(false);
    });
    it("invalid BtDb id with invalid uuid too long should return false", () => {
      expect(
        isValidBtDbId("elm_45d884582e7042bb95b4818ccdd9974cabc", "elm")
      ).toBe(false);
    });
    it("invalid BtDb id with invalid uuid portion should return false", () => {
      expect(isValidBtDbId("elm_45d884582e7042bb95b4818ccdd99xyz", "elm")).toBe(
        false
      );
    });
    it("invalid BtDb id with invalid indicator (first 3 chars) should return false", () => {
      expect(isValidBtDbId("xyz_45d884582e7042bb95b4818ccdd9974c", "elm")).toBe(
        false
      );
    });
    it("blank BtDb id should return false", () => {
      expect(isValidBtDbId("", "usr")).toBe(false);
    });
    it("blank id type should return false", () => {
      expect(
        isValidBtDbId("ply_7116ce5f80164830830a7157eb093399", "" as any)
      ).toBe(false);
    });
    it("valid id start and id type do not match should return false", () => {
      expect(
        isValidBtDbId("ply_7116ce5f80164830830a7157eb093399", "usr" as any)
      ).toBe(false);
    });
  });

  describe('isValidRole function', () => { 
    it('should return true when the input string is a valid role', () => {
      const result = isValidRole('ADMIN');
      expect(result).toBe(true);
    });    
    it('should return false when the input string is empty', () => {      
      const result = isValidRole('');
      expect(result).toBe(false);
    });
    it('should return false when the input string is an invalid role', () => {
        const result = isValidRole('invalid');
        expect(result).toBe(false);
    });
    it('should return false when the input string is null', () => {
      const result = isValidRole(null as any);
      expect(result).toBe(false);
    });
    // input string is in a different case (e.g., uppercase vs lowercase)
    it('should return false when the input string is a valid role in different case', () => {      
      const result = isValidRole('Admin');
      expect(result).toBe(false);
    });
    // input string has leading or trailing spaces
    it('should return true when the input string has leading spaces', () => {
      const result = isValidRole('  ADMIN');
      expect(result).toBe(false);
    });
  })

  describe("validYear", () => {
    it("valid year should return true", () => {
      expect(validYear("2017")).toBe(true);
    });
    it("valid year (1900) should return true", () => {
      expect(validYear("1900")).toBe(true);
    });
    it("valid year (2200) should return true", () => {
      expect(validYear("2200")).toBe(true);
    });
    it("invalid year (yyyy-yyyy)should return false", () => {
      expect(validYear("2017-2018")).toBe(false);
    });
    it("invalid year (yy) should return false", () => {
      expect(validYear("17")).toBe(false);
    });
    it("invalid year (yyyyy) should return false", () => {
      expect(validYear("12345")).toBe(false);
    });
    it("invalid year (1899) should return false", () => {
      expect(validYear("1899")).toBe(false);
    });
    it("invalid year (2200) should return false", () => {
      expect(validYear("2201")).toBe(false);
    });
    it("invalid year (abc) should return false", () => {
      expect(validYear("abc")).toBe(false);
    });
    it('invalid year "" should return false', () => {
      expect(validYear("")).toBe(false);
    });
  });

  describe("isValidDateObject", () => {
    it("returns true for a valid Date object", () => {
      const d = new Date("2025-01-01T00:00:00.000Z");
      expect(isValidDateObject(d)).toBe(true);
    });

    it("returns false for an invalid Date object", () => {
      const d = new Date("not-a-date");
      expect(isValidDateObject(d)).toBe(false);
    });

    it("returns false for non-Date values", () => {
      expect(isValidDateObject("2025-01-01")).toBe(false);
      expect(isValidDateObject(123)).toBe(false);
      expect(isValidDateObject(null)).toBe(false);
      expect(isValidDateObject(undefined)).toBe(false);
      expect(isValidDateObject({})).toBe(false);
    });
  });

  describe("toValidDateOrNull", () => {
    it("returns null for null", () => {
      expect(toValidDateOrNull(null)).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(toValidDateOrNull(undefined)).toBeNull();
    });

    it("returns the same Date instance if it is already a valid Date", () => {
      const d = new Date("2024-06-01T12:34:56.000Z");
      const result = toValidDateOrNull(d);

      expect(result).toBe(d); // same reference
      expect(result?.toISOString()).toBe("2024-06-01T12:34:56.000Z");
    });

    it("returns null for an invalid Date object", () => {
      const d = new Date("bad-date");
      expect(toValidDateOrNull(d)).toBeNull();
    });

    it("converts a number (epoch ms) to a Date", () => {
      const ms = 1700000000000;
      const result = toValidDateOrNull(ms);

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(ms);
    });

    it("returns null for an invalid number (NaN)", () => {
      // NaN is a number, new Date(NaN) => invalid Date
      expect(toValidDateOrNull(Number.NaN)).toBeNull();
    });

    it("converts an ISO string to a Date", () => {
      const iso = "2023-12-31T23:59:59.000Z";
      const result = toValidDateOrNull(iso);

      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(iso);
    });

    it("trims whitespace and converts an ISO string with padding", () => {
      const iso = "2023-12-31T23:59:59.000Z";
      const result = toValidDateOrNull(`  ${iso}   `);

      expect(result).toBeInstanceOf(Date);
      expect(result?.toISOString()).toBe(iso);
    });

    it("returns null for an empty/whitespace-only string", () => {
      expect(toValidDateOrNull("")).toBeNull();
      expect(toValidDateOrNull("   ")).toBeNull();
      expect(toValidDateOrNull("\n\t")).toBeNull();
    });

    it("converts a numeric string (epoch ms) to a Date", () => {
      const ms = 1700000000000;
      const result = toValidDateOrNull(String(ms));

      expect(result).toBeInstanceOf(Date);
      expect(result?.getTime()).toBe(ms);
    });

    it("returns null for a numeric string that becomes an invalid Date", () => {
      // Huge number can overflow to invalid date in JS
      const tooBig = "999999999999999999999999999999";
      expect(toValidDateOrNull(tooBig)).toBeNull();
    });

    it("returns null for a non-date string", () => {
      expect(toValidDateOrNull("not-a-date")).toBeNull();
    });

    it("returns null for a string that Date can't parse", () => {
      expect(toValidDateOrNull("2023-99-99")).toBeNull();
    });

    it("treats numeric-string-with-non-digits as a normal string parse (and likely null)", () => {
      // because it fails /^\d+$/ and then tries new Date(value)
      expect(toValidDateOrNull("1700000000000abc")).toBeNull();
    });
  });

  describe("validTime function", () => {
    it("should return true for valid 12-hour time in HH:MM AM/PM format", () => {
      expect(validTime("11:30 AM")).toBe(true);
      expect(validTime("02:00 PM")).toBe(true);
      expect(validTime("12:00 PM")).toBe(true);
      expect(validTime("12:00 AM")).toBe(true);
    });
    it("should return true for valid 24-hour time in HH:MM format", () => {
      expect(validTime("13:45")).toBe(true);
      expect(validTime("08:15")).toBe(true);
      expect(validTime("00:00")).toBe(true);
      expect(validTime("23:59")).toBe(true);
    });
    it("should return true for midnight", () => {
      expect(validTime("00:00")).toBe(true);
      expect(validTime("24:00")).toBe(false);
      expect(validTime("12:00 AM")).toBe(true);
    });
    it("should return false for invalid time format (24:00)", () => {
      expect(validTime("24:00")).toBe(false);
    });
    it("should return false for invalid time format (13:30 AM/PM)", () => {
      expect(validTime("13:30 AM")).toBe(false);
      expect(validTime("13:30 PM")).toBe(false);
    });
    it("should return true for lowercase time format (10:30 am/pm)", () => {
      expect(validTime("10:30 am")).toBe(true);
      expect(validTime("10:30 pm")).toBe(true);
    });
    it("should return false for invalid time format (08:60 AM)", () => {
      expect(validTime("08:60 AM")).toBe(false);
    });
    it("should return false for invalid time format (15:60)", () => {
      expect(validTime("15:60")).toBe(false);
    });
    it("should return false for invalid time format (1234)", () => {
      expect(validTime("1234")).toBe(false);
    });
    it("should return false for invalid time format (abc)", () => {
      expect(validTime("abc")).toBe(false);
    });
    it("should return false for time with incorrect length", () => {
      expect(validTime("10:30:00")).toBe(false);
    });
    it("should return false for time with special characters", () => {
      expect(validTime("12:30@")).toBe(false);
    });
    it("should return false for valid time with additional text", () => {
      expect(validTime("10:30 PM extra text")).toBe(false);
    });
    it("should return false for empty input", () => {
      expect(validTime("")).toBe(false);
    });
    it("should return false for null input", () => {
      expect(validTime(null as any)).toBe(false);
    });
    it("should return false for undefinded input", () => {
      expect(validTime(undefined as any)).toBe(false);
    });
  });

  describe("safeNumericEqual", () => {

    describe("returns true when values are numerically equal", () => {
      it("returns true for equal integers", () => {
        expect(safeNumericEqual(100, 100)).toBe(true);
      });
      it("returns true for equal numeric strings", () => {
        expect(safeNumericEqual("100", "100")).toBe(true);
      });
      it("returns true for numeric string and number", () => {
        expect(safeNumericEqual("100", 100)).toBe(true);
        expect(safeNumericEqual(100, "100")).toBe(true);
      });
      it("returns true for decimal string and integer string (required test)", () => {
        expect(safeNumericEqual("100", "100.00")).toBe(true);
      });
      it("returns true for decimals that are numerically equal", () => {
        expect(safeNumericEqual("10.5", 10.5)).toBe(true);
      });
      it("returns true for zero values", () => {
        expect(safeNumericEqual(0, "0")).toBe(true);
        expect(safeNumericEqual("0.00", 0)).toBe(true);
      });
      it("returns true for negative values", () => {
        expect(safeNumericEqual("-25", -25)).toBe(true);
      });
      it("returns true when both values are null (Number(null) === 0)", () => {
        expect(safeNumericEqual(null, null)).toBe(true);
      });
    });

    describe("returns false when numeric values differ", () => {
      it("returns false for different integers", () => {
        expect(safeNumericEqual(100, 101)).toBe(false);
      });
      it("returns false for different numeric strings", () => {
        expect(safeNumericEqual("100", "101")).toBe(false);
      });
      it("returns false for decimal differences", () => {
        expect(safeNumericEqual("100.01", "100.02")).toBe(false);
      });
      it("returns false for negative vs positive", () => {
        expect(safeNumericEqual("-100", "100")).toBe(false);
      });
    });

    describe("returns false when either value is not finite numeric", () => {
      it("returns false for non-numeric string", () => {
        expect(safeNumericEqual("abc", 100)).toBe(false);
      });
      it("returns false for empty string vs number", () => {
        // Number("") === 0, so this is actually equal
        expect(safeNumericEqual("", 0)).toBe(true);
      });
      it("returns false when one value is NaN", () => {
        expect(safeNumericEqual(NaN, 100)).toBe(false);
        expect(safeNumericEqual(100, NaN)).toBe(false);
      });
      it("returns false when both values are NaN", () => {
        expect(safeNumericEqual(NaN, NaN)).toBe(false);
      });
      it("returns false when value is Infinity", () => {
        expect(safeNumericEqual(Infinity, 100)).toBe(false);
        expect(safeNumericEqual(100, Infinity)).toBe(false);
      });
      it("returns false when value is undefined", () => {
        expect(safeNumericEqual(undefined, 100)).toBe(false);
        expect(safeNumericEqual(100, undefined)).toBe(false);
      });
      it("returns false for object values", () => {
        expect(safeNumericEqual({}, 100)).toBe(false);
      });
      it("returns false for array values", () => {
        expect(safeNumericEqual([], 100)).toBe(false);
      });
    });
  });

  describe("validPositiveInt", () => {    
    it("should return true when given a valid positive integer string", () => {
      const result = validPositiveInt("123");
      expect(result).toBe(true);
    });
    it("should return true when given a very large positive integer string", () => {
      const result = validPositiveInt("12345678901234567890");
      expect(result).toBe(true);
    });
    it("should return false when given an empty string", () => {
      const result = validPositiveInt("");
      expect(result).toBe(false);
    });
    it("should return false when given a string with leading zeros", () => {
      const result = validPositiveInt("00123");
      expect(result).toBe(false);
    });
    it("should return false when given a string with non-numeric characters", () => {
      const result = validPositiveInt("abc");
      expect(result).toBe(false);
    });
    it("should return false when given a negative number string", () => {
      const result = validPositiveInt("-123");
      expect(result).toBe(false);
    });
    it("should return false when given a string with only whitespace characters", () => {
      const result = validPositiveInt("   ");
      expect(result).toBe(false);
    });
    it("should return false when given a string with special characters", () => {
      const result = validPositiveInt("123$");
      expect(result).toBe(false);
    });
    it("should return false when given a string with a decimal point", () => {
      const result = validPositiveInt("12.3");
      expect(result).toBe(false);
    });
    it("should return false when input is null", () => {
      const result = validPositiveInt(null as any);
      expect(result).toBe(false);
    });
    it("should return false when input is undefined", () => {
      const result = validPositiveInt(undefined as any);
      expect(result).toBe(false);
    });    
    it("should return false when given a string with mixed numeric and alphabetic characters", () => {
      const result = validPositiveInt("1a2b3");
      expect(result).toBe(false);
    });
    it("should return false when given a positive integer string followed by alphabetic characters", () => {
      const result = validPositiveInt("123abc");
      expect(result).toBe(false);
    });
    it("should return false when given a string with alphabetic characters followed by numeric characters", () => {
      const result = validPositiveInt("a123");
      expect(result).toBe(false);
    });
  });

  describe("isOdd and IsEven functions", () => {
    it("isOdd should return true for odd number", () => {
      expect(isOdd(5)).toBe(true);
    });
    it("isOdd should return false for even number", () => {
      expect(isOdd(4)).toBe(false);
    });
    it("isOdd should return false for 0", () => {
      expect(isOdd(0)).toBe(false);
    });
    it("isEven should return true for even number", () => {
      expect(isEven(4)).toBe(true);
    });
    it("isEven should return false for odd number", () => {
      expect(isEven(5)).toBe(false);
    });
    it('isEven should return true for 0', () => {
      expect(isEven(0)).toBe(true);
    });
  });

  describe("isNumber", () => {    
    it("should return true when the value is an integer", () => {
      const result = isNumber(42);
      expect(result).toBe(true);
    });
    it("should return true for 0", () => {
      const result = isNumber(0);
      expect(result).toBe(true);
    });
    it("should return false when the value is Infinity", () => {
      const result = isNumber(Infinity);
      expect(result).toBe(false);
    });
    it("should return false for -Infinity", () => {
      const result = isNumber(-Infinity);
      expect(result).toBe(false);
    });
    it("should return false when the value is a string", () => {
      const result = isNumber("42");
      expect(result).toBe(false);
    });
    it("should return true for floating-point values", () => {
      const result = isNumber(3.14);
      expect(result).toBe(true);
    });
    it("should return false for boolean values", () => {
      const result = isNumber(true);
      expect(result).toBe(false);
    });
    it("should return false for null values", () => {
      const result = isNumber(null);
      expect(result).toBe(false);
    });
    it("should return false for undefined values", () => {
      const result = isNumber(undefined);
      expect(result).toBe(false);
    });
    it("should return false for NaN", () => {
      const result = isNumber(NaN);
      expect(result).toBe(false);
    });
  });

  describe('validInteger', () => {

    it('should return true for valid integers within safe range', () => {
      const testValues = [0, 1, -1, 42, Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
  
      testValues.forEach(value => {
        expect(validInteger(value)).toBe(true);
      });
    });
    it('should return false for decimal numbers', () => {
      const testValues = [1.5, -3.14, 0.1, 42.42];
  
      testValues.forEach(value => {
        expect(validInteger(value)).toBe(false);
      });
    });
    it('should return true when input is zero', () => {
      expect(validInteger(0)).toBe(true);
    });
    it('should return true for positive integers within safe range', () => {
      const testValues = [1, 10, 100, 1000, Number.MAX_SAFE_INTEGER - 1];

      testValues.forEach(value => {
        expect(validInteger(value)).toBe(true);
      });
    });
    it('should return true for negative integers within safe range', () => {
      const testValues = [-1, -42, -100, Number.MIN_SAFE_INTEGER + 1];

      testValues.forEach(value => {
        expect(validInteger(value)).toBe(true);
      });
    });
    it('should return true for Number.MIN_SAFE_INTEGER', () => {
      expect(validInteger(Number.MIN_SAFE_INTEGER)).toBe(true);
    });
    it('should return true when value is Number.MAX_SAFE_INTEGER', () => {
      expect(validInteger(Number.MAX_SAFE_INTEGER)).toBe(true);
    });
    it('should return false when value is NaN', () => {
      expect(validInteger(NaN)).toBe(false);
    });
    it('should return false for Infinity and -Infinity', () => {
      const testValues = [Infinity, -Infinity];

      testValues.forEach(value => {
        expect(validInteger(value)).toBe(false);
      });
    });
    it('should return false for values below Number.MIN_SAFE_INTEGER', () => {
      const testValues = [Number.MIN_SAFE_INTEGER - 1, Number.MIN_SAFE_INTEGER - 100, -1e20];

      testValues.forEach(value => {
        expect(validInteger(value)).toBe(false);
      });
    });
    it('should return false for values exceeding Number.MAX_SAFE_INTEGER', () => {
      const testValues = [Number.MAX_SAFE_INTEGER + 1, Number.MAX_SAFE_INTEGER + 1000];

      testValues.forEach(value => {
        expect(validInteger(value)).toBe(false);
      });
    });
    it('should return false when value is less than Number.MIN_SAFE_INTEGER', () => {
      const value = Number.MIN_SAFE_INTEGER - 1;
      expect(validInteger(value)).toBe(false);
    });
    it('should return false when value is greater than Number.MAX_SAFE_INTEGER', () => {
      const value = Number.MAX_SAFE_INTEGER + 1;
      expect(validInteger(value)).toBe(false);
    });
    it('should return true for Number.MAX_SAFE_INTEGER minus 100', () => {
      const value = Number.MAX_SAFE_INTEGER - 100;
      expect(validInteger(value)).toBe(true);
    });
    it('should return true for Number.MIN_SAFE_INTEGER plus 100', () => {
      const value = Number.MIN_SAFE_INTEGER + 100;
      expect(validInteger(value)).toBe(true);
    });
  });

  describe("validSortOrder function", () => {
    it("should return true for valid sort order", () => {
      expect(validSortOrder(initEvent.sort_order)).toBe(true);
      expect(validSortOrder(initDiv.sort_order)).toBe(true);
    });
    it("should return false for sort order too low", () => {
      expect(validSortOrder(-1)).toBe(false);
    });
    it("should return false for sort order too high", () => {
      expect(validSortOrder(maxSortOrder + 1)).toBe(false);
    });
    it("should return false for non number sort order", () => {
      expect(validSortOrder("abc" as any)).toBe(false);
    });
    it("should return false for non integer sort order", () => {
      expect(validSortOrder(2.5)).toBe(false);
    });
    it("should return false for null sort order", () => {
      expect(validSortOrder(null as any)).toBe(false);
    });
    it("should return false for undefined sort order", () => {
      expect(validSortOrder(undefined as any)).toBe(false);
    });
  });

  describe('IsValidName function', () => { 
    const maxLength = 15;
    it('should return true when name is within max length', () => {
      const name = "John";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return true when name is exactly at max length', () => {
      const name = "A".repeat(15);      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return false when name is empty', () => {
      const name = "";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(false);
    });
    it('should sanitize name before checking length', () => {
      const name = "  John  ";      
      const sanitized = "John";
      jest.mock('@/lib/validation/sanitize', () => ({
        sanitize: jest.fn(() => sanitized)
      }));
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return false when name exceeds max length by one character', () => {
      const name = "A".repeat(16); // 16 characters, exceeding maxFirstNameLength by 1      
      const result = isValidName(name, maxLength);
      expect(result).toBe(false);
    });
    it('should return false when name contains only whitespace characters', () => {
      const name = "   ";
      const result = isValidName(name, maxLength);
      expect(result).toBe(false);
    });
    it('should return true for name with special characters within max length', () => {
      const name = "J@hn-Doe!";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return true for a valid mixed case name within max length', () => {
      const name = "JoHnDoE";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return true when name contains numeric characters and is within max length', () => {
      const name = "John123";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return true when name with spaces is within max length', () => {
      const name = "  John  ";      
      const result = isValidName(name, maxLength);
      expect(result).toBe(true);
    });
    it('should return false when name is null or undefined', () => {      
      const resultNull = isValidName(null as any, maxLength);
      const resultUndefined = isValidName(undefined as any, maxLength);
      expect(resultNull).toBe(false);
      expect(resultUndefined).toBe(false);
    });
  })

  describe('isValidTimeStamp', () => {

    it('should return true for valid timestamp within range', () => {
      const currentTimestamp = Date.now();
      const result = isValidTimeStamp(currentTimestamp);
      expect(result).toBe(true);
    });
    it('should return true for positive timestamp less than max allowed value', () => {
      const testTimestamp = 1e12; // A positive timestamp within the valid range
      const result = isValidTimeStamp(testTimestamp);
      expect(result).toBe(true);
    });
    it('should return true for a valid negative timestamp', () => {
      const negativeTimestamp = -1;
      const result = isValidTimeStamp(negativeTimestamp);
      expect(result).toBe(true);
    });
    it('should return true for valid floating point timestamp within range', () => {
      const floatingPointTimestamp = 1.23e12;
      const result = isValidTimeStamp(floatingPointTimestamp);
      expect(result).toBe(true);
    });
    it('should return false for timestamp less than -8.64e15', () => {
      const largeTimestamp = -8.64e15 - 1;
      const result = isValidTimeStamp(largeTimestamp);
      expect(result).toBe(false);
    });
    it('should return false for timestamp greater than 8.64e15', () => {
      const largeTimestamp = 8.64e15 + 1;
      const result = isValidTimeStamp(largeTimestamp);
      expect(result).toBe(false);
    });
    it('should return true when timestamp is 0', () => {
      const result = isValidTimeStamp(0);
      expect(result).toBe(true);
    });
    it('should return false for valid non-integer decimal timestamp', () => {
      const decimalTimestamp = 1234567890.123;
      const result = isValidTimeStamp(decimalTimestamp);
      expect(result).toBe(false);
    });
    it('should return false for timestamp is null', () => {      
      const result = isValidTimeStamp(null as any);
      expect(result).toBe(false);
    });
    it('should return false for timestamp is undefined', () => {      
      const result = isValidTimeStamp(undefined as any);
      expect(result).toBe(false);
    });
    it('should return false for timestamp is text', () => {      
      const result = isValidTimeStamp('abc' as any);
      expect(result).toBe(false);
    });
  });

  describe("isFullStageType()", () => {

    const validFullStage: fullStageType = {
      id: "fs_123",
      squad_id: "sqd_456",
      stage: SquadStage.DEFINE,
      stage_set_at: new Date().toISOString(),
      scores_started_at: null,
      stage_override_enabled: false,
      stage_override_at: null,
      stage_override_reason: ""
    };

    it("returns true for a valid fullStageType object", () => {
      expect(isFullStageType(validFullStage)).toBe(true);
    });

    it("allows ISO date strings for date values", () => {
      const obj = {
        ...validFullStage,
        stage_set_at: new Date().toISOString(),
        stage_override_at: new Date().toISOString()
      };
      expect(isFullStageType(obj)).toBe(true);
    });

    it("rejects null or undefined input", () => {
      expect(isFullStageType(null)).toBe(false);
      expect(isFullStageType(undefined)).toBe(false);
    });

    it("rejects when stage is not a valid SquadStage enum", () => {
      const obj = {
        ...validFullStage,
        stage: "INVALID_STAGE"
      };
      expect(isFullStageType(obj)).toBe(false);
    });

    it("rejects if stage_set_at is null (not allowed)", () => {
      const obj = {
        ...validFullStage,
        stage_set_at: null
      };
      expect(isFullStageType(obj)).toBe(false);
    });

    it("rejects if stage_set_at is not a date or date-string", () => {
      const obj = {
        ...validFullStage,
        stage_set_at: "not-a-date"
      };
      expect(isFullStageType(obj)).toBe(false);
    });

    it("allows nullable scores_started_at and stage_override_at", () => {
      const obj = {
        ...validFullStage,
        scores_started_at: null,
        stage_override_at: null
      };
      expect(isFullStageType(obj)).toBe(true);
    });

    it("rejects if stage_override_enabled is not boolean", () => {
      const obj = {
        ...validFullStage,
        stage_override_enabled: "true"
      };
      expect(isFullStageType(obj)).toBe(false);
    });

    it("rejects if id or squad_id are not strings", () => {
      const obj1 = { ...validFullStage, id: 123 };
      const obj2 = { ...validFullStage, squad_id: 123 };
      expect(isFullStageType(obj1 as any)).toBe(false);
      expect(isFullStageType(obj2 as any)).toBe(false);
    });

    it("accepts stage_override_reason as null or string", () => {
      const obj = { ...validFullStage, stage_override_reason: null };
      expect(isFullStageType(obj as any)).toBe(true);
    });

    it("rejects invalid stage_override_reason type", () => {
      const obj = { ...validFullStage, stage_override_reason: 123 };
      expect(isFullStageType(obj as any)).toBe(false);
    });

    it("ignores extra properties", () => {
      const obj = {
        ...validFullStage,
        extra_field: "foo"
      };
      expect(isFullStageType(obj as any)).toBe(true);
    });

  });

});
