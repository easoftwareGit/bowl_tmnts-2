import {
  defaultCallbackUrl,
  getSafeCallbackUrl,
  normalizeEmail,
} from "@/lib/auth/authUtils";

describe("authUtils", () => {
  describe("defaultCallbackUrl", () => {
    it("is /user/tmnts", () => {
      expect(defaultCallbackUrl).toBe("/user/tmnts");
    });
  });

  describe("normalizeEmail", () => {
    it.each([
      ["already normalized", "adam@email.com", "adam@email.com"],
      ["upper case", "ADAM@EMAIL.COM", "adam@email.com"],
      ["mixed case", "Adam@Email.Com", "adam@email.com"],
      ["leading and trailing spaces", "  adam@email.com  ", "adam@email.com"],
      ["tabs and newlines", "\t adam@email.com \n", "adam@email.com"],
      ["spaces and mixed case", "  Adam@Email.COM ", "adam@email.com"],
      ["a plus tag", "Adam+Bowling@Email.com", "adam+bowling@email.com"],
      ["empty", "", ""],
      ["only spaces", "   ", ""],
    ])("handles %s", (_label, input, expected) => {
      expect(normalizeEmail(input)).toBe(expected);
    });

    it("does not remove spaces inside the email", () => {
      expect(normalizeEmail("Adam @Email.com")).toBe("adam @email.com");
    });

    it("does not validate the email", () => {
      // validation is isEmail's job
      expect(normalizeEmail("Not An Email")).toBe("not an email");
    });

    it("returns the same value when called twice", () => {
      const once = normalizeEmail("  Adam@Email.COM ");
      expect(normalizeEmail(once)).toBe(once);
    });
  });

  describe("getSafeCallbackUrl", () => {
    describe("uses the default", () => {
      it.each([
        ["null", null],
        ["undefined", undefined],
        ["empty", ""],
        ["only spaces", "   "],
        ["'/'", "/"],
        ["an absolute URL with no path", "https://example.com"],
        ["an absolute URL with only '/'", "https://example.com/"],
        ["a broken absolute URL", "http://"],
      ])("when callbackUrl is %s", (_label, raw) => {
        expect(getSafeCallbackUrl(raw)).toBe(defaultCallbackUrl);
      });
    });

    describe("keeps same-site paths", () => {
      it.each([
        ["a relative path", "/dataEntry/runTmnt/123", "/dataEntry/runTmnt/123"],
        ["a path with search and hash", "/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
        ["a path with spaces around it", "  /user/tmnts  ", "/user/tmnts"],
        ["an https URL", "https://example.com/user/tmnts?page=2#top", "/user/tmnts?page=2#top"],
        ["an http URL with a port", "http://localhost:3000/dataEntry/runTmnt/1", "/dataEntry/runTmnt/1"],
        ["an upper case scheme", "HTTPS://example.com/user/tmnts", "/user/tmnts"],
        ["the default itself", defaultCallbackUrl, defaultCallbackUrl],
      ])("for %s", (_label, raw, expected) => {
        expect(getSafeCallbackUrl(raw)).toBe(expected);
      });

      it("keeps only the path of an absolute URL on another site", () => {
        // the origin is dropped, so the user stays on this site
        expect(getSafeCallbackUrl("https://evil.com/user/tmnts")).toBe(
          "/user/tmnts",
        );
      });
    });

    // SECURITY: anything that could leave the site goes to the default
    describe("blocks links that could leave the site", () => {
      it.each([
        ["protocol-relative", "//evil.com"],
        ["protocol-relative with a path", "//evil.com/user/tmnts"],
        ["a backslash trick", "/\\evil.com"],
        ["an absolute URL whose path is protocol-relative", "https://example.com//evil.com"],
        ["a javascript: URL", "javascript:alert(1)"],
        ["an upper case javascript: URL", "JAVASCRIPT:alert(1)"],
        ["a data: URL", "data:text/html,hi"],
        ["an ftp URL", "ftp://evil.com/file"],
        ["a bare host", "evil.com"],
        ["a bare host with a path", "evil.com/user/tmnts"],
        ["a relative path without a leading /", "user/tmnts"],
        ["protocol-relative with spaces before it", "  //evil.com"],
      ])("for %s", (_label, raw) => {
        expect(getSafeCallbackUrl(raw)).toBe(defaultCallbackUrl);
      });
    });

    it("always returns a path that starts with a single '/'", () => {
      [
        null,
        "",
        "/",
        "/user/tmnts",
        "https://example.com/x",
        "//evil.com",
        "javascript:alert(1)",
      ].forEach((raw) => {
        const result = getSafeCallbackUrl(raw);
        expect(result.startsWith("/")).toBe(true);
        expect(result.startsWith("//")).toBe(false);
      });
    });
  });
});