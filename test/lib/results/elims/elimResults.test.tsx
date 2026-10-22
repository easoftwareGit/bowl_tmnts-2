import {
  buildElimResultsRows,
  erAliveKey,
  getElimAdvancingScores,
  type elimResults,
} from "@/lib/results/elims/elimResults";
import { calcPositions } from "@/lib/results/calcResults";
import {
  tgrGameKey,
  tgrHdcpKey,
  type tmntGameResult,
} from "@/lib/types/resultsTypes";
import type { elimPfType, elimType, tmntFullType } from "@/lib/types/types";
import { getPlayerName } from "@/lib/getName";
import {
  divId1,
  elimId1,
  elimId2,
  elimPfId1,
  elimPfId2,
  elimPfId3,
  mockGames,
  mockTmntFullData,
  mockElimPfs,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
  playerId9,
  playerId10,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

// wrap the real calcResults functions so calls can be checked;
// they still run the real code, so every other test is unaffected
jest.mock("@/lib/results/calcResults", () => {
  const actual = jest.requireActual("@/lib/results/calcResults");
  return {
    ...actual,
    calcPositions: jest.fn(actual.calcPositions),
    calcPrizes: jest.fn(actual.calcPrizes),
  };
});

type playerRow = tmntFullType["players"][number];
type elimEntryRow = tmntFullType["elimEntries"][number];

/**
 * Uses the mock tournament as is:
 * - elimId1: games 1 - 3, all 8 players entered
 * - elimId2: games 4 - 6, all 8 players entered
 * - scores from mockGames
 *
 * Both elims are in the Scratch division, so hdcp is 0 and
 * "Game N + Hdcp" equals "Game N" unless a test sets a handicap.
 *
 * Mock scores, games 1 - 6:
 *
 *        G1   G2   G3   G4   G5   G6
 *   p1  201  202  203  252  182  185
 *   p2  210  211  212  265  202  186
 *   p3  195  196  197  264  242  207
 *   p4  205  206  207  181  188  195
 *   p5  225  226  227  228  182  224
 *   p6  229  216  217  222  183  213
 *   p7  190  191  192  193  228  199
 *   p8  230  231  232  263  261  239
 *
 * "Game N Alive" values:
 *   true  - in the elim for game N and advanced
 *   false - in the elim for game N and was eliminated
 *   null  - not in the elim for game N, or game N is not decided yet
 *
 * Number advancing:
 *   game 1: ceil(players entered / 2)
 *   game N: ceil(calculated number advancing from game N-1 / 2)
 *   Ties at the advancing score let extra players advance, but do not
 *   change the calculated number.
 *
 * Last game: nobody is eliminated. Every player in the last game (a
 * finalist) is Alive, and only finalists share the prize fund.
 */

// valid format, but not in the tournament
const unknownElimId = `elm_${"0".repeat(32)}`;

// buildElimResultsRows() takes only the prize funds for the elim it builds;
// filtering by elim_id is the caller's job
const elim1MockPfs = mockElimPfs.filter((pf) => pf.elim_id === elimId1);
const elim2MockPfs = mockElimPfs.filter((pf) => pf.elim_id === elimId2);

/**
 * Builds tmntResults from mockGames, one row per player.
 * Only player_id, hdcp and the Game N / Game N + Hdcp columns are used by
 * buildElimResultsRows(); the other properties satisfy the type.
 */
const buildResults = (
  hdcpByPlayer: Record<string, number> = {},
): tmntGameResult[] => {
  const byPlayer = new Map<string, tmntGameResult>();

  mockGames.forEach((game) => {
    let result = byPlayer.get(game.player_id);
    if (!result) {
      const hdcp = hdcpByPlayer[game.player_id] ?? 0;
      result = {
        player_id: game.player_id,
        div_id: divId1,
        div_name: "Scratch",
        sort_order: 1,
        tmnt_name: mockTmntFullData.tmnt.tmnt_name,
        start_date: "2025-09-01",
        full_name: getPlayerName(mockTmntFullData.players, game.player_id),
        average: 200,
        hdcp,
        total: 0,
        total_hdcp: 0,
      } as tmntGameResult;
      byPlayer.set(game.player_id, result);
    }
    result[tgrGameKey(game.game_num)] = game.score;
    result[tgrHdcpKey(game.game_num)] = game.score + result.hdcp;
  });

  return [...byPlayer.values()];
};

/**
 * Returns a copy of results where the given players have null scores
 * (scratch and hdcp) for the given games, the way uncompleted games arrive.
 */
const withNullScores = (
  results: tmntGameResult[],
  playerIds: string[],
  games: number[],
): tmntGameResult[] =>
  results.map((result) => {
    if (!playerIds.includes(result.player_id)) return result;
    const copy = cloneDeep(result);
    games.forEach((game) => {
      copy[tgrGameKey(game)] = null as unknown as number;
      copy[tgrHdcpKey(game)] = null as unknown as number;
    });
    return copy;
  });

/**
 * Returns a copy of results with one player's handicapped score for one game
 * replaced. The scratch score is set to match (score - hdcp).
 */
const withHdcpScore = (
  results: tmntGameResult[],
  playerId: string,
  game: number,
  hdcpScore: number,
): tmntGameResult[] =>
  results.map((result) => {
    if (result.player_id !== playerId) return result;
    const copy = cloneDeep(result);
    copy[tgrHdcpKey(game)] = hdcpScore;
    copy[tgrGameKey(game)] = hdcpScore - copy.hdcp;
    return copy;
  });

/** mock tournament plus the given players, each entered in elimId1 */
const withAddedPlayers = (
  players: playerRow[],
  entries: elimEntryRow[],
): tmntFullType => ({
  ...mockTmntFullData,
  players: [...mockTmntFullData.players, ...players],
  elimEntries: [...mockTmntFullData.elimEntries, ...entries],
});

/**
 * Returns a copy of the mock tournament where elimId1 has only the given
 * players entered. elimId2 entries are unchanged.
 */
const withElim1Entries = (playerIds: string[]): tmntFullType => ({
  ...mockTmntFullData,
  elimEntries: mockTmntFullData.elimEntries.filter(
    (entry) => entry.elim_id !== elimId1 || playerIds.includes(entry.player_id),
  ),
});

const rowFor = (rows: elimResults[], playerId: string): elimResults => {
  const row = rows.find((r) => r.player_id === playerId);
  if (!row) throw new Error(`no row for ${playerId}`);
  return row;
};

/** number of players who advanced in a game (Alive === true) */
const aliveCount = (rows: elimResults[], game: number): number =>
  rows.filter((r) => r[erAliveKey(game)] === true).length;

/** expects "Game N Alive" to be null for every row and every given game */
const expectAllAliveNull = (rows: elimResults[], games: number[]) => {
  rows.forEach((row) => {
    games.forEach((game) => {
      expect(row[erAliveKey(game)]).toBeNull();
    });
  });
};

const allPlayerIds = [
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
];

/** builds one tmntGameResult row from scores for games 1 - 6 */
const makeResult = (playerId: string, scores: number[]): tmntGameResult => {
  const result = {
    player_id: playerId,
    div_id: divId1,
    div_name: "Scratch",
    sort_order: 1,
    tmnt_name: mockTmntFullData.tmnt.tmnt_name,
    start_date: "2025-09-01",
    full_name: "",
    average: 200,
    hdcp: 0,
    total: 0,
    total_hdcp: 0,
  } as tmntGameResult;
  scores.forEach((score, i) => {
    result[tgrGameKey(i + 1)] = score;
    result[tgrHdcpKey(i + 1)] = score;
  });
  return result;
};

const player9: playerRow = {
  ...mockTmntFullData.players[0],
  id: playerId9,
  first_name: "Bob",
  last_name: "Jones",
  average: 205,
  lane: 32,
  position: "B",
};

const player10: playerRow = {
  ...mockTmntFullData.players[0],
  id: playerId10,
  first_name: "Beth",
  last_name: "Jones",
  average: 185,
  lane: 32,
  position: "C",
};

const elimEntry9: elimEntryRow = {
  ...mockTmntFullData.elimEntries[0],
  id: "een_01234ec07f824b0e93169ae78e8b4b3e",
  elim_id: elimId1,
  player_id: playerId9,
};

const elimEntry10: elimEntryRow = {
  ...mockTmntFullData.elimEntries[0],
  id: "een_01234ec07f824b0e93169ae78e8b4b3f",
  elim_id: elimId1,
  player_id: playerId10,
};

const player9Result = makeResult(playerId9, [220, 214, 240, 200, 210, 220]);
const player10Result = makeResult(
  playerId10,
  [180, 250, 250, 190, 200, 210],
);

describe("buildElimResultsRows", () => {
  const results = buildResults();

  /**
   * elimId1, games 1 - 3
   *
   * Game 1 (8 players, 4 advance):
   *   p8 230, p6 229, p5 225, p2 210 advance
   *   p4 205, p1 201, p3 195, p7 190 out
   * Game 2 (4 players, 2 advance):
   *   p8 231, p5 226 advance
   *   p6 216, p2 211 out
   * Game 3 (last game, 2 players, nobody out):
   *   p8 232, p5 227
   */
  describe("elimId1 (games 1 - 3)", () => {
    let rows: elimResults[];
    beforeEach(() => {
      rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        results,
        elim1MockPfs,
      );
    });

    it("returns one row per entered player", () => {
      expect(rows).toHaveLength(8);
      expect(new Set(rows.map((r) => r.player_id))).toEqual(
        new Set(allPlayerIds),
      );
    });

    it("fills player_id, full_name, hdcp and a null prize", () => {
      const row = rowFor(rows, playerId1);

      expect(row.player_id).toBe(playerId1);
      expect(row.full_name).toBe(
        getPlayerName(mockTmntFullData.players, playerId1),
      );
      expect(row.hdcp).toBe(0);
      expect(row.prize).toBeNull();
    });

    it("halves the field each game before the last: 8 -> 4 -> 2", () => {
      expect(aliveCount(rows, 1)).toBe(4);
      expect(aliveCount(rows, 2)).toBe(2);
    });

    it("advances the top half of game 1", () => {
      [playerId8, playerId6, playerId5, playerId2].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(true);
      });
      [playerId4, playerId1, playerId3, playerId7].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(false);
      });
    });

    it("advances the top half of game 2 from the game 1 survivors", () => {
      expect(rowFor(rows, playerId8)[erAliveKey(2)]).toBe(true);
      expect(rowFor(rows, playerId5)[erAliveKey(2)]).toBe(true);
      expect(rowFor(rows, playerId6)[erAliveKey(2)]).toBe(false);
      expect(rowFor(rows, playerId2)[erAliveKey(2)]).toBe(false);
    });

    it("eliminates nobody in the last game", () => {
      expect(aliveCount(rows, 3)).toBe(2);
      expect(rowFor(rows, playerId8)[erAliveKey(3)]).toBe(true);
      expect(rowFor(rows, playerId5)[erAliveKey(3)]).toBe(true);
    });

    it("sets Alive to null for every game after a player is eliminated", () => {
      const p4Row = rowFor(rows, playerId4);
      expect(p4Row[erAliveKey(1)]).toBe(false);
      expect(p4Row[erAliveKey(2)]).toBeNull();
      expect(p4Row[erAliveKey(3)]).toBeNull();

      const p6Row = rowFor(rows, playerId6);
      expect(p6Row[erAliveKey(1)]).toBe(true);
      expect(p6Row[erAliveKey(2)]).toBe(false);
      expect(p6Row[erAliveKey(3)]).toBeNull();
    });

    it("keeps scores up to the elimination game and nulls later games", () => {
      const p4Row = rowFor(rows, playerId4);
      expect(p4Row[tgrGameKey(1)]).toBe(205);
      expect(p4Row[tgrHdcpKey(1)]).toBe(205);
      expect(p4Row[tgrGameKey(2)]).toBeNull();
      expect(p4Row[tgrHdcpKey(2)]).toBeNull();
      expect(p4Row[tgrGameKey(3)]).toBeNull();
      expect(p4Row[tgrHdcpKey(3)]).toBeNull();

      const p6Row = rowFor(rows, playerId6);
      expect(p6Row[tgrHdcpKey(1)]).toBe(229);
      expect(p6Row[tgrHdcpKey(2)]).toBe(216);
      expect(p6Row[tgrGameKey(3)]).toBeNull();
      expect(p6Row[tgrHdcpKey(3)]).toBeNull();
    });

    it("keeps every score for players who reach the last game", () => {
      const p8Row = rowFor(rows, playerId8);
      expect(p8Row[tgrHdcpKey(1)]).toBe(230);
      expect(p8Row[tgrHdcpKey(2)]).toBe(231);
      expect(p8Row[tgrHdcpKey(3)]).toBe(232);

      const p5Row = rowFor(rows, playerId5);
      expect(p5Row[tgrHdcpKey(3)]).toBe(227);
    });

    it("orders rows by how far each player got, then by score", () => {
      // game 3 finishers by game 3, then game 2 losers by game 2,
      // then game 1 losers by game 1
      expect(rows.map((r) => r.player_id)).toEqual([
        playerId8,
        playerId5,
        playerId6,
        playerId2,
        playerId4,
        playerId1,
        playerId3,
        playerId7,
      ]);
    });

    it("only creates columns for the elim's games", () => {
      const row = rowFor(rows, playerId8);
      expect(erAliveKey(4) in row).toBe(false);
      expect(tgrGameKey(4) in row).toBe(false);
      expect(tgrHdcpKey(4) in row).toBe(false);
    });

    it("does not change tmntResults", () => {
      const before = cloneDeep(results);
      buildElimResultsRows(elimId1, mockTmntFullData, results, elim1MockPfs);
      expect(results).toEqual(before);
    });
  });

  /**
   * elimId2, games 4 - 6
   *
   * Game 4 (8 players, 4 advance):
   *   p2 265, p3 264, p8 263, p1 252 advance
   *   p5 228, p6 222, p7 193, p4 181 out
   * Game 5 (4 players, 2 advance):
   *   p8 261, p3 242 advance
   *   p2 202, p1 182 out
   *   (p7 has 228 in game 5 but was already out)
   * Game 6 (last game, 2 players, nobody out):
   *   p8 239, p3 207
   */
  describe("elimId2 (games 4 - 6)", () => {
    let rows: elimResults[];
    beforeEach(() => {
      rows = buildElimResultsRows(
        elimId2,
        mockTmntFullData,
        results,
        elim2MockPfs,
      );
    });

    it("halves the field 8 -> 4 -> 2, with nobody out in the last game", () => {
      expect(aliveCount(rows, 4)).toBe(4);
      expect(aliveCount(rows, 5)).toBe(2);
      expect(aliveCount(rows, 6)).toBe(2);
    });

    it("uses games 4 - 6 to decide who advances", () => {
      // p5 had the 3rd best game 1, but the 5th best game 4
      expect(rowFor(rows, playerId5)[erAliveKey(4)]).toBe(false);
      // p3 had the 7th best game 1, but the 2nd best game 4
      expect(rowFor(rows, playerId3)[erAliveKey(4)]).toBe(true);
      expect(rowFor(rows, playerId3)[erAliveKey(5)]).toBe(true);
      expect(rowFor(rows, playerId3)[erAliveKey(6)]).toBe(true);
      expect(rowFor(rows, playerId8)[erAliveKey(6)]).toBe(true);
    });

    it("ignores a high later score of a player already eliminated", () => {
      // p7's 228 in game 5 would beat p2's 202, but p7 was out after game 4
      const p7Row = rowFor(rows, playerId7);
      expect(p7Row[erAliveKey(4)]).toBe(false);
      expect(p7Row[erAliveKey(5)]).toBeNull();
      expect(p7Row[tgrHdcpKey(5)]).toBeNull();
      expect(rowFor(rows, playerId2)[erAliveKey(4)]).toBe(true);
    });

    it("orders rows by how far each player got, then by score", () => {
      expect(rows.map((r) => r.player_id)).toEqual([
        playerId8,
        playerId3,
        playerId2,
        playerId1,
        playerId5,
        playerId6,
        playerId7,
        playerId4,
      ]);
    });

    it("only creates columns for games 4 - 6", () => {
      const row = rowFor(rows, playerId8);
      expect(tgrGameKey(1) in row).toBe(false);
      expect(tgrHdcpKey(3) in row).toBe(false);
      expect(erAliveKey(1) in row).toBe(false);
      expect(row[tgrHdcpKey(4)]).toBe(263);
      expect(row[tgrHdcpKey(6)]).toBe(239);
    });
  });

  describe("number advancing", () => {
    it("rounds up at every game for 5 players: 5 -> 3 -> 2", () => {
      // game 1: p5 225, p2 210, p4 205 advance; p1 201, p3 195 out
      // game 2: p5 226, p2 211 advance; p4 206 out
      // game 3: last game, nobody out: p5 227, p2 212
      const tmnt = withElim1Entries([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
        playerId5,
      ]);

      const rows = buildElimResultsRows(elimId1, tmnt, results, elim1MockPfs);

      expect(aliveCount(rows, 1)).toBe(3);
      expect(aliveCount(rows, 2)).toBe(2);
      expect(aliveCount(rows, 3)).toBe(2);
      expect(rowFor(rows, playerId4)[erAliveKey(1)]).toBe(true);
      expect(rowFor(rows, playerId4)[erAliveKey(2)]).toBe(false);
      expect(rowFor(rows, playerId5)[erAliveKey(3)]).toBe(true);
      expect(rowFor(rows, playerId2)[erAliveKey(3)]).toBe(true);
    });

    it("keeps a single player alive for every game", () => {
      const tmnt = withElim1Entries([playerId1]);

      const rows = buildElimResultsRows(elimId1, tmnt, results, elim1MockPfs);
      const row = rowFor(rows, playerId1);

      expect(rows).toHaveLength(1);
      expect(row[erAliveKey(1)]).toBe(true);
      expect(row[erAliveKey(2)]).toBe(true);
      expect(row[erAliveKey(3)]).toBe(true);
      expect(row[tgrHdcpKey(3)]).toBe(203);
    });
  });

  describe("ties", () => {
    // p4 has 210 in game 1, tying p2 for the 4th and last advancing spot
    const tiedResults = withHdcpScore(results, playerId4, 1, 210);

    it("advances everyone tied with the last advancing score", () => {
      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        tiedResults,
        elim1MockPfs,
      );

      expect(aliveCount(rows, 1)).toBe(5);
      expect(rowFor(rows, playerId2)[erAliveKey(1)]).toBe(true);
      expect(rowFor(rows, playerId4)[erAliveKey(1)]).toBe(true);
      // p4 advanced, so the game 2 score is kept
      expect(rowFor(rows, playerId4)[tgrHdcpKey(2)]).toBe(206);
    });

    it("bases the next game's number advancing on the calculated number, not the survivors", () => {
      // 8 entered, so 4 is the calculated number for game 1. The tie lets
      // 5 advance, but game 2 advances ceil(4 / 2) = 2, not ceil(5 / 2) = 3:
      // p8 231, p5 226 advance; p6 216, p2 211, p4 206 out
      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        tiedResults,
        elim1MockPfs,
      );

      expect(aliveCount(rows, 2)).toBe(2);
      expect(rowFor(rows, playerId8)[erAliveKey(2)]).toBe(true);
      expect(rowFor(rows, playerId5)[erAliveKey(2)]).toBe(true);
      [playerId6, playerId2, playerId4].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(2)]).toBe(false);
      });
    });

    it("keeps halving the calculated number after a tie: 5 -> 2 finalists", () => {
      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        tiedResults,
        elim1MockPfs,
      );

      expect(aliveCount(rows, 1)).toBe(5); // 4 + 1 tie
      expect(aliveCount(rows, 2)).toBe(2);
      expect(aliveCount(rows, 3)).toBe(2); // nobody out in the last game
    });

    it("advances everyone tied for the last spot in a later game", () => {
      // p6 has 226 in game 2, tying p5 for the 2nd and last advancing spot
      // game 2: p8 231, p6 226, p5 226 advance; p2 211 out
      // game 3: last game, all 3 finalists stay alive
      const game2Tie = withHdcpScore(results, playerId6, 2, 226);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        game2Tie,
        elim1MockPfs,
      );

      expect(aliveCount(rows, 2)).toBe(3);
      expect(rowFor(rows, playerId6)[erAliveKey(2)]).toBe(true);
      expect(rowFor(rows, playerId5)[erAliveKey(2)]).toBe(true);
      expect(rowFor(rows, playerId2)[erAliveKey(2)]).toBe(false);
      // p6 is still in, so the game 3 score is kept
      expect(rowFor(rows, playerId6)[tgrHdcpKey(3)]).toBe(217);

      expect(aliveCount(rows, 3)).toBe(3);
      [playerId8, playerId6, playerId5].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(3)]).toBe(true);
      });
    });

    it("eliminates nobody when everyone ties", () => {
      let allTied = results;
      allPlayerIds.forEach((id) => {
        [1, 2, 3].forEach((game) => {
          allTied = withHdcpScore(allTied, id, game, 200);
        });
      });

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        allTied,
        elim1MockPfs,
      );

      expect(aliveCount(rows, 1)).toBe(8);
      expect(aliveCount(rows, 2)).toBe(8);
      expect(aliveCount(rows, 3)).toBe(8);
    });
  });

  describe("handicap", () => {
    it("ranks players on handicapped scores, not scratch scores", () => {
      // p7 has 190 scratch in game 1, the lowest, but with 50 hdcp
      // has 240, the highest. p2 (210) drops to 5th and is out.
      // Comparing p7's scratch 190 to the advancing hdcp score (225)
      // would wrongly eliminate p7.
      const hdcpResults = buildResults({ [playerId7]: 50 });

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        hdcpResults,
        elim1MockPfs,
      );
      const p7Row = rowFor(rows, playerId7);

      expect(p7Row[erAliveKey(1)]).toBe(true);
      expect(p7Row[tgrGameKey(1)]).toBe(190);
      expect(p7Row[tgrHdcpKey(1)]).toBe(240);
      expect(p7Row.hdcp).toBe(50);
      expect(rowFor(rows, playerId2)[erAliveKey(1)]).toBe(false);
    });
  });

  describe("which players are included", () => {
    it("includes only players entered in this elim, not other elims", () => {
      // p7 and p8 are still entered in elimId2, but not in elimId1
      const tmnt = withElim1Entries(
        allPlayerIds.filter((id) => id !== playerId7 && id !== playerId8),
      );

      const rows = buildElimResultsRows(elimId1, tmnt, results, elim1MockPfs);
      const ids = rows.map((r) => r.player_id);

      expect(rows).toHaveLength(6);
      expect(ids).not.toContain(playerId7);
      expect(ids).not.toContain(playerId8);
    });
  });

  describe("partial scores", () => {
    it("sorts by the current game even when it is not complete", () => {
      // p1 has not completed game 1 yet
      const partialResults = withNullScores(results, [playerId1], [1, 2, 3]);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        partialResults,
        elim1MockPfs,
      );

      // standings so far, with p1 (no score yet) last
      expect(rows.map((r) => r.player_id)).toEqual([
        playerId8,
        playerId6,
        playerId5,
        playerId2,
        playerId4,
        playerId3,
        playerId7,
        playerId1,
      ]);
      // no game is decided yet
      expectAllAliveNull(rows, [1, 2, 3]);
    });

    /**
     * Game 1 complete, game 2 has missing scores (p2 and p5, both game 1
     * survivors), game 3 has missing scores.
     *
     * Only game 1 is decided:
     *   advance: p8 230, p6 229, p5 225, p2 210
     *   out:     p4 205, p1 201, p3 195, p7 190
     */
    describe("game 1 complete, game 2 not", () => {
      const partialResults = withNullScores(
        results,
        [playerId2, playerId5],
        [2, 3],
      );
      let rows: elimResults[];
      beforeEach(() => {
        rows = buildElimResultsRows(
          elimId1,
          mockTmntFullData,
          partialResults,
          elim1MockPfs,
        );
      });

      it("eliminates the bottom half of game 1", () => {
        expect(aliveCount(rows, 1)).toBe(4);
        [playerId8, playerId6, playerId5, playerId2].forEach((id) => {
          expect(rowFor(rows, id)[erAliveKey(1)]).toBe(true);
        });
        [playerId4, playerId1, playerId3, playerId7].forEach((id) => {
          expect(rowFor(rows, id)[erAliveKey(1)]).toBe(false);
        });
      });

      it("leaves games 2 and 3 undecided: Alive is null for everyone", () => {
        expectAllAliveNull(rows, [2, 3]);
      });

      it("keeps game 2 scores completed so far, and nulls for scores not entered", () => {
        expect(rowFor(rows, playerId8)[tgrHdcpKey(2)]).toBe(231);
        expect(rowFor(rows, playerId6)[tgrHdcpKey(2)]).toBe(216);
        expect(rowFor(rows, playerId5)[tgrHdcpKey(2)]).toBeNull();
        expect(rowFor(rows, playerId2)[tgrHdcpKey(2)]).toBeNull();
      });

      it("clears later scores for players eliminated in game 1", () => {
        // p7 has 191 in game 2, but was out after game 1
        const p7Row = rowFor(rows, playerId7);
        expect(p7Row[tgrHdcpKey(2)]).toBeNull();
        expect(p7Row[tgrHdcpKey(3)]).toBeNull();
        expect(p7Row[erAliveKey(2)]).toBeNull();
        expect(p7Row[erAliveKey(3)]).toBeNull();
      });

      it("orders rows by game 2 scores entered so far, then by game 1", () => {
        expect(rows.map((r) => r.player_id)).toEqual([
          playerId8,
          playerId6,
          playerId5,
          playerId2,
          playerId4,
          playerId1,
          playerId3,
          playerId7,
        ]);
      });
    });

    /**
     * Games 1 and 2 complete, game 3 has a missing score (p5, a finalist).
     *
     * Games 1 and 2 are decided:
     *   game 1 advance: p8, p6, p5, p2
     *   game 2 advance: p8 231, p5 226; out: p6 216, p2 211
     */
    describe("games 1 and 2 complete, game 3 not", () => {
      const partialResults = withNullScores(results, [playerId5], [3]);
      let rows: elimResults[];
      beforeEach(() => {
        rows = buildElimResultsRows(
          elimId1,
          mockTmntFullData,
          partialResults,
          elim1MockPfs,
        );
      });

      it("eliminates the bottom half of games 1 and 2", () => {
        expect(aliveCount(rows, 1)).toBe(4);
        expect(aliveCount(rows, 2)).toBe(2);
        expect(rowFor(rows, playerId6)[erAliveKey(2)]).toBe(false);
        expect(rowFor(rows, playerId2)[erAliveKey(2)]).toBe(false);
      });

      it("leaves game 3 undecided for both finalists", () => {
        expect(rowFor(rows, playerId8)[erAliveKey(2)]).toBe(true);
        expect(rowFor(rows, playerId5)[erAliveKey(2)]).toBe(true);
        expectAllAliveNull(rows, [3]);
      });

      it("keeps game 3 scores entered so far, and nulls for scores not entered", () => {
        expect(rowFor(rows, playerId8)[tgrHdcpKey(3)]).toBe(232);
        expect(rowFor(rows, playerId5)[tgrHdcpKey(3)]).toBeNull();
      });

      it("clears game 3 scores for players eliminated in game 2", () => {
        expect(rowFor(rows, playerId6)[tgrHdcpKey(3)]).toBeNull();
        expect(rowFor(rows, playerId2)[tgrHdcpKey(3)]).toBeNull();
      });

      it("orders rows by how far each player got, then by game 2 score", () => {
        expect(rows.map((r) => r.player_id)).toEqual([
          playerId8,
          playerId5,
          playerId6,
          playerId2,
          playerId4,
          playerId1,
          playerId3,
          playerId7,
        ]);
      });
    });

    /**
     * elimId2 starts at game 4, so the "last complete game" must be counted
     * from game 4, not game 1.
     */
    describe("elim that starts at game 4", () => {
      it("decides only game 4 when game 4 is complete and game 5 is not", () => {
        // game 4 advance: p2 265, p3 264, p8 263, p1 252
        const partialResults = withNullScores(results, [playerId3], [5, 6]);

        const rows = buildElimResultsRows(
          elimId2,
          mockTmntFullData,
          partialResults,
          elim2MockPfs,
        );

        expect(aliveCount(rows, 4)).toBe(4);
        expect(rowFor(rows, playerId5)[erAliveKey(4)]).toBe(false);
        expect(rowFor(rows, playerId3)[erAliveKey(4)]).toBe(true);
        expect(rowFor(rows, playerId3)[tgrHdcpKey(5)]).toBeNull();
        expectAllAliveNull(rows, [5, 6]);
      });

      it("decides nothing when game 4 is not complete", () => {
        const partialResults = withNullScores(results, [playerId1], [4, 5, 6]);

        const rows = buildElimResultsRows(
          elimId2,
          mockTmntFullData,
          partialResults,
          elim2MockPfs,
        );

        expect(rows).toHaveLength(8);
        expectAllAliveNull(rows, [4, 5, 6]);
      });
    });
  });

  /**
   * Two added players, built like the mock players and entries.
   *
   * Scores, games 1 - 6 (Scratch division, hdcp 0):
   *
   *         G1   G2   G3   G4   G5   G6
   *   p9   220  214  240  200  210  220
   *   p10  180  250  250  190  200  210
   *
   * p9 fits between p5 (225) and p2 (210) in game 1.
   * p10 is last in game 1; the high later scores must be ignored.
   */
  describe("odd number of players", () => {
    /**
     * 7 players (p7 not entered)
     *
     * Game 1 (7 players, 4 advance):
     *   p8 230, p6 229, p5 225, p2 210 advance; p4 205, p1 201, p3 195 out
     * Game 2 (4 players, 2 advance):
     *   p8 231, p5 226 advance; p6 216, p2 211 out
     * Game 3 (last game, 2 players, nobody out): p8 232, p5 227
     */
    it("7 players: game 1 has 7, game 2 has 4, game 3 has 2", () => {
      const tmnt = withElim1Entries(
        allPlayerIds.filter((id) => id !== playerId7),
      );

      const rows = buildElimResultsRows(elimId1, tmnt, results, elim1MockPfs);

      expect(rows).toHaveLength(7);
      expect(aliveCount(rows, 1)).toBe(4); // players in game 2
      expect(aliveCount(rows, 2)).toBe(2); // players in game 3
      expect(aliveCount(rows, 3)).toBe(2); // nobody out in the last game

      [playerId8, playerId6, playerId5, playerId2].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(true);
      });
      [playerId4, playerId1, playerId3].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(false);
      });
      expect(rowFor(rows, playerId8)[erAliveKey(3)]).toBe(true);
      expect(rowFor(rows, playerId5)[erAliveKey(3)]).toBe(true);
    });

    /**
     * 10 players (p1 - p10)
     *
     * Game 1 (10 players, 5 advance):
     *   p8 230, p6 229, p5 225, p9 220, p2 210 advance
     *   p4 205, p1 201, p3 195, p7 190, p10 180 out
     * Game 2 (5 players, 3 advance):
     *   p8 231, p5 226, p6 216 advance; p9 214, p2 211 out
     * Game 3 (last game, 3 players, nobody out): p8 232, p5 227, p6 217
     */
    it("10 players: game 1 has 10, game 2 has 5, game 3 has 3", () => {
      const tmnt = withAddedPlayers(
        [player9, player10],
        [elimEntry9, elimEntry10],
      );
      const allResults = [...results, player9Result, player10Result];

      const rows = buildElimResultsRows(elimId1, tmnt, allResults, elim1MockPfs);

      expect(rows).toHaveLength(10);
      expect(aliveCount(rows, 1)).toBe(5); // players in game 2
      expect(aliveCount(rows, 2)).toBe(3); // players in game 3
      expect(aliveCount(rows, 3)).toBe(3); // nobody out in the last game

      [playerId8, playerId6, playerId5, playerId9, playerId2].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(true);
      });
      [playerId8, playerId5, playerId6].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(2)]).toBe(true);
        expect(rowFor(rows, id)[erAliveKey(3)]).toBe(true);
      });
      expect(rowFor(rows, playerId9)[erAliveKey(2)]).toBe(false);
      expect(rowFor(rows, playerId2)[erAliveKey(2)]).toBe(false);

      // p10's 250s in games 2 and 3 are ignored: out after game 1
      const p10Row = rowFor(rows, playerId10);
      expect(p10Row[erAliveKey(1)]).toBe(false);
      expect(p10Row[tgrHdcpKey(2)]).toBeNull();

      expect(rows.map((r) => r.player_id)).toEqual([
        playerId8,
        playerId5,
        playerId6,
        playerId9,
        playerId2,
        playerId4,
        playerId1,
        playerId3,
        playerId7,
        playerId10,
      ]);
    });

    /**
     * 9 players (p1 - p9)
     *
     * Game 1 (9 players, 5 advance):
     *   p8 230, p6 229, p5 225, p9 220, p2 210 advance
     *   p4 205, p1 201, p3 195, p7 190 out
     * Game 2 (5 players, 3 advance):
     *   p8 231, p5 226, p6 216 advance; p9 214, p2 211 out
     * Game 3 (last game, 3 players, nobody out): p8 232, p5 227, p6 217
     */
    it("9 players: game 1 has 9, game 2 has 5, game 3 has 3", () => {
      const tmnt = withAddedPlayers([player9], [elimEntry9]);
      const allResults = [...results, player9Result];

      const rows = buildElimResultsRows(elimId1, tmnt, allResults, elim1MockPfs);

      expect(rows).toHaveLength(9);
      expect(aliveCount(rows, 1)).toBe(5); // players in game 2
      expect(aliveCount(rows, 2)).toBe(3); // players in game 3
      expect(aliveCount(rows, 3)).toBe(3); // nobody out in the last game

      [playerId8, playerId6, playerId5, playerId9, playerId2].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(1)]).toBe(true);
      });
      [playerId8, playerId5, playerId6].forEach((id) => {
        expect(rowFor(rows, id)[erAliveKey(2)]).toBe(true);
        expect(rowFor(rows, id)[erAliveKey(3)]).toBe(true);
      });
      expect(rowFor(rows, playerId9)[erAliveKey(2)]).toBe(false);
      expect(rowFor(rows, playerId9)[tgrHdcpKey(3)]).toBeNull();
      expect(rowFor(rows, playerId9).full_name).toBe(
        getPlayerName(tmnt.players, playerId9),
      );

      expect(rows.map((r) => r.player_id)).toEqual([
        playerId8,
        playerId5,
        playerId6,
        playerId9,
        playerId2,
        playerId4,
        playerId1,
        playerId3,
        playerId7,
      ]);
    });
  });

  /**
   * Prize tests use their own prize funds so the amounts are known:
   *   1st 60, 2nd 30 (and 3rd 10 where noted)
   *
   * buildElimResultsRows() is given only this elim's prize funds; it does
   * not filter by elim_id.
   *
   * Only finalists (players Alive in the last game) share the prize fund.
   * An eliminated player never gets a prize.
   *
   * elimId1 finals with the mock scores:
   *   8 players:  p8 232, p5 227
   *   10 players: p8 232, p5 227, p6 217
   */
  describe("prizes", () => {
    const makeElimPfs = (forElimId: string, amounts: number[]): elimPfType[] =>
      amounts.map((amount, i) => ({
        ...mockElimPfs[0],
        id: [elimPfId1, elimPfId2, elimPfId3][i],
        elim_id: forElimId,
        position: i + 1,
        amount,
      }));

    const elim1Pfs = makeElimPfs(elimId1, [60, 30]);

    const prizeFor = (rows: elimResults[], playerId: string) =>
      rowFor(rows, playerId).prize;

    const eliminatedIn1 = [
      playerId6,
      playerId2,
      playerId4,
      playerId1,
      playerId3,
      playerId7,
    ];

    describe("8 players, elim complete", () => {
      let rows: elimResults[];
      beforeEach(() => {
        rows = buildElimResultsRows(elimId1, mockTmntFullData, results, elim1Pfs);
      });

      it("pays 1st and 2nd to the finalists in score order", () => {
        expect(prizeFor(rows, playerId8)).toBe(60);
        expect(prizeFor(rows, playerId5)).toBe(30);
      });

      it("pays only players who are alive in the last game", () => {
        rows.forEach((row) => {
          if (row.prize !== null) {
            expect(row[erAliveKey(3)]).toBe(true);
          }
        });
      });

      it("leaves prize null for every eliminated player", () => {
        eliminatedIn1.forEach((id) => {
          expect(prizeFor(rows, id)).toBeNull();
        });
      });

      it("pays out exactly the prize funds passed in", () => {
        const paid = rows.map((r) => r.prize).filter((p) => p !== null);
        expect(paid).toEqual([60, 30]);
      });
    });

    it("pays by position even when the prize funds are not in order", () => {
      const reversed = [...elim1Pfs].reverse();

      const rows = buildElimResultsRows(elimId1, mockTmntFullData, results, reversed);

      expect(prizeFor(rows, playerId8)).toBe(60);
      expect(prizeFor(rows, playerId5)).toBe(30);
    });

    it("does not modify the prize funds passed in", () => {
      // the caller's array may be redux state, which is frozen
      const reversed = Object.freeze([...elim1Pfs].reverse()) as elimPfType[];
      const before = reversed.map((pf) => pf.id);

      expect(() =>
        buildElimResultsRows(elimId1, mockTmntFullData, results, reversed),
      ).not.toThrow();
      expect(reversed.map((pf) => pf.id)).toEqual(before);
    });

    it("does not filter the prize funds by elim_id", () => {
      // filtering is the caller's job: whatever is passed in is paid out
      const otherElimPfs = makeElimPfs(elimId2, [500, 250]);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        results,
        otherElimPfs,
      );

      expect(prizeFor(rows, playerId8)).toBe(500);
      expect(prizeFor(rows, playerId5)).toBe(250);
    });

    it("leaves every prize null until the last game is complete", () => {
      // p5, a finalist, has not completed game 3
      const partialResults = withNullScores(results, [playerId5], [3]);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        partialResults,
        elim1Pfs,
      );

      rows.forEach((row) => {
        expect(row.prize).toBeNull();
      });
    });

    it("leaves every prize null when the elim has no prize funds", () => {
      const rows = buildElimResultsRows(elimId1, mockTmntFullData, results, []);

      rows.forEach((row) => {
        expect(row.prize).toBeNull();
      });
    });

    it("never pays eliminated players, even with more paid places than finalists", () => {
      // 3 paid places, but only 2 finalists
      const threePlaces = makeElimPfs(elimId1, [60, 30, 10]);

      const rows = buildElimResultsRows(elimId1, mockTmntFullData, results, threePlaces);

      expect(prizeFor(rows, playerId8)).toBe(60);
      expect(prizeFor(rows, playerId5)).toBe(30);
      eliminatedIn1.forEach((id) => {
        expect(prizeFor(rows, id)).toBeNull();
      });
    });

    it("8 players, 2 finalists tie: each gets (1st + 2nd) / 2", () => {
      // p5 has 232 in game 3, tying p8
      const tiedResults = withHdcpScore(results, playerId5, 3, 232);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        tiedResults,
        elim1Pfs,
      );

      expect(prizeFor(rows, playerId8)).toBe(45);
      expect(prizeFor(rows, playerId5)).toBe(45);
      expect(prizeFor(rows, playerId6)).toBeNull();
    });

    describe("10 players, 3 finalists", () => {
      const tmnt = withAddedPlayers([player9, player10], [elimEntry9, elimEntry10]);
      const allResults = [...results, player9Result, player10Result];

      it("pays only the top two when only two places are paid", () => {
        const rows = buildElimResultsRows(elimId1, tmnt, allResults, elim1Pfs);

        // 3 finalists, all alive in the last game
        expect(aliveCount(rows, 3)).toBe(3);
        expect(prizeFor(rows, playerId8)).toBe(60);
        expect(prizeFor(rows, playerId5)).toBe(30);
        // p6 is in the final but finished 3rd: unpaid
        expect(prizeFor(rows, playerId6)).toBeNull();
      });

      it("bottom two tie: they split 2nd place", () => {
        // p6 has 227 in game 3, tying p5 for 2nd
        const tiedResults = withHdcpScore(allResults, playerId6, 3, 227);

        const rows = buildElimResultsRows(elimId1, tmnt, tiedResults, elim1Pfs);

        expect(prizeFor(rows, playerId8)).toBe(60);
        expect(prizeFor(rows, playerId5)).toBe(15);
        expect(prizeFor(rows, playerId6)).toBe(15);
      });

      it("all three tie: each gets (1st + 2nd) / 3", () => {
        // p5 and p6 have 232 in game 3, tying p8
        let tiedResults = withHdcpScore(allResults, playerId5, 3, 232);
        tiedResults = withHdcpScore(tiedResults, playerId6, 3, 232);

        const rows = buildElimResultsRows(elimId1, tmnt, tiedResults, elim1Pfs);

        expect(prizeFor(rows, playerId8)).toBe(30);
        expect(prizeFor(rows, playerId5)).toBe(30);
        expect(prizeFor(rows, playerId6)).toBe(30);
      });
    });
  });

  /**
   * Positions are set once the last game is complete, by calcPositions()
   * on the last game's handicapped score, in row order.
   *
   * Finalists are ranked 1, 2, ... by their last game. Every eliminated
   * player has a null last game score, so calcPositions() treats them all
   * as tied: they share the position after the last finalist.
   *
   * elimId1 with the mock scores:
   *   p8 232 -> 1, p5 227 -> 2, everyone else (eliminated) -> 3
   */
  describe("positions", () => {
    const calcPositionsMock = calcPositions as jest.MockedFunction<
      typeof calcPositions
    >;

    const positionsOf = (rows: elimResults[]) => rows.map((r) => r.position);
    const positionFor = (rows: elimResults[], playerId: string) =>
      rowFor(rows, playerId).position;

    const eliminatedIn1 = [
      playerId6,
      playerId2,
      playerId4,
      playerId1,
      playerId3,
      playerId7,
    ];

    beforeEach(() => {
      calcPositionsMock.mockClear();
    });

    describe("calling calcPositions", () => {
      it("calls calcPositions once with the returned rows and the last game's hdcp key", () => {
        const rows = buildElimResultsRows(
          elimId1,
          mockTmntFullData,
          results,
          elim1MockPfs,
        );

        expect(calcPositionsMock).toHaveBeenCalledTimes(1);
        const [sortedRows, propertyName] = calcPositionsMock.mock.calls[0];
        // the same array that is returned, already sorted
        expect(sortedRows).toBe(rows);
        expect(propertyName).toBe(tgrHdcpKey(3));
      });

      it("uses the elim's own last game for an elim that starts at game 4", () => {
        buildElimResultsRows(elimId2, mockTmntFullData, results, elim2MockPfs);

        expect(calcPositionsMock).toHaveBeenCalledTimes(1);
        expect(calcPositionsMock.mock.calls[0][1]).toBe(tgrHdcpKey(6));
      });

      it("sets each row's position from calcPositions' result, in row order", () => {
        calcPositionsMock.mockReturnValueOnce([8, 7, 6, 5, 4, 3, 2, 1]);

        const rows = buildElimResultsRows(
          elimId1,
          mockTmntFullData,
          results,
          elim1MockPfs,
        );

        expect(positionsOf(rows)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
      });

      it("calls calcPositions with the last complete game's key while the elim is in progress", () => {
        // p5, a finalist, has not completed game 3, so game 2 is the last complete game
        const partialResults = withNullScores(results, [playerId5], [3]);

        buildElimResultsRows(elimId1, mockTmntFullData, partialResults, elim1MockPfs);

        expect(calcPositionsMock).toHaveBeenCalledTimes(1);
        expect(calcPositionsMock.mock.calls[0][1]).toBe(tgrHdcpKey(2));
      });

      it("does not call calcPositions when no game is complete", () => {
        // p1 has not completed game 1
        const partialResults = withNullScores(results, [playerId1], [1, 2, 3]);

        buildElimResultsRows(elimId1, mockTmntFullData, partialResults, elim1MockPfs);

        expect(calcPositionsMock).not.toHaveBeenCalled();
      });

      it("does not call calcPositions for invalid input", () => {
        expect(
          buildElimResultsRows(unknownElimId, mockTmntFullData, results, elim1MockPfs),
        ).toEqual([]);
        expect(calcPositionsMock).not.toHaveBeenCalled();
      });
    });

    describe("8 players, elim complete", () => {
      let rows: elimResults[];
      beforeEach(() => {
        rows = buildElimResultsRows(
          elimId1,
          mockTmntFullData,
          results,
          elim1MockPfs,
        );
      });

      it("ranks the finalists 1 and 2 by their last game", () => {
        expect(positionFor(rows, playerId8)).toBe(1);
        expect(positionFor(rows, playerId5)).toBe(2);
      });

      it("gives every eliminated player the position after the finalists", () => {
        eliminatedIn1.forEach((id) => {
          expect(positionFor(rows, id)).toBe(3);
        });
      });

      it("sets a position for every row, in row order", () => {
        expect(positionsOf(rows)).toEqual([1, 2, 3, 3, 3, 3, 3, 3]);
      });
    });

    it("ranks the finalists of an elim that starts at game 4 by game 6", () => {
      // game 6: p8 239, p3 207
      const rows = buildElimResultsRows(
        elimId2,
        mockTmntFullData,
        results,
        elim2MockPfs,
      );

      expect(positionFor(rows, playerId8)).toBe(1);
      expect(positionFor(rows, playerId3)).toBe(2);
      expect(positionsOf(rows)).toEqual([1, 2, 3, 3, 3, 3, 3, 3]);
    });

    it("sets positions from game 2 while game 3 is in progress", () => {
      // p5, a finalist, has not completed game 3
      // game 2: p8 231, p5 226, p6 216, p2 211; game 1 losers have no game 2
      const partialResults = withNullScores(results, [playerId5], [3]);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        partialResults,
        elim1MockPfs,
      );

      expect(positionFor(rows, playerId8)).toBe(1);
      expect(positionFor(rows, playerId5)).toBe(2);
      expect(positionFor(rows, playerId6)).toBe(3);
      expect(positionFor(rows, playerId2)).toBe(4);
      [playerId4, playerId1, playerId3, playerId7].forEach((id) => {
        expect(positionFor(rows, id)).toBe(5);
      });
    });

    it("sets positions from game 1 while game 2 is in progress", () => {
      // p2 and p5 have not completed game 2
      // game 1: p8 230, p6 229, p5 225, p2 210, p4 205, p1 201, p3 195, p7 190
      const partialResults = withNullScores(
        results,
        [playerId2, playerId5],
        [2, 3],
      );

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        partialResults,
        elim1MockPfs,
      );

      expect(positionsOf(rows)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("numbers rows 1 to N in row order when no game is complete", () => {
      // p1 has not completed game 1
      const partialResults = withNullScores(results, [playerId1], [1, 2, 3]);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        partialResults,
        elim1MockPfs,
      );

      // row order: p8, p6, p5, p2, p4, p3, p7, p1 (no score yet, last)
      expect(positionsOf(rows)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
      expect(positionFor(rows, playerId1)).toBe(8);
    });

    it("sets positions even when the elim has no prize funds", () => {
      const rows = buildElimResultsRows(elimId1, mockTmntFullData, results, []);

      expect(positionsOf(rows)).toEqual([1, 2, 3, 3, 3, 3, 3, 3]);
    });

    it("gives tied finalists the same position and skips the next", () => {
      // p5 scores 232 in game 3, tying p8
      const tiedResults = withHdcpScore(results, playerId5, 3, 232);

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        tiedResults,
        elim1MockPfs,
      );

      expect(positionFor(rows, playerId8)).toBe(1);
      expect(positionFor(rows, playerId5)).toBe(1);
      eliminatedIn1.forEach((id) => {
        expect(positionFor(rows, id)).toBe(3);
      });
    });

    it("gives a single player position 1", () => {
      const rows = buildElimResultsRows(
        elimId1,
        withElim1Entries([playerId1]),
        results,
        elim1MockPfs,
      );

      expect(positionsOf(rows)).toEqual([1]);
    });

    it("gives everyone position 1 when everyone ties every game", () => {
      let allTied = results;
      allPlayerIds.forEach((id) => {
        [1, 2, 3].forEach((game) => {
          allTied = withHdcpScore(allTied, id, game, 200);
        });
      });

      const rows = buildElimResultsRows(
        elimId1,
        mockTmntFullData,
        allTied,
        elim1MockPfs,
      );

      expect(positionsOf(rows)).toEqual(Array(8).fill(1));
    });

    /**
     * 10 players, game 3 finalists: p8 232, p5 227, p6 217
     * eliminated: p9, p2, p4, p1, p3, p7, p10
     */
    describe("10 players, 3 finalists", () => {
      const tmnt = withAddedPlayers(
        [player9, player10],
        [elimEntry9, elimEntry10],
      );
      const allResults = [...results, player9Result, player10Result];
      const eliminated = [
        playerId9,
        playerId2,
        playerId4,
        playerId1,
        playerId3,
        playerId7,
        playerId10,
      ];

      it("ranks the finalists 1, 2, 3 and the eliminated players 4", () => {
        const rows = buildElimResultsRows(elimId1, tmnt, allResults, elim1MockPfs);

        expect(positionFor(rows, playerId8)).toBe(1);
        expect(positionFor(rows, playerId5)).toBe(2);
        expect(positionFor(rows, playerId6)).toBe(3);
        eliminated.forEach((id) => {
          expect(positionFor(rows, id)).toBe(4);
        });
      });

      it("bottom two tie: both are 2nd", () => {
        // p6 scores 227 in game 3, tying p5
        const tiedResults = withHdcpScore(allResults, playerId6, 3, 227);

        const rows = buildElimResultsRows(elimId1, tmnt, tiedResults, elim1MockPfs);

        expect(positionFor(rows, playerId8)).toBe(1);
        expect(positionFor(rows, playerId5)).toBe(2);
        expect(positionFor(rows, playerId6)).toBe(2);
        eliminated.forEach((id) => {
          expect(positionFor(rows, id)).toBe(4);
        });
      });

      it("all three tie: all are 1st", () => {
        let tiedResults = withHdcpScore(allResults, playerId5, 3, 232);
        tiedResults = withHdcpScore(tiedResults, playerId6, 3, 232);

        const rows = buildElimResultsRows(elimId1, tmnt, tiedResults, elim1MockPfs);

        [playerId8, playerId5, playerId6].forEach((id) => {
          expect(positionFor(rows, id)).toBe(1);
        });
        eliminated.forEach((id) => {
          expect(positionFor(rows, id)).toBe(4);
        });
      });
    });
  });

  describe("data guards", () => {
    it.each(["", "bad id", "elm_123", `brk_${"0".repeat(32)}`])(
      "returns an empty array for an invalid elimId: %p",
      (badId) => {
        expect(
          buildElimResultsRows(badId, mockTmntFullData, results, elim1MockPfs),
        ).toEqual([]);
      },
    );

    it("returns an empty array when the elim is not in the tournament", () => {
      expect(
        buildElimResultsRows(
          unknownElimId,
          mockTmntFullData,
          results,
          elim1MockPfs,
        ),
      ).toEqual([]);
    });

    it("returns an empty array when the tournament has no elims", () => {
      expect(
        buildElimResultsRows(
          elimId1,
          { ...mockTmntFullData, elims: [] },
          results,
          elim1MockPfs,
        ),
      ).toEqual([]);
    });

    it("returns an empty array when tmntFullData is null", () => {
      expect(
        buildElimResultsRows(
          elimId1,
          null as unknown as tmntFullType,
          results,
          elim1MockPfs,
        ),
      ).toEqual([]);
    });

    it("returns an empty array when the elim has no entries", () => {
      expect(
        buildElimResultsRows(
          elimId1,
          withElim1Entries([]),
          results,
          elim1MockPfs,
        ),
      ).toEqual([]);
    });

    it("returns an empty array when tmntResults is empty", () => {
      expect(
        buildElimResultsRows(elimId1, mockTmntFullData, [], elim1MockPfs),
      ).toEqual([]);
    });

    it.each([undefined, null, {}, "not an array", 123])(
      "returns an empty array for invalid tmntResults: %p",
      (badResults) => {
        expect(
          buildElimResultsRows(
            elimId1,
            mockTmntFullData,
            badResults as unknown as tmntGameResult[],
            elim1MockPfs,
          ),
        ).toEqual([]);
      },
    );
  });
});

