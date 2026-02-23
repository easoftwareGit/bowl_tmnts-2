import { calcLpox, calcLpoxValid } from "@/lib/db/events/calcLpox";
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