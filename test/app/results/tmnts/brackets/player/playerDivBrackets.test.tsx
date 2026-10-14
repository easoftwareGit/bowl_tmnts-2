import React from "react";
import { render, screen, within } from "@testing-library/react";
import PlayerDivBrkts from "@/app/results/tmnt/[tmntId]/brackets/player/[playerId]/playerDivBrackets";
import { BracketList } from "@/components/brackets/bracketListClass";
import { getGameScoreKey } from "@/components/brackets/bracketMaps";
import type { matchSeedInfoType } from "@/components/brackets/bracketMatchClass";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import { fullName, getBrktOrElimName } from "@/lib/getName";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { defaultPlayersPerMatch } from "@/lib/db/initVals";
import { tmntResultsToGameTypes } from "@/lib/tmntResultsToGameTypes";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type { tmntFullType } from "@/lib/types/types";
import { byeName } from "@/lib/validation/constants";
import {
  mockTmntFullData,
  mockGames,
  mockByePlayer,
  brktId1,
  brktId2,
  divId1,
  divId2,
  oneBrktId1,
  oneBrktId2,
  byeId,
  tmntId,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// Only the integration tests reach this function (through BracketList).
// It is mocked so the real bracket list is fed the mock game scores.
jest.mock("@/lib/tmntResultsToGameTypes", () => ({
  tmntResultsToGameTypes: jest.fn(),
}));

const mockedToGameTypes = tmntResultsToGameTypes as jest.Mock;

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players } = mockTmntFullData;
const [scratchDiv, hdcpDiv] = mockTmntFullData.divs;

const UNKNOWN_BRKT = "brk_unknown000000000000000000000000";
const UNKNOWN_DIV = "div_unknown000000000000000000000000";
const UNKNOWN_SQUAD = "sqd_unknown000000000000000000000000";
const UNKNOWN_PLAYER = "ply_unknown000000000000000000000000";
const UNKNOWN_ONE_BRKT = "obk_unknown000000000000000000000000";

// the same currency setup the component uses
const currencyConfig = getLocaleConfig({ locale: "en-US" });
currencyConfig.prefix = "$";
const fmt = (n: number) => formatValueSymbSep2Dec(String(n), currencyConfig);

const byeLabel = fullName(byeName, "").trim();
// the bye's seat in a match, as BracketMatch.getMatchInfo returns it:
// a score of 0, no handicap, and it always loses
const byeSeed = (
  overrides: Partial<matchSeedInfoType> = {}
): matchSeedInfoType => ({
  playerId: byeId,
  first_name: byeName,
  last_name: "",
  average: 0,
  score: 0,
  hdcp: 0,
  total: 0,
  result: "L",
  ...overrides,
});

// the summary line (a div) that holds the given text
const summaryLine = (text: string) => screen.getByText(text);

// the summary line: "1 entry @ $5.00 = $5.00", "2 entries @ $5.00 = $10.00"
const entriesText = (count: number, fee: number) =>
  `${count} ${count === 1 ? "entry" : "entries"} @ ${fmt(fee)} = ${fmt(fee * count)}`;

// the refund lines of the summary; the tests say "refund" or "refunds" themselves
const unusedText = (count: number, fee: number) =>
  `${count} unused @ ${fmt(fee)} = ${fmt(fee * count)}`;
const refundsText = (
  count: number,
  label: "refund" | "refunds",
  fee: number
) => `${count} ${label} @ ${fmt(fee)} = ${fmt(fee * count)}`;
const totalPaidText = (amount: number) => `Total Paid: ${fmt(amount)}`;
const totalReturnedText = (amount: number) => `Total Returned: ${fmt(amount)}`;

// a regular expression that finds the parts in the given order, with anything between
const inOrder = (...parts: string[]) =>
  new RegExp(
    parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join(".*")
  );

const noEntryMessage = (playerId: string) =>
  `Player bracket entries not found. Id: ${playerId}`;

// player number (1-8) -> player id from the mock
const pid = (n: number) => players[n - 1].id;
const nm = (n: number) =>
  fullName(players[n - 1].first_name, players[n - 1].last_name).trim();

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

const hrefFor = (oneBrktId: string) =>
  `/results/tmnt/${tmntId}/brackets/oneBrkt/${oneBrktId}`;

// one player's seat in a match, as BracketMatch.getMatchInfo would return it
const seed = (
  n: number,
  overrides: Partial<matchSeedInfoType> = {}
): matchSeedInfoType => ({
  playerId: pid(n),
  first_name: players[n - 1].first_name,
  last_name: players[n - 1].last_name,
  average: players[n - 1].average,
  score: undefined,
  hdcp: undefined,
  total: undefined,
  result: undefined,
  ...overrides,
});

// Player 8 (Terri Smith) winning the first bracket of the first list,
// with the real mock scores: 230 beats player 7 (190), 231 beats player 6 (216),
// 232 beats player 2 (212)
const path8 = (): Record<number, matchSeedInfoType[]> => ({
  1: [
    seed(7, { score: 190, hdcp: 0, total: 190, result: "L" }),
    seed(8, { score: 230, hdcp: 0, total: 230, result: "W" }),
  ],
  2: [
    seed(6, { score: 216, hdcp: 0, total: 216, result: "L" }),
    seed(8, { score: 231, hdcp: 0, total: 231, result: "W" }),
  ],
  3: [
    seed(2, { score: 212, hdcp: 0, total: 212, result: "L" }),
    seed(8, { score: 232, hdcp: 0, total: 232, result: "W" }),
  ],
});

// the same path in the handicap division (hdcp_per 0.9 from 230)
const path8Hdcp = (): Record<number, matchSeedInfoType[]> => ({
  1: [
    seed(7, { score: 190, hdcp: 26, total: 216, result: "L" }),
    seed(8, { score: 230, hdcp: 35, total: 265, result: "W" }),
  ],
  2: [
    seed(6, { score: 216, hdcp: 17, total: 233, result: "L" }),
    seed(8, { score: 231, hdcp: 35, total: 266, result: "W" }),
  ],
  3: [
    seed(2, { score: 212, hdcp: 18, total: 230, result: "L" }),
    seed(8, { score: 232, hdcp: 35, total: 267, result: "W" }),
  ],
});

// player 8's path through a bracket with a bye: the bye is the game 1 opponent
const byePath8 = () => ({
  ...path8(),
  1: [byeSeed(), seed(8, { score: 230, hdcp: 0, total: 230, result: "W" })],
});

const byePath8Hdcp = () => ({
  ...path8Hdcp(),
  1: [byeSeed(), seed(8, { score: 230, hdcp: 35, total: 265, result: "W" })],
});

/*********************************/
/* fake bracket list and brackets */
/*********************************/
type FakeBracketOpts = {
  matches?: Partial<Record<number, matchSeedInfoType[]>>;
  winner?: boolean;
  runnerUp?: boolean;
  earnings?: number;
};

const makeFakeBracket = (
  viewerId: string,
  {
    matches = {},
    winner = false,
    runnerUp = false,
    earnings = 0,
  }: FakeBracketOpts = {}
) => ({
  getPlayerMatchInfo: jest.fn((playerId: string, brktGameNum: number) => {
    const matchInfo = matches[brktGameNum];
    return matchInfo
      ? {
          brktGameNum,
          playerId,
          matchInfo,
          matchNumber: 0,
          matchPlayers: matchInfo.map((m) => m.playerId),
        }
      : undefined;
  }),
  winnerIds: new Set<string>(winner ? [viewerId] : []),
  runnerUpIds: new Set<string>(runnerUp ? [viewerId] : []),
  playerEarnings: jest.fn(() => earnings),
});

type FakeBracket = ReturnType<typeof makeFakeBracket>;

type FakeListOpts = {
  brktId?: string;
  startGame?: number; // squad game number of bracket game 1
  oneBrktIds?: string[];
  brackets?: FakeBracket[];
  // keyed by bracket game 1-3; null is a game with no score yet, as the SQL returns it
  viewerScores?: Record<number, number | null>;
  alive?: Record<number, number>; // keyed by bracket game 1-3
};

const makeFakeList = (
  viewerN: number,
  {
    brktId = brktId1,
    startGame = 1,
    oneBrktIds = [oneBrktId1],
    brackets,
    viewerScores,
    alive = {},
  }: FakeListOpts = {},
  overrides: Record<string, unknown> = {}
): BracketList => {
  const viewerId = pid(viewerN);
  const own = scoresFor(viewerId);
  const scores: Record<number, number | null> = viewerScores ?? {
    1: own[0],
    2: own[1],
    3: own[2],
  };

  return {
    brktId,
    bracketIndexMap: new Map(
      oneBrktIds.map((id, i): [string, number] => [id, i])
    ),
    gameScoreMap: new Map(
      Object.entries(scores).map(([g, score]): [string, number | null] => [
        getGameScoreKey(viewerId, startGame + Number(g) - 1),
        score,
      ])
    ),
    playersMap: new Map([[viewerId, { first_name: nm(viewerN) }]]),
    brackets: brackets ?? oneBrktIds.map(() => makeFakeBracket(viewerId)),
    playerBracketIdsSorted: jest.fn(() => oneBrktIds),
    squadGameNumber: jest.fn((n: number) => startGame + n - 1),
    aliveCount: jest.fn((...args: [string, number]) => alive[args[1]] ?? 0),
    ...overrides,
  } as unknown as BracketList;
};

// access to the spies on a fake list
const spies = (list: BracketList) =>
  list as unknown as {
    aliveCount: jest.Mock;
    squadGameNumber: jest.Mock;
    playerBracketIdsSorted: jest.Mock;
  };

// the normal case: player 8 wins the first bracket
const standardList = (
  opts: FakeListOpts = {},
  overrides: Record<string, unknown> = {}
) =>
  makeFakeList(
    8,
    {
      brackets: [
        makeFakeBracket(pid(8), {
          matches: path8(),
          winner: true,
          earnings: 25,
        }),
      ],
      alive: { 1: 3, 2: 2, 3: 1 },
      ...opts,
    },
    overrides
  );