// /**
//  * getElimAdvancingScores() reads the rows built by buildElimResultsRows():
//  * for each decided game before the last, it returns the lowest handicapped
//  * score of the players who advanced (Alive === true).
//  *
//  * elimId1 with the mock scores:
//  *   game 1: p8 230, p6 229, p5 225, p2 210 advance -> 210
//  *   game 2: p8 231, p5 226 advance                 -> 226
//  *   game 3: last game, no entry
//  *
//  * elimId2 with the mock scores:
//  *   game 4: p2 265, p3 264, p8 263, p1 252 advance -> 252
//  *   game 5: p8 261, p3 242 advance                 -> 242
//  *   game 6: last game, no entry
//  */
// describe("getElimAdvancingScores", () => {
//   const results = buildResults();

//   const getElim = (tmnt: tmntFullType, id: string): elimType => {
//     const elim = tmnt.elims.find((e) => e.id === id);
//     if (!elim) throw new Error(`no elim ${id}`);
//     return elim;
//   };
//   const elim1 = getElim(mockTmntFullData, elimId1);
//   const elim2 = getElim(mockTmntFullData, elimId2);

//   /** builds the rows for elimId1, then gets the advancing scores */
//   const scoresForElim1 = (
//     tmnt: tmntFullType = mockTmntFullData,
//     tmntResults: tmntGameResult[] = results,
//   ): Map<number, number> => {
//     const rows = buildElimResultsRows(elimId1, tmnt, tmntResults, elim1MockPfs);
//     return getElimAdvancingScores(rows, getElim(tmnt, elimId1));
//   };

