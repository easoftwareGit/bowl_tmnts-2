// test/app/components/tmnts/calcPrizes.test.tsx
// tests for src/app/components/tmnts/calcPrizes.ts
import { calcPositions, calcPrizesForDiv } from "@/components/tmnts/prizes";
import { calcNumGames, getLastGameWithScores } from "@/components/tmnts/games";
import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
import { localConfig } from "@/lib/currency/const";
import type { tmntGameResult } from "@/lib/types/resultsTypes";
import type { divPfType } from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  mockDivPfs,
  divId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// calcNumGames and getLastGameWithScores have their own tests in games.ts.
// Mocking them here lets each test choose "all games bowled" or
// "still bowling" without building full game-by-game result rows.
jest.mock("@/components/tmnts/games", () => ({
  calcNumGames: jest.fn(),
  getLastGameWithScores: jest.fn(),
}));

const mockCalcNumGames = calcNumGames as jest.Mock;
const mockGetLastGameWithScores = getLastGameWithScores as jest.Mock;

/** number of games in the mock tournament (6 per player in mockGames) */
const numMockGames = Math.max(...mockGames.map((g) => g.game_num));

/** format a number the same way prizes.ts does */
const fmt = (amount: number): string =>
  formatValueSymbSep2Dec(amount.toString(), localConfig);

/**
 * Build one result row per mock player, with "total + Hdcp" set to the
 * sum of that player's mock games (Scratch division, so no handicap).
 * Returned in player order, NOT sorted by score.
 */
const buildMockResults = (): tmntGameResult[] =>
  mockTmntFullData.players.map((player: { id: string; first_name: string; last_name: string }) => {
    const total = mockGames
      .filter((g) => g.player_id === player.id)
      .reduce((sum, g) => sum + (g.score ?? 0), 0);
    return {
      player_id: player.id,
      first_name: player.first_name,
      last_name: player.last_name,
      "total + Hdcp": total,
    } as unknown as tmntGameResult;
  });

/** Build result rows from a list of totals. */
const resultsFromTotals = (totals: number[]): tmntGameResult[] =>
  totals.map(
    (total, i) =>
      ({
        player_id: `player${i + 1}`,
        "total + Hdcp": total,
      }) as unknown as tmntGameResult
  );

/** Build division prize fund rows from a list of amounts, positions 1..n. */
const divPfsFromAmounts = (amounts: number[]): divPfType[] =>
  amounts.map((amount, i) => ({
    ...mockDivPfs[0],
    id: `dpf_test_${i + 1}`,
    div_id: divId1,
    position: i + 1,
    amount,
  }));

/** Make the mocked games helpers report that all games have been bowled. */
const setAllGamesBowled = (numGames = numMockGames) => {
  mockCalcNumGames.mockReturnValue(numGames);
  mockGetLastGameWithScores.mockReturnValue(numGames);
};

/** Make the mocked games helpers report that bowling is still in progress. */
const setGamesInProgress = (numGames = numMockGames, lastGame = numGames - 1) => {
  mockCalcNumGames.mockReturnValue(numGames);
  mockGetLastGameWithScores.mockReturnValue(lastGame);
};

