// test/app/results/tmnts/brackets/resultsClass.test.tsx
// tests src/app/results/tmnt/[tmntId]/brackets/resultClassName.ts
import { getResultClassName } from "@/app/results/tmnt/[tmntId]/brackets/resultClassName";
import type { matchResultType } from "@/components/brackets/bracketMatchClass";

describe("getResultClassName", () => {
  describe("each match result", () => {
    it.each<[string, matchResultType, string]>([
      ["a win (green)", "W", "text-success"],
      ["a loss (red)", "L", "text-danger"],
      ["a tie (blue)", "T", "text-primary"],
      ["no result yet (blue)", undefined, "text-primary"],
    ])("returns the right class for %s", (_label, result, className) => {
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

    it("gives no result the same class as a tie", () => {
      expect(getResultClassName(undefined)).toBe(getResultClassName("T"));
    });

    it.each<[matchResultType]>([["W"], ["L"], ["T"], [undefined]])(
      "returns a single Bootstrap text class for result %s",
      (result) => {
        expect(getResultClassName(result)).toMatch(/^text-[a-z]+$/);
      }
    );
  });

  describe("unexpected input", () => {
    // not possible through the type, but the data comes from calculations
    it.each<[string, unknown]>([
      ["an unknown letter", "X"],
      ["a lower case win", "w"],
      ["a lower case loss", "l"],
      ["an empty string", ""],
      ["null", null],
    ])("falls back to the primary class for %s", (_label, value) => {
      expect(getResultClassName(value as matchResultType)).toBe(
        "text-primary"
      );
    });
  });
});