//   /** hand-built row with the given hdcp score and Alive value per game */
//   const makeRow = (
//     playerId: string,
//     games: Record<number, [number | null, boolean | null]>,
//   ): elimResults => {
//     const row: elimResults = {
//       position: null,
//       player_id: playerId,
//       full_name: "",
//       hdcp: 0,
//       prize: null,
//     };
//     Object.entries(games).forEach(([gameStr, [score, alive]]) => {
//       const game = Number(gameStr);
//       row[tgrGameKey(game)] = score;
//       row[tgrHdcpKey(game)] = score;
//       row[erAliveKey(game)] = alive;
//     });
//     return row;
//   };

//   describe("complete elims", () => {
//     it("returns the lowest advancing score for each game before the last", () => {
//       const scores = scoresForElim1();

//       expect(scores.get(1)).toBe(210);
//       expect(scores.get(2)).toBe(226);
//     });

//     it("has no entry for the last game", () => {
//       const scores = scoresForElim1();

//       expect(scores.has(3)).toBe(false);
//       expect(scores.size).toBe(2);
//     });

//     it("has keys in game order", () => {
//       expect([...scoresForElim1().keys()]).toEqual([1, 2]);
//     });

//     it("uses the elim's own game numbers for an elim that starts at game 4", () => {
//       const rows = buildElimResultsRows(
//         elimId2,
//         mockTmntFullData,
//         results,
//         elim2MockPfs,
//       );
//       const scores = getElimAdvancingScores(rows, elim2);

