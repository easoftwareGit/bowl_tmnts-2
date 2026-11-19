// test/app/components/brackets/bracketClass.playerEarnings.test.tsx
// tests for src/components/brackets/bracketClass.ts
//
// playerEarnings rounds every share DOWN to the cent (truncateToTwoDecimals).
// The cent(s) left over from an uneven split go to expenses, so the balance
// sheet balances: 35 / 3 -> 11.66 each, 34.98 paid out, 0.02 to expenses.
import { Bracket } from "@/components/brackets/bracketClass";
import {
  BracketList,
  brktListInitialDataType,
} from "@/components/brackets/bracketListClass";
import {
  brktId1,
  byeId,
  divId1,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId4,
  playerId6,
  playerId8,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

// an array item that must be there; throws instead of returning undefined
const getAt = <T,>(items: readonly T[], index: number): T => {
  const item = items[index];
  if (item === undefined) {
    throw new Error(`No item at index ${String(index)}`);
  }
  return item;
};

// adds amounts in whole cents, so the test's own sums have no float noise
const sumCents = (amounts: number[]): number =>
  amounts.reduce((cents, amount) => cents + Math.round(amount * 100), 0) / 100;

describe("Bracket.playerEarnings", () => {
  let brktList: BracketList;
  let bracket: Bracket;
  let bracketFee: number;

  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    squad_id: squadId1,
    first_name: "Bye",
    average: 0,
  };

  beforeEach(() => {
    const initData: brktListInitialDataType = {
      tmntFullData: cloneDeep(mockTmntFullData),
      divId: divId1,
    };

    brktList = new BracketList(
      brktId1,
      2,
      3,
      [1, 2, 3],
      byePlayer,
      initData,
    );

    bracket = getAt(brktList.brackets, 0);
    const brkt = brktList.brkt;
    if (!brkt) {
      throw new Error("Bracket definition was not found for the test list.");
    }
    bracketFee = Number(brkt.fee);

    // Each test supplies its own final placements.
    bracket.winnerIds.clear();
    bracket.runnerUpIds.clear();
  });

  describe("fixture sanity check", () => {
    it("uses the mock bracket's $5 fee, so first is $25 and second is $10", () => {
      expect(bracketFee).toBe(5);
      expect(bracket.winnerAmount).toBe(25);
      expect(bracket.runnerUpAmount).toBe(10);
    });
  });

  describe("players without a prize", () => {
    it("returns 0 when the player is not in the bracket", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      expect(bracket.playerEarnings("ply_not_in_bracket")).toBe(0);
    });

    it("returns 0 before final placements are determined", () => {
      expect(bracket.playerEarnings(playerId2)).toBe(0);
      expect(bracket.playerEarnings(playerId8)).toBe(0);
    });

    it("returns 0 for players who lost in games 1 and 2", () => {
      bracket.loserBrktGame1Ids.add(playerId1);
      bracket.loserBrktGame2Ids.add(playerId4);
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      expect(bracket.playerEarnings(playerId1)).toBe(0);
      expect(bracket.playerEarnings(playerId4)).toBe(0);
    });
  });

  describe("separate winner and runner-up prizes", () => {
    it("returns the full winner prize for one winner", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      // Without a bye, the winner receives five entry fees.
      expect(bracket.winnerAmount).toBe(bracketFee * 5);
      expect(bracket.playerEarnings(playerId8)).toBe(bracketFee * 5);
    });

    it("returns the full runner-up prize for one runner-up", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      // The runner-up receives two entry fees.
      expect(bracket.runnerUpAmount).toBe(bracketFee * 2);
      expect(bracket.playerEarnings(playerId2)).toBe(bracketFee * 2);
    });

    it("divides the winner prize equally among multiple winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.runnerUpIds.add(playerId8);

      // $25 / 2 splits evenly
      expect(bracket.playerEarnings(playerId2)).toBe(12.5);
      expect(bracket.playerEarnings(playerId4)).toBe(12.5);

      // The runner-up prize remains separate.
      expect(bracket.playerEarnings(playerId8)).toBe(bracketFee * 2);
    });

    it("rounds the winner prize down when three winners share it", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId6);
      bracket.runnerUpIds.add(playerId8);

      // $25 / 3 = 8.333... -> 8.33 each; 0.01 goes to expenses
      expect(bracket.playerEarnings(playerId2)).toBe(8.33);
      expect(bracket.playerEarnings(playerId4)).toBe(8.33);
      expect(bracket.playerEarnings(playerId6)).toBe(8.33);
      expect(bracket.playerEarnings(playerId8)).toBe(10);
    });

    it("divides the runner-up prize equally among multiple runners-up", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);
      bracket.runnerUpIds.add(playerId4);

      // $10 / 2 splits evenly
      expect(bracket.playerEarnings(playerId2)).toBe(5);
      expect(bracket.playerEarnings(playerId4)).toBe(5);

      // The winner still receives the full winner prize.
      expect(bracket.playerEarnings(playerId8)).toBe(bracketFee * 5);
    });

    it("rounds the runner-up prize down when three runners-up share it", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);
      bracket.runnerUpIds.add(playerId4);
      bracket.runnerUpIds.add(playerId6);

      // $10 / 3 = 3.333... -> 3.33 each; 0.01 goes to expenses
      expect(bracket.playerEarnings(playerId2)).toBe(3.33);
      expect(bracket.playerEarnings(playerId4)).toBe(3.33);
      expect(bracket.playerEarnings(playerId6)).toBe(3.33);
      expect(bracket.playerEarnings(playerId8)).toBe(25);
    });
  });

  describe("combined prizes when there are no runners-up", () => {
    it("returns both prizes to a single winner", () => {
      bracket.winnerIds.add(playerId8);

      expect(bracket.playerEarnings(playerId8)).toBe(bracketFee * 7);
    });

    it("divides both prizes equally between two tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId8);

      // $35 / 2 splits evenly
      expect(bracket.playerEarnings(playerId2)).toBe(17.5);
      expect(bracket.playerEarnings(playerId8)).toBe(17.5);
    });

    it("rounds both prizes down when three tied winners share them", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId8);

      // $35 / 3 = 11.666... -> 11.66 each (rounded down, not up to 11.67)
      expect(bracket.playerEarnings(playerId2)).toBe(11.66);
      expect(bracket.playerEarnings(playerId4)).toBe(11.66);
      expect(bracket.playerEarnings(playerId8)).toBe(11.66);
    });

    it("pays out 2 cents less than the prizes when three winners tie; the rest goes to expenses", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId8);

      const paid = sumCents([
        bracket.playerEarnings(playerId2),
        bracket.playerEarnings(playerId4),
        bracket.playerEarnings(playerId8),
      ]);
      const prizes = bracket.winnerAmount + bracket.runnerUpAmount;

      expect(paid).toBe(34.98);
      expect(sumCents([prizes, -paid])).toBe(0.02);
    });

    it("returns a share with at most two decimals", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId8);

      const share = bracket.playerEarnings(playerId2);
      expect(share.toString()).toBe("11.66");
    });

    it("divides both prizes evenly among four tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId6);
      bracket.winnerIds.add(playerId8);

      // $35 / 4 = 8.75, no rounding needed
      expect(bracket.playerEarnings(playerId2)).toBe(8.75);
      expect(bracket.playerEarnings(playerId8)).toBe(8.75);
    });
  });

  describe("brackets with a bye player", () => {
    beforeEach(() => {
      // Replace player 1 with a bye, retaining eight bracket positions.
      const playerIndex = bracket.players.indexOf(playerId1);

      if (playerIndex === -1) {
        throw new Error("Player 1 was not found in the test bracket.");
      }

      bracket.players[playerIndex] = byeId;

      // The parent setter recalculates prizes after adding the bye.
      bracket.parent = brktList;
    });

    it("uses the reduced winner prize and the unchanged runner-up prize", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      // Seven paying players: four fees to the winner,
      // two to the runner-up, and one for administration.
      expect(bracket.winnerAmount).toBe(bracketFee * 4);
      expect(bracket.runnerUpAmount).toBe(bracketFee * 2);

      expect(bracket.playerEarnings(playerId8)).toBe(bracketFee * 4);
      expect(bracket.playerEarnings(playerId2)).toBe(bracketFee * 2);
    });

    it("divides the reduced combined prizes between tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId8);

      // $30 / 2 splits evenly
      expect(bracket.playerEarnings(playerId2)).toBe(15);
      expect(bracket.playerEarnings(playerId8)).toBe(15);
    });

    it("rounds the reduced winner prize down when three winners share it", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId6);
      bracket.runnerUpIds.add(playerId8);

      // $20 / 3 = 6.666... -> 6.66 each
      expect(bracket.playerEarnings(playerId2)).toBe(6.66);
      expect(bracket.playerEarnings(playerId6)).toBe(6.66);
      expect(bracket.playerEarnings(playerId8)).toBe(10);
    });
  });
});
