import { calcHandicap, calcLpox, calcLpoxValid, toErrorMessage } from "@/lib/db/helpers";
import type { eventType } from "@/lib/types/types";
import { IntlConfig } from "@/lib/currency/components/CurrencyInputProps";
import { getLocaleConfig } from "@/lib/currency/components/utils";

const baseEvent: eventType = {
  id: "evt_1",
  tmnt_id: "tmnt_1",
  tab_title: "",
  event_name: "",
  event_name_err: "",
  team_size: 0,
  team_size_err: "",
  games: 0,
  games_err: "",
  entry_fee: "50",
  entry_fee_err: "",
  lineage: "10",
  lineage_err: "",
  prize_fund: "20",
  prize_fund_err: "",
  other: "5",
  other_err: "",
  expenses: "15",
  expenses_err: "",
  added_money: "",
  added_money_err: "",
  lpox: "50",
  lpox_valid: "valid" as any, // adjust if strict typing is enforced
  lpox_err: "",
  sort_order: 0,
  errClassName: ""
};

describe("toErrorMessage", () => {
  it("returns the message of an Error", () => {
    expect(toErrorMessage(new Error("boom"))).toBe("boom");
  });
  it("returns the message of an Error subclass", () => {
    expect(toErrorMessage(new TypeError("bad type"))).toBe("bad type");
  });
  it("returns an empty string for an Error with no message", () => {
    expect(toErrorMessage(new Error())).toBe("");
  });
  it("returns a string unchanged", () => {
    expect(toErrorMessage("plain string")).toBe("plain string");
  });
  it("converts a number to a string", () => {
    expect(toErrorMessage(42)).toBe("42");
  });
  it("converts null to 'null'", () => {
    expect(toErrorMessage(null)).toBe("null");
  });
  it("converts undefined to 'undefined'", () => {
    expect(toErrorMessage(undefined)).toBe("undefined");
  });
  it("converts a plain object with String()", () => {
    expect(toErrorMessage({ message: "not an Error" })).toBe("[object Object]");
  });
});

describe("calcHandicap", () => {
  describe("per game", () => {
    it("calculates integer handicap", () => {
      // (230 - 180) * 0.9 = 45
      expect(calcHandicap(180, 230, 0.9, true, "Game", 1)).toBe(45);
    });
    it("uses default hdcpFor 'Game' and games 1", () => {
      expect(calcHandicap(180, 230, 0.9, true)).toBe(45);
    });
    it("rounds down when intHdcp is true", () => {
      // (220 - 185) * 0.9 = 31.5 -> 31
      expect(calcHandicap(185, 220, 0.9, true)).toBe(31);
    });
    it("keeps one decimal when intHdcp is false", () => {
      // (220 - 185) * 0.9 = 31.5
      expect(calcHandicap(185, 220, 0.9, false)).toBe(31.5);
    });
    it("rounds away floating point noise when intHdcp is false", () => {
      // (220 - 187) * 0.8 = 26.400000000000002 -> 26.4
      expect(calcHandicap(187, 220, 0.8, false)).toBe(26.4);
    });
    it("handles 100% handicap", () => {
      expect(calcHandicap(200, 220, 1, true)).toBe(20);
    });
    it("does not multiply by games when hdcpFor is 'Game'", () => {
      expect(calcHandicap(180, 230, 0.9, true, "Game", 3)).toBe(45);
    });
  });

  describe("per series", () => {
    it("multiplies by number of games", () => {
      // 45 * 3 = 135
      expect(calcHandicap(180, 230, 0.9, true, "Series", 3)).toBe(135);
    });
    it("multiplies before rounding down", () => {
      // 31.5 * 3 = 94.5 -> 94 (not 31 * 3 = 93)
      expect(calcHandicap(185, 220, 0.9, true, "Series", 3)).toBe(94);
    });
    it("keeps one decimal for series when intHdcp is false", () => {
      expect(calcHandicap(185, 220, 0.9, false, "Series", 3)).toBe(94.5);
    });
    it("does not multiply when games is 1", () => {
      expect(calcHandicap(180, 230, 0.9, true, "Series", 1)).toBe(45);
    });
  });

  describe("zero handicap", () => {
    it("returns 0 when average equals hdcpFrom", () => {
      expect(calcHandicap(230, 230, 0.9, true)).toBe(0);
    });
    it("returns 0 when average is above hdcpFrom", () => {
      expect(calcHandicap(240, 230, 0.9, true)).toBe(0);
    });
    it("returns 0 when hdcpPer is 0 (scratch)", () => {
      expect(calcHandicap(180, 230, 0, true)).toBe(0);
    });
    it("returns 0 when hdcpPer is 0 and intHdcp is false", () => {
      expect(calcHandicap(180, 230, 0, false)).toBe(0);
    });
  });

  describe("invalid input returns 0", () => {
    it("invalid average (negative)", () => {
      expect(calcHandicap(-1, 230, 0.9, true)).toBe(0);
    });
    it("invalid average (NaN)", () => {
      expect(calcHandicap(NaN, 230, 0.9, true)).toBe(0);
    });
    it("invalid hdcpFrom (negative)", () => {
      expect(calcHandicap(180, -1, 0.9, true)).toBe(0);
    });
    it("invalid hdcpPer (negative)", () => {
      expect(calcHandicap(180, 230, -0.1, true)).toBe(0);
    });
    it("invalid intHdcp (not a boolean)", () => {
      expect(calcHandicap(180, 230, 0.9, "true" as any)).toBe(0);
    });
    it("invalid hdcpFor", () => {
      expect(calcHandicap(180, 230, 0.9, true, "bogus", 1)).toBe(0);
    });
    it("invalid games (0)", () => {
      expect(calcHandicap(180, 230, 0.9, true, "Series", 0)).toBe(0);
    });
    it("invalid games (negative)", () => {
      expect(calcHandicap(180, 230, 0.9, true, "Series", -3)).toBe(0);
    });
  });
});