//       expect([...scores.entries()]).toEqual([
//         [4, 252],
//         [5, 242],
//       ]);
//       expect(scores.has(1)).toBe(false);
//       expect(scores.has(6)).toBe(false);
//     });

//     it("does not change the rows", () => {
//       const rows = buildElimResultsRows(
//         elimId1,
//         mockTmntFullData,
//         results,
//         elim1MockPfs,
//       );
//       const before = cloneDeep(rows);

//       getElimAdvancingScores(rows, elim1);

//       expect(rows).toEqual(before);
//     });
//   });

//   describe("number of players", () => {
//     it("5 players: 205 then 211", () => {
//       // game 1: p5 225, p2 210, p4 205 advance
//       // game 2: p5 226, p2 211 advance
//       const tmnt = withElim1Entries([
//         playerId1,
//         playerId2,
//         playerId3,
//         playerId4,
//         playerId5,
//       ]);

//       expect([...scoresForElim1(tmnt).entries()]).toEqual([
//         [1, 205],
//         [2, 211],
//       ]);
//     });

//     it("7 players: 210 then 226", () => {
//       const tmnt = withElim1Entries(
//         allPlayerIds.filter((id) => id !== playerId7),
//       );

//       expect([...scoresForElim1(tmnt).entries()]).toEqual([
//         [1, 210],
//         [2, 226],
//       ]);
//     });

