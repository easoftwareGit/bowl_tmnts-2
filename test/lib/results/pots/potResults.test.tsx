import {
  buildPotResultsRows,
  potGameResults,
  potLastGameResults,
  noGameResults,
  potResultsRowType,
} from "@/lib/results/pots/potResults";
import {
  tmntGameResult,
  tgrGameKey,
  tgrHdcpKey,
} from "@/lib/types/resultsTypes";
import { tmntFullType } from "@/lib/types/types";
import { maxGames } from "@/lib/validation/constants";
import { isValidBtDbId } from "@/lib/validation/validation";
import {
  playerId1,
  playerId2,
  divId1,
  divId2,
  mockTmntFullData
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

type gameTuple = [score: number | null, scoreWithHdcp: number | null];

/**
 * Builds a tmntGameResult with only the fields buildPotResultsRows reads.
 * Keys come from tgrGameKey / tgrHdcpKey so the test follows the real key names.
 */
const makeGameResult = (
  player_id: string,
  div_id: string,
  games: gameTuple[],
): tmntGameResult => {
  const result: Record<string, unknown> = { player_id, div_id };
  games.forEach(([score, withHdcp], i) => {
    result[tgrGameKey(i + 1)] = score;
    result[tgrHdcpKey(i + 1)] = withHdcp;
  });
  return result as unknown as tmntGameResult;
};

const makeRow = (
  player_id: string,
  gameNum: number,
  scoreWithHdcp: number | null,
  score: number | null = scoreWithHdcp,
): potResultsRowType => ({
  player_id,
  div_id: "div_test",
  gameNum,
  score,
  hdcp: score == null || scoreWithHdcp == null ? null : scoreWithHdcp - score,
  scoreWithHdcp,
  prizeMoney: null,
});

// ---------------------------------------------------------------------------
// values derived from the mock data
// ---------------------------------------------------------------------------

const tmntFullData = mockTmntFullData as tmntFullType;

// pot with the most entries
const potIdCounts = new Map<string, number>();
tmntFullData.potEntries.forEach((pe) =>
  potIdCounts.set(pe.pot_id, (potIdCounts.get(pe.pot_id) ?? 0) + 1),
);
const potId = [...potIdCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];

const potPlayerIds: string[] = tmntFullData.potEntries
  .filter((pe) => pe.pot_id === potId)
  .map((pe) => pe.player_id);
const potPlayer = (i: number) => potPlayerIds[i % potPlayerIds.length];

const notInPotPlayerId = "ply_00000000000000000000000000000000"; // valid player id

// a valid-format pot id that has no pot entries
const makeUnusedPotId = (): string => {
  const usedIds = new Set(tmntFullData.potEntries.map((pe) => pe.pot_id));
  const base = potId.slice(0, -1);
  for (const ch of "0123456789abcdef") {
    const candidate = base + ch;
    if (!usedIds.has(candidate)) return candidate;
  }
  throw new Error("could not create an unused pot id");
};
const unusedPotId = makeUnusedPotId();

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe("potResults", () => {
  describe("mock data preconditions", () => {
    it("has a valid pot id with at least one pot entry", () => {
      expect(potId).toBeDefined();
      expect(isValidBtDbId(potId, "pot")).toBe(true);
      expect(potPlayerIds.length).toBeGreaterThan(0);
    });

    it("has a valid unused pot id", () => {
      expect(isValidBtDbId(unusedPotId, "pot")).toBe(true);
      expect(
        tmntFullData.potEntries.some((pe) => pe.pot_id === unusedPotId),
      ).toBe(false);
    });

    it("does not include the not-in-pot player in the pot", () => {
      expect(potPlayerIds).not.toContain(notInPotPlayerId);
    });
  });

  describe("buildPotResultsRows", () => {
    it("returns an empty array for no results", () => {
      expect(buildPotResultsRows([], 3)).toEqual([]);
    });

    it("returns an empty array when numGames is 0", () => {
      const results = [makeGameResult(playerId1, divId1, [[200, 220]])];
      expect(buildPotResultsRows(results, 0)).toEqual([]);
    });

    it("builds one row per game for a single player", () => {
      const results = [
        makeGameResult(playerId1, divId1, [
          [200, 220],
          [180, 200],
          [210, 230],
        ]),
      ];
      const rows = buildPotResultsRows(results, 3);

      expect(rows).toHaveLength(3);
      expect(rows).toEqual([
        { player_id: playerId1, div_id: divId1, gameNum: 1, score: 200, hdcp: 20, scoreWithHdcp: 220, prizeMoney: null },
        { player_id: playerId1, div_id: divId1, gameNum: 2, score: 180, hdcp: 20, scoreWithHdcp: 200, prizeMoney: null },
        { player_id: playerId1, div_id: divId1, gameNum: 3, score: 210, hdcp: 20, scoreWithHdcp: 230, prizeMoney: null },
      ]);
    });

    it("builds rows player by player, game by game", () => {
      const results = [
        makeGameResult(playerId1, divId1, [[200, 210], [190, 200]]),
        makeGameResult(playerId2, divId2, [[150, 180], [160, 190]]),
      ];
      const rows = buildPotResultsRows(results, 2);

      expect(rows.map((r) => [r.player_id, r.gameNum])).toEqual([
        [playerId1, 1],
        [playerId1, 2],
        [playerId2, 1],
        [playerId2, 2],
      ]);
      expect(rows.map((r) => r.div_id)).toEqual([
        divId1,
        divId1,
        divId2,
        divId2,
      ]);
    });

    it("calculates hdcp as scoreWithHdcp - score", () => {
      const results = [
        makeGameResult(playerId1, divId1, [[200, 200], [150, 187]]),
      ];
      const rows = buildPotResultsRows(results, 2);
      expect(rows[0].hdcp).toBe(0);
      expect(rows[1].hdcp).toBe(37);
    });

    it("sets hdcp to null when score is null", () => {
      const results = [makeGameResult(playerId1, divId1, [[null, 220]])];
      const [row] = buildPotResultsRows(results, 1);
      expect(row.score).toBeNull();
      expect(row.hdcp).toBeNull();
      expect(row.scoreWithHdcp).toBe(220);
    });

    it("sets hdcp to null when scoreWithHdcp is null", () => {
      const results = [makeGameResult(playerId1, divId1, [[200, null]])];
      const [row] = buildPotResultsRows(results, 1);
      expect(row.score).toBe(200);
      expect(row.hdcp).toBeNull();
      expect(row.scoreWithHdcp).toBeNull();
    });

    it("sets hdcp to null when both scores are null", () => {
      const results = [makeGameResult(playerId1, divId1, [[null, null]])];
      const [row] = buildPotResultsRows(results, 1);
      expect(row.score).toBeNull();
      expect(row.hdcp).toBeNull();
      expect(row.scoreWithHdcp).toBeNull();
    });

    it("always sets prizeMoney to null", () => {
      const results = [
        makeGameResult(playerId1, divId1, [[200, 220], [180, 200]]),
      ];
      const rows = buildPotResultsRows(results, 2);
      rows.forEach((row) => expect(row.prizeMoney).toBeNull());
    });

    it("only builds rows for the first numGames games", () => {
      const results = [
        makeGameResult(playerId1, divId1, [
          [200, 220],
          [180, 200],
          [210, 230],
        ]),
      ];
      const rows = buildPotResultsRows(results, 2);
      expect(rows).toHaveLength(2);
      expect(rows.map((r) => r.gameNum)).toEqual([1, 2]);
    });

    it("does not mutate the input", () => {
      const results = [
        makeGameResult(playerId1, divId1, [[200, 220], [180, 200]]),
      ];
      const copy = cloneDeep(results);
      buildPotResultsRows(results, 2);
      expect(results).toEqual(copy);
    });
  });

  describe("potGameResults", () => {
    const validRows: potResultsRowType[] = [
      makeRow(potPlayer(0), 1, 200),
      makeRow(potPlayer(0), 2, 210),
    ];

    describe("invalid input returns noGameResults", () => {
      it.each([
        ["empty string", ""],
        ["random string", "invalid"],
        ["wrong id type", potId?.replace(/^pot_/, "div_")],
        ["null", null as unknown as string],
        ["undefined", undefined as unknown as string],
      ])("invalid pot_id: %s", (_label, badId) => {
        expect(potGameResults(badId, tmntFullData, validRows, 2)).toBe(
          noGameResults,
        );
      });

      it("null tmntFullData", () => {
        expect(
          potGameResults(potId, null as unknown as tmntFullType, validRows, 2),
        ).toBe(noGameResults);
      });

      it("undefined tmntFullData", () => {
        expect(
          potGameResults(
            potId,
            undefined as unknown as tmntFullType,
            validRows,
            2,
          ),
        ).toBe(noGameResults);
      });

      it("empty potResultsRows", () => {
        expect(potGameResults(potId, tmntFullData, [], 2)).toBe(noGameResults);
      });

      it.each([
        ["null", null],
        ["undefined", undefined],
        ["string", "rows"],
        ["object", {}],
      ])("non-array potResultsRows: %s", (_label, badRows) => {
        expect(
          potGameResults(
            potId,
            tmntFullData,
            badRows as unknown as potResultsRowType[],
            2,
          ),
        ).toBe(noGameResults);
      });

      it.each([
        ["0", 0],
        ["negative", -1],
        ["decimal", 1.5],
        ["NaN", NaN],
        ["Infinity", Infinity],
        ["over maxGames", maxGames + 1],
        ["null", null as unknown as number],
        ["string", "2" as unknown as number],
      ])("invalid numGames: %s", (_label, badNumGames) => {
        expect(
          potGameResults(potId, tmntFullData, validRows, badNumGames),
        ).toBe(noGameResults);
      });

      it("valid pot id with no pot entries", () => {
        expect(potGameResults(unusedPotId, tmntFullData, validRows, 2)).toBe(
          noGameResults,
        );
      });

      it("tmntFullData with an empty potEntries array", () => {
        const noEntries: tmntFullType = { ...tmntFullData, potEntries: [] };
        expect(potGameResults(potId, noEntries, validRows, 2)).toBe(
          noGameResults,
        );
      });
    });

    describe("valid input", () => {
      it("returns one entry per game, numbered 1..numGames", () => {
        const result = potGameResults(potId, tmntFullData, validRows, 3);
        expect(Array.isArray(result)).toBe(true);
        const games = result as { gameNum: number }[];
        expect(games).toHaveLength(3);
        expect(games.map((g) => g.gameNum)).toEqual([1, 2, 3]);
      });

      it("accepts numGames = 1", () => {
        const result = potGameResults(potId, tmntFullData, validRows, 1);
        expect(result).toEqual([{ gameNum: 1, rows: [validRows[0]] }]);
      });

      it("accepts numGames = maxGames", () => {
        const result = potGameResults(potId, tmntFullData, validRows, maxGames);
        expect(result).toHaveLength(maxGames);
      });

      it("returns empty rows for games that have no results", () => {
        const result = potGameResults(potId, tmntFullData, validRows, 3) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(result[2]).toEqual({ gameNum: 3, rows: [] });
      });

      it("puts each row in its own game", () => {
        const result = potGameResults(potId, tmntFullData, validRows, 2) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(result[0].rows).toEqual([validRows[0]]);
        expect(result[1].rows).toEqual([validRows[1]]);
        result.forEach((game) =>
          game.rows.forEach((row) => expect(row.gameNum).toBe(game.gameNum)),
        );
      });

      it("only includes players entered in the pot", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(notInPotPlayerId, 1, 300),
        ];
        const result = potGameResults(potId, tmntFullData, rows, 1) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(result[0].rows).toHaveLength(1);
        expect(result[0].rows[0].player_id).toBe(potPlayer(0));
      });

      it("returns empty rows when no rows belong to pot players", () => {
        const rows = [makeRow(notInPotPlayerId, 1, 300)];
        const result = potGameResults(potId, tmntFullData, rows, 1);
        expect(result).toEqual([{ gameNum: 1, rows: [] }]);
      });

      it("ignores rows with a gameNum above numGames", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(potPlayer(0), 4, 250),
        ];
        const result = potGameResults(potId, tmntFullData, rows, 2) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        const allRows = result.flatMap((g) => g.rows);
        expect(allRows).toHaveLength(1);
        expect(allRows[0].gameNum).toBe(1);
      });

      it("sorts each game's rows by scoreWithHdcp, highest first", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(potPlayer(1), 1, 250),
          makeRow(potPlayer(2), 1, 225),
          makeRow(potPlayer(0), 2, 180),
          makeRow(potPlayer(1), 2, 240),
        ];
        const result = potGameResults(potId, tmntFullData, rows, 2) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(result[0].rows.map((r) => r.scoreWithHdcp)).toEqual([
          250, 225, 200,
        ]);
        expect(result[1].rows.map((r) => r.scoreWithHdcp)).toEqual([240, 180]);
      });

      it("sorts null scoreWithHdcp as 0 (last)", () => {
        const rows = [
          makeRow(potPlayer(0), 1, null, null),
          makeRow(potPlayer(1), 1, 200),
          makeRow(potPlayer(2), 1, 150),
        ];
        const result = potGameResults(potId, tmntFullData, rows, 1) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(result[0].rows.map((r) => r.scoreWithHdcp)).toEqual([
          200,
          150,
          null,
        ]);
      });

      it("does not reorder or mutate the input rows", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 150),
          makeRow(potPlayer(1), 1, 250),
          makeRow(potPlayer(2), 1, 200),
        ];
        const copy = cloneDeep(rows);
        potGameResults(potId, tmntFullData, rows, 1);
        expect(rows).toEqual(copy);
      });

      it("does not mutate tmntFullData", () => {
        const before = cloneDeep(tmntFullData.potEntries);
        potGameResults(potId, tmntFullData, validRows, 2);
        expect(tmntFullData.potEntries).toEqual(before);
      });

      it("works with rows built by buildPotResultsRows", () => {
        const gameResults = [
          makeGameResult(potPlayer(0), divId1, [[180, 200], [200, 220]]),
          makeGameResult(notInPotPlayerId, divId1, [[250, 250], [260, 260]]),
        ];
        const rows = buildPotResultsRows(gameResults, 2);
        const result = potGameResults(potId, tmntFullData, rows, 2) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];

        expect(result).toHaveLength(2);
        result.forEach((game) => {
          expect(game.rows.every((r) => r.player_id !== notInPotPlayerId)).toBe(
            true,
          );
        });
        expect(result[0].rows[0]).toMatchObject({
          player_id: potPlayer(0),
          gameNum: 1,
          score: 180,
          hdcp: 20,
          scoreWithHdcp: 200,
        });
        expect(result[1].rows[0]).toMatchObject({
          gameNum: 2,
          score: 200,
          hdcp: 20,
          scoreWithHdcp: 220,
        });
      });
    });
  });

  describe("potLastGameResults", () => {
    const validRows: potResultsRowType[] = [
      makeRow(potPlayer(0), 1, 200),
      makeRow(potPlayer(0), 2, 210),
    ];

    describe("invalid input returns an empty array", () => {
      it.each([
        ["empty string", ""],
        ["random string", "invalid"],
        ["wrong id type", potId?.replace(/^pot_/, "div_")],
        ["null", null as unknown as string],
        ["undefined", undefined as unknown as string],
      ])("invalid pot_id: %s", (_label, badId) => {
        expect(potLastGameResults(badId, tmntFullData, validRows, 2)).toEqual(
          [],
        );
      });

      it("null tmntFullData", () => {
        expect(
          potLastGameResults(
            potId,
            null as unknown as tmntFullType,
            validRows,
            2,
          ),
        ).toEqual([]);
      });

      it("undefined tmntFullData", () => {
        expect(
          potLastGameResults(
            potId,
            undefined as unknown as tmntFullType,
            validRows,
            2,
          ),
        ).toEqual([]);
      });

      it("empty potResultsRows", () => {
        expect(potLastGameResults(potId, tmntFullData, [], 2)).toEqual([]);
      });

      it.each([
        ["null", null],
        ["undefined", undefined],
        ["string", "rows"],
        ["object", {}],
      ])("non-array potResultsRows: %s", (_label, badRows) => {
        expect(
          potLastGameResults(
            potId,
            tmntFullData,
            badRows as unknown as potResultsRowType[],
            2,
          ),
        ).toEqual([]);
      });

      it.each([
        ["0", 0],
        ["negative", -1],
        ["decimal", 1.5],
        ["NaN", NaN],
        ["Infinity", Infinity],
        ["over maxGames", maxGames + 1],
        ["null", null as unknown as number],
        ["string", "2" as unknown as number],
      ])("invalid numGames: %s", (_label, badNumGames) => {
        expect(
          potLastGameResults(potId, tmntFullData, validRows, badNumGames),
        ).toEqual([]);
      });

      it("valid pot id with no pot entries", () => {
        expect(
          potLastGameResults(unusedPotId, tmntFullData, validRows, 2),
        ).toEqual([]);
      });

      it("tmntFullData with an empty potEntries array", () => {
        const noEntries: tmntFullType = { ...tmntFullData, potEntries: [] };
        expect(potLastGameResults(potId, noEntries, validRows, 2)).toEqual([]);
      });
    });

    describe("valid input", () => {
      it("returns only rows for the last game (gameNum === numGames)", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(potPlayer(0), 2, 210),
          makeRow(potPlayer(0), 3, 220),
          makeRow(potPlayer(1), 3, 230),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, 3);
        expect(result).toHaveLength(2);
        result.forEach((row) => expect(row.gameNum).toBe(3));
      });

      it("accepts numGames = 1", () => {
        const result = potLastGameResults(potId, tmntFullData, validRows, 1);
        expect(result).toEqual([validRows[0]]);
      });

      it("accepts numGames = maxGames", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(potPlayer(0), maxGames, 250),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, maxGames);
        expect(result).toEqual([rows[1]]);
      });

      it("returns an empty array when no rows are for the last game", () => {
        const result = potLastGameResults(potId, tmntFullData, validRows, 3);
        expect(result).toEqual([]);
      });

      it("ignores rows for games other than numGames", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 300),
          makeRow(potPlayer(0), 2, 200),
          makeRow(potPlayer(0), 4, 290),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, 2);
        expect(result).toEqual([rows[1]]);
      });

      it("only includes players entered in the pot", () => {
        const rows = [
          makeRow(potPlayer(0), 2, 200),
          makeRow(notInPotPlayerId, 2, 300),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, 2);
        expect(result).toHaveLength(1);
        expect(result[0].player_id).toBe(potPlayer(0));
      });

      it("returns an empty array when no rows belong to pot players", () => {
        const rows = [makeRow(notInPotPlayerId, 2, 300)];
        expect(potLastGameResults(potId, tmntFullData, rows, 2)).toEqual([]);
      });

      it("sorts rows by scoreWithHdcp, highest first", () => {
        const rows = [
          makeRow(potPlayer(0), 2, 200),
          makeRow(potPlayer(1), 2, 250),
          makeRow(potPlayer(2), 2, 225),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, 2);
        expect(result.map((r) => r.scoreWithHdcp)).toEqual([250, 225, 200]);
      });

      it("sorts null scoreWithHdcp as 0 (last)", () => {
        const rows = [
          makeRow(potPlayer(0), 2, null, null),
          makeRow(potPlayer(1), 2, 200),
          makeRow(potPlayer(2), 2, 150),
        ];
        const result = potLastGameResults(potId, tmntFullData, rows, 2);
        expect(result.map((r) => r.scoreWithHdcp)).toEqual([200, 150, null]);
      });

      it("matches the last game of potGameResults", () => {
        const rows = [
          makeRow(potPlayer(0), 1, 200),
          makeRow(potPlayer(1), 1, 210),
          makeRow(potPlayer(0), 2, 190),
          makeRow(potPlayer(1), 2, 240),
          makeRow(notInPotPlayerId, 2, 300),
        ];
        const lastGame = potLastGameResults(potId, tmntFullData, rows, 2);
        const allGames = potGameResults(potId, tmntFullData, rows, 2) as {
          gameNum: number;
          rows: potResultsRowType[];
        }[];
        expect(lastGame).toEqual(allGames[1].rows);
      });

      it("does not reorder or mutate the input rows", () => {
        const rows = [
          makeRow(potPlayer(0), 2, 150),
          makeRow(potPlayer(1), 2, 250),
          makeRow(potPlayer(2), 2, 200),
        ];
        const copy = cloneDeep(rows);
        potLastGameResults(potId, tmntFullData, rows, 2);
        expect(rows).toEqual(copy);
      });

      it("returns a new array, not the input array", () => {
        const rows = [makeRow(potPlayer(0), 1, 200)];
        const result = potLastGameResults(potId, tmntFullData, rows, 1);
        expect(result).not.toBe(rows);
        expect(result).toEqual(rows);
      });

      it("does not mutate tmntFullData", () => {
        const before = cloneDeep(tmntFullData.potEntries);
        potLastGameResults(potId, tmntFullData, validRows, 2);
        expect(tmntFullData.potEntries).toEqual(before);
      });

      it("works with rows built by buildPotResultsRows", () => {
        const gameResults = [
          makeGameResult(potPlayer(0), divId1, [[180, 200], [200, 220]]),
          makeGameResult(notInPotPlayerId, divId1, [[250, 250], [260, 260]]),
        ];
        const rows = buildPotResultsRows(gameResults, 2);
        const result = potLastGameResults(potId, tmntFullData, rows, 2);

        expect(result.every((r) => r.player_id !== notInPotPlayerId)).toBe(true);
        expect(result[0]).toMatchObject({
          player_id: potPlayer(0),
          div_id: divId1,
          gameNum: 2,
          score: 200,
          hdcp: 20,
          scoreWithHdcp: 220,
        });
      });
    });
  });  
});