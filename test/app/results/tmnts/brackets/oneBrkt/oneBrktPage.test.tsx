/**
 * test/app/results/tmnts/brackets/oneBrkt/oneBrktPage.test.tsx
 * tests src/app/results/tmnt/[tmntId]/brackets/oneBrkt/[oneBrktId]/page.tsx
 *
 * Tournament data comes from mockTmntFullData. The bracket itself (match
 * results, earnings) is a controlled fake so every tie permutation can be
 * rendered and checked against the layout rules:
 *
 *   - the top entry in a match has no end border; every other entry does
 *   - tied players in game 1 or 2 BOTH advance to the next game
 *   - game 3 losers show their earnings in the row under their entry
 *   - the winner column shows the winner(s) and earnings, but no game score
 *
 * Bracket rules (from Eric):
 *   - a tie advances every tied player; the next game breaks the tie, and the
 *     tie breaker winner must still beat the opponent to advance
 *   - final: winner gets first, loser gets second. Tied players share the
 *     prize(s) for their place: a tie for the high score splits first (or
 *     first + second when everyone in the final ties), a tie for the low score
 *     splits second. A player who lost a tie breaker in the final gets nothing.
 *   - at most one bye per bracket; the bye scores 0, always loses, and never
 *     advances to game 2
 *
 * Match numbers:
 *   0\
 *     4
 *   1/ \
 *       6
 *   2\ /
 *     5
 *   3/
 *   0-3 game 1, 4-5 game 2, 6 game 3
 *
 * displayed bracket looks like this:
 *
 * playerId1     201 L
 * --------------------+ playerId2    211 W
 *                     +--------------------+
 * playerId2     210 W |                    |
 * --------------------+                    | playerId2    212 L
 *                                          +--------------------+
 * playerId3     195 W                      |             $10.00 |
 * --------------------+ playerId4    206 L |                    |
 *                     +--------------------+                    |
 * playerId4     205 L |                                         |
 * --------------------+                                         | playerId8
 *                                                               +---------------------
 * playerId5     225 L                                           |              $25.00
 * --------------------+ playerId6    216 L                      |
 *                     +--------------------+                    |
 * playerId6     229 W |                    |                    |
 * --------------------+                    | playerId8    232 W |
 *                                          +--------------------+
 * playerId7     190 L                      |
 * --------------------+ playerId8    231 W |
 *                     +--------------------+
 * playerId8     230 W |
 * --------------------+
 */

/*
 * This file checks bracket layout: row positions, end borders, and the
 * earnings row under each player. The page marks each column with
 * data-testid="brkt-column", each row in a column with "brkt-row", and the
 * score + result text with "brkt-score", so the layout can be read with
 * Testing Library queries alone.
 */

import React from "react";
import { render, screen, within, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useParams } from "next/navigation";
import OneBrktPage from "@/app/results/tmnt/[tmntId]/brackets/oneBrkt/[oneBrktId]/page";
import {
  mockTmntFullData,
  mockByePlayer,
  tmntId as TMNT_ID,
} from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { useTmntFullData } from "@/hooks/useTmntFullData";
import {
  fetchOneTmntGameResults,
  getOneTmntGameResultsError,
  getOneTmntGameResultsLoadStatus,
  getOneTmntGameResultsRequestedTmntId,
  getOneTmntGameResultsTmntId,
} from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
import { fullName, getBrktOrElimName } from "@/lib/getName";
import type { matchSeedInfoType } from "@/components/brackets/bracketMatchClass";
import type { BracketList } from "@/components/brackets/bracketListClass";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type { ioStatusType } from "@/redux/statusTypes";
import type { tmntFullType } from "@/lib/types/types";
import { getLocaleConfig } from "@/lib/currency/components/utils";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";

/* ------------------------------------------------------------------ */
/* module mocks                                                        */
/* ------------------------------------------------------------------ */

const mockDispatch = jest.fn();

jest.mock("@/lib/syncfusion-license", () => ({}));

// the page only uses the store module for a type
jest.mock("@/redux/store", () => ({}));

jest.mock("next/navigation", () => ({
  useParams: jest.fn(),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

// the selectors are jest.fn()s below, so the state passed in does not matter
jest.mock("react-redux", () => ({
  useDispatch: () => mockDispatch,
  useSelector: (selector: (state: unknown) => unknown) => selector({}),
}));

jest.mock("@/hooks/useTmntFullData", () => ({
  useTmntFullData: jest.fn(),
}));

jest.mock("@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice", () => ({
  fetchOneTmntGameResults: jest.fn((id: string) => ({
    type: "oneTmntGameResults/fetch",
    payload: id,
  })),
  getOneTmntGameResultsError: jest.fn(),
  getOneTmntGameResultsLoadStatus: jest.fn(),
  getOneTmntGameResultsRequestedTmntId: jest.fn(),
  getOneTmntGameResultsTmntId: jest.fn(),
}));

jest.mock("@/redux/features/tmntFullData/brktListRecordsSelector", () => ({
  getBrktListRecords: jest.fn(),
}));

jest.mock("@/components/modal/waitModal", () => ({
  __esModule: true,
  default: ({ show, message }: { show: boolean; message: string }) =>
    show ? <div data-testid="waitModal">{message}</div> : null,
}));

jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
  __esModule: true,
  default: ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) => (
    <div data-testid="tmntHomeHeader">{selectedTmntPageBtn}</div>
  ),
}));

const mockedUseParams = jest.mocked(useParams);
const mockedUseTmntFullData = jest.mocked(useTmntFullData);
const mockedFetchResults = jest.mocked(fetchOneTmntGameResults);
const mockedResultsError = jest.mocked(getOneTmntGameResultsError);
const mockedResultsLoadStatus = jest.mocked(getOneTmntGameResultsLoadStatus);
const mockedResultsRequestedId = jest.mocked(getOneTmntGameResultsRequestedTmntId);
const mockedResultsTmntId = jest.mocked(getOneTmntGameResultsTmntId);
const mockedBrktListRecords = jest.mocked(getBrktListRecords);

// typed from the hook, so it matches whatever retry returns
type RetryFn = ReturnType<typeof useTmntFullData>["retry"];
const mockRetry = jest.fn<ReturnType<RetryFn>, Parameters<RetryFn>>();

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

// an array item that must be there; throws instead of returning undefined
const getAt = <T,>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`no item at index ${String(index)}`);
  }
  return item;
};

/* ------------------------------------------------------------------ */
/* tmnt data from mockTmntFullData                                     */
/* ------------------------------------------------------------------ */

const targetOneBrkt = getAt(mockTmntFullData.oneBrkts, 0);
const BRKT_ID = targetOneBrkt.brkt_id;
const findTargetBrkt = () => {
  const brkt = mockTmntFullData.brkts.find((b) => b.id === BRKT_ID);
  if (!brkt) throw new Error(`mock data has no bracket ${BRKT_ID}`);
  return brkt;
};
const targetBrkt = findTargetBrkt();

// prize amounts from the bracket definition ($25 / $10 in the mock)
const WINNER_AMT = Number(targetBrkt.first);
const RUNNER_UP_AMT = Number(targetBrkt.second);

/* ------------------------------------------------------------------ */
/* fake bracket                                                        */
/* ------------------------------------------------------------------ */

type MatchNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type Result = "W" | "L" | "T";

interface FakePlayer {
  id: string;
  first: string;
  last: string;
  hdcp: number;
  score?: number;
  result?: Result;
}

interface FakeMatch {
  top: FakePlayer[];
  bottom: FakePlayer[];
}

type FakeMatches = Record<MatchNum, FakeMatch>;
type Earnings = Record<string, number>;

const ALL_MATCHES: MatchNum[] = [0, 1, 2, 3, 4, 5, 6];
const GAME_MATCHES: Record<1 | 2 | 3, MatchNum[]> = {
  1: [0, 1, 2, 3],
  2: [4, 5],
  3: [6],
};
const gameOfMatch = (m: MatchNum): 1 | 2 | 3 => (m <= 3 ? 1 : m <= 5 ? 2 : 3);

// squadGameNumber() returns game + offset; the fake getMatchInfo throws if
// the page passes anything else, so a wrong game number fails loudly.
const SGN_OFFSET = 10;

const toMatchInfo = (p: FakePlayer): matchSeedInfoType => ({
  playerId: p.id,
  first_name: p.first,
  last_name: p.last,
  average: undefined,
  score: p.score,
  hdcp: p.score == null ? undefined : p.hdcp,
  total: p.score == null ? undefined : p.score + p.hdcp,
  result: p.result,
  finalMatch: false,
});

const makeFakeBracket = (
  id: string,
  matches: FakeMatches,
  earnings: Earnings,
  opts: { noMatch?: boolean; noParent?: boolean; cacheInfo?: boolean } = {}
) => {
  const playersIn = (m: MatchNum) => [...matches[m].top, ...matches[m].bottom];

  // with cacheInfo, hands back the same info object for a player and game on
  // every call, so a page that mutates what it gets back is caught on the
  // next render
  const infoCache = new Map<string, matchSeedInfoType>();
  const cachedInfo = (p: FakePlayer, game: number) => {
    const key = `${String(game)}:${p.id}`;
    const cached = infoCache.get(key);
    if (cached) return cached;
    const info = toMatchInfo(p);
    if (opts.cacheInfo) infoCache.set(key, info);
    return info;
  };

  const match = {
    getMatchPlayers: jest.fn((m: MatchNum) => playersIn(m).map((p) => p.id)),
    getPlayersForPosition: jest.fn((m: MatchNum, pos: 0 | 1) =>
      (pos === 0 ? matches[m].top : matches[m].bottom).map((p) => p.id)
    ),
    getMatchInfo: jest.fn((playerIds: string[], squadGameNum: number) => {
      const game = squadGameNum - SGN_OFFSET;
      const candidates = ALL_MATCHES.filter((m) => gameOfMatch(m) === game);
      if (candidates.length === 0) {
        throw new Error(`unexpected squad game number ${String(squadGameNum)}`);
      }
      return playerIds.map((pid) => {
        for (const m of candidates) {
          const p = playersIn(m).find((x) => x.id === pid);
          if (p) return cachedInfo(p, game);
        }
        throw new Error(`player ${pid} not in game ${String(game)}`);
      });
    }),
  };

  return {
    id,
    match: opts.noMatch ? undefined : match,
    parent: opts.noParent
      ? undefined
      : { squadGameNumber: jest.fn((g: number) => g + SGN_OFFSET) },
    updateMatches: jest.fn(),
    playerEarnings: jest.fn((pid: string) => earnings[pid] ?? 0),
    winnerAmount: WINNER_AMT,
    runnerUpAmount: RUNNER_UP_AMT,
  };
};

type FakeBracket = ReturnType<typeof makeFakeBracket>;

/* ------------------------------------------------------------------ */
/* players and scenarios                                               */
/* ------------------------------------------------------------------ */

// the 8 players in mockTmntFullData, with a made-up handicap of 1..8
const basePlayers: FakePlayer[] = mockTmntFullData.players.slice(0, 8).map((p, i) => ({
  id: p.id,
  first: p.first_name,
  last: p.last_name,
  hdcp: i + 1,
}));
const P = (n: number) => getAt(basePlayers, n - 1);
const pid = (n: number) => P(n).id;
const sc = (p: FakePlayer, score?: number, result?: Result): FakePlayer => ({
  ...p,
  score,
  result,
});

const byePlayer: FakePlayer = {
  id: mockByePlayer.id,
  first: mockByePlayer.first_name,
  last: mockByePlayer.last_name,
  hdcp: 0,
};

// The bracket in the layout diagram (no ties).
// Note: the diagram shows playerId3 195 W / playerId4 205 L but advances
// playerId4, so the results here are made consistent (playerId4 wins).
const diagramMatches = (): FakeMatches => ({
  0: { top: [sc(P(1), 201, "L")], bottom: [sc(P(2), 210, "W")] },
  1: { top: [sc(P(3), 195, "L")], bottom: [sc(P(4), 205, "W")] },
  2: { top: [sc(P(5), 225, "L")], bottom: [sc(P(6), 229, "W")] },
  3: { top: [sc(P(7), 190, "L")], bottom: [sc(P(8), 230, "W")] },
  4: { top: [sc(P(2), 211, "W")], bottom: [sc(P(4), 206, "L")] },
  5: { top: [sc(P(6), 216, "L")], bottom: [sc(P(8), 231, "W")] },
  6: { top: [sc(P(2), 212, "L")], bottom: [sc(P(8), 232, "W")] },
});
const diagramEarnings = (): Earnings => ({
  [pid(2)]: RUNNER_UP_AMT,
  [pid(8)]: WINNER_AMT,
});

