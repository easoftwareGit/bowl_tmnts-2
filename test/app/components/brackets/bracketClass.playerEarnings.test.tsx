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
  playerId8,
  squadId1,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import type { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { cloneDeep } from "lodash";

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

    bracket = brktList.brackets[0];
    bracketFee = Number(brktList!.brkt!.fee);

    // Each test supplies its own final placements.
    bracket.winnerIds.clear();
    bracket.runnerUpIds.clear();
  });

  describe("players without a prize", () => {
    it("returns 0 when the player is not in the bracket", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      expect(
        bracket.playerEarnings("ply_not_in_bracket"),
      ).toBe(0);
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
      expect(bracket.playerEarnings(playerId8)).toBe(
        bracketFee * 5,
      );
    });

    it("returns the full runner-up prize for one runner-up", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);

      // The runner-up receives two entry fees.
      expect(bracket.runnerUpAmount).toBe(bracketFee * 2);
      expect(bracket.playerEarnings(playerId2)).toBe(
        bracketFee * 2,
      );
    });

    it("divides the winner prize equally among multiple winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.runnerUpIds.add(playerId8);

      const expectedWinnerEarnings = (bracketFee * 5) / 2;

      expect(bracket.playerEarnings(playerId2)).toBe(
        expectedWinnerEarnings,
      );
      expect(bracket.playerEarnings(playerId4)).toBe(
        expectedWinnerEarnings,
      );

      // The runner-up prize remains separate.
      expect(bracket.playerEarnings(playerId8)).toBe(
        bracketFee * 2,
      );
    });

    it("divides the runner-up prize equally among multiple runners-up", () => {
      bracket.winnerIds.add(playerId8);
      bracket.runnerUpIds.add(playerId2);
      bracket.runnerUpIds.add(playerId4);

      const expectedRunnerUpEarnings = (bracketFee * 2) / 2;

      expect(bracket.playerEarnings(playerId2)).toBe(
        expectedRunnerUpEarnings,
      );
      expect(bracket.playerEarnings(playerId4)).toBe(
        expectedRunnerUpEarnings,
      );

      // The winner still receives the full winner prize.
      expect(bracket.playerEarnings(playerId8)).toBe(
        bracketFee * 5,
      );
    });
  });

  describe("combined prizes when there are no runners-up", () => {
    it("returns both prizes to a single winner", () => {
      bracket.winnerIds.add(playerId8);

      expect(bracket.playerEarnings(playerId8)).toBe(
        bracketFee * 7,
      );
    });

    it("divides both prizes equally between two tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId8);

      const expectedEarnings = (bracketFee * 7) / 2;

      expect(bracket.playerEarnings(playerId2)).toBe(
        expectedEarnings,
      );
      expect(bracket.playerEarnings(playerId8)).toBe(
        expectedEarnings,
      );
    });

    it("divides both prizes among three tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId4);
      bracket.winnerIds.add(playerId8);

      const expectedEarnings = (bracketFee * 7) / 3;

      // Splitting among three players can produce fractional cents.
      expect(bracket.playerEarnings(playerId2)).toBeCloseTo(
        expectedEarnings,
        10,
      );
      expect(bracket.playerEarnings(playerId4)).toBeCloseTo(
        expectedEarnings,
        10,
      );
      expect(bracket.playerEarnings(playerId8)).toBeCloseTo(
        expectedEarnings,
        10,
      );
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

      expect(bracket.playerEarnings(playerId8)).toBe(
        bracketFee * 4,
      );
      expect(bracket.playerEarnings(playerId2)).toBe(
        bracketFee * 2,
      );
    });

    it("divides the reduced combined prizes between tied winners", () => {
      bracket.winnerIds.add(playerId2);
      bracket.winnerIds.add(playerId8);

      const expectedEarnings = (bracketFee * 6) / 2;

      expect(bracket.playerEarnings(playerId2)).toBe(
        expectedEarnings,
      );
      expect(bracket.playerEarnings(playerId8)).toBe(
        expectedEarnings,
      );
    });
  });
});