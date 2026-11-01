// test/app/api/tmnts/tmntsDataForPrisma.test.tsx
// tests for tmntsDataForPrisma
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import {
  tmntDataForPrisma,
  tmntFullDataForPrisma,
} from "@/app/api/tmnts/tmntDataForPrisma";
import { startOfDayFromString } from "@/lib/dateTools";
import type {
  brktEntryType,
  tmntFullDataForPrismaType,
  tmntFullType,
  tmntMoneyType,
  tmntType,
  squadType,
} from "@/lib/types/types";

const mock = mockTmntFullData;

// Expected dates are computed with the same helper the source uses, so the
// tests do not depend on the time zone of the machine running Jest.
const expectedStartDate = startOfDayFromString(mock.tmnt.start_date_str);
const expectedEndDate = startOfDayFromString(mock.tmnt.end_date_str);

/** Runs the full conversion and fails the test if it did not succeed */
const convertFull = (data: tmntFullType = mock): tmntFullDataForPrismaType => {
  const result = tmntFullDataForPrisma(data);
  if (!result.ok) {
    throw new Error(`expected conversion to succeed, got: ${result.error}`);
  }
  return result.data;
};

/** Runs the full conversion and returns the error message, failing if it succeeded */
const convertError = (data: tmntFullType): string => {
  const result = tmntFullDataForPrisma(data);
  if (result.ok) {
    throw new Error("expected conversion to fail, but it succeeded");
  }
  return result.error;
};