// The tie example: match 0 tied in game 1, both players advance to match 4.
// player2 wins the tie breaker (220 vs 200) and beats player4 (206).
const match0TieMatches = (): FakeMatches => ({
  ...diagramMatches(),
  0: { top: [sc(P(1), 210, "T")], bottom: [sc(P(2), 210, "T")] },
  4: {
    top: [sc(P(1), 200, "L"), sc(P(2), 220, "W")],
    bottom: [sc(P(4), 206, "L")],
  },
});

/**
 * Earnings for a finished final, per Eric's rules.
 * - Each side's group is settled first: only the high score(s) on a side
 *   stay in; anyone who lost the tie breaker gets nothing.
 * - If both sides' high scores are equal, everyone left splits first + second.
 * - Otherwise the higher group splits first and the lower group splits second.
 */
const settleFinal = (final: FakeMatch): Earnings => {
  const best = (players: FakePlayer[]) => {
    const high = Math.max(...players.map((p) => p.score ?? 0));
    return { high, group: players.filter((p) => (p.score ?? 0) === high) };
  };
  const top = best(final.top);
  const bottom = best(final.bottom);
  const earnings: Earnings = {};
  const pay = (group: FakePlayer[], amount: number) => {
    group.forEach((p) => {
      earnings[p.id] = amount / group.length;
    });
  };
  if (top.high === bottom.high) {
    pay([...top.group, ...bottom.group], WINNER_AMT + RUNNER_UP_AMT);
  } else if (top.high > bottom.high) {
    pay(top.group, WINNER_AMT);
    pay(bottom.group, RUNNER_UP_AMT);
  } else {
    pay(bottom.group, WINNER_AMT);
    pay(top.group, RUNNER_UP_AMT);
  }
  return earnings;
};

interface TieConfig {
  g1: [boolean, boolean, boolean, boolean];
  g2: [boolean, boolean];
  g3: boolean;
}

/**
 * Builds a complete bracket for a tie configuration.
 * - Tied players share the high score, are marked "T" and all advance.
 * - In game 2/3 the first top player and first bottom player have the high
 *   score (tied, or the bottom one wins). Any second player on a side lost
 *   that side's tie breaker.
 * - Earnings follow Eric's final rules (see settleFinal).
 */
const buildTieScenario = (cfg: TieConfig) => {
  const advanced: FakePlayer[][] = [];
  const game1 = {} as Pick<FakeMatches, 0 | 1 | 2 | 3>;

  ([0, 1, 2, 3] as const).forEach((m) => {
    const top = P(2 * m + 1);
    const bottom = P(2 * m + 2);
    if (cfg.g1[m]) {
      game1[m] = {
        top: [sc(top, 210, "T")],
        bottom: [sc(bottom, 210, "T")],
      };
      advanced[m] = [top, bottom];
    } else {
      const topWins = m % 2 === 1;
      game1[m] = {
        top: [sc(top, topWins ? 210 : 200, topWins ? "W" : "L")],
        bottom: [sc(bottom, topWins ? 200 : 210, topWins ? "L" : "W")],
      };
      advanced[m] = [topWins ? top : bottom];
    }
  });

  const play = (
    top: FakePlayer[],
    bottom: FakePlayer[],
    tie: boolean,
    high: number,
    low: number
  ) => {
    const winners = tie ? [getAt(top, 0), getAt(bottom, 0)] : [getAt(bottom, 0)];
    // the first top player always has the high score; they win only on a tie
    const res = (p: FakePlayer): FakePlayer => {
      if (winners.includes(p)) return sc(p, high, tie ? "T" : "W");
      if (p === top[0]) return sc(p, high - 1, "L");
      return sc(p, low, "L");
    };
    return { match: { top: top.map(res), bottom: bottom.map(res) }, winners };
  };

  const m4 = play(getAt(advanced, 0), getAt(advanced, 1), cfg.g2[0], 220, 205);
  const m5 = play(getAt(advanced, 2), getAt(advanced, 3), cfg.g2[1], 220, 205);
  const m6 = play(m4.winners, m5.winners, cfg.g3, 230, 215);
  const matches: FakeMatches = {
    ...game1,
    4: m4.match,
    5: m5.match,
    6: m6.match,
  };

  return { matches, earnings: settleFinal(m6.match) };
};

const tieConfigs: TieConfig[] = [];
for (let mask = 0; mask < 16; mask++) {
  for (const g2a of [false, true]) {
    for (const g2b of [false, true]) {
      for (const g3 of [false, true]) {
        tieConfigs.push({
          g1: [
            (mask & 1) !== 0,
            (mask & 2) !== 0,
            (mask & 4) !== 0,
            (mask & 8) !== 0,
          ],
          g2: [g2a, g2b],
          g3,
        });
      }
    }
  }
}

const tieLabel = (cfg: TieConfig) => {
  const list = (flags: boolean[], nums: number[]) =>
    nums.filter((_, i) => flags[i]).join(",") || "none";
  return (
    `game 1 ties: ${list(cfg.g1, [0, 1, 2, 3])}` +
    ` | game 2 ties: ${list(cfg.g2, [4, 5])}` +
    ` | game 3 tie: ${cfg.g3 ? "6" : "none"}`
  );
};

/* ------------------------------------------------------------------ */
/* render helper                                                       */
/* ------------------------------------------------------------------ */

const makeTmntData = (bindex: number, hdcpPer: number): tmntFullType => ({
  ...mockTmntFullData,
  oneBrkts: mockTmntFullData.oneBrkts.map((o) =>
    o.id === targetOneBrkt.id ? { ...o, bindex } : { ...o }
  ),
  divs: mockTmntFullData.divs.map((d) =>
    d.id === targetBrkt.div_id ? { ...d, hdcp_per: hdcpPer } : { ...d }
  ),
});

// the page only reads brackets[i].id for the other brackets in the list
const makeBrktList = (bindex: number, bracket: FakeBracket, count = 3) =>
  ({
    brackets: Array.from({ length: Math.max(count, bindex + 1) }, (_, i) =>
      i === bindex ? bracket : { id: `oneBrkt_other_${String(i)}` }
    ),
  }) as unknown as BracketList;

interface RenderOpts {
  bindex?: number;
  bracketCount?: number;
  hdcpPer?: number;
  matches?: FakeMatches;
  earnings?: Earnings;
  oneBrktId?: string;
  tmntData?: tmntFullType;
  bracket?: FakeBracket;
  brktListRecords?: brktListRecord;
  results?: {
    tmntId?: string;
    loadStatus?: ioStatusType;
    requestedTmntId?: string;
    error?: string;
  };
  tmntHook?: {
    hasData?: boolean;
    failed?: boolean;
    error?: string;
  };
}

const renderPage = (opts: RenderOpts = {}) => {
  const bindex = opts.bindex ?? 1;
  const tmntData = opts.tmntData ?? makeTmntData(bindex, opts.hdcpPer ?? 0);
  const bracket =
    opts.bracket ??
    makeFakeBracket(
      targetOneBrkt.id,
      opts.matches ?? diagramMatches(),
      opts.earnings ?? diagramEarnings()
    );
  const brktListRecords = opts.brktListRecords ?? {
    [BRKT_ID]: makeBrktList(bindex, bracket, opts.bracketCount),
  };

  mockedUseParams.mockReturnValue({
    tmntId: TMNT_ID,
    oneBrktId: opts.oneBrktId ?? targetOneBrkt.id,
  });

  mockedUseTmntFullData.mockReturnValue({
    data: tmntData,
    hasData: opts.tmntHook?.hasData ?? true,
    failed: opts.tmntHook?.failed ?? false,
    error: opts.tmntHook?.error,
    retry: mockRetry,
  });

  mockedResultsTmntId.mockReturnValue(opts.results?.tmntId ?? TMNT_ID);
  mockedResultsLoadStatus.mockReturnValue(opts.results?.loadStatus ?? "succeeded");
  mockedResultsRequestedId.mockReturnValue(opts.results?.requestedTmntId ?? TMNT_ID);
  mockedResultsError.mockReturnValue(opts.results?.error);
  mockedBrktListRecords.mockReturnValue(brktListRecords);

  const utils = render(<OneBrktPage />);
  return { ...utils, bracket, tmntData };
};

/* ------------------------------------------------------------------ */
/* DOM helpers                                                         */
/* ------------------------------------------------------------------ */

const norm = (s: string | null | undefined) =>
  (s ?? "").replace(/ /g, " ").replace(/\s+/g, " ").trim();

// format money the same way the page does, so the test does not assume
// rounding vs truncating (the page shows 35 / 3 as $11.66)
const moneyConfig = getLocaleConfig({ locale: "en-US" });
moneyConfig.prefix = "$";
const money = (n: number) => formatValueSymbSep2Dec(n.toString(), moneyConfig);

const getColumns = (container: HTMLElement) =>
  within(container).getAllByTestId("brkt-column");

// the four columns: game 1, game 2, game 3, winner
const getCols = (container: HTMLElement) => {
  const cols = getColumns(container);
  return [getAt(cols, 0), getAt(cols, 1), getAt(cols, 2), getAt(cols, 3)] as const;
};

const rowsOf = (col: HTMLElement) => within(col).getAllByTestId("brkt-row");

const nameOf = (p: FakePlayer) => fullName(p.first, p.last);

const findPlayerRow = (col: HTMLElement, p: FakePlayer): HTMLElement => {
  // getByTitle throws unless the player is in the column exactly once
  within(col).getByTitle(nameOf(p));
  const row = rowsOf(col).find(
    (r) => within(r).queryByTitle(nameOf(p)) !== null
  );
  if (!row) throw new Error(`no row for ${nameOf(p)}`);
  return row;
};

// the row under a game 3 or winner entry, which holds the earnings
const earningsRowOf = (col: HTMLElement, row: HTMLElement): HTMLElement => {
  const rows = rowsOf(col);
  return getAt(rows, rows.indexOf(row) + 1);
};

const scoreTextOf = (row: HTMLElement) =>
  norm(within(row).queryByTestId("brkt-score")?.textContent);

// player name spans carry the name as their title; blank slots have no name
const namedPlayersIn = (col: HTMLElement) => within(col).queryAllByTitle(/\S/);

const hasEndBorder = (el: Element | undefined) =>
  el !== undefined && el.classList.contains("border-end");

const expectedScoreText = (p: FakePlayer, hdcpPer: number) => {
  if (p.score == null) return "";
  let txt = String(p.score);
  if (hdcpPer > 0 && !p.id.startsWith("bye")) {
    txt += ` + ${String(p.hdcp)} = ${String(p.score + p.hdcp)}`;
  }
  return norm(`${txt} ${p.result ?? ""}`);
};

/**
 * Checks every game column against the bracket rules, and the winner column
 * for names, placement and earnings.
 */
const expectBracketRendered = (
  container: HTMLElement,
  matches: FakeMatches,
  earnings: Earnings,
  hdcpPer = 0
) => {
  const cols = getColumns(container);
  expect(cols).toHaveLength(4);

  // column 1 is the full 15-row grid; no other column may overflow it
  expect(rowsOf(getAt(cols, 0))).toHaveLength(15);
  cols.forEach((col) => {
    expect(rowsOf(col).length).toBeLessThanOrEqual(15);
  });

  ([1, 2, 3] as const).forEach((game) => {
    const col = getAt(cols, game - 1);
    const rows = rowsOf(col);
    const indexes: number[] = [];
    let expectedCount = 0;

    GAME_MATCHES[game].forEach((m) => {
      (["top", "bottom"] as const).forEach((side) => {
        const sidePlayers = matches[m][side];
        sidePlayers.forEach((p, i) => {
          expectedCount++;
          const row = findPlayerRow(col, p);
          indexes.push(rows.indexOf(row));

          expect(scoreTextOf(row)).toBe(expectedScoreText(p, hdcpPer));

          const borderEnd =
            game === 1 ? side === "bottom" : !(side === "top" && i === 0);
          expect(hasEndBorder(row)).toBe(borderEnd);

          if (game === 3) {
            const earnRow = earningsRowOf(col, row);
            const amt = earnings[p.id] ?? 0;
            const expectedEarn = p.result === "L" && amt !== 0 ? money(amt) : "";
            expect(norm(earnRow.textContent)).toBe(expectedEarn);
            const earnBorder = side === "top" || i < sidePlayers.length - 1;
            expect(hasEndBorder(earnRow)).toBe(earnBorder);
          }
        });
      });
    });

    // players appear top-to-bottom in match order, with nothing extra
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
    expect(namedPlayersIn(col)).toHaveLength(expectedCount);
  });

  // winner column
  const winnerCol = getAt(cols, 3);
  const winnerRows = rowsOf(winnerCol);
  const winners = [...matches[6].top, ...matches[6].bottom].filter(
    (p) => p.result === "W" || p.result === "T"
  );
  expect(namedPlayersIn(winnerCol)).toHaveLength(winners.length);

  winners.forEach((p, i) => {
    const row = findPlayerRow(winnerCol, p);
    // winners are centered on row 8 (index 7); each winner uses two rows
    expect(winnerRows.indexOf(row)).toBe(8 - winners.length + i * 2);
    expect(hasEndBorder(row)).toBe(false);
    expect(scoreTextOf(row)).toBe("");
    expect(norm(earningsRowOf(winnerCol, row).textContent)).toBe(money(earnings[p.id] ?? 0));
  });
};

