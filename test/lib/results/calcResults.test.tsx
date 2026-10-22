import { calcPositions, calcPrizes } from "@/lib/results/calcResults";
import type {
  divPfType,
  elimPfType,
  playerType,
  potPfType,
} from "@/lib/types/types";
import {
  mockTmntFullData,
  mockGames,
  mockDivPfs,
  potId1,
  elimId1,
} from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

/********************************************/
/* fixtures built from mockTmntFullData     */
/********************************************/
const { players, squads } = mockTmntFullData;
const [scratchDiv, hdcpDiv] = mockTmntFullData.divs;
// mock scratch division pays 212 for first and 120 for second
const justDivPfs: divPfType[] = mockDivPfs.filter(
  (pf) => pf.div_id === scratchDiv.id
);

// number of games for the squad the player bowled in
const numGamesFor = (p: playerType): number =>
  squads.find((s) => s.id === p.squad_id)?.games ?? 0;

// just the fields calcPrizes / calcPositions need; both are generic over T
type PlayerResult = {
  player_id: string;
  full_name: string;
  total: number;
  "total + Hdcp": number;
};
type SortKey = "total" | "total + Hdcp";

// player number (1-8) -> player id from the mock
const pid = (n: number) => players[n - 1].id;
const order = (...nums: number[]) => nums.map(pid);

const scoresFor = (playerId: string): number[] =>
  mockGames
    .filter((g) => g.player_id === playerId)
    .sort((a, b) => a.game_num - b.game_num)
    .map((g) => g.score);

// handicap per game for the mock handicap division
const hdcpPerGame = (average: number) =>
  Math.floor(hdcpDiv.hdcp_per * (hdcpDiv.hdcp_from - average));

const buildResult = (p: playerType): PlayerResult => {
  const scores = scoresFor(p.id);
  const total = scores.reduce((sum, s) => sum + s, 0);
  const totalHdcp = hdcpPerGame(p.average) * scores.length;
  return {
    player_id: p.id,
    full_name: `${p.first_name} ${p.last_name}`,
    total,
    "total + Hdcp": total + totalHdcp,
  };
};

// sorted by key, highest first, like the SQL result
const buildResults = (key: SortKey = "total + Hdcp"): PlayerResult[] =>
  players.map((p) => buildResult(p)).sort((a, b) => b[key] - a[key]);

// total + Hdcp: p8 1666, p3 1463, p4 1398, p2 1394, p6 1382, p5 1360, p7 1349, p1 1279
const HDCP_ORDER = order(8, 3, 4, 2, 6, 5, 7, 1);
// total (scratch): p8 1456, p5 1312, p3 1301, p2 1286, p6 1280, p1 1225, p7 1193, p4 1182
const SCRATCH_ORDER = order(8, 5, 3, 2, 6, 1, 7, 4);

const getResult = (results: PlayerResult[], playerNum: number) =>
  results.find((r) => r.player_id === pid(playerNum)) as PlayerResult;

// the same results, in the order of the player numbers given
const reorder = (results: PlayerResult[], ...nums: number[]) =>
  nums.map((n) => getResult(results, n));

// overwrite one result's value, e.g. to create a tie
const setValue = (
  results: PlayerResult[],
  playerNum: number,
  value: number,
  key: SortKey = "total + Hdcp"
) => {
  getResult(results, playerNum)[key] = value;
};

const makeDivPf = (position: number, amount: number | null): divPfType => ({
  id: `dpf_${position}`,
  div_id: scratchDiv.id,
  position,
  amount,
});

const makePotPf = (position: number, amount: number): potPfType => ({
  id: `ppf_${position}`,
  pot_id: potId1,
  position,
  amount,
});

const makeElimPf = (position: number, amount: number): elimPfType => ({
  id: `epf_${position}`,
  elim_id: elimId1,
  position,
  amount,
});