describe("prizes", () => {
  describe("sanity check of the mock data", () => {
    it("has 8 players with 6 games each and no tied totals", () => {
      const results = buildMockResults();
      expect(results).toHaveLength(8);
      expect(numMockGames).toBe(6);
      const totals = results.map((r) => r["total + Hdcp"]);
      expect(new Set(totals).size).toBe(totals.length);
    });

    it("has a 2 position division prize fund: 212 and 120", () => {
      expect(mockDivPfs).toHaveLength(2);
      expect(mockDivPfs.map((pf) => [pf.position, pf.amount])).toEqual([
        [1, 212],
        [2, 120],
      ]);
    });
  });

  describe("calcPositions", () => {
    describe("empty or invalid input", () => {
      it("returns [] for an empty array", () => {
        expect(calcPositions([])).toEqual([]);
      });
      it("returns [] for null", () => {
        expect(calcPositions(null as unknown as tmntGameResult[])).toEqual([]);
      });
      it("returns [] for undefined", () => {
        expect(calcPositions(undefined as unknown as tmntGameResult[])).toEqual([]);
      });
      it("returns [] for a non-array value", () => {
        expect(calcPositions({} as unknown as tmntGameResult[])).toEqual([]);
        expect(calcPositions("results" as unknown as tmntGameResult[])).toEqual([]);
      });
    });

    it("returns [1] for a single player", () => {
      expect(calcPositions(resultsFromTotals([1200]))).toEqual([1]);
    });

    it("returns 1..8 for the mock players (no ties)", () => {
      expect(calcPositions(buildMockResults())).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it("returns one position per result", () => {
      const results = buildMockResults();
      expect(calcPositions(results)).toHaveLength(results.length);
    });

    it("gives tied players the same position and skips the next positions", () => {
      // example from the doc comment
      expect(calcPositions(resultsFromTotals([1400, 1350, 1350, 1300]))).toEqual([
        1, 2, 2, 4,
      ]);
    });

    it("handles a tie for first", () => {
      expect(calcPositions(resultsFromTotals([1400, 1400, 1300]))).toEqual([1, 1, 3]);
    });

    it("handles a tie for last", () => {
      expect(calcPositions(resultsFromTotals([1400, 1300, 1200, 1200]))).toEqual([
        1, 2, 3, 3,
      ]);
    });

    it("handles a three way tie", () => {
      expect(
        calcPositions(resultsFromTotals([1400, 1350, 1350, 1350, 1300]))
      ).toEqual([1, 2, 2, 2, 5]);
    });

    it("handles more than one tie", () => {
      expect(
        calcPositions(resultsFromTotals([1400, 1400, 1350, 1300, 1300, 1250]))
      ).toEqual([1, 1, 3, 4, 4, 6]);
    });

    it("handles every player tied", () => {
      expect(calcPositions(resultsFromTotals([1300, 1300, 1300, 1300]))).toEqual([
        1, 1, 1, 1,
      ]);
    });

    it("handles a tie in the mock data", () => {
      // tie the 2nd and 3rd best mock players
      const results = buildMockResults();
      const sorted = [...results].sort((a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0));
      sorted[2]["total + Hdcp"] = sorted[1]["total + Hdcp"];
      expect(calcPositions(results)).toEqual([1, 2, 2, 4, 5, 6, 7, 8]);
    });

    it("sorts unsorted input before calculating positions", () => {
      expect(calcPositions(resultsFromTotals([1300, 1350, 1400, 1350]))).toEqual([
        1, 2, 2, 4,
      ]);
    });

    it("treats a missing total as 0 and places it last", () => {
      const results = resultsFromTotals([1300, 1400]);
      results.push({ player_id: "noTotal" } as unknown as tmntGameResult);
      expect(calcPositions(results)).toEqual([1, 2, 3]);
    });

    it("does not change the order of the input array", () => {
      const results = buildMockResults();
      const before = results.map((r) => r.player_id);
      calcPositions(results);
      expect(results.map((r) => r.player_id)).toEqual(before);
    });
  });

  describe("calcPrizesForDiv", () => {
    beforeEach(() => {
      jest.clearAllMocks();
      setAllGamesBowled();
    });

    describe("empty or invalid input", () => {
      it("returns [] when results is empty", () => {
        expect(calcPrizesForDiv([], mockDivPfs)).toEqual([]);
      });
      it("returns [] when results is null or undefined", () => {
        expect(calcPrizesForDiv(null as unknown as tmntGameResult[], mockDivPfs)).toEqual([]);
        expect(
          calcPrizesForDiv(undefined as unknown as tmntGameResult[], mockDivPfs)
        ).toEqual([]);
      });
      it("returns [] when results is not an array", () => {
        expect(calcPrizesForDiv({} as unknown as tmntGameResult[], mockDivPfs)).toEqual([]);
      });
      it("returns [] when divPfs is empty", () => {
        expect(calcPrizesForDiv(buildMockResults(), [])).toEqual([]);
      });
      it("returns [] when divPfs is null or undefined", () => {
        expect(calcPrizesForDiv(buildMockResults(), null as unknown as divPfType[])).toEqual([]);
        expect(
          calcPrizesForDiv(buildMockResults(), undefined as unknown as divPfType[])
        ).toEqual([]);
      });
      it("returns [] when divPfs is not an array", () => {
        expect(calcPrizesForDiv(buildMockResults(), {} as unknown as divPfType[])).toEqual([]);
      });
      it("does not call the games helpers when input is invalid", () => {
        calcPrizesForDiv([], mockDivPfs);
        calcPrizesForDiv(buildMockResults(), []);
        expect(mockCalcNumGames).not.toHaveBeenCalled();
        expect(mockGetLastGameWithScores).not.toHaveBeenCalled();
      });
      it("returns [] when there are no games", () => {
        mockCalcNumGames.mockReturnValue(0);
        expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([]);
        expect(mockGetLastGameWithScores).not.toHaveBeenCalled();
      });
    });

    describe("all games bowled, no ties", () => {
      it("pays the mock prize fund to the top 2 mock players", () => {
        expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([
          fmt(212),
          fmt(120),
        ]);
      });

      it("returns one prize per prize position, not one per player", () => {
        const prizes = calcPrizesForDiv(buildMockResults(), mockDivPfs);
        expect(prizes).toHaveLength(mockDivPfs.length);
      });

      it("returns prizes formatted as currency", () => {
        const prizes = calcPrizesForDiv(buildMockResults(), mockDivPfs);
        prizes.forEach((prize) => expect(typeof prize).toBe("string"));
        expect(prizes[0]).toBe(formatValueSymbSep2Dec("212", localConfig));
      });

      it("sorts unsorted divPfs by position", () => {
        const reversed = [...mockDivPfs].reverse();
        expect(calcPrizesForDiv(buildMockResults(), reversed)).toEqual([
          fmt(212),
          fmt(120),
        ]);
      });

      it("pays only as many prizes as there are players", () => {
        const results = resultsFromTotals([1400, 1300]);
        const divPfs = divPfsFromAmounts([300, 200, 100]);
        expect(calcPrizesForDiv(results, divPfs)).toEqual([fmt(300), fmt(200)]);
      });

      it("treats a missing amount as 0", () => {
        const divPfs = divPfsFromAmounts([212, 120]);
        delete (divPfs[1] as Partial<divPfType>).amount;
        expect(calcPrizesForDiv(buildMockResults(), divPfs)).toEqual([fmt(212), fmt(0)]);
      });

      it("passes the sorted results to the games helpers", () => {
        calcPrizesForDiv(buildMockResults(), mockDivPfs);
        const passed: tmntGameResult[] = mockCalcNumGames.mock.calls[0][0];
        const totals = passed.map((r) => r["total + Hdcp"] ?? 0);
        expect(totals).toEqual([...totals].sort((a, b) => b - a));
        expect(mockGetLastGameWithScores).toHaveBeenCalledWith(passed);
      });

      it("does not change the order of the input arrays", () => {
        const results = buildMockResults();
        const divPfs = [...mockDivPfs].reverse();
        const resultIds = results.map((r) => r.player_id);
        const pfIds = divPfs.map((pf) => pf.id);
        calcPrizesForDiv(results, divPfs);
        expect(results.map((r) => r.player_id)).toEqual(resultIds);
        expect(divPfs.map((pf) => pf.id)).toEqual(pfIds);
      });
    });

    describe("all games bowled, with ties", () => {
      it("splits 1st and 2nd evenly when two players tie for 1st", () => {
        // (212 + 120) / 2 = 166
        const results = resultsFromTotals([1400, 1400, 1300, 1200]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
      });

      it("splits 2nd and 3rd when two players tie for 2nd", () => {
        // (200 + 100) / 2 = 150
        const results = resultsFromTotals([1400, 1350, 1350, 1300]);
        const divPfs = divPfsFromAmounts([300, 200, 100]);
        expect(calcPrizesForDiv(results, divPfs)).toEqual([
          fmt(300),
          fmt(150),
          fmt(150),
        ]);
      });

      it("splits prizes for a tie in the mock data", () => {
        // tie the top 2 mock players
        const results = buildMockResults();
        const sorted = [...results].sort((a, b) => (b["total + Hdcp"] ?? 0) - (a["total + Hdcp"] ?? 0));
        sorted[1]["total + Hdcp"] = sorted[0]["total + Hdcp"];
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
      });

      it("pays nothing extra for a tie just below the paid positions", () => {
        const results = resultsFromTotals([1400, 1350, 1300, 1300]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
      });

      it("handles two separate ties", () => {
        // 1st: (400 + 300) / 2 = 350; 3rd: (200 + 100) / 2 = 150
        const results = resultsFromTotals([1400, 1400, 1300, 1300, 1200]);
        const divPfs = divPfsFromAmounts([400, 300, 200, 100]);
        expect(calcPrizesForDiv(results, divPfs)).toEqual([
          fmt(350),
          fmt(350),
          fmt(150),
          fmt(150),
        ]);
      });

      it("works with unsorted results that contain a tie", () => {
        const results = resultsFromTotals([1300, 1400, 1200, 1400]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
      });
    });

    describe("more tied players than prize positions", () => {
      it("splits the last prize among players tied for the last paid position", () => {
        // 1st: 212; three tied for 2nd share 120 / 3 = 40
        const results = resultsFromTotals([1400, 1350, 1350, 1350, 1200]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([
          fmt(212),
          fmt(40),
          fmt(40),
          fmt(40),
        ]);
      });

      it("splits all prizes among three players tied for 1st with 2 prizes", () => {
        // (212 + 120) / 3 = 110.666...
        const results = resultsFromTotals([1400, 1400, 1400, 1300]);
        const prizes = calcPrizesForDiv(results, mockDivPfs);
        expect(prizes).toHaveLength(3);
        expect(prizes).toEqual([fmt(332 / 3), fmt(332 / 3), fmt(332 / 3)]);
      });

      it("splits all prizes when every mock player is tied", () => {
        // (212 + 120) / 8 = 41.5
        const results = buildMockResults().map(
          (r) => ({ ...r, "total + Hdcp": 1300 }) as tmntGameResult
        );
        const prizes = calcPrizesForDiv(results, mockDivPfs);
        expect(prizes).toHaveLength(8);
        prizes.forEach((prize) => expect(prize).toBe(fmt(41.5)));
      });

      it("returns more prizes than prize positions when the tie runs past the end", () => {
        const results = resultsFromTotals([1400, 1350, 1350, 1350]);
        const prizes = calcPrizesForDiv(results, mockDivPfs);
        expect(prizes.length).toBeGreaterThan(mockDivPfs.length);
      });
    });

    describe("not all games bowled (numGames > lastGameWithScore)", () => {
      beforeEach(() => {
        setGamesInProgress(6, 3);
      });

      it("returns the prize fund amounts in position order", () => {
        expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([
          fmt(212),
          fmt(120),
        ]);
      });

      it("does not split prizes for tied players", () => {
        const results = resultsFromTotals([1400, 1400, 1300]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
      });

      it("does not split prizes when more players are tied than prizes", () => {
        const results = resultsFromTotals([1400, 1400, 1400, 1400]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
      });

      it("returns one prize per prize position, even with fewer players", () => {
        const results = resultsFromTotals([1400]);
        const divPfs = divPfsFromAmounts([300, 200, 100]);
        expect(calcPrizesForDiv(results, divPfs)).toEqual([
          fmt(300),
          fmt(200),
          fmt(100),
        ]);
      });

      it("sorts unsorted divPfs by position", () => {
        const reversed = [...mockDivPfs].reverse();
        expect(calcPrizesForDiv(buildMockResults(), reversed)).toEqual([
          fmt(212),
          fmt(120),
        ]);
      });

      it("treats a missing amount as 0", () => {
        const divPfs = divPfsFromAmounts([212, 120]);
        delete (divPfs[0] as Partial<divPfType>).amount;
        expect(calcPrizesForDiv(buildMockResults(), divPfs)).toEqual([fmt(0), fmt(120)]);
      });

      it("treats no scores yet (last game 0) as in progress", () => {
        setGamesInProgress(6, 0);
        const results = resultsFromTotals([0, 0, 0]);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
      });

      it("splits ties once the last game has scores", () => {
        const results = resultsFromTotals([1400, 1400, 1300]);
        setGamesInProgress(6, 5);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
        setAllGamesBowled(6);
        expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
      });
    });
  });
});


// import { calcPositions, calcPrizesForDiv } from "@/components/tmnts/prizes";
// import { calcNumGames, getLastGameWithScores } from "@/components/tmnts/games";
// import { formatValueSymbSep2Dec } from "@/lib/currency/formatValue";
// import { localConfig } from "@/lib/currency/const";
// import type { tmntGameResult } from "@/lib/types/resultsTypes";
// import type { divPfType } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   mockGames,
//   mockDivPfs,
//   divId1,
// } from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

// // calcNumGames and getLastGameWithScores have their own tests in games.ts.
// // Mocking them here lets each test choose "all games bowled" or
// // "still bowling" without building full game-by-game result rows.
// jest.mock("@/components/tmnts/games", () => ({
//   calcNumGames: jest.fn(),
//   getLastGameWithScores: jest.fn(),
// }));

// const mockCalcNumGames = calcNumGames as jest.Mock;
// const mockGetLastGameWithScores = getLastGameWithScores as jest.Mock;

// /** number of games in the mock tournament (6 per player in mockGames) */
// const numMockGames = Math.max(...mockGames.map((g) => g.game_num));

// /** format a number the same way prizes.ts does */
// const fmt = (amount: number): string =>
//   formatValueSymbSep2Dec(amount.toString(), localConfig);

// /**
//  * Build one result row per mock player, with "total + Hdcp" set to the
//  * sum of that player's mock games (Scratch division, so no handicap).
//  * Returned in player order, NOT sorted by score.
//  */
// const buildMockResults = (): tmntGameResult[] =>
//   mockTmntFullData.players.map((player: { id: string; first_name: string; last_name: string }) => {
//     const total = mockGames
//       .filter((g) => g.player_id === player.id)
//       .reduce((sum, g) => sum + (g.score ?? 0), 0);
//     return {
//       player_id: player.id,
//       first_name: player.first_name,
//       last_name: player.last_name,
//       "total + Hdcp": total,
//     } as unknown as tmntGameResult;
//   });

// /** Build result rows from a list of totals. */
// const resultsFromTotals = (totals: number[]): tmntGameResult[] =>
//   totals.map(
//     (total, i) =>
//       ({
//         player_id: `player${i + 1}`,
//         "total + Hdcp": total,
//       }) as unknown as tmntGameResult
//   );

// /** Build division prize fund rows from a list of amounts, positions 1..n. */
// const divPfsFromAmounts = (amounts: number[]): divPfType[] =>
//   amounts.map((amount, i) => ({
//     ...mockDivPfs[0],
//     id: `dpf_test_${i + 1}`,
//     div_id: divId1,
//     position: i + 1,
//     amount,
//   }));

// /** Make the mocked games helpers report that all games have been bowled. */
// const setAllGamesBowled = (numGames = numMockGames) => {
//   mockCalcNumGames.mockReturnValue(numGames);
//   mockGetLastGameWithScores.mockReturnValue(numGames);
// };

// /** Make the mocked games helpers report that bowling is still in progress. */
// const setGamesInProgress = (numGames = numMockGames, lastGame = numGames - 1) => {
//   mockCalcNumGames.mockReturnValue(numGames);
//   mockGetLastGameWithScores.mockReturnValue(lastGame);
// };

// describe("prizes", () => {
//   describe("sanity check of the mock data", () => {
//     it("has 8 players with 6 games each and no tied totals", () => {
//       const results = buildMockResults();
//       expect(results).toHaveLength(8);
//       expect(numMockGames).toBe(6);
//       const totals = results.map((r) => r["total + Hdcp"]);
//       expect(new Set(totals).size).toBe(totals.length);
//     });

//     it("has a 2 position division prize fund: 212 and 120", () => {
//       expect(mockDivPfs).toHaveLength(2);
//       expect(mockDivPfs.map((pf) => [pf.position, pf.amount])).toEqual([
//         [1, 212],
//         [2, 120],
//       ]);
//     });
//   });

//   describe("calcPositions", () => {
//     describe("empty or invalid input", () => {
//       it("returns [] for an empty array", () => {
//         expect(calcPositions([])).toEqual([]);
//       });
//       it("returns [] for null", () => {
//         expect(calcPositions(null as unknown as tmntGameResult[])).toEqual([]);
//       });
//       it("returns [] for undefined", () => {
//         expect(calcPositions(undefined as unknown as tmntGameResult[])).toEqual([]);
//       });
//       it("returns [] for a non-array value", () => {
//         expect(calcPositions({} as unknown as tmntGameResult[])).toEqual([]);
//         expect(calcPositions("results" as unknown as tmntGameResult[])).toEqual([]);
//       });
//     });

//     it("returns [1] for a single player", () => {
//       expect(calcPositions(resultsFromTotals([1200]))).toEqual([1]);
//     });

//     it("returns 1..8 for the mock players (no ties)", () => {
//       expect(calcPositions(buildMockResults())).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
//     });

//     it("returns one position per result", () => {
//       const results = buildMockResults();
//       expect(calcPositions(results)).toHaveLength(results.length);
//     });

//     it("gives tied players the same position and skips the next positions", () => {
//       // example from the doc comment
//       expect(calcPositions(resultsFromTotals([1400, 1350, 1350, 1300]))).toEqual([
//         1, 2, 2, 4,
//       ]);
//     });

//     it("handles a tie for first", () => {
//       expect(calcPositions(resultsFromTotals([1400, 1400, 1300]))).toEqual([1, 1, 3]);
//     });

//     it("handles a tie for last", () => {
//       expect(calcPositions(resultsFromTotals([1400, 1300, 1200, 1200]))).toEqual([
//         1, 2, 3, 3,
//       ]);
//     });

//     it("handles a three way tie", () => {
//       expect(
//         calcPositions(resultsFromTotals([1400, 1350, 1350, 1350, 1300]))
//       ).toEqual([1, 2, 2, 2, 5]);
//     });

//     it("handles more than one tie", () => {
//       expect(
//         calcPositions(resultsFromTotals([1400, 1400, 1350, 1300, 1300, 1250]))
//       ).toEqual([1, 1, 3, 4, 4, 6]);
//     });

//     it("handles every player tied", () => {
//       expect(calcPositions(resultsFromTotals([1300, 1300, 1300, 1300]))).toEqual([
//         1, 1, 1, 1,
//       ]);
//     });

//     it("handles a tie in the mock data", () => {
//       // tie the 2nd and 3rd best mock players
//       const results = buildMockResults();
//       const sorted = [...results].sort((a, b) => b["total + Hdcp"] - a["total + Hdcp"]);
//       sorted[2]["total + Hdcp"] = sorted[1]["total + Hdcp"];
//       expect(calcPositions(results)).toEqual([1, 2, 2, 4, 5, 6, 7, 8]);
//     });

//     it("sorts unsorted input before calculating positions", () => {
//       expect(calcPositions(resultsFromTotals([1300, 1350, 1400, 1350]))).toEqual([
//         1, 2, 2, 4,
//       ]);
//     });

//     it("treats a missing total as 0 and places it last", () => {
//       const results = resultsFromTotals([1300, 1400]);
//       results.push({ player_id: "noTotal" } as unknown as tmntGameResult);
//       expect(calcPositions(results)).toEqual([1, 2, 3]);
//     });

//     it("does not change the order of the input array", () => {
//       const results = buildMockResults();
//       const before = results.map((r) => r.player_id);
//       calcPositions(results);
//       expect(results.map((r) => r.player_id)).toEqual(before);
//     });
//   });

//   describe("calcPrizesForDiv", () => {
//     beforeEach(() => {
//       jest.clearAllMocks();
//       setAllGamesBowled();
//     });

//     describe("empty or invalid input", () => {
//       it("returns [] when results is empty", () => {
//         expect(calcPrizesForDiv([], mockDivPfs)).toEqual([]);
//       });
//       it("returns [] when results is null or undefined", () => {
//         expect(calcPrizesForDiv(null as unknown as tmntGameResult[], mockDivPfs)).toEqual([]);
//         expect(
//           calcPrizesForDiv(undefined as unknown as tmntGameResult[], mockDivPfs)
//         ).toEqual([]);
//       });
//       it("returns [] when results is not an array", () => {
//         expect(calcPrizesForDiv({} as unknown as tmntGameResult[], mockDivPfs)).toEqual([]);
//       });
//       it("returns [] when divPfs is empty", () => {
//         expect(calcPrizesForDiv(buildMockResults(), [])).toEqual([]);
//       });
//       it("returns [] when divPfs is null or undefined", () => {
//         expect(calcPrizesForDiv(buildMockResults(), null as unknown as divPfType[])).toEqual([]);
//         expect(
//           calcPrizesForDiv(buildMockResults(), undefined as unknown as divPfType[])
//         ).toEqual([]);
//       });
//       it("returns [] when divPfs is not an array", () => {
//         expect(calcPrizesForDiv(buildMockResults(), {} as unknown as divPfType[])).toEqual([]);
//       });
//       it("does not call the games helpers when input is invalid", () => {
//         calcPrizesForDiv([], mockDivPfs);
//         calcPrizesForDiv(buildMockResults(), []);
//         expect(mockCalcNumGames).not.toHaveBeenCalled();
//         expect(mockGetLastGameWithScores).not.toHaveBeenCalled();
//       });
//       it("returns [] when there are no games", () => {
//         mockCalcNumGames.mockReturnValue(0);
//         expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([]);
//         expect(mockGetLastGameWithScores).not.toHaveBeenCalled();
//       });
//     });

//     describe("all games bowled, no ties", () => {
//       it("pays the mock prize fund to the top 2 mock players", () => {
//         expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([
//           fmt(212),
//           fmt(120),
//         ]);
//       });

//       it("returns one prize per prize position, not one per player", () => {
//         const prizes = calcPrizesForDiv(buildMockResults(), mockDivPfs);
//         expect(prizes).toHaveLength(mockDivPfs.length);
//       });

//       it("returns prizes formatted as currency", () => {
//         const prizes = calcPrizesForDiv(buildMockResults(), mockDivPfs);
//         prizes.forEach((prize) => expect(typeof prize).toBe("string"));
//         expect(prizes[0]).toBe(formatValueSymbSep2Dec("212", localConfig));
//       });

//       it("sorts unsorted divPfs by position", () => {
//         const reversed = [...mockDivPfs].reverse();
//         expect(calcPrizesForDiv(buildMockResults(), reversed)).toEqual([
//           fmt(212),
//           fmt(120),
//         ]);
//       });

//       it("pays only as many prizes as there are players", () => {
//         const results = resultsFromTotals([1400, 1300]);
//         const divPfs = divPfsFromAmounts([300, 200, 100]);
//         expect(calcPrizesForDiv(results, divPfs)).toEqual([fmt(300), fmt(200)]);
//       });

//       it("treats a missing amount as 0", () => {
//         const divPfs = divPfsFromAmounts([212, 120]);
//         delete (divPfs[1] as Partial<divPfType>).amount;
//         expect(calcPrizesForDiv(buildMockResults(), divPfs)).toEqual([fmt(212), fmt(0)]);
//       });

//       it("passes the sorted results to the games helpers", () => {
//         calcPrizesForDiv(buildMockResults(), mockDivPfs);
//         const passed: tmntGameResult[] = mockCalcNumGames.mock.calls[0][0];
//         const totals = passed.map((r) => r["total + Hdcp"]);
//         expect(totals).toEqual([...totals].sort((a, b) => b - a));
//         expect(mockGetLastGameWithScores).toHaveBeenCalledWith(passed);
//       });

//       it("does not change the order of the input arrays", () => {
//         const results = buildMockResults();
//         const divPfs = [...mockDivPfs].reverse();
//         const resultIds = results.map((r) => r.player_id);
//         const pfIds = divPfs.map((pf) => pf.id);
//         calcPrizesForDiv(results, divPfs);
//         expect(results.map((r) => r.player_id)).toEqual(resultIds);
//         expect(divPfs.map((pf) => pf.id)).toEqual(pfIds);
//       });
//     });

//     describe("all games bowled, with ties", () => {
//       it("splits 1st and 2nd evenly when two players tie for 1st", () => {
//         // (212 + 120) / 2 = 166
//         const results = resultsFromTotals([1400, 1400, 1300, 1200]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
//       });

//       it("splits 2nd and 3rd when two players tie for 2nd", () => {
//         // (200 + 100) / 2 = 150
//         const results = resultsFromTotals([1400, 1350, 1350, 1300]);
//         const divPfs = divPfsFromAmounts([300, 200, 100]);
//         expect(calcPrizesForDiv(results, divPfs)).toEqual([
//           fmt(300),
//           fmt(150),
//           fmt(150),
//         ]);
//       });

//       it("splits prizes for a tie in the mock data", () => {
//         // tie the top 2 mock players
//         const results = buildMockResults();
//         const sorted = [...results].sort((a, b) => b["total + Hdcp"] - a["total + Hdcp"]);
//         sorted[1]["total + Hdcp"] = sorted[0]["total + Hdcp"];
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
//       });

//       it("pays nothing extra for a tie just below the paid positions", () => {
//         const results = resultsFromTotals([1400, 1350, 1300, 1300]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
//       });

//       it("handles two separate ties", () => {
//         // 1st: (400 + 300) / 2 = 350; 3rd: (200 + 100) / 2 = 150
//         const results = resultsFromTotals([1400, 1400, 1300, 1300, 1200]);
//         const divPfs = divPfsFromAmounts([400, 300, 200, 100]);
//         expect(calcPrizesForDiv(results, divPfs)).toEqual([
//           fmt(350),
//           fmt(350),
//           fmt(150),
//           fmt(150),
//         ]);
//       });

//       it("works with unsorted results that contain a tie", () => {
//         const results = resultsFromTotals([1300, 1400, 1200, 1400]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
//       });
//     });

//     describe("more tied players than prize positions", () => {
//       it("splits the last prize among players tied for the last paid position", () => {
//         // 1st: 212; three tied for 2nd share 120 / 3 = 40
//         const results = resultsFromTotals([1400, 1350, 1350, 1350, 1200]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([
//           fmt(212),
//           fmt(40),
//           fmt(40),
//           fmt(40),
//         ]);
//       });

//       it("splits all prizes among three players tied for 1st with 2 prizes", () => {
//         // (212 + 120) / 3 = 110.666...
//         const results = resultsFromTotals([1400, 1400, 1400, 1300]);
//         const prizes = calcPrizesForDiv(results, mockDivPfs);
//         expect(prizes).toHaveLength(3);
//         expect(prizes).toEqual([fmt(332 / 3), fmt(332 / 3), fmt(332 / 3)]);
//       });

//       it("splits all prizes when every mock player is tied", () => {
//         // (212 + 120) / 8 = 41.5
//         const results = buildMockResults().map(
//           (r) => ({ ...r, "total + Hdcp": 1300 }) as tmntGameResult
//         );
//         const prizes = calcPrizesForDiv(results, mockDivPfs);
//         expect(prizes).toHaveLength(8);
//         prizes.forEach((prize) => expect(prize).toBe(fmt(41.5)));
//       });

//       it("returns more prizes than prize positions when the tie runs past the end", () => {
//         const results = resultsFromTotals([1400, 1350, 1350, 1350]);
//         const prizes = calcPrizesForDiv(results, mockDivPfs);
//         expect(prizes.length).toBeGreaterThan(mockDivPfs.length);
//       });
//     });

//     describe("not all games bowled (numGames > lastGameWithScore)", () => {
//       beforeEach(() => {
//         setGamesInProgress(6, 3);
//       });

//       it("returns the prize fund amounts in position order", () => {
//         expect(calcPrizesForDiv(buildMockResults(), mockDivPfs)).toEqual([
//           fmt(212),
//           fmt(120),
//         ]);
//       });

//       it("does not split prizes for tied players", () => {
//         const results = resultsFromTotals([1400, 1400, 1300]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
//       });

//       it("does not split prizes when more players are tied than prizes", () => {
//         const results = resultsFromTotals([1400, 1400, 1400, 1400]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
//       });

//       it("returns one prize per prize position, even with fewer players", () => {
//         const results = resultsFromTotals([1400]);
//         const divPfs = divPfsFromAmounts([300, 200, 100]);
//         expect(calcPrizesForDiv(results, divPfs)).toEqual([
//           fmt(300),
//           fmt(200),
//           fmt(100),
//         ]);
//       });

//       it("sorts unsorted divPfs by position", () => {
//         const reversed = [...mockDivPfs].reverse();
//         expect(calcPrizesForDiv(buildMockResults(), reversed)).toEqual([
//           fmt(212),
//           fmt(120),
//         ]);
//       });

//       it("treats a missing amount as 0", () => {
//         const divPfs = divPfsFromAmounts([212, 120]);
//         delete (divPfs[0] as Partial<divPfType>).amount;
//         expect(calcPrizesForDiv(buildMockResults(), divPfs)).toEqual([fmt(0), fmt(120)]);
//       });

//       it("treats no scores yet (last game 0) as in progress", () => {
//         setGamesInProgress(6, 0);
//         const results = resultsFromTotals([0, 0, 0]);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
//       });

//       it("splits ties once the last game has scores", () => {
//         const results = resultsFromTotals([1400, 1400, 1300]);
//         setGamesInProgress(6, 5);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(212), fmt(120)]);
//         setAllGamesBowled(6);
//         expect(calcPrizesForDiv(results, mockDivPfs)).toEqual([fmt(166), fmt(166)]);
//       });
//     });
//   });
// });