describe("tmntDataForPrisma", () => {
  describe("mock data sanity", () => {
    // If any of these arrays is empty, the per-item checks below would pass
    // without checking anything.
    it("has at least one item in every converted collection", () => {
      expect(mock.events.length).toBeGreaterThan(0);
      expect(mock.divs.length).toBeGreaterThan(0);
      expect(mock.squads.length).toBeGreaterThan(0);
      expect(mock.pots.length).toBeGreaterThan(0);
      expect(mock.brkts.length).toBeGreaterThan(0);
      expect(mock.elims.length).toBeGreaterThan(0);
      expect(mock.players.length).toBeGreaterThan(0);
      expect(mock.divEntries.length).toBeGreaterThan(0);
      expect(mock.potEntries.length).toBeGreaterThan(0);
      expect(mock.brktEntries.length).toBeGreaterThan(0);
      expect(mock.elimEntries.length).toBeGreaterThan(0);
      expect(mock.moneys.length).toBeGreaterThan(0);
    });

    it("has valid tmnt dates", () => {
      expect(expectedStartDate).toBeInstanceOf(Date);
      expect(expectedEndDate).toBeInstanceOf(Date);
    });
  });

  describe("tmntDataForPrisma()", () => {
    it("converts a valid tmnt", () => {
      const result = tmntDataForPrisma(mock.tmnt);
      expect(result).toEqual({
        id: mock.tmnt.id,
        tmnt_name: mock.tmnt.tmnt_name,
        start_date: expectedStartDate,
        end_date: expectedEndDate,
        user_id: mock.tmnt.user_id,
        bowl_id: mock.tmnt.bowl_id,
      });
    });

    it("returns Date objects for start_date and end_date", () => {
      const result = tmntDataForPrisma(mock.tmnt);
      expect(result?.start_date).toBeInstanceOf(Date);
      expect(result?.end_date).toBeInstanceOf(Date);
    });

    it("does not include the date string fields", () => {
      const result = tmntDataForPrisma(mock.tmnt);
      expect(result).not.toHaveProperty("start_date_str");
      expect(result).not.toHaveProperty("end_date_str");
    });

    it("returns null for null or undefined", () => {
      expect(tmntDataForPrisma(null as unknown as tmntType)).toBeNull();
      expect(tmntDataForPrisma(undefined as unknown as tmntType)).toBeNull();
    });

    it("returns null for a non-object", () => {
      expect(tmntDataForPrisma("tmnt" as unknown as tmntType)).toBeNull();
    });

    it("returns null when start_date_str is invalid", () => {
      const tmnt = { ...mock.tmnt, start_date_str: "not-a-date" };
      expect(tmntDataForPrisma(tmnt)).toBeNull();
    });

    it("returns null when end_date_str is invalid", () => {
      const tmnt = { ...mock.tmnt, end_date_str: "" };
      expect(tmntDataForPrisma(tmnt)).toBeNull();
    });

    it("returns null when a date string is not a string", () => {
      const noStart = { ...mock.tmnt, start_date_str: undefined } as unknown as tmntType;
      const numEnd = { ...mock.tmnt, end_date_str: 20250901 } as unknown as tmntType;
      expect(tmntDataForPrisma(noStart)).toBeNull();
      expect(tmntDataForPrisma(numEnd)).toBeNull();
    });
  });

  describe("tmntFullDataForPrisma()", () => {
    describe("valid data", () => {
      it("returns ok: true", () => {
        expect(tmntFullDataForPrisma(mock).ok).toBe(true);
      });

      it("converts tmnt", () => {
        const result = convertFull();
        expect(result.tmntData).toEqual(tmntDataForPrisma(mock.tmnt));
      });

      it("converts every event", () => {
        const result = convertFull();
        expect(result.eventsData).toHaveLength(mock.events.length);
        mock.events.forEach((event, i) => {
          expect(result.eventsData[i]).toEqual({
            id: event.id,
            tmnt_id: event.tmnt_id,
            event_name: event.event_name,
            team_size: event.team_size,
            games: event.games,
            entry_fee: event.entry_fee,
            lineage: event.lineage,
            prize_fund: event.prize_fund,
            other: event.other,
            expenses: event.expenses,
            added_money: event.added_money,
            sort_order: event.sort_order,
          });
        });
      });

      it("converts every div", () => {
        const result = convertFull();
        expect(result.divsData).toHaveLength(mock.divs.length);
        mock.divs.forEach((div, i) => {
          expect(result.divsData[i]).toEqual({
            id: div.id,
            tmnt_id: div.tmnt_id,
            div_name: div.div_name,
            hdcp_per: div.hdcp_per,
            hdcp_from: div.hdcp_from,
            int_hdcp: div.int_hdcp,
            hdcp_for: div.hdcp_for,
            sort_order: div.sort_order,
          });
        });
      });

      it("converts every squad, with squad_date as a Date", () => {
        const result = convertFull();
        expect(result.squadsData).toHaveLength(mock.squads.length);
        mock.squads.forEach((squad, i) => {
          expect(result.squadsData[i]).toEqual({
            id: squad.id,
            event_id: squad.event_id,
            squad_name: squad.squad_name,
            games: squad.games,
            lane_count: squad.lane_count,
            starting_lane: squad.starting_lane,
            squad_date: startOfDayFromString(squad.squad_date_str),
            squad_time: squad.squad_time,
            sort_order: squad.sort_order,
          });
          expect(result.squadsData[i].squad_date).toBeInstanceOf(Date);
          expect(result.squadsData[i]).not.toHaveProperty("squad_date_str");
        });
      });

      it("converts every pot", () => {
        const result = convertFull();
        expect(result.potsData).toHaveLength(mock.pots.length);
        mock.pots.forEach((pot, i) => {
          expect(result.potsData[i]).toEqual({
            id: pot.id,
            squad_id: pot.squad_id,
            div_id: pot.div_id,
            fee: pot.fee,
            pot_type: pot.pot_type,
            sort_order: pot.sort_order,
          });
        });
      });

      it("converts every brkt, without fsa", () => {
        const result = convertFull();
        expect(result.brktsData).toHaveLength(mock.brkts.length);
        mock.brkts.forEach((brkt, i) => {
          expect(result.brktsData[i]).toEqual({
            id: brkt.id,
            div_id: brkt.div_id,
            squad_id: brkt.squad_id,
            fee: brkt.fee,
            start: brkt.start,
            games: brkt.games,
            players: brkt.players,
            first: brkt.first,
            second: brkt.second,
            admin: brkt.admin,
            sort_order: brkt.sort_order,
          });
          expect(result.brktsData[i]).not.toHaveProperty("fsa");
        });
      });

      it("converts every elim", () => {
        const result = convertFull();
        expect(result.elimsData).toHaveLength(mock.elims.length);
        mock.elims.forEach((elim, i) => {
          expect(result.elimsData[i]).toEqual({
            id: elim.id,
            div_id: elim.div_id,
            squad_id: elim.squad_id,
            start: elim.start,
            games: elim.games,
            fee: elim.fee,
            sort_order: elim.sort_order,
          });
        });
      });

      it("converts every player", () => {
        const result = convertFull();
        expect(result.playersData).toHaveLength(mock.players.length);
        mock.players.forEach((player, i) => {
          expect(result.playersData[i]).toEqual({
            id: player.id,
            squad_id: player.squad_id,
            first_name: player.first_name,
            last_name: player.last_name,
            average: player.average,
            lane: player.lane,
            position: player.position,
          });
        });
      });

      it("converts every divEntry", () => {
        const result = convertFull();
        expect(result.divEntriesData).toHaveLength(mock.divEntries.length);
        mock.divEntries.forEach((divEntry, i) => {
          expect(result.divEntriesData[i]).toEqual({
            id: divEntry.id,
            squad_id: divEntry.squad_id,
            div_id: divEntry.div_id,
            player_id: divEntry.player_id,
            fee: divEntry.fee,
          });
        });
      });

      it("converts every potEntry", () => {
        const result = convertFull();
        expect(result.potEntriesData).toHaveLength(mock.potEntries.length);
        mock.potEntries.forEach((potEntry, i) => {
          expect(result.potEntriesData[i]).toEqual({
            id: potEntry.id,
            pot_id: potEntry.pot_id,
            player_id: potEntry.player_id,
            fee: potEntry.fee,
          });
        });
      });

      it("converts every brktEntry, without fee and with time_stamp as a Date", () => {
        const result = convertFull();
        expect(result.brktEntriesData).toHaveLength(mock.brktEntries.length);
        mock.brktEntries.forEach((brktEntry, i) => {
          expect(result.brktEntriesData[i]).toEqual({
            id: brktEntry.id,
            brkt_id: brktEntry.brkt_id,
            player_id: brktEntry.player_id,
            num_brackets: brktEntry.num_brackets,
            num_refunds: brktEntry.num_refunds,
            time_stamp: new Date(brktEntry.time_stamp),
          });
          expect(result.brktEntriesData[i]).not.toHaveProperty("fee");
          expect(result.brktEntriesData[i].time_stamp).toBeInstanceOf(Date);
        });
      });

      it("converts every elimEntry", () => {
        const result = convertFull();
        expect(result.elimEntriesData).toHaveLength(mock.elimEntries.length);
        mock.elimEntries.forEach((elimEntry, i) => {
          expect(result.elimEntriesData[i]).toEqual({
            id: elimEntry.id,
            elim_id: elimEntry.elim_id,
            player_id: elimEntry.player_id,
            fee: elimEntry.fee,
          });
        });
      });

      it("converts every money", () => {
        const result = convertFull();
        expect(result.moneysData).toHaveLength(mock.moneys.length);
        mock.moneys.forEach((money, i) => {
          expect(result.moneysData[i]).toEqual({
            id: money.id,
            event_id: money.event_id,
            squad_id: money.squad_id,
            div_id: money.div_id,
            descrip: money.descrip,
            flow: money.flow,
            amount: money.amount || 0,
            pot_id: money.pot_id,
            brkt_id: money.brkt_id,
            elim_id: money.elim_id,
            sort_order: money.sort_order,
          });
        });
      });

      it("passes stage, lanes, oneBrkts and brktSeeds through unchanged", () => {
        const result = convertFull();
        expect(result.stageData).toBe(mock.stage);
        expect(result.lanesData).toBe(mock.lanes);
        expect(result.oneBrktsData).toBe(mock.oneBrkts);
        expect(result.brktSeedsData).toBe(mock.brktSeeds);
      });
    });

    describe("money amount defaults", () => {
      it.each([undefined, null, 0])("sets amount to 0 when amount is %p", (amount) => {
        const money = { ...mock.moneys[0], amount } as unknown as tmntMoneyType;
        const result = convertFull({ ...mock, moneys: [money] });
        expect(result.moneysData[0].amount).toBe(0);
      });
    });

    describe("empty collections", () => {
      it("converts a tmnt with no events, divs, squads, entries or moneys", () => {
        const data: tmntFullType = {
          ...mock,
          events: [],
          divs: [],
          squads: [],
          pots: [],
          brkts: [],
          elims: [],
          players: [],
          divEntries: [],
          potEntries: [],
          brktEntries: [],
          elimEntries: [],
          moneys: [],
        };
        const result = convertFull(data);
        expect(result.tmntData).toEqual(tmntDataForPrisma(mock.tmnt));
        expect(result.eventsData).toEqual([]);
        expect(result.squadsData).toEqual([]);
        expect(result.brktEntriesData).toEqual([]);
        expect(result.moneysData).toEqual([]);
      });
    });

    describe("invalid top-level input", () => {
      it.each([
        ["null", null],
        ["undefined", undefined],
        ["a string", "tmnt"],
        ["a number", 123],
      ])("fails for %s", (_label, value) => {
        expect(convertError(value as unknown as tmntFullType)).toBe(
          "tmnt full data: not an object"
        );
      });

      it("fails when tmnt is null", () => {
        const data = { ...mock, tmnt: null } as unknown as tmntFullType;
        expect(convertError(data)).toBe("tmnt: not an object");
      });

      it("fails with the tmnt id when start_date_str is invalid", () => {
        const data = { ...mock, tmnt: { ...mock.tmnt, start_date_str: "not-a-date" } };
        expect(convertError(data)).toBe(
          `tmnt (id ${mock.tmnt.id}): invalid start_date_str`
        );
      });

      it("fails with the tmnt id when end_date_str is invalid", () => {
        const data = { ...mock, tmnt: { ...mock.tmnt, end_date_str: "" } };
        expect(convertError(data)).toBe(
          `tmnt (id ${mock.tmnt.id}): invalid end_date_str`
        );
      });
    });

    describe("invalid items inside collections (all-or-nothing)", () => {
      const collectionKeys = [
        "events",
        "divs",
        "squads",
        "pots",
        "brkts",
        "elims",
        "players",
        "divEntries",
        "potEntries",
        "brktEntries",
        "elimEntries",
        "moneys",
      ] as const;

      it.each(collectionKeys)("fails when %s is missing", (key) => {
        const data = { ...mock, [key]: undefined } as unknown as tmntFullType;
        expect(convertError(data)).toBe(`${key}: not an array`);
      });

      it.each(collectionKeys)("fails when %s is not an array", (key) => {
        const data = { ...mock, [key]: {} } as unknown as tmntFullType;
        expect(convertError(data)).toBe(`${key}: not an array`);
      });

      it.each(collectionKeys)("fails with the index when %s has a null item", (key) => {
        const source = mock[key] as unknown[];
        const data = { ...mock, [key]: [...source, null] } as unknown as tmntFullType;
        expect(convertError(data)).toBe(`${key}[${source.length}]: not an object`);
      });

      it.each(collectionKeys)("fails with the index when %s has an undefined item", (key) => {
        const source = mock[key] as unknown[];
        const data = { ...mock, [key]: [undefined, ...source] } as unknown as tmntFullType;
        expect(convertError(data)).toBe(`${key}[0]: not an object`);
      });

      it.each(collectionKeys)("fails with the index when %s has a non-object item", (key) => {
        const source = mock[key] as unknown[];
        const data = { ...mock, [key]: [...source, "bad item"] } as unknown as tmntFullType;
        expect(convertError(data)).toBe(`${key}[${source.length}]: not an object`);
      });

      it("fails with index and id when a squad has an invalid squad_date_str", () => {
        const badSquad: squadType = { ...mock.squads[0], squad_date_str: "not-a-date" };
        const data = { ...mock, squads: [...mock.squads, badSquad] };
        expect(convertError(data)).toBe(
          `squads[${mock.squads.length}] (id ${badSquad.id}): invalid squad_date_str`
        );
      });

      it("fails when a squad_date_str is not a string", () => {
        const badSquad = { ...mock.squads[0], squad_date_str: 20250901 } as unknown as squadType;
        const data = { ...mock, squads: [badSquad] };
        expect(convertError(data)).toBe(
          `squads[0] (id ${badSquad.id}): squad_date_str is not a string`
        );
      });

      it.each([
        ["an unparseable string", "garbage", "invalid time_stamp"],
        ["NaN", NaN, "invalid time_stamp"],
        ["null", null, "missing time_stamp"],
        ["undefined", undefined, "missing time_stamp"],
      ])("fails when a brktEntry time_stamp is %s", (_label, timeStamp, message) => {
        const badEntry = {
          ...mock.brktEntries[0],
          time_stamp: timeStamp,
        } as unknown as brktEntryType;
        const data = { ...mock, brktEntries: [...mock.brktEntries, badEntry] };
        expect(convertError(data)).toBe(
          `brktEntries[${mock.brktEntries.length}] (id ${badEntry.id}): ${message}`
        );
      });

      it("accepts a brktEntry time_stamp of 0 (epoch) as a valid date", () => {
        const entry = { ...mock.brktEntries[0], time_stamp: 0 } as unknown as brktEntryType;
        const result = convertFull({ ...mock, brktEntries: [entry] });
        expect(result.brktEntriesData[0].time_stamp).toEqual(new Date(0));
      });

      it("reports the first failure when several collections are bad", () => {
        // squads are converted before brktEntries, so the squad error wins
        const data = {
          ...mock,
          squads: [null],
          brktEntries: [null],
        } as unknown as tmntFullType;
        expect(convertError(data)).toBe("squads[0]: not an object");
      });
    });

    describe("input is not mutated", () => {
      it("leaves the source tmnt and arrays unchanged", () => {
        const tmntBefore = { ...mock.tmnt };
        const eventsLength = mock.events.length;
        const brktBefore = { ...mock.brkts[0] };
        const brktEntryBefore = { ...mock.brktEntries[0] };
        convertFull();
        expect(mock.tmnt).toEqual(tmntBefore);
        expect(mock.events).toHaveLength(eventsLength);
        expect(mock.brkts[0]).toEqual(brktBefore);
        expect(mock.brktEntries[0]).toEqual(brktEntryBefore);
      });
    });
  });
});