/* ------------------------------------------------------------------ */
/* tests                                                               */
/* ------------------------------------------------------------------ */

beforeEach(() => {
  jest.clearAllMocks();
});

describe("OneBrktPage - loading and errors", () => {
  it("shows the wait modal while tournament data is loading", () => {
    renderPage({ tmntHook: { hasData: false } });
    expect(screen.getByTestId("waitModal")).toHaveTextContent("Loading...");
    expect(screen.queryByTestId("tmntHomeHeader")).not.toBeInTheDocument();
  });

  it("shows a missing-data message when the tmnt is missing a child", () => {
    renderPage({
      tmntHook: {
        hasData: false,
        failed: true,
        error: "tmnt is missing required child: divs",
      },
    });
    expect(screen.getByText("Unable to load tournament")).toBeInTheDocument();
    expect(
      screen.getByText(`Tournament with id: ${TMNT_ID} is missing data.`)
    ).toBeInTheDocument();
  });

  it("shows a general message for other tmnt load errors", () => {
    renderPage({
      tmntHook: { hasData: false, failed: true, error: "network down" },
    });
    expect(
      screen.getByText(
        `An error occurred while loading the tournament with id: ${TMNT_ID}.`
      )
    ).toBeInTheDocument();
  });

  it("shows a general message when the tmnt failed without an error", () => {
    renderPage({ tmntHook: { hasData: false, failed: true } });
    expect(
      screen.getByText(
        `An error occurred while loading the tournament with id: ${TMNT_ID}.`
      )
    ).toBeInTheDocument();
  });

  it("calls retry when Retry is clicked after a tmnt load failure", () => {
    renderPage({ tmntHook: { hasData: false, failed: true, error: "x" } });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mockRetry).toHaveBeenCalledTimes(1);
  });

  it("fetches game results when they are not loaded for this tmnt", () => {
    renderPage({
      results: { tmntId: "", loadStatus: "idle", requestedTmntId: "" },
    });
    expect(mockedFetchResults).toHaveBeenCalledWith(TMNT_ID);
    expect(mockDispatch).toHaveBeenCalledWith({
      type: "oneTmntGameResults/fetch",
      payload: TMNT_ID,
    });
    expect(screen.getByTestId("waitModal")).toHaveTextContent("Loading...");
  });

  it("fetches game results when another tmnt's results are loaded", () => {
    renderPage({
      results: {
        tmntId: "tmt_other",
        loadStatus: "succeeded",
        requestedTmntId: "tmt_other",
      },
    });
    expect(mockedFetchResults).toHaveBeenCalledWith(TMNT_ID);
  });

  it("refetches when the last failure was for a different tmnt", () => {
    renderPage({
      results: { tmntId: "", loadStatus: "failed", requestedTmntId: "tmt_other" },
    });
    expect(mockedFetchResults).toHaveBeenCalledWith(TMNT_ID);
  });

  it("does not fetch while game results are loading", () => {
    renderPage({
      results: { tmntId: "", loadStatus: "loading", requestedTmntId: TMNT_ID },
    });
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(screen.getByTestId("waitModal")).toBeInTheDocument();
  });

  it("does not fetch when game results are already loaded", () => {
    renderPage();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("shows the results error and does not auto-refetch after a failure", () => {
    renderPage({
      results: {
        tmntId: "",
        loadStatus: "failed",
        requestedTmntId: TMNT_ID,
        error: "games fetch failed",
      },
    });
    expect(screen.getByText("Unable to load tournament")).toBeInTheDocument();
    expect(screen.getByText("games fetch failed")).toBeInTheDocument();
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("shows a default message when results failed without an error", () => {
    renderPage({
      results: { tmntId: "", loadStatus: "failed", requestedTmntId: TMNT_ID },
    });
    expect(
      screen.getByText(
        `An error occurred while loading games for tournament with id: ${TMNT_ID}.`
      )
    ).toBeInTheDocument();
  });

  it("dispatches a fetch when Retry is clicked after a results failure", () => {
    renderPage({
      results: {
        tmntId: "",
        loadStatus: "failed",
        requestedTmntId: TMNT_ID,
        error: "games fetch failed",
      },
    });
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(mockedFetchResults).toHaveBeenCalledWith(TMNT_ID);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

describe("OneBrktPage - missing data", () => {
  it("shows an error when the one bracket id is not found", () => {
    renderPage({ oneBrktId: "obk_missing" });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "One bracket with id obk_missing not found."
    );
  });

  it("shows an error when the bracket definition is not found", () => {
    const data = makeTmntData(1, 0);
    renderPage({
      tmntData: { ...data, brkts: data.brkts.filter((b) => b.id !== BRKT_ID) },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Bracket definition with id ${BRKT_ID} not found.`
    );
  });

  it("shows an error when the bracket list is not found", () => {
    renderPage({ brktListRecords: {} });
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Bracket list with bracket definition id ${BRKT_ID} not found.`
    );
  });

  it("shows an error when the bracket index is not in the list", () => {
    const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings());
    renderPage({
      bindex: 5,
      brktListRecords: { [BRKT_ID]: makeBrktList(0, bracket, 3) },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bracket with index 5 not found in bracket list."
    );
  });

  it("shows an error when the bracket has no match class", () => {
    const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings(), {
      noMatch: true,
    });
    renderPage({ bracket });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bracket with index 1 has no match class."
    );
  });

  it("shows an error when the bracket list has no brackets", () => {
    renderPage({
      brktListRecords: { [BRKT_ID]: { brackets: [] } as unknown as BracketList },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bracket list has no brackets."
    );
  });

  it("shows an error when the bracket has no parent bracket list", () => {
    const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings(), {
      noParent: true,
    });
    renderPage({ bracket });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bracket with index 1 has no parent bracket list."
    );
  });

  it("shows an error when the bracket's div is not found", () => {
    const data = makeTmntData(1, 0);
    renderPage({
      tmntData: {
        ...data,
        divs: data.divs.filter((d) => d.id !== targetBrkt.div_id),
      },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      `Div with id ${targetBrkt.div_id} not found.`
    );
  });
});

describe("OneBrktPage - header and navigation", () => {
  it("renders the tmnt header with the Brackets button selected", () => {
    renderPage();
    expect(screen.getByTestId("tmntHomeHeader")).toHaveTextContent("Brackets");
  });

  it("updates the bracket matches before rendering", () => {
    const { bracket } = renderPage();
    expect(bracket.updateMatches).toHaveBeenCalled();
  });

  it("shows the bracket name, number and prize amounts", () => {
    renderPage({ bindex: 1 });
    const brktName = getBrktOrElimName(targetBrkt, mockTmntFullData.divs);
    expect(
      screen.getByText(`${brktName} - Bracket Number 2`)
    ).toBeInTheDocument();
    expect(screen.getByText("1st $25.00 2nd $10.00")).toBeInTheDocument();
  });

  it("links to the previous and next brackets", () => {
    renderPage({ bindex: 1, bracketCount: 3 });
    const base = `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/`;
    expect(screen.getByRole("link", { name: "<-" })).toHaveAttribute(
      "href",
      `${base}oneBrkt_other_0`
    );
    expect(screen.getByRole("link", { name: "->" })).toHaveAttribute(
      "href",
      `${base}oneBrkt_other_2`
    );
  });

  it("wraps the previous link to the last bracket from the first bracket", () => {
    renderPage({ bindex: 0, bracketCount: 3 });
    expect(screen.getByRole("link", { name: "<-" })).toHaveAttribute(
      "href",
      `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/oneBrkt_other_2`
    );
  });

  it("wraps the next link to the first bracket from the last bracket", () => {
    renderPage({ bindex: 2, bracketCount: 3 });
    expect(screen.getByRole("link", { name: "->" })).toHaveAttribute(
      "href",
      `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/oneBrkt_other_0`
    );
  });

  it("links to itself when it is the only bracket in the list", () => {
    renderPage({ bindex: 0, bracketCount: 1 });
    const self = `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/${targetOneBrkt.id}`;
    expect(screen.getByRole("link", { name: "<-" })).toHaveAttribute("href", self);
    expect(screen.getByRole("link", { name: "->" })).toHaveAttribute("href", self);
  });

  it("renders the wrappers and four bracket columns", () => {
    const { container } = renderPage();
    expect(screen.getByTestId("BrktProgressOuterWrapper")).toBeInTheDocument();
    expect(screen.getByTestId("BrktProgressInnerWrapper")).toBeInTheDocument();
    expect(getColumns(container)).toHaveLength(4);
  });
});

describe("OneBrktPage - bracket layout (no ties)", () => {
  it("matches the layout diagram row by row", () => {
    const matches = diagramMatches();
    const { container } = renderPage({ matches });
    const [col1, col2, col3, col4] = getCols(container);

    // game 1: players on even rows, spacer between players has the border
    const r1 = rowsOf(col1);
    expect(r1).toHaveLength(15);
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((n, i) => {
      expect(r1.indexOf(findPlayerRow(col1, P(n)))).toBe(i * 2);
    });
    [1, 5, 9, 13].forEach((i) => {
      expect(hasEndBorder(r1[i])).toBe(true);
    });
    [3, 7, 11].forEach((i) => {
      expect(hasEndBorder(r1[i])).toBe(false);
    });
    expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
    expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 W");

    // game 2
    const r2 = rowsOf(col2);
    expect(r2.indexOf(findPlayerRow(col2, P(2)))).toBe(1);
    expect(r2.indexOf(findPlayerRow(col2, P(4)))).toBe(5);
    expect(r2.indexOf(findPlayerRow(col2, P(6)))).toBe(9);
    expect(r2.indexOf(findPlayerRow(col2, P(8)))).toBe(13);
    expect(hasEndBorder(findPlayerRow(col2, P(2)))).toBe(false);
    expect(hasEndBorder(findPlayerRow(col2, P(4)))).toBe(true);
    expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("211 W");
    expect(scoreTextOf(findPlayerRow(col2, P(4)))).toBe("206 L");

    // game 3: runner-up amount under the losing finalist
    const r3 = rowsOf(col3);
    expect(r3.indexOf(findPlayerRow(col3, P(2)))).toBe(3);
    expect(norm(getAt(r3, 4).textContent)).toBe("$10.00");
    expect(r3.indexOf(findPlayerRow(col3, P(8)))).toBe(11);
    expect(norm(getAt(r3, 12).textContent)).toBe("");
    expect(scoreTextOf(findPlayerRow(col3, P(2)))).toBe("212 L");
    expect(scoreTextOf(findPlayerRow(col3, P(8)))).toBe("232 W");

    // winner: centered, winner amount underneath
    const r4 = rowsOf(col4);
    expect(r4).toHaveLength(9);
    expect(r4.indexOf(findPlayerRow(col4, P(8)))).toBe(7);
    expect(norm(getAt(r4, 8).textContent)).toBe("$25.00");
  });

  it("follows the bracket rules for the diagram bracket", () => {
    const matches = diagramMatches();
    const { container } = renderPage({ matches });
    expectBracketRendered(container, matches, diagramEarnings());
  });

  it("does not show the final game score in the winner column", () => {
    const { container } = renderPage();
    const [, , col3, col4] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col4, P(8)))).toBe("");
    // the game 3 column still shows it
    expect(scoreTextOf(findPlayerRow(col3, P(8)))).toBe("232 W");
  });

  // The page sets finalMatch = true on the winner's info object. If
  // BracketClass hands back the same object on every call, the winner's
  // game 3 score (player8's "232 W") is gone from the game 3 column from the
  // second render on (the page renders twice on mount). The page now copies
  // instead of mutating.
  it("does not change the match info objects it gets from the bracket", () => {
    const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings(), {
      cacheInfo: true,
    });
    const { container, rerender } = renderPage({ bracket });
    rerender(<OneBrktPage />);
    const [, , col3, col4] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col3, P(8)))).toBe("232 W");
    expect(scoreTextOf(findPlayerRow(col4, P(8)))).toBe("");
  });
});

describe("OneBrktPage - handicap scores", () => {
  it("shows score + hdcp = total when the div has a handicap", () => {
    const { container } = renderPage({ hdcpPer: 0.9 });
    const [col1] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 + 1 = 202 L");
  });

  it("shows only the score when the div is scratch", () => {
    const { container } = renderPage({ hdcpPer: 0 });
    const [col1] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
  });

  it("follows the bracket rules with handicap scores", () => {
    const matches = diagramMatches();
    const { container } = renderPage({ hdcpPer: 0.9, matches });
    expectBracketRendered(container, matches, diagramEarnings(), 0.9);
  });
});