describe("calcPositions", () => {
  describe("empty input", () => {
    it("returns an empty array when there are no results", () => {
      expect(calcPositions<PlayerResult>([], "total + Hdcp")).toEqual([]);
    });
  });

  describe("no ties", () => {
    it("numbers the results 1 to n in order", () => {
      expect(calcPositions(buildResults(), "total + Hdcp")).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it("returns one position per result", () => {
      const results = buildResults();
      expect(calcPositions(results, "total + Hdcp")).toHaveLength(
        results.length
      );
    });

    it("gives a single result position 1", () => {
      expect(calcPositions(buildResults().slice(0, 1), "total + Hdcp")).toEqual(
        [1]
      );
    });
  });

  describe("ties", () => {
    it("gives a tie for first the same position and skips the next", () => {
      const results = buildResults();
      setValue(results, 3, 1666); // player 3 ties player 8 for first

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 1, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it("handles a tie in the middle", () => {
      const results = buildResults();
      setValue(results, 4, 1463); // player 4 ties player 3 for second

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 2, 2, 4, 5, 6, 7, 8,
      ]);
    });

    it("handles a three-way tie", () => {
      const results = buildResults();
      setValue(results, 4, 1463);
      setValue(results, 2, 1463); // players 3, 4 and 2 tied for second

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 2, 2, 2, 5, 6, 7, 8,
      ]);
    });

    it("handles a tie for last place", () => {
      const results = buildResults();
      setValue(results, 7, 1279); // player 7 ties player 1 for last

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 2, 3, 4, 5, 6, 7, 7,
      ]);
    });

    it("handles more than one separate tie", () => {
      const results = buildResults();
      setValue(results, 3, 1666); // tie for first
      setValue(results, 5, 1382); // player 5 ties player 6 for fifth

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 1, 3, 4, 5, 5, 7, 8,
      ]);
    });

    it("gives every result position 1 when all are tied", () => {
      const results = buildResults();
      results.forEach((r) => {
        r["total + Hdcp"] = 1400;
      });

      expect(calcPositions(results, "total + Hdcp")).toEqual(
        Array(players.length).fill(1)
      );
    });

    it("only treats neighbouring results as tied", () => {
      // p8 and p3 have the same total, but p1 is between them
      const results = buildResults();
      setValue(results, 3, 1666);
      const notNeighbours = reorder(results, 8, 1, 3, 4, 2, 6, 5, 7);

      expect(calcPositions(notNeighbours, "total + Hdcp")).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8,
      ]);
    });
  });

  describe("propertyName (generic)", () => {
    it("uses the property passed in to find ties", () => {
      // tie on total + Hdcp, but not on total
      const results = buildResults();
      setValue(results, 3, 1666);

      expect(calcPositions(results, "total + Hdcp")).toEqual([
        1, 1, 3, 4, 5, 6, 7, 8,
      ]);
      expect(calcPositions(results, "total")).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it("works with scratch results sorted by total", () => {
      expect(calcPositions(buildResults("total"), "total")).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it("finds a tie on total", () => {
      const results = buildResults("total");
      setValue(results, 5, 1456, "total"); // player 5 ties player 8 for first

      expect(calcPositions(results, "total")).toEqual([
        1, 1, 3, 4, 5, 6, 7, 8,
      ]);
    });

    it("works with any result type", () => {
      const scores = [{ score: 300 }, { score: 279 }, { score: 279 }, { score: 250 }];

      expect(calcPositions(scores, "score")).toEqual([1, 2, 2, 4]);
    });

    it("works with string values", () => {
      const names = [{ name: "a" }, { name: "b" }, { name: "b" }];

      expect(calcPositions(names, "name")).toEqual([1, 2, 2]);
    });

    it("compares values with strict equality", () => {
      // "279" and 279 are not tied
      const scores: { score: number | string }[] = [
        { score: 279 },
        { score: "279" },
      ];

      expect(calcPositions(scores, "score")).toEqual([1, 2]);
    });
  });

  describe("input order and immutability", () => {
    it("does not sort the results, it uses them in the order given", () => {
      // sorting is the caller's job; ascending order still ranks by index
      const ascending = [{ score: 100 }, { score: 100 }, { score: 200 }];

      expect(calcPositions(ascending, "score")).toEqual([1, 1, 3]);
    });

    it("does not modify the results passed in", () => {
      const results = buildResults();
      setValue(results, 3, 1666);
      const before = JSON.stringify(results);

      calcPositions(results, "total + Hdcp");

      expect(JSON.stringify(results)).toBe(before);
    });
  });
});

describe("calcPrizes", () => {
  describe("fixture sanity check", () => {
    it("every mock player has one score per squad game, none above 300", () => {
      players.forEach((p) => {
        const numGames = numGamesFor(p);
        expect(numGames).toBeGreaterThan(0);

        const scores = scoresFor(p.id);
        expect(scores).toHaveLength(numGames);
        scores.forEach((s) => expect(s).toBeLessThanOrEqual(300));
      });
    });

    it("builds the expected order by total + Hdcp", () => {
      expect(buildResults().map((r) => r.player_id)).toEqual(HDCP_ORDER);
    });

    it("builds the expected order by total", () => {
      expect(buildResults("total").map((r) => r.player_id)).toEqual(
        SCRATCH_ORDER
      );
    });

    it("the mock scratch prize funds are position 1 = 212 and position 2 = 120", () => {
      expect(justDivPfs.map((pf) => [pf.position, pf.amount])).toEqual([
        [1, 212],
        [2, 120],
      ]);
    });
  });

  describe("empty input", () => {
    it("returns an empty array when there are no results", () => {
      expect(calcPrizes<PlayerResult>([], "total + Hdcp", justDivPfs)).toEqual(
        []
      );
    });

    it("returns an empty array when there are no prize funds", () => {
      expect(calcPrizes(buildResults(), "total + Hdcp", [])).toEqual([]);
    });
  });

  describe("return values", () => {
    it("returns numbers, not formatted strings", () => {
      const prizes = calcPrizes(buildResults(), "total + Hdcp", justDivPfs);

      prizes.forEach((prize) => expect(typeof prize).toBe("number"));
    });

    it("returns an unrounded value for an uneven split", () => {
      const results = buildResults();
      setValue(results, 3, 1666);
      setValue(results, 4, 1666); // three-way tie for first

      // (212 + 120) / 3 = 110.666..., rounding is the caller's job
      const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
      expect(prizes).toHaveLength(3);
      prizes.forEach((prize) => expect(prize).toBeCloseTo(332 / 3, 10));
    });

    it("the split prizes add up to the prize money paid out", () => {
      const results = buildResults();
      setValue(results, 3, 1666);
      setValue(results, 4, 1666);

      const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
      const paid = prizes.reduce((sum, p) => sum + p, 0);
      expect(paid).toBeCloseTo(212 + 120, 10);
    });
  });

  describe("no ties", () => {
    it("pays each prize position once, in order", () => {
      expect(calcPrizes(buildResults(), "total + Hdcp", justDivPfs)).toEqual([
        212, 120,
      ]);
    });

    it("returns only as many prizes as there are paid places", () => {
      // 8 results, 2 prize funds: the caller fills in the unpaid rows
      const prizes = calcPrizes(buildResults(), "total + Hdcp", justDivPfs);
      expect(prizes).toHaveLength(justDivPfs.length);
    });

    it("pays every result when there are as many funds as results", () => {
      const results = buildResults().slice(0, 3);
      const funds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 25)];

      expect(calcPrizes(results, "total + Hdcp", funds)).toEqual([100, 50, 25]);
    });

    it("does not throw when there are fewer results than prize funds", () => {
      const twoResults = buildResults().slice(0, 2);
      const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 25)];

      expect(() =>
        calcPrizes(twoResults, "total + Hdcp", threeFunds)
      ).not.toThrow();
      expect(calcPrizes(twoResults, "total + Hdcp", threeFunds)).toEqual([
        100, 50,
      ]);
    });

    it("pays a single result the first prize", () => {
      const oneResult = buildResults().slice(0, 1);

      expect(calcPrizes(oneResult, "total + Hdcp", justDivPfs)).toEqual([212]);
    });
  });

  describe("ties", () => {
    it("splits the combined prize for a tie for first", () => {
      const results = buildResults();
      setValue(results, 3, 1666); // player 3 ties player 8 for first

      // (212 + 120) / 2 = 166 each
      expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
        166, 166,
      ]);
    });

    it("only splits prize money that exists when a tie runs past the last paid place", () => {
      const results = buildResults();
      setValue(results, 4, 1463); // player 4 ties player 3 for second

      // only the second prize (120) exists: 120 / 2 = 60 each
      expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
        212, 60, 60,
      ]);
    });

    it("splits a tie that is exactly covered by prize funds", () => {
      const results = buildResults();
      setValue(results, 4, 1463); // tie for second
      const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 30)];

      // (50 + 30) / 2 = 40 each
      expect(calcPrizes(results, "total + Hdcp", threeFunds)).toEqual([
        100, 40, 40,
      ]);
    });

    it("pays the place after a tie at the next unused prize position", () => {
      const results = buildResults();
      setValue(results, 3, 1666); // tie for first
      const fourFunds = [
        makeDivPf(1, 100),
        makeDivPf(2, 60),
        makeDivPf(3, 30),
        makeDivPf(4, 10),
      ];

      // first two split 100 + 60 = 80 each, the next two get the 3rd and 4th prizes
      expect(calcPrizes(results, "total + Hdcp", fourFunds)).toEqual([
        80, 80, 30, 10,
      ]);
    });

    it("handles a three-way tie for second", () => {
      const results = buildResults();
      setValue(results, 4, 1463);
      setValue(results, 2, 1463); // players 3, 4 and 2 tied for second
      const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 30)];

      // (50 + 30) / 3, no fourth prize to include
      const prizes = calcPrizes(results, "total + Hdcp", threeFunds);
      expect(prizes).toHaveLength(4);
      expect(prizes[0]).toBe(100);
      prizes.slice(1).forEach((prize) => expect(prize).toBeCloseTo(80 / 3, 10));
    });

    it("splits all the prize money across every result when all are tied", () => {
      const results = buildResults();
      results.forEach((r) => {
        r["total + Hdcp"] = 1400;
      });

      // (212 + 120) / 8 = 41.5 each
      const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
      expect(prizes).toHaveLength(players.length);
      prizes.forEach((prize) => expect(prize).toBe(41.5));
    });

    it("only treats neighbouring results as tied", () => {
      // p8 and p3 have the same total, but p1 is between them
      const results = buildResults();
      setValue(results, 3, 1666);
      const notNeighbours = reorder(results, 8, 1, 3, 4, 2, 6, 5, 7);

      expect(calcPrizes(notNeighbours, "total + Hdcp", justDivPfs)).toEqual([
        212, 120,
      ]);
    });
  });

  describe("propertyName (generic)", () => {
    it("uses the property passed in to find ties", () => {
      // tie on total + Hdcp, but not on total
      const results = buildResults();
      setValue(results, 3, 1666);

      expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
        166, 166,
      ]);
      expect(calcPrizes(results, "total", justDivPfs)).toEqual([212, 120]);
    });

    it("works with scratch results sorted by total", () => {
      expect(calcPrizes(buildResults("total"), "total", justDivPfs)).toEqual([
        212, 120,
      ]);
    });

    it("splits a tie on total", () => {
      const results = buildResults("total");
      setValue(results, 5, 1456, "total"); // player 5 ties player 8 for first

      expect(calcPrizes(results, "total", justDivPfs)).toEqual([166, 166]);
    });

    it("works with any result type", () => {
      const scores = [{ score: 300 }, { score: 279 }, { score: 279 }];
      const funds = [makeDivPf(1, 90), makeDivPf(2, 40), makeDivPf(3, 20)];

      expect(calcPrizes(scores, "score", funds)).toEqual([90, 30, 30]);
    });

    it("compares values with strict equality", () => {
      // "279" and 279 are not tied
      const scores: { score: number | string }[] = [
        { score: 279 },
        { score: "279" },
      ];
      const funds = [makeDivPf(1, 90), makeDivPf(2, 40)];

      expect(calcPrizes(scores, "score", funds)).toEqual([90, 40]);
    });
  });

  describe("prize fund types", () => {
    it("accepts pot prize funds", () => {
      const results = buildResults();
      setValue(results, 3, 1666);
      const potPfs = [makePotPf(1, 50), makePotPf(2, 20)];

      expect(calcPrizes(results, "total + Hdcp", potPfs)).toEqual([35, 35]);
    });

    it("accepts eliminator prize funds", () => {
      const elimPfs = [makeElimPf(1, 25), makeElimPf(2, 10)];

      expect(calcPrizes(buildResults(), "total + Hdcp", elimPfs)).toEqual([
        25, 10,
      ]);
    });
  });

  describe("prize fund amounts", () => {
    it("treats a null amount as 0", () => {
      expect(
        calcPrizes(buildResults(), "total + Hdcp", [makeDivPf(1, null)])
      ).toEqual([0]);
    });

    it("treats an undefined amount as 0", () => {
      const noAmount = {
        id: "dpf_1",
        div_id: scratchDiv.id,
        position: 1,
        amount: undefined,
      } as unknown as divPfType;

      expect(calcPrizes(buildResults(), "total + Hdcp", [noAmount])).toEqual([
        0,
      ]);
    });

    it("treats a missing amount as 0 when splitting a tie", () => {
      const results = buildResults();
      setValue(results, 3, 1666);
      const funds = [makeDivPf(1, 100), makeDivPf(2, null)];

      expect(calcPrizes(results, "total + Hdcp", funds)).toEqual([50, 50]);
    });
  });

  describe("input order and immutability", () => {
    it("does not sort the prize funds, it uses them in the order given", () => {
      // sorting by position is the caller's job
      const reversed = [...justDivPfs].reverse();

      expect(calcPrizes(buildResults(), "total + Hdcp", reversed)).toEqual([
        120, 212,
      ]);
    });

    it("does not modify the arrays or results passed in", () => {
      const results = buildResults();
      const funds = [...justDivPfs];
      const resultsBefore = JSON.stringify(results);
      const fundsBefore = JSON.stringify(funds);

      calcPrizes(results, "total + Hdcp", funds);

      expect(JSON.stringify(results)).toBe(resultsBefore);
      expect(JSON.stringify(funds)).toBe(fundsBefore);
    });
  });
});