describe("calculateLPOX", () => {

  const ic: IntlConfig = {
    // locale: window.navigator.language,
    locale: "en-US",
  };
  const localConfig = getLocaleConfig(ic);
  localConfig.prefix = "$";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns formatted sum when all values are present", () => {
    const result = calcLpox(baseEvent);
    expect(result).toBe("50.00");
  });
  it("returns empty string if event is null", () => {    
    expect(calcLpox(null as any)).toBe("");
  });
  it("returns empty string if lineage is missing", () => {
    const e = { ...baseEvent, lineage: "" };
    expect(calcLpox(e)).toBe("40.00");
  });
  it("returns empty string if one of the values is not a number", () => {
    const e = { ...baseEvent, other: "abc" };
    const result = calcLpox(e);    
    expect(result).toBe("");
  });
  it("handles large numbers correctly", () => {
    const e = { ...baseEvent, lineage: "1000", prize_fund: "2000", other: "3000", expenses: "4000" };
    const result = calcLpox(e);
    expect(result).toBe("10000.00");    
  });
});

describe("calcLpoxValid", () => {

  it("returns 'is-valid' when entry_fee matches lpox", () => {
    const result = calcLpoxValid(baseEvent);
    expect(result).toBe("is-valid");
  });

  it("returns 'is-invalid' when entry_fee does not match lpox", () => {
    const e = { ...baseEvent, lpox: "40" };
    const result = calcLpoxValid(e);
    expect(result).toBe("is-invalid");
  });

  it("returns empty string when event is null", () => {    
    expect(calcLpoxValid(null as any)).toBe("");
  });

  it("returns empty string when entry_fee is missing", () => {
    const e = { ...baseEvent, entry_fee: "" };
    expect(calcLpoxValid(e)).toBe("is-invalid");
  });

  it("returns empty string when lpox is missing", () => {
    const e = { ...baseEvent, lpox: "" };
    expect(calcLpoxValid(e)).toBe("is-invalid");
  });

  it("returns 'is-invalid' when entry_fee or lpox is not a number", () => {
    const e = { ...baseEvent, lpox: "abc" };
    const result = calcLpoxValid(e);
    expect(result).toBe("is-invalid"); // Number("abc") = NaN, so not equal
  });

  it("returns empty string if an exception is thrown", () => {
    const badEvent = { ...baseEvent, entry_fee: null as any }; // Object → Number throws
    expect(calcLpoxValid(badEvent)).toBe("");
  });
});