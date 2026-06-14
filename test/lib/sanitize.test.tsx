import {
  isAllZeros,  
  sanitizeBtDbId,
  sanitizeCity,
  sanitizeCurrency,
  sanitizedMoneyString,
  sanitizeMoneyAmount,
  sanitizeEDS,
  sanitizeName,
  sanitizeNotes,
  sanitizeTournamentName,
  sanitizeUrl,
} from "@/lib/validation/sanitize";

describe("sanitize inputs", () => {

  describe("sanitizeBtDbId", () => {
    it("returns empty string for non-string inputs", () => {
      expect(sanitizeBtDbId(null)).toBe("");
      expect(sanitizeBtDbId(undefined)).toBe("");
      expect(sanitizeBtDbId(123)).toBe("");
      expect(sanitizeBtDbId(NaN)).toBe("");
      expect(sanitizeBtDbId(Infinity)).toBe("");
      expect(sanitizeBtDbId({})).toBe("");
    });

    it("keeps uppercase letters, lowercase letters, numbers, and underscores", () => {
      expect(
        sanitizeBtDbId("tmt_123ABCdef"),
      ).toBe("tmt_123ABCdef");
    });

    it("removes invalid characters", () => {
      expect(
        sanitizeBtDbId("tmt-123@ABC#def!")
      ).toBe("tmt123ABCdef");
    });

    it("removes spaces", () => {
      expect(
        sanitizeBtDbId("tmt 123 ABC def")
      ).toBe("tmt123ABCdef");
    });

    it("removes punctuation and symbols", () => {
      expect(
        sanitizeBtDbId("tmt_123!@#$%^&*()+=[]{}|\\:;\"'<>,.?/")
      ).toBe("tmt_123");
    });

    it("removes unicode letters that are not A-Z", () => {
      expect(
        sanitizeBtDbId("tmt_123_é_क_中")
      ).toBe("tmt_123___");
    });

    it("removes emojis", () => {
      expect(
        sanitizeBtDbId("tmt_123😀ABC")
      ).toBe("tmt_123ABC");
    });

    it("trims values longer than 36 characters", () => {
      const input = "a".repeat(40);

      expect(
        sanitizeBtDbId(input)
      ).toBe("a".repeat(36));
    });

    it("keeps values exactly 36 characters long", () => {
      const input = "a".repeat(36);

      expect(
        sanitizeBtDbId(input)
      ).toBe(input);
    });

    it("returns empty string when all characters are invalid", () => {
      expect(
        sanitizeBtDbId("!@#$%^&*()")
      ).toBe("");
    });

    it("preserves typical Bowl Tmnts ids", () => {
      expect(
        sanitizeBtDbId("tmt_4ff710c8493f4a218d2e2b045442974a")
      ).toBe("tmt_4ff710c8493f4a218d2e2b045442974a");

      expect(
        sanitizeBtDbId("ply_a01758cff1cc4bab9d9133e661bd49b0")
      ).toBe("ply_a01758cff1cc4bab9d9133e661bd49b0");
    });
  });

  describe("sanitizeName", () => {
    it("returns empty string for non-string inputs", () => {
      expect(sanitizeName(null)).toBe("");
      expect(sanitizeName(undefined)).toBe("");
      expect(sanitizeName(123)).toBe("");
      expect(sanitizeName(NaN)).toBe("");
      expect(sanitizeName(Infinity)).toBe("");
    });

    it("trims leading and trailing spaces", () => {
      expect(sanitizeName("   John   ")).toBe("John");
    });

    it("keeps international letters and combining marks", () => {
      expect(sanitizeName("Héllô Wörld")).toBe("Héllô Wörld");
      expect(sanitizeName("ক")).toBe("ক");
      expect(sanitizeName("Łukasz")).toBe("Łukasz");
    });

    it("keeps apostrophe and hyphen", () => {
      expect(sanitizeName("O'Connor")).toBe("O'Connor");
      expect(sanitizeName("Jean-Luc")).toBe("Jean-Luc");
    });

    it("removes digits, punctuation (other than ' and -), and emojis", () => {
      expect(sanitizeName("Bob2 😀!@#")).toBe("Bob");
      expect(sanitizeName("Ann, Marie.")).toBe("Ann Marie"); // comma/period removed, space preserved
    });

    it("removes brackets and other symbols", () => {
      expect(sanitizeName("[ABC](DEF){GHI}<JKL>")).toBe("ABCDEFGHIJKL");
    });

    it("returns empty string when input is only spaces", () => {
      expect(sanitizeName("     ")).toBe("");
    });

    it("does not collapse multiple spaces (only trims ends)", () => {
      expect(sanitizeName("a  b   c")).toBe("a  b   c");
      expect(sanitizeName("Billy Bob")).toBe("Billy Bob");
    });

    it("removes newlines/tabs because they are not Zs spaces", () => {
      expect(sanitizeName("a\nb\tc\r")).toBe("abc");
    });
  });

  describe("sanitizeCity", () => {
    it("returns empty string for non-string inputs", () => {
      expect(sanitizeCity(null)).toBe("");
      expect(sanitizeCity(undefined)).toBe("");
      expect(sanitizeCity(123)).toBe("");
    });

    it("trims leading and trailing spaces", () => {
      expect(sanitizeCity("  St. Louis  ")).toBe("St. Louis");
    });

    it("keeps international letters, period, and hyphen", () => {
      expect(sanitizeCity("São Paulo")).toBe("São Paulo");
      expect(sanitizeCity("Baden-Württemberg")).toBe("Baden-Württemberg");
      expect(sanitizeCity("St. Louis")).toBe("St. Louis");
      expect(sanitizeCity("ক. শহর-1")).toBe("ক. শহর-"); // numbers removed
    });

    it("removes disallowed punctuation and emojis", () => {
      expect(sanitizeCity("City@Name😀")).toBe("CityName");
      expect(sanitizeCity("A/B\\C")).toBe("ABC");
    });

    it("removes newlines/tabs", () => {
      expect(sanitizeCity("a\nb\tc\r")).toBe("abc");
    });
  });

  describe("sanitizeTournamentName", () => {
    it("returns empty string for non-string inputs", () => {
      expect(sanitizeTournamentName(null)).toBe("");
      expect(sanitizeTournamentName(undefined)).toBe("");
      expect(sanitizeTournamentName(123)).toBe("");
    });

    it("keeps letters (international), numbers, spaces, and allowed punctuation", () => {
      const input = "2026 Spring Classic (Singles) - Bob's, Inc. & Co.";
      expect(sanitizeTournamentName(input)).toBe(input);
    });

    it("removes disallowed characters like @ # / and emojis", () => {
      const input = "A.B-C@D E'FG#H,1ক😀";
      // tournament allows letters, numbers, spaces, '.,&()-
      // @ and # removed, emoji removed
      expect(sanitizeTournamentName(input)).toBe("A.B-CD E'FGH,1ক");
    });

    it("trims leading and trailing spaces", () => {
      expect(sanitizeTournamentName("   Hello World!   ")).toBe("Hello World");
      // "!" is disallowed for tournamentName and will be removed
    });

    it("does not collapse multiple spaces (only trims ends)", () => {
      expect(sanitizeTournamentName("a  b   c")).toBe("a  b   c");
    });

    it("removes newlines/tabs", () => {
      expect(sanitizeTournamentName("a\nb\tc\r")).toBe("abc");
    });
  });

  describe("sanitizeNotes", () => {
    it("returns empty string for non-string inputs", () => {
      expect(sanitizeNotes(null)).toBe("");
      expect(sanitizeNotes(undefined)).toBe("");
      expect(sanitizeNotes(123)).toBe("");
    });

    it("keeps international letters, numbers, and punctuation", () => {
      const input = "Notes: Héllô — Wörld! score=200, ok? ক 😀";
      // emoji should be removed; punctuation should remain (Unicode \p{P})
      expect(sanitizeNotes(input)).toBe("Notes: Héllô — Wörld! score=200, ok? ক");
    });

    it("keeps newlines and carriage returns", () => {
      const input = "Line1\nLine2\rLine3";
      expect(sanitizeNotes(input)).toBe(input);
    });

    it("removes tabs (not allowed) and other control chars", () => {
      const input = "a\tb\u0000c";
      expect(sanitizeNotes(input)).toBe("abc");
    });

    it("trims leading and trailing spaces but preserves internal spacing/newlines", () => {
      expect(sanitizeNotes("  a  b \n c  ")).toBe("a b\nc");
    });
    
    it("collapses multiple spaces", () => {
      expect(sanitizeNotes("a   b   c")).toBe("a b c");
    });
    it("should remove html tags", () => {
      expect(sanitizeNotes("<p>hello</p>")).toBe("hello");
    });
    it("should remove html attributes", () => {
      expect(sanitizeNotes("<p class='hello'>hello</p>")).toBe("hello");
    })
    it("should remove html comments", () => {
      expect(sanitizeNotes("<!-- hello -->")).toBe("");
    })
    it("should remove html entities", () => {
      expect(sanitizeNotes("&lt;hello&gt;")).toBe("");
    })
    it('should remove html scripts', () => {
      expect(sanitizeNotes("<script>alert('hello')</script>")).toBe("");
    })
  });

  describe("sanitizeEDS", () => {
    it("removes special characters and trims", () => {
      expect(sanitizeEDS(" Event 1 ***")).toBe("Event 1");
    });

    it("keeps international letters and numbers", () => {
      expect(sanitizeEDS("Évênt 2026")).toBe("Évênt 2026");
      expect(sanitizeEDS("সেকশন ৩")).toBe("সেকশন ৩");
    });

    it("keeps apostrophe and hyphen", () => {
      expect(sanitizeEDS("Scratch-A")).toBe("Scratch-A");
      expect(sanitizeEDS("Director's Cup 2")).toBe("Director's Cup 2");
    });

    it("collapses multiple spaces", () => {
      expect(sanitizeEDS("Event    1     Squad   2"))
        .toBe("Event 1 Squad 2");
    });

    it("removes emoji", () => {
      expect(sanitizeEDS("Event 😀 1")).toBe("Event 1");
    });

    it("returns empty string for non-string input", () => {
      expect(sanitizeEDS(null)).toBe("");
      expect(sanitizeEDS(undefined)).toBe("");
      expect(sanitizeEDS(123)).toBe("");
    });
  });

  describe("sanitizeUrl", () => {
    it("should return the sanitized URL when given a valid URL without an ending slash", () => {
      const result = sanitizeUrl("https://example.com");
      expect(result).toBe("https://example.com");
    });
    it("should return the sanitized URL when given a valid URL ends in a slash", () => {
      const result = sanitizeUrl("https://example.com/");
      expect(result).toBe("https://example.com");
    });
    it("should return the sanitized URL when given a valid HTTP URL", () => {
      const result = sanitizeUrl("http://example.com/path?query=123#hash");
      expect(result).toBe("http://example.com/path?query=123#hash");
    });
    it("should return an empty string when the URL protocol is unsupported", () => {
      const result = sanitizeUrl("ftp://example.com/path");
      expect(result).toBe("");
    });

    it("should return the sanitized URL with port number when given a valid HTTP URL with port", () => {
      const result = sanitizeUrl("http://example.com:8080/path?query=123#hash");
      expect(result).toBe("http://example.com:8080/path?query=123#hash");
    });

    it("should return an empty string when given a URL with a malformed structure", () => {
      const result = sanitizeUrl("invalidurl");
      expect(result).toBe("");
    });

    it("should return the URL-encoded version of the input URL with spaces", () => {
      const result = sanitizeUrl("http://example.com/with spaces");
      expect(result).toBe("http://example.com/with%20spaces");
    });

    it("should return an empty string when given a URL with a very long length", () => {
      const longUrl = "http://" + "a".repeat(10000);
      const result = sanitizeUrl(longUrl);
      expect(result).toBe("");
    });

    it("should return an empty string when given a URL with missing protocol", () => {
      const result = sanitizeUrl("example.com");
      expect(result).toBe("");
    });

    it("should ignore username and password in the URL", () => {
      const result = sanitizeUrl(
        "http://username:password@example.com/path?query=123#hash"
      );
      expect(result).toBe("http://example.com/path?query=123#hash");
    });

    it("should correctly parse and rebuild URLs with complex query parameters", () => {
      const result = sanitizeUrl(
        "https://example.com/path/to/resource?param1=value1&param2=value2#section"
      );
      expect(result).toBe(
        "https://example.com/path/to/resource?param1=value1&param2=value2#section"
      );
    });

    it("should return encoded URL when given a URL with html script tag", () => {
      const url = "http://example.com/<script>alert('XSS')</script>";
      const result = sanitizeUrl(url);
      expect(result).toBe(
        "http://example.com/%3Cscript%3Ealert('XSS')%3C/script%3E"
      );
    });

    it("should return an empty string when passed a non string value", () => {
      const result = sanitizeUrl(123);
      expect(result).toBe("");
    });
  });

  describe("isAllZeros", () => {
    it('should return true when the string contains only "0"s', () => {
      expect(isAllZeros("0000")).toBe(true);
    });
    it('should return true when the string contains only 1 "0"', () => {
      expect(isAllZeros("0")).toBe(true);
    });
    it('should return false when the string contains mixed "0"s and other characters', () => {
      expect(isAllZeros("0101")).toBe(false);
    });
    it("should return false for an empty string", () => {
      expect(isAllZeros("")).toBe(false);
    });
    it("should return false when input is null/undefined", () => {
      expect(isAllZeros(null as any)).toBe(false);
      expect(isAllZeros(undefined as any)).toBe(false);
    });
  });

  describe("sanitizeCurrency", () => {
    it("should return the sanitized currency when given a valid currency string", () => {
      expect(sanitizeCurrency("123.45")).toBe("123.45");
    });
    it("should return an empty string when given an empty currency string", () => {
      expect(sanitizeCurrency("")).toBe("");
    });
    it('should return "0" when given "0"', () => {
      expect(sanitizeCurrency("0")).toBe("0");
    });
    it('should return "0" when given "000"', () => {
      expect(sanitizeCurrency("000")).toBe("0");
    });
    it('should return "0" when given "0.00"', () => {
      expect(sanitizeCurrency("0.00")).toBe("0");
    });
    it("should remove commas and leading '$'", () => {
      expect(sanitizeCurrency("1,234.56")).toBe("1234.56");
      expect(sanitizeCurrency("$123.45")).toBe("123.45");
    });
    it("should trim (not round) extra decimals", () => {
      expect(sanitizeCurrency("123.456")).toBe("123.45");
      expect(sanitizeCurrency("123.899")).toBe("123.89");
    });
    it("should return empty string for invalid currency", () => {
      expect(sanitizeCurrency("abc")).toBe("");
      expect(sanitizeCurrency("(123.45)")).toBe("");
    });
    it("should accept number inputs", () => {
      expect(sanitizeCurrency(123.45 as any)).toBe("123.45");
      expect(sanitizeCurrency(-123.45 as any)).toBe("-123.45");
    });
  });

  describe('sanitizedMoneyString', () => {
    it('should return sanitized format when given a valid currency string', () => {
      const input = "$1,234.56";
      const expectedOutput = "1234.56";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return an empty string when given an invalid currency format', () => {
      const input = "invalid_currency";
      const expectedOutput = "";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return "0" when the input string is empty', () => {
      const input = "";
      const expectedOutput = "0";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return sanitized format when given a valid currency string', () => {
      const input = "$1,234.56";
      const expectedOutput = "1234.56";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return sanitized format for currency string ending with ".00"', () => {
      const input = "100.00";
      const expectedOutput = "100";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should convert NaN values to an empty string when provided with a non-numeric string', () => {
      const input = "invalid";
      const expectedOutput = "";
      const result = sanitizedMoneyString(input);
      expect(result).toBe(expectedOutput);
    });
    it('should return empty string for null input', () => {
      const input = null;
      const expectedOutput = "";
      const result = sanitizedMoneyString(input as any);
      expect(result).toBe(expectedOutput);
    });
  });

  describe("sanitizeMoneyAmount", () => {
    it("returns the same number when given a valid integer", () => {
      expect(sanitizeMoneyAmount(123)).toBe(123);
    });

    it("returns the same number when given a valid decimal with 2 places", () => {
      expect(sanitizeMoneyAmount(123.45)).toBe(123.45);
    });

    it("rounds values to 2 decimal places", () => {
      expect(sanitizeMoneyAmount(123.456)).toBe(123.46);
      expect(sanitizeMoneyAmount(123.454)).toBe(123.45);
    });

    it("accepts numeric strings", () => {
      expect(sanitizeMoneyAmount("123.45")).toBe(123.45);
      expect(sanitizeMoneyAmount("100")).toBe(100);
    });

    it("returns null for null", () => {
      expect(sanitizeMoneyAmount(null)).toBeNull();
    });

    it("returns null for undefined", () => {
      expect(sanitizeMoneyAmount(undefined)).toBeNull();
    });

    it("returns null for NaN", () => {
      expect(sanitizeMoneyAmount(NaN)).toBeNull();
    });

    it("returns null for Infinity", () => {
      expect(sanitizeMoneyAmount(Infinity)).toBeNull();
    });

    it("returns null for negative Infinity", () => {
      expect(sanitizeMoneyAmount(-Infinity)).toBeNull();
    });

    it("returns null for non-numeric strings", () => {
      expect(sanitizeMoneyAmount("abc")).toBeNull();      
    });

    it("returns 0 for empty strings", () => {      
      expect(sanitizeMoneyAmount("")).toBe(0);
    });

    it("preserves negative values", () => {
      expect(sanitizeMoneyAmount(-123.45)).toBe(-123.45);
      expect(sanitizeMoneyAmount(-123.456)).toBe(-123.46);
    });

    it("rounds half-up correctly", () => {
      expect(sanitizeMoneyAmount(1.005)).toBe(1);
      expect(sanitizeMoneyAmount(1.015)).toBe(1.01);
    });
  });  

});