// import { calcPrizes } from "@/lib/results/calcResults";
// import type {
//   divPfType,
//   elimPfType,
//   playerType,
//   potPfType,
// } from "@/lib/types/types";
// import {
//   mockTmntFullData,
//   mockGames,
//   mockDivPfs,
//   potId1,
//   elimId1,
// } from "../../mocks/tmnts/tmntFullData/mockTmntFullData";

// /********************************************/
// /* fixtures built from mockTmntFullData     */
// /********************************************/
// const { players, squads } = mockTmntFullData;
// const [scratchDiv, hdcpDiv] = mockTmntFullData.divs;
// // mock scratch division pays 212 for first and 120 for second
// const justDivPfs: divPfType[] = mockDivPfs.filter(
//   (pf) => pf.div_id === scratchDiv.id
// );

// // number of games for the squad the player bowled in
// const numGamesFor = (p: playerType): number =>
//   squads.find((s) => s.id === p.squad_id)?.games ?? 0;

// // just the fields calcPrizes needs; calcPrizes is generic over T
// type PlayerResult = {
//   player_id: string;
//   full_name: string;
//   total: number;
//   "total + Hdcp": number;
// };
// type SortKey = "total" | "total + Hdcp";

// // player number (1-8) -> player id from the mock
// const pid = (n: number) => players[n - 1].id;
// const order = (...nums: number[]) => nums.map(pid);