/***********/
/* helpers */
/***********/
type Props = {
  playerId: string;
  data: tmntFullType;
  list: BracketList | undefined;
};

const renderProps = ({ playerId, data, list }: Props) =>
  render(
    <PlayerDivBrkts
      playerId={playerId}
      tmntFullData={data}
      brktList={list as BracketList}
    />
  );

const renderStandard = (
  list: BracketList = standardList(),
  data: tmntFullType = mockTmntFullData
) => renderProps({ playerId: pid(8), data, list });

const withTmnt = (overrides: Record<string, unknown>): tmntFullType =>
  ({
    ...mockTmntFullData,
    tmnt: { ...mockTmntFullData.tmnt, ...overrides },
  }) as unknown as tmntFullType;

// change the first bracket's settings
const withBrkt = (overrides: Record<string, unknown>): tmntFullType =>
  ({
    ...mockTmntFullData,
    brkts: [
      { ...mockTmntFullData.brkts[0], ...overrides },
      ...mockTmntFullData.brkts.slice(1),
    ],
  }) as unknown as tmntFullType;

// the tournament with only the bracket entries the filter keeps
const withEntries = (
  keep: (entry: tmntFullType["brktEntries"][number]) => boolean
): tmntFullType => ({
  ...mockTmntFullData,
  brktEntries: mockTmntFullData.brktEntries.filter(keep),
});

// the tournament with the number of refunds changed on one player's entry in one
// bracket (player 8's entry in the first bracket by default)
const withRefunds = (
  numRefunds: number | undefined,
  data: tmntFullType = mockTmntFullData,
  playerN: number = 8,
  brktId: string = brktId1
): tmntFullType => ({
  ...data,
  brktEntries: data.brktEntries.map((e) =>
    e.player_id === pid(playerN) && e.brkt_id === brktId
      ? { ...e, num_refunds: numRefunds as number }
      : e
  ),
});

// the first bracket in the handicap division instead of the scratch division
const hdcpData = () => withBrkt({ div_id: divId2 });

// the header for a bracket game: "<score><+hdcp=total> <name> Game <n>"
const gameHeader = (text: string) => screen.getByText(text.trim());

// rows (the divs holding an opponent's name) for the given players, in page order
const rowsFor = (...ns: number[]) =>
  screen.getAllByText(new RegExp(ns.map((n) => nm(n)).join("|")));

