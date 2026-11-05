// test/app/results/tmnts/brackets/player/playerBrktData.test.tsx
// tests src/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import {
  calcAllBrktSummaries,
  getBrktSummaryDataError,
  missingDataError,
  type brktSummaryType,
} from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type { tmntFullType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  brktId1,
  brktId2,
  divId1,
  playerId1,
  playerId8,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// only the real-list tests reach this, through BracketList
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));
const mockedToGameTypes = jest.mocked(tmntResultsToGameTypes);

/*********************************************/
/* helpers that keep "possibly undefined" out */
/*********************************************/

/**
 * Finds the first item that matches, or throws if none does.
 *
 * @param {T[]} items - array to search
 * @param {(item: T) => boolean} match - test for the wanted item
 * @param {string} what - name of the item, for the error message
 * @returns {T} the matching item
 */
const findOrThrow = <T,>(
  items: readonly T[],
  match: (item: T) => boolean,
  what: string,
): T => {
  const item = items.find(match);
  if (item === undefined) {
    throw new Error(`No ${what} found`);
  }
  return item;
};

/**
 * Gets a bracket's list from the record, or throws if it is not there.
 *
 * @param {brktListRecord} records - bracket lists by bracket id
 * @param {string} brktId - bracket id
 * @returns {BracketList} the bracket's list
 */
const listFor = (records: brktListRecord, brktId: string): BracketList => {
  const list = records[brktId];
  if (list === undefined) {
    throw new Error(`No bracket list for ${brktId}`);
  }
  return list;
};

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
type Brkt = tmntFullType["brkts"][number];
type BrktEntry = tmntFullType["brktEntries"][number];

const { players } = mockTmntFullData;
const player1 = playerId1; // 10 brackets and 2 refunds in each bracket, $50 per entry row
const player8 = playerId8; // 8 brackets and no refunds in each bracket, $40 per entry row

const BOTH = [brktId1, brktId2];
const UNKNOWN_BRKT = "brk_unknown000000000000000000000000";
const UNKNOWN_PLAYER = "ply_unknown000000000000000000000000";

const entryFor = (playerId: string, brktId: string): BrktEntry =>
  findOrThrow(
    mockTmntFullData.brktEntries,
    (e) => e.player_id === playerId && e.brkt_id === brktId,
    `entry for ${playerId} in ${brktId}`,
  );

// the tournament with one bracket's settings changed
const withBrkt = (
  brktId: string,
  overrides: Partial<Brkt>,
  base: tmntFullType = mockTmntFullData,
): tmntFullType => ({
  ...base,
  brkts: base.brkts.map((b) => (b.id === brktId ? { ...b, ...overrides } : b)),
});

// the tournament with one entry's settings changed
const withEntry = (
  playerId: string,
  brktId: string,
  overrides: Partial<BrktEntry>,
  base: tmntFullType = mockTmntFullData,
): tmntFullType => ({
  ...base,
  brktEntries: base.brktEntries.map((e) =>
    e.player_id === playerId && e.brkt_id === brktId ? { ...e, ...overrides } : e,
  ),
});

// the tournament with only the entries that pass keep
const withEntriesWhere = (keep: (entry: BrktEntry) => boolean): tmntFullType => ({
  ...mockTmntFullData,
  brktEntries: mockTmntFullData.brktEntries.filter(keep),
});

// the tournament without one player's entry in one bracket
const withoutEntry = (playerId: string, brktId: string): tmntFullType =>
  withEntriesWhere((e) => !(e.player_id === playerId && e.brkt_id === brktId));

const noTotals: brktSummaryType = {
  allComplete: false,
  entries: 0,
  entryAmount: 0,
  refunds: 0,
  refundAmount: 0,
  earnings: 0,
};

/***********************/
/* bracket list fakes  */
/***********************/
type EarningsFn = BracketList["playerEarnings"];
type CompletedFn = BracketList["allBracketsCompleted"];

type FakeList = {
  list: BracketList;
  earnings: jest.Mock<ReturnType<EarningsFn>, Parameters<EarningsFn>>;
  completed: jest.Mock<ReturnType<CompletedFn>, Parameters<CompletedFn>>;
};

// a list with only the two members calcAllBrktSummaries uses. The spies are
// returned beside the list, so the tests never pull a method off the list
const fakeList = (brktId: string, earnings: number, complete = true): FakeList => {
  const earningsSpy = jest.fn<ReturnType<EarningsFn>, Parameters<EarningsFn>>(
    () => earnings,
  );
  const completedSpy = jest.fn<ReturnType<CompletedFn>, Parameters<CompletedFn>>(
    () => complete,
  );
  const list = {
    brktId,
    playerEarnings: earningsSpy,
    allBracketsCompleted: completedSpy,
  } as unknown as BracketList;
  return { list, earnings: earningsSpy, completed: completedSpy };
};

type FakeOpts = {
  earnings1?: number;
  earnings2?: number;
  complete1?: boolean;
  complete2?: boolean;
};

// both lists, by name, and the record that holds them
const makeFakes = ({
  earnings1 = 25,
  earnings2 = 10,
  complete1 = true,
  complete2 = true,
}: FakeOpts = {}) => {
  const fake1 = fakeList(brktId1, earnings1, complete1);
  const fake2 = fakeList(brktId2, earnings2, complete2);
  const records: brktListRecord = {
    [brktId1]: fake1.list,
    [brktId2]: fake2.list,
  };
  return { fake1, fake2, records };
};

const makeRecords = (opts: FakeOpts = {}): brktListRecord =>
  makeFakes(opts).records;