// const scoresFor = (playerId: string): number[] =>
//   mockGames
//     .filter((g) => g.player_id === playerId)
//     .sort((a, b) => a.game_num - b.game_num)
//     .map((g) => g.score);

// // handicap per game for the mock handicap division
// const hdcpPerGame = (average: number) =>
//   Math.floor(hdcpDiv.hdcp_per * (hdcpDiv.hdcp_from - average));

// const buildResult = (p: playerType): PlayerResult => {
//   const scores = scoresFor(p.id);
//   const total = scores.reduce((sum, s) => sum + s, 0);
//   const totalHdcp = hdcpPerGame(p.average) * scores.length;
//   return {
//     player_id: p.id,
//     full_name: `${p.first_name} ${p.last_name}`,
//     total,
//     "total + Hdcp": total + totalHdcp,
//   };
// };

// // sorted by key, highest first, like the SQL result
// const buildResults = (key: SortKey = "total + Hdcp"): PlayerResult[] =>
//   players.map((p) => buildResult(p)).sort((a, b) => b[key] - a[key]);

// // total + Hdcp: p8 1666, p3 1463, p4 1398, p2 1394, p6 1382, p5 1360, p7 1349, p1 1279
// const HDCP_ORDER = order(8, 3, 4, 2, 6, 5, 7, 1);
// // total (scratch): p8 1456, p5 1312, p3 1301, p2 1286, p6 1280, p1 1225, p7 1193, p4 1182
// const SCRATCH_ORDER = order(8, 5, 3, 2, 6, 1, 7, 4);

