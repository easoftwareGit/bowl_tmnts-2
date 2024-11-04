import { postSecret } from "@/lib/tools";
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
} from "@/lib/validation";
import { initDiv, initEvent } from "@/lib/db/initVals";

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

    it("valid BtDb id should return true for handicap (hdc) id", () => {
      expect(isValidBtDbId("hdc_67c7a51bbd2d441da9bb20a3001795a9", "hdc")).toBe(
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
    it("should return true for odd number", () => {
      expect(isOdd(5)).toBe(true);
    });
    it("should return false for even number", () => {
      expect(isOdd(4)).toBe(false);
    });
    it("should return true for even number", () => {
      expect(isEven(4)).toBe(true);
    });
    it("should return false for odd number", () => {
      expect(isEven(5)).toBe(false);
    });
  });

  describe("isNumber", () => {
    // returns true for integer values
    it("should return true when the value is an integer", () => {
      const result = isNumber(42);
      expect(result).toBe(true);
    });

    // return true for 0
    it("should return true for 0", () => {
      const result = isNumber(0);
      expect(result).toBe(true);
    });

    // returns false for Infinity
    it("should return false when the value is Infinity", () => {
      const result = isNumber(Infinity);
      expect(result).toBe(false);
    });

    // returns false for -Infinity
    it("should return false for -Infinity", () => {
      const result = isNumber(-Infinity);
      expect(result).toBe(false);
    });

    // returns false for string values
    it("should return false when the value is a string", () => {
      const result = isNumber("42");
      expect(result).toBe(false);
    });

    // returns true for floating-point values
    it("should return true for floating-point values", () => {
      const result = isNumber(3.14);
      expect(result).toBe(true);
    });

    // returns false for boolean values
    it("should return false for boolean values", () => {
      const result = isNumber(true);
      expect(result).toBe(false);
    });

    // returns false for null values
    it("should return false for null values", () => {
      const result = isNumber(null);
      expect(result).toBe(false);
    });

    // returns false for undefined values
    it("should return false for undefined values", () => {
      const result = isNumber(undefined);
      expect(result).toBe(false);
    });

    // returns false for NaN
    it("should return false for NaN", () => {
      const result = isNumber(NaN);
      expect(result).toBe(false);
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
});
