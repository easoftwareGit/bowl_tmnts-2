import { getResultClassName } from "@/app/results/tmnt/[tmntId]/brackets/resultClassName";
import type { matchResultType } from "@/components/brackets/bracketMatchClass";

describe("getResultClassName", () => {
  describe("each match result", () => {
    it("returns the success class (green) for a win", () => {
      expect(getResultClassName("W")).toBe("text-success");
    });

    it("returns the danger class (red) for a loss", () => {
      expect(getResultClassName("L")).toBe("text-danger");
    });

    it("returns the primary class (blue) for a tie", () => {
      expect(getResultClassName("T")).toBe("text-primary");
    });

    it("returns the primary class (blue) when there is no result yet", () => {
      expect(getResultClassName(undefined)).toBe("text-primary");
    });
  });

  describe("table of all results", () => {
    it.each<[matchResultType, string]>([
      ["W", "text-success"],
      ["L", "text-danger"],
      ["T", "text-primary"],
      [undefined, "text-primary"],
    ])("result %s gives class %s", (result, className) => {
      expect(getResultClassName(result)).toBe(className);
    });
  });

  describe("class names", () => {
    it("gives a different class for each of win, loss and tie", () => {
      const classNames = new Set([
        getResultClassName("W"),
        getResultClassName("L"),
        getResultClassName("T"),
      ]);

      expect(classNames.size).toBe(3);
    });

    it("returns a single Bootstrap text class with no extra spaces", () => {
      (["W", "L", "T", undefined] as matchResultType[]).forEach((result) => {
        expect(getResultClassName(result)).toMatch(/^text-[a-z]+$/);
      });
    });
  });

  describe("unexpected input", () => {
    it("falls back to the primary class for a value that is not a valid result", () => {
      // not possible through the type, but the data comes from calculations
      expect(getResultClassName("X" as unknown as matchResultType)).toBe(
        "text-primary"
      );
      expect(getResultClassName("w" as unknown as matchResultType)).toBe(
        "text-primary"
      );
      expect(getResultClassName(null as unknown as matchResultType)).toBe(
        "text-primary"
      );
    });
  });

  it("is a pure function: the same result always gives the same class", () => {
    expect(getResultClassName("W")).toBe(getResultClassName("W"));
    expect(getResultClassName("L")).toBe(getResultClassName("L"));
  });
});