// const getResult = (results: PlayerResult[], playerNum: number) =>
//   results.find((r) => r.player_id === pid(playerNum)) as PlayerResult;

// // the same results, in the order of the player numbers given
// const reorder = (results: PlayerResult[], ...nums: number[]) =>
//   nums.map((n) => getResult(results, n));

// // overwrite one result's value, e.g. to create a tie
// const setValue = (
//   results: PlayerResult[],
//   playerNum: number,
//   value: number,
//   key: SortKey = "total + Hdcp"
// ) => {
//   getResult(results, playerNum)[key] = value;
// };

// const makeDivPf = (position: number, amount: number | null): divPfType => ({
//   id: `dpf_${position}`,
//   div_id: scratchDiv.id,
//   position,
//   amount,
// });

// const makePotPf = (position: number, amount: number): potPfType => ({
//   id: `ppf_${position}`,
//   pot_id: potId1,
//   position,
//   amount,
// });

// const makeElimPf = (position: number, amount: number): elimPfType => ({
//   id: `epf_${position}`,
//   elim_id: elimId1,
//   position,
//   amount,
// });

// describe("calcPrizes", () => {
//   describe("fixture sanity check", () => {
//     it("every mock player has one score per squad game, none above 300", () => {
//       players.forEach((p) => {
//         const numGames = numGamesFor(p);
//         expect(numGames).toBeGreaterThan(0);

