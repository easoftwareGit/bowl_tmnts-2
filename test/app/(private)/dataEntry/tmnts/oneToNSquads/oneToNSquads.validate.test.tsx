// test/app/(private)/dataEntry/tmnts/oneToNSquads/oneToNSquads.validate.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/oneToNSquads.tsx validateSquads()
import { cloneDeep } from "lodash";
import { addDays } from "date-fns";
import { validateSquads } from "@/app/(private)/dataEntry/tmntForm/oneToNSquads";
import type { squadType, eventType, AcdnErrType } from "@/lib/types/types";
import {
  mockTmntFullData,
  squadId1,
  squadId2,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  acdnErrClassName,
  getAcdnErrMsg,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import {
  maxGames,
  maxLaneCount,
  maxStartLane,
  minGames,
  minLaneCount,
} from "@/lib/validation/constants";
import {
  dateTo_UTC_MMddyyyy,
  dateTo_yyyyMMdd,
  startOfDayFromString,
  todayStr,
} from "@/lib/dateTools";

// ---------------------------------------------------------------------------
// tournament dates and events
// ---------------------------------------------------------------------------
const events: eventType[] = cloneDeep(mockTmntFullData.events);
const event = events[0];
const tmntStartDateStr = mockTmntFullData.tmnt.start_date_str;
const tmntEndDateStr = mockTmntFullData.tmnt.end_date_str;
const minDate = startOfDayFromString(tmntStartDateStr) as Date;
const maxDate = startOfDayFromString(tmntEndDateStr) as Date;

// ---------------------------------------------------------------------------
// expected messages, built the same way validateSquads builds them
// ---------------------------------------------------------------------------
const eventNotFoundMsg = "Event not found";
const nameRequiredMsg = "Squad Name is required";
const nameUsedMsg = (name: string) => `"${name}" has already been used.`;
const gamesLowMsg = "Squad Games cannot be less than " + minGames;
const gamesHighMsg = (max: number) => "Squad Games cannot be more than " + max;
const startLowMsg = "Starting Lane cannot be less than 1";
const startHighMsg = "Starting Lane cannot be more than " + maxStartLane;
const startEvenMsg = "Starting Lane cannot be even";
const laneLowMsg = "Number of Lanes cannot be less than 2";
const laneHighMsg = "Number of Lanes cannot be more than " + maxLaneCount;
const laneOddMsg = "Number of Lanes cannot be odd";
const dateRequiredMsg = "Date is required";
const dateInvalidMsg = "Date is invalid";
const earliestMsg = (d: Date) => "Earliest date is " + dateTo_UTC_MMddyyyy(d);
const latestMsg = (d: Date) => "Latest date is " + dateTo_UTC_MMddyyyy(d);
const timeRequiredMsg = "Time is required";
const timeUsedMsg = (date: string, time: string) =>
  `${date} - ${time} has already been used.`;

const acdnErr = (objName: string, errMsg: string): AcdnErrType => ({
  errClassName: acdnErrClassName,
  message: getAcdnErrMsg(objName, errMsg),
});

const errorFields = [
  "event_id_err",
  "squad_name_err",
  "games_err",
  "starting_lane_err",
  "lane_count_err",
  "squad_date_err",
  "squad_time_err",
] as const;

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** a valid squad with no errors; override any field */
const makeSquad = (overrides: Partial<squadType> = {}): squadType => ({
  ...mockTmntFullData.squads[0],
  event_id: event.id,
  squad_name: "Squad 1",
  games: event.games,
  starting_lane: 1,
  lane_count: 4,
  squad_date_str: tmntStartDateStr,
  squad_time: "09:00",
  event_id_err: "",
  squad_name_err: "",
  games_err: "",
  starting_lane_err: "",
  lane_count_err: "",
  squad_date_err: "",
  squad_time_err: "",
  errClassName: "",
  ...overrides,
});

/** two valid squads with different ids, names, sort orders and times */
const makeTwoSquads = (
  first: Partial<squadType> = {},
  second: Partial<squadType> = {},
): [squadType, squadType] => [
  makeSquad({
    id: squadId1,
    squad_name: "Squad 1",
    sort_order: 1,
    squad_time: "09:00",
    ...first,
  }),
  makeSquad({
    id: squadId2,
    squad_name: "Squad 2",
    sort_order: 2,
    squad_time: "13:00",
    ...second,
  }),
];

/**
 * runs validateSquads and returns what it passed to its setters.
 * uses the tournament's dates unless dates are given.
 */
const runValidate = (
  squads: squadType[],
  dates: { min?: Date; max?: Date } | "defaults" = {},
) => {
  const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;
  const setAcdnErr = jest.fn() as jest.Mock<void, [AcdnErrType]>;

  const result =
    dates === "defaults"
      ? validateSquads(squads, setSquads, events, setAcdnErr)
      : validateSquads(
          squads,
          setSquads,
          events,
          setAcdnErr,
          dates.min ?? minDate,
          dates.max ?? maxDate,
        );

  expect(setSquads).toHaveBeenCalledTimes(1);
  const updated = setSquads.mock.calls[0][0];
  return { result, updated, setAcdnErr };
};

/**
 * a date string some days from d. Tests use 2 days, not 1, so the result is
 * still outside the range even if dateTo_yyyyMMdd shifts a UTC date by a day
 * in your time zone.
 */
const dayStr = (d: Date, days: number) => dateTo_yyyyMMdd(addDays(d, days));

// ---------------------------------------------------------------------------

describe("OneToNSquads - validateSquads", () => {
  describe("all valid", () => {
    it("returns true, leaves every error blank and clears the accordion error once", () => {
      const { result, updated, setAcdnErr } = runValidate(makeTwoSquads());

      expect(result).toBe(true);
      updated.forEach((squad) => {
        errorFields.forEach((field) => expect(squad[field]).toBe(""));
        expect(squad.errClassName).toBe("");
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

    it("clears stale errors and the red highlight from a squad that is now valid", () => {
      const stale = Object.fromEntries(
        errorFields.map((field) => [field, "stale error"]),
      ) as Partial<squadType>;
      const { result, updated } = runValidate([
        makeSquad({ ...stale, errClassName: objErrClassName }),
      ]);

      expect(result).toBe(true);
      errorFields.forEach((field) => expect(updated[0][field]).toBe(""));
      expect(updated[0].errClassName).toBe("");
    });
  });

  describe("event", () => {
    it("sets 'Event not found' when event_id matches no event", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeSquad({ event_id: "evt_does_not_exist" }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].event_id_err).toBe(eventNotFoundMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Squad 1", eventNotFoundMsg));
    });
  });

  describe("squad name", () => {
    it.each([
      ["empty", ""],
      ["only spaces", "   "],
    ])("sets the required error when the name is %s", (_label, name) => {
      const { result, updated, setAcdnErr } = runValidate([
        makeSquad({ squad_name: name }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].squad_name_err).toBe(nameRequiredMsg);
      // a blank name has nothing to show, so the accordion says "Squads"
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Squads", nameRequiredMsg));
    });

    it("sets the duplicate error on the later squad only", () => {
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoSquads({ squad_name: "Morning" }, { squad_name: "Morning" }),
      );

      expect(result).toBe(false);
      expect(updated[0].squad_name_err).toBe("");
      expect(updated[1].squad_name_err).toBe(nameUsedMsg("Morning"));
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Morning", nameUsedMsg("Morning")),
      );
    });

    it("finds duplicates regardless of case and extra spaces", () => {
      const { updated } = runValidate(
        makeTwoSquads({ squad_name: "Early Bird" }, { squad_name: " early  BIRD " }),
      );

      expect(updated[1].squad_name_err).toBe(nameUsedMsg(" early  BIRD "));
    });
  });

  describe("games", () => {
    it("sets the 'less than' error when games is below the minimum", () => {
      const { updated } = runValidate([makeSquad({ games: minGames - 1 })]);
      expect(updated[0].games_err).toBe(gamesLowMsg);
    });

    it("limits games to the squad's event games, not maxGames", () => {
      const { result, updated } = runValidate([
        makeSquad({ games: event.games + 1 }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].games_err).toBe(gamesHighMsg(event.games));
    });

    it("accepts games equal to the event's games", () => {
      const { updated } = runValidate([makeSquad({ games: event.games })]);
      expect(updated[0].games_err).toBe("");
    });

    it("limits games to maxGames when the event is not found", () => {
      const { updated } = runValidate([
        makeSquad({ event_id: "evt_does_not_exist", games: maxGames + 1 }),
      ]);

      expect(updated[0].games_err).toBe(gamesHighMsg(maxGames));
    });

    it("uses each squad's own event for its games limit", () => {
      const eventsWithTwo = [
        { ...event, id: "evt_A", games: 3 },
        { ...event, id: "evt_B", games: 6 },
      ];
      const squads = makeTwoSquads(
        { event_id: "evt_A", games: 6 },
        { event_id: "evt_B", games: 6 },
      );
      const setSquads = jest.fn() as jest.Mock<void, [squadType[]]>;

      validateSquads(squads, setSquads, eventsWithTwo, jest.fn(), minDate, maxDate);

      const [first, second] = setSquads.mock.calls[0][0];
      expect(first.games_err).toBe(gamesHighMsg(3));
      expect(second.games_err).toBe("");
    });
  });

  describe("starting lane", () => {
    it.each([
      ["below 1", 0, startLowMsg],
      ["above the maximum", maxStartLane + 2, startHighMsg],
      ["even", 2, startEvenMsg],
    ])("sets the right error when the starting lane is %s", (_label, lane, msg) => {
      const { result, updated } = runValidate([makeSquad({ starting_lane: lane })]);

      expect(result).toBe(false);
      expect(updated[0].starting_lane_err).toBe(msg);
    });

    it("accepts the highest allowed starting lane", () => {
      const { updated } = runValidate([makeSquad({ starting_lane: maxStartLane })]);
      expect(updated[0].starting_lane_err).toBe("");
    });
  });

  describe("# of lanes", () => {
    it.each([
      ["below the minimum", minLaneCount - 2, laneLowMsg],
      ["above the maximum", maxLaneCount + 2, laneHighMsg],
      ["odd", minLaneCount + 1, laneOddMsg],
    ])("sets the right error when the # of lanes is %s", (_label, count, msg) => {
      const { result, updated } = runValidate([makeSquad({ lane_count: count })]);

      expect(result).toBe(false);
      expect(updated[0].lane_count_err).toBe(msg);
    });

    it("accepts the minimum and maximum # of lanes", () => {
      const { result } = runValidate(
        makeTwoSquads({ lane_count: minLaneCount }, { lane_count: maxLaneCount }),
      );
      expect(result).toBe(true);
    });
  });

  describe("date", () => {
    it("sets the required error when the date is blank", () => {
      const { result, updated, setAcdnErr } = runValidate([
        makeSquad({ squad_date_str: "" }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].squad_date_err).toBe(dateRequiredMsg);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Squad 1", dateRequiredMsg));
    });

    it("sets the invalid error when the date is not a date", () => {
      const { updated } = runValidate([makeSquad({ squad_date_str: "not a date" })]);
      expect(updated[0].squad_date_err).toBe(dateInvalidMsg);
    });

    it("sets the 'Earliest date' error before the tournament starts", () => {
      const { result, updated } = runValidate([
        makeSquad({ squad_date_str: dayStr(minDate, -2) }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].squad_date_err).toBe(earliestMsg(minDate));
    });

    it("sets the 'Latest date' error after the tournament ends", () => {
      // the old test used the day after the START date, which only fails
      // for a one-day tournament
      const { result, updated } = runValidate([
        makeSquad({ squad_date_str: dayStr(maxDate, 2) }),
      ]);

      expect(result).toBe(false);
      expect(updated[0].squad_date_err).toBe(latestMsg(maxDate));
    });

    it("accepts the tournament's first and last days", () => {
      const { result } = runValidate(
        makeTwoSquads(
          { squad_date_str: tmntStartDateStr },
          { squad_date_str: tmntEndDateStr },
        ),
      );
      expect(result).toBe(true);
    });

    it("uses today as both the earliest and latest date when no dates are given", () => {
      const today = startOfDayFromString(todayStr) as Date;

      const valid = runValidate([makeSquad({ squad_date_str: todayStr })], "defaults");
      expect(valid.updated[0].squad_date_err).toBe("");

      const early = runValidate(
        [makeSquad({ squad_date_str: dayStr(today, -2) })],
        "defaults",
      );
      expect(early.updated[0].squad_date_err).toBe(earliestMsg(today));

      const late = runValidate(
        [makeSquad({ squad_date_str: dayStr(today, 2) })],
        "defaults",
      );
      expect(late.updated[0].squad_date_err).toBe(latestMsg(today));
    });
  });

  describe("start time", () => {
    it("does not require a time when there is only one squad", () => {
      const { result, updated } = runValidate([makeSquad({ squad_time: "" })]);

      expect(result).toBe(true);
      expect(updated[0].squad_time_err).toBe("");
    });

    it("clears a stale time error when there is only one squad", () => {
      const { updated } = runValidate([
        makeSquad({ squad_time: "09:00", squad_time_err: timeRequiredMsg }),
      ]);

      expect(updated[0].squad_time_err).toBe("");
    });

    it("requires a time on every squad when there is more than one", () => {
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoSquads({}, { squad_time: "" }),
      );

      expect(result).toBe(false);
      expect(updated[0].squad_time_err).toBe("");
      expect(updated[1].squad_time_err).toBe(timeRequiredMsg);
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Squad 2", timeRequiredMsg));
    });

    it("sets the duplicate error on the later squad only, when two squads share a date and time", () => {
      const { result, updated } = runValidate(
        makeTwoSquads({ squad_time: "10:00" }, { squad_time: "10:00" }),
      );

      expect(result).toBe(false);
      expect(updated[0].squad_time_err).toBe("");
      expect(updated[1].squad_time_err).toBe(timeUsedMsg(tmntStartDateStr, "10:00"));
    });

    it("accepts the same time on different dates", () => {
      // a 6-day tournament, so the two dates can differ
      const { result, updated } = runValidate(
        makeTwoSquads(
          { squad_time: "10:00", squad_date_str: tmntStartDateStr },
          { squad_time: "10:00", squad_date_str: dayStr(minDate, 2) },
        ),
        { min: minDate, max: addDays(minDate, 5) },
      );

      expect(result).toBe(true);
      expect(updated[1].squad_time_err).toBe("");
    });
  });

  describe("several errors", () => {
    it("sets every error on a squad, and the accordion shows the first one found", () => {
      const { updated, setAcdnErr } = runValidate([
        makeSquad({
          event_id: "evt_does_not_exist",
          squad_name: "Many Errors",
          games: minGames - 1,
          starting_lane: 2,
          lane_count: 3,
          squad_date_str: "",
        }),
      ]);

      expect(updated[0].event_id_err).toBe(eventNotFoundMsg);
      expect(updated[0].games_err).toBe(gamesLowMsg);
      expect(updated[0].starting_lane_err).toBe(startEvenMsg);
      expect(updated[0].lane_count_err).toBe(laneOddMsg);
      expect(updated[0].squad_date_err).toBe(dateRequiredMsg);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(
        acdnErr("Many Errors", eventNotFoundMsg),
      );
    });

    it("sets errors on every invalid squad, and the accordion shows the first squad's error", () => {
      const { result, updated, setAcdnErr } = runValidate(
        makeTwoSquads({ games: minGames - 1 }, { lane_count: 3 }),
      );

      expect(result).toBe(false);
      expect(updated[0].games_err).toBe(gamesLowMsg);
      expect(updated[1].lane_count_err).toBe(laneOddMsg);
      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe(objErrClassName);
      expect(setAcdnErr).toHaveBeenCalledTimes(1);
      expect(setAcdnErr).toHaveBeenCalledWith(acdnErr("Squad 1", gamesLowMsg));
    });

    it("only highlights the squads that have errors", () => {
      const { updated } = runValidate(makeTwoSquads({ lane_count: 3 }, {}));

      expect(updated[0].errClassName).toBe(objErrClassName);
      expect(updated[1].errClassName).toBe("");
    });

    it.each([
      ["event_id", "event_id_err", "evt_does_not_exist"],
      ["games", "games_err", minGames - 1],
      ["starting_lane", "starting_lane_err", 2],
      ["lane_count", "lane_count_err", 3],
      ["squad_date_str", "squad_date_err", ""],
    ] as [keyof squadType, keyof squadType, string | number][])(
      "does not carry a %s error over to the next squad",
      (field, errField, badValue) => {
        const { updated } = runValidate(
          makeTwoSquads({ [field]: badValue } as Partial<squadType>, {}),
        );

        expect(updated[0][errField]).not.toBe("");
        expect(updated[1][errField]).toBe("");
        expect(updated[1].errClassName).toBe("");
      },
    );
  });

  describe("what it passes to setSquads", () => {
    it("keeps every squad, in order, with only its error fields changed", () => {
      const squads = makeTwoSquads({ lane_count: 3 }, {});

      const { updated } = runValidate(squads);

      expect(updated.map((s) => s.id)).toEqual([squadId1, squadId2]);
      const anyErrors = Object.fromEntries(
        [...errorFields, "errClassName"].map((f) => [f, expect.any(String)]),
      );
      updated.forEach((squad, i) =>
        expect(squad).toEqual({ ...squads[i], ...anyErrors }),
      );
    });

    it("does not change the squads passed in", () => {
      const squads = makeTwoSquads({ squad_name: "" }, {});
      const before = cloneDeep(squads);

      const { updated } = runValidate(squads);

      expect(squads).toEqual(before);
      expect(updated[0]).not.toBe(squads[0]);
    });
  });
});
