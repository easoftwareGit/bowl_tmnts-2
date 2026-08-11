import { Bracket } from "@/components/brackets/bracketClass";
import { BracketMatch } from "@/components/brackets/bracketMatchClass";
import {
  byeId,
  mockGames,
  mockTmntFullData,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { BracketList } from "@/components/brackets/bracketListClass";
import { playerEntryRow, populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { gameType, playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";

describe("BracketMatch", () => {
  let brktList: BracketList;
  let bracket: Bracket;
  let bracketMatch: BracketMatch;
  let testGames: gameType[] = cloneDeep(mockGames); 

  const oneBrkt = mockTmntFullData.oneBrkts[0];
  const div1Entries = mockTmntFullData.divEntries.filter(
    (divEntry) => divEntry.div_id === mockTmntFullData.divs[0].id,
  );

  const brktSeeds = mockTmntFullData.brktSeeds
    .filter((brktSeed) => brktSeed.one_brkt_id === oneBrkt.id)
    .sort((a, b) => a.seed - b.seed);

  const playerIds = brktSeeds.map((brktSeed) => brktSeed.player_id);

  const mockPlayerRows: playerEntryRow[] = populatePlayerRows(mockTmntFullData);
  const brktId = mockTmntFullData.brkts[0].id;

  const addPlayersToBracket = (bracket: Bracket, players: string[]): void => {
    if (players.length > 0 && ((players.length & 2) === 0)) {
      for (let i = 0; i < players.length; i += 2) {
        bracket.addMatch([players[i], players[i + 1]]);
      }
    }
  };  
  
  beforeEach(() => {

    brktList = new BracketList(
      brktId,
      2,
      3,
      [1, 2, 3],
    );
    brktList.addBrktEntries(mockPlayerRows);
    brktList.createGameScoresMap(testGames);
    brktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);

    bracket = new Bracket(mockTmntFullData.brkts[0].id);
    bracket.parent = brktList;

    addPlayersToBracket(bracket, playerIds);    
    expect(bracket.players.length).toBe(8);

    bracketMatch = new BracketMatch(bracket);
  });

  describe("setMatchResult() - no ties", () => {
    it("sets match 0 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(0);

      const matchScores = bracketMatch.getMatchInfo(players, 1);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId1,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId2,
          result: "W",
        }),
      ]);
    });

    it("sets match 1 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(1);

      const matchScores = bracketMatch.getMatchInfo(players, 1);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId3,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId4,
          result: "W",
        }),
      ]);
    });

    it("sets match 2 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(2);

      const matchScores = bracketMatch.getMatchInfo(players, 1);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId5,
          result: "W",
        }),
        expect.objectContaining({
          playerId: playerId6,
          result: "L",
        }),
      ]);
    });

    it("sets match 3 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(3);

      const matchScores = bracketMatch.getMatchInfo(players, 1);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId7,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId8,
          result: "W",
        }),
      ]);
    });

    it("sets match 4 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(4);

      const matchScores = bracketMatch.getMatchInfo(players, 2);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId2,
          result: "W",
        }),
        expect.objectContaining({
          playerId: playerId4,
          result: "L",
        }),
      ]);
    });

    it("sets match 5 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(5);

      const matchScores = bracketMatch.getMatchInfo(players, 2);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId5,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId8,
          result: "W",
        }),
      ]);
    });

    it("sets match 6 winner and loser", () => {
      const players = bracketMatch.getMatchPlayers(6);

      const matchScores = bracketMatch.getMatchInfo(players, 3);

      bracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId2,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId8,
          result: "W",
        }),
      ]);
    });

    it('sets match 3 winner when one player is a bye', () => { 
      const byeBrktTmnt = cloneDeep(mockTmntFullData);      
      // change play 8 entries to byes
      byeBrktTmnt.brktSeeds.forEach((seed) => {
        if (seed.player_id === playerId8) {
          seed.player_id = byeId;
        }
      });
      const byeGames = cloneDeep(mockGames); // player 8 can still have games

      const byePlayer: playerType = {
        ...initPlayer,
        id: byeId,
        first_name: 'Bye',
        average: 0,
      }

      const byeBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
        byePlayer   // add a bye
      );
      byeBrktList.addBrktEntries(mockPlayerRows);
      byeBrktList.createGameScoresMap(byeGames);
      byeBrktList.createPlayersMap(div1Entries, byeBrktTmnt.divs[0]);         
    
      const byeBracket = new Bracket(brktId);
      const byePlayerIds = cloneDeep(playerIds).filter((id) => id !== playerId8);
      byePlayerIds.push(byeId);
      addPlayersToBracket(byeBracket, byePlayerIds);
      byeBracket.parent = byeBrktList;
    
      const byeBracketMatch = new BracketMatch(byeBracket);
      const players = byeBracketMatch.getMatchPlayers(3);

      expect(players).toEqual([
        playerId7,
        byeId,
      ]);

      const matchScores = byeBracketMatch.getMatchInfo(players, 1);

      byeBracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId7,
          result: "W",
        }),
        expect.objectContaining({
          playerId: byeId,
          result: "L",
        }),
      ]);

    })

    it("does not set results when one player is missing a score", () => {            

      // Remove player 2's game 1 score
      const missingAGame = testGames.filter(
        (game) =>
          !(
            game.player_id === playerId2 &&
            game.game_num === 1
          ),
      );
    
      const missingAGameBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );
      missingAGameBrktList.addBrktEntries(mockPlayerRows);
      missingAGameBrktList.createGameScoresMap(missingAGame);
      missingAGameBrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);      
    
      const missingAGameBracket = new Bracket(brktId);
      addPlayersToBracket(missingAGameBracket, playerIds);
      missingAGameBracket.parent = missingAGameBrktList;
    
      const missingAGameBracketMatch = new BracketMatch(missingAGameBracket);

      const players = missingAGameBracketMatch.getMatchPlayers(0);

      expect(players).toEqual([
        playerId1,
        playerId2,
      ]);

      const matchScores = missingAGameBracketMatch.getMatchInfo(players, 1);
      const originalMatchScores = cloneDeep(matchScores);

      expect(matchScores).toHaveLength(2);

      expect(matchScores[0]).toEqual(
        expect.objectContaining({
          playerId: playerId1,
          score: expect.any(Number),
          total: expect.any(Number),
          result: undefined,
        }),
      );

      expect(matchScores[1]).toEqual(
        expect.objectContaining({
          playerId: playerId2,
          score: undefined,
          total: undefined,
          result: undefined,
        }),
      );

      missingAGameBracketMatch.setMatchResult(matchScores);

      expect(matchScores[0].result).toBeUndefined();
      expect(matchScores[1].result).toBeUndefined();
      expect(matchScores).toEqual(originalMatchScores);
    });

    it("should not set any results for no players", () => {
      const players: string[] = [];

      const matchScores = bracketMatch.getMatchInfo(players, 3);
      expect(matchScores).toEqual([]);

      bracketMatch.setMatchResult(matchScores);
      expect(matchScores).toEqual([]);
    });    
  });  

  describe("setMatchResult() - first round match ties", () => {
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;

    const setGameScore = (
      games: typeof mockGames,
      playerId: string,
      gameNum: number,
      score: number,
    ): void => {
      const game = games.find(
        (game) =>
          game.player_id === playerId &&
          game.game_num === gameNum,
      );

      if (game === undefined) {
        throw new Error(
          `Game ${gameNum} not found for player ${playerId}.`,
        );
      }

      game.score = score;
    };

    const createTiesBrktList = (
      games: typeof mockGames,
    ): void => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );

      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(games);
      tiesBrktList.createPlayersMap(
        div1Entries,
        mockTmntFullData.divs[0],
      );
    };

    const createBracketWithTies = (): void => {
      tiesBracket = new Bracket(brktId);
      tiesBracket.parent = tiesBrktList;

      addPlayersToBracket(
        tiesBracket,
        playerIds,
      );
    };

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(tiesBracket);
    };

    const createTieGamesForMatch = (
      matchNumber: 0 | 1 | 2 | 3,
    ): typeof mockGames => {
      const tieGames = cloneDeep(mockGames);

      const matchPlayers =
        bracketMatch.getMatchPlayers(matchNumber);

      const originalMatchScores =
        bracketMatch.getMatchInfo(matchPlayers, 1);

      const firstPlayer = originalMatchScores[0];
      const secondPlayer = originalMatchScores[1];

      if (
        firstPlayer.score === undefined ||
        firstPlayer.total === undefined ||
        secondPlayer.score === undefined ||
        secondPlayer.total === undefined
      ) {
        throw new Error(
          `Match ${matchNumber} does not have completed scores.`,
        );
      }

      /*
      * Adjust the second player's scratch score so that the
      * two handicap totals are equal.
      */
      const tiedSecondPlayerScore =
        secondPlayer.score +
        firstPlayer.total -
        secondPlayer.total;

      setGameScore(
        tieGames,
        secondPlayer.playerId,
        1,
        tiedSecondPlayerScore,
      );

      return tieGames;
    };

    it.each([
      {
        matchNumber: 0 as const,
        expectedPlayers: [playerId1, playerId2],
      },
      {
        matchNumber: 1 as const,
        expectedPlayers: [playerId3, playerId4],
      },
      {
        matchNumber: 2 as const,
        expectedPlayers: [playerId5, playerId6],
      },
      {
        matchNumber: 3 as const,
        expectedPlayers: [playerId7, playerId8],
      },
    ])(
      "sets both players to T when match $matchNumber is tied",
      ({
        matchNumber,
        expectedPlayers,
      }) => {
        const tieGames =
          createTieGamesForMatch(matchNumber);

        createTiesBrktList(tieGames);
        createBracketWithTies();

        const tieBracketMatch =
          createTestBracketMatch();

        const matchPlayers =
          tieBracketMatch.getMatchPlayers(matchNumber);

        expect(matchPlayers).toEqual(expectedPlayers);

        const matchScores =
          tieBracketMatch.getMatchInfo(
            matchPlayers,
            1,
          );

        expect(matchScores).toHaveLength(2);
        expect(matchScores[0].total)
          .toBe(matchScores[1].total);

        tieBracketMatch.setMatchResult(matchScores);

        expect(matchScores).toEqual([
          expect.objectContaining({
            playerId: expectedPlayers[0],
            result: "T",
          }),
          expect.objectContaining({
            playerId: expectedPlayers[1],
            result: "T",
          }),
        ]);
      },
    );
  });

  describe("setMatchResult() - second round match ties", () => {
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;

    const setGameScore = (
      games: typeof mockGames,
      playerId: string,
      gameNum: number,
      score: number,
    ): void => {
      const game = games.find(
        (game) =>
          game.player_id === playerId &&
          game.game_num === gameNum,
      );

      if (game === undefined) {
        throw new Error(
          `Game ${gameNum} not found for player ${playerId}.`,
        );
      }

      game.score = score;
    };

    const createTiesBrktList = (
      testGames: typeof mockGames,
    ): void => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );

      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(testGames);
      tiesBrktList.createPlayersMap(
        div1Entries,
        mockTmntFullData.divs[0],
      );
    };

    const createBracketWithTies = (): void => {
      tiesBracket = new Bracket(brktId);
      tiesBracket.parent = tiesBrktList;

      addPlayersToBracket(
        tiesBracket,
        playerIds,
      );
    };

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(tiesBracket);
    };

    it("sets 2 players to T and 1 player to L when 2 of 3 players tie", () => {
      const tieGames = cloneDeep(mockGames);

      setGameScore(tieGames, playerId2, 2, 225);
      setGameScore(tieGames, playerId3, 2, 225);

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = [
        playerId2,
        playerId3,
        playerId4,
      ];

      const matchScores = tieBracketMatch.getMatchInfo(
        matchPlayers,
        2,
      );

      expect(matchScores).toHaveLength(3);

      tieBracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId2,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId3,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId4,
          result: "L",
        }),
      ]);
    });

    it("sets all 3 players to T when all 3 players tie", () => {
      const tieGames = cloneDeep(mockGames);

      const tiedPlayerIds = [
        playerId2,
        playerId3,
        playerId4,
      ];

      tiedPlayerIds.forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          225,
        );
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch = createTestBracketMatch();

      const matchScores = tieBracketMatch.getMatchInfo(
        tiedPlayerIds,
        2,
      );

      expect(matchScores).toHaveLength(3);

      tieBracketMatch.setMatchResult(matchScores);

      matchScores.forEach((matchScore) => {
        expect(matchScore.result).toBe("T");
      });

      expect(matchScores.map(
        (matchScore) => matchScore.playerId,
      )).toEqual(tiedPlayerIds);
    });

    it("sets 2 players to T and 2 players to L when 2 of 4 players tie", () => {
      const tieGames = cloneDeep(mockGames);

      setGameScore(tieGames, playerId2, 2, 225);
      setGameScore(tieGames, playerId3, 2, 225);

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ];

      const matchScores = tieBracketMatch.getMatchInfo(
        matchPlayers,
        2,
      );

      expect(matchScores).toHaveLength(4);

      tieBracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId1,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId2,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId3,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId4,
          result: "L",
        }),
      ]);
    });

    it("sets all 4 players to T when all 4 players tie", () => {
      const tieGames = cloneDeep(mockGames);

      const tiedPlayerIds = [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ];

      tiedPlayerIds.forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          225,
        );
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch = createTestBracketMatch();

      const matchScores = tieBracketMatch.getMatchInfo(
        tiedPlayerIds,
        2,
      );

      expect(matchScores).toHaveLength(4);

      tieBracketMatch.setMatchResult(matchScores);

      matchScores.forEach((matchScore) => {
        expect(matchScore.result).toBe("T");
      });

      expect(matchScores.map(
        (matchScore) => matchScore.playerId,
      )).toEqual(tiedPlayerIds);
    });
  });

  describe("setMatchResult() - third round match ties", () => {
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;

    const setGameScore = (
      games: typeof mockGames,
      playerId: string,
      gameNum: number,
      score: number,
    ): void => {
      const game = games.find(
        (game) =>
          game.player_id === playerId &&
          game.game_num === gameNum,
      );

      if (game === undefined) {
        throw new Error(
          `Game ${gameNum} not found for player ${playerId}.`,
        );
      }

      game.score = score;
    };

    const createTiesBrktList = (
      testGames: typeof mockGames,
    ): void => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );

      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(testGames);
      tiesBrktList.createPlayersMap(
        div1Entries,
        mockTmntFullData.divs[0],
      );
    };

    const createBracketWithTies = (): void => {
      tiesBracket = new Bracket(brktId);
      tiesBracket.parent = tiesBrktList;

      addPlayersToBracket(
        tiesBracket,
        playerIds,
      );
    };

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(tiesBracket);
    };

    const getFinalPlayers = (
      testBracketMatch: BracketMatch,
    ): string[] => {
      return [
        ...testBracketMatch.getPlayersForPosition(6, 0),
        ...testBracketMatch.getPlayersForPosition(6, 1),
      ];
    };

    it("sets 2 players to T and 1 player to L when 2 of 3 finalists tie", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 5 so playerId5 and playerId8 advance.
      setGameScore(
        tieGames,
        playerId5,
        2,
        231,
      );

      // Finalists:
      // playerId2, playerId5, playerId8
      //
      // Tie playerId5 and playerId8 for the highest
      // Game 3 score. playerId2 remains below them.
      setGameScore(
        tieGames,
        playerId5,
        3,
        240,
      );

      setGameScore(
        tieGames,
        playerId8,
        3,
        240,
      );

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch =
        createTestBracketMatch();

      const matchPlayers =
        getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toEqual([
        playerId2,
        playerId5,
        playerId8,
      ]);

      const matchScores =
        tieBracketMatch.getMatchInfo(
          matchPlayers,
          3,
        );

      expect(matchScores).toHaveLength(3);

      tieBracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId2,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId5,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId8,
          result: "T",
        }),
      ]);
    });

    it("sets all 4 finalists to T when both second-round matches and the final are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 4.
      setGameScore(
        tieGames,
        playerId4,
        2,
        211,
      );

      // Tie match 5.
      setGameScore(
        tieGames,
        playerId5,
        2,
        231,
      );

      const tiedFinalists = [
        playerId2,
        playerId4,
        playerId5,
        playerId8,
      ];

      // Tie all four finalists in Game 3.
      tiedFinalists.forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          3,
          240,
        );
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch =
        createTestBracketMatch();

      const matchPlayers =
        getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toEqual(
        tiedFinalists,
      );

      const matchScores =
        tieBracketMatch.getMatchInfo(
          matchPlayers,
          3,
        );

      expect(matchScores).toHaveLength(4);

      tieBracketMatch.setMatchResult(matchScores);

      matchScores.forEach((matchScore) => {
        expect(matchScore.result).toBe("T");
      });

      expect(
        matchScores.map(
          (matchScore) => matchScore.playerId,
        ),
      ).toEqual(tiedFinalists);
    });

    it("sets 2 players to T and 3 players to L when 2 of 5 finalists tie", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie first-round match 0.
      setGameScore(
        tieGames,
        playerId1,
        1,
        210,
      );

      // Tie first-round match 1.
      setGameScore(
        tieGames,
        playerId3,
        1,
        205,
      );

      // All four players entering match 4 tie.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          220,
        );
      });

      // playerId8 advances from match 5.
      //
      // Tie playerId4 and playerId8 for the highest
      // Game 3 score.
      setGameScore(
        tieGames,
        playerId4,
        3,
        240,
      );

      setGameScore(
        tieGames,
        playerId8,
        3,
        240,
      );

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch =
        createTestBracketMatch();

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0),
      ).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1),
      ).toEqual([
        playerId8,
      ]);

      const matchPlayers =
        getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(5);

      const matchScores =
        tieBracketMatch.getMatchInfo(
          matchPlayers,
          3,
        );

      tieBracketMatch.setMatchResult(matchScores);

      expect(matchScores).toEqual([
        expect.objectContaining({
          playerId: playerId1,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId2,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId3,
          result: "L",
        }),
        expect.objectContaining({
          playerId: playerId4,
          result: "T",
        }),
        expect.objectContaining({
          playerId: playerId8,
          result: "T",
        }),
      ]);
    });

    it("sets all 8 players to T when every match is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie first-round match 0.
      setGameScore(
        tieGames,
        playerId1,
        1,
        210,
      );

      // Tie first-round match 1.
      setGameScore(
        tieGames,
        playerId3,
        1,
        205,
      );

      // Tie first-round match 2.
      setGameScore(
        tieGames,
        playerId6,
        1,
        225,
      );

      // Tie first-round match 3.
      setGameScore(
        tieGames,
        playerId7,
        1,
        230,
      );

      // Tie all four players in match 4.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          220,
        );
      });

      // Tie all four players in match 5.
      [
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ].forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          2,
          230,
        );
      });

      // Tie all eight finalists.
      playerIds.forEach((playerId) => {
        setGameScore(
          tieGames,
          playerId,
          3,
          240,
        );
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();

      const tieBracketMatch =
        createTestBracketMatch();

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0),
      ).toHaveLength(4);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1),
      ).toHaveLength(4);

      const matchPlayers =
        getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(8);

      const matchScores =
        tieBracketMatch.getMatchInfo(
          matchPlayers,
          3,
        );

      expect(matchScores).toHaveLength(8);

      tieBracketMatch.setMatchResult(matchScores);

      matchScores.forEach((matchScore) => {
        expect(matchScore.result).toBe("T");
      });

      playerIds.forEach((playerId) => {
        expect(
          matchScores.find(
            (matchScore) =>
              matchScore.playerId === playerId,
          ),
        ).toEqual(
          expect.objectContaining({
            playerId,
            result: "T",
          }),
        );
      });
    });
  });

});
