// test/app/(private)/dataEntry/tmnts/oneToNEvents/oneToNEvents.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNEvents.tsx validateEvents()
import { cloneDeep } from "lodash";
import { validateEvents } from "@/app/(private)/dataEntry/tmntForm/oneToNEvents";
import type { eventType, AcdnErrType } from "@/lib/types/types";
import {
  eventId1,
  eventId2,
  mockTmntFullData,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import {
  maxGames,
  maxMoney,
  maxTeamSize,
  minGames,
  minTeamSize,
  zeroAmount,
} from "@/lib/validation/constants";
import {
  maxMoneyText,
  minMoneyText,
} from "@/components/currency/eaCurrencyInput";

// ---------------------------------------------------------------------------
// expected messages, built the same way validateEvents builds them
// ---------------------------------------------------------------------------
const nameRequiredMsg = "Event Name is required";
const nameUsedMsg = (name: string) => `"${name}" has already been used.`;
const teamLowMsg = "Team Size cannot be less than " + minTeamSize;
const teamHighMsg = "Team Size cannot be more than " + maxTeamSize;
const gamesLowMsg = "Event Games cannot be less than " + minGames;
const gamesHighMsg = "Event Games cannot be more than " + maxGames;
const lpoxMismatchMsg = "Entry Fee ≠ LPOX";
const lpoxInvalidMsg = "Invalid LPOX";

/** money fields: event field, its error field, and the label used in messages */
const moneyFields = [
  ["added_money", "added_money_err", "Added $"],
  ["entry_fee", "entry_fee_err", "Entry Fee"],
  ["lineage", "lineage_err", "Lineage"],
  ["prize_fund", "prize_fund_err", "Prize Fund"],
  ["other", "other_err", "Other"],
  ["expenses", "expenses_err", "Expenses"],
] as const;

const moneyLowMsg = (label: string) =>
  `${label} cannot be less than ${minMoneyText}`;
const moneyHighMsg = (label: string) =>
  `${label} cannot be more than ${maxMoneyText}`;
const moneyInvalidMsg = (label: string) => `Invalid ${label}`;

const acdnErr = (objName: string, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

const allErrorFields = [
  "event_name_err",
  "team_size_err",
  "games_err",
  "added_money_err",
  "entry_fee_err",
  "lineage_err",
  "prize_fund_err",
  "other_err",
  "expenses_err",
  "lpox_err",
] as const;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid event with no errors, where L+P+O+X equals the entry fee; override any field */
const makeEvent = (overrides: Partial<eventType> = {}): eventType => ({
  ...mockTmntFullData.events[0],
  event_name: "Singles",
  team_size: minTeamSize,
  games: minGames,
  added_money: "0",
  entry_fee: "80",
  lineage: "18",
  prize_fund: "55",
  other: "2",
  expenses: "5",
  lpox: "80",
  event_name_err: "",
  team_size_err: "",
  games_err: "",
  added_money_err: "",
  entry_fee_err: "",
  lineage_err: "",
  prize_fund_err: "",
  other_err: "",
  expenses_err: "",
  lpox_err: "",
  errClassName: "",
  ...overrides,
});

/** two valid events with different ids, names and sort orders */
const makeTwoEvents = (
  first: Partial<eventType> = {},
  second: Partial<eventType> = {},
): [eventType, eventType] => [
  makeEvent({ id: eventId1, event_name: "Singles", sort_order: 1, ...first }),
  makeEvent({ id: eventId2, event_name: "Doubles", sort_order: 2, ...second }),
];

/** an override that sets one field; the cast lets the field name be a variable */
const withField = (field: keyof eventType, value: string | number) =>
  ({ [field]: value }) as Partial<eventType>;

/** runs validateEvents and returns what it passed to its setters */
const runValidate = (events: eventType[]) => {
  const setEvents = jest.fn() as jest.Mock<void, [eventType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result = validateEvents(events, setEvents, setAcdnErr);

  expect(setEvents).toHaveBeenCalledTimes(1);
  const updated = setEvents.mock.calls[0][0];
  return { result, updated, setAcdnErr };
};

// ---------------------------------------------------------------------------

describe("OneToNEvents - validateEvents", () => {
  describe("all valid", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setAcdnErr } = runValidate(makeTwoEvents());

      expect(result).toBe(true);
      updated.forEach((event) => {
        allErrorFields.forEach((field) => expect(event[field]).toBe(""));
        expect(event.errClassName).toBe("");
      });
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("returns true for an empty array", () => {
      const { result, updated, setAcdnErr } = runValidate([]);

      expect(result).toBe(true);
      expect(updated).toEqual([]);
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("clears stale errors and the red highlight from an event that is now valid", () => {
      const stale = Object.fromEntries(
        allErrorFields.map((field) => [field, "stale error"]),
      );
      const { result, updated, setAcdnErr } = runValidate([
        makeEvent({ ...(stale as Partial<eventType>), errClassName: objErrClassName }),
      ]);

      expect(result).toBe(true);
      allErrorFields.forEach((field) => expect(updated[0][field]).toBe(""));
      expect(updated[0].errClassName).toBe("");
      expect(setAcdnErr).toHaveBeenCalledWith(noAcdnErr);
    });

    it("accepts team size and games exactly at the minimum and maximum", () => {
      const { result } = runValidate(
        makeTwoEvents(
          { team_size: minTeamSize, games: minGames },
          { team_size: maxTeamSize, games: maxGames },
        ),
      );

      expect(result).toBe(true);
    });

    it("accepts added money exactly at the minimum and maximum", () => {
      const { result } = runValidate(
        makeTwoEvents(
          { added_money: String(zeroAmount) },
          { added_money: String(maxMoney) },
        ),
      );

      expect(result).toBe(true);
    });

    it("treats L+P+O+X as equal to the entry fee when only the formatting differs", () => {
      const { result, updated } = runValidate([
        makeEvent({ entry_fee: "80", lpox: "80.00" }),
      ]);

      expect(result).toBe(true);
      expect(updated[0].lpox_err).toBe("");
    });
  });

  describe("event name", () => {
    it.each([
      ["empty", ""],
      ["only spaces", "   "],
    ])("sets the required error when the name is %s", (_label, name) => {
      const { result, updated, setAcdnErr } = runValidate([
        makeEvent({ event_name: name }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].event_name_err).toBe(nameRequiredMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      // a blank name has nothing to show, so the accordion says "Events"
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Events", nameRequiredMsg));
    });

    it("sets the duplicate error on the later event only", () => {
      const events = makeTwoEvents(
        { event_name: "Doubles" },
        { event_name: "Doubles" },
      );

      const { result, updated, setAcdnErr } = runValidate(events);

      expect(result).toBe(false);
      expect(updated[0].event_name_err).toBe("");
      expect(updated[0].errClassName).toBe("");
      expect(updated[1].event_name_err).toBe(nameUsedMsg("Doubles"));
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Doubles", nameUsedMsg("Doubles")),
      );
    });

    it("finds duplicates regardless of case and extra spaces", () => {
      const { updated } = runValidate(
        makeTwoEvents({ event_name: "Mixed Doubles" }, { event_name: " mixed  DOUBLES " }),
      );

      expect(updated[1].event_name_err).toBe(nameUsedMsg(" mixed  DOUBLES "));
    });
  });

  describe("team size and games", () => {
    it("sets both 'less than' errors when both are below the minimum", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeEvent({ team_size: minTeamSize - 1, games: minGames - 1 }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].team_size_err).toBe(teamLowMsg);
      expect(updated[0].games_err).toBe(gamesLowMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      // the accordion shows the first error found
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Singles", teamLowMsg));
    });

    it("sets both 'more than' errors when both are above the maximum", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeEvent({ team_size: maxTeamSize + 1, games: maxGames + 1 }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].team_size_err).toBe(teamHighMsg);
      expect(updated[0].games_err).toBe(gamesHighMsg);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Singles", teamHighMsg));
    });
  });

  describe("money fields", () => {
    it.each(moneyFields)(
      "sets the 'less than' error when %s is below the minimum",
      (field, errField, label) => {
        const { result, updated, setAcdnErr } = runValidate([
          makeEvent(withField(field, String(zeroAmount - 1))),
        ]);

        expect(result).toBe(false);
        expect(updated[0][errField]).toBe(moneyLowMsg(label));
        expect(updated[0].errClassName).toBe(objErrClassName);
        expect(setAcdnErr).toHaveBeenCalledWith(
          acdnErr("Singles", moneyLowMsg(label)),
        );
      },
    );

    it.each(moneyFields)(
      "sets the 'more than' error when %s is above the maximum",
      (field, errField, label) => {
        const { result, updated } = runValidate([
          makeEvent(withField(field, String(maxMoney + 1))),
        ]);

        expect(result).toBe(false);
        expect(updated[0][errField]).toBe(moneyHighMsg(label));
      },
    );

    it.each(moneyFields)(
      "sets the 'Invalid' error when %s is not a number",
      (field, errField, label) => {
        const { result, updated, setAcdnErr } = runValidate([
          makeEvent(withField(field, "abc")),
        ]);

        expect(result).toBe(false);
        expect(updated[0][errField]).toBe(moneyInvalidMsg(label));
        expect(updated[0].errClassName).toBe(objErrClassName);
        expect(setAcdnErr).toHaveBeenCalledWith(
          acdnErr("Singles", moneyInvalidMsg(label)),
        );
      },
    );

    it("when every money field is below the minimum, sets every error, and the accordion shows Added $", () => {
      const low = String(zeroAmount - 1);
      const { updated, setAcdnErr } = runValidate([
        makeEvent(
          Object.fromEntries(
            moneyFields.map(([field]) => [field, low]),
          ) as Partial<eventType>,
        ),
      ]);

      moneyFields.forEach(([, errField, label]) =>
        expect(updated[0][errField]).toBe(moneyLowMsg(label)),
      );
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Singles", moneyLowMsg("Added $")),
      );
    });
  });

  describe("L+P+O+X", () => {
    it("sets the mismatch error when the entry fee does not equal L+P+O+X", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeEvent({ entry_fee: "80", lpox: "79" }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].lpox_err).toBe(lpoxMismatchMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Singles", lpoxMismatchMsg));
    });

    it("compares against the stored lpox, not a recalculated one", () => {
      // the parts add up to 80, but the stored lpox says 79
      const { updated } = runValidate([makeEvent({ lpox: "79" })]);

      expect(updated[0].lpox_err).toBe(lpoxMismatchMsg);
    });

    it("sets the 'Invalid LPOX' error when lpox is not a number", () => {
      const { result, updated } = runValidate([makeEvent({ lpox: "abc" })]);

      expect(result).toBe(false);
      // before the fix, the mismatch check always overwrote this error
      expect(updated[0].lpox_err).toBe(lpoxInvalidMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
    });

    it.each(moneyFields.filter(([field]) => field !== "added_money"))(
      "skips the mismatch check when %s is out of range",
      (field, errField) => {
        const { updated } = runValidate([
          makeEvent({ ...withField(field, String(zeroAmount - 1)), lpox: "79" }),
        ]);

        expect(updated[0][errField]).not.toBe("");
        expect(updated[0].lpox_err).toBe("");
      },
    );

    it("still checks the mismatch when only added money is out of range", () => {
      const { updated } = runValidate([
        makeEvent({ added_money: String(zeroAmount - 1), lpox: "79" }),
      ]);

      expect(updated[0].added_money_err).toBe(moneyLowMsg("Added $"));
      expect(updated[0].lpox_err).toBe(lpoxMismatchMsg);
    });
  });

  describe("several events", () => {
    it("sets errors on every invalid event, and the accordion shows the first event's error", () => {
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoEvents({ event_name: "" }, { games: maxGames + 1 }),
      );

      expect(result).toBe(false);
      expect(updated[0].event_name_err).toBe(nameRequiredMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].games_err).toBe(gamesHighMsg);
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Events", nameRequiredMsg));
    });

    it("clears a fixed event's stale errors while reporting another event's error", () => {
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoEvents(
          { event_name_err: nameRequiredMsg, errClassName: objErrClassName },
          { games: maxGames + 1 },
        ),
      );

      expect(result).toBe(false);
      expect(updated[0].event_name_err).toBe("");
      expect(updated[0].errClassName).toBe("");
      expect(updated[1].games_err).toBe(gamesHighMsg);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Doubles", gamesHighMsg));
    });

    it("only highlights the events that have errors", () => {
      const { updated } = runValidate(makeTwoEvents({ games: maxGames + 1 }, {}));

      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe("");
    });

    // before the fix, Other and Expenses errors were never reset between events
    const carryOverCases: [keyof eventType, keyof eventType, string | number][] = [
      ["team_size", "team_size_err", maxTeamSize + 1],
      ["games", "games_err", maxGames + 1],
      ...moneyFields.map(
        ([field, errField]): [keyof eventType, keyof eventType, string] => [
          field,
          errField,
          String(zeroAmount - 1),
        ],
      ),
    ];
    it.each(carryOverCases)(
      "does not carry a %s error over to the next event",
      (field, errField, badValue) => {
        const { updated } = runValidate(makeTwoEvents(withField(field, badValue), {}));

        expect(updated[0][errField]).not.toBe("");
        expect(updated[1][errField]).toBe("");
        expect(updated[1].errClassName).toBe("");
      },
    );
  });

  describe("what it passes to setEvents", () => {
    it("keeps every event, in order, with only its error fields changed", () => {
      const events = makeTwoEvents({ games: maxGames + 1 }, {});

      const { updated } = runValidate(events);

      expect(updated.map((e) => e.id)).toEqual([eventId1, eventId2]);
      const anyErrors = Object.fromEntries(
        [...allErrorFields, "errClassName"].map((f) => [f, expect.any(String)]),
      );
      updated.forEach((event, i) =>
        expect(event).toEqual({ ...events[i], ...anyErrors }),
      );
    });

    it("does not change the events passed in", () => {
      const events = makeTwoEvents({ event_name: "" }, {});
      const before = cloneDeep(events);

      const { updated } = runValidate(events);

      expect(events).toEqual(before);
      expect(updated[0]).not.toBe(events[0]);
    });
  });
});