//         const scores = scoresFor(p.id);
//         expect(scores).toHaveLength(numGames);
//         scores.forEach((s) => expect(s).toBeLessThanOrEqual(300));
//       });
//     });

//     it("builds the expected order by total + Hdcp", () => {
//       expect(buildResults().map((r) => r.player_id)).toEqual(HDCP_ORDER);
//     });

//     it("builds the expected order by total", () => {
//       expect(buildResults("total").map((r) => r.player_id)).toEqual(
//         SCRATCH_ORDER
//       );
//     });

//     it("the mock scratch prize funds are position 1 = 212 and position 2 = 120", () => {
//       expect(justDivPfs.map((pf) => [pf.position, pf.amount])).toEqual([
//         [1, 212],
//         [2, 120],
//       ]);
//     });
//   });

//   describe("empty input", () => {
//     it("returns an empty array when there are no results", () => {
//       expect(calcPrizes<PlayerResult>([], "total + Hdcp", justDivPfs)).toEqual(
//         []
//       );
//     });

//     it("returns an empty array when there are no prize funds", () => {
//       expect(calcPrizes(buildResults(), "total + Hdcp", [])).toEqual([]);
//     });
//   });

//   describe("return values", () => {
//     it("returns numbers, not formatted strings", () => {
//       const prizes = calcPrizes(buildResults(), "total + Hdcp", justDivPfs);

//       prizes.forEach((prize) => expect(typeof prize).toBe("number"));
//     });

//     it("returns an unrounded value for an uneven split", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666);
//       setValue(results, 4, 1666); // three-way tie for first

//       // (212 + 120) / 3 = 110.666..., rounding is the caller's job
//       const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
//       expect(prizes).toHaveLength(3);
//       prizes.forEach((prize) => expect(prize).toBeCloseTo(332 / 3, 10));
//     });

//     it("the split prizes add up to the prize money paid out", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666);
//       setValue(results, 4, 1666);

//       const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
//       const paid = prizes.reduce((sum, p) => sum + p, 0);
//       expect(paid).toBeCloseTo(212 + 120, 10);
//     });
//   });

