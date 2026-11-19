// test/app/(private)/dataEntry/tmnts/tmntTools.test.tsx
// tests for src/app/(private)/dataEntry/tmntForm/tmntTools.tsx
import {
  getBlankTmntFullData,
  getSquadStage,
} from "@/app/(private)/dataEntry/tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";
import { getJustStage } from "@/lib/db/stages/dbStages";
import {
  blankDiv,
  blankEvent,
  blankFullStage,
  blankSquad,
  blankTmnt,
  initDiv,
  initEvent,
  initSquad,
  initTmnt,
} from "@/lib/db/initVals";

// mock btDbUuid so ids are predictable: "<prefix>_<n>"
// (a plain function, not jest.fn, so a resetMocks setting can't wipe it)
jest.mock("@/lib/uuid", () => {
  let counters: Record<string, number> = {};
  let totalCalls = 0;

  return {
    __esModule: true,
    btDbUuid: (prefix: string) => {
      totalCalls++;
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}_${counters[prefix]}`;
    },
    // test helpers, not used in app code
    __resetCounters: () => {
      counters = {};
      totalCalls = 0;
    },
    __totalCalls: () => totalCalls,
  };
});

// mock getJustStage so getSquadStage doesn't hit the real DB layer
jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  getJustStage: jest.fn(),
}));

const uuidMod = jest.requireMock("@/lib/uuid") as {
  __resetCounters: () => void;
  __totalCalls: () => number;
};

const mockGetJustStage = getJustStage as jest.MockedFunction<
  typeof getJustStage
>;
type JustStageResult = Awaited<ReturnType<typeof getJustStage>>;
const stageResult = (stage: SquadStage) =>
  ({ stage }) as unknown as JustStageResult;

describe("tmntTools.tsx", () => {
  beforeEach(() => {
    uuidMod.__resetCounters();
    jest.clearAllMocks();
  });

  describe("getBlankTmntFullData - initialize = true (default)", () => {
    it("returns empty arrays for all entry and result data", () => {
      const blank = getBlankTmntFullData();

      expect(blank.brktEntries).toEqual([]);
      expect(blank.brktSeeds).toEqual([]);
      expect(blank.divEntries).toEqual([]);
      expect(blank.elimEntries).toEqual([]);
      expect(blank.oneBrkts).toEqual([]);
      expect(blank.players).toEqual([]);
      expect(blank.potEntries).toEqual([]);
      expect(blank.moneys).toEqual([]);
    });

    it("returns empty brkts, elims and pots", () => {
      const blank = getBlankTmntFullData();

      expect(blank.brkts).toEqual([]);
      expect(blank.elims).toEqual([]);
      expect(blank.pots).toEqual([]);
    });

    it("uses the initialize values for tmnt, event, div, squad and stage, plus ids", () => {
      const blank = getBlankTmntFullData();

      expect(blank.tmnt).toEqual({ ...initTmnt, id: blank.tmnt.id });
      expect(blank.events).toEqual([
        { ...initEvent, id: blank.events[0].id, tmnt_id: blank.tmnt.id },
      ]);
      expect(blank.divs).toEqual([
        { ...initDiv, id: blank.divs[0].id, tmnt_id: blank.tmnt.id },
      ]);
      expect(blank.squads).toEqual([
        { ...initSquad, id: blank.squads[0].id, event_id: blank.events[0].id },
      ]);
      expect(blank.stage).toEqual({
        ...blankFullStage,
        id: blank.stage.id,
        squad_id: blank.squads[0].id,
      });
    });

    it("creates lanes 1 and 2, both in use", () => {
      const blank = getBlankTmntFullData();

      expect(blank.lanes).toHaveLength(2);
      expect(blank.lanes.map((l) => l.lane_number)).toEqual([1, 2]);
      expect(blank.lanes.every((l) => l.in_use)).toBe(true);
    });

    it("assigns ids with the right prefixes", () => {
      const blank = getBlankTmntFullData();

      expect(blank.tmnt.id).toMatch(/^tmt_/);
      expect(blank.events[0].id).toMatch(/^evt_/);
      expect(blank.divs[0].id).toMatch(/^div_/);
      expect(blank.squads[0].id).toMatch(/^sqd_/);
      expect(blank.stage.id).toMatch(/^stg_/);
      blank.lanes.forEach((lane) => expect(lane.id).toMatch(/^lan_/));
    });

    it("gives every object a different id", () => {
      const blank = getBlankTmntFullData();
      const ids = [
        blank.tmnt.id,
        blank.events[0].id,
        blank.divs[0].id,
        blank.squads[0].id,
        blank.stage.id,
        ...blank.lanes.map((l) => l.id),
      ];

      expect(new Set(ids).size).toBe(ids.length);
    });

    it("links every foreign key to the matching parent id", () => {
      const blank = getBlankTmntFullData();
      const squadId = blank.squads[0].id;

      expect(blank.events[0].tmnt_id).toBe(blank.tmnt.id);
      expect(blank.divs[0].tmnt_id).toBe(blank.tmnt.id);
      expect(blank.squads[0].event_id).toBe(blank.events[0].id);
      // the old code set this before regenerating the squad id, leaving a stale id
      expect(blank.stage.squad_id).toBe(squadId);
      blank.lanes.forEach((lane) => expect(lane.squad_id).toBe(squadId));
    });

    it("returns new ids and new objects on each call", () => {
      const a = getBlankTmntFullData();
      const b = getBlankTmntFullData();

      expect(a.tmnt.id).not.toBe(b.tmnt.id);
      expect(a.events[0].id).not.toBe(b.events[0].id);
      expect(a.divs[0].id).not.toBe(b.divs[0].id);
      expect(a.squads[0].id).not.toBe(b.squads[0].id);
      expect(a.stage.id).not.toBe(b.stage.id);
      expect(a.lanes[0].id).not.toBe(b.lanes[0].id);

      expect(a.tmnt).not.toBe(b.tmnt);
      expect(a.stage).not.toBe(b.stage);
      expect(a.events[0]).not.toBe(b.events[0]);
      expect(a.divs[0]).not.toBe(b.divs[0]);
      expect(a.squads[0]).not.toBe(b.squads[0]);
      expect(a.lanes[0]).not.toBe(b.lanes[0]);
    });

    it("does not share brkts, elims or pots arrays between calls", () => {
      const a = getBlankTmntFullData();
      const b = getBlankTmntFullData();

      expect(a.brkts).not.toBe(b.brkts);
      expect(a.elims).not.toBe(b.elims);
      expect(a.pots).not.toBe(b.pots);
    });

    it("changing the result does not change initVals or the next result", () => {
      const tmntName = initTmnt.tmnt_name;
      const eventName = initEvent.event_name;

      const blank = getBlankTmntFullData();
      blank.tmnt.tmnt_name = "changed";
      blank.events[0].event_name = "changed";
      blank.pots.push({} as (typeof blank.pots)[number]);

      expect(initTmnt.tmnt_name).toBe(tmntName);
      expect(initEvent.event_name).toBe(eventName);
      expect(getBlankTmntFullData().pots).toEqual([]);
    });
  });

  describe("getBlankTmntFullData - initialize = false", () => {
    it("uses the blank values for tmnt, event, div, squad and stage", () => {
      const blank = getBlankTmntFullData(false);

      expect(blank.tmnt).toEqual(blankTmnt);
      expect(blank.events).toEqual([blankEvent]);
      expect(blank.divs).toEqual([blankDiv]);
      expect(blank.squads).toEqual([blankSquad]);
      expect(blank.stage).toEqual(blankFullStage);
    });

    it("leaves ids, foreign keys and dates blank", () => {
      const blank = getBlankTmntFullData(false);

      expect(blank.tmnt.id).toBe("");
      expect(blank.tmnt.start_date_str).toBe("");
      expect(blank.tmnt.end_date_str).toBe("");
      expect(blank.events[0].id).toBe("");
      expect(blank.events[0].tmnt_id).toBe("");
      expect(blank.divs[0].id).toBe("");
      expect(blank.divs[0].tmnt_id).toBe("");
      expect(blank.squads[0].id).toBe("");
      expect(blank.squads[0].event_id).toBe("");
      expect(blank.stage.id).toBe("");
      expect(blank.stage.squad_id).toBe("");
    });

    it("returns no lanes and empty entry arrays", () => {
      const blank = getBlankTmntFullData(false);

      expect(blank.lanes).toEqual([]);
      expect(blank.brktEntries).toEqual([]);
      expect(blank.brktSeeds).toEqual([]);
      expect(blank.divEntries).toEqual([]);
      expect(blank.elimEntries).toEqual([]);
      expect(blank.oneBrkts).toEqual([]);
      expect(blank.players).toEqual([]);
      expect(blank.potEntries).toEqual([]);
      expect(blank.moneys).toEqual([]);
    });

    it("does not generate any ids", () => {
      getBlankTmntFullData(false);
      expect(uuidMod.__totalCalls()).toBe(0);
    });

    it("does not share objects or arrays with initVals", () => {
      const blank = getBlankTmntFullData(false);

      expect(blank.tmnt).not.toBe(blankTmnt);
      expect(blank.events[0]).not.toBe(blankEvent);
      expect(blank.divs[0]).not.toBe(blankDiv);
      expect(blank.squads[0]).not.toBe(blankSquad);
      expect(blank.stage).not.toBe(blankFullStage);
    });

    it("returns empty brkts, elims and pots", () => {
      const blank = getBlankTmntFullData(false);

      expect(blank.brkts).toEqual([]);
      expect(blank.elims).toEqual([]);
      expect(blank.pots).toEqual([]);
    });
  });

  describe("getSquadStage", () => {
    it("calls getJustStage once with the squad id and returns its stage", async () => {
      mockGetJustStage.mockResolvedValueOnce(stageResult(SquadStage.ENTRIES));

      const result = await getSquadStage("sqd_123");

      expect(mockGetJustStage).toHaveBeenCalledTimes(1);
      expect(mockGetJustStage).toHaveBeenCalledWith("sqd_123");
      expect(result).toBe(SquadStage.ENTRIES);
    });

    it.each(Object.values(SquadStage))("returns %s unchanged", async (stage) => {
      mockGetJustStage.mockResolvedValueOnce(stageResult(stage));
      await expect(getSquadStage("sqd_123")).resolves.toBe(stage);
    });

    it.each([null, undefined])(
      "returns SquadStage.ERROR when getJustStage returns %p",
      async (value) => {
        mockGetJustStage.mockResolvedValueOnce(
          value as unknown as JustStageResult,
        );
        await expect(getSquadStage("sqd_456")).resolves.toBe(SquadStage.ERROR);
      },
    );

    it("passes on errors thrown by getJustStage", async () => {
      mockGetJustStage.mockRejectedValueOnce(new Error("DB failure"));
      await expect(getSquadStage("sqd_999")).rejects.toThrow("DB failure");
    });
  });
});

// // test/app/(private)/dataEntry/tmnts/tmntTools.test.tsx
// // tests for src/app/(private)/dataEntry/tmntForm/tmntTools.tsx
// import { getBlankTmntFullData, getSquadStage } from "@/app/(private)/dataEntry/tmntForm/tmntTools";
// import { SquadStage } from "@prisma/client";
// import { getJustStage } from "@/lib/db/stages/dbStages";

// // IMPORTANT: mock btDbUuid so tests don't depend on random UUIDs
// jest.mock("@/lib/uuid", () => {
//   let counters: Record<string, number> = {};

//   return {
//     __esModule: true,
//     btDbUuid: (prefix: string) => {
//       counters[prefix] = (counters[prefix] ?? 0) + 1;
//       return `${prefix}_${counters[prefix]}`;
//     },
//     // helper for resetting between tests (not used in app code)
//     __resetCounters: () => {
//       counters = {};
//     },
//   };
// });

// // Mock getJustStage so squadStage() doesn't hit the real DB layer
// jest.mock("@/lib/db/stages/dbStages", () => ({
//   __esModule: true,
//   getJustStage: jest.fn(),
// }));

// // reset the mock counters cleanly between tests:
// const uuidMod = jest.requireMock("@/lib/uuid") as { __resetCounters: () => void };

// // Strongly-typed mock for getJustStage
// const mockGetJustStage =
//   getJustStage as unknown as jest.MockedFunction<typeof getJustStage>;

// describe("tmntTools.tsx", () => {
//   beforeEach(() => {
//     uuidMod.__resetCounters();
//   });

//   describe("getBlankTmntFullData", () => {
//     it("returns a tmntFullType shape with expected empty arrays", () => {
//       const blank = getBlankTmntFullData();

//       // arrays that must be empty
//       expect(blank.brktEntries).toEqual([]);
//       expect(blank.brktSeeds).toEqual([]);
//       expect(blank.divEntries).toEqual([]);
//       expect(blank.elimEntries).toEqual([]);
//       expect(blank.elimEntries).toHaveLength(0);
//       expect(blank.oneBrkts).toEqual([]);
//       expect(blank.players).toEqual([]);
//       expect(blank.potEntries).toEqual([]);
//       expect(blank.moneys).toEqual([]);
//     });

//     it("creates exactly 1 event, 1 div, 1 squad, and 2 lanes with required defaults", () => {
//       const blank = getBlankTmntFullData();

//       expect(blank.events).toHaveLength(1);
//       expect(blank.divs).toHaveLength(1);
//       expect(blank.squads).toHaveLength(1);

//       expect(blank.lanes).toHaveLength(2);
//       expect(blank.lanes.map((l) => l.lane_number)).toEqual([1, 2]);
//       expect(blank.lanes.every((l) => l.in_use === true)).toBe(true);
//     });

//     it("assigns ids using btDbUuid prefixes and wires up foreign keys correctly", () => {
//       const blank = getBlankTmntFullData();

//       // tmnt id prefix
//       expect(blank.tmnt.id).toMatch(/^tmt_/);

//       // event
//       expect(blank.events[0].id).toMatch(/^evt_/);
//       expect(blank.events[0].tmnt_id).toBe(blank.tmnt.id);

//       // div
//       expect(blank.divs[0].id).toMatch(/^div_/);
//       expect(blank.divs[0].tmnt_id).toBe(blank.tmnt.id);

//       // squad -> event
//       expect(blank.squads[0].id).toMatch(/^sqd_/);
//       expect(blank.squads[0].event_id).toBe(blank.events[0].id);

//       expect(blank.stage.id).toMatch(/^stg_/);
//       expect(blank.stage.squad_id).toMatch(/^sqd_/);

//       // lanes -> squad
//       for (const lane of blank.lanes) {
//         expect(lane.id).toMatch(/^lan_/);
//         expect(lane.squad_id).toBe(blank.squads[0].id);
//       }
//     });

//     it("returns new objects each call (no shared references between calls)", () => {
//       const a = getBlankTmntFullData();
//       const b = getBlankTmntFullData();

//       // different top-level IDs
//       expect(a.tmnt.id).not.toBe(b.tmnt.id);
//       expect(a.events[0].id).not.toBe(b.events[0].id);
//       expect(a.divs[0].id).not.toBe(b.divs[0].id);
//       expect(a.squads[0].id).not.toBe(b.squads[0].id);
//       expect(a.lanes[0].id).not.toBe(b.lanes[0].id);

//       // not the same object references
//       expect(a).not.toBe(b);
//       expect(a.tmnt).not.toBe(b.tmnt);
//       expect(a.events).not.toBe(b.events);
//       expect(a.divs).not.toBe(b.divs);
//       expect(a.squads).not.toBe(b.squads);
//       expect(a.lanes).not.toBe(b.lanes);
//     });

//     it("when passed false, does not assign ids using btDbUuid prefixes and does not wires up foreign keys correctly ", () => {
//       const blank = getBlankTmntFullData(false);

//       // tmnt id prefix
//       expect(blank.tmnt.id).toBe('');
//       expect(blank.tmnt.start_date_str).toBe('');
//       expect(blank.tmnt.end_date_str).toBe('');

//       // event
//       expect(blank.events[0].id).toBe('');
//       expect(blank.events[0].tmnt_id).toBe('');

//       // div
//       expect(blank.divs[0].id).toBe('');
//       expect(blank.divs[0].tmnt_id).toBe('');

//       // squad -> event
//       expect(blank.squads[0].id).toBe('');
//       expect(blank.squads[0].event_id).toBe('');

//       // stage -> squad
//       expect(blank.stage.id).toBe('');
//       expect(blank.stage.squad_id).toBe('');

//       // lanes -> squad
//       expect(blank.lanes).toHaveLength(0);
//     });

//   });

//   describe("squadStage", () => {
//     it("calls getJustStage with the given squadId", async () => {
//       const squadId = "sqd_123";

//       mockGetJustStage.mockResolvedValueOnce({
//         stage: SquadStage.ENTRIES,
//       } as any);

//       const result = await getSquadStage(squadId);

//       expect(mockGetJustStage).toHaveBeenCalledTimes(1);
//       expect(mockGetJustStage).toHaveBeenCalledWith(squadId);
//       expect(result).toBe(SquadStage.ENTRIES);
//     });

//     it("returns SquadStage.ERROR when getJustStage returns null/undefined", async () => {
//       const squadId = "sqd_456";

//       // explicitly resolve to null (falsy)
//       mockGetJustStage.mockResolvedValueOnce(null as any);

//       const result = await getSquadStage(squadId);

//       expect(mockGetJustStage).toHaveBeenCalledWith(squadId);
//       expect(result).toBe(SquadStage.ERROR);
//     });

//     it("returns the stage from getJustStage when it exists", async () => {
//       const squadId = "sqd_789";

//       mockGetJustStage.mockResolvedValueOnce({
//         stage: SquadStage.SCORES,
//       } as any);

//       const result = await getSquadStage(squadId);

//       expect(result).toBe(SquadStage.SCORES);
//     });

//     it("propagates errors thrown by getJustStage", async () => {
//       const squadId = "sqd_999";

//       mockGetJustStage.mockRejectedValueOnce(new Error("DB failure"));

//       await expect(getSquadStage(squadId)).rejects.toThrow("DB failure");
//     });
//   });  
// });

