// test/app/results/tmnts/brackets/player/allBrktsSummary.test.tsx
import React from "react";
import { render, screen, within } from "@testing-library/react";
import AllBrktsSummary from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/allBrktsSummary";
import { calcAllBrktSummaries } from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerBrktData";
import { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import { fullName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getLocaleConfig } from "@/lib/currency/components/utils";
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
const player1 = players[0]; // 10 brackets and 2 refunds in each bracket
const player8 = players[7]; // 8 brackets and no refunds in each bracket
const nameOf = (p: (typeof players)[number]) =>
  fullName(p.first_name, p.last_name).trim();

const BOTH = [brktId1, brktId2];

// the same currency setup the component uses
const currencyConfig = getLocaleConfig({ locale: "en-US" });
currencyConfig.prefix = "$";
const fmt = (n: number) => formatValueSymbSep2Dec(String(n), currencyConfig);

const SUMMARY_TITLE = "Summary for all divisions";
const NOT_COMPLETE = "All brackets not complete";

// the lines of the box
const entriesLine = (count: number, amount: number) =>
  `${count} ${count === 1 ? "entry" : "entries"} = ${fmt(amount)}`;
const unusedLine = (count: number, amount: number) =>
  `${count} unused = ${fmt(amount)}`;
const totalPaidLine = (amount: number) => `Total Paid: ${fmt(amount)}`;
const earningsLine = (amount: number) => `Earnings: ${fmt(amount)}`;
const refundsLine = (amount: number) => `Refunds: ${fmt(amount)}`;
const totalReturnedLine = (amount: number) => `Total Returned: ${fmt(amount)}`;

// a regular expression that finds the parts in the given order, with anything between
const inOrder = (...parts: string[]) =>
  new RegExp(
    parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")
  );

/***********************/
/* bracket list fakes  */
/***********************/
// the two members calcAllBrktSummaries uses
const fakeList = (brktId: string, earnings: number, complete = true) =>
  ({
    brktId,
    playerEarnings: jest.fn(() => earnings),
    allBracketsCompleted: jest.fn(() => complete),
  }) as unknown as BracketList;

type RecordOpts = {
  earnings1?: number;
  earnings2?: number;
  complete1?: boolean;
  complete2?: boolean;
};

const makeRecords = ({
  earnings1 = 25,
  earnings2 = 10,
  complete1 = true,
  complete2 = true,
}: RecordOpts = {}): brktListRecord => ({
  [brktId1]: fakeList(brktId1, earnings1, complete1),
  [brktId2]: fakeList(brktId2, earnings2, complete2),
});

/***********/
/* helpers */
/***********/
type RenderOpts = {
  data?: tmntFullType;
  records?: brktListRecord;
  player?: (typeof players)[number];
  brktIds?: string[];
};

const renderSummary = ({
  data = mockTmntFullData,
  records = makeRecords(),
  player = player8,
  brktIds = BOTH,
}: RenderOpts = {}) =>
  render(
    <AllBrktsSummary
      tmntFullData={data}
      brktListRecords={records}
      playerId={player.id}
      playerName={nameOf(player)}
      brktIds={brktIds}
    />
  );

const earningsSpy = (list: BracketList) =>
  list.playerEarnings as unknown as jest.Mock;
const completedSpy = (list: BracketList) =>
  list.allBracketsCompleted as unknown as jest.Mock;

// the tournament with one bracket's settings changed
const withBrkt = (
  brktId: string,
  overrides: Record<string, unknown>
): tmntFullType =>
  ({
    ...mockTmntFullData,
    brkts: mockTmntFullData.brkts.map((b) =>
      b.id === brktId ? { ...b, ...overrides } : b
    ),
  }) as unknown as tmntFullType;

// the tournament with one entry's settings changed
const withEntry = (
  playerId: string,
  brktId: string,
  overrides: Record<string, unknown>
): tmntFullType =>
  ({
    ...mockTmntFullData,
    brktEntries: mockTmntFullData.brktEntries.map((e) =>
      e.player_id === playerId && e.brkt_id === brktId ? { ...e, ...overrides } : e
    ),
  }) as unknown as tmntFullType;

describe("AllBrktsSummary", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("player 8 has 8 brackets and no refunds, and player 1 has 10 brackets and 2 refunds, in each bracket", () => {
      BOTH.forEach((id) => {
        const e8 = mockTmntFullData.brktEntries.find(
          (e) => e.player_id === player8.id && e.brkt_id === id
        );
        const e1 = mockTmntFullData.brktEntries.find(
          (e) => e.player_id === player1.id && e.brkt_id === id
        );
        expect(e8?.num_brackets).toBe(8);
        expect(e8?.num_refunds ?? 0).toBe(0);
        expect(e1?.num_brackets).toBe(10);
        expect(e1?.num_refunds).toBe(2);
      });
    });

    it("both brackets have a $5 fee", () => {
      expect(mockTmntFullData.brkts.map((b) => b.fee)).toEqual(["5", "5"]);
    });
  });

  /****************************************/
  /* every bracket complete, no refunds   */
  /****************************************/
  describe("every bracket complete, a player with no refunds", () => {
    it("shows the player's name, the title, the entries and the earnings", () => {
      renderSummary();

      // 2 brackets x 8 entries at $5; earnings of $25 + $10
      expect(screen.getByText(nameOf(player8))).toBeInTheDocument();
      expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
      expect(screen.getByText(entriesLine(16, 80))).toBeInTheDocument();
      expect(screen.getByText(earningsLine(35))).toBeInTheDocument();
    });

    it("shows the lines in order: name, title, entries, earnings", () => {
      const { container } = renderSummary();

      expect(container).toHaveTextContent(
        inOrder(
          nameOf(player8),
          SUMMARY_TITLE,
          entriesLine(16, 80),
          earningsLine(35)
        )
      );
    });

    it("does not show the refund lines or the not complete message", () => {
      renderSummary();

      expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Paid/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Refunds:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Returned/)).not.toBeInTheDocument();
      expect(screen.queryByText(NOT_COMPLETE)).not.toBeInTheDocument();
    });

    it("adds up the earnings of every bracket's list", () => {
      renderSummary({ records: makeRecords({ earnings1: 40, earnings2: 5 }) });

      expect(screen.getByText(earningsLine(45))).toBeInTheDocument();
    });

    it("shows earnings of $0.00 when nothing was won", () => {
      renderSummary({ records: makeRecords({ earnings1: 0, earnings2: 0 }) });

      expect(screen.getByText(earningsLine(0))).toBeInTheDocument();
    });

    it("shows amounts with a $ and two decimals", () => {
      renderSummary();

      expect(screen.getByText(entriesLine(16, 80))).toHaveTextContent("= $80.00");
      expect(screen.getByText(earningsLine(35))).toHaveTextContent("$35.00");
    });

    it("says entry, not entries, for a single entry", () => {
      // player 8 with one entry in one bracket
      const data: tmntFullType = {
        ...mockTmntFullData,
        brktEntries: mockTmntFullData.brktEntries
          .filter((e) => !(e.player_id === player8.id && e.brkt_id === brktId2))
          .map((e) =>
            e.player_id === player8.id && e.brkt_id === brktId1
              ? { ...e, num_brackets: 1 }
              : e
          ),
      };

      renderSummary({ data, brktIds: [brktId1] });

      expect(screen.getByText(entriesLine(1, 5))).toBeInTheDocument();
      expect(screen.queryByText(/1 entries/)).not.toBeInTheDocument();
    });

    it("says entries for more than one entry", () => {
      renderSummary();

      expect(screen.getByText(/16 entries/)).toBeInTheDocument();
    });

    it("uses each bracket's own fee", () => {
      renderSummary({ data: withBrkt(brktId2, { fee: "10" }) });

      // 8 x $5 + 8 x $10
      expect(screen.getByText(entriesLine(16, 120))).toBeInTheDocument();
    });
  });

  /**************************************/
  /* every bracket complete, refunds    */
  /**************************************/
  describe("every bracket complete, a player with refunds", () => {
    // player 1: 2 brackets x (10 - 2) = 16 entries ($80), 4 unused ($20), earnings $35
    const renderRefunds = (opts: RenderOpts = {}) =>
      renderSummary({ player: player1, ...opts });

    it("shows the entries, the unused entries, the total paid, the earnings, the refunds and the total returned", () => {
      renderRefunds();

      expect(screen.getByText(nameOf(player1))).toBeInTheDocument();
      expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
      expect(screen.getByText(entriesLine(16, 80))).toBeInTheDocument();
      expect(screen.getByText(unusedLine(4, 20))).toBeInTheDocument();
      expect(screen.getByText(totalPaidLine(100))).toBeInTheDocument(); // $80 + $20
      expect(screen.getByText(earningsLine(35))).toBeInTheDocument();
      expect(screen.getByText(refundsLine(20))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedLine(55))).toBeInTheDocument(); // $35 + $20
    });

    it("shows the lines in order: entries, unused, total paid, earnings, refunds, total returned", () => {
      const { container } = renderRefunds();

      expect(container).toHaveTextContent(
        inOrder(
          entriesLine(16, 80),
          unusedLine(4, 20),
          totalPaidLine(100),
          earningsLine(35),
          refundsLine(20),
          totalReturnedLine(55)
        )
      );
    });

    it("does not show the not complete message", () => {
      renderRefunds();

      expect(screen.queryByText(NOT_COMPLETE)).not.toBeInTheDocument();
    });

    it("still shows the refunds when the player earned nothing", () => {
      renderRefunds({ records: makeRecords({ earnings1: 0, earnings2: 0 }) });

      expect(screen.getByText(earningsLine(0))).toBeInTheDocument();
      expect(screen.getByText(refundsLine(20))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedLine(20))).toBeInTheDocument();
    });

    it("adds up the refunds on every bracket's entry", () => {
      renderRefunds({ data: withEntry(player1.id, brktId2, { num_refunds: 5 }) });

      // refunds 2 + 5 = 7 at $5 = $35; entries (10 - 2) + (10 - 5) = 13 = $65
      expect(screen.getByText(entriesLine(13, 65))).toBeInTheDocument();
      expect(screen.getByText(unusedLine(7, 35))).toBeInTheDocument();
      expect(screen.getByText(totalPaidLine(100))).toBeInTheDocument();
      expect(screen.getByText(refundsLine(35))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedLine(70))).toBeInTheDocument();
    });

    it("uses each bracket's own fee for the unused entries", () => {
      renderRefunds({ data: withBrkt(brktId2, { fee: "10" }) });

      // entries 8 x $5 + 8 x $10 = $120; unused 2 x $5 + 2 x $10 = $30
      expect(screen.getByText(entriesLine(16, 120))).toBeInTheDocument();
      expect(screen.getByText(unusedLine(4, 30))).toBeInTheDocument();
      expect(screen.getByText(totalPaidLine(150))).toBeInTheDocument();
    });

    it("treats a missing number of refunds on one entry as none, with no NaN", () => {
      const { container } = renderRefunds({
        data: withEntry(player1.id, brktId1, { num_refunds: undefined }),
      });

      // bracket 1: 10 entries, no refunds; bracket 2: 8 entries, 2 refunds
      expect(screen.getByText(entriesLine(18, 90))).toBeInTheDocument();
      expect(screen.getByText(unusedLine(2, 10))).toBeInTheDocument();
      expect(container).not.toHaveTextContent("NaN");
    });
  });

  /********************/
  /* borders          */
  /********************/
  describe("borders", () => {
    describe("without refunds", () => {
      it("has the top border only on the Earnings line", () => {
        renderSummary();

        expect(screen.getByText(earningsLine(35))).toHaveClass("border-top");
        expect(screen.getByText(entriesLine(16, 80))).not.toHaveClass("border-top");
        expect(screen.getByText(SUMMARY_TITLE)).not.toHaveClass("border-top");
        expect(screen.getByText(nameOf(player8))).not.toHaveClass("border-top");
      });

      it("has no bottom border on the Earnings line, which is the last line", () => {
        renderSummary();

        expect(screen.getByText(earningsLine(35))).not.toHaveClass("border-bottom");
      });

      it("underlines the entries line, so a double line separates it from the Earnings line", () => {
        renderSummary();

        expect(screen.getByText(entriesLine(16, 80))).toHaveClass("border-bottom");
      });

      it("shows the Earnings line in the success colour", () => {
        renderSummary();

        expect(screen.getByText(earningsLine(35))).toHaveClass("text-success");
      });
    });

    describe("with refunds", () => {
      const renderRefunds = () => renderSummary({ player: player1 });

      it("has the top border only on the Earnings line", () => {
        renderRefunds();

        expect(screen.getByText(earningsLine(35))).toHaveClass("border-top");
        [
          entriesLine(16, 80),
          unusedLine(4, 20),
          totalPaidLine(100),
          refundsLine(20),
          totalReturnedLine(55),
        ].forEach((text) => {
          expect(screen.getByText(text)).not.toHaveClass("border-top");
        });
      });

      it("underlines every line the player paid, so the lines above Earnings are underlined", () => {
        renderRefunds();

        [entriesLine(16, 80), unusedLine(4, 20), totalPaidLine(100)].forEach(
          (text) => {
            expect(screen.getByText(text)).toHaveClass("border-bottom");
          }
        );
      });

      it("underlines the Earnings and Refunds lines, but not the last line, Total Returned", () => {
        renderRefunds();

        expect(screen.getByText(earningsLine(35))).toHaveClass("border-bottom");
        expect(screen.getByText(refundsLine(20))).toHaveClass("border-bottom");
        expect(screen.getByText(totalReturnedLine(55))).not.toHaveClass(
          "border-bottom"
        );
      });

      it("has no border at all on the Total Returned line", () => {
        renderRefunds();

        const last = screen.getByText(totalReturnedLine(55));
        expect(last).not.toHaveClass("border-top");
        expect(last).not.toHaveClass("border-bottom");
      });

    });
  });

  /******************/
  /* colors         */
  /******************/
  describe("colors", () => {
    describe("without refunds", () => {
      it("shows the Earnings line in the success colour", () => {
        renderSummary();

        expect(screen.getByText(earningsLine(35))).toHaveClass("text-success");
      });

      it("does not colour the entries line, the title or the name with the success colour", () => {
        renderSummary();

        expect(screen.getByText(entriesLine(16, 80))).not.toHaveClass("text-success");
        expect(screen.getByText(SUMMARY_TITLE)).not.toHaveClass("text-success");
        expect(screen.getByText(nameOf(player8))).not.toHaveClass("text-success");
      });

      it("shows the Earnings line in the success colour even when it is $0.00", () => {
        renderSummary({ records: makeRecords({ earnings1: 0, earnings2: 0 }) });

        expect(screen.getByText(earningsLine(0))).toHaveClass("text-success");
      });

      it("has no group for the returned lines", () => {
        renderSummary();

        expect(
          screen.queryByTestId("all-brkts-returned-group")
        ).not.toBeInTheDocument();
      });
    });

    describe("with refunds", () => {
      const renderRefunds = () => renderSummary({ player: player1 });

      it("shows the group of Earnings, Refunds and Total Returned lines in the success colour", () => {
        renderRefunds();

        expect(screen.getByTestId("all-brkts-returned-group")).toHaveClass(
          "text-success"
        );
      });

      it("holds the Earnings, Refunds and Total Returned lines, and only those, in the group", () => {
        renderRefunds();

        const group = screen.getByTestId("all-brkts-returned-group");
        [earningsLine(35), refundsLine(20), totalReturnedLine(55)].forEach(
          (text) => {
            expect(within(group).getByText(text)).toBeInTheDocument();
          }
        );
        [
          entriesLine(16, 80),
          unusedLine(4, 20),
          totalPaidLine(100),
          SUMMARY_TITLE,
          nameOf(player1),
        ].forEach((text) => {
          expect(within(group).queryByText(text)).not.toBeInTheDocument();
        });
      });

      it("does not colour the lines the player paid with the success colour", () => {
        renderRefunds();

        [entriesLine(16, 80), unusedLine(4, 20), totalPaidLine(100)].forEach(
          (text) => {
            expect(screen.getByText(text)).not.toHaveClass("text-success");
          }
        );
      });

      it("does not colour the title or the name with the success colour", () => {
        renderRefunds();

        expect(screen.getByText(SUMMARY_TITLE)).not.toHaveClass("text-success");
        expect(screen.getByText(nameOf(player1))).not.toHaveClass("text-success");
      });

      it("keeps the success colour on the group when the player earned nothing", () => {
        renderSummary({
          player: player1,
          records: makeRecords({ earnings1: 0, earnings2: 0 }),
        });

        expect(screen.getByTestId("all-brkts-returned-group")).toHaveClass(
          "text-success"
        );
      });
    });

    describe("a bracket that is not complete", () => {
      it("shows no success colour anywhere in the box", () => {
        renderSummary({ records: makeRecords({ complete2: false }) });

        expect(
          screen.queryByTestId("all-brkts-returned-group")
        ).not.toBeInTheDocument();
        const box = screen.getByTestId("all-brkts-summary-box");
        expect(within(box).queryByText(/Earnings/)).not.toBeInTheDocument();
        expect(screen.getByText(NOT_COMPLETE)).not.toHaveClass("text-success");
      });

      it("keeps the white text on the title colour for the name and the message", () => {
        renderSummary({ records: makeRecords({ complete2: false }) });

        expect(screen.getByText(nameOf(player8))).toHaveClass(
          "bracket-title_backgroud",
          "text-white"
        );
        expect(screen.getByText(NOT_COMPLETE)).toHaveClass(
          "bracket-title_backgroud",
          "text-white"
        );
      });
    });
  });

  /***********************************/
  /* a bracket that is not complete  */
  /***********************************/
  describe("a bracket that is not complete", () => {
    it.each([
      ["the first bracket", { complete1: false }],
      ["the second bracket", { complete2: false }],
      ["both brackets", { complete1: false, complete2: false }],
    ])("shows the not complete message when %s is not complete", (_label, opts) => {
      renderSummary({ records: makeRecords(opts) });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
    });

    it("still shows the player's name", () => {
      renderSummary({ records: makeRecords({ complete2: false }) });

      expect(
        within(screen.getByTestId("all-brkts-summary-box")).getByText(
          nameOf(player8)
        )
      ).toBeInTheDocument();
    });

    it("shows no title and no money lines", () => {
      renderSummary({ records: makeRecords({ complete2: false }) });

      expect(screen.queryByText(SUMMARY_TITLE)).not.toBeInTheDocument();
      expect(screen.queryByText(/ = \$/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Earnings:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Paid/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Returned/)).not.toBeInTheDocument();
    });

    it("shows no refund lines for a player with refunds either", () => {
      renderSummary({
        player: player1,
        records: makeRecords({ complete1: false }),
      });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
      expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Refunds:/)).not.toBeInTheDocument();
    });

    it("does not ask a list for earnings once one of them is not complete", () => {
      const records = makeRecords({ complete1: false });

      renderSummary({ records });

      expect(earningsSpy(records[brktId1])).not.toHaveBeenCalled();
      expect(earningsSpy(records[brktId2])).not.toHaveBeenCalled();
    });

    it("keeps the box centered and 230px wide", () => {
      renderSummary({ records: makeRecords({ complete2: false }) });

      expect(screen.getByTestId("all-brkts-summary")).toHaveClass(
        "justify-content-center"
      );
      expect(screen.getByTestId("all-brkts-summary-box")).toHaveStyle({
        width: "230px",
      });
    });

    it("shows the totals once every bracket becomes complete", () => {
      const { rerender } = renderSummary({
        records: makeRecords({ complete2: false }),
      });
      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();

      rerender(
        <AllBrktsSummary
          tmntFullData={mockTmntFullData}
          brktListRecords={makeRecords()}
          playerId={player8.id}
          playerName={nameOf(player8)}
          brktIds={BOTH}
        />
      );

      expect(screen.queryByText(NOT_COMPLETE)).not.toBeInTheDocument();
      expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
      expect(screen.getByText(earningsLine(35))).toBeInTheDocument();
    });
  });

  /**********************************/
  /* which brackets are counted     */
  /**********************************/
  describe("which brackets are counted", () => {
    it("counts only the brackets it is given", () => {
      renderSummary({ brktIds: [brktId1] });

      expect(screen.getByText(entriesLine(8, 40))).toBeInTheDocument();
      expect(screen.getByText(earningsLine(25))).toBeInTheDocument();
    });

    it("does not ask the other lists for anything", () => {
      const records = makeRecords();

      renderSummary({ records, brktIds: [brktId1] });

      expect(earningsSpy(records[brktId2])).not.toHaveBeenCalled();
      expect(completedSpy(records[brktId2])).not.toHaveBeenCalled();
    });

    it("ignores an incomplete bracket that it is not asked to count", () => {
      renderSummary({
        records: makeRecords({ complete2: false }),
        brktIds: [brktId1],
      });

      expect(screen.queryByText(NOT_COMPLETE)).not.toBeInTheDocument();
      expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
    });

    it("skips a bracket that has no list", () => {
      const records = { [brktId1]: fakeList(brktId1, 25) } as brktListRecord;

      renderSummary({ records });

      expect(screen.getByText(entriesLine(8, 40))).toBeInTheDocument();
      expect(screen.getByText(earningsLine(25))).toBeInTheDocument();
    });

    it("asks the lists about the player it is given", () => {
      const records = makeRecords();

      renderSummary({ records, player: player1 });

      expect(earningsSpy(records[brktId1])).toHaveBeenCalledWith(player1.id);
      expect(earningsSpy(records[brktId2])).toHaveBeenCalledWith(player1.id);
    });
  });

  /************************************/
  /* nothing to total                 */
  /************************************/
  describe("nothing to total", () => {
    it("shows the not complete message for an empty list of brackets", () => {
      renderSummary({ brktIds: [] });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
      expect(screen.queryByText(SUMMARY_TITLE)).not.toBeInTheDocument();
    });

    it("shows the not complete message when there are no bracket lists", () => {
      renderSummary({ records: {} });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
    });

    it("shows the not complete message for a player with no entries", () => {
      const data: tmntFullType = {
        ...mockTmntFullData,
        brktEntries: mockTmntFullData.brktEntries.filter(
          (e) => e.player_id !== player8.id
        ),
      };

      renderSummary({ data });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
    });
  });

  /********************/
  /* layout           */
  /********************/
  describe("layout", () => {
    it("is centered", () => {
      renderSummary();

      expect(screen.getByTestId("all-brkts-summary")).toHaveClass(
        "d-flex",
        "justify-content-center"
      );
    });

    it("has a 230px wide box", () => {
      renderSummary();

      expect(screen.getByTestId("all-brkts-summary-box")).toHaveStyle({
        width: "230px",
      });
    });

    it("is not a Bootstrap row", () => {
      renderSummary();

      expect(screen.getByTestId("all-brkts-summary")).not.toHaveClass("row");
    });

    it("puts the player's name in the header, with the title colors", () => {
      renderSummary();

      const name = screen.getByText(nameOf(player8));
      expect(name).toHaveClass("bracket-title_backgroud", "text-white");
      expect(name).toHaveClass("text-center");
    });

    it("holds every line inside the box", () => {
      renderSummary({ player: player1 });

      const box = screen.getByTestId("all-brkts-summary-box");
      [
        nameOf(player1),
        SUMMARY_TITLE,
        entriesLine(16, 80),
        unusedLine(4, 20),
        totalPaidLine(100),
        earningsLine(35),
        refundsLine(20),
        totalReturnedLine(55),
      ].forEach((text) => {
        expect(within(box).getByText(text)).toBeInTheDocument();
      });
    });

    it("renders exactly one summary", () => {
      renderSummary();

      expect(screen.getAllByTestId("all-brkts-summary")).toHaveLength(1);
      expect(screen.getAllByTestId("all-brkts-summary-box")).toHaveLength(1);
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

    const buildRecords = (): brktListRecord => {
      const record: brktListRecord = {};
      mockTmntFullData.brkts.forEach((brkt) => {
        const list = new BracketList(
          brkt.id,
          defaultPlayersPerMatch,
          brkt.games,
          Array.from({ length: brkt.games }, (_, i) => brkt.start + i),
          undefined,
          { tmntFullData: mockTmntFullData, divId: brkt.div_id }
        );
        list.updateBracketMatches(minimalResults);
        record[brkt.id] = list;
      });
      return record;
    };

    it("shows the totals the calculation gives for player 8", () => {
      const records = buildRecords();
      const expected = calcAllBrktSummaries(
        mockTmntFullData,
        records,
        player8.id,
        BOTH
      );
      expect(expected.allComplete).toBe(true);

      renderSummary({ records });

      expect(screen.getByText(SUMMARY_TITLE)).toBeInTheDocument();
      expect(
        screen.getByText(entriesLine(expected.entries, expected.entryAmount))
      ).toBeInTheDocument();
      expect(screen.getByText(earningsLine(expected.earnings))).toBeInTheDocument();
      // player 8 wins the first bracket of each list
      expect(expected.earnings).toBeGreaterThanOrEqual(50);
    });

    it("shows the refunds the calculation gives for player 1", () => {
      const records = buildRecords();
      const expected = calcAllBrktSummaries(
        mockTmntFullData,
        records,
        player1.id,
        BOTH
      );

      renderSummary({ records, player: player1 });

      expect(
        screen.getByText(unusedLine(expected.refunds, expected.refundAmount))
      ).toBeInTheDocument();
      expect(
        screen.getByText(totalPaidLine(expected.entryAmount + expected.refundAmount))
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          totalReturnedLine(expected.earnings + expected.refundAmount)
        )
      ).toBeInTheDocument();
    });

    it("shows the total paid as the fees on player 1's entries", () => {
      renderSummary({ records: buildRecords(), player: player1 });

      const entryFees = mockTmntFullData.brktEntries
        .filter((e) => e.player_id === player1.id)
        .reduce((sum, e) => sum + Number(e.fee), 0);

      expect(screen.getByText(totalPaidLine(entryFees))).toBeInTheDocument();
    });

    it("shows the not complete message while games are still to be bowled", () => {
      mockedToGameTypes.mockReturnValue(mockGames.filter((g) => g.game_num <= 2));

      renderSummary({ records: buildRecords() });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
      expect(screen.queryByText(SUMMARY_TITLE)).not.toBeInTheDocument();
    });

    it("shows the not complete message before any score is entered", () => {
      mockedToGameTypes.mockReturnValue([]);

      renderSummary({ records: buildRecords() });

      expect(screen.getByText(NOT_COMPLETE)).toBeInTheDocument();
    });
  });
});