//   describe("no ties", () => {
//     it("pays each prize position once, in order", () => {
//       expect(calcPrizes(buildResults(), "total + Hdcp", justDivPfs)).toEqual([
//         212, 120,
//       ]);
//     });

//     it("returns only as many prizes as there are paid places", () => {
//       // 8 results, 2 prize funds: the caller fills in the unpaid rows
//       const prizes = calcPrizes(buildResults(), "total + Hdcp", justDivPfs);
//       expect(prizes).toHaveLength(justDivPfs.length);
//     });

//     it("pays every result when there are as many funds as results", () => {
//       const results = buildResults().slice(0, 3);
//       const funds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 25)];

//       expect(calcPrizes(results, "total + Hdcp", funds)).toEqual([100, 50, 25]);
//     });

//     it("does not throw when there are fewer results than prize funds", () => {
//       const twoResults = buildResults().slice(0, 2);
//       const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 25)];

//       expect(() =>
//         calcPrizes(twoResults, "total + Hdcp", threeFunds)
//       ).not.toThrow();
//       expect(calcPrizes(twoResults, "total + Hdcp", threeFunds)).toEqual([
//         100, 50,
//       ]);
//     });

//     it("pays a single result the first prize", () => {
//       const oneResult = buildResults().slice(0, 1);

//       expect(calcPrizes(oneResult, "total + Hdcp", justDivPfs)).toEqual([212]);
//     });
//   });

//   describe("ties", () => {
//     it("splits the combined prize for a tie for first", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666); // player 3 ties player 8 for first

//       // (212 + 120) / 2 = 166 each
//       expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
//         166, 166,
//       ]);
//     });

//     it("only splits prize money that exists when a tie runs past the last paid place", () => {
//       const results = buildResults();
//       setValue(results, 4, 1463); // player 4 ties player 3 for second

//       // only the second prize (120) exists: 120 / 2 = 60 each
//       expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
//         212, 60, 60,
//       ]);
//     });

//     it("splits a tie that is exactly covered by prize funds", () => {
//       const results = buildResults();
//       setValue(results, 4, 1463); // tie for second
//       const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 30)];

//       // (50 + 30) / 2 = 40 each
//       expect(calcPrizes(results, "total + Hdcp", threeFunds)).toEqual([
//         100, 40, 40,
//       ]);
//     });

//     it("pays the place after a tie at the next unused prize position", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666); // tie for first
//       const fourFunds = [
//         makeDivPf(1, 100),
//         makeDivPf(2, 60),
//         makeDivPf(3, 30),
//         makeDivPf(4, 10),
//       ];

//       // first two split 100 + 60 = 80 each, the next two get the 3rd and 4th prizes
//       expect(calcPrizes(results, "total + Hdcp", fourFunds)).toEqual([
//         80, 80, 30, 10,
//       ]);
//     });

//     it("handles a three-way tie for second", () => {
//       const results = buildResults();
//       setValue(results, 4, 1463);
//       setValue(results, 2, 1463); // players 3, 4 and 2 tied for second
//       const threeFunds = [makeDivPf(1, 100), makeDivPf(2, 50), makeDivPf(3, 30)];

//       // (50 + 30) / 3, no fourth prize to include
//       const prizes = calcPrizes(results, "total + Hdcp", threeFunds);
//       expect(prizes).toHaveLength(4);
//       expect(prizes[0]).toBe(100);
//       prizes.slice(1).forEach((prize) => expect(prize).toBeCloseTo(80 / 3, 10));
//     });

//     it("splits all the prize money across every result when all are tied", () => {
//       const results = buildResults();
//       results.forEach((r) => {
//         r["total + Hdcp"] = 1400;
//       });

//       // (212 + 120) / 8 = 41.5 each
//       const prizes = calcPrizes(results, "total + Hdcp", justDivPfs);
//       expect(prizes).toHaveLength(players.length);
//       prizes.forEach((prize) => expect(prize).toBe(41.5));
//     });

//     it("only treats neighbouring results as tied", () => {
//       // p8 and p3 have the same total, but p1 is between them
//       const results = buildResults();
//       setValue(results, 3, 1666);
//       const notNeighbours = reorder(results, 8, 1, 3, 4, 2, 6, 5, 7);

