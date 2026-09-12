import { Bracket } from "@/components/brackets/bracketClass";
import { isOdd } from "@/lib/validation/validation";
import {
  defaultBrktGames,
  defaultPlayersPerMatch,  
} from "@/lib/db/initVals";
import { BracketList } from "@/components/brackets/bracketListClass";
import {
  brktId1,  
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe("BracketClass - randomize", () => {
  const quarterFullPlayers = [
    "player-1",
    "player-2",
  ];

  const halfFullPlayers = [
    "player-1",
    "player-2",
    "player-3",
    "player-4",
  ];

  const fullPlayers = [
    "player-1",
    "player-2",
    "player-3",
    "player-4",
    "player-5",
    "player-6",
    "player-7",
    "player-8",
  ];

  const addPlayersToBracket = (
    bracket: Bracket,
    players: string[],
  ): void => {
    if (
      players.length > 0 &&
      players.length % 2 === 0
    ) {
      for (let i = 0; i < players.length; i += 2) {
        bracket.addMatch([
          players[i],
          players[i + 1],
        ]);
      }
    }
  };

  describe("constructor", () => {
    it("should initialize with an empty players array", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.players).toEqual([]);
    });

    it("should use the supplied bracket id", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.id).toBe(brktId1);
    });

    it("should create an id when no id is supplied", () => {
      const bracket = new Bracket();

      expect(bracket.id).toBeTruthy();
      expect(bracket.id.startsWith("obk_")).toBe(true);
    });

    it("should return the correct number of games", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.games).toBe(defaultBrktGames);
    });

    it("should return the correct number of players per match", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.playersPerMatch).toBe(defaultPlayersPerMatch);
    });

    it("should return the correct number of players per bracket", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.playersPerBracket).toBe(
        defaultPlayersPerMatch ** defaultBrktGames,
      );
    });

    it("should create a BracketMatch", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.match).toBeDefined();
    });

    it("should use custom players per match and games", () => {
      const playersPerMatch = 3;
      const games = 2;

      const bracket = new Bracket(
        brktId1,
        playersPerMatch,
        games,
      );

      expect(bracket.playersPerMatch).toBe(playersPerMatch);
      expect(bracket.games).toBe(games);
      expect(bracket.playersPerBracket).toBe(playersPerMatch ** games);
    });

    it("should not be full when constructed", () => {
      const bracket = new Bracket();

      expect(bracket.isFull).toBe(false);
    });
  });

  describe("parent", () => {
    it("should initially have an undefined parent", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.parent).toBeUndefined();
    });

    it("should set the parent BracketList", () => {
      const bracket = new Bracket(brktId1);

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );

      bracket.parent = bracketList;

      expect(bracket.parent).toBe(bracketList);
    });

    it("should allow the parent to be cleared", () => {
      const bracket = new Bracket(brktId1);

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );

      bracket.parent = bracketList;

      expect(bracket.parent).toBe(bracketList);

      bracket.parent = undefined;

      expect(bracket.parent).toBeUndefined();
    });
  });

  describe("isFull", () => {
    it("should return false when the bracket is empty", () => {
      const bracket = new Bracket();

      expect(bracket.isFull).toBe(false);
    });

    it("should return false when the bracket is partially full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      expect(bracket.isFull).toBe(false);
    });

    it("should return true when the bracket is full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        fullPlayers,
      );

      expect(bracket.isFull).toBe(true);
    });
  });

  describe("addMatch", () => {
    it("should add a match to the bracket", () => {
      const bracket = new Bracket();

      const result = bracket.addMatch([
        "player-1",
        "player-2",
      ]);

      expect(result).toBe(2);
      expect(bracket.players).toEqual([
        "player-1",
        "player-2",
      ]);
    });

    it("should return errInvalidMatch for an invalid match length", () => {
      const bracket = new Bracket();

      const result = bracket.addMatch([
        "player-1",
        "player-2",
        "player-3",
      ]);

      expect(result).toBe(Bracket.errInvalidMatch);
      expect(bracket.players).toEqual([]);
    });

    it("should return errInvalidPlayerId for an empty match", () => {
      const bracket = new Bracket();

      const result = bracket.addMatch([]);

      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players).toEqual([]);
    });

    it("should return errInvalidPlayerId for a null match", () => {
      const bracket = new Bracket();

      const result = bracket.addMatch(null as any);

      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players).toEqual([]);
    });

    it("should return errBracketIsFull when the bracket is full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        fullPlayers,
      );

      const playersBeforeAdd = [...bracket.players];

      const result = bracket.addMatch([
        "player-9",
        "player-10",
      ]);

      expect(result).toBe(Bracket.errBracketIsFull);
      expect(bracket.players).toEqual(playersBeforeAdd);
    });

    it("should return errAlreadyInBracket when the first player is already in the bracket", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      const playersBeforeAdd = [...bracket.players];

      const result = bracket.addMatch([
        "player-1",
        "player-5",
      ]);

      expect(result).toBe(Bracket.errAlreadyInBracket);
      expect(bracket.players).toEqual(playersBeforeAdd);
    });

    it("should return errAlreadyInBracket when the second player is already in the bracket", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      const playersBeforeAdd = [...bracket.players];

      const result = bracket.addMatch([
        "player-5",
        "player-2",
      ]);

      expect(result).toBe(Bracket.errAlreadyInBracket);
      expect(bracket.players).toEqual(playersBeforeAdd);
    });

    it("should return errAlreadyInBracket when both players are already in the bracket", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      const playersBeforeAdd = [...bracket.players];

      const result = bracket.addMatch([
        "player-1",
        "player-2",
      ]);

      expect(result).toBe(Bracket.errAlreadyInBracket);
      expect(bracket.players).toEqual(playersBeforeAdd);
    });
  });

  describe("clearPlayers", () => {
    it("should clear all players", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      expect(bracket.players).toHaveLength(4);

      bracket.clearPlayers();

      expect(bracket.players).toEqual([]);
      expect(bracket.isFull).toBe(false);
    });
  });

  describe("emptySpots", () => {
    it("should return the total bracket size when empty", () => {
      const bracket = new Bracket();

      expect(bracket.emptySpots()).toBe(
        bracket.playersPerBracket,
      );
    });

    it("should return the correct number of empty spots when partially full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        quarterFullPlayers,
      );

      expect(bracket.emptySpots()).toBe(6);
    });

    it("should return 0 when the bracket is full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        fullPlayers,
      );

      expect(bracket.emptySpots()).toBe(0);
    });
  });

  describe("hasByePlayer", () => {
    it("should return false when the bracket has no bye player", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        halfFullPlayers,
      );

      expect(bracket.hasByePlayer()).toBe(false);
    });

    it("should return true when the bracket has a bye player", () => {
      const bracket = new Bracket();

      addPlayersToBracket(
        bracket,
        [
          "player-1",
          "player-2",
          "player-3",
          Bracket.byePlayerId,
        ],
      );

      expect(bracket.hasByePlayer()).toBe(true);
    });
  });

  describe("numEmptySpots", () => {
    it("should return the total bracket size when empty", () => {
      const bracket = new Bracket();

      expect(bracket.numEmptySpots()).toBe(
        bracket.playersPerBracket,
      );
    });

    it("should return the correct number when the bracket is partially full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, quarterFullPlayers);

      expect(bracket.numEmptySpots()).toBe(6);
    });

    it("should return 0 when the bracket is full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, fullPlayers);

      expect(bracket.numEmptySpots()).toBe(0);
    });
  });

  describe("shuffle", () => {
    it("should keep all players in the bracket after shuffling", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, fullPlayers);

      bracket.shuffle();

      expect(bracket.players).toHaveLength(fullPlayers.length);

      expect(
        [...bracket.players].sort(),
      ).toEqual(
        [...fullPlayers].sort(),
      );
    });

    it("should keep each original match intact after shuffling", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, fullPlayers);

      const originalPlayers = [
        ...bracket.players,
      ];

      bracket.shuffle();

      for (
        let i = 0;
        i < bracket.players.length;
        i++
      ) {
        const opponentIndex =
          isOdd(i)
            ? i - 1
            : i + 1;

        const playerId = bracket.players[i];

        const originalIndex =
          originalPlayers.indexOf(playerId);

        const originalOpponentIndex =
          isOdd(originalIndex)
            ? originalIndex - 1
            : originalIndex + 1;

        expect(
          bracket.players[opponentIndex],
        ).toBe(
          originalPlayers[originalOpponentIndex],
        );
      }
    });

    it("should remain full after shuffling", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, fullPlayers);

      bracket.shuffle();

      expect(bracket.isFull).toBe(true);
      expect(bracket.emptySpots()).toBe(0);
    });

    it("should not shuffle when the bracket is not full", () => {
      const bracket = new Bracket();

      addPlayersToBracket(bracket, quarterFullPlayers);

      const playersBeforeShuffle = [...bracket.players];

      bracket.shuffle();

      expect(bracket.players).toEqual(playersBeforeShuffle);
    });

    it("should do nothing when the bracket is empty", () => {
      const bracket = new Bracket();

      bracket.shuffle();

      expect(bracket.players).toEqual([]);
    });
  });
});