//     it("9 players: 210 then 216", () => {
//       // game 1: p8, p6, p5, p9 220, p2 210 advance
//       // game 2: p8 231, p5 226, p6 216 advance
//       const tmnt = withAddedPlayers([player9], [elimEntry9]);

//       expect([
//         ...scoresForElim1(tmnt, [...results, player9Result]).entries(),
//       ]).toEqual([
//         [1, 210],
//         [2, 216],
//       ]);
//     });

//     it("10 players: 210 then 216", () => {
//       const tmnt = withAddedPlayers(
//         [player9, player10],
//         [elimEntry9, elimEntry10],
//       );
//       const allResults = [...results, player9Result, player10Result];

//       expect([...scoresForElim1(tmnt, allResults).entries()]).toEqual([
//         [1, 210],
//         [2, 216],
//       ]);
//     });

//     it("1 player: that player's own score each game", () => {
//       // p1: 201, 202
//       const tmnt = withElim1Entries([playerId1]);

//       expect([...scoresForElim1(tmnt).entries()]).toEqual([
//         [1, 201],
//         [2, 202],
//       ]);
//     });
//   });

//   describe("ties", () => {
//     it("tie for the last spot in game 1: the tied score is the advancing score", () => {
//       // p4 scores 210, tying p2. game 2: p8 231, p5 226 advance
//       const tiedResults = withHdcpScore(results, playerId4, 1, 210);

