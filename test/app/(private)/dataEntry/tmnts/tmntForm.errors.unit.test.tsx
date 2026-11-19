// test/app/(private)/dataEntry/tmnts/tmntForm.errors.unit.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/errors.tsx
import {
  acdnErrClassName,
  getAcdnErrMsg,
  getBrktErrMsg,
  getElimErrMsg,
  isDuplicateDateTime,
  isDuplicateDivName,
  isDuplicateEventName,
  isDuplicateSquadName,
  noAcdnErr,
  objErrClassName,
} from "@/app/(private)/dataEntry/tmntForm/errors";
import {
  initBrkt,
  initDiv,
  initElim,
  initEvent,
  initSquad,
} from "@/lib/db/initVals";
import type {
  brktType,
  divType,
  elimType,
  eventType,
  squadType,
} from "@/lib/types/types";

// Give the CSS module known class names so the exported constants can be checked
// no matter how the Jest config maps .css files.
jest.mock("@/app/(private)/dataEntry/tmntForm/tmntForm.module.css", () => ({
  __esModule: true,
  default: { objError: "objError", acdnError: "acdnError" },
}));

describe("tmntForm - errors", () => {
  describe("exported constants", () => {
    it("objErrClassName maps to the objError CSS class", () => {
      expect(objErrClassName).toBe("objError");
    });

    it("acdnErrClassName maps to the acdnError CSS class", () => {
      expect(acdnErrClassName).toBe("acdnError");
    });

    it("noAcdnErr has an empty class name and message", () => {
      expect(noAcdnErr).toEqual({ errClassName: "", message: "" });
    });
  });

  describe("getAcdnErrMsg", () => {
    it("formats object name and error message", () => {
      expect(getAcdnErrMsg("Database", "Connection failed")).toBe(
        ": Error in Database - Connection failed",
      );
    });

    it("handles an empty object name", () => {
      expect(getAcdnErrMsg("", "Connection failed")).toBe(
        ": Error in  - Connection failed",
      );
    });

    it("handles an empty error message", () => {
      expect(getAcdnErrMsg("Database", "")).toBe(": Error in Database - ");
    });
  });

  // ---------------------------------------------------------------------------
  // isDuplicateEventName / isDuplicateDivName / isDuplicateSquadName all share
  // the same logic, so one table of cases runs against all three.
  // Rows are [id, name, sort_order].
  // ---------------------------------------------------------------------------
  type Row = [id: string, name: string, sortOrder: number];
  type NameChecker = (rows: Row[], target: Row) => boolean;

  const checkEvent: NameChecker = (rows, [id, name, sort_order]) =>
    isDuplicateEventName(
      rows.map(
        ([rId, rName, rSort]): eventType => ({
          ...initEvent,
          id: rId,
          event_name: rName,
          sort_order: rSort,
        }),
      ),
      { ...initEvent, id, event_name: name, sort_order },
    );

  const checkDiv: NameChecker = (rows, [id, name, sort_order]) =>
    isDuplicateDivName(
      rows.map(
        ([rId, rName, rSort]): divType => ({
          ...initDiv,
          id: rId,
          div_name: rName,
          sort_order: rSort,
        }),
      ),
      { ...initDiv, id, div_name: name, sort_order },
    );

  const checkSquad: NameChecker = (rows, [id, name, sort_order]) =>
    isDuplicateSquadName(
      rows.map(
        ([rId, rName, rSort]): squadType => ({
          ...initSquad,
          id: rId,
          squad_name: rName,
          sort_order: rSort,
        }),
      ),
      { ...initSquad, id, squad_name: name, sort_order },
    );

  describe.each([
    ["isDuplicateEventName", checkEvent],
    ["isDuplicateDivName", checkDiv],
    ["isDuplicateSquadName", checkSquad],
  ])("%s", (_label, check) => {
    const existing: Row[] = [
      ["id_1", "Singles", 1],
      ["id_2", "Doubles", 2],
    ];

    it("returns false for a unique name", () => {
      expect(check(existing, ["id_new", "Trios", 3])).toBe(false);
    });

    it("returns true when an earlier item has the same name", () => {
      expect(check(existing, ["id_new", "Singles", 3])).toBe(true);
    });

    it("ignores case", () => {
      expect(check(existing, ["id_new", "sINGLES", 3])).toBe(true);
    });

    it("ignores leading/trailing spaces on both sides", () => {
      const rows: Row[] = [["id_1", "  Singles ", 1]];
      expect(check(rows, ["id_new", " Singles  ", 2])).toBe(true);
    });

    it("collapses repeated inner spaces in the name being checked", () => {
      const rows: Row[] = [["id_1", "Mixed Doubles", 1]];
      expect(check(rows, ["id_new", "Mixed    Doubles", 2])).toBe(true);
    });

    it("does not count the item itself (same id) as a duplicate", () => {
      expect(check(existing, ["id_1", "Singles", 1])).toBe(false);
    });

    it("only compares against items with a lower or equal sort_order", () => {
      // "Doubles" exists, but at sort_order 2, after the target at 1
      expect(check(existing, ["id_new", "Doubles", 1])).toBe(false);
    });

    it("treats an item with the same sort_order and a different id as a duplicate", () => {
      expect(check(existing, ["id_new", "Doubles", 2])).toBe(true);
    });

    it("finds an earlier duplicate when the array is not sorted by sort_order", () => {
      const unsorted: Row[] = [
        ["id_3", "Trios", 3],
        ["id_2", "Doubles", 2],
        ["id_1", "Singles", 1],
      ];
      expect(check(unsorted, ["id_new", "Singles", 4])).toBe(true);
    });

    it("ignores a later duplicate when the array is not sorted by sort_order", () => {
      const unsorted: Row[] = [
        ["id_3", "Trios", 3],
        ["id_1", "Singles", 1],
      ];
      expect(check(unsorted, ["id_new", "Trios", 2])).toBe(false);
    });

    it("compares array names case-insensitively", () => {
      const rows: Row[] = [["id_1", "SINGLES", 1]];
      expect(check(rows, ["id_new", "Singles", 2])).toBe(true);
    });

    it("collapses repeated inner spaces in array names", () => {
      const rows: Row[] = [["id_1", "Mixed    Doubles", 1]];
      expect(check(rows, ["id_new", "Mixed Doubles", 2])).toBe(true);
    });

    it("returns false for an empty name", () => {
      const rows: Row[] = [["id_1", "", 1]];
      expect(check(rows, ["id_new", "", 2])).toBe(false);
    });

    it("returns false for a whitespace-only name", () => {
      const rows: Row[] = [["id_1", "", 1]];
      expect(check(rows, ["id_new", "   ", 2])).toBe(false);
    });

    it("returns false for an empty array", () => {
      expect(check([], ["id_new", "Singles", 1])).toBe(false);
    });
  });

  describe("getElimErrMsg", () => {
    const allErrs: Partial<elimType> = {
      fee_err: "Fee error",
      games_err: "Games error",
      start_err: "Start error",
    };

    it("returns an empty string when there are no errors", () => {
      expect(getElimErrMsg({ ...initElim })).toBe("");
    });

    it.each([
      ["fee_err", "Fee error"],
      ["games_err", "Games error"],
      ["start_err", "Start error"],
    ] as const)("returns %s when it is the only error", (field, msg) => {
      expect(getElimErrMsg({ ...initElim, [field]: msg })).toBe(msg);
    });

    // checks priority: fee > games > start
    it.each([
      [[], "Fee error"],
      [["fee_err"], "Games error"],
      [["fee_err", "games_err"], "Start error"],
    ] as const)(
      "with all errors set and %j cleared, returns %s",
      (cleared, expected) => {
        const elim: elimType = { ...initElim, ...allErrs };
        cleared.forEach((f) => (elim[f] = ""));
        expect(getElimErrMsg(elim)).toBe(expected);
      },
    );
  });

  describe("getBrktErrMsg", () => {
    // listed in the order getBrktErrMsg checks them
    const priority = [
      ["fee_err", "Fee error"],
      ["first_err", "First error"],
      ["fsa_err", "FSA error"],
      ["games_err", "Games error"],
      ["players_err", "Players error"],
      ["second_err", "Second error"],
      ["start_err", "Start error"],
    ] as const;

    const allErrs = Object.fromEntries(priority) as Partial<brktType>;

    it("returns an empty string when there are no errors", () => {
      expect(getBrktErrMsg({ ...initBrkt })).toBe("");
    });

    it.each(priority)("returns %s when it is the only error", (field, msg) => {
      expect(getBrktErrMsg({ ...initBrkt, [field]: msg })).toBe(msg);
    });

    // with all errors set, clear them one at a time from the top of the list;
    // the next one down should be returned each time
    it.each(priority.map((p, i) => [p[0], i] as const))(
      "returns %s when every error above it is cleared",
      (field, index) => {
        const brkt: brktType = { ...initBrkt, ...allErrs };
        priority.slice(0, index).forEach(([f]) => (brkt[f] = ""));
        expect(getBrktErrMsg(brkt)).toBe(allErrs[field]);
      },
    );
  });

  describe("isDuplicateDateTime", () => {
    const makeSquad = (
      id: string,
      sort_order: number,
      squad_date_str: string,
      squad_time: string,
    ): squadType => ({
      ...initSquad,
      id,
      sort_order,
      squad_date_str,
      squad_time,
    });

    const existing: squadType[] = [
      makeSquad("sqd_1", 1, "2026-11-14", "10:00"),
      makeSquad("sqd_2", 2, "2026-11-14", "14:00"),
    ];

    it("returns true when an earlier squad has the same date and time", () => {
      const squad = makeSquad("sqd_new", 3, "2026-11-14", "10:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(true);
    });

    it("returns false when the date matches but the time differs", () => {
      const squad = makeSquad("sqd_new", 3, "2026-11-14", "18:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(false);
    });

    it("returns false when the time matches but the date differs", () => {
      const squad = makeSquad("sqd_new", 3, "2026-11-15", "10:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(false);
    });

    it("does not count the squad itself as a duplicate", () => {
      expect(isDuplicateDateTime(existing, existing[0])).toBe(false);
    });

    it("treats a squad with the same sort_order and a different id as a duplicate", () => {
      const squad = makeSquad("sqd_new", 1, "2026-11-14", "10:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(true);
    });

    it("does not count a squad with the same id as a duplicate, even with a lower sort_order", () => {
      // same id as sqd_1, e.g. a stale copy of the squad being edited
      const squad = makeSquad("sqd_1", 5, "2026-11-14", "10:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(false);
    });

    it("finds an earlier duplicate when the array is not sorted by sort_order", () => {
      const unsorted = [existing[1], existing[0]];
      const squad = makeSquad("sqd_new", 3, "2026-11-14", "10:00");
      expect(isDuplicateDateTime(unsorted, squad)).toBe(true);
    });

    it("ignores squads with a higher sort_order", () => {
      // matches sqd_2 (sort_order 2), but the target comes first
      const squad = makeSquad("sqd_new", 1, "2026-11-14", "14:00");
      expect(isDuplicateDateTime(existing, squad)).toBe(false);
    });

    it("returns false for an empty array", () => {
      const squad = makeSquad("sqd_new", 1, "2026-11-14", "10:00");
      expect(isDuplicateDateTime([], squad)).toBe(false);
    });
  });
});

// import {
//   getAcdnErrMsg,
//   getBrktErrMsg,
//   getElimErrMsg,
//   isDuplicateDateTime,
//   isDuplicateDivName,
//   isDuplicateEventName,
//   isDuplicateSquadName,
// } from "@/app/(private)/dataEntry/tmntForm/errors";
// import { mockEvents } from "../../../../mocks/tmnts/singlesAndDoubles/mockEvents";
// import {
//   initBrkt,
//   initDiv,
//   initElim,
//   initEvent,
//   initSquad,
// } from "@/lib/db/initVals";
// import { mockDivs } from "../../../../mocks/tmnts/twoDivs/mockDivs";
// import { mockSquads } from "../../../../mocks/tmnts/singlesAndDoubles/mockSquads";
// import { startOfDayFromString, todayStr } from "@/lib/dateTools";
// import { startOfToday } from "date-fns";

// describe('tmntDataForm - errors', () => {

//   describe("getAcdnErrMsg", () => {
//     // Returns formatted error message for valid object name and error message
//     it("should return formatted error message when given valid object name and error message", () => {
//       const objName = "Database";
//       const objErrMsg = "Connection failed";
//       const result = getAcdnErrMsg(objName, objErrMsg);
//       expect(result).toBe(": Error in Database - Connection failed");
//     });

//     // Handles empty object name
//     it("should return formatted error message when object name is empty", () => {
//       const objName = "";
//       const objErrMsg = "Connection failed";
//       const result = getAcdnErrMsg(objName, objErrMsg);
//       expect(result).toBe(": Error in  - Connection failed");
//     });

//     // Handles typical object names and error messages correctly
//     it("should return formatted error message when given valid object name and error message", () => {
//       const objName = "Database";
//       const objErrMsg = "Connection failed";
//       const result = getAcdnErrMsg(objName, objErrMsg);
//       expect(result).toBe(": Error in Database - Connection failed");
//     });

//     // Works with standard string inputs
//     it("should return formatted error message when given valid object name and error message", () => {
//       const objName = "Database";
//       const objErrMsg = "Connection failed";
//       const result = getAcdnErrMsg(objName, objErrMsg);
//       expect(result).toBe(": Error in Database - Connection failed");
//     });
//   });

//   describe("isDuplicateEventName", () => {
//     const arrOfEvents = [...mockEvents];

//     // returns false for unique event names
//     it("should return false for unique event names", () => {
//       const testEvent = {
//         ...initEvent,
//         id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
//         sort_order: 3,
//         event_name: "Test Event",
//       };
//       const result = isDuplicateEventName(arrOfEvents, testEvent);
//       expect(result).toBe(false);
//     });

//     // returns false for same event name but sort order matches
//     it("should return false for same event name but sort order matches", () => {
//       const testEvent = {
//         ...initEvent,
//         id: "evt_6ff6774e94884658be5bdebc68a6aa7c",
//         sort_order: 1,
//         event_name: "Singles",
//       };
//       const result = isDuplicateEventName(arrOfEvents, testEvent);
//       expect(result).toBe(false);
//     });

//     // returns true for duplicate event names with different IDs
//     it("should return true for duplicate event names with different IDs", () => {
//       const testEvent = {
//         ...initEvent,
//         id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
//         sort_order: 3,
//       };
//       const result = isDuplicateEventName(arrOfEvents, testEvent);
//       expect(result).toBe(true);
//     });

//     // returns true for duplicate event names regardless of case
//     it("should return true for duplicate event names regardless of case", () => {
//       const testEvent = {
//         ...initEvent,
//         id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
//         sort_order: 3,
//         event_name: "singles",
//       };
//       const result = isDuplicateEventName(arrOfEvents, testEvent);
//       expect(result).toBe(true);
//     });

//     // handles event names with leading/trailing spaces
//     it("should return true for duplicate event names with leading/trailing spaces", () => {
//       const arrOfTestEvents = [...mockEvents];
//       arrOfTestEvents[0].event_name = "Singles ";
//       const testEvent = {
//         ...initEvent,
//         id: "evt_9a58f0a486cb4e6c92ca3348702b1a62",
//         sort_order: 3,
//         event_name: " Singles",
//       };
//       const result = isDuplicateEventName(arrOfTestEvents, testEvent);
//       expect(result).toBe(true);
//     });
//   });

//   describe("isDuplicateDivName", () => {
//     const arrOfDivs = [...mockDivs];

//     // returns false for unique div names
//     it("should return false for unique div names", () => {
//       const testDiv = {
//         ...initDiv,
//         id: "div_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         div_name: "Test Div",
//       };
//       const result = isDuplicateDivName(arrOfDivs, testDiv);
//       expect(result).toBe(false);
//     });

//     // returns false for same div name but sort order matches
//     it("should return false for same div name but sort order matches", () => {
//       const testDiv = {
//         ...initDiv,
//         id: "div_578834e04e5e4885bbae79229d8b96e8",
//         sort_order: 1,
//         div_name: "Scratch",
//       };
//       const result = isDuplicateDivName(arrOfDivs, testDiv);
//       expect(result).toBe(false);
//     });

//     // returns true for duplicate div names with different IDs
//     it("should return true for duplicate div names with different IDs", () => {
//       const testDiv = {
//         ...initDiv,
//         id: "div_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         div_name: "Scratch",
//       };
//       const result = isDuplicateDivName(arrOfDivs, testDiv);
//       expect(result).toBe(true);
//     });

//     // returns true for duplicate div names regardless of case
//     it("should return true for duplicate div names regardless of case", () => {
//       const testDiv = {
//         ...initDiv,
//         id: "div_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         div_name: "scratch",
//       };
//       const result = isDuplicateDivName(arrOfDivs, testDiv);
//       expect(result).toBe(true);
//     });

//     // handles div names with leading/trailing spaces
//     it("should return true for duplicate div names with leading/trailing spaces", () => {
//       const arrOfTestDivs = [...mockDivs];
//       arrOfTestDivs[0].div_name = "Scratch ";
//       const testDiv = {
//         ...initDiv,
//         id: "div_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         div_name: " Scratch",
//       };
//       const result = isDuplicateDivName(arrOfTestDivs, testDiv);
//       expect(result).toBe(true);
//     });
//   });

//   describe("isDuplicateSquadName", () => {
//     const arrOfSquads = [...mockSquads];

//     // returns false for unique squad names
//     it("should return false for unique squad names", () => {
//       const testSquad = {
//         ...initSquad,
//         id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         squad_name: "Test Squad",      
//       };
//       const result = isDuplicateSquadName(arrOfSquads, testSquad);
//       expect(result).toBe(false);
//     });

//     // returns false for same squad name but sort order matches
//     it("should return false for same squad name but sort order matches", () => {
//       const testSquad = {
//         ...initSquad,
//         id: "sqd_e214ede16c5c46a4950e9a48bfeef61a",
//         sort_order: 1,
//         event_name: "Singles",
//       };
//       const result = isDuplicateSquadName(arrOfSquads, testSquad);
//       expect(result).toBe(false);
//     });

//     // returns true for duplicate squad names with different IDs
//     it("should return true for duplicate squad names with different IDs", () => {
//       const testSquad = {
//         ...initSquad,
//         id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         squad_name: "Singles",      
//       };
//       const result = isDuplicateSquadName(arrOfSquads, testSquad);
//       expect(result).toBe(true);
//     });

//     // returns true for duplicate squad names regardless of case
//     it("should return true for duplicate squad names regardless of case", () => {
//       const testSquad = {
//         ...initSquad,
//         id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         squad_name: "singles",
//       };
//       const result = isDuplicateSquadName(arrOfSquads, testSquad);
//       expect(result).toBe(true);
//     });

//     // handles squad names with leading/trailing spaces
//     it("should return true for duplicate squad names with leading/trailing spaces", () => {
//       const arrOfTestSquads = [...mockSquads];
//       arrOfTestSquads[0].squad_name = "Singles ";
//       const testSquad = {
//         ...initSquad,
//         id: "sqd_1f42042f9ef24029a0a2d48cc276a087",
//         sort_order: 3,
//         squad_name: " Singles",
//       };
//       const result = isDuplicateSquadName(arrOfTestSquads, testSquad);
//       expect(result).toBe(true);
//     });
//   });

//   describe("getElimErrMsg", () => {
//     // returns fee_err when fee_err is present
//     it("should return fee_err when fee_err is present", () => {
//       const elim = {
//         ...initElim,
//         fee_err: "Fee error",
//       };
//       const result = getElimErrMsg(elim);
//       expect(result).toBe("Fee error");
//     });

//     // returns fee_err when all error fields are present
//     it("should return fee_err when all error fields are present", () => {
//       const elim = {
//         ...initElim,
//         fee_err: "Fee error",
//         games_err: "Games error",
//         start_err: "Start error",
//       };
//       const result = getElimErrMsg(elim);
//       expect(result).toBe("Fee error");
//     });

//     // returns games_err when games_err is present and fee_err is absent
//     it("should return games_err when games_err is present and fee_err is absent", () => {
//       const elim = {
//         ...initElim,
//         games_err: "Games error",
//       };
//       const result = getElimErrMsg(elim);
//       expect(result).toBe("Games error");
//     });

//     // returns start_err when start_err is present and both fee_err and games_err are absent
//     it("should return start_err when start_err is present and both fee_err and games_err are absent", () => {
//       const elim = {
//         ...initElim,
//         start_err: "Start error",
//       };
//       const result = getElimErrMsg(elim);
//       expect(result).toBe("Start error");
//     });

//     // returns an empty string when all error fields are absent
//     it("should return empty string when all error fields are absent", () => {
//       const elim = {
//         ...initElim,
//       };
//       const result = getElimErrMsg(elim);
//       expect(result).toBe("");
//     });
//   });

//   describe("getBrktErrMsg", () => {
//     // Returns fee_err when brkt.fee_err is present
//     it("should return fee_err when brkt.fee_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         fee_err: "Fee error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Fee error");
//     });

//     // Returns first_err when brkt.first_err is present
//     it("should return first_err when brkt.first_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         first_err: "First error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("First error");
//     });

//     // Returns fsa_err when brkt.fsa_err is present
//     it("should return fsa_err when brkt.fsa_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         fsa_err: "FSA error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("FSA error");
//     });

//     // Returns games_err when brkt.games_err is present
//     it("should return games_err when brkt.games_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         games_err: "Games error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Games error");
//     });

//     // Returns players_err when brkt.players_err is present
//     it("should return players_err when brkt.players_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         players_err: "Players error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Players error");
//     });

//     // Returns second_err when brkt.second_err is present
//     it("should return second_err when brkt.second_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         second_err: "Second error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Second error");
//     });

//     // Returns start_err when brkt.start_err is present
//     it("should return start_err when brkt.start_err is present", () => {
//       const brkt = {
//         ...initBrkt,
//         start_err: "Start error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Start error");
//     });

//     // Returns an empty string when no errors are present
//     it("should return empty string when no errors are present", () => {
//       const brkt = {
//         ...initBrkt,
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("");
//     });

//     // Returns fee_err when multiple errors are present and fee_err exists
//     it("should return fee_err when both fee_err and games_err are present", () => {
//       const brkt = {
//         ...initBrkt,
//         fee_err: "Fee error",
//         games_err: "Games error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("Fee error");
//     });

//     // Returns first_err when first_err and players_err are present, but no fee_err
//     it("should return first_err when first_err and players_err are present and fee_err is absent", () => {
//       const brkt = {
//         ...initBrkt,
//         first_err: "First error",
//         players_err: "Players error",
//       };
//       const result = getBrktErrMsg(brkt);
//       expect(result).toBe("First error");
//     });
    
//   });

//   describe('isDuplicateDateTime', () => {
//     const arrOfSquads = [...mockSquads];

//     // Returns true when a duplicate date and time is found in the array
//     it('should return true when a duplicate date and time is found in the array', () => {
//       const squad = {
//         ...initSquad,
//         sort_order: 3,  
//         squad_date: startOfToday(),
//         squad_date_str: todayStr,
//         squad_time: '10:00',
//       } 
//       const result = isDuplicateDateTime(arrOfSquads, squad);
//       expect(result).toBe(true);
//     });

//     // Returns false when no duplicate date and time is found in the array
//     it('should return false when no duplicate date and time is found in the array', () => {    
//       const squad = {
//         ...initSquad,
//         sort_order: 3,  
//         squad_date: startOfDayFromString('2023-10-01') as Date, 
//         squad_date_str: '2023-10-01',
//         squad_time: '11:00',
//       } 
//       const result = isDuplicateDateTime(arrOfSquads, squad);
//       expect(result).toBe(false);
//     });

//       // Returns false when no sort order is matched, even if the date and time is the same
//       it('should return false when no duplicate date and time is found in the array', () => {    
//         const squad = {
//           ...initSquad,
//           sort_order: 1,  
//           squad_date: startOfToday(),
//           squad_date_str: todayStr,
//           squad_time: '10:00',
//         } 
//         const result = isDuplicateDateTime(arrOfSquads, squad);
//         expect(result).toBe(false);
//       });
    
//   });  
// });