describe("OneBrktPage - bye", () => {
  // player1's spot is the bye: it scores 0, loses, and never advances
  const byeMatches = (): FakeMatches => ({
    ...diagramMatches(),
    0: { top: [sc(byePlayer, 0, "L")], bottom: [sc(P(2), 210, "W")] },
  });

  it("shows the bye with a 0 score and a loss in game 1", () => {
    const { container } = renderPage({ matches: byeMatches() });
    const [col1] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col1, byePlayer))).toBe("0 L");
    expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 W");
  });

  it("does not show a handicap for the bye", () => {
    const { container } = renderPage({ matches: byeMatches(), hdcpPer: 0.9 });
    const [col1] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col1, byePlayer))).toBe("0 L");
    expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 + 2 = 212 W");
  });

  it("does not show the bye after game 1", () => {
    const { container } = renderPage({ matches: byeMatches() });
    const [, col2, col3, col4] = getCols(container);
    [col2, col3, col4].forEach((col) => {
      expect(within(col).queryByTitle(nameOf(byePlayer))).not.toBeInTheDocument();
    });
  });

  it("follows the bracket rules with a bye", () => {
    const matches = byeMatches();
    const { container } = renderPage({ matches, hdcpPer: 0.9 });
    expectBracketRendered(container, matches, diagramEarnings(), 0.9);
  });
});

describe("OneBrktPage - ties", () => {
  it("matches the match 0 tie diagram row by row", () => {
    const matches = match0TieMatches();
    const { container } = renderPage({ matches });
    const [col1, col2] = getCols(container);

    expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("210 T");
    expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 T");

    // both tied players move to the top of match 4
    const r2 = rowsOf(col2);
    const p1Row = findPlayerRow(col2, P(1));
    const p2Row = findPlayerRow(col2, P(2));
    const p4Row = findPlayerRow(col2, P(4));
    expect(r2.indexOf(p1Row)).toBe(0);
    expect(r2.indexOf(p2Row)).toBe(2);
    expect(r2.indexOf(p4Row)).toBe(5);

    // only the first top entry lacks the end border
    expect(hasEndBorder(p1Row)).toBe(false);
    expect(hasEndBorder(p2Row)).toBe(true);
    expect(hasEndBorder(p4Row)).toBe(true);
    [1, 3, 4].forEach((i) => {
      expect(hasEndBorder(r2[i])).toBe(true);
    });

    // player2 wins the tie breaker and beats player4; player1 is out
    expect(scoreTextOf(p1Row)).toBe("200 L");
    expect(scoreTextOf(p2Row)).toBe("220 W");
    expect(scoreTextOf(p4Row)).toBe("206 L");

    expectBracketRendered(container, matches, diagramEarnings());
  });

  it("knocks out both tied players when the opponent beats the tie breaker winner", () => {
    // player1 beats player2 on the tie breaker (215 vs 214), but player4
    // rolls 216, so player4 advances and both tied players are out
    const matches: FakeMatches = {
      ...match0TieMatches(),
      4: {
        top: [sc(P(1), 215, "L"), sc(P(2), 214, "L")],
        bottom: [sc(P(4), 216, "W")],
      },
      6: { top: [sc(P(4), 212, "L")], bottom: [sc(P(8), 232, "W")] },
    };
    const earnings: Earnings = { [pid(4)]: RUNNER_UP_AMT, [pid(8)]: WINNER_AMT };
    const { container } = renderPage({ matches, earnings });
    const [, , col3] = getCols(container);
    expect(within(col3).queryByTitle(nameOf(P(1)))).not.toBeInTheDocument();
    expect(within(col3).queryByTitle(nameOf(P(2)))).not.toBeInTheDocument();
    expect(within(col3).getByTitle(nameOf(P(4)))).toBeInTheDocument();
    expectBracketRendered(container, matches, earnings);
  });

  it("sends both players to the final when they tie again in game 2", () => {
    const matches: FakeMatches = {
      ...match0TieMatches(),
      4: {
        top: [sc(P(1), 220, "T"), sc(P(2), 220, "T")],
        bottom: [sc(P(4), 206, "L")],
      },
      6: {
        top: [sc(P(1), 200, "L"), sc(P(2), 210, "L")],
        bottom: [sc(P(8), 232, "W")],
      },
    };
    const earnings: Earnings = { [pid(2)]: RUNNER_UP_AMT, [pid(8)]: WINNER_AMT };
    const { container } = renderPage({ matches, earnings });
    const [, , col3] = getCols(container);
    expect(namedPlayersIn(col3)).toHaveLength(3);
    expectBracketRendered(container, matches, earnings);
  });

  test.each(tieConfigs.map((cfg) => [tieLabel(cfg), cfg] as const))(
    "%s",
    (_label, cfg) => {
      const { matches, earnings } = buildTieScenario(cfg);
      const { container } = renderPage({ matches, earnings });
      expectBracketRendered(container, matches, earnings);
    }
  );

  it("shows all tied game 2 players in game 3 with handicap scores", () => {
    const { matches, earnings } = buildTieScenario({
      g1: [true, true, true, true],
      g2: [true, true],
      g3: true,
    });
    const { container } = renderPage({ matches, earnings, hdcpPer: 0.9 });
    expectBracketRendered(container, matches, earnings, 0.9);
  });
});

describe("OneBrktPage - final match prize splits", () => {
  // games 1 and 2 from the layout diagram: player2 vs player8 in the final
  const twoFinalists = (final: FakeMatch): FakeMatches => ({
    ...diagramMatches(),
    6: final,
  });

  // player1 and player4 tie in match 4, both play player8 in the final
  const threeFinalists = (final: FakeMatch): FakeMatches => ({
    ...diagramMatches(),
    0: { top: [sc(P(1), 210, "W")], bottom: [sc(P(2), 201, "L")] },
    4: { top: [sc(P(1), 215, "T")], bottom: [sc(P(4), 215, "T")] },
    6: final,
  });

  const winnerNames = (container: HTMLElement) =>
    namedPlayersIn(getCols(container)[3]).map((s) => s.getAttribute("title"));

  const earnText = (col: HTMLElement, p: FakePlayer) =>
    norm(earningsRowOf(col, findPlayerRow(col, p)).textContent);

  it("two finalists tie: each gets (first + second) / 2", () => {
    const final: FakeMatch = {
      top: [sc(P(2), 220, "T")],
      bottom: [sc(P(8), 220, "T")],
    };
    const matches = twoFinalists(final);
    const earnings = settleFinal(final);
    expect(earnings).toEqual({ [pid(2)]: 17.5, [pid(8)]: 17.5 });

    const { container } = renderPage({ matches, earnings });
    const [, , col3, col4] = getCols(container);
    expect(winnerNames(container)).toEqual([nameOf(P(2)), nameOf(P(8))]);
    expect(earnText(col4, P(2))).toBe("$17.50");
    expect(earnText(col4, P(8))).toBe("$17.50");
    // tied winners show nothing under their game 3 entry
    expect(earnText(col3, P(2))).toBe("");
    expect(earnText(col3, P(8))).toBe("");
    expectBracketRendered(container, matches, earnings);
  });

  it("three finalists all tie: each gets (first + second) / 3", () => {
    const final: FakeMatch = {
      top: [sc(P(1), 220, "T"), sc(P(4), 220, "T")],
      bottom: [sc(P(8), 220, "T")],
    };
    const matches = threeFinalists(final);
    const earnings = settleFinal(final);
    const share = (WINNER_AMT + RUNNER_UP_AMT) / 3;
    expect(earnings).toEqual({ [pid(1)]: share, [pid(4)]: share, [pid(8)]: share });

    const { container } = renderPage({ matches, earnings });
    const [, , , col4] = getCols(container);
    expect(winnerNames(container)).toEqual([
      nameOf(P(1)),
      nameOf(P(4)),
      nameOf(P(8)),
    ]);
    [1, 4, 8].forEach((n) => {
      expect(earnText(col4, P(n))).toBe("$11.66");
    });
    expectBracketRendered(container, matches, earnings);
  });

  it("P1 > P4 > P8: P1 gets first, P8 gets second, P4 is out on the tie breaker", () => {
    const final: FakeMatch = {
      top: [sc(P(1), 230, "W"), sc(P(4), 225, "L")],
      bottom: [sc(P(8), 220, "L")],
    };
    const matches = threeFinalists(final);
    const earnings = settleFinal(final);
    expect(earnings).toEqual({ [pid(1)]: WINNER_AMT, [pid(8)]: RUNNER_UP_AMT });

    const { container } = renderPage({ matches, earnings });
    const [, , col3, col4] = getCols(container);
    expect(winnerNames(container)).toEqual([nameOf(P(1))]);
    expect(earnText(col4, P(1))).toBe("$25.00");
    expect(earnText(col3, P(8))).toBe("$10.00");
    // beat player8 but lost the tie breaker to player1: no prize
    expect(earnText(col3, P(4))).toBe("");
    expectBracketRendered(container, matches, earnings);
  });

  it("P1 = P4 > P8: P1 and P4 split first, P8 gets second", () => {
    const final: FakeMatch = {
      top: [sc(P(1), 230, "T"), sc(P(4), 230, "T")],
      bottom: [sc(P(8), 220, "L")],
    };
    const matches = threeFinalists(final);
    const earnings = settleFinal(final);
    expect(earnings).toEqual({
      [pid(1)]: WINNER_AMT / 2,
      [pid(4)]: WINNER_AMT / 2,
      [pid(8)]: RUNNER_UP_AMT,
    });

    const { container } = renderPage({ matches, earnings });
    const [, , col3, col4] = getCols(container);
    expect(winnerNames(container)).toEqual([nameOf(P(1)), nameOf(P(4))]);
    expect(earnText(col4, P(1))).toBe("$12.50");
    expect(earnText(col4, P(4))).toBe("$12.50");
    expect(earnText(col3, P(8))).toBe("$10.00");
    expectBracketRendered(container, matches, earnings);
  });

  // Assumes BracketClass marks P1 and P4 "L" here (they tied each other but
  // lost to P8). If it marks them "T", the page would put them in the winner
  // column. See the review notes.
  it("P1 = P4 < P8: P8 gets first, P1 and P4 split second", () => {
    const final: FakeMatch = {
      top: [sc(P(1), 220, "L"), sc(P(4), 220, "L")],
      bottom: [sc(P(8), 230, "W")],
    };
    const matches = threeFinalists(final);
    const earnings = settleFinal(final);
    expect(earnings).toEqual({
      [pid(1)]: RUNNER_UP_AMT / 2,
      [pid(4)]: RUNNER_UP_AMT / 2,
      [pid(8)]: WINNER_AMT,
    });

    const { container } = renderPage({ matches, earnings });
    const [, , col3, col4] = getCols(container);
    expect(winnerNames(container)).toEqual([nameOf(P(8))]);
    expect(earnText(col4, P(8))).toBe("$25.00");
    expect(earnText(col3, P(1))).toBe("$5.00");
    expect(earnText(col3, P(4))).toBe("$5.00");
    expectBracketRendered(container, matches, earnings);
  });

  it("four finalists: tie breaker losers on both sides get nothing", () => {
    // player1/player2 tie in match 0 and again in match 4; player7/player8
    // tie in match 3 and again in match 5, so all four reach the final
    const final: FakeMatch = {
      top: [sc(P(1), 210, "L"), sc(P(2), 225, "L")],
      bottom: [sc(P(7), 200, "L"), sc(P(8), 230, "W")],
    };
    const matches: FakeMatches = {
      ...diagramMatches(),
      0: { top: [sc(P(1), 210, "T")], bottom: [sc(P(2), 210, "T")] },
      3: { top: [sc(P(7), 230, "T")], bottom: [sc(P(8), 230, "T")] },
      4: {
        top: [sc(P(1), 220, "T"), sc(P(2), 220, "T")],
        bottom: [sc(P(4), 206, "L")],
      },
      5: {
        top: [sc(P(6), 216, "L")],
        bottom: [sc(P(7), 231, "T"), sc(P(8), 231, "T")],
      },
      6: final,
    };
    const earnings = settleFinal(final);
    expect(earnings).toEqual({ [pid(2)]: RUNNER_UP_AMT, [pid(8)]: WINNER_AMT });

    const { container } = renderPage({ matches, earnings });
    const [, , col3] = getCols(container);
    expect(namedPlayersIn(col3)).toHaveLength(4);
    expect(winnerNames(container)).toEqual([nameOf(P(8))]);
    expect(earnText(col3, P(2))).toBe("$10.00");
    expect(earnText(col3, P(1))).toBe("");
    expect(earnText(col3, P(7))).toBe("");
    expectBracketRendered(container, matches, earnings);
  });
});