//       expect([...scoresForElim1(mockTmntFullData, tiedResults).entries()]).toEqual([
//         [1, 210],
//         [2, 226],
//       ]);
//     });

//     it("tie for the last spot in game 2: the tied score is the advancing score", () => {
//       // p6 scores 226 in game 2, tying p5
//       const tiedResults = withHdcpScore(results, playerId6, 2, 226);

//       expect(scoresForElim1(mockTmntFullData, tiedResults).get(2)).toBe(226);
//     });

//     it("everyone ties: the tied score every game", () => {
//       let allTied = results;
//       allPlayerIds.forEach((id) => {
//         [1, 2, 3].forEach((game) => {
//           allTied = withHdcpScore(allTied, id, game, 200);
//         });
//       });

//       expect([...scoresForElim1(mockTmntFullData, allTied).entries()]).toEqual([
//         [1, 200],
//         [2, 200],
//       ]);
//     });
//   });

//   describe("handicap", () => {
//     it("returns handicapped scores, not scratch scores", () => {
//       // p7 has 50 hdcp: game 1 190 + 50 = 240, game 2 191 + 50 = 241
//       // game 1: p7 240, p8 230, p6 229, p5 225 advance -> 225
//       // game 2: p7 241, p8 231 advance                 -> 231
//       const hdcpResults = buildResults({ [playerId7]: 50 });

