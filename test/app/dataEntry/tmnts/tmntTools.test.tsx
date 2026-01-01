// test/app/dataEntry/tmntForm/tmntTools.test.ts
import { getBlankTmntFullData, tmntHasEntries } from "@/app/dataEntry/tmntForm/tmntTools";

// IMPORTANT: mock btDbUuid so tests don't depend on random UUIDs
jest.mock("@/lib/uuid", () => {
  let counters: Record<string, number> = {};

  return {
    __esModule: true,
    btDbUuid: (prefix: string) => {
      counters[prefix] = (counters[prefix] ?? 0) + 1;
      return `${prefix}_${counters[prefix]}`;
    },
    // helper for resetting between tests (not used in app code)
    __resetCounters: () => {
      counters = {};
    },
  };
});

// If you want to reset the mock counters cleanly between tests:
const uuidMod = jest.requireMock("@/lib/uuid") as { __resetCounters: () => void };

describe("tmntTools.tsx", () => {
  beforeEach(() => {
    uuidMod.__resetCounters();
  });

  describe("getBlankTmntFullData", () => {
    it("returns a tmntFullType shape with expected empty arrays", () => {
      const blank = getBlankTmntFullData();

      // arrays that must be empty
      expect(blank.brktEntries).toEqual([]);
      expect(blank.brktSeeds).toEqual([]);
      expect(blank.divEntries).toEqual([]);
      expect(blank.elimEntries).toEqual([]);
      expect(blank.elimEntries).toHaveLength(0);
      expect(blank.oneBrkts).toEqual([]);
      expect(blank.players).toEqual([]);
      expect(blank.potEntries).toEqual([]);
    });

    it("creates exactly 1 event, 1 div, 1 squad, and 2 lanes with required defaults", () => {
      const blank = getBlankTmntFullData();

      expect(blank.events).toHaveLength(1);
      expect(blank.divs).toHaveLength(1);
      expect(blank.squads).toHaveLength(1);

      expect(blank.lanes).toHaveLength(2);
      expect(blank.lanes.map((l) => l.lane_number)).toEqual([1, 2]);
      expect(blank.lanes.every((l) => l.in_use === true)).toBe(true);
    });

    it("assigns ids using btDbUuid prefixes and wires up foreign keys correctly", () => {
      const blank = getBlankTmntFullData();

      // tmnt id prefix
      expect(blank.tmnt.id).toMatch(/^tmt_/);

      // event
      expect(blank.events[0].id).toMatch(/^evt_/);
      expect(blank.events[0].tmnt_id).toBe(blank.tmnt.id);

      // div
      expect(blank.divs[0].id).toMatch(/^div_/);
      expect(blank.divs[0].tmnt_id).toBe(blank.tmnt.id);

      // squad -> event
      expect(blank.squads[0].id).toMatch(/^sqd_/);
      expect(blank.squads[0].event_id).toBe(blank.events[0].id);

      // lanes -> squad
      for (const lane of blank.lanes) {
        expect(lane.id).toMatch(/^lan_/);
        expect(lane.squad_id).toBe(blank.squads[0].id);
      }
    });

    it("returns new objects each call (no shared references between calls)", () => {
      const a = getBlankTmntFullData();
      const b = getBlankTmntFullData();

      // different top-level IDs
      expect(a.tmnt.id).not.toBe(b.tmnt.id);
      expect(a.events[0].id).not.toBe(b.events[0].id);
      expect(a.divs[0].id).not.toBe(b.divs[0].id);
      expect(a.squads[0].id).not.toBe(b.squads[0].id);
      expect(a.lanes[0].id).not.toBe(b.lanes[0].id);

      // not the same object references
      expect(a).not.toBe(b);
      expect(a.tmnt).not.toBe(b.tmnt);
      expect(a.events).not.toBe(b.events);
      expect(a.divs).not.toBe(b.divs);
      expect(a.squads).not.toBe(b.squads);
      expect(a.lanes).not.toBe(b.lanes);
    });
  });

  describe("tmntHasEntries", () => {
    it("returns false when all entry arrays are empty", () => {
      const blank = getBlankTmntFullData();
      expect(tmntHasEntries(blank)).toBe(false);
    });

    it("returns true when brktEntries has at least 1 entry", () => {
      const tmnt = getBlankTmntFullData();
      tmnt.brktEntries.push({} as any);
      expect(tmntHasEntries(tmnt)).toBe(true);
    });

    it("returns true when divEntries has at least 1 entry", () => {
      const tmnt = getBlankTmntFullData();
      tmnt.divEntries.push({} as any);
      expect(tmntHasEntries(tmnt)).toBe(true);
    });

    it("returns true when elimEntries has at least 1 entry", () => {
      const tmnt = getBlankTmntFullData();
      tmnt.elimEntries.push({} as any);
      expect(tmntHasEntries(tmnt)).toBe(true);
    });

    it("returns true when potEntries has at least 1 entry", () => {
      const tmnt = getBlankTmntFullData();
      tmnt.potEntries.push({} as any);
      expect(tmntHasEntries(tmnt)).toBe(true);
    });

    it("still returns true if multiple entry arrays have entries", () => {
      const tmnt = getBlankTmntFullData();
      tmnt.potEntries.push({} as any);
      tmnt.divEntries.push({} as any);
      expect(tmntHasEntries(tmnt)).toBe(true);
    });
  });
});
