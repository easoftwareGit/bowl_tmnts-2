import { getResultClassName } from "@/app/results/tmnt/[tmntId]/brackets/resultClassName";
import type { matchResultType } from "@/components/brackets/bracketMatchClass";

describe("getResultClass", () => {
  it.each<[matchResultType, string]>([
    ["W", "text-success"],
    ["L", "text-danger"],
    ["T", "text-primary"],
    [undefined, "text-primary"],
  ])("returns %s as %s", (result, expectedClass) => {
    expect(getResultClassName(result)).toBe(expectedClass);
  });
});