//       expect([
//         ...scoresForElim1(mockTmntFullData, hdcpResults).entries(),
//       ]).toEqual([
//         [1, 225],
//         [2, 231],
//       ]);
//     });
//   });

//   describe("partial scores", () => {
//     it("returns an empty map when game 1 is not complete", () => {
//       const partialResults = withNullScores(results, [playerId1], [1, 2, 3]);

//       expect(scoresForElim1(mockTmntFullData, partialResults).size).toBe(0);
//     });

//     it("returns only game 1 when game 2 is not complete", () => {
//       const partialResults = withNullScores(
//         results,
//         [playerId2, playerId5],
//         [2, 3],
//       );

//       expect([
//         ...scoresForElim1(mockTmntFullData, partialResults).entries(),
//       ]).toEqual([[1, 210]]);
//     });

//     it("returns games 1 and 2 when only the last game is not complete", () => {
//       const partialResults = withNullScores(results, [playerId5], [3]);

//       expect([
//         ...scoresForElim1(mockTmntFullData, partialResults).entries(),
//       ]).toEqual([
//         [1, 210],
//         [2, 226],
//       ]);
//     });

//     it("returns only game 4 for elimId2 when game 5 is not complete", () => {
//       const partialResults = withNullScores(results, [playerId3], [5, 6]);
//       const rows = buildElimResultsRows(
//         elimId2,
//         mockTmntFullData,
//         partialResults,
//         elim2MockPfs,
//       );