describe("PlayerDivBrkts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedToGameTypes.mockReturnValue(mockGames);
  });

  describe("fixture sanity check", () => {
    it("mock divisions are one scratch (hdcp_per 0) and one handicap (hdcp_per > 0)", () => {
      expect(scratchDiv.hdcp_per).toBe(0);
      expect(hdcpDiv.hdcp_per).toBeGreaterThan(0);
    });

    it("the first mock bracket is in the scratch division and has a $5 entry fee", () => {
      expect(mockTmntFullData.brkts[0].div_id).toBe(scratchDiv.id);
      expect(mockTmntFullData.brkts[0].fee).toBe("5");
    });

    it("formats whole dollar amounts with a $ and two decimals", () => {
      expect(fmt(5)).toBe("$5.00");
      expect(fmt(25)).toBe("$25.00");
    });

    it("player 8 has a handicap of 35 per game in the handicap division", () => {
      expect(
        calcHandicap(
          players[7].average,
          hdcpDiv.hdcp_from,
          hdcpDiv.hdcp_per,
          hdcpDiv.int_hdcp
        )
      ).toBe(35);
    });

    it("player 8 scored 230, 231, 232 in the first three games", () => {
      expect(scoresFor(pid(8)).slice(0, 3)).toEqual([230, 231, 232]);
    });

    it("the mock has a bracket entry for player 8 in each of the two brackets", () => {
      [brktId1, brktId2].forEach((id) => {
        expect(
          mockTmntFullData.brktEntries.some(
            (e) => e.player_id === pid(8) && e.brkt_id === id
          )
        ).toBe(true);
      });
    });

    it("player 1's entry in the first bracket is for 10 brackets, with 2 refunds and a $50 fee", () => {
      const entry = mockTmntFullData.brktEntries.find(
        (e) => e.player_id === pid(1) && e.brkt_id === brktId1
      );

      expect(entry?.num_brackets).toBe(10);
      expect(entry?.num_refunds).toBe(2);
      expect(entry?.fee).toBe("50");
    });

    it("player 8 has no refunds on any entry", () => {
      mockTmntFullData.brktEntries
        .filter((e) => e.player_id === pid(8))
        .forEach((e) => expect(e.num_refunds ?? 0).toBe(0));
    });    
  });

  /********************/
  /* missing data     */
  /********************/
  describe("missing data", () => {
    const base = (): Props => ({
      playerId: pid(8),
      data: mockTmntFullData,
      list: standardList(),
    });

    const cases: [string, () => Props, string][] = [
      [
        "No Player id. when the player id is empty",
        () => ({ ...base(), playerId: "" }),
        "No Player id.",
      ],
      [
        "No Player id. when the player id is missing",
        () => ({ ...base(), playerId: undefined as unknown as string }),
        "No Player id.",
      ],
      [
        "No Tournament Data. when there is no tournament",
        () => ({ ...base(), data: undefined as unknown as tmntFullType }),
        "No Tournament Data.",
      ],
      [
        "No Tournament Data. when the tournament has no tmnt",
        () => ({
          ...base(),
          data: { ...mockTmntFullData, tmnt: undefined } as unknown as tmntFullType,
        }),
        "No Tournament Data.",
      ],
      [
        "No Tournament Data. when the tournament id is empty",
        () => ({ ...base(), data: withTmnt({ id: "" }) }),
        "No Tournament Data.",
      ],
      [
        "No Tournament Data. when the tournament id is not a valid tournament id",
        () => ({
          ...base(),
          data: withTmnt({ id: "bwl_0123388a8fc4641a2e37233f1d6bebd1" }),
        }),
        "No Tournament Data.",
      ],
      [
        "No Bracket List. when there is no bracket list",
        () => ({ ...base(), list: undefined }),
        "No Bracket List.",
      ],
      [
        "the bracket id when the bracket is not in the tournament",
        () => ({ ...base(), list: standardList({ brktId: UNKNOWN_BRKT }) }),
        `Bracket configuration not found. Id: ${UNKNOWN_BRKT}`,
      ],
      [
        "the division id when the bracket's division is not in the tournament",
        () => ({ ...base(), data: withBrkt({ div_id: UNKNOWN_DIV }) }),
        `Division configuration not found. Id: ${UNKNOWN_DIV}`,
      ],
      [
        "the squad id when the bracket's squad is not in the tournament",
        () => ({ ...base(), data: withBrkt({ squad_id: UNKNOWN_SQUAD }) }),
        `Squad configuration not found. Id: ${UNKNOWN_SQUAD}`,
      ],
      [
        "the player id when the player is not in the tournament",
        () => ({ ...base(), playerId: UNKNOWN_PLAYER }),
        `Player configuration not found. Id: ${UNKNOWN_PLAYER}`,
      ],
      [
        "the bracket entry message when the player has no entry in this bracket",
        () => ({
          ...base(),
          data: withEntries(
            (e) => !(e.player_id === pid(8) && e.brkt_id === brktId1)
          ),
        }),
        noEntryMessage(pid(8)),
      ],
      [
        "the bracket entry message when the tournament has no bracket entries",
        () => ({ ...base(), data: withEntries(() => false) }),
        noEntryMessage(pid(8)),
      ],
      [
        "Bracket index map not found. when the index map is null",
        () => ({ ...base(), list: standardList({}, { bracketIndexMap: null }) }),
        "Bracket index map not found.",
      ],
      [
        "Bracket index map not found. when the index map is empty",
        () => ({
          ...base(),
          list: standardList({}, { bracketIndexMap: new Map() }),
        }),
        "Bracket index map not found.",
      ],
      [
        "Game score map not found. when the game score map is null",
        () => ({ ...base(), list: standardList({}, { gameScoreMap: null }) }),
        "Game score map not found.",
      ],
      [
        "Game score map not found. when the game score map is empty",
        () => ({
          ...base(),
          list: standardList({}, { gameScoreMap: new Map() }),
        }),
        "Game score map not found.",
      ],
      [
        "Players map not found. when the players map is null",
        () => ({ ...base(), list: standardList({}, { playersMap: null }) }),
        "Players map not found.",
      ],
      [
        "Players map not found. when the players map is empty",
        () => ({
          ...base(),
          list: standardList({}, { playersMap: new Map() }),
        }),
        "Players map not found.",
      ],
      [
        "Brackets not found. when the list has no brackets",
        () => ({ ...base(), list: standardList({}, { brackets: [] }) }),
        "Brackets not found.",
      ],
      [
        "Bracket fee not found. when the fee is not a number",
        () => ({ ...base(), data: withBrkt({ fee: "abc" }) }),
        "Bracket fee not found.",
      ],
      [
        "Bracket first amount not found. when the first amount is not a number",
        () => ({ ...base(), data: withBrkt({ first: "abc" }) }),
        "Bracket first amount not found.",
      ],
      [
        "Bracket second amount not found. when the second amount is not a number",
        () => ({ ...base(), data: withBrkt({ second: "abc" }) }),
        "Bracket second amount not found.",
      ],
    ];

    it.each(cases)("shows %s", (_name, build, message) => {
      renderProps(build());

      expect(screen.getByRole("alert")).toHaveTextContent(message);
    });

    it.each(cases)(
      "shows only the one message, and no brackets, for %s",
      (_name, build) => {
        renderProps(build());

        expect(screen.getAllByRole("alert")).toHaveLength(1);
        expect(screen.queryByRole("link")).not.toBeInTheDocument();
        expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
        expect(screen.queryByTestId("brkt-columns-scroll")).not.toBeInTheDocument();
      }
    );

    it("shows the error in a danger alert", () => {
      renderProps({ playerId: "", data: mockTmntFullData, list: standardList() });

      expect(screen.getByRole("alert")).toHaveClass("alert", "alert-danger");
    });    

    it("checks the player id before the tournament", () => {
      renderProps({
        playerId: "",
        data: withTmnt({ id: "" }),
        list: undefined,
      });

      expect(screen.getByRole("alert")).toHaveTextContent("No Player id.");
    });

    it("checks the tournament before the bracket list", () => {
      renderProps({
        playerId: pid(8),
        data: withTmnt({ id: "" }),
        list: undefined,
      });

      expect(screen.getByRole("alert")).toHaveTextContent("No Tournament Data.");
    });

    it("checks the bracket before the player", () => {
      renderProps({
        playerId: UNKNOWN_PLAYER,
        data: mockTmntFullData,
        list: standardList({ brktId: UNKNOWN_BRKT }),
      });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Bracket configuration not found."
      );
    });

    it("checks the division before the squad", () => {
      renderProps({
        playerId: pid(8),
        data: withBrkt({ div_id: UNKNOWN_DIV, squad_id: UNKNOWN_SQUAD }),
        list: standardList(),
      });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Division configuration not found."
      );
    });

    it("checks the player before the player's bracket entry", () => {
      renderProps({
        playerId: UNKNOWN_PLAYER,
        data: withEntries(() => false),
        list: standardList(),
      });

      expect(screen.getByRole("alert")).toHaveTextContent(
        `Player configuration not found. Id: ${UNKNOWN_PLAYER}`
      );
    });

    it("checks the player's bracket entry before the index map", () => {
      renderProps({
        playerId: pid(8),
        data: withEntries(() => false),
        list: standardList({}, { bracketIndexMap: null }),
      });

      expect(screen.getByRole("alert")).toHaveTextContent(noEntryMessage(pid(8)));
    });

    it("checks the fee before the first and second amounts", () => {
      renderProps({
        playerId: pid(8),
        data: withBrkt({ fee: "abc", first: "abc", second: "abc" }),
        list: standardList(),
      });

      expect(screen.getByRole("alert")).toHaveTextContent("Bracket fee not found.");
    });

    it("does not ask the list for the player's brackets when data is missing", () => {
      const list = standardList();

      renderProps({ playerId: UNKNOWN_PLAYER, data: mockTmntFullData, list });

      expect(spies(list).playerBracketIdsSorted).not.toHaveBeenCalled();
    });

    it("shows the game score message when the list has no score entries at all", () => {
      renderStandard(standardList({ viewerScores: {} }));

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Game score map not found."
      );
    });
  });

  /**********************************/
  /* the player's bracket entry     */
  /**********************************/
  describe("the player's bracket entry", () => {
    it("shows the bracket without an error when the player has an entry", () => {
      renderStandard();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows the message, with the player's id, when the only entry is for another bracket", () => {
      const data = withEntries(
        (e) => !(e.player_id === pid(8) && e.brkt_id === brktId1)
      );
      expect(
        data.brktEntries.some(
          (e) => e.player_id === pid(8) && e.brkt_id === brktId2
        )
      ).toBe(true);

      renderStandard(standardList(), data);

      expect(screen.getByRole("alert")).toHaveTextContent(noEntryMessage(pid(8)));
    });

    it("shows the message when only other players have entries in this bracket", () => {
      renderStandard(
        standardList(),
        withEntries((e) => e.player_id !== pid(8))
      );

      expect(screen.getByRole("alert")).toHaveTextContent(noEntryMessage(pid(8)));
    });

    it("checks the entry for this list's bracket, not the other one", () => {
      // player 8 has no entry in bracket 2 only
      const data = withEntries(
        (e) => !(e.player_id === pid(8) && e.brkt_id === brktId2)
      );

      const { unmount } = renderStandard(
        standardList({ brktId: brktId2, startGame: 4 }),
        data
      );
      expect(screen.getByRole("alert")).toHaveTextContent(noEntryMessage(pid(8)));
      unmount();

      renderStandard(standardList(), data);
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("does not ask the list for the player's brackets when there is no entry", () => {
      const list = standardList();

      renderStandard(list, withEntries((e) => e.player_id !== pid(8)));

      expect(spies(list).playerBracketIdsSorted).not.toHaveBeenCalled();
    });
  });

  /********************/
  /* structure        */
  /********************/
  describe("title and column headers (scratch division)", () => {
    it("renders no error when everything is present", () => {
      renderStandard();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("renders the bracket name as the title", () => {
      renderStandard();

      const name = getBrktOrElimName(
        mockTmntFullData.brkts[0],
        mockTmntFullData.divs
      );
      expect(name).not.toBe("");
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    it("renders a column header for each of the three bracket games, with the player's score and name", () => {
      renderStandard();

      expect(gameHeader(`230 ${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`231 ${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`232 ${nm(8)} Game 3`)).toBeInTheDocument();
    });

    it("shows how many brackets the player is alive in, for each game", () => {
      renderStandard();

      expect(
        within(gameHeader(`230 ${nm(8)} Game 1`)).getByText("(3 brackets)")
      ).toBeInTheDocument();
      expect(
        within(gameHeader(`231 ${nm(8)} Game 2`)).getByText("(2 brackets)")
      ).toBeInTheDocument();
      expect(
        within(gameHeader(`232 ${nm(8)} Game 3`)).getByText("(1 brackets)")
      ).toBeInTheDocument();
    });

    it("asks the list for the alive count for this player and each bracket game", () => {
      const list = standardList();
      renderStandard(list);

      const { aliveCount } = spies(list);
      expect(aliveCount).toHaveBeenCalledWith(pid(8), 1);
      expect(aliveCount).toHaveBeenCalledWith(pid(8), 2);
      expect(aliveCount).toHaveBeenCalledWith(pid(8), 3);
    });

    it("asks the list for the player's bracket ids", () => {
      const list = standardList();
      renderStandard(list);

      expect(spies(list).playerBracketIdsSorted).toHaveBeenCalledWith(pid(8));
    });

    it("does not show the handicap in the headers of a scratch division", () => {
      renderStandard();

      expect(screen.queryByText(/\+35=/)).not.toBeInTheDocument();
    });
  });

  describe("squad game numbers", () => {
    it("labels the games with the bracket's squad game numbers", () => {
      const list = makeFakeList(8, {
        brktId: brktId2,
        startGame: 4,
        brackets: [
          makeFakeBracket(pid(8), { matches: path8(), winner: true, earnings: 25 }),
        ],
        viewerScores: { 1: 230, 2: 231, 3: 232 },
      });

      renderStandard(list);

      expect(gameHeader(`230 ${nm(8)} Game 4`)).toBeInTheDocument();
      expect(gameHeader(`231 ${nm(8)} Game 5`)).toBeInTheDocument();
      expect(gameHeader(`232 ${nm(8)} Game 6`)).toBeInTheDocument();
    });

    it("asks the list for the squad game number of each bracket game", () => {
      const list = standardList({ startGame: 4, brktId: brktId2 });
      renderStandard(list);

      const { squadGameNumber } = spies(list);
      expect(squadGameNumber).toHaveBeenCalledWith(1);
      expect(squadGameNumber).toHaveBeenCalledWith(2);
      expect(squadGameNumber).toHaveBeenCalledWith(3);
    });

    it("uses the title of the bracket the list is for", () => {
      renderStandard(standardList({ brktId: brktId2, startGame: 4 }));

      const name = getBrktOrElimName(
        mockTmntFullData.brkts[1],
        mockTmntFullData.divs
      );
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  describe("column widths and scrolling", () => {
    it.each([1, 2, 3])("gives column %i a minimum width of 300px", (n) => {
      renderStandard();

      expect(screen.getByTestId(`brkt-game-column-${n}`)).toHaveStyle({
        minWidth: "300px",
      });
    });

    it("keeps the percentage widths, wider for game 3", () => {
      renderStandard();

      expect(screen.getByTestId("brkt-game-column-1")).toHaveStyle({ width: "32%" });
      expect(screen.getByTestId("brkt-game-column-2")).toHaveStyle({ width: "32%" });
      expect(screen.getByTestId("brkt-game-column-3")).toHaveStyle({ width: "36%" });
    });

    it("renders exactly three columns", () => {
      renderStandard();

      expect(screen.getAllByTestId(/^brkt-game-column-/)).toHaveLength(3);
    });

    it("renders the three columns even when the player is in no brackets", () => {
      renderStandard(
        standardList(
          { oneBrktIds: [], brackets: [makeFakeBracket(pid(8))] },
          { bracketIndexMap: new Map([[oneBrktId1, 0]]) }
        )
      );

      expect(screen.getAllByTestId(/^brkt-game-column-/)).toHaveLength(3);
    });

    it("keeps the three columns on one line, and scrolls sideways when they do not fit", () => {
      renderStandard();

      expect(screen.getByTestId("brkt-columns-row")).toHaveClass("flex-nowrap");
      expect(screen.getByTestId("brkt-columns-scroll")).toHaveClass("overflow-x-auto");
    });

    it("has the columns inside the scrolling wrapper", () => {
      renderStandard();

      const scroll = screen.getByTestId("brkt-columns-scroll");
      expect(within(scroll).getByTestId("brkt-columns-row")).toBeInTheDocument();
      expect(within(scroll).getAllByTestId(/^brkt-game-column-/)).toHaveLength(3);
    });

    it("does not put the bracket title inside the scrolling area", () => {
      renderStandard();

      const name = getBrktOrElimName(
        mockTmntFullData.brkts[0],
        mockTmntFullData.divs
      );
      expect(
        within(screen.getByTestId("brkt-columns-scroll")).queryByText(name)
      ).not.toBeInTheDocument();
      expect(screen.getByText(name)).toBeInTheDocument();
    });
  });

  describe("games without a score for the player", () => {
    it("leaves the score off the header and hides the alive count for games 2 and 3", () => {
      renderStandard(standardList({ viewerScores: { 1: 230 } }));

      const game1 = gameHeader(`230 ${nm(8)} Game 1`);
      const game2 = gameHeader(`${nm(8)} Game 2`);
      const game3 = gameHeader(`${nm(8)} Game 3`);

      expect(within(game1).getByText("(3 brackets)")).toBeInTheDocument();
      expect(within(game2).queryByText(/brackets/)).not.toBeInTheDocument();
      expect(within(game3).queryByText(/brackets/)).not.toBeInTheDocument();
    });

    it("still shows the alive count for game 1 when only a later game has a score", () => {
      renderStandard(standardList({ viewerScores: { 2: 231 } }));

      const game1 = gameHeader(`${nm(8)} Game 1`);
      expect(within(game1).getByText("(3 brackets)")).toBeInTheDocument();
      expect(
        within(gameHeader(`231 ${nm(8)} Game 2`)).getByText("(2 brackets)")
      ).toBeInTheDocument();
    });

    it("treats null scores for later games the same as missing ones", () => {
      renderStandard(
        standardList({ viewerScores: { 1: 230, 2: null, 3: null } })
      );

      expect(gameHeader(`230 ${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 3`)).toBeInTheDocument();
      expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
    });
  });

  /**********************************************************************/
  /* no scores bowled yet: the SQL returns entries with null scores     */
  /**********************************************************************/
  describe("before any game has been bowled (the map has entries with null scores)", () => {
    const nullScores = { 1: null, 2: null, 3: null };

    const noScoresList = () =>
      standardList({
        viewerScores: nullScores,
        brackets: [
          makeFakeBracket(pid(8), {
            matches: { 1: [seed(7), seed(8)] },
          }),
        ],
      });

    it("shows the bracket, not an error", () => {
      renderStandard(noScoresList());

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 3`)).toBeInTheDocument();
    });

    it("shows the opponent in game 1 with a blank, clickable score", () => {
      renderStandard(noScoresList());

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent(/^__$/);
      expect(link).toHaveAttribute("href", hrefFor(oneBrktId1));
      expect(screen.getByText(nm(7))).toBeInTheDocument();
    });

    it("shows one blank row per bracket the player is in", () => {
      renderStandard(
        standardList({
          viewerScores: nullScores,
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [
            makeFakeBracket(pid(8), { matches: { 1: [seed(7), seed(8)] } }),
            makeFakeBracket(pid(8), { matches: { 1: [seed(3), seed(8)] } }),
          ],
        })
      );

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
      links.forEach((link) => expect(link).toHaveTextContent(/^__$/));
      expect(links[0]).toHaveAttribute("href", hrefFor(oneBrktId1));
      expect(links[1]).toHaveAttribute("href", hrefFor(oneBrktId2));
      expect(screen.getByText(nm(7))).toBeInTheDocument();
      expect(screen.getByText(nm(3))).toBeInTheDocument();
    });

    it("shows no rows in games 2 and 3", () => {
      renderStandard(noScoresList());

      expect(screen.getAllByRole("link")).toHaveLength(1);
    });

    it("shows the alive count for game 1 only", () => {
      renderStandard(noScoresList());

      expect(
        within(gameHeader(`${nm(8)} Game 1`)).getByText("(3 brackets)")
      ).toBeInTheDocument();
      expect(
        within(gameHeader(`${nm(8)} Game 2`)).queryByText(/brackets/)
      ).not.toBeInTheDocument();
      expect(
        within(gameHeader(`${nm(8)} Game 3`)).queryByText(/brackets/)
      ).not.toBeInTheDocument();
    });

    it("shows no summary, no earnings and no handicap in the headers of a handicap division", () => {
      renderStandard(noScoresList(), hdcpData());

      expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Earnings:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/\+\d+=/)).not.toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 1`)).toBeInTheDocument();
    });

    it("does not ask the bracket for earnings", () => {
      const bracket = makeFakeBracket(pid(8), {
        matches: { 1: [seed(7), seed(8)] },
        winner: true,
        earnings: 25,
      });
      renderStandard(
        standardList({ viewerScores: nullScores, brackets: [bracket] })
      );

      expect(bracket.playerEarnings).not.toHaveBeenCalled();
    });
  });

  /********************/
  /* opponent rows    */
  /********************/
  describe("opponent rows", () => {
    it("renders one link per opponent per game, each to the bracket", () => {
      renderStandard();

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      links.forEach((link) => {
        expect(link).toHaveAttribute("href", hrefFor(oneBrktId1));
      });
    });

    it("renders the result letter and the opponent's score in each link, in game order", () => {
      renderStandard();

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent(/^W190$/);
      expect(links[1]).toHaveTextContent(/^W216$/);
      expect(links[2]).toHaveTextContent(/^W212$/);
    });

    it("renders each opponent's name", () => {
      renderStandard();

      expect(screen.getByText(nm(7))).toBeInTheDocument();
      expect(screen.getByText(nm(6))).toBeInTheDocument();
      expect(screen.getByText(nm(2))).toBeInTheDocument();
    });

    it("does not show the player as an opponent", () => {
      renderStandard();

      // the player's name on its own is only in the summary box
      expect(screen.getAllByText(nm(8))).toHaveLength(1);
    });

    it("renders a win in the success colour", () => {
      renderStandard();

      const link = screen.getAllByRole("link")[0];
      expect(within(link).getByText("W")).toHaveClass("text-success");
    });

    it("renders a loss in the danger colour", () => {
      const list = makeFakeList(1, {
        brackets: [
          makeFakeBracket(pid(1), {
            matches: {
              1: [
                seed(1, { score: 201, hdcp: 0, total: 201, result: "L" }),
                seed(2, { score: 210, hdcp: 0, total: 210, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderProps({ playerId: pid(1), data: mockTmntFullData, list });

      const link = screen.getByRole("link");
      expect(link).toHaveTextContent(/^L210$/);
      expect(within(link).getByText("L")).toHaveClass("text-danger");
      expect(screen.getByText(nm(2))).toBeInTheDocument();
    });

    it("shows only the score, with no letter, while the match has no result yet", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                seed(7, { score: 190, total: 190 }),
                seed(8, { score: 230, total: 230 }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      expect(screen.getByRole("link")).toHaveTextContent(/^190$/);
    });

    it("shows no rows for a game the player did not reach", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: { 1: path8()[1] },
          }),
        ],
      });

      renderStandard(list);

      expect(screen.getAllByRole("link")).toHaveLength(1);
    });
  });

  describe("opponent scores", () => {
    it("shows __ instead of a score when the opponent has no score yet", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              3: [
                seed(2, {}),
                seed(8, { score: 232, hdcp: 0, total: 232 }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      expect(screen.getByRole("link")).toHaveTextContent(/^__$/);
      expect(screen.getByText(nm(2))).toBeInTheDocument();
    });

    it("shows __ when the player has no score for the game, even if the opponent does", () => {
      renderStandard(standardList({ viewerScores: { 1: 230, 3: 232 } }));

      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveTextContent(/^W190$/);
      expect(links[1]).toHaveTextContent(/^__$/);
      expect(links[2]).toHaveTextContent(/^W212$/);
    });

    it("ignores the opponent's handicap in a scratch division", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                seed(7, { score: 190, hdcp: 26, total: 216, result: "L" }),
                seed(8, { score: 230, hdcp: 35, total: 265, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      expect(screen.getByRole("link")).toHaveTextContent(/^W190$/);
    });

    it("shows a bye as an opponent with a score of 0", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                {
                  playerId: byeId,
                  first_name: "Bye",
                  last_name: "",
                  average: 0,
                  score: 0,
                  hdcp: 0,
                  total: 0,
                  result: "L",
                },
                seed(8, { score: 230, hdcp: 0, total: 230, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      expect(screen.getByRole("link")).toHaveTextContent(/^W0$/);
      expect(screen.getByText(fullName("Bye", "").trim())).toBeInTheDocument();
    });

    it("shows the bye as a plain score in a handicap division, with no handicap", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                {
                  playerId: byeId,
                  first_name: "Bye",
                  last_name: "",
                  average: 0,
                  score: 0,
                  hdcp: 0,
                  total: 0,
                  result: "L",
                },
                seed(8, { score: 230, hdcp: 35, total: 265, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list, hdcpData());

      expect(screen.getByRole("link")).toHaveTextContent(/^W0$/);
    });
  });

  describe("a bye player in the bracket", () => {
    // a bracket with a bye pays the winner fee x 4 = $20, not fee x 5 = $25
    const byeWinnerBracket = () =>
      makeFakeBracket(pid(8), { matches: byePath8(), winner: true, earnings: 20 });

    const byeRunnerUpBracket = () =>
      makeFakeBracket(pid(8), {
        matches: {
          1: byePath8()[1],
          3: [
            seed(5, { score: 240, hdcp: 0, total: 240, result: "W" }),
            seed(8, { score: 232, hdcp: 0, total: 232, result: "L" }),
          ],
        },
        runnerUp: true,
        earnings: 10,
      });

    it("shows the bye as the game 1 opponent, with the bye's name", () => {
      renderStandard(standardList({ brackets: [byeWinnerBracket()] }));

      expect(screen.getByText(byeLabel)).toBeInTheDocument();
      expect(screen.getAllByRole("link")).toHaveLength(3);
    });

    it.each([
      ["a scratch division", () => ({ path: byePath8(), data: mockTmntFullData })],
      ["a handicap division", () => ({ path: byePath8Hdcp(), data: hdcpData() })],
    ])(
      "shows the bye's score as 0, with no handicap, in %s",
      (_label, build) => {
        const { path, data } = build();
        renderStandard(
          standardList({
            brackets: [
              makeFakeBracket(pid(8), { matches: path, winner: true, earnings: 20 }),
            ],
          }),
          data
        );

        const links = screen.getAllByRole("link");
        expect(links[0]).toHaveTextContent(/^W0$/);
        expect(links[0]).not.toHaveTextContent("=");
        expect(links[0]).not.toHaveTextContent("+");
      }
    );

    it("does not add a handicap to the bye, even if the match info has one", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                byeSeed({ hdcp: 12, total: 12 }),
                seed(8, { score: 230, hdcp: 35, total: 265, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list, hdcpData());

      expect(screen.getByRole("link")).toHaveTextContent(/^W0$/);
    });

    it("still adds the handicap for the other opponents in a handicap division", () => {
      renderStandard(
        standardList({
          brackets: [
            makeFakeBracket(pid(8), {
              matches: byePath8Hdcp(),
              winner: true,
              earnings: 20,
            }),
          ],
        }),
        hdcpData()
      );

      const links = screen.getAllByRole("link");
      // the bye shows a plain 0, with no handicap
      expect(links[0]).toHaveTextContent(/^W0$/);
      // the other opponents show score + handicap = total
      expect(links[1]).toHaveTextContent("W216 + 17 = 233");
      expect(links[2]).toHaveTextContent("W212 + 18 = 230");
    });

    it("shows the player's own result letter next to the bye, not the bye's result", () => {
      // pins the current display: "W0 <bye name>"; the bye's own L is not shown here
      renderStandard(standardList({ brackets: [byeWinnerBracket()] }));

      const link = screen.getAllByRole("link")[0];
      expect(within(link).getByText("W")).toHaveClass("text-success");
      expect(link).not.toHaveTextContent("L");
    });

    it("shows $20.00, not $25.00, for winning a bracket with a bye", () => {
      renderStandard(standardList({ brackets: [byeWinnerBracket()] }));

      expect(
        within(screen.getByText(nm(2))).getByText("$20.00")
      ).toHaveClass("text-success");
      expect(screen.queryByText("$25.00")).not.toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(20)}`)).toBeInTheDocument();
    });

    it("still shows $10.00 for finishing second in a bracket with a bye", () => {
      renderStandard(standardList({ brackets: [byeRunnerUpBracket()] }));

      expect(
        within(screen.getByText(nm(5))).getByText("$10.00")
      ).toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(10)}`)).toBeInTheDocument();
    });

    it("adds a bye bracket's $20 to a full bracket's $25 in the earnings", () => {
      const fullWinner = makeFakeBracket(pid(8), {
        matches: path8(),
        winner: true,
        earnings: 25,
      });
      renderStandard(
        standardList({
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [byeWinnerBracket(), fullWinner],
        })
      );

      expect(screen.getAllByText("$20.00")).toHaveLength(1);
      expect(screen.getAllByText("$25.00")).toHaveLength(1);
      expect(screen.getByText(`Earnings: ${fmt(45)}`)).toBeInTheDocument();
      expect(screen.getByText(entriesText(2, 5))).toBeInTheDocument();
    });
  });

  describe("matches with more than two players (a tie in game 2)", () => {
    // player 2 ties player 4 in the semifinal, then wins a three-player final
    const tieList = () =>
      makeFakeList(2, {
        brackets: [
          makeFakeBracket(pid(2), {
            matches: {
              1: [
                seed(1, { score: 201, hdcp: 0, total: 201, result: "L" }),
                seed(2, { score: 210, hdcp: 0, total: 210, result: "W" }),
              ],
              2: [
                seed(2, { score: 211, hdcp: 0, total: 211, result: "T" }),
                seed(4, { score: 211, hdcp: 0, total: 211, result: "T" }),
              ],
              3: [
                seed(2, { score: 240, hdcp: 0, total: 240, result: "W" }),
                seed(8, { score: 220, hdcp: 0, total: 220, result: "L" }),
                seed(4, { score: 230, hdcp: 0, total: 230, result: "L" }),
              ],
            },
            winner: true,
            earnings: 25,
          }),
        ],
        viewerScores: { 1: 210, 2: 211, 3: 240 },
      });

    const renderTie = () =>
      renderProps({
        playerId: pid(2),
        data: mockTmntFullData,
        list: tieList(),
      });

    it("renders a tie in the primary colour", () => {
      renderTie();

      const link = screen.getAllByRole("link")[1];
      expect(link).toHaveTextContent(/^T211$/);
      expect(within(link).getByText("T")).toHaveClass("text-primary");
    });

    it("renders one row for each opponent, highest score first", () => {
      renderTie();

      // game 1: player 1; game 2: player 4; game 3: player 4 (230) then player 8 (220)
      expect(screen.getAllByRole("link")).toHaveLength(4);
      const rows = rowsFor(4, 8);
      expect(rows[1]).toHaveTextContent(nm(4));
      expect(rows[2]).toHaveTextContent(nm(8));
    });

    it("shows the result only on the first row, and an & before the others", () => {
      renderTie();

      const links = screen.getAllByRole("link");
      expect(links[2]).toHaveTextContent(/^W230$/);
      expect(links[3]).toHaveTextContent(/^& 220$/);
    });

    it("shows the amount only on the first row of the game 3 opponents", () => {
      renderTie();

      const rows = rowsFor(4, 8);
      expect(within(rows[1]).getByText("$25.00")).toBeInTheDocument();
      expect(within(rows[2]).queryByText(/\$/)).not.toBeInTheDocument();
    });

    it("lists opponents with no score last", () => {
      const list = makeFakeList(8, {
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              3: [
                seed(8, { score: 232, hdcp: 0, total: 232 }),
                seed(4, {}),
                seed(2, { score: 212, hdcp: 0, total: 212 }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      const rows = rowsFor(2, 4);
      expect(rows[0]).toHaveTextContent(nm(2));
      expect(rows[1]).toHaveTextContent(nm(4));
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent(/^212$/);
      expect(links[1]).toHaveTextContent(/^__$/);
    });

    it("sorts opponents by score, not by the order they arrive in", () => {
      const list = makeFakeList(8, {
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              3: [
                seed(8, { score: 232, hdcp: 0, total: 232 }),
                seed(2, { score: 190, hdcp: 0, total: 190 }),
                seed(4, { score: 230, hdcp: 0, total: 230 }),
              ],
            },
          }),
        ],
      });

      renderStandard(list);

      const rows = rowsFor(2, 4);
      expect(rows[0]).toHaveTextContent(nm(4));
      expect(rows[1]).toHaveTextContent(nm(2));
    });
  });

  /********************/
  /* handicap         */
  /********************/
  describe("handicap division", () => {
    const hdcpList = (opts: FakeListOpts = {}) =>
      standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: path8Hdcp(),
            winner: true,
            earnings: 25,
          }),
        ],
        ...opts,
      });

    it("adds the player's handicap and total to each header", () => {
      renderStandard(hdcpList(), hdcpData());

      expect(gameHeader(`230+35=265 ${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`231+35=266 ${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`232+35=267 ${nm(8)} Game 3`)).toBeInTheDocument();
    });

    it("uses the handicap the division's settings give for the player's average", () => {
      renderStandard(hdcpList(), hdcpData());

      const hdcp = calcHandicap(
        players[7].average,
        hdcpDiv.hdcp_from,
        hdcpDiv.hdcp_per,
        hdcpDiv.int_hdcp
      );
      expect(
        gameHeader(`230+${hdcp}=${230 + hdcp} ${nm(8)} Game 1`)
      ).toBeInTheDocument();
    });

    it("leaves the handicap off the header of a game with no score", () => {
      renderStandard(hdcpList({ viewerScores: { 1: 230 } }), hdcpData());

      expect(gameHeader(`230+35=265 ${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`${nm(8)} Game 3`)).toBeInTheDocument();
    });

    it("shows each opponent's score, handicap and total", () => {
      renderStandard(hdcpList(), hdcpData());

      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("W190 + 26 = 216");
      expect(links[1]).toHaveTextContent("W216 + 17 = 233");
      expect(links[2]).toHaveTextContent("W212 + 18 = 230");
    });

    it("sorts opponents by score plus handicap", () => {
      const list = makeFakeList(8, {
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              3: [
                seed(8, { score: 232, hdcp: 35, total: 267, result: "W" }),
                // higher raw score, lower total
                seed(2, { score: 215, hdcp: 18, total: 233, result: "L" }),
                // lower raw score, higher total
                seed(4, { score: 200, hdcp: 36, total: 236, result: "L" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list, hdcpData());

      const rows = rowsFor(2, 4);
      expect(rows[0]).toHaveTextContent(nm(4));
      expect(rows[1]).toHaveTextContent(nm(2));
      const links = screen.getAllByRole("link");
      expect(links[0]).toHaveTextContent("W200 + 36 = 236");
      expect(links[1]).toHaveTextContent("& 215 + 18 = 233");
    });

    it("shows a plain score for an opponent with no handicap in the match info", () => {
      const list = makeFakeList(8, {
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              1: [
                seed(7, { score: 190, result: "L" }),
                seed(8, { score: 230, hdcp: 35, total: 265, result: "W" }),
              ],
            },
          }),
        ],
      });

      renderStandard(list, hdcpData());

      expect(screen.getByRole("link")).toHaveTextContent(/^W190$/);
    });
  });

  /********************/
  /* earnings         */
  /********************/
  describe("amounts and summary", () => {
    it("shows the player's earnings on the game 3 row of a bracket the player won", () => {
      renderStandard();

      const row = screen.getByText(nm(2));
      expect(within(row).getByText("$25.00")).toHaveClass("text-success");
    });

    it("shows an amount only in game 3", () => {
      renderStandard();

      expect(screen.getAllByText("$25.00")).toHaveLength(1);
      expect(
        within(screen.getByText(nm(7))).queryByText(/\$/)
      ).not.toBeInTheDocument();
      expect(
        within(screen.getByText(nm(6))).queryByText(/\$/)
      ).not.toBeInTheDocument();
    });

    it("shows the amount of a runner up", () => {
      const list = standardList({
        brackets: [
          makeFakeBracket(pid(8), {
            matches: {
              3: [
                seed(5, { score: 240, hdcp: 0, total: 240, result: "W" }),
                seed(8, { score: 232, hdcp: 0, total: 232, result: "L" }),
              ],
            },
            runnerUp: true,
            earnings: 10,
          }),
        ],
      });

      renderStandard(list);

      expect(
        within(screen.getByText(nm(5))).getByText("$10.00")
      ).toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(10)}`)).toBeInTheDocument();
    });

    it("shows no amount, and does not ask for earnings, for a bracket the player did not cash in", () => {
      const bracket = makeFakeBracket(pid(8), { matches: path8() });
      renderStandard(standardList({ brackets: [bracket] }));

      expect(bracket.playerEarnings).not.toHaveBeenCalled();
      expect(screen.queryByText(/^\$/)).not.toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(0)}`)).toBeInTheDocument();
    });

    it("shows no amount when the earnings are 0", () => {
      renderStandard(
        standardList({
          brackets: [
            makeFakeBracket(pid(8), {
              matches: path8(),
              winner: true,
              earnings: 0,
            }),
          ],
        })
      );

      expect(
        within(screen.getByText(nm(2))).queryByText(/\$/)
      ).not.toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(0)}`)).toBeInTheDocument();
    });

    it("renders the summary with the player's name, the bracket and the entries", () => {
      renderStandard();

      const name = getBrktOrElimName(
        mockTmntFullData.brkts[0],
        mockTmntFullData.divs
      );
      expect(screen.getByText(nm(8))).toBeInTheDocument();
      expect(screen.getByText(`Summary for ${name}`)).toBeInTheDocument();
      expect(screen.getByText(entriesText(1, 5))).toBeInTheDocument();
      expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
    });

    it("says entry, not entries, for a single bracket", () => {
      renderStandard();

      expect(screen.getByText(entriesText(1, 5))).toBeInTheDocument();
      expect(screen.queryByText(/1 entries/)).not.toBeInTheDocument();
    });

    it("multiplies the entry fee by the number of the player's brackets, and says entries", () => {
      renderStandard(
        standardList({
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [
            makeFakeBracket(pid(8), { matches: path8() }),
            makeFakeBracket(pid(8), { matches: path8() }),
          ],
        })
      );

      expect(screen.getByText(entriesText(2, 5))).toBeInTheDocument();
    });

    it("does not show the summary until the player has a game 3 score", () => {
      renderStandard(standardList({ viewerScores: { 1: 230, 2: 231 } }));

      expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Earnings:/)).not.toBeInTheDocument();
      expect(screen.queryByText(/(entry|entries) @/)).not.toBeInTheDocument();
    });

    it("does not calculate earnings before the player has a game 3 score", () => {
      const bracket = makeFakeBracket(pid(8), {
        matches: { 1: path8()[1], 2: path8()[2] },
        winner: true,
        earnings: 25,
      });
      renderStandard(
        standardList({
          viewerScores: { 1: 230, 2: 231 },
          brackets: [bracket],
        })
      );

      expect(bracket.playerEarnings).not.toHaveBeenCalled();
      expect(screen.queryByText(/Earnings:/)).not.toBeInTheDocument();
    });
    
  });

  describe("the summary box layout", () => {
    it("is centered in the third column", () => {
      renderStandard();

      const summary = screen.getByTestId("brkt-summary");
      expect(summary).toHaveClass("d-flex", "justify-content-center");
    });

    it("is not a Bootstrap row, so it no longer sits at the left", () => {
      renderStandard();

      expect(screen.getByTestId("brkt-summary")).not.toHaveClass("row");
    });

    it("has a 230px wide box", () => {
      renderStandard();

      expect(screen.getByTestId("brkt-summary-box")).toHaveStyle({ width: "230px" });
    });

    it("is inside the third column, and only there", () => {
      renderStandard();

      expect(
        within(screen.getByTestId("brkt-game-column-3")).getByTestId("brkt-summary")
      ).toBeInTheDocument();
      expect(
        within(screen.getByTestId("brkt-game-column-1")).queryByTestId("brkt-summary")
      ).not.toBeInTheDocument();
      expect(
        within(screen.getByTestId("brkt-game-column-2")).queryByTestId("brkt-summary")
      ).not.toBeInTheDocument();
    });

    it("is shown once, even for a player in several brackets", () => {
      renderStandard(
        standardList({
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [
            makeFakeBracket(pid(8), { matches: path8() }),
            makeFakeBracket(pid(8), { matches: path8() }),
          ],
        })
      );

      expect(screen.getAllByTestId("brkt-summary")).toHaveLength(1);
    });

    it("keeps the same width and centering when the player has refunds", () => {
      renderStandard(standardList(), withRefunds(2));

      expect(screen.getByTestId("brkt-summary")).toHaveClass("justify-content-center");
      expect(screen.getByTestId("brkt-summary-box")).toHaveStyle({ width: "230px" });
    });

    it("holds the summary lines inside the box", () => {
      renderStandard();

      const box = screen.getByTestId("brkt-summary-box");
      expect(within(box).getByText(entriesText(1, 5))).toBeInTheDocument();
      expect(within(box).getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
      expect(within(box).getByText(nm(8))).toBeInTheDocument();
    });

    it("is not shown until the player has a game 3 score", () => {
      renderStandard(standardList({ viewerScores: { 1: 230, 2: 231 } }));

      expect(screen.queryByTestId("brkt-summary")).not.toBeInTheDocument();
    });

    it("is not shown before any game has been bowled", () => {
      renderStandard(
        standardList({
          viewerScores: { 1: null, 2: null, 3: null },
          brackets: [
            makeFakeBracket(pid(8), { matches: { 1: [seed(7), seed(8)] } }),
          ],
        })
      );

      expect(screen.queryByTestId("brkt-summary")).not.toBeInTheDocument();
    });
  });  

  /********************/
  /* refunds          */
  /********************/
  describe("refunds in the summary", () => {
    const winner25 = () =>
      makeFakeBracket(pid(8), { matches: path8(), winner: true, earnings: 25 });
    const noCash = () => makeFakeBracket(pid(8), { matches: path8() });
    const runnerUp10 = () =>
      makeFakeBracket(pid(8), {
        matches: {
          ...path8(),
          3: [
            seed(5, { score: 240, hdcp: 0, total: 240, result: "W" }),
            seed(8, { score: 232, hdcp: 0, total: 232, result: "L" }),
          ],
        },
        runnerUp: true,
        earnings: 10,
      });

    it("shows the unused entries, the total paid, the refunds and the total returned", () => {
      renderStandard(standardList(), withRefunds(2));

      expect(screen.getByText(entriesText(1, 5))).toBeInTheDocument();
      expect(screen.getByText(unusedText(2, 5))).toBeInTheDocument();
      expect(screen.getByText(totalPaidText(15))).toBeInTheDocument(); // $5 in + $10 unused
      expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
      expect(screen.getByText(refundsText(2, "refunds", 5))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedText(35))).toBeInTheDocument(); // $25 + $10
    });

    it("shows the lines in order: entries, unused, total paid, earnings, refunds, total returned", () => {
      const { container } = renderStandard(standardList(), withRefunds(2));

      expect(container).toHaveTextContent(
        inOrder(
          entriesText(1, 5),
          unusedText(2, 5),
          totalPaidText(15),
          `Earnings: ${fmt(25)}`,
          refundsText(2, "refunds", 5),
          totalReturnedText(35)
        )
      );
    });

    it.each([
      // [brackets the player is in, refunds, label]
      [1, 1, "refund"],
      [1, 2, "refunds"],
      [2, 1, "refund"],
      [2, 3, "refunds"],
    ] as const)(
      "with %i bracket(s) and %i refund(s), the refunds line says %s",
      (brackets, refunds, label) => {
        const oneBrktIds = [oneBrktId1, oneBrktId2].slice(0, brackets);
        renderStandard(
          standardList({
            oneBrktIds,
            brackets: oneBrktIds.map(() => noCash()),
          }),
          withRefunds(refunds)
        );

        expect(
          screen.getByText(refundsText(refunds, label, 5))
        ).toBeInTheDocument();
      }
    );

    it("still shows the refunds when the player earned nothing", () => {
      renderStandard(standardList({ brackets: [noCash()] }), withRefunds(2));

      expect(screen.getByText(`Earnings: ${fmt(0)}`)).toBeInTheDocument();
      expect(screen.getByText(totalPaidText(15))).toBeInTheDocument();
      expect(screen.getByText(refundsText(2, "refunds", 5))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedText(10))).toBeInTheDocument();
    });

    it("adds the refunds to the earnings of every bracket", () => {
      renderStandard(
        standardList({
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [winner25(), runnerUp10()],
        }),
        withRefunds(1)
      );

      expect(screen.getByText(entriesText(2, 5))).toBeInTheDocument();
      expect(screen.getByText(unusedText(1, 5))).toBeInTheDocument();
      expect(screen.getByText(totalPaidText(15))).toBeInTheDocument(); // $10 in + $5 unused
      expect(screen.getByText(`Earnings: ${fmt(35)}`)).toBeInTheDocument();
      expect(screen.getByText(refundsText(1, "refund", 5))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedText(40))).toBeInTheDocument(); // $35 + $5
    });

    it("uses the bracket's entry fee for the unused entries and the refunds", () => {
      renderStandard(standardList(), withRefunds(3, withBrkt({ fee: "10" })));

      expect(screen.getByText(entriesText(1, 10))).toBeInTheDocument();
      expect(screen.getByText(unusedText(3, 10))).toBeInTheDocument();
      expect(screen.getByText(totalPaidText(40))).toBeInTheDocument(); // $10 in + $30 unused
      expect(screen.getByText(refundsText(3, "refunds", 10))).toBeInTheDocument();
      expect(screen.getByText(totalReturnedText(55))).toBeInTheDocument(); // $25 + $30
    });

    it("uses the refunds on the entry for this list's bracket only", () => {
      // player 8 has refunds on the entry in bracket 2 only
      const data = withRefunds(2, mockTmntFullData, 8, brktId2);

      const { unmount } = renderStandard(standardList(), data);
      expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
      unmount();

      renderStandard(standardList({ brktId: brktId2, startGame: 4 }), data);
      expect(screen.getByText(unusedText(2, 5))).toBeInTheDocument();
    });

    it("does not change the opponent rows or the game 3 amount", () => {
      renderStandard(standardList(), withRefunds(2));

      expect(screen.getAllByRole("link")).toHaveLength(3);
      expect(screen.getAllByText("$25.00")).toHaveLength(1);
      expect(
        within(screen.getByText(nm(2))).getByText("$25.00")
      ).toHaveClass("text-success");
    });

    it("does not show the refunds before the player has a game 3 score", () => {
      renderStandard(
        standardList({ viewerScores: { 1: 230, 2: 231 } }),
        withRefunds(2)
      );

      expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
      expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Paid/)).not.toBeInTheDocument();
      expect(screen.queryByText(/Total Returned/)).not.toBeInTheDocument();
    });

    describe("without refunds", () => {
      const expectNoRefundLines = () => {
        expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Total Paid/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Total Returned/)).not.toBeInTheDocument();
        expect(screen.queryByText(/refund/)).not.toBeInTheDocument();
      };

      it("shows no refund lines when the player has no refunds", () => {
        renderStandard(standardList(), withRefunds(0));

        expectNoRefundLines();
        expect(screen.getByText(entriesText(1, 5))).toBeInTheDocument();
        expect(screen.getByText(`Earnings: ${fmt(25)}`)).toHaveClass("text-success");
      });

      it("treats a missing number of refunds as none", () => {
        const { container } = renderStandard(
          standardList(),
          withRefunds(undefined)
        );

        expectNoRefundLines();
        expect(container).not.toHaveTextContent("NaN");
        expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
      });
    });

    describe("borders in the summary (no refunds)", () => {
      it("has the top border only on the Earnings line", () => {
        const { container } = renderStandard();

        const earnings = summaryLine(`Earnings: ${fmt(25)}`);
        expect(earnings).toHaveClass("border-top");        
        expect(summaryLine(entriesText(1, 5))).not.toHaveClass("border-top");
        expect(screen.getByText(/^Summary for/)).not.toHaveClass("border-top");
        expect(screen.getByText(nm(8))).not.toHaveClass("border-top");        
      });

      it("has no bottom border on the Earnings line, which is the last line", () => {
        renderStandard();

        expect(summaryLine(`Earnings: ${fmt(25)}`)).not.toHaveClass(
          "border-bottom"
        );
      });

      it("separates the entries line from the Earnings line with a bottom border on the entries line", () => {
        renderStandard();

        expect(summaryLine(entriesText(1, 5))).toHaveClass("border-bottom");
        expect(summaryLine(entriesText(1, 5))).not.toHaveClass("border-top");
      });
    });    

    describe("borders in the summary (with refunds)", () => {
      const renderWithRefunds = () =>
        renderStandard(standardList(), withRefunds(2));

      it("has the top border only on the Earnings line", () => {
        renderWithRefunds();

        expect(summaryLine(`Earnings: ${fmt(25)}`)).toHaveClass("border-top");
        [
          entriesText(1, 5),
          unusedText(2, 5),
          totalPaidText(15),
          refundsText(2, "refunds", 5),
          totalReturnedText(35),
        ].forEach((text) => {
          expect(summaryLine(text)).not.toHaveClass("border-top");
        });
      });

      it("puts a bottom border on every line the player paid, so the lines above Earnings are underlined", () => {
        renderWithRefunds();

        [entriesText(1, 5), unusedText(2, 5), totalPaidText(15)].forEach(
          (text) => {
            expect(summaryLine(text)).toHaveClass("border-bottom");
          }
        );
      });

      it("underlines the Earnings and refunds lines, but not the last line, Total Returned", () => {
        renderWithRefunds();

        expect(summaryLine(`Earnings: ${fmt(25)}`)).toHaveClass("border-bottom");
        expect(summaryLine(refundsText(2, "refunds", 5))).toHaveClass(
          "border-bottom"
        );
        expect(summaryLine(totalReturnedText(35))).not.toHaveClass(
          "border-bottom"
        );
      });

      it("has no border at all on the Total Returned line", () => {
        renderWithRefunds();

        const last = summaryLine(totalReturnedText(35));
        expect(last).not.toHaveClass("border-top");
        expect(last).not.toHaveClass("border-bottom");
      });

      it("keeps the double line between what was paid and what was returned: Total Paid above the Earnings top border", () => {
        renderWithRefunds();

        // the bottom border of Total Paid and the top border of Earnings are the two lines
        expect(summaryLine(totalPaidText(15))).toHaveClass("border-bottom");
        expect(summaryLine(`Earnings: ${fmt(25)}`)).toHaveClass("border-top");
      });
    });    
  });

  /********************/
  /* several brackets */
  /********************/
  describe("a player in several brackets", () => {
    const winnerBracket = () =>
      makeFakeBracket(pid(8), {
        matches: path8(),
        winner: true,
        earnings: 25,
      });

    const runnerUpBracket = () =>
      makeFakeBracket(pid(8), {
        matches: {
          ...path8(),
          3: [
            seed(5, { score: 240, hdcp: 0, total: 240, result: "W" }),
            seed(8, { score: 232, hdcp: 0, total: 232, result: "L" }),
          ],
        },
        runnerUp: true,
        earnings: 10,
      });

    const twoBracketList = () =>
      standardList({
        oneBrktIds: [oneBrktId1, oneBrktId2],
        brackets: [winnerBracket(), runnerUpBracket()],
      });

    it("renders the brackets in each column in the order of the player's bracket ids", () => {
      renderStandard(twoBracketList());

      const hrefs = screen.getAllByRole("link").map((l) => l.getAttribute("href"));
      expect(hrefs).toEqual([
        hrefFor(oneBrktId1),
        hrefFor(oneBrktId2),
        hrefFor(oneBrktId1),
        hrefFor(oneBrktId2),
        hrefFor(oneBrktId1),
        hrefFor(oneBrktId2),
      ]);
    });

    it("shows each bracket's own result in game 3", () => {
      renderStandard(twoBracketList());

      const links = screen.getAllByRole("link");
      expect(links[4]).toHaveTextContent(/^W212$/);
      expect(links[5]).toHaveTextContent(/^L240$/);
    });

    it("shows each bracket's amount", () => {
      renderStandard(twoBracketList());

      expect(
        within(screen.getByText(nm(2))).getByText("$25.00")
      ).toBeInTheDocument();
      expect(
        within(screen.getByText(nm(5))).getByText("$10.00")
      ).toBeInTheDocument();
    });

    it("adds the amounts of every bracket into the earnings", () => {
      renderStandard(twoBracketList());

      expect(screen.getByText(`Earnings: ${fmt(35)}`)).toBeInTheDocument();
      expect(screen.getByText(entriesText(2, 5))).toBeInTheDocument();
    });

    it("counts only the brackets the player cashed in", () => {
      const noCash = makeFakeBracket(pid(8), { matches: path8() });
      renderStandard(
        standardList({
          oneBrktIds: [oneBrktId1, oneBrktId2],
          brackets: [winnerBracket(), noCash],
        })
      );

      expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
      expect(noCash.playerEarnings).not.toHaveBeenCalled();
    });

    it("skips a bracket id that is not in the index map when adding up the earnings", () => {
      renderStandard(
        standardList(
          {
            oneBrktIds: [oneBrktId1, UNKNOWN_ONE_BRKT],
            brackets: [winnerBracket()],
          },
          { bracketIndexMap: new Map([[oneBrktId1, 0]]) }
        )
      );

      expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
    });

    it("skips an index that has no bracket when adding up the earnings", () => {
      renderStandard(
        standardList(
          {
            oneBrktIds: [oneBrktId1, oneBrktId2],
            brackets: [winnerBracket()],
          },
          {
            bracketIndexMap: new Map([
              [oneBrktId1, 0],
              [oneBrktId2, 5],
            ]),
          }
        )
      );

      expect(screen.getByText(`Earnings: ${fmt(25)}`)).toBeInTheDocument();
    });
  });

  describe("bracket ids that cannot be shown", () => {
    it("shows no rows for a bracket id that is not in the index map, but still counts the entry", () => {
      renderStandard(
        standardList(
          { oneBrktIds: [oneBrktId1, UNKNOWN_ONE_BRKT] },
          { bracketIndexMap: new Map([[oneBrktId1, 0]]) }
        )
      );

      expect(screen.getAllByRole("link")).toHaveLength(3);
      expect(screen.getByText(entriesText(2, 5))).toBeInTheDocument();
    });

    it("shows no rows for an index that has no bracket", () => {
      renderStandard(
        standardList({}, { bracketIndexMap: new Map([[oneBrktId1, 5]]) })
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("shows no rows when the bracket has no match info for the player", () => {
      renderStandard(
        standardList({
          brackets: [makeFakeBracket(pid(8), { matches: {} })],
        })
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(gameHeader(`230 ${nm(8)} Game 1`)).toBeInTheDocument();
    });

    it("shows no rows when the player is not in the match", () => {
      renderStandard(
        standardList({
          brackets: [
            makeFakeBracket(pid(8), {
              matches: {
                1: [
                  seed(2, { score: 210, hdcp: 0, total: 210, result: "L" }),
                  seed(4, { score: 206, hdcp: 0, total: 206, result: "W" }),
                ],
              },
            }),
          ],
        })
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("shows no rows when the match has no opponents", () => {
      renderStandard(
        standardList({
          brackets: [
            makeFakeBracket(pid(8), {
              matches: {
                1: [seed(8, { score: 230, hdcp: 0, total: 230, result: "W" })],
              },
            }),
          ],
        })
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });

    it("shows no rows, and 0 entries, when the player is in no brackets", () => {
      renderStandard(
        standardList(
          { oneBrktIds: [], brackets: [makeFakeBracket(pid(8))] },
          { bracketIndexMap: new Map([[oneBrktId1, 0]]) }
        )
      );

      expect(screen.queryByRole("link")).not.toBeInTheDocument();
      expect(screen.getByText(entriesText(0, 5))).toBeInTheDocument();
    });
  });

  /*****************************************************/
  /* integration tests: real BracketList from the mock */
  /*****************************************************/
  describe("with a real bracket list built from the mock tournament", () => {
    const brkt = mockTmntFullData.brkts[0];
    const gameNums = Array.from(
      { length: brkt.games },
      (_, i) => brkt.start + i
    );
    const minimalResults = players.map((p) => ({
      player_id: p.id,
      div_id: divId1,
    })) as unknown as tmntGameResult[];

    const buildRealList = () => {
      const list = new BracketList(
        brkt.id,
        defaultPlayersPerMatch,
        brkt.games,
        gameNums,
        undefined,
        { tmntFullData: mockTmntFullData, divId: brkt.div_id }
      );
      list.updateBracketMatches(minimalResults);
      return list;
    };

    // what the player has earned across the list's brackets
    const earningsFor = (list: BracketList, playerId: string) =>
      list.brackets.reduce(
        (sum, b) =>
          sum +
          (b.winnerIds.has(playerId) || b.runnerUpIds.has(playerId)
            ? b.playerEarnings(playerId)
            : 0),
        0
      );

    const renderReal = (n: number) => {
      const list = buildRealList();
      renderProps({ playerId: pid(n), data: mockTmntFullData, list });
      return list;
    };

    const linksTo = (oneBrktId: string) =>
      screen
        .getAllByRole("link")
        .filter((link) => link.getAttribute("href") === hrefFor(oneBrktId));

    it("builds a list that has game scores", () => {
      const list = buildRealList();

      expect(list.gameScoreMap?.size).toBeGreaterThan(0);
      expect(list.playerBracketIdsSorted(pid(8)).length).toBeGreaterThan(0);
    });

    it("renders player 8 without an error and with the player's scores in the headers", () => {
      renderReal(8);

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(gameHeader(`230 ${nm(8)} Game 1`)).toBeInTheDocument();
      expect(gameHeader(`231 ${nm(8)} Game 2`)).toBeInTheDocument();
      expect(gameHeader(`232 ${nm(8)} Game 3`)).toBeInTheDocument();
    });

    it("shows player 8's path through the first bracket: wins over players 7, 6 and 2", () => {
      renderReal(8);

      const links = linksTo(oneBrktId1);
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveTextContent(/^W190$/);
      expect(links[1]).toHaveTextContent(/^W216$/);
      expect(links[2]).toHaveTextContent(/^W212$/);
    });

    it("shows player 1 losing to player 2 in the first game of the first bracket, and nothing after", () => {
      renderReal(1);

      const links = linksTo(oneBrktId1);
      expect(links).toHaveLength(1);
      expect(links[0]).toHaveTextContent(/^L210$/);
    });

    it("shows the summary with one entry for each of the player's brackets", () => {
      const list = buildRealList();
      renderProps({ playerId: pid(8), data: mockTmntFullData, list });

      const count = list.playerBracketIdsSorted(pid(8)).length;
      expect(screen.getByText(entriesText(count, 5))).toBeInTheDocument();
    });

    it("shows player 8's earnings, which include at least the first bracket's winner amount", () => {
      const list = buildRealList();
      const expected = earningsFor(list, pid(8));
      renderProps({ playerId: pid(8), data: mockTmntFullData, list });

      expect(expected).toBeGreaterThanOrEqual(25);
      expect(screen.getByText(`Earnings: ${fmt(expected)}`)).toBeInTheDocument();
    });

    it("shows a player who won no bracket with the earnings the brackets give", () => {
      const list = buildRealList();
      const expected = earningsFor(list, pid(1));
      renderProps({ playerId: pid(1), data: mockTmntFullData, list });

      expect(screen.getByText(`Earnings: ${fmt(expected)}`)).toBeInTheDocument();
    });

    it("shows a blank, clickable bracket view when no scores have been entered (null scores)", () => {
      mockedToGameTypes.mockReturnValue(
        mockGames.map((g) => ({ ...g, score: null }))
      );
      const list = buildRealList();
      renderProps({ playerId: pid(8), data: mockTmntFullData, list });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(list.playerBracketIdsSorted(pid(8)).length);
      links.forEach((link) => expect(link).toHaveTextContent(/^__$/));
      expect(screen.getAllByText(nm(7)).length).toBeGreaterThan(0);
      expect(screen.queryByText(/Summary for/)).not.toBeInTheDocument();
    });

    it("shows the error when the real list has no score entries at all", () => {
      mockedToGameTypes.mockReturnValue([]);
      const list = buildRealList();
      renderProps({ playerId: pid(8), data: mockTmntFullData, list });

      expect(screen.getByRole("alert")).toHaveTextContent(
        "Game score map not found."
      );
    });

    describe("refunds", () => {
      // player 1 is in all 8 brackets of the first list, and paid for 10
      const entry = mockTmntFullData.brktEntries.find(
        (e) => e.player_id === pid(1) && e.brkt_id === brktId1
      );

      it("shows player 1's unused entries and refunds from the mock entry", () => {
        const list = buildRealList();
        const inCount = list.playerBracketIdsSorted(pid(1)).length;
        const earnings = earningsFor(list, pid(1));
        renderProps({ playerId: pid(1), data: mockTmntFullData, list });

        expect(screen.getByText(entriesText(inCount, 5))).toBeInTheDocument();
        expect(screen.getByText(unusedText(2, 5))).toBeInTheDocument();
        expect(
          screen.getByText(totalPaidText(5 * inCount + 10))
        ).toBeInTheDocument();
        expect(screen.getByText(`Earnings: ${fmt(earnings)}`)).toBeInTheDocument();
        expect(screen.getByText(refundsText(2, "refunds", 5))).toBeInTheDocument();
        expect(
          screen.getByText(totalReturnedText(earnings + 10))
        ).toBeInTheDocument();
      });

      it("the total paid equals the fee on player 1's entry: the brackets played plus the unused ones", () => {
        const list = buildRealList();
        const inCount = list.playerBracketIdsSorted(pid(1)).length;

        expect(5 * (inCount + 2)).toBe(Number(entry?.fee));
      });

      it("shows no refund lines for player 8, who has no refunds", () => {
        renderReal(8);

        expect(screen.queryByText(/unused/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Total Paid/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Total Returned/)).not.toBeInTheDocument();
      });
    });

    describe("with a bye player in the first bracket", () => {
      // replace the first seat of the first bracket (player 1) with the bye;
      // player 2 now plays the bye in game 1
      const dataWithBye = (): tmntFullType => ({
        ...mockTmntFullData,
        brktSeeds: mockTmntFullData.brktSeeds.map((s) =>
          s.one_brkt_id === oneBrktId1 && s.seed === 0
            ? { ...s, player_id: byeId }
            : s
        ),
      });

      const buildByeList = () => {
        const list = new BracketList(
          brkt.id,
          defaultPlayersPerMatch,
          brkt.games,
          gameNums,
          mockByePlayer,
          { tmntFullData: dataWithBye(), divId: brkt.div_id }
        );
        list.updateBracketMatches(minimalResults);
        return list;
      };

      const firstBracket = (list: BracketList) =>
        list.brackets.find((b) => b.id === oneBrktId1);

      it("seats the bye in the first bracket, and not in the same bracket without it", () => {
        expect(firstBracket(buildByeList())?.players).toContain(byeId);
        expect(firstBracket(buildRealList())?.players).not.toContain(byeId);
      });

      it("pays the winner $20 with a bye and $25 without", () => {
        expect(firstBracket(buildRealList())?.playerEarnings(pid(8))).toBe(25);
        expect(firstBracket(buildByeList())?.playerEarnings(pid(8))).toBe(20);
      });

      it("pays the runner up $10 with or without a bye", () => {
        expect(firstBracket(buildRealList())?.playerEarnings(pid(2))).toBe(10);
        expect(firstBracket(buildByeList())?.playerEarnings(pid(2))).toBe(10);
      });

      it("shows the winner's $20.00 and a total $5 lower than without the bye", () => {
        const list = buildByeList();
        const withBye = earningsFor(list, pid(8));
        expect(withBye).toBe(earningsFor(buildRealList(), pid(8)) - 5);

        renderProps({ playerId: pid(8), data: mockTmntFullData, list });

        expect(screen.getAllByText("$20.00").length).toBeGreaterThan(0);
        expect(screen.getByText(`Earnings: ${fmt(withBye)}`)).toBeInTheDocument();
      });

      it("shows the runner up's $10.00", () => {
        const list = buildByeList();
        renderProps({ playerId: pid(2), data: mockTmntFullData, list });

        expect(screen.getAllByText("$10.00").length).toBeGreaterThan(0);
      });

      it("shows player 2 beating the bye, with a score of 0, in game 1 of the first bracket", () => {
        const list = buildByeList();
        renderProps({ playerId: pid(2), data: mockTmntFullData, list });

        const links = linksTo(oneBrktId1);
        expect(links[0]).toHaveTextContent(/^W0$/);
        expect(screen.getByText(byeLabel)).toBeInTheDocument();
      });
    });    

  });
});