describe("playerBrktData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("both mock brackets have a $5 fee, $25 first and $10 second", () => {
      mockTmntFullData.brkts.forEach((b) => {
        expect(b.fee).toBe("5");
        expect(b.first).toBe("25");
        expect(b.second).toBe("10");
      });
    });

    it.each(BOTH)("player 1 has 10 brackets and 2 refunds in %s", (id) => {
      const entry = entryFor(player1, id);
      expect(entry.num_brackets).toBe(10);
      expect(entry.num_refunds).toBe(2);
    });

    it.each(BOTH)("player 8 has 8 brackets and no refunds in %s", (id) => {
      const entry = entryFor(player8, id);
      expect(entry.num_brackets).toBe(8);
      expect(entry.num_refunds).toBe(0);
    });

  });

  /********************/
  /* missingDataError */
  /********************/
  describe("missingDataError", () => {
    it("renders the message in one danger alert", () => {
      render(missingDataError("Something is missing."));

      const alerts = screen.getAllByRole("alert");
      expect(alerts).toHaveLength(1);
      expect(screen.getByRole("alert")).toHaveTextContent("Something is missing.");
      expect(screen.getByRole("alert")).toHaveClass("alert", "alert-danger");
    });

    it("renders whatever message it is given", () => {
      const { rerender } = render(missingDataError("First message."));
      expect(screen.getByRole("alert")).toHaveTextContent("First message.");

      rerender(missingDataError("Second message."));
      expect(screen.getByRole("alert")).toHaveTextContent("Second message.");
    });

    it("renders an empty alert for an empty message", () => {
      render(missingDataError(""));

      expect(screen.getByRole("alert")).toBeEmptyDOMElement();
    });

    it("can be used inside another component", () => {
      render(<div data-testid="outer">{missingDataError("Inside.")}</div>);

      expect(screen.getByTestId("outer")).toContainElement(
        screen.getByRole("alert"),
      );
    });
  });

  /****************************/
  /* getBrktSummaryDataError  */
  /****************************/
  describe("getBrktSummaryDataError", () => {
    it.each([
      [brktId1, player1],
      [brktId1, player8],
      [brktId2, player1],
      [brktId2, player8],
    ])("returns null for good data (bracket %s, player %s)", (brktId, playerId) => {
      expect(getBrktSummaryDataError(mockTmntFullData, brktId, playerId)).toBeNull();
    });

    it("returns null for every player in every bracket of the mock", () => {
      mockTmntFullData.brktEntries.forEach((e) => {
        expect(
          getBrktSummaryDataError(mockTmntFullData, e.brkt_id, e.player_id),
        ).toBeNull();
      });
    });

    it("returns the bracket message, with the bracket id, when the bracket is not in the tournament", () => {
      expect(getBrktSummaryDataError(mockTmntFullData, UNKNOWN_BRKT, player8)).toBe(
        `Bracket configuration not found. Id: ${UNKNOWN_BRKT}`,
      );
    });

    it("returns the bracket message when the tournament has no brackets", () => {
      const data: tmntFullType = { ...mockTmntFullData, brkts: [] };

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Bracket configuration not found. Id: ${brktId1}`,
      );
    });

    it("returns the entry message, with the player id, when the player has no entry in the bracket", () => {
      const data = withoutEntry(player8, brktId1);

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it("returns the entry message for a player who is not in the tournament", () => {
      expect(getBrktSummaryDataError(mockTmntFullData, brktId1, UNKNOWN_PLAYER)).toBe(
        `Player bracket entries not found. Id: ${UNKNOWN_PLAYER}`,
      );
    });

    it("returns the entry message when the tournament has no entries at all", () => {
      const data = withEntriesWhere(() => false);

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it("only looks at the entry for the bracket asked about", () => {
      // player 8 has no entry in bracket 2, but does in bracket 1
      const data = withoutEntry(player8, brktId2);

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBeNull();
      expect(getBrktSummaryDataError(data, brktId2, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it.each<[string, Partial<Brkt>, string]>([
      ["the fee is not a number", { fee: "abc" }, "Bracket fee not found."],
      ["the fee is empty", { fee: "" }, "Bracket fee not found."],
      ["the first amount is not a number", { first: "abc" }, "Bracket first amount not found."],
      ["the second amount is not a number", { second: "abc" }, "Bracket second amount not found."],
    ])("returns the right message when %s", (_label, overrides, message) => {
      expect(
        getBrktSummaryDataError(withBrkt(brktId1, overrides), brktId1, player8),
      ).toBe(message);
    });

    it("checks only the bracket asked about", () => {
      // bracket 2 has a bad fee; bracket 1 is fine
      const data = withBrkt(brktId2, { fee: "abc" });

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBeNull();
      expect(getBrktSummaryDataError(data, brktId2, player8)).toBe(
        "Bracket fee not found.",
      );
    });

    it("does not change the data it is given", () => {
      const before = JSON.stringify(mockTmntFullData);

      getBrktSummaryDataError(mockTmntFullData, brktId1, player8);

      expect(JSON.stringify(mockTmntFullData)).toBe(before);
    });

    describe("the order of the checks", () => {
      it("reports the bracket before the entry", () => {
        const data = withEntriesWhere(() => false);

        expect(getBrktSummaryDataError(data, UNKNOWN_BRKT, player8)).toBe(
          `Bracket configuration not found. Id: ${UNKNOWN_BRKT}`,
        );
      });

      it("reports the entry before the fee", () => {
        const data = withBrkt(brktId1, { fee: "abc" }, withoutEntry(player8, brktId1));

        expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
          `Player bracket entries not found. Id: ${player8}`,
        );
      });

      it("reports the fee before the first amount", () => {
        const data = withBrkt(brktId1, { fee: "abc", first: "abc", second: "abc" });

        expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
          "Bracket fee not found.",
        );
      });

      it("reports the first amount before the second amount", () => {
        const data = withBrkt(brktId1, { first: "abc", second: "abc" });

        expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
          "Bracket first amount not found.",
        );
      });
    });
  });

  /**************************/
  /* calcAllBrktSummaries   */
  /**************************/
  describe("calcAllBrktSummaries", () => {
    describe("with fake lists, every bracket complete", () => {
      it("adds up the entries, refunds and earnings of every bracket the player has an entry in", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1);

        // 2 brackets x (10 - 2) entries, 2 refunds each, at $5; earnings $25 + $10
        expect(result).toEqual({
          allComplete: true,
          entries: 16,
          entryAmount: 80,
          refunds: 4,
          refundAmount: 20,
          earnings: 35,
        });
      });

      it("gives no refunds for a player who has none", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, makeRecords(), player8);

        expect(result).toEqual({
          allComplete: true,
          entries: 16,
          entryAmount: 80,
          refunds: 0,
          refundAmount: 0,
          earnings: 35,
        });
      });

      it("makes the money paid plus the money refunded equal the fees on the player's entry rows", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1);

        const entryFees = mockTmntFullData.brktEntries
          .filter((e) => e.player_id === player1)
          .reduce((sum, e) => sum + Number(e.fee), 0);

        expect(result.entryAmount + result.refundAmount).toBe(entryFees);
      });

      it("uses each bracket's own fee", () => {
        const data = withBrkt(brktId2, { fee: "10" });

        const result = calcAllBrktSummaries(data, makeRecords(), player1);

        expect(result.entryAmount).toBe(8 * 5 + 8 * 10);
        expect(result.refundAmount).toBe(2 * 5 + 2 * 10);
      });

      it("uses the entry row for each bracket", () => {
        const data = withEntry(player1, brktId2, { num_brackets: 12, num_refunds: 4 });

        const result = calcAllBrktSummaries(data, makeRecords(), player1);

        expect(result.entries).toBe(8 + (12 - 4));
        expect(result.refunds).toBe(2 + 4);
        expect(result.entryAmount).toBe(5 * 16);
        expect(result.refundAmount).toBe(5 * 6);
      });

      it("asks each bracket list for the player's earnings, once", () => {
        const { fake1, fake2, records } = makeFakes();

        calcAllBrktSummaries(mockTmntFullData, records, player1);

        [fake1, fake2].forEach((fake) => {
          expect(fake.earnings).toHaveBeenCalledTimes(1);
          expect(fake.earnings).toHaveBeenCalledWith(player1);
        });
      });

      it("keeps counting when the earnings of a bracket are 0", () => {
        const result = calcAllBrktSummaries(
          mockTmntFullData,
          makeRecords({ earnings1: 0, earnings2: 0 }),
          player1,
        );

        expect(result.allComplete).toBe(true);
        expect(result.earnings).toBe(0);
        expect(result.entries).toBe(16);
      });

      it("counts a bracket whose entries were all refunded, as complete with 0 entries", () => {
        // player 1 bought 10 in bracket 1 and all 10 were refunded
        const data = withEntry(player1, brktId1, { num_refunds: 10 });

        expect(
          calcAllBrktSummaries(data, makeRecords(), player1, [brktId1]),
        ).toEqual({
          allComplete: true,
          entries: 0,
          entryAmount: 0,
          refunds: 10,
          refundAmount: 50,
          earnings: 25,
        });
      });

      it("gives the same totals whatever order the entries are in", () => {
        const reversed: tmntFullType = {
          ...mockTmntFullData,
          brktEntries: [...mockTmntFullData.brktEntries].reverse(),
        };

        expect(calcAllBrktSummaries(reversed, makeRecords(), player1)).toEqual(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1),
        );
      });

      it("returns a new object each time, and does not change the data", () => {
        const before = JSON.stringify(mockTmntFullData);

        const first = calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1);
        const second = calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1);

        expect(second).toEqual(first);
        expect(second).not.toBe(first);
        expect(JSON.stringify(mockTmntFullData)).toBe(before);
      });
    });

    describe("which brackets are counted", () => {
      it("counts every bracket when no bracket ids are given", () => {
        expect(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1),
        ).toEqual(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1, BOTH),
        );
      });

      it.each<[string, string, number]>([
        ["bracket 1", brktId1, 25],
        ["bracket 2", brktId2, 10],
      ])("counts only %s when it is the only id given", (_label, brktId, earnings) => {
        expect(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(), player1, [brktId]),
        ).toEqual({
          allComplete: true,
          entries: 8,
          entryAmount: 40,
          refunds: 2,
          refundAmount: 10,
          earnings,
        });
      });

      it("does not ask a list it was not given the id of for anything", () => {
        const { fake2, records } = makeFakes();

        calcAllBrktSummaries(mockTmntFullData, records, player1, [brktId1]);

        expect(fake2.earnings).not.toHaveBeenCalled();
        expect(fake2.completed).not.toHaveBeenCalled();
      });

      it("ignores an incomplete bracket it was not given the id of", () => {
        const result = calcAllBrktSummaries(
          mockTmntFullData,
          makeRecords({ complete2: false }),
          player1,
          [brktId1],
        );

        expect(result.allComplete).toBe(true);
        expect(result.earnings).toBe(25);
      });

      it("ignores a list the player has no entry in, even an incomplete one", () => {
        const data = withoutEntry(player8, brktId2);
        const { fake2, records } = makeFakes({ complete2: false });

        const result = calcAllBrktSummaries(data, records, player8);

        expect(result.allComplete).toBe(true);
        expect(result.entries).toBe(8);
        expect(result.earnings).toBe(25);
        expect(fake2.earnings).not.toHaveBeenCalled();
      });

      it("ignores other players' entries", () => {
        // player 1's entry in bracket 1 is changed; player 8's totals are not
        const data = withEntry(player1, brktId1, { num_brackets: 20, num_refunds: 5 });

        expect(calcAllBrktSummaries(data, makeRecords(), player8)).toEqual(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(), player8),
        );
      });
    });

    describe("errors: the page guards against these, so they are bugs", () => {
      const noEntriesMsg = (playerId: string) =>
        `calcAllBrktSummaries - no bracket entries for player. Id: ${playerId}`;
      const noListMsg = (brktId: string) =>
        `calcAllBrktSummaries - no bracket list for bracket. Id: ${brktId}`;

      it.each<[string, tmntFullType, string, string[] | undefined]>([
        ["a player who is not in the tournament", mockTmntFullData, UNKNOWN_PLAYER, undefined],
        ["a tournament with no entries", withEntriesWhere(() => false), player1, undefined],
        ["a player whose entries were all removed", withEntriesWhere((e) => e.player_id !== player8), player8, undefined],
        ["an empty list of bracket ids", mockTmntFullData, player1, []],
        ["a bracket id that is not in the tournament", mockTmntFullData, player1, [UNKNOWN_BRKT]],
      ])("throws the no entries error for %s", (_label, data, playerId, brktIds) => {
        expect(() =>
          calcAllBrktSummaries(data, makeRecords(), playerId, brktIds),
        ).toThrow(noEntriesMsg(playerId));
      });

      it("asks no list for anything when there are no entries", () => {
        const { fake1, fake2, records } = makeFakes();

        expect(() =>
          calcAllBrktSummaries(mockTmntFullData, records, UNKNOWN_PLAYER),
        ).toThrow();
        [fake1, fake2].forEach((fake) => {
          expect(fake.completed).not.toHaveBeenCalled();
          expect(fake.earnings).not.toHaveBeenCalled();
        });
      });

      it("throws the no list error, with the bracket id, when there are no bracket lists", () => {
        expect(() => calcAllBrktSummaries(mockTmntFullData, {}, player1)).toThrow(
          noListMsg(brktId1),
        );
      });

      it("throws the no list error when one of the player's brackets has no list", () => {
        const records: brktListRecord = { [brktId1]: fakeList(brktId1, 25).list };

        expect(() => calcAllBrktSummaries(mockTmntFullData, records, player1)).toThrow(
          noListMsg(brktId2),
        );
      });

      it("throws the no list error when the only list is for another bracket", () => {
        const records: brktListRecord = {
          brk_unrelated: fakeList("brk_unrelated", 99).list,
        };

        expect(() => calcAllBrktSummaries(mockTmntFullData, records, player1)).toThrow(
          noListMsg(brktId1),
        );
      });

      it("asks no list for anything when a list is missing", () => {
        const fake1 = fakeList(brktId1, 25);

        expect(() =>
          calcAllBrktSummaries(mockTmntFullData, { [brktId1]: fake1.list }, player1),
        ).toThrow();
        expect(fake1.completed).not.toHaveBeenCalled();
        expect(fake1.earnings).not.toHaveBeenCalled();
      });
    });

    describe("when a bracket is not complete", () => {
      // no totals: the totals of an unfinished tournament are not final
      it.each<[string, FakeOpts]>([
        ["the first bracket is", { complete1: false }],
        ["the second bracket is", { complete2: false }],
        ["both brackets are", { complete1: false, complete2: false }],
      ])("returns no totals when %s not complete", (_label, opts) => {
        expect(
          calcAllBrktSummaries(mockTmntFullData, makeRecords(opts), player1),
        ).toEqual(noTotals);
      });

      it("returns no totals for a player with no refunds either", () => {
        expect(
          calcAllBrktSummaries(
            mockTmntFullData,
            makeRecords({ complete2: false }),
            player8,
          ),
        ).toEqual(noTotals);
      });

      it.each<[string, FakeOpts]>([
        ["the first bracket", { complete1: false }],
        ["the second bracket", { complete2: false }],
        ["both brackets", { complete1: false, complete2: false }],
      ])("asks no list for earnings when %s is not complete", (_label, opts) => {
        // every bracket is checked before any earnings are asked for
        const { fake1, fake2, records } = makeFakes(opts);

        calcAllBrktSummaries(mockTmntFullData, records, player1);

        expect(fake1.earnings).not.toHaveBeenCalled();
        expect(fake2.earnings).not.toHaveBeenCalled();
      });

      it("checks every list for completeness when they are all complete", () => {
        const { fake1, fake2, records } = makeFakes();

        calcAllBrktSummaries(mockTmntFullData, records, player1);

        expect(fake1.completed).toHaveBeenCalledTimes(1);
        expect(fake2.completed).toHaveBeenCalledTimes(1);
      });
    });

    /*****************************************************/
    /* real bracket lists built from the mock tournament */
    /* (these need the real BracketList: run in the repo) */
    /*****************************************************/
    describe("with real bracket lists built from the mock tournament", () => {
      const minimalResults = players.map((p) => ({
        player_id: p.id,
        div_id: divId1,
      })) as unknown as tmntGameResult[];

      const buildRecords = (data: tmntFullType = mockTmntFullData): brktListRecord => {
        const record: brktListRecord = {};
        data.brkts.forEach((brkt) => {
          const list = new BracketList(
            brkt.id,
            defaultPlayersPerMatch,
            brkt.games,
            Array.from({ length: brkt.games }, (_, i) => brkt.start + i),
            undefined,
            { tmntFullData: data, divId: brkt.div_id },
          );
          list.updateBracketMatches(minimalResults);
          record[brkt.id] = list;
        });
        return record;
      };

      it("adds up each list's own earnings for the player", () => {
        const recs = buildRecords();

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

        expect(result.allComplete).toBe(true);
        expect(result.earnings).toBe(
          listFor(recs, brktId1).playerEarnings(player8) +
            listFor(recs, brktId2).playerEarnings(player8),
        );
      });

      it("counts player 1's entries and four refunds, two in each bracket", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, buildRecords(), player1);

        expect(result.allComplete).toBe(true);
        expect(result.entries).toBe(16);
        expect(result.entryAmount).toBe(80);
        expect(result.refunds).toBe(4);
        expect(result.refundAmount).toBe(20);
      });

      it("reconciles with the lists: entries paid for, minus refunds, equal the brackets each list seats the player in", () => {
        // the check on the finalizing step: what a player paid for is what the lists seat
        const recs = buildRecords();

        mockTmntFullData.brktEntries.forEach((entry) => {
          expect(entry.num_brackets - entry.num_refunds).toBe(
            listFor(recs, entry.brkt_id).playerBracketIdsSorted(entry.player_id).length,
          );
        });
      });

      it("matches the sum of each list's seats for a player with no refunds", () => {
        const recs = buildRecords();

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

        expect(result.entries).toBe(
          listFor(recs, brktId1).playerBracketIdsSorted(player8).length +
            listFor(recs, brktId2).playerBracketIdsSorted(player8).length,
        );
      });

      it("returns no totals while games are still to be bowled", () => {
        mockedToGameTypes.mockReturnValue(mockGames.filter((g) => g.game_num <= 2));

        expect(
          calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8),
        ).toEqual(noTotals);
      });

      it("returns no totals before any score is entered", () => {
        mockedToGameTypes.mockReturnValue([]);

        expect(
          calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8),
        ).toEqual(noTotals);
      });
    });
  });
});


// import React from "react";
// import { render, screen } from "@testing-library/react";
// import {
//   calcAllBrktSummaries,
//   getBrktSummaryDataError,
//   missingDataError,
// } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
// import { BracketList } from "@/components/brackets/bracketListClass";
// import type { brktListRecord } from "@/components/brackets/buildBrktLists";
// import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
// import { defaultPlayersPerMatch } from "@/lib/db/initVals";
// import type { tmntGameResult } from "@/lib/types/resultsTypes";
// import type { tmntFullType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   mockGames,
//   brktId1,
//   brktId2,
//   divId1,
// } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// // only the real-list tests reach this, through BracketList
// jest.mock("@/lib/tmntResultsToGameTypes", () => ({
//   tmntResultsToGameTypes: jest.fn(),
// }));
// const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

// /********************************************/
// /* fixtures built from mockTmntFullData     */
// /********************************************/
// const { players } = mockTmntFullData;
// const player1 = players[0].id; // $50 entry in each bracket, 10 brackets, 2 refunds
// const player8 = players[7].id; // $40 entry in each bracket, 8 brackets, no refunds

// const UNKNOWN_BRKT = "brk_unknown000000000000000000000000";
// const UNKNOWN_PLAYER = "ply_unknown000000000000000000000000";

// // a bracket list with the one member calcAllBrktSummaries uses
// const fakeList = (brktId: string, earnings: number, complete = true) =>
//   ({
//     brktId,
//     playerEarnings: jest.fn(() => earnings),
//     allBracketsCompleted: jest.fn(() => complete),
//   }) as unknown as BracketList;  

// const earningsSpy = (list: BracketList) =>
//   list.playerEarnings as unknown as jest.Mock;

// // the tournament with one bracket's settings changed
// const withBrkt = (
//   brktId: string,
//   overrides: Record<string, unknown>,
//   base: tmntFullType = mockTmntFullData,
// ): tmntFullType =>
//   ({
//     ...base,
//     brkts: base.brkts.map((b) => (b.id === brktId ? { ...b, ...overrides } : b)),
//   }) as unknown as tmntFullType;

// // the tournament with one entry's settings changed
// const withEntry = (
//   playerId: string,
//   brktId: string,
//   overrides: Record<string, unknown>,
//   base: tmntFullType = mockTmntFullData,
// ): tmntFullType =>
//   ({
//     ...base,
//     brktEntries: base.brktEntries.map((e) =>
//       e.player_id === playerId && e.brkt_id === brktId ? { ...e, ...overrides } : e,
//     ),
//   }) as unknown as tmntFullType;

// const withoutEntries = (
//   keep: (entry: tmntFullType["brktEntries"][number]) => boolean,
// ): tmntFullType => ({
//   ...mockTmntFullData,
//   brktEntries: mockTmntFullData.brktEntries.filter(keep),
// });

// const entryFor = (playerId: string, brktId: string) =>
//   mockTmntFullData.brktEntries.find(
//     (e) => e.player_id === playerId && e.brkt_id === brktId,
//   ); 

// const noTotals = {
//   allComplete: false,
//   entries: 0,
//   entryAmount: 0,
//   refunds: 0,
//   refundAmount: 0,
//   earnings: 0,
// };

// describe("playerBrktData", () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     mockedToGameTypes.mockReturnValue(mockGames);
//   });

//   describe("fixture sanity check", () => {
//     it("both mock brackets have a $5 fee and numeric first and second amounts", () => {
//       mockTmntFullData.brkts.forEach((b) => {
//         expect(b.fee).toBe("5");
//         expect(Number.isNaN(Number(b.first))).toBe(false);
//         expect(Number.isNaN(Number(b.second))).toBe(false);
//       });
//     });

//     it("player 1 has 10 brackets and 2 refunds, and player 8 has 8 brackets and none, in each bracket", () => {
//       [brktId1, brktId2].forEach((id) => {
//         expect(entryFor(player1, id)?.num_brackets).toBe(10);
//         expect(entryFor(player1, id)?.num_refunds).toBe(2);
//         expect(entryFor(player8, id)?.num_brackets).toBe(8);
//         expect(entryFor(player8, id)?.num_refunds ?? 0).toBe(0);
//       });
//     });
//   });

//   /********************/
//   /* missingDataError */
//   /********************/
//   describe("missingDataError", () => {
//     it("renders the message in a danger alert", () => {
//       render(missingDataError("Something is missing."));

//       const alert = screen.getByRole("alert");
//       expect(alert).toHaveTextContent("Something is missing.");
//       expect(alert).toHaveClass("alert", "alert-danger");
//     });

//     it("renders exactly one alert", () => {
//       render(missingDataError("One."));

//       expect(screen.getAllByRole("alert")).toHaveLength(1);
//     });

//     it("renders whatever message it is given", () => {
//       const { rerender } = render(missingDataError("First message."));
//       expect(screen.getByRole("alert")).toHaveTextContent("First message.");

//       rerender(missingDataError("Second message."));
//       expect(screen.getByRole("alert")).toHaveTextContent("Second message.");
//     });

//     it("renders an empty alert for an empty message", () => {
//       render(missingDataError(""));

//       expect(screen.getByRole("alert")).toBeEmptyDOMElement();
//     });

//     it("can be used inside another component", () => {
//       render(<div data-testid="outer">{missingDataError("Inside.")}</div>);

//       expect(screen.getByTestId("outer")).toContainElement(
//         screen.getByRole("alert"),
//       );
//     });
//   });

//   /****************************/
//   /* getBrktSummaryDataError  */
//   /****************************/
//   describe("getBrktSummaryDataError", () => {
//     it.each([
//       [brktId1, player1],
//       [brktId1, player8],
//       [brktId2, player1],
//       [brktId2, player8],
//     ])("returns null for good data (bracket %s, player %s)", (brktId, playerId) => {
//       expect(
//         getBrktSummaryDataError(mockTmntFullData, brktId, playerId),
//       ).toBeNull();
//     });

//     it("returns the bracket message, with the bracket id, when the bracket is not in the tournament", () => {
//       expect(
//         getBrktSummaryDataError(mockTmntFullData, UNKNOWN_BRKT, player8),
//       ).toBe(`Bracket configuration not found. Id: ${UNKNOWN_BRKT}`);
//     });

//     it("returns the bracket message when the tournament has no brackets", () => {
//       const data = { ...mockTmntFullData, brkts: [] };

//       expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
//         `Bracket configuration not found. Id: ${brktId1}`,
//       );
//     });

//     it("returns the entry message, with the player id, when the player has no entry in the bracket", () => {
//       const data = withoutEntries(
//         (e) => !(e.player_id === player8 && e.brkt_id === brktId1),
//       );

//       expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
//         `Player bracket entries not found. Id: ${player8}`,
//       );
//     });

//     it("returns the entry message for a player who is not in the tournament", () => {
//       expect(
//         getBrktSummaryDataError(mockTmntFullData, brktId1, UNKNOWN_PLAYER),
//       ).toBe(`Player bracket entries not found. Id: ${UNKNOWN_PLAYER}`);
//     });

//     it("returns the entry message when the tournament has no entries at all", () => {
//       const data = withoutEntries(() => false);

//       expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
//         `Player bracket entries not found. Id: ${player8}`,
//       );
//     });

//     it("only looks at the entry for the bracket asked about", () => {
//       // player 8 has no entry in bracket 2, but does in bracket 1
//       const data = withoutEntries(
//         (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
//       );

//       expect(getBrktSummaryDataError(data, brktId1, player8)).toBeNull();
//       expect(getBrktSummaryDataError(data, brktId2, player8)).toBe(
//         `Player bracket entries not found. Id: ${player8}`,
//       );
//     });

//     it("returns the fee message when the fee is not a number", () => {
//       expect(
//         getBrktSummaryDataError(
//           withBrkt(brktId1, { fee: "abc" }),
//           brktId1,
//           player8,
//         ),
//       ).toBe("Bracket fee not found.");
//     });

//     it("returns the fee message when the fee is empty", () => {
//       expect(
//         getBrktSummaryDataError(withBrkt(brktId1, { fee: "" }), brktId1, player8),
//       ).toBe("Bracket fee not found.");
//     });

//     it("returns the first amount message when the first amount is not a number", () => {
//       expect(
//         getBrktSummaryDataError(
//           withBrkt(brktId1, { first: "abc" }),
//           brktId1,
//           player8,
//         ),
//       ).toBe("Bracket first amount not found.");
//     });

//     it("returns the second amount message when the second amount is not a number", () => {
//       expect(
//         getBrktSummaryDataError(
//           withBrkt(brktId1, { second: "abc" }),
//           brktId1,
//           player8,
//         ),
//       ).toBe("Bracket second amount not found.");
//     });

//     it("checks only the bracket asked about", () => {
//       // bracket 2 has a bad fee; bracket 1 is fine
//       const data = withBrkt(brktId2, { fee: "abc" });

//       expect(getBrktSummaryDataError(data, brktId1, player8)).toBeNull();
//       expect(getBrktSummaryDataError(data, brktId2, player8)).toBe(
//         "Bracket fee not found.",
//       );
//     });

//     it("does not change the data it is given", () => {
//       const before = JSON.stringify(mockTmntFullData);

//       getBrktSummaryDataError(mockTmntFullData, brktId1, player8);

//       expect(JSON.stringify(mockTmntFullData)).toBe(before);
//     });

//     describe("the order of the checks", () => {
//       it("reports the bracket before the entry", () => {
//         const data = withoutEntries(() => false);

//         expect(getBrktSummaryDataError(data, UNKNOWN_BRKT, player8)).toBe(
//           `Bracket configuration not found. Id: ${UNKNOWN_BRKT}`,
//         );
//       });

//       it("reports the entry before the fee", () => {
//         const data = withoutEntries(
//           (e) => !(e.player_id === player8 && e.brkt_id === brktId1),
//         );
//         const bad = withBrkt(brktId1, { fee: "abc" }, data);

//         expect(getBrktSummaryDataError(bad, brktId1, player8)).toBe(
//           `Player bracket entries not found. Id: ${player8}`,
//         );
//       });

//       it("reports the fee before the first amount", () => {
//         const data = withBrkt(brktId1, { fee: "abc", first: "abc", second: "abc" });

//         expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
//           "Bracket fee not found.",
//         );
//       });

//       it("reports the first amount before the second amount", () => {
//         const data = withBrkt(brktId1, { first: "abc", second: "abc" });

//         expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
//           "Bracket first amount not found.",
//         );
//       });
//     });

//   });

//   /**************************/
//   /* calcAllBrktSummaries   */
//   /**************************/
//   describe("calcAllBrktSummaries", () => {
//     const records = (e1 = 25, e2 = 10): brktListRecord => ({
//       [brktId1]: fakeList(brktId1, e1),
//       [brktId2]: fakeList(brktId2, e2),
//     });

//     describe("with fake lists", () => {
//       it("adds up the entries, refunds and earnings of every bracket the player has an entry in", () => {
//         const result = calcAllBrktSummaries(mockTmntFullData, records(), player1);

//         // 2 brackets x (10 - 2) entries, 2 refunds each, at $5
//         expect(result).toEqual({
//           allComplete: true,
//           entries: 16,
//           entryAmount: 80,
//           refunds: 4,
//           refundAmount: 20,
//           earnings: 35,
//         });
//       });

//       it("gives no refunds for a player who has none", () => {
//         const result = calcAllBrktSummaries(mockTmntFullData, records(), player8);

//         expect(result).toEqual({
//           allComplete: true,
//           entries: 16,
//           entryAmount: 80,
//           refunds: 0,
//           refundAmount: 0,
//           earnings: 35,
//         });
//       });

//       it("takes the entries from the entry rows, not from the list", () => {
//         const recs = records();

//         const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

//         // the fake lists have no playerBracketIdsSorted, so any use of it would throw
//         expect(result.entries).toBe(16);
//       });

//       it("uses each bracket's own fee", () => {
//         const data = withBrkt(brktId2, { fee: "10" });

//         const result = calcAllBrktSummaries(data, records(), player1);

//         expect(result.entryAmount).toBe(8 * 5 + 8 * 10);
//         expect(result.refundAmount).toBe(2 * 5 + 2 * 10);
//       });

//       it("uses the entry for each bracket", () => {
//         const data = withEntry(player1, brktId2, { num_brackets: 12, num_refunds: 4 });

//         const result = calcAllBrktSummaries(data, records(), player1);

//         expect(result.entries).toBe(8 + (12 - 4));
//         expect(result.refunds).toBe(2 + 4);
//         expect(result.entryAmount).toBe(5 * 16);
//         expect(result.refundAmount).toBe(5 * 6);
//       });

//       it("asks each bracket list for the player's earnings, once", () => {
//         const recs = records();

//         calcAllBrktSummaries(mockTmntFullData, recs, player1);

//         Object.values(recs).forEach((list) => {
//           expect(earningsSpy(list)).toHaveBeenCalledTimes(1);
//           expect(earningsSpy(list)).toHaveBeenCalledWith(player1);
//         });
//       });

//       it("returns zeros for a player with no entries", () => {
//         expect(
//           calcAllBrktSummaries(mockTmntFullData, records(), UNKNOWN_PLAYER),
//         ).toEqual(noTotals);
//       });

//       it("does not ask for earnings when the player has no entries", () => {
//         const recs = records();

//         calcAllBrktSummaries(mockTmntFullData, recs, UNKNOWN_PLAYER);

//         Object.values(recs).forEach((list) => {
//           expect(earningsSpy(list)).not.toHaveBeenCalled();
//         });
//       });

//       it("returns zeros when the tournament has no entries", () => {
//         const data = withoutEntries(() => false);

//         expect(calcAllBrktSummaries(data, records(), player1)).toEqual(noTotals);
//       });

//       it("returns zeros when there are no bracket lists", () => {
//         expect(calcAllBrktSummaries(mockTmntFullData, {}, player1)).toEqual(noTotals);
//       });

//       it("skips a bracket that has no list, including its entries and refunds", () => {
//         const recs = { [brktId1]: fakeList(brktId1, 25) } as brktListRecord;

//         const result = calcAllBrktSummaries(mockTmntFullData, recs, player1);

//         expect(result).toEqual({
//           allComplete: true,
//           entries: 8,
//           entryAmount: 40,
//           refunds: 2,
//           refundAmount: 10,
//           earnings: 25,
//         });
//       });

//       it("ignores bracket lists the player has no entry in", () => {
//         const data = withoutEntries(
//           (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
//         );
//         const recs = records();

//         const result = calcAllBrktSummaries(data, recs, player8);

//         expect(result.entries).toBe(8);
//         expect(result.earnings).toBe(25);
//         expect(earningsSpy(recs[brktId2])).not.toHaveBeenCalled();
//       });

//       it("ignores other players' entries", () => {
//         const data = withoutEntries((e) => e.player_id === player1);

//         const result = calcAllBrktSummaries(data, records(), player8);

//         expect(result.entries).toBe(0);
//         expect(result.earnings).toBe(0);
//       });

//       it("treats a bracket with no fee as a $0 bracket", () => {
//         const data = withBrkt(brktId1, { fee: undefined });

//         const result = calcAllBrktSummaries(data, records(), player1);

//         // bracket 1 contributes entries and refunds, but no money
//         expect(result.entries).toBe(16);
//         expect(result.entryAmount).toBe(8 * 5);
//         expect(result.refundAmount).toBe(2 * 5);
//       });

//       it("keeps counting when the earnings of a bracket are 0", () => {
//         const result = calcAllBrktSummaries(mockTmntFullData, records(0, 0), player1);

//         expect(result.earnings).toBe(0);
//         expect(result.entries).toBe(16);
//       });

//       it("returns a new object each time, and does not change the data", () => {
//         const before = JSON.stringify(mockTmntFullData);

//         const first = calcAllBrktSummaries(mockTmntFullData, records(), player1);
//         const second = calcAllBrktSummaries(mockTmntFullData, records(), player1);

//         expect(second).toEqual(first);
//         expect(second).not.toBe(first);
//         expect(JSON.stringify(mockTmntFullData)).toBe(before);
//       });

//       it("is not complete when none of the player's brackets has a list", () => {
//         const result = calcAllBrktSummaries(
//           mockTmntFullData,
//           { brk_unrelated: fakeList("brk_unrelated", 99) } as brktListRecord,
//           player1,
//         );

//         expect(result).toEqual(noTotals);
//       });

//       it("is complete when at least one bracket was counted and the other has no list", () => {
//         const recs = { [brktId1]: fakeList(brktId1, 25) } as brktListRecord;

//         const result = calcAllBrktSummaries(mockTmntFullData, recs, player1);

//         expect(result.allComplete).toBe(true);
//         expect(result.entries).toBe(8);
//       });

//       describe("when a bracket is not complete", () => {
//         // returns zeros: the totals of an unfinished tournament are not final

//         it("sets allComplete to false and returns no totals when one bracket is not complete", () => {
//           const recs: brktListRecord = {
//             [brktId1]: fakeList(brktId1, 25),
//             [brktId2]: fakeList(brktId2, 10, false),
//           };

//           expect(calcAllBrktSummaries(mockTmntFullData, recs, player1)).toEqual(
//             noTotals,
//           );
//         });

//         it("returns the same result whichever bracket is the incomplete one", () => {
//           const first: brktListRecord = {
//             [brktId1]: fakeList(brktId1, 25, false),
//             [brktId2]: fakeList(brktId2, 10),
//           };

//           expect(calcAllBrktSummaries(mockTmntFullData, first, player1)).toEqual(
//             noTotals,
//           );
//         });

//         it("sets allComplete to false when every bracket is incomplete", () => {
//           const recs: brktListRecord = {
//             [brktId1]: fakeList(brktId1, 0, false),
//             [brktId2]: fakeList(brktId2, 0, false),
//           };

//           expect(
//             calcAllBrktSummaries(mockTmntFullData, recs, player1).allComplete,
//           ).toBe(false);
//         });

//         it("does not ask for earnings from a bracket once an incomplete one is found", () => {
//           const incomplete = fakeList(brktId1, 25, false);
//           const later = fakeList(brktId2, 10);

//           calcAllBrktSummaries(
//             mockTmntFullData,
//             { [brktId1]: incomplete, [brktId2]: later },
//             player1,
//           );

//           expect(earningsSpy(incomplete)).not.toHaveBeenCalled();
//           expect(
//             (later.allBracketsCompleted as unknown as jest.Mock),
//           ).not.toHaveBeenCalled();
//         });

//         it("sets allComplete to true when every bracket is complete", () => {
//           expect(
//             calcAllBrktSummaries(mockTmntFullData, records(), player1)
//               .allComplete,
//           ).toBe(true);
//         });

//         it("ignores a bracket the player has no entry in, even if it is incomplete", () => {
//           const data = withoutEntries(
//             (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
//           );
//           const recs: brktListRecord = {
//             [brktId1]: fakeList(brktId1, 25),
//             [brktId2]: fakeList(brktId2, 10, false),
//           };

//           const result = calcAllBrktSummaries(data, recs, player8);

//           expect(result.allComplete).toBe(true);
//           expect(result.earnings).toBe(25);
//         });

//         it("skips a bracket with no list and does not treat it as incomplete", () => {
//           const recs = {
//             [brktId1]: fakeList(brktId1, 25),
//           } as brktListRecord;

//           expect(
//             calcAllBrktSummaries(mockTmntFullData, recs, player1).allComplete,
//           ).toBe(true);
//         });
//       });

//     });

//     describe("a missing number of refunds", () => {
//       const noRefundsValue = (value: undefined | null) =>
//         withEntry(player1, brktId1, { num_refunds: value });

//       it.each([
//         ["undefined", undefined],
//         ["null", null],
//       ])("treats %s as no refunds, with finite totals", (_label, value) => {
//         const result = calcAllBrktSummaries(
//           noRefundsValue(value),
//           records(),
//           player1,
//         );

//         // bracket 1: 10 entries, no refunds; bracket 2: 10 - 2 entries, 2 refunds
//         expect(result.entries).toBe(10 + 8);
//         expect(result.refunds).toBe(2);
//         expect(result.entryAmount).toBe(5 * 18);
//         expect(result.refundAmount).toBe(10);
//         expect(Number.isNaN(result.entries)).toBe(false);
//         expect(Number.isNaN(result.entryAmount)).toBe(false);
//         expect(Number.isNaN(result.refundAmount)).toBe(false);
//       });
//     });

//     function records2() {
//       return records();
//     }

//     describe("the order of the brackets", () => {
//       it("gives the same totals whatever order the entries are in", () => {
//         const reversed: tmntFullType = {
//           ...mockTmntFullData,
//           brktEntries: [...mockTmntFullData.brktEntries].reverse(),
//         };

//         expect(calcAllBrktSummaries(reversed, records(), player1)).toEqual(
//           calcAllBrktSummaries(mockTmntFullData, records2(), player1),
//         );
//       });
//     });

//     /*****************************************************/
//     /* real bracket lists built from the mock tournament */
//     /*****************************************************/
//     describe("with real bracket lists built from the mock tournament", () => {
//       const minimalResults = players.map((p) => ({
//         player_id: p.id,
//         div_id: divId1,
//       })) as unknown as tmntGameResult[];

//       const buildRecords = (data: tmntFullType = mockTmntFullData) => {
//         const record: brktListRecord = {};
//         data.brkts.forEach((brkt) => {
//           const list = new BracketList(
//             brkt.id,
//             defaultPlayersPerMatch,
//             brkt.games,
//             Array.from({ length: brkt.games }, (_, i) => brkt.start + i),
//             undefined,
//             { tmntFullData: data, divId: brkt.div_id },
//           );
//           list.updateBracketMatches(minimalResults);
//           record[brkt.id] = list;
//         });
//         return record;
//       };

//       it("adds up each list's own earnings for the player", () => {
//         const recs = buildRecords();

//         const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

//         expect(result.earnings).toBe(
//           recs[brktId1].playerEarnings(player8) +
//             recs[brktId2].playerEarnings(player8),
//         );
//         // player 8 wins the first bracket of each list
//         expect(result.earnings).toBeGreaterThanOrEqual(50);
//       });

//       it("counts player 1's four refunds, two in each bracket", () => {
//         const result = calcAllBrktSummaries(
//           mockTmntFullData,
//           buildRecords(),
//           player1,
//         );

//         expect(result.refunds).toBe(4);
//         expect(result.refundAmount).toBe(20);
//       });

//       it("the total paid equals the fees on the player's entries: the brackets played plus the unused ones", () => {
//         const result = calcAllBrktSummaries(
//           mockTmntFullData,
//           buildRecords(),
//           player1,
//         );

//         const entryFees = mockTmntFullData.brktEntries
//           .filter((e) => e.player_id === player1)
//           .reduce((sum, e) => sum + Number(e.fee), 0);

//         expect(result.entryAmount + result.refundAmount).toBe(entryFees);
//       });

//       it("reconciles with the lists: entries paid for, minus refunds, equal the brackets each list seats the player in", () => {
//         // the check on the finalizing step: what a player paid for is what the lists seat
//         const recs = buildRecords();

//         players.forEach((p) => {
//           [brktId1, brktId2].forEach((brktId) => {
//             const entry = entryFor(p.id, brktId);
//             if (!entry) return;
//             expect(entry.num_brackets - (entry.num_refunds ?? 0)).toBe(
//               recs[brktId].playerBracketIdsSorted(p.id).length,
//             );
//           });
//         });
//       });

//       it("matches the sum of each list's seats for a player with no refunds", () => {
//         const recs = buildRecords();

//         const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

//         expect(result.entries).toBe(
//           recs[brktId1].playerBracketIdsSorted(player8).length +
//             recs[brktId2].playerBracketIdsSorted(player8).length,
//         );
//       });

//       it("sets allComplete to true when every match of every bracket has been played", () => {
//         expect(
//           calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8)
//             .allComplete,
//         ).toBe(true);
//       });

//       it("sets allComplete to false, with no totals, while games are still to be bowled", () => {
//         mockedToGameTypes.mockReturnValue(
//           mockGames.filter((g) => g.game_num <= 2),
//         );

//         const result = calcAllBrktSummaries(
//           mockTmntFullData,
//           buildRecords(),
//           player8,
//         );

//         expect(result.allComplete).toBe(false);
//         expect(result.earnings).toBe(0);
//         expect(result.entries).toBe(0);
//       });

//       it("sets allComplete to false before any score is entered", () => {
//         mockedToGameTypes.mockReturnValue([]);

//         expect(
//           calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8)
//             .allComplete,
//         ).toBe(false);
//       });      
//     });
//   });
// });