//       expect(calcPrizes(notNeighbours, "total + Hdcp", justDivPfs)).toEqual([
//         212, 120,
//       ]);
//     });
//   });

//   describe("propertyName (generic)", () => {
//     it("uses the property passed in to find ties", () => {
//       // tie on total + Hdcp, but not on total
//       const results = buildResults();
//       setValue(results, 3, 1666);

//       expect(calcPrizes(results, "total + Hdcp", justDivPfs)).toEqual([
//         166, 166,
//       ]);
//       expect(calcPrizes(results, "total", justDivPfs)).toEqual([212, 120]);
//     });

//     it("works with scratch results sorted by total", () => {
//       expect(calcPrizes(buildResults("total"), "total", justDivPfs)).toEqual([
//         212, 120,
//       ]);
//     });

//     it("splits a tie on total", () => {
//       const results = buildResults("total");
//       setValue(results, 5, 1456, "total"); // player 5 ties player 8 for first

//       expect(calcPrizes(results, "total", justDivPfs)).toEqual([166, 166]);
//     });

//     it("works with any result type", () => {
//       const scores = [{ score: 300 }, { score: 279 }, { score: 279 }];
//       const funds = [makeDivPf(1, 90), makeDivPf(2, 40), makeDivPf(3, 20)];

//       expect(calcPrizes(scores, "score", funds)).toEqual([90, 30, 30]);
//     });

//     it("compares values with strict equality", () => {
//       // "279" and 279 are not tied
//       const scores: { score: number | string }[] = [
//         { score: 279 },
//         { score: "279" },
//       ];
//       const funds = [makeDivPf(1, 90), makeDivPf(2, 40)];

//       expect(calcPrizes(scores, "score", funds)).toEqual([90, 40]);
//     });
//   });

//   describe("prize fund types", () => {
//     it("accepts pot prize funds", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666);
//       const potPfs = [makePotPf(1, 50), makePotPf(2, 20)];

//       expect(calcPrizes(results, "total + Hdcp", potPfs)).toEqual([35, 35]);
//     });

//     it("accepts eliminator prize funds", () => {
//       const elimPfs = [makeElimPf(1, 25), makeElimPf(2, 10)];

//       expect(calcPrizes(buildResults(), "total + Hdcp", elimPfs)).toEqual([
//         25, 10,
//       ]);
//     });
//   });

//   describe("prize fund amounts", () => {
//     it("treats a null amount as 0", () => {
//       expect(
//         calcPrizes(buildResults(), "total + Hdcp", [makeDivPf(1, null)])
//       ).toEqual([0]);
//     });

//     it("treats an undefined amount as 0", () => {
//       const noAmount = {
//         id: "dpf_1",
//         div_id: scratchDiv.id,
//         position: 1,
//         amount: undefined,
//       } as unknown as divPfType;

//       expect(calcPrizes(buildResults(), "total + Hdcp", [noAmount])).toEqual([
//         0,
//       ]);
//     });

//     it("treats a missing amount as 0 when splitting a tie", () => {
//       const results = buildResults();
//       setValue(results, 3, 1666);
//       const funds = [makeDivPf(1, 100), makeDivPf(2, null)];

//       expect(calcPrizes(results, "total + Hdcp", funds)).toEqual([50, 50]);
//     });
//   });

//   describe("input order and immutability", () => {
//     it("does not sort the prize funds, it uses them in the order given", () => {
//       // sorting by position is the caller's job
//       const reversed = [...justDivPfs].reverse();

//       expect(calcPrizes(buildResults(), "total + Hdcp", reversed)).toEqual([
//         120, 212,
//       ]);
//     });

//     it("does not modify the arrays or results passed in", () => {
//       const results = buildResults();
//       const funds = [...justDivPfs];
//       const resultsBefore = JSON.stringify(results);
//       const fundsBefore = JSON.stringify(funds);

//       calcPrizes(results, "total + Hdcp", funds);

//       expect(JSON.stringify(results)).toBe(resultsBefore);
//       expect(JSON.stringify(funds)).toBe(fundsBefore);
//     });
//   });
// });