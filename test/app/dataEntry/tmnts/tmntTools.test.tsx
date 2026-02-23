import { getBlankTmntFullData, getSquadStage } from "@/app/dataEntry/tmntForm/tmntTools";
import { SquadStage } from "@prisma/client";
import { getJustStage } from "@/lib/db/stages/dbStages";

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

// Mock getJustStage so squadStage() doesn't hit the real DB layer
jest.mock("@/lib/db/stages/dbStages", () => ({
  __esModule: true,
  getJustStage: jest.fn(),
}));

// reset the mock counters cleanly between tests:
const uuidMod = jest.requireMock("@/lib/uuid") as { __resetCounters: () => void };

// Strongly-typed mock for getJustStage
const mockGetJustStage =
  getJustStage as unknown as jest.MockedFunction<typeof getJustStage>;

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

      expect(blank.stage.id).toMatch(/^stg_/);
      expect(blank.stage.squad_id).toMatch(/^sqd_/);

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

    it("when passed false, does not assign ids using btDbUuid prefixes and does not wires up foreign keys correctly ", () => {
      const blank = getBlankTmntFullData(false);

      // tmnt id prefix
      expect(blank.tmnt.id).toBe('');
      expect(blank.tmnt.start_date_str).toBe('');
      expect(blank.tmnt.end_date_str).toBe('');

      // event
      expect(blank.events[0].id).toBe('');
      expect(blank.events[0].tmnt_id).toBe('');

      // div
      expect(blank.divs[0].id).toBe('');
      expect(blank.divs[0].tmnt_id).toBe('');

      // squad -> event
      expect(blank.squads[0].id).toBe('');
      expect(blank.squads[0].event_id).toBe('');

      // stage -> squad
      expect(blank.stage.id).toBe('');
      expect(blank.stage.squad_id).toBe('');

      // lanes -> squad
      expect(blank.lanes).toHaveLength(0);
    });

  });

  describe("squadStage", () => {
    it("calls getJustStage with the given squadId", async () => {
      const squadId = "sqd_123";

      mockGetJustStage.mockResolvedValueOnce({
        stage: SquadStage.ENTRIES,
      } as any);

      const result = await getSquadStage(squadId);

      expect(mockGetJustStage).toHaveBeenCalledTimes(1);
      expect(mockGetJustStage).toHaveBeenCalledWith(squadId);
      expect(result).toBe(SquadStage.ENTRIES);
    });

    it("returns SquadStage.ERROR when getJustStage returns null/undefined", async () => {
      const squadId = "sqd_456";

      // explicitly resolve to null (falsy)
      mockGetJustStage.mockResolvedValueOnce(null as any);

      const result = await getSquadStage(squadId);

      expect(mockGetJustStage).toHaveBeenCalledWith(squadId);
      expect(result).toBe(SquadStage.ERROR);
    });

    it("returns the stage from getJustStage when it exists", async () => {
      const squadId = "sqd_789";

      mockGetJustStage.mockResolvedValueOnce({
        stage: SquadStage.SCORES,
      } as any);

      const result = await getSquadStage(squadId);

      expect(result).toBe(SquadStage.SCORES);
    });

    it("propagates errors thrown by getJustStage", async () => {
      const squadId = "sqd_999";

      mockGetJustStage.mockRejectedValueOnce(new Error("DB failure"));

      await expect(getSquadStage(squadId)).rejects.toThrow("DB failure");
    });
  });  
});