//       expect([...getElimAdvancingScores(rows, elim2).entries()]).toEqual([
//         [4, 252],
//       ]);
//     });
//   });

//   describe("hand-built rows", () => {
//     it("ignores rows that are eliminated (false) or not decided (null)", () => {
//       const rows = [
//         makeRow(playerId1, { 1: [220, true], 2: [210, true], 3: [200, true] }),
//         makeRow(playerId2, { 1: [215, true], 2: [190, false], 3: [null, null] }),
//         makeRow(playerId3, { 1: [150, false], 2: [null, null], 3: [null, null] }),
//       ];

//       expect([...getElimAdvancingScores(rows, elim1).entries()]).toEqual([
//         [1, 215],
//         [2, 210],
//       ]);
//     });

//     it("stops at the first game with no advancing players", () => {
//       // game 1 undecided, so game 2 is ignored even if marked alive
//       const rows = [
//         makeRow(playerId1, { 1: [220, null], 2: [210, true], 3: [200, null] }),
//       ];

//       expect(getElimAdvancingScores(rows, elim1).size).toBe(0);
//     });

//     it("treats a null score on an advancing row as 0", () => {
//       const rows = [
//         makeRow(playerId1, { 1: [220, true], 2: [null, null], 3: [null, null] }),
//         makeRow(playerId2, { 1: [null, true], 2: [null, null], 3: [null, null] }),
//       ];

//       expect(getElimAdvancingScores(rows, elim1).get(1)).toBe(0);
//     });

//     it("returns an empty map for a one-game elim", () => {
//       const rows = [makeRow(playerId1, { 1: [220, true] })];

//       expect(getElimAdvancingScores(rows, { ...elim1, games: 1 }).size).toBe(0);
//     });
//   });

//   describe("data guards", () => {
//     it("returns an empty map for empty rows", () => {
//       expect(getElimAdvancingScores([], elim1).size).toBe(0);
//     });

//     it.each([undefined, null, {}, "not an array"])(
//       "returns an empty map for invalid rows: %p",
//       (badRows) => {
//         expect(
//           getElimAdvancingScores(badRows as unknown as elimResults[], elim1).size,
//         ).toBe(0);
//       },
//     );

//     it.each([undefined, null])(
//       "returns an empty map for a missing elim: %p",
//       (badElim) => {
//         const rows = buildElimResultsRows(
//           elimId1,
//           mockTmntFullData,
//           results,
//           elim1MockPfs,
//         );

//         expect(
//           getElimAdvancingScores(rows, badElim as unknown as elimType).size,
//         ).toBe(0);
//       },
//     );

//     it("returns an empty map for the rows of an invalid elim id", () => {
//       const rows = buildElimResultsRows(
//         unknownElimId,
//         mockTmntFullData,
//         results,
//         elim1MockPfs,
//       );

//       expect(getElimAdvancingScores(rows, elim1).size).toBe(0);
//     });
//   });
// });