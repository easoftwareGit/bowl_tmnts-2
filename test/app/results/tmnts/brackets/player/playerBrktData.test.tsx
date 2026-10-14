import React from "react";
import { render, screen } from "@testing-library/react";
import {
  calcAllBrktSummaries,
  getBrktSummaryDataError,
  missingDataError,
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
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// only the real-list tests reach this, through BracketList
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));
const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const player1 = players[0].id; // $50 entry in each bracket, 10 brackets, 2 refunds
const player8 = players[7].id; // $40 entry in each bracket, 8 brackets, no refunds

const UNKNOWN_BRKT = "brk_unknown000000000000000000000000";
const UNKNOWN_PLAYER = "ply_unknown000000000000000000000000";

// a bracket list with the one member calcAllBrktSummaries uses
const fakeList = (brktId: string, earnings: number, complete = true) =>
  ({
    brktId,
    playerEarnings: jest.fn(() => earnings),
    allBracketsCompleted: jest.fn(() => complete),
  }) as unknown as BracketList;  

const earningsSpy = (list: BracketList) =>
  list.playerEarnings as unknown as jest.Mock;

// the tournament with one bracket's settings changed
const withBrkt = (
  brktId: string,
  overrides: Record<string, unknown>,
  base: tmntFullType = mockTmntFullData,
): tmntFullType =>
  ({
    ...base,
    brkts: base.brkts.map((b) => (b.id === brktId ? { ...b, ...overrides } : b)),
  }) as unknown as tmntFullType;

// the tournament with one entry's settings changed
const withEntry = (
  playerId: string,
  brktId: string,
  overrides: Record<string, unknown>,
  base: tmntFullType = mockTmntFullData,
): tmntFullType =>
  ({
    ...base,
    brktEntries: base.brktEntries.map((e) =>
      e.player_id === playerId && e.brkt_id === brktId ? { ...e, ...overrides } : e,
    ),
  }) as unknown as tmntFullType;

const withoutEntries = (
  keep: (entry: tmntFullType["brktEntries"][number]) => boolean,
): tmntFullType => ({
  ...mockTmntFullData,
  brktEntries: mockTmntFullData.brktEntries.filter(keep),
});

const entryFor = (playerId: string, brktId: string) =>
  mockTmntFullData.brktEntries.find(
    (e) => e.player_id === playerId && e.brkt_id === brktId,
  ); 

const noTotals = {
  allComplete: false,
  entries: 0,
  entryAmount: 0,
  refunds: 0,
  refundAmount: 0,
  earnings: 0,
};