describe("OneBrktPage - bracket in progress", () => {
  // A player moves into the next match only once every player in their
  // current match has a score for that game. Until then, nobody from that
  // match advances.

  const empty: FakeMatch = { top: [], bottom: [] };

  // games 1 and 2 from the layout diagram, fully scored
  const game1Done = (): Pick<FakeMatches, 0 | 1 | 2 | 3> => {
    const d = diagramMatches();
    return { 0: d[0], 1: d[1], 2: d[2], 3: d[3] };
  };
  const game2Done = (): Pick<FakeMatches, 4 | 5> => {
    const d = diagramMatches();
    return { 4: d[4], 5: d[5] };
  };

  // the winner column has only the blank winner slot, on the middle row
  const expectNoWinner = (col: HTMLElement) => {
    const rows = rowsOf(col);
    expect(namedPlayersIn(col)).toHaveLength(0);
    expect(rows).toHaveLength(9);
    expect(norm(getAt(rows, 8).textContent)).toBe("");
  };

  it("1) no scores for game 1: nobody advances", () => {
    const matches: FakeMatches = {
      0: { top: [P(1)], bottom: [P(2)] },
      1: { top: [P(3)], bottom: [P(4)] },
      2: { top: [P(5)], bottom: [P(6)] },
      3: { top: [P(7)], bottom: [P(8)] },
      4: empty,
      5: empty,
      6: empty,
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [col1, col2, col3, col4] = getCols(container);
    expect(namedPlayersIn(col1)).toHaveLength(8);
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => {
      expect(scoreTextOf(findPlayerRow(col1, P(n)))).toBe("");
    });
    expect(namedPlayersIn(col2)).toHaveLength(0);
    expect(namedPlayersIn(col3)).toHaveLength(0);
    expectNoWinner(col4);
  });

  it("2) partial scores for game 1: only completed matches advance", () => {
    const matches: FakeMatches = {
      // complete: player2 advances
      0: { top: [sc(P(1), 201, "L")], bottom: [sc(P(2), 210, "W")] },
      // no scores
      1: { top: [P(3)], bottom: [P(4)] },
      // one score each: incomplete, nobody advances
      2: { top: [sc(P(5), 225)], bottom: [P(6)] },
      3: { top: [P(7)], bottom: [sc(P(8), 230)] },
      4: { top: [P(2)], bottom: [] },
      5: empty,
      6: empty,
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [col1, col2, col3, col4] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
    expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 W");
    expect(scoreTextOf(findPlayerRow(col1, P(3)))).toBe("");
    expect(scoreTextOf(findPlayerRow(col1, P(5)))).toBe("225");
    expect(scoreTextOf(findPlayerRow(col1, P(6)))).toBe("");
    expect(scoreTextOf(findPlayerRow(col1, P(8)))).toBe("230");

    expect(namedPlayersIn(col2)).toHaveLength(1);
    expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("");
    expect(namedPlayersIn(col3)).toHaveLength(0);
    expectNoWinner(col4);
  });

  it("3) scores for game 1, no scores for game 2: all winners advance", () => {
    const matches: FakeMatches = {
      ...game1Done(),
      4: { top: [P(2)], bottom: [P(4)] },
      5: { top: [P(6)], bottom: [P(8)] },
      6: empty,
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [, col2, col3, col4] = getCols(container);
    expect(namedPlayersIn(col2)).toHaveLength(4);
    [2, 4, 6, 8].forEach((n) => {
      expect(scoreTextOf(findPlayerRow(col2, P(n)))).toBe("");
    });
    expect(namedPlayersIn(col3)).toHaveLength(0);
    expectNoWinner(col4);
  });

  it("3b) game 1 tie, no scores for game 2: both tied players advance", () => {
    const matches: FakeMatches = {
      ...match0TieMatches(),
      4: { top: [P(1), P(2)], bottom: [P(4)] },
      5: { top: [P(6)], bottom: [P(8)] },
      6: empty,
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [, col2] = getCols(container);
    expect(hasEndBorder(findPlayerRow(col2, P(1)))).toBe(false);
    expect(hasEndBorder(findPlayerRow(col2, P(2)))).toBe(true);
    expect(hasEndBorder(findPlayerRow(col2, P(4)))).toBe(true);
  });

  it("4) partial scores for game 2: only completed matches advance", () => {
    const matches: FakeMatches = {
      ...game1Done(),
      // complete: player2 advances to game 3
      4: { top: [sc(P(2), 211, "W")], bottom: [sc(P(4), 206, "L")] },
      // one score: incomplete, nobody advances
      5: { top: [sc(P(6), 216)], bottom: [P(8)] },
      6: { top: [P(2)], bottom: [] },
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [, col2, col3, col4] = getCols(container);
    expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("211 W");
    expect(scoreTextOf(findPlayerRow(col2, P(4)))).toBe("206 L");
    expect(scoreTextOf(findPlayerRow(col2, P(6)))).toBe("216");
    expect(scoreTextOf(findPlayerRow(col2, P(8)))).toBe("");

    expect(namedPlayersIn(col3)).toHaveLength(1);
    expect(scoreTextOf(findPlayerRow(col3, P(2)))).toBe("");
    expectNoWinner(col4);
  });

  it("5) scores for games 1 and 2, no scores for game 3: finalists advance", () => {
    const matches: FakeMatches = {
      ...game1Done(),
      ...game2Done(),
      6: { top: [P(2)], bottom: [P(8)] },
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [, , col3, col4] = getCols(container);
    expect(namedPlayersIn(col3)).toHaveLength(2);
    [2, 8].forEach((n) => {
      const row = findPlayerRow(col3, P(n));
      expect(scoreTextOf(row)).toBe("");
      expect(norm(earningsRowOf(col3, row).textContent)).toBe("");
    });
    expectNoWinner(col4);
  });

  it("6) partial scores for game 3: no winner or earnings yet", () => {
    const matches: FakeMatches = {
      ...game1Done(),
      ...game2Done(),
      6: { top: [sc(P(2), 212)], bottom: [P(8)] },
    };
    const { container } = renderPage({ matches, earnings: {} });
    expectBracketRendered(container, matches, {});

    const [, , col3, col4] = getCols(container);
    const p2Row = findPlayerRow(col3, P(2));
    const p8Row = findPlayerRow(col3, P(8));
    expect(scoreTextOf(p2Row)).toBe("212");
    expect(scoreTextOf(p8Row)).toBe("");
    // no result yet, so no runner-up amount under either finalist
    expect(norm(earningsRowOf(col3, p2Row).textContent)).toBe("");
    expect(norm(earningsRowOf(col3, p8Row).textContent)).toBe("");
    expectNoWinner(col4);
  });
});


// /**
//  * test/app/results/tmnts/brackets/oneBrkt/oneBrktPage.test.tsx
//  * tests src/app/results/tmnt/[tmntId]/brackets/oneBrkt/[oneBrktId]/page.tsx
//  *
//  * Tournament data comes from mockTmntFullData. The bracket itself (match
//  * results, earnings) is a controlled fake so every tie permutation can be
//  * rendered and checked against the layout rules:
//  *
//  *   - the top entry in a match has no end border; every other entry does
//  *   - tied players in game 1 or 2 BOTH advance to the next game
//  *   - game 3 losers show their earnings in the row under their entry
//  *   - the winner column shows the winner(s) and earnings, but no game score
//  *
//  * Match numbers:
//  *   0\
//  *     4
//  *   1/ \
//  *       6
//  *   2\ /
//  *     5
//  *   3/
//  *   0-3 game 1, 4-5 game 2, 6 game 3
//  *
//  * displayed bracket looks like this:
//  *
//  * playerId1     201 L
//  * --------------------+ playerId2    211 W
//  *                     +--------------------+
//  * playerId2     210 W |                    |
//  * --------------------+                    | playerId2    212 L
//  *                                          +--------------------+
//  * playerId3     195 W                      |             $10.00 |
//  * --------------------+ playerId4    206 L |                    |
//  *                     +--------------------+                    |
//  * playerId4     205 L |                                         |
//  * --------------------+                                         | playerId8
//  *                                                               +---------------------
//  * playerId5     225 L                                           |              $25.00
//  * --------------------+ playerId6    216 L                      |
//  *                     +--------------------+                    |
//  * playerId6     229 W |                    |                    |
//  * --------------------+                    | playerId8    232 W |
//  *                                          +--------------------+
//  * playerId7     190 L                      |
//  * --------------------+ playerId8    231 W |
//  *                     +--------------------+
//  * playerId8     230 W |
//  * --------------------+
//  */

// /*
//  * This file checks bracket layout: row positions, end borders, and the
//  * earnings row under each player. None of that is reachable through Testing
//  * Library queries, so DOM traversal is needed here.
//  */
// /* eslint-disable testing-library/no-node-access */

// import React from "react";
// import { render, screen, within, fireEvent } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import { useParams } from "next/navigation";
// import { useDispatch, useSelector } from "react-redux";
// import OneBrktPage from "@/app/results/tmnt/[tmntId]/brackets/oneBrkt/[oneBrktId]/page";
// import { mockTmntFullData } from "../../../../../mocks/tmnts/tmntFullData/mockTmntFullData";
// import { useTmntFullData } from "@/hooks/useTmntFullData";
// import {
//   fetchOneTmntGameResults,
//   getOneTmntGameResultsError,
//   getOneTmntGameResultsLoadStatus,
//   getOneTmntGameResultsRequestedTmntId,
//   getOneTmntGameResultsTmntId,
// } from "@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice";
// import { getBrktListRecords } from "@/redux/features/tmntFullData/brktListRecordsSelector";
// import { fullName, getBrktOrElimName } from "@/lib/getName";
// import type { matchSeedInfoType } from "@/components/brackets/bracketMatchClass";

// /* ------------------------------------------------------------------ */
// /* module mocks                                                        */
// /* ------------------------------------------------------------------ */

// jest.mock("@/lib/syncfusion-license", () => ({}));

// jest.mock("next/navigation", () => ({
//   useParams: jest.fn(),
// }));

// jest.mock("next/link", () => ({
//   __esModule: true,
//   default: ({
//     href,
//     children,
//     ...rest
//   }: {
//     href: string;
//     children: React.ReactNode;
//   }) => require("react").createElement("a", { href, ...rest }, children),
// }));

// jest.mock("react-redux", () => ({
//   useDispatch: jest.fn(),
//   useSelector: jest.fn(),
// }));

// jest.mock("@/hooks/useTmntFullData", () => ({
//   useTmntFullData: jest.fn(),
// }));

// jest.mock("@/redux/features/oneTmntGameResults/oneTmntGameResultsSlice", () => ({
//   fetchOneTmntGameResults: jest.fn(),
//   getOneTmntGameResultsError: jest.fn(),
//   getOneTmntGameResultsLoadStatus: jest.fn(),
//   getOneTmntGameResultsRequestedTmntId: jest.fn(),
//   getOneTmntGameResultsTmntId: jest.fn(),
// }));

// jest.mock("@/redux/features/tmntFullData/brktListRecordsSelector", () => ({
//   getBrktListRecords: jest.fn(),
// }));

// jest.mock("@/components/modal/waitModal", () => ({
//   __esModule: true,
//   default: ({ show, message }: { show: boolean; message: string }) =>
//     show
//       ? require("react").createElement("div", { "data-testid": "waitModal" }, message)
//       : null,
// }));

// jest.mock("@/app/results/tmntHeader/tmntHomeHeader", () => ({
//   __esModule: true,
//   default: ({ selectedTmntPageBtn }: { selectedTmntPageBtn: string }) =>
//     require("react").createElement(
//       "div",
//       { "data-testid": "tmntHomeHeader" },
//       selectedTmntPageBtn
//     ),
// }));

// const asMock = (fn: unknown) => fn as jest.Mock;

// /* ------------------------------------------------------------------ */
// /* fake bracket                                                        */
// /* ------------------------------------------------------------------ */

// type MatchNum = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// type Result = "W" | "L" | "T";

// interface FakePlayer {
//   id: string;
//   first: string;
//   last: string;
//   hdcp: number;
//   score?: number;
//   result?: Result;
// }

// interface FakeMatch {
//   top: FakePlayer[];
//   bottom: FakePlayer[];
// }

// type FakeMatches = Record<MatchNum, FakeMatch>;
// type Earnings = Record<string, number>;

// const ALL_MATCHES: MatchNum[] = [0, 1, 2, 3, 4, 5, 6];
// const GAME_MATCHES: Record<1 | 2 | 3, MatchNum[]> = {
//   1: [0, 1, 2, 3],
//   2: [4, 5],
//   3: [6],
// };
// const gameOfMatch = (m: MatchNum): 1 | 2 | 3 => (m <= 3 ? 1 : m <= 5 ? 2 : 3);

// // squadGameNumber() returns game + offset; the fake getMatchInfo throws if
// // the page passes anything else, so a wrong game number fails loudly.
// const SGN_OFFSET = 10;

// const WINNER_AMT = 25;
// const RUNNER_UP_AMT = 10;

// const toMatchInfo = (p: FakePlayer): matchSeedInfoType =>
//   ({
//     playerId: p.id,
//     first_name: p.first,
//     last_name: p.last,
//     average: undefined,
//     score: p.score,
//     hdcp: p.score == null ? undefined : p.hdcp,
//     total: p.score == null ? undefined : p.score + p.hdcp,
//     result: p.result,
//   }) as matchSeedInfoType;

// const makeFakeBracket = (
//   id: string,
//   matches: FakeMatches,
//   earnings: Earnings,
//   opts: { noMatch?: boolean } = {}
// ) => {
//   const playersIn = (m: MatchNum) => [...matches[m].top, ...matches[m].bottom];

//   const match = {
//     getMatchPlayers: jest.fn((m: MatchNum) => playersIn(m).map((p) => p.id)),
//     getPlayersForPosition: jest.fn((m: MatchNum, pos: 0 | 1) =>
//       (pos === 0 ? matches[m].top : matches[m].bottom).map((p) => p.id)
//     ),
//     getMatchInfo: jest.fn((playerIds: string[], squadGameNum: number) => {
//       const game = squadGameNum - SGN_OFFSET;
//       const candidates = ALL_MATCHES.filter((m) => gameOfMatch(m) === game);
//       if (candidates.length === 0) {
//         throw new Error(`unexpected squad game number ${squadGameNum}`);
//       }
//       return playerIds.map((pid) => {
//         for (const m of candidates) {
//           const p = playersIn(m).find((x) => x.id === pid);
//           if (p) return toMatchInfo(p);
//         }
//         throw new Error(`player ${pid} not in game ${game}`);
//       });
//     }),
//   };

//   return {
//     id,
//     match: opts.noMatch ? undefined : match,
//     parent: {
//       squadGameNumber: jest.fn((g: number) => g + SGN_OFFSET),
//     },
//     updateMatches: jest.fn(),
//     playerEarnings: jest.fn((pid: string) => earnings[pid] ?? 0),
//     winnerAmount: WINNER_AMT,
//     runnerUpAmount: RUNNER_UP_AMT,
//   };
// };

// type FakeBracket = ReturnType<typeof makeFakeBracket>;

// /* ------------------------------------------------------------------ */
// /* players and scenarios                                               */
// /* ------------------------------------------------------------------ */

// const basePlayers: FakePlayer[] = Array.from({ length: 8 }, (_, i) => ({
//   id: `player${i + 1}`,
//   first: `First${i + 1}`,
//   last: `Last${i + 1}`,
//   hdcp: i + 1,
// }));
// const P = (n: number) => basePlayers[n - 1];
// const sc = (p: FakePlayer, score?: number, result?: Result): FakePlayer => ({
//   ...p,
//   score,
//   result,
// });

// // The bracket in the layout diagram (no ties).
// // Note: the diagram shows playerId3 195 W / playerId4 205 L but advances
// // playerId4, so the results here are made consistent (playerId4 wins).
// const diagramMatches = (): FakeMatches => ({
//   0: { top: [sc(P(1), 201, "L")], bottom: [sc(P(2), 210, "W")] },
//   1: { top: [sc(P(3), 195, "L")], bottom: [sc(P(4), 205, "W")] },
//   2: { top: [sc(P(5), 225, "L")], bottom: [sc(P(6), 229, "W")] },
//   3: { top: [sc(P(7), 190, "L")], bottom: [sc(P(8), 230, "W")] },
//   4: { top: [sc(P(2), 211, "W")], bottom: [sc(P(4), 206, "L")] },
//   5: { top: [sc(P(6), 216, "L")], bottom: [sc(P(8), 231, "W")] },
//   6: { top: [sc(P(2), 212, "L")], bottom: [sc(P(8), 232, "W")] },
// });
// const diagramEarnings: Earnings = { player2: RUNNER_UP_AMT, player8: WINNER_AMT };

// // The tie example: match 0 tied in game 1, both players advance to match 4.
// const match0TieMatches = (): FakeMatches => ({
//   ...diagramMatches(),
//   0: { top: [sc(P(1), 210, "T")], bottom: [sc(P(2), 210, "T")] },
//   4: {
//     top: [sc(P(1), 201, "L"), sc(P(2), 211, "W")],
//     bottom: [sc(P(4), 206, "L")],
//   },
// });

// interface TieConfig {
//   g1: [boolean, boolean, boolean, boolean];
//   g2: [boolean, boolean];
//   g3: boolean;
// }

// /**
//  * Builds a complete bracket for a tie configuration.
//  * - Tied players share the high score, are marked "T" and all advance.
//  * - Game 2/3 ties are between the first top player and first bottom player.
//  * - Game 3 winners earn WINNER_AMT each, game 3 losers RUNNER_UP_AMT each.
//  */
// const buildTieScenario = (cfg: TieConfig) => {
//   const matches = {} as FakeMatches;
//   const advanced: FakePlayer[][] = [];

//   for (let m = 0; m < 4; m++) {
//     const top = basePlayers[2 * m];
//     const bottom = basePlayers[2 * m + 1];
//     if (cfg.g1[m]) {
//       matches[m as MatchNum] = {
//         top: [sc(top, 210, "T")],
//         bottom: [sc(bottom, 210, "T")],
//       };
//       advanced[m] = [top, bottom];
//     } else {
//       const topWins = m % 2 === 1;
//       matches[m as MatchNum] = {
//         top: [sc(top, topWins ? 210 : 200, topWins ? "W" : "L")],
//         bottom: [sc(bottom, topWins ? 200 : 210, topWins ? "L" : "W")],
//       };
//       advanced[m] = [topWins ? top : bottom];
//     }
//   }

//   const play = (
//     top: FakePlayer[],
//     bottom: FakePlayer[],
//     tie: boolean,
//     high: number,
//     low: number
//   ) => {
//     const winners = tie ? [top[0], bottom[0]] : [bottom[0]];
//     const res = (p: FakePlayer) =>
//       winners.includes(p) ? sc(p, high, tie ? "T" : "W") : sc(p, low, "L");
//     return { match: { top: top.map(res), bottom: bottom.map(res) }, winners };
//   };

//   const m4 = play(advanced[0], advanced[1], cfg.g2[0], 220, 205);
//   const m5 = play(advanced[2], advanced[3], cfg.g2[1], 220, 205);
//   const m6 = play(m4.winners, m5.winners, cfg.g3, 230, 215);
//   matches[4] = m4.match;
//   matches[5] = m5.match;
//   matches[6] = m6.match;

//   const earnings: Earnings = {};
//   [...m6.match.top, ...m6.match.bottom].forEach((p) => {
//     earnings[p.id] = p.result === "L" ? RUNNER_UP_AMT : WINNER_AMT;
//   });

//   return { matches, earnings };
// };

// const tieConfigs: TieConfig[] = [];
// for (let mask = 0; mask < 16; mask++) {
//   for (const g2a of [false, true]) {
//     for (const g2b of [false, true]) {
//       for (const g3 of [false, true]) {
//         tieConfigs.push({
//           g1: [0, 1, 2, 3].map((b) => (mask & (1 << b)) !== 0) as TieConfig["g1"],
//           g2: [g2a, g2b],
//           g3,
//         });
//       }
//     }
//   }
// }

// const tieLabel = (cfg: TieConfig) => {
//   const list = (flags: boolean[], nums: number[]) =>
//     nums.filter((_, i) => flags[i]).join(",") || "none";
//   return (
//     `game 1 ties: ${list(cfg.g1, [0, 1, 2, 3])}` +
//     ` | game 2 ties: ${list(cfg.g2, [4, 5])}` +
//     ` | game 3 tie: ${cfg.g3 ? "6" : "none"}`
//   );
// };

// /* ------------------------------------------------------------------ */
// /* tmnt data + render helper                                           */
// /* ------------------------------------------------------------------ */

// const TMNT_ID = "tmt_oneBrktPageTest";
// const targetOneBrkt = mockTmntFullData.oneBrkts[0];
// const BRKT_ID = targetOneBrkt.brkt_id;
// const targetBrkt = mockTmntFullData.brkts.find((b) => b.id === BRKT_ID)!;

// type TmntData = typeof mockTmntFullData;

// const makeTmntData = (bindex: number, hdcpPer: number): TmntData => ({
//   ...mockTmntFullData,
//   oneBrkts: mockTmntFullData.oneBrkts.map((o) =>
//     o.id === targetOneBrkt.id ? { ...o, bindex } : { ...o }
//   ),
//   divs: mockTmntFullData.divs.map((d) =>
//     d.id === targetBrkt.div_id ? { ...d, hdcp_per: hdcpPer } : { ...d }
//   ),
// });

// const makeBrktList = (bindex: number, bracket: FakeBracket, count = 3) => ({
//   brackets: Array.from({ length: Math.max(count, bindex + 1) }, (_, i) =>
//     i === bindex ? bracket : { id: `oneBrkt_other_${i}` }
//   ),
// });

// interface RenderOpts {
//   bindex?: number;
//   bracketCount?: number;
//   hdcpPer?: number;
//   matches?: FakeMatches;
//   earnings?: Earnings;
//   oneBrktId?: string;
//   tmntData?: TmntData;
//   bracket?: FakeBracket;
//   brktListRecords?: Record<string, unknown>;
//   results?: {
//     tmntId?: string;
//     loadStatus?: string;
//     requestedTmntId?: string;
//     error?: string | null;
//   };
//   tmntHook?: {
//     hasData?: boolean;
//     failed?: boolean;
//     error?: string | null;
//   };
// }

// const mockDispatch = jest.fn();
// const mockRetry = jest.fn();

// const renderPage = (opts: RenderOpts = {}) => {
//   const bindex = opts.bindex ?? 1;
//   const tmntData = opts.tmntData ?? makeTmntData(bindex, opts.hdcpPer ?? 0);
//   const bracket =
//     opts.bracket ??
//     makeFakeBracket(
//       targetOneBrkt.id,
//       opts.matches ?? diagramMatches(),
//       opts.earnings ?? diagramEarnings
//     );
//   const brktListRecords = opts.brktListRecords ?? {
//     [BRKT_ID]: makeBrktList(bindex, bracket, opts.bracketCount),
//   };

//   asMock(useParams).mockReturnValue({
//     tmntId: TMNT_ID,
//     oneBrktId: opts.oneBrktId ?? targetOneBrkt.id,
//   });

//   const hook = {
//     hasData: true,
//     failed: false,
//     error: null,
//     ...opts.tmntHook,
//   };
//   asMock(useTmntFullData).mockReturnValue({
//     data: tmntData,
//     hasData: hook.hasData,
//     failed: hook.failed,
//     error: hook.error,
//     retry: mockRetry,
//   });

//   const results = {
//     tmntId: TMNT_ID,
//     loadStatus: "succeeded",
//     requestedTmntId: TMNT_ID,
//     error: null,
//     ...opts.results,
//   };
//   asMock(getOneTmntGameResultsTmntId).mockReturnValue(results.tmntId);
//   asMock(getOneTmntGameResultsLoadStatus).mockReturnValue(results.loadStatus);
//   asMock(getOneTmntGameResultsRequestedTmntId).mockReturnValue(results.requestedTmntId);
//   asMock(getOneTmntGameResultsError).mockReturnValue(results.error);
//   asMock(getBrktListRecords).mockReturnValue(brktListRecords);

//   const utils = render(<OneBrktPage />);
//   return { ...utils, bracket, tmntData };
// };

// /* ------------------------------------------------------------------ */
// /* DOM helpers                                                         */
// /* ------------------------------------------------------------------ */

// const norm = (s: string | null | undefined) =>
//   (s ?? "").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim();

// const money = (n: number) => `$${n.toFixed(2)}`;

// const getColumns = (container: HTMLElement) =>
//   Array.from(container.querySelectorAll<HTMLElement>(".one-brkt-game-column"));

// const rowsOf = (col: HTMLElement) => Array.from(col.children) as HTMLElement[];

// const nameOf = (p: FakePlayer) => fullName(p.first, p.last);

// const findPlayerRow = (col: HTMLElement, p: FakePlayer) => {
//   const span = within(col).getByTitle(nameOf(p));
//   return span.closest(".one-brkt-game-column > div") as HTMLElement;
// };

// const scoreTextOf = (row: HTMLElement) =>
//   norm(row.querySelector("span.text-end")?.textContent);

// const namedPlayersIn = (col: HTMLElement) =>
//   Array.from(col.querySelectorAll<HTMLElement>("span[title]")).filter(
//     (s) => (s.getAttribute("title") ?? "").trim() !== ""
//   );

// const hasEndBorder = (el: Element | null) =>
//   !!el && el.classList.contains("border-end");

// const expectedScoreText = (p: FakePlayer, hdcpPer: number) => {
//   if (p.score == null) return "";
//   let txt = `${p.score}`;
//   if (hdcpPer > 0 && !p.id.startsWith("bye")) {
//     txt += ` + ${p.hdcp} = ${p.score + p.hdcp}`;
//   }
//   return norm(`${txt} ${p.result ?? ""}`);
// };

// /**
//  * Checks every game column against the bracket rules, and the winner column
//  * for names, placement and earnings.
//  */
// const expectBracketRendered = (
//   container: HTMLElement,
//   matches: FakeMatches,
//   earnings: Earnings,
//   hdcpPer = 0
// ) => {
//   const cols = getColumns(container);
//   expect(cols).toHaveLength(4);

//   // column 1 is the full 15-row grid; no other column may overflow it
//   expect(rowsOf(cols[0])).toHaveLength(15);
//   cols.forEach((col) => expect(rowsOf(col).length).toBeLessThanOrEqual(15));

//   ([1, 2, 3] as const).forEach((game) => {
//     const col = cols[game - 1];
//     const rows = rowsOf(col);
//     const indexes: number[] = [];
//     let expectedCount = 0;

//     GAME_MATCHES[game].forEach((m) => {
//       (["top", "bottom"] as const).forEach((side) => {
//         const sidePlayers = matches[m][side];
//         sidePlayers.forEach((p, i) => {
//           expectedCount++;
//           const row = findPlayerRow(col, p);
//           indexes.push(rows.indexOf(row));

//           expect(scoreTextOf(row)).toBe(expectedScoreText(p, hdcpPer));

//           const borderEnd =
//             game === 1 ? side === "bottom" : !(side === "top" && i === 0);
//           expect(hasEndBorder(row)).toBe(borderEnd);

//           if (game === 3) {
//             const earnRow = row.nextElementSibling as HTMLElement;
//             const amt = earnings[p.id] ?? 0;
//             const expectedEarn = p.result === "L" && amt !== 0 ? money(amt) : "";
//             expect(norm(earnRow.textContent)).toBe(expectedEarn);
//             const earnBorder = side === "top" || i < sidePlayers.length - 1;
//             expect(hasEndBorder(earnRow)).toBe(earnBorder);
//           }
//         });
//       });
//     });

//     // players appear top-to-bottom in match order, with nothing extra
//     expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
//     expect(namedPlayersIn(col)).toHaveLength(expectedCount);
//   });

//   // winner column
//   const winnerCol = cols[3];
//   const winnerRows = rowsOf(winnerCol);
//   const winners = [...matches[6].top, ...matches[6].bottom].filter(
//     (p) => p.result === "W" || p.result === "T"
//   );
//   expect(namedPlayersIn(winnerCol)).toHaveLength(winners.length);

//   winners.forEach((p, i) => {
//     const row = findPlayerRow(winnerCol, p);
//     // winners are centered on row 8 (index 7); each winner uses two rows
//     expect(winnerRows.indexOf(row)).toBe(8 - winners.length + i * 2);
//     expect(hasEndBorder(row)).toBe(false);
//     const earnRow = row.nextElementSibling as HTMLElement;
//     expect(norm(earnRow.textContent)).toBe(money(earnings[p.id]));
//   });
// };

// /* ------------------------------------------------------------------ */
// /* tests                                                               */
// /* ------------------------------------------------------------------ */

// beforeEach(() => {
//   jest.clearAllMocks();
//   asMock(useDispatch).mockReturnValue(mockDispatch);
//   asMock(useSelector).mockImplementation(
//     (selector: (state: unknown) => unknown) => selector({})
//   );
//   asMock(fetchOneTmntGameResults).mockImplementation((tmntId: string) => ({
//     type: "oneTmntGameResults/fetch",
//     payload: tmntId,
//   }));
// });

// describe("OneBrktPage - loading and errors", () => {
//   it("shows the wait modal while tournament data is loading", () => {
//     renderPage({ tmntHook: { hasData: false } });
//     expect(screen.getByTestId("waitModal")).toHaveTextContent("Loading...");
//     expect(screen.queryByTestId("tmntHomeHeader")).not.toBeInTheDocument();
//   });

//   it("shows a missing-data message when the tmnt is missing a child", () => {
//     renderPage({
//       tmntHook: {
//         hasData: false,
//         failed: true,
//         error: "tmnt is missing required child: divs",
//       },
//     });
//     expect(screen.getByText("Unable to load tournament")).toBeInTheDocument();
//     expect(
//       screen.getByText(`Tournament with id: ${TMNT_ID} is missing data.`)
//     ).toBeInTheDocument();
//   });

//   it("shows a general message for other tmnt load errors", () => {
//     renderPage({
//       tmntHook: { hasData: false, failed: true, error: "network down" },
//     });
//     expect(
//       screen.getByText(
//         `An error occurred while loading the tournament with id: ${TMNT_ID}.`
//       )
//     ).toBeInTheDocument();
//   });

//   it("shows a general message when the tmnt failed without an error", () => {
//     renderPage({ tmntHook: { hasData: false, failed: true, error: null } });
//     expect(
//       screen.getByText(
//         `An error occurred while loading the tournament with id: ${TMNT_ID}.`
//       )
//     ).toBeInTheDocument();
//   });

//   it("calls retry when Retry is clicked after a tmnt load failure", () => {
//     renderPage({ tmntHook: { hasData: false, failed: true, error: "x" } });
//     fireEvent.click(screen.getByRole("button", { name: "Retry" }));
//     expect(mockRetry).toHaveBeenCalledTimes(1);
//   });

//   it("fetches game results when they are not loaded for this tmnt", () => {
//     renderPage({
//       results: { tmntId: "", loadStatus: "idle", requestedTmntId: "" },
//     });
//     expect(fetchOneTmntGameResults).toHaveBeenCalledWith(TMNT_ID);
//     expect(mockDispatch).toHaveBeenCalledWith({
//       type: "oneTmntGameResults/fetch",
//       payload: TMNT_ID,
//     });
//     expect(screen.getByTestId("waitModal")).toHaveTextContent("Loading...");
//   });

//   it("fetches game results when another tmnt's results are loaded", () => {
//     renderPage({
//       results: {
//         tmntId: "tmt_other",
//         loadStatus: "succeeded",
//         requestedTmntId: "tmt_other",
//       },
//     });
//     expect(fetchOneTmntGameResults).toHaveBeenCalledWith(TMNT_ID);
//   });

//   it("refetches when the last failure was for a different tmnt", () => {
//     renderPage({
//       results: { tmntId: "", loadStatus: "failed", requestedTmntId: "tmt_other" },
//     });
//     expect(fetchOneTmntGameResults).toHaveBeenCalledWith(TMNT_ID);
//   });

//   it("does not fetch while game results are loading", () => {
//     renderPage({
//       results: { tmntId: "", loadStatus: "loading", requestedTmntId: TMNT_ID },
//     });
//     expect(mockDispatch).not.toHaveBeenCalled();
//     expect(screen.getByTestId("waitModal")).toBeInTheDocument();
//   });

//   it("does not fetch when game results are already loaded", () => {
//     renderPage();
//     expect(mockDispatch).not.toHaveBeenCalled();
//   });

//   it("shows the results error and does not auto-refetch after a failure", () => {
//     renderPage({
//       results: {
//         tmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: TMNT_ID,
//         error: "games fetch failed",
//       },
//     });
//     expect(screen.getByText("Unable to load tournament")).toBeInTheDocument();
//     expect(screen.getByText("games fetch failed")).toBeInTheDocument();
//     expect(mockDispatch).not.toHaveBeenCalled();
//   });

//   it("shows a default message when results failed without an error", () => {
//     renderPage({
//       results: { tmntId: "", loadStatus: "failed", requestedTmntId: TMNT_ID },
//     });
//     expect(
//       screen.getByText(
//         `An error occurred while loading games for tournament with id: ${TMNT_ID}.`
//       )
//     ).toBeInTheDocument();
//   });

//   it("dispatches a fetch when Retry is clicked after a results failure", () => {
//     renderPage({
//       results: {
//         tmntId: "",
//         loadStatus: "failed",
//         requestedTmntId: TMNT_ID,
//         error: "games fetch failed",
//       },
//     });
//     fireEvent.click(screen.getByRole("button", { name: "Retry" }));
//     expect(fetchOneTmntGameResults).toHaveBeenCalledWith(TMNT_ID);
//     expect(mockDispatch).toHaveBeenCalledTimes(1);
//   });
// });

// describe("OneBrktPage - missing data", () => {
//   it("shows an error when the one bracket id is not found", () => {
//     renderPage({ oneBrktId: "obk_missing" });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       "One bracket with id obk_missing not found."
//     );
//   });

//   it("shows an error when the bracket definition is not found", () => {
//     const data = makeTmntData(1, 0);
//     renderPage({
//       tmntData: { ...data, brkts: data.brkts.filter((b) => b.id !== BRKT_ID) },
//     });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       `Bracket definition with id ${BRKT_ID} not found.`
//     );
//   });

//   it("shows an error when the bracket list is not found", () => {
//     renderPage({ brktListRecords: {} });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       `Bracket list with bracket definition id ${BRKT_ID} not found.`
//     );
//   });

//   it("shows an error when the bracket index is not in the list", () => {
//     const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings);
//     renderPage({
//       bindex: 5,
//       brktListRecords: { [BRKT_ID]: makeBrktList(0, bracket, 3) },
//     });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       "Bracket with index 5 not found in bracket list."
//     );
//   });

//   it("shows an error when the bracket has no match class", () => {
//     const bracket = makeFakeBracket(targetOneBrkt.id, diagramMatches(), diagramEarnings, {
//       noMatch: true,
//     });
//     renderPage({ bracket });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       "Bracket with index 1 has no match class."
//     );
//   });

//   it("shows an error when the bracket's div is not found", () => {
//     const data = makeTmntData(1, 0);
//     renderPage({
//       tmntData: {
//         ...data,
//         divs: data.divs.filter((d) => d.id !== targetBrkt.div_id),
//       },
//     });
//     expect(screen.getByRole("alert")).toHaveTextContent(
//       `Div with id ${targetBrkt.div_id} not found.`
//     );
//   });
// });

// describe("OneBrktPage - header and navigation", () => {
//   it("renders the tmnt header with the Brackets button selected", () => {
//     renderPage();
//     expect(screen.getByTestId("tmntHomeHeader")).toHaveTextContent("Brackets");
//   });

//   it("updates the bracket matches before rendering", () => {
//     const { bracket } = renderPage();
//     expect(bracket.updateMatches).toHaveBeenCalled();
//   });

//   it("shows the bracket name, number and prize amounts", () => {
//     renderPage({ bindex: 1 });
//     const brktName = getBrktOrElimName(targetBrkt, mockTmntFullData.divs);
//     expect(
//       screen.getByText(`${brktName} - Bracket Number 2`)
//     ).toBeInTheDocument();
//     expect(screen.getByText("1st $25.00 2nd $10.00")).toBeInTheDocument();
//   });

//   it("links to the previous and next brackets", () => {
//     renderPage({ bindex: 1, bracketCount: 3 });
//     const base = `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/`;
//     expect(screen.getByRole("link", { name: "<-" })).toHaveAttribute(
//       "href",
//       `${base}oneBrkt_other_0`
//     );
//     expect(screen.getByRole("link", { name: "->" })).toHaveAttribute(
//       "href",
//       `${base}oneBrkt_other_2`
//     );
//   });

//   it("wraps the previous link to the last bracket from the first bracket", () => {
//     renderPage({ bindex: 0, bracketCount: 3 });
//     expect(screen.getByRole("link", { name: "<-" })).toHaveAttribute(
//       "href",
//       `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/oneBrkt_other_2`
//     );
//   });

//   it("wraps the next link to the first bracket from the last bracket", () => {
//     renderPage({ bindex: 2, bracketCount: 3 });
//     expect(screen.getByRole("link", { name: "->" })).toHaveAttribute(
//       "href",
//       `/results/tmnt/${TMNT_ID}/brackets/oneBrkt/oneBrkt_other_0`
//     );
//   });

//   it("renders the wrappers and four bracket columns", () => {
//     const { container } = renderPage();
//     expect(screen.getByTestId("BrktProgressOuterWrapper")).toBeInTheDocument();
//     expect(screen.getByTestId("BrktProgressInnerWrapper")).toBeInTheDocument();
//     expect(getColumns(container)).toHaveLength(4);
//   });
// });

// describe("OneBrktPage - bracket layout (no ties)", () => {
//   it("matches the layout diagram row by row", () => {
//     const matches = diagramMatches();
//     const { container } = renderPage({ matches, earnings: diagramEarnings });
//     const [col1, col2, col3, col4] = getColumns(container);

//     // game 1: players on even rows, spacer between players has the border
//     const r1 = rowsOf(col1);
//     expect(r1).toHaveLength(15);
//     [1, 2, 3, 4, 5, 6, 7, 8].forEach((n, i) => {
//       expect(r1.indexOf(findPlayerRow(col1, P(n)))).toBe(i * 2);
//     });
//     [1, 5, 9, 13].forEach((i) => expect(hasEndBorder(r1[i])).toBe(true));
//     [3, 7, 11].forEach((i) => expect(hasEndBorder(r1[i])).toBe(false));
//     expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
//     expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 W");

//     // game 2
//     const r2 = rowsOf(col2);
//     expect(r2.indexOf(findPlayerRow(col2, P(2)))).toBe(1);
//     expect(r2.indexOf(findPlayerRow(col2, P(4)))).toBe(5);
//     expect(r2.indexOf(findPlayerRow(col2, P(6)))).toBe(9);
//     expect(r2.indexOf(findPlayerRow(col2, P(8)))).toBe(13);
//     expect(hasEndBorder(findPlayerRow(col2, P(2)))).toBe(false);
//     expect(hasEndBorder(findPlayerRow(col2, P(4)))).toBe(true);
//     expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("211 W");
//     expect(scoreTextOf(findPlayerRow(col2, P(4)))).toBe("206 L");

//     // game 3: runner-up amount under the losing finalist
//     const r3 = rowsOf(col3);
//     expect(r3.indexOf(findPlayerRow(col3, P(2)))).toBe(3);
//     expect(norm(r3[4].textContent)).toBe("$10.00");
//     expect(r3.indexOf(findPlayerRow(col3, P(8)))).toBe(11);
//     expect(norm(r3[12].textContent)).toBe("");
//     expect(scoreTextOf(findPlayerRow(col3, P(2)))).toBe("212 L");
//     expect(scoreTextOf(findPlayerRow(col3, P(8)))).toBe("232 W");

//     // winner: centered, winner amount underneath
//     const r4 = rowsOf(col4);
//     expect(r4).toHaveLength(9);
//     expect(r4.indexOf(findPlayerRow(col4, P(8)))).toBe(7);
//     expect(norm(r4[8].textContent)).toBe("$25.00");
//   });

//   it("follows the bracket rules for the diagram bracket", () => {
//     const matches = diagramMatches();
//     const { container } = renderPage({ matches, earnings: diagramEarnings });
//     expectBracketRendered(container, matches, diagramEarnings);
//   });

//   // The spec says the winner column shows no game score. The current page
//   // renders the winner row with matchElement(playerMi), which includes the
//   // score, so this test fails until the page strips it (see notes).
//   it("does not show the final game score in the winner column", () => {
//     const { container } = renderPage();
//     const winnerCol = getColumns(container)[3];
//     const scoreText = scoreTextOf(findPlayerRow(winnerCol, P(8)));
//     expect(scoreText).not.toContain("232");
//   });
// });

// describe("OneBrktPage - handicap scores", () => {
//   it("shows score + hdcp = total when the div has a handicap", () => {
//     const { container } = renderPage({ hdcpPer: 0.9 });
//     const col1 = getColumns(container)[0];
//     expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 + 1 = 202 L");
//   });

//   it("shows only the score when the div is scratch", () => {
//     const { container } = renderPage({ hdcpPer: 0 });
//     const col1 = getColumns(container)[0];
//     expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
//   });

//   it("does not show a handicap for a bye", () => {
//     const bye: FakePlayer = { id: "bye-1", first: "Bye", last: "One", hdcp: 5 };
//     const matches = diagramMatches();
//     matches[0] = { top: [sc(bye, 0, "L")], bottom: [sc(P(2), 210, "W")] };
//     const { container } = renderPage({ hdcpPer: 0.9, matches });
//     const col1 = getColumns(container)[0];
//     expect(scoreTextOf(findPlayerRow(col1, bye))).toBe("0 L");
//     expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 + 2 = 212 W");
//   });

//   it("follows the bracket rules with handicap scores", () => {
//     const matches = diagramMatches();
//     const { container } = renderPage({ hdcpPer: 0.9, matches });
//     expectBracketRendered(container, matches, diagramEarnings, 0.9);
//   });
// });

// describe("OneBrktPage - ties", () => {
//   it("matches the match 0 tie diagram row by row", () => {
//     const matches = match0TieMatches();
//     const { container } = renderPage({ matches });
//     const [col1, col2] = getColumns(container);

//     expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("210 T");
//     expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 T");

//     // both tied players move to the top of match 4
//     const r2 = rowsOf(col2);
//     const p1Row = findPlayerRow(col2, P(1));
//     const p2Row = findPlayerRow(col2, P(2));
//     const p4Row = findPlayerRow(col2, P(4));
//     expect(r2.indexOf(p1Row)).toBe(0);
//     expect(r2.indexOf(p2Row)).toBe(2);
//     expect(r2.indexOf(p4Row)).toBe(5);

//     // only the first top entry lacks the end border
//     expect(hasEndBorder(p1Row)).toBe(false);
//     expect(hasEndBorder(p2Row)).toBe(true);
//     expect(hasEndBorder(p4Row)).toBe(true);
//     [1, 3, 4].forEach((i) => expect(hasEndBorder(r2[i])).toBe(true));

//     expect(scoreTextOf(p1Row)).toBe("201 L");
//     expect(scoreTextOf(p2Row)).toBe("211 W");

//     expectBracketRendered(container, matches, diagramEarnings);
//   });

//   test.each(tieConfigs.map((cfg) => [tieLabel(cfg), cfg] as const))(
//     "%s",
//     (_label, cfg) => {
//       const { matches, earnings } = buildTieScenario(cfg);
//       const { container } = renderPage({ matches, earnings });
//       expectBracketRendered(container, matches, earnings);
//     }
//   );

//   it("shows all tied game 2 players in game 3 with handicap scores", () => {
//     const { matches, earnings } = buildTieScenario({
//       g1: [true, true, true, true],
//       g2: [true, true],
//       g3: true,
//     });
//     const { container } = renderPage({ matches, earnings, hdcpPer: 0.9 });
//     expectBracketRendered(container, matches, earnings, 0.9);
//   });
// });

// describe("OneBrktPage - bracket in progress", () => {
//   // A player moves into the next match only once every player in their
//   // current match has a score for that game. Until then, nobody from that
//   // match advances.

//   const empty: FakeMatch = { top: [], bottom: [] };

//   // games 1 and 2 from the layout diagram, fully scored
//   const game1Done = (): Pick<FakeMatches, 0 | 1 | 2 | 3> => {
//     const d = diagramMatches();
//     return { 0: d[0], 1: d[1], 2: d[2], 3: d[3] };
//   };
//   const game2Done = (): Pick<FakeMatches, 4 | 5> => {
//     const d = diagramMatches();
//     return { 4: d[4], 5: d[5] };
//   };

//   // the winner column has only the blank winner slot, on the middle row
//   const expectNoWinner = (col: HTMLElement) => {
//     const rows = rowsOf(col);
//     expect(namedPlayersIn(col)).toHaveLength(0);
//     expect(rows).toHaveLength(9);
//     expect(norm(rows[8].textContent)).toBe("");
//   };

//   it("1) no scores for game 1: nobody advances", () => {
//     const matches: FakeMatches = {
//       0: { top: [P(1)], bottom: [P(2)] },
//       1: { top: [P(3)], bottom: [P(4)] },
//       2: { top: [P(5)], bottom: [P(6)] },
//       3: { top: [P(7)], bottom: [P(8)] },
//       4: empty,
//       5: empty,
//       6: empty,
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [col1, col2, col3, col4] = getColumns(container);
//     expect(namedPlayersIn(col1)).toHaveLength(8);
//     [1, 2, 3, 4, 5, 6, 7, 8].forEach((n) => {
//       expect(scoreTextOf(findPlayerRow(col1, P(n)))).toBe("");
//     });
//     expect(namedPlayersIn(col2)).toHaveLength(0);
//     expect(namedPlayersIn(col3)).toHaveLength(0);
//     expectNoWinner(col4);
//   });

//   it("2) partial scores for game 1: only completed matches advance", () => {
//     const matches: FakeMatches = {
//       // complete: player2 advances
//       0: { top: [sc(P(1), 201, "L")], bottom: [sc(P(2), 210, "W")] },
//       // no scores
//       1: { top: [P(3)], bottom: [P(4)] },
//       // one score each: incomplete, nobody advances
//       2: { top: [sc(P(5), 225)], bottom: [P(6)] },
//       3: { top: [P(7)], bottom: [sc(P(8), 230)] },
//       4: { top: [P(2)], bottom: [] },
//       5: empty,
//       6: empty,
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [col1, col2, col3, col4] = getColumns(container);
//     expect(scoreTextOf(findPlayerRow(col1, P(1)))).toBe("201 L");
//     expect(scoreTextOf(findPlayerRow(col1, P(2)))).toBe("210 W");
//     expect(scoreTextOf(findPlayerRow(col1, P(3)))).toBe("");
//     expect(scoreTextOf(findPlayerRow(col1, P(5)))).toBe("225");
//     expect(scoreTextOf(findPlayerRow(col1, P(6)))).toBe("");
//     expect(scoreTextOf(findPlayerRow(col1, P(8)))).toBe("230");

//     expect(namedPlayersIn(col2)).toHaveLength(1);
//     expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("");
//     expect(namedPlayersIn(col3)).toHaveLength(0);
//     expectNoWinner(col4);
//   });

//   it("3) scores for game 1, no scores for game 2: all winners advance", () => {
//     const matches: FakeMatches = {
//       ...game1Done(),
//       4: { top: [P(2)], bottom: [P(4)] },
//       5: { top: [P(6)], bottom: [P(8)] },
//       6: empty,
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [, col2, col3, col4] = getColumns(container);
//     expect(namedPlayersIn(col2)).toHaveLength(4);
//     [2, 4, 6, 8].forEach((n) => {
//       expect(scoreTextOf(findPlayerRow(col2, P(n)))).toBe("");
//     });
//     expect(namedPlayersIn(col3)).toHaveLength(0);
//     expectNoWinner(col4);
//   });

//   it("3b) game 1 tie, no scores for game 2: both tied players advance", () => {
//     const matches: FakeMatches = {
//       ...match0TieMatches(),
//       4: { top: [P(1), P(2)], bottom: [P(4)] },
//       5: { top: [P(6)], bottom: [P(8)] },
//       6: empty,
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const col2 = getColumns(container)[1];
//     expect(hasEndBorder(findPlayerRow(col2, P(1)))).toBe(false);
//     expect(hasEndBorder(findPlayerRow(col2, P(2)))).toBe(true);
//     expect(hasEndBorder(findPlayerRow(col2, P(4)))).toBe(true);
//   });

//   it("4) partial scores for game 2: only completed matches advance", () => {
//     const matches: FakeMatches = {
//       ...game1Done(),
//       // complete: player2 advances to game 3
//       4: { top: [sc(P(2), 211, "W")], bottom: [sc(P(4), 206, "L")] },
//       // one score: incomplete, nobody advances
//       5: { top: [sc(P(6), 216)], bottom: [P(8)] },
//       6: { top: [P(2)], bottom: [] },
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [, col2, col3, col4] = getColumns(container);
//     expect(scoreTextOf(findPlayerRow(col2, P(2)))).toBe("211 W");
//     expect(scoreTextOf(findPlayerRow(col2, P(4)))).toBe("206 L");
//     expect(scoreTextOf(findPlayerRow(col2, P(6)))).toBe("216");
//     expect(scoreTextOf(findPlayerRow(col2, P(8)))).toBe("");

//     expect(namedPlayersIn(col3)).toHaveLength(1);
//     expect(scoreTextOf(findPlayerRow(col3, P(2)))).toBe("");
//     expectNoWinner(col4);
//   });

//   it("5) scores for games 1 and 2, no scores for game 3: finalists advance", () => {
//     const matches: FakeMatches = {
//       ...game1Done(),
//       ...game2Done(),
//       6: { top: [P(2)], bottom: [P(8)] },
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [, , col3, col4] = getColumns(container);
//     expect(namedPlayersIn(col3)).toHaveLength(2);
//     [2, 8].forEach((n) => {
//       const row = findPlayerRow(col3, P(n));
//       expect(scoreTextOf(row)).toBe("");
//       expect(norm(row.nextElementSibling?.textContent)).toBe("");
//     });
//     expectNoWinner(col4);
//   });

//   it("6) partial scores for game 3: no winner or earnings yet", () => {
//     const matches: FakeMatches = {
//       ...game1Done(),
//       ...game2Done(),
//       6: { top: [sc(P(2), 212)], bottom: [P(8)] },
//     };
//     const { container } = renderPage({ matches, earnings: {} });
//     expectBracketRendered(container, matches, {});

//     const [, , col3, col4] = getColumns(container);
//     const p2Row = findPlayerRow(col3, P(2));
//     const p8Row = findPlayerRow(col3, P(8));
//     expect(scoreTextOf(p2Row)).toBe("212");
//     expect(scoreTextOf(p8Row)).toBe("");
//     // no result yet, so no runner-up amount under either finalist
//     expect(norm(p2Row.nextElementSibling?.textContent)).toBe("");
//     expect(norm(p8Row.nextElementSibling?.textContent)).toBe("");
//     expectNoWinner(col4);
//   });
// });