describe("playerBrktData", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("both mock brackets have a $5 fee and numeric first and second amounts", () => {
      mockTmntFullData.brkts.forEach((b) => {
        expect(b.fee).toBe("5");
        expect(Number.isNaN(Number(b.first))).toBe(false);
        expect(Number.isNaN(Number(b.second))).toBe(false);
      });
    });

    it("player 1 has 10 brackets and 2 refunds, and player 8 has 8 brackets and none, in each bracket", () => {
      [brktId1, brktId2].forEach((id) => {
        expect(entryFor(player1, id)?.num_brackets).toBe(10);
        expect(entryFor(player1, id)?.num_refunds).toBe(2);
        expect(entryFor(player8, id)?.num_brackets).toBe(8);
        expect(entryFor(player8, id)?.num_refunds ?? 0).toBe(0);
      });
    });
  });

  /********************/
  /* missingDataError */
  /********************/
  describe("missingDataError", () => {
    it("renders the message in a danger alert", () => {
      render(missingDataError("Something is missing."));

      const alert = screen.getByRole("alert");
      expect(alert).toHaveTextContent("Something is missing.");
      expect(alert).toHaveClass("alert", "alert-danger");
    });

    it("renders exactly one alert", () => {
      render(missingDataError("One."));

      expect(screen.getAllByRole("alert")).toHaveLength(1);
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
      expect(
        getBrktSummaryDataError(mockTmntFullData, brktId, playerId),
      ).toBeNull();
    });

    it("returns the bracket message, with the bracket id, when the bracket is not in the tournament", () => {
      expect(
        getBrktSummaryDataError(mockTmntFullData, UNKNOWN_BRKT, player8),
      ).toBe(`Bracket configuration not found. Id: ${UNKNOWN_BRKT}`);
    });

    it("returns the bracket message when the tournament has no brackets", () => {
      const data = { ...mockTmntFullData, brkts: [] };

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Bracket configuration not found. Id: ${brktId1}`,
      );
    });

    it("returns the entry message, with the player id, when the player has no entry in the bracket", () => {
      const data = withoutEntries(
        (e) => !(e.player_id === player8 && e.brkt_id === brktId1),
      );

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it("returns the entry message for a player who is not in the tournament", () => {
      expect(
        getBrktSummaryDataError(mockTmntFullData, brktId1, UNKNOWN_PLAYER),
      ).toBe(`Player bracket entries not found. Id: ${UNKNOWN_PLAYER}`);
    });

    it("returns the entry message when the tournament has no entries at all", () => {
      const data = withoutEntries(() => false);

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it("only looks at the entry for the bracket asked about", () => {
      // player 8 has no entry in bracket 2, but does in bracket 1
      const data = withoutEntries(
        (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
      );

      expect(getBrktSummaryDataError(data, brktId1, player8)).toBeNull();
      expect(getBrktSummaryDataError(data, brktId2, player8)).toBe(
        `Player bracket entries not found. Id: ${player8}`,
      );
    });

    it("returns the fee message when the fee is not a number", () => {
      expect(
        getBrktSummaryDataError(
          withBrkt(brktId1, { fee: "abc" }),
          brktId1,
          player8,
        ),
      ).toBe("Bracket fee not found.");
    });

    it("returns the fee message when the fee is empty", () => {
      expect(
        getBrktSummaryDataError(withBrkt(brktId1, { fee: "" }), brktId1, player8),
      ).toBe("Bracket fee not found.");
    });

    it("returns the first amount message when the first amount is not a number", () => {
      expect(
        getBrktSummaryDataError(
          withBrkt(brktId1, { first: "abc" }),
          brktId1,
          player8,
        ),
      ).toBe("Bracket first amount not found.");
    });

    it("returns the second amount message when the second amount is not a number", () => {
      expect(
        getBrktSummaryDataError(
          withBrkt(brktId1, { second: "abc" }),
          brktId1,
          player8,
        ),
      ).toBe("Bracket second amount not found.");
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
        const data = withoutEntries(() => false);

        expect(getBrktSummaryDataError(data, UNKNOWN_BRKT, player8)).toBe(
          `Bracket configuration not found. Id: ${UNKNOWN_BRKT}`,
        );
      });

      it("reports the entry before the fee", () => {
        const data = withoutEntries(
          (e) => !(e.player_id === player8 && e.brkt_id === brktId1),
        );
        const bad = withBrkt(brktId1, { fee: "abc" }, data);

        expect(getBrktSummaryDataError(bad, brktId1, player8)).toBe(
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
    const records = (e1 = 25, e2 = 10): brktListRecord => ({
      [brktId1]: fakeList(brktId1, e1),
      [brktId2]: fakeList(brktId2, e2),
    });

    describe("with fake lists", () => {
      it("adds up the entries, refunds and earnings of every bracket the player has an entry in", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, records(), player1);

        // 2 brackets x (10 - 2) entries, 2 refunds each, at $5
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
        const result = calcAllBrktSummaries(mockTmntFullData, records(), player8);

        expect(result).toEqual({
          allComplete: true,
          entries: 16,
          entryAmount: 80,
          refunds: 0,
          refundAmount: 0,
          earnings: 35,
        });
      });

      it("takes the entries from the entry rows, not from the list", () => {
        const recs = records();

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

        // the fake lists have no playerBracketIdsSorted, so any use of it would throw
        expect(result.entries).toBe(16);
      });

      it("uses each bracket's own fee", () => {
        const data = withBrkt(brktId2, { fee: "10" });

        const result = calcAllBrktSummaries(data, records(), player1);

        expect(result.entryAmount).toBe(8 * 5 + 8 * 10);
        expect(result.refundAmount).toBe(2 * 5 + 2 * 10);
      });

      it("uses the entry for each bracket", () => {
        const data = withEntry(player1, brktId2, { num_brackets: 12, num_refunds: 4 });

        const result = calcAllBrktSummaries(data, records(), player1);

        expect(result.entries).toBe(8 + (12 - 4));
        expect(result.refunds).toBe(2 + 4);
        expect(result.entryAmount).toBe(5 * 16);
        expect(result.refundAmount).toBe(5 * 6);
      });

      it("asks each bracket list for the player's earnings, once", () => {
        const recs = records();

        calcAllBrktSummaries(mockTmntFullData, recs, player1);

        Object.values(recs).forEach((list) => {
          expect(earningsSpy(list)).toHaveBeenCalledTimes(1);
          expect(earningsSpy(list)).toHaveBeenCalledWith(player1);
        });
      });

      it("returns zeros for a player with no entries", () => {
        expect(
          calcAllBrktSummaries(mockTmntFullData, records(), UNKNOWN_PLAYER),
        ).toEqual(noTotals);
      });

      it("does not ask for earnings when the player has no entries", () => {
        const recs = records();

        calcAllBrktSummaries(mockTmntFullData, recs, UNKNOWN_PLAYER);

        Object.values(recs).forEach((list) => {
          expect(earningsSpy(list)).not.toHaveBeenCalled();
        });
      });

      it("returns zeros when the tournament has no entries", () => {
        const data = withoutEntries(() => false);

        expect(calcAllBrktSummaries(data, records(), player1)).toEqual(noTotals);
      });

      it("returns zeros when there are no bracket lists", () => {
        expect(calcAllBrktSummaries(mockTmntFullData, {}, player1)).toEqual(noTotals);
      });

      it("skips a bracket that has no list, including its entries and refunds", () => {
        const recs = { [brktId1]: fakeList(brktId1, 25) } as brktListRecord;

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player1);

        expect(result).toEqual({
          allComplete: true,
          entries: 8,
          entryAmount: 40,
          refunds: 2,
          refundAmount: 10,
          earnings: 25,
        });
      });

      it("ignores bracket lists the player has no entry in", () => {
        const data = withoutEntries(
          (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
        );
        const recs = records();

        const result = calcAllBrktSummaries(data, recs, player8);

        expect(result.entries).toBe(8);
        expect(result.earnings).toBe(25);
        expect(earningsSpy(recs[brktId2])).not.toHaveBeenCalled();
      });

      it("ignores other players' entries", () => {
        const data = withoutEntries((e) => e.player_id === player1);

        const result = calcAllBrktSummaries(data, records(), player8);

        expect(result.entries).toBe(0);
        expect(result.earnings).toBe(0);
      });

      it("treats a bracket with no fee as a $0 bracket", () => {
        const data = withBrkt(brktId1, { fee: undefined });

        const result = calcAllBrktSummaries(data, records(), player1);

        // bracket 1 contributes entries and refunds, but no money
        expect(result.entries).toBe(16);
        expect(result.entryAmount).toBe(8 * 5);
        expect(result.refundAmount).toBe(2 * 5);
      });

      it("keeps counting when the earnings of a bracket are 0", () => {
        const result = calcAllBrktSummaries(mockTmntFullData, records(0, 0), player1);

        expect(result.earnings).toBe(0);
        expect(result.entries).toBe(16);
      });

      it("returns a new object each time, and does not change the data", () => {
        const before = JSON.stringify(mockTmntFullData);

        const first = calcAllBrktSummaries(mockTmntFullData, records(), player1);
        const second = calcAllBrktSummaries(mockTmntFullData, records(), player1);

        expect(second).toEqual(first);
        expect(second).not.toBe(first);
        expect(JSON.stringify(mockTmntFullData)).toBe(before);
      });

      it("is not complete when none of the player's brackets has a list", () => {
        const result = calcAllBrktSummaries(
          mockTmntFullData,
          { brk_unrelated: fakeList("brk_unrelated", 99) } as brktListRecord,
          player1,
        );

        expect(result).toEqual(noTotals);
      });

      it("is complete when at least one bracket was counted and the other has no list", () => {
        const recs = { [brktId1]: fakeList(brktId1, 25) } as brktListRecord;

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player1);

        expect(result.allComplete).toBe(true);
        expect(result.entries).toBe(8);
      });

      describe("when a bracket is not complete", () => {
        // returns zeros: the totals of an unfinished tournament are not final

        it("sets allComplete to false and returns no totals when one bracket is not complete", () => {
          const recs: brktListRecord = {
            [brktId1]: fakeList(brktId1, 25),
            [brktId2]: fakeList(brktId2, 10, false),
          };

          expect(calcAllBrktSummaries(mockTmntFullData, recs, player1)).toEqual(
            noTotals,
          );
        });

        it("returns the same result whichever bracket is the incomplete one", () => {
          const first: brktListRecord = {
            [brktId1]: fakeList(brktId1, 25, false),
            [brktId2]: fakeList(brktId2, 10),
          };

          expect(calcAllBrktSummaries(mockTmntFullData, first, player1)).toEqual(
            noTotals,
          );
        });

        it("sets allComplete to false when every bracket is incomplete", () => {
          const recs: brktListRecord = {
            [brktId1]: fakeList(brktId1, 0, false),
            [brktId2]: fakeList(brktId2, 0, false),
          };

          expect(
            calcAllBrktSummaries(mockTmntFullData, recs, player1).allComplete,
          ).toBe(false);
        });

        it("does not ask for earnings from a bracket once an incomplete one is found", () => {
          const incomplete = fakeList(brktId1, 25, false);
          const later = fakeList(brktId2, 10);

          calcAllBrktSummaries(
            mockTmntFullData,
            { [brktId1]: incomplete, [brktId2]: later },
            player1,
          );

          expect(earningsSpy(incomplete)).not.toHaveBeenCalled();
          expect(
            (later.allBracketsCompleted as unknown as jest.Mock),
          ).not.toHaveBeenCalled();
        });

        it("sets allComplete to true when every bracket is complete", () => {
          expect(
            calcAllBrktSummaries(mockTmntFullData, records(), player1)
              .allComplete,
          ).toBe(true);
        });

        it("ignores a bracket the player has no entry in, even if it is incomplete", () => {
          const data = withoutEntries(
            (e) => !(e.player_id === player8 && e.brkt_id === brktId2),
          );
          const recs: brktListRecord = {
            [brktId1]: fakeList(brktId1, 25),
            [brktId2]: fakeList(brktId2, 10, false),
          };

          const result = calcAllBrktSummaries(data, recs, player8);

          expect(result.allComplete).toBe(true);
          expect(result.earnings).toBe(25);
        });

        it("skips a bracket with no list and does not treat it as incomplete", () => {
          const recs = {
            [brktId1]: fakeList(brktId1, 25),
          } as brktListRecord;

          expect(
            calcAllBrktSummaries(mockTmntFullData, recs, player1).allComplete,
          ).toBe(true);
        });
      });

    });

    describe("a missing number of refunds", () => {
      const noRefundsValue = (value: undefined | null) =>
        withEntry(player1, brktId1, { num_refunds: value });

      it.each([
        ["undefined", undefined],
        ["null", null],
      ])("treats %s as no refunds, with finite totals", (_label, value) => {
        const result = calcAllBrktSummaries(
          noRefundsValue(value),
          records(),
          player1,
        );

        // bracket 1: 10 entries, no refunds; bracket 2: 10 - 2 entries, 2 refunds
        expect(result.entries).toBe(10 + 8);
        expect(result.refunds).toBe(2);
        expect(result.entryAmount).toBe(5 * 18);
        expect(result.refundAmount).toBe(10);
        expect(Number.isNaN(result.entries)).toBe(false);
        expect(Number.isNaN(result.entryAmount)).toBe(false);
        expect(Number.isNaN(result.refundAmount)).toBe(false);
      });
    });

    function records2() {
      return records();
    }

    describe("the order of the brackets", () => {
      it("gives the same totals whatever order the entries are in", () => {
        const reversed: tmntFullType = {
          ...mockTmntFullData,
          brktEntries: [...mockTmntFullData.brktEntries].reverse(),
        };

        expect(calcAllBrktSummaries(reversed, records(), player1)).toEqual(
          calcAllBrktSummaries(mockTmntFullData, records2(), player1),
        );
      });
    });

    /*****************************************************/
    /* real bracket lists built from the mock tournament */
    /*****************************************************/
    describe("with real bracket lists built from the mock tournament", () => {
      const minimalResults = players.map((p) => ({
        player_id: p.id,
        div_id: divId1,
      })) as unknown as tmntGameResult[];

      const buildRecords = (data: tmntFullType = mockTmntFullData) => {
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

        expect(result.earnings).toBe(
          recs[brktId1].playerEarnings(player8) +
            recs[brktId2].playerEarnings(player8),
        );
        // player 8 wins the first bracket of each list
        expect(result.earnings).toBeGreaterThanOrEqual(50);
      });

      it("counts player 1's four refunds, two in each bracket", () => {
        const result = calcAllBrktSummaries(
          mockTmntFullData,
          buildRecords(),
          player1,
        );

        expect(result.refunds).toBe(4);
        expect(result.refundAmount).toBe(20);
      });

      it("the total paid equals the fees on the player's entries: the brackets played plus the unused ones", () => {
        const result = calcAllBrktSummaries(
          mockTmntFullData,
          buildRecords(),
          player1,
        );

        const entryFees = mockTmntFullData.brktEntries
          .filter((e) => e.player_id === player1)
          .reduce((sum, e) => sum + Number(e.fee), 0);

        expect(result.entryAmount + result.refundAmount).toBe(entryFees);
      });

      it("reconciles with the lists: entries paid for, minus refunds, equal the brackets each list seats the player in", () => {
        // the check on the finalizing step: what a player paid for is what the lists seat
        const recs = buildRecords();

        players.forEach((p) => {
          [brktId1, brktId2].forEach((brktId) => {
            const entry = entryFor(p.id, brktId);
            if (!entry) return;
            expect(entry.num_brackets - (entry.num_refunds ?? 0)).toBe(
              recs[brktId].playerBracketIdsSorted(p.id).length,
            );
          });
        });
      });

      it("matches the sum of each list's seats for a player with no refunds", () => {
        const recs = buildRecords();

        const result = calcAllBrktSummaries(mockTmntFullData, recs, player8);

        expect(result.entries).toBe(
          recs[brktId1].playerBracketIdsSorted(player8).length +
            recs[brktId2].playerBracketIdsSorted(player8).length,
        );
      });

      it("sets allComplete to true when every match of every bracket has been played", () => {
        expect(
          calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8)
            .allComplete,
        ).toBe(true);
      });

      it("sets allComplete to false, with no totals, while games are still to be bowled", () => {
        mockedToGameTypes.mockReturnValue(
          mockGames.filter((g) => g.game_num <= 2),
        );

        const result = calcAllBrktSummaries(
          mockTmntFullData,
          buildRecords(),
          player8,
        );

        expect(result.allComplete).toBe(false);
        expect(result.earnings).toBe(0);
        expect(result.entries).toBe(0);
      });

      it("sets allComplete to false before any score is entered", () => {
        mockedToGameTypes.mockReturnValue([]);

        expect(
          calcAllBrktSummaries(mockTmntFullData, buildRecords(), player8)
            .allComplete,
        ).toBe(false);
      });      
    });
  });
});