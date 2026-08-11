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
import { gameType } from "@/lib/types/types";

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

  describe("matchWinner() - first round matches", () => {

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

    const createTiesBrktList = (testGames: typeof mockGames) => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );
      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(testGames);
      tiesBrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);      
    };

    const createBracketWithTies = () => {
      tiesBracket = new Bracket(brktId);
      addPlayersToBracket(tiesBracket, playerIds);
      tiesBracket.parent = tiesBrktList;
    }

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(
        tiesBracket,
      );
    };

    // round 1 matches, [match, expectedWinnerIndex in playerIds]
    it.each([
      [0, 1],
      [1, 3],
      [2, 4],
      [3, 7],
    ] as const)(
      "returns the winner of first round match %i",
      (matchNumber, expectedWinnerIndex) => {
        const matchPlayers = [
          ...bracketMatch.getPlayersForPosition(matchNumber, 0),
          ...bracketMatch.getPlayersForPosition(matchNumber, 1),
        ];

        const result = bracketMatch.matchWinner(matchPlayers, 1);

        expect(result).toEqual([playerIds[expectedWinnerIndex]]);
      },
    );

    it("returns an empty array when there are no match players", () => {
      const result = bracketMatch.matchWinner([], 1);

      expect(result).toEqual([]);
    });

    it("returns an empty array when there is a missing score", () => {
      const partialGame1 = mockGames.filter(
        (game) =>
          game.game_num === 1 &&
          (game.player_id === playerIds[0] ||
            game.player_id === playerIds[1] ||
            game.player_id === playerIds[2] ||
            game.player_id === playerIds[3] ||
            game.player_id === playerIds[4]),
      );
      const partialGame1BrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );
      partialGame1BrktList.addBrktEntries(mockPlayerRows);
      partialGame1BrktList.createGameScoresMap(partialGame1);
      partialGame1BrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);      
   
      const partialGame1Bracket = new Bracket(brktId);
      addPlayersToBracket(partialGame1Bracket, playerIds);
      partialGame1Bracket.parent = partialGame1BrktList;    
      const partialBracketMatch = new BracketMatch(partialGame1Bracket);
      const matchPlayers = [playerIds[4], playerIds[5]];      
      const result = partialBracketMatch.matchWinner(matchPlayers, 1);

      expect(result).toEqual([]);
    });

    it("returns an array with both players when there is a tie", () => {
      const tieGames = cloneDeep(mockGames);              
      setGameScore(tieGames, playerId6, 1, 225); // playerId5 game 1 = 205

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();
      const matchPlayers = [playerIds[4], playerIds[5]]; // playerId5, playerId6      
      const result = tieBracketMatch.matchWinner(matchPlayers, 1);

      expect(result).toHaveLength(2);
      expect(result).toContain(playerIds[4]); // playerId5
      expect(result).toContain(playerIds[5]); // playerId6
    });

    it('returns winner when one player is a bye', () => { 
      const byeBrktTmnt = cloneDeep(mockTmntFullData);      
      // change play 8 entries to byes
      byeBrktTmnt.brktSeeds.forEach((seed) => {
        if (seed.player_id === playerId8) {
          seed.player_id = byeId;
        }
      });
      const byeGames = cloneDeep(mockGames).filter(
        (game) => game.player_id !== playerId8
      ) 
      
      createTiesBrktList(byeGames); // will work for byeGames
      createBracketWithTies();
      const byeBracketMatch = createTestBracketMatch();      
      // match player 7 against a bye
      const result = byeBracketMatch.matchWinner([playerId7, byeId], 1);
      expect(result).toEqual([playerId7]);

      const result2 = byeBracketMatch.matchWinner([byeId, playerId7], 1);
      expect(result2).toEqual([playerId7]);
    })
  });

  describe('matchWinner() - second round matches', () => {

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

    const createTiesBrktList = (testGames: typeof mockGames) => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );
      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(testGames);
      tiesBrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);      
    };

    const createBracketWithTies = () => {
      tiesBracket = new Bracket(brktId);
      addPlayersToBracket(tiesBracket, playerIds);
      tiesBracket.parent = tiesBrktList;
    }

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(
        tiesBracket,
      );
    };

    it("returns the winner from 2 players in game 2", () => {
      const matchPlayers = [playerIds[1], playerIds[3]];      
      const result = bracketMatch.matchWinner(matchPlayers, 2);

      expect(result).toEqual([playerIds[1]]);      
    });

    it("returns the highest scoring player from 3 players in game 2", () => {
      const matchPlayers = [
        playerIds[1],
        playerIds[2],
        playerIds[3],
      ];      
      const result = bracketMatch.matchWinner(matchPlayers, 2);

      expect(result).toEqual([playerIds[1]]);
    });

    it("returns 2 players when 2 of 3 players tie for the highest game 2 score", () => {
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
      const result = tieBracketMatch.matchWinner(matchPlayers, 2);

      expect(result).toHaveLength(2);
      expect(result).toContain(playerId2);
      expect(result).toContain(playerId3);
      expect(result).not.toContain(playerId4);
    });

    it("returns all 3 players when all 3 tie for the highest game 2 score", () => {
      const tieGames = cloneDeep(mockGames);

      const tiedPlayerIds = [
        playerId2,
        playerId3,
        playerId4,
      ];

      setGameScore(tieGames, playerId2, 2, 225);
      setGameScore(tieGames, playerId3, 2, 225);
      setGameScore(tieGames, playerId4, 2, 225);

      createTiesBrktList(tieGames);      
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();      
      const result = tieBracketMatch.matchWinner(tiedPlayerIds, 2);

      expect(result).toHaveLength(3);
      expect(result).toContain(playerId2);
      expect(result).toContain(playerId3);
      expect(result).toContain(playerId4);
    });

    it("returns the highest scoring player from 4 players in game 2", () => {
      const matchPlayers = [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ];      
      const result = bracketMatch.matchWinner(matchPlayers, 2);      

      expect(result).toEqual([
        playerId2,
      ]);
    });

    it("returns all 4 players when all 4 tie for the highest game 2 score", () => {
      const tieGames = cloneDeep(mockGames);

      const tiedPlayerIds = [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ];

      setGameScore(tieGames, playerId1, 2, 225);
      setGameScore(tieGames, playerId2, 2, 225);
      setGameScore(tieGames, playerId3, 2, 225);
      setGameScore(tieGames, playerId4, 2, 225);

      createTiesBrktList(tieGames);      
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();      
      const result = tieBracketMatch.matchWinner(tiedPlayerIds, 2);

      expect(result).toHaveLength(4);
      tiedPlayerIds.forEach((playerId) => {
        expect(result).toContain(playerId);
      });
    });
  });  

  describe("matchWinner() - third round match", () => {
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

    const createTiesBrktList = (testGames: typeof mockGames) => {
      tiesBrktList = new BracketList(
        brktId,
        2,          // two players per match
        3,          // three games
        [1, 2, 3],  // use games 1, 2, 3
      );
      tiesBrktList.addBrktEntries(mockPlayerRows);
      tiesBrktList.createGameScoresMap(testGames);
      tiesBrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);      
    };

    const createBracketWithTies = () => {
      tiesBracket = new Bracket(brktId);
      addPlayersToBracket(tiesBracket, playerIds);
      tiesBracket.parent = tiesBrktList;
    }

    const createTestBracketMatch = (): BracketMatch => {
      return new BracketMatch(
        tiesBracket,
      );
    };

    const getFinalPlayers = (
      testBracketMatch: BracketMatch,
    ): string[] => {
      return [
        ...testBracketMatch.getPlayersForPosition(6, 0),
        ...testBracketMatch.getPlayersForPosition(6, 1),
      ];
    };

    it("returns the winner from 2 finalists when there are no ties", () => {
      const matchPlayers = getFinalPlayers(bracketMatch);

      expect(matchPlayers).toEqual([playerId2, playerId8]);  
            
      const result = bracketMatch.matchWinner(matchPlayers, 3);      

      // playerId2 game 3 = 212
      // playerId8 game 3 = 232
      expect(result).toEqual([playerId8]);
    });

    it("returns the winner from 3 finalists when match 5 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Match 5:
      // playerId5 game 2 = 226
      // playerId8 game 2 = 231
      // Change playerId5's score so both advance.
      setGameScore(tieGames, playerId5, 2, 231);      

      createTiesBrktList(tieGames);      
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(3);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId5);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.matchWinner(matchPlayers, 3);

      // Game 3:
      // playerId2 = 212
      // playerId5 = 227
      // playerId8 = 232
      expect(result).toEqual([playerId8]);
    });

    it("returns the winner from 4 finalists when matches 4 and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 4:
      // playerId2 game 2 = 211
      setGameScore(tieGames, playerId4, 2, 211);      

      // Tie match 5:
      // playerId8 game 2 = 231
      setGameScore(tieGames, playerId5, 2, 231,);      

      createTiesBrktList(tieGames);      
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(4);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId4);
      expect(matchPlayers).toContain(playerId5);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.matchWinner(matchPlayers, 3);

      // Game 3:
      // playerId2 = 212
      // playerId4 = 207
      // playerId5 = 227
      // playerId8 = 232
      expect(result).toEqual([playerId8]);
    });

    it("returns the winner from 5 finalists when matches 0, 1, and 4 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 0.
      setGameScore(tieGames, playerId1, 1, 210);

      // Tie match 1.
      setGameScore(tieGames, playerId3, 1, 205);      

      // All four players entering match 4 tie.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(tieGames, playerId, 2, 220);
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();      

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0)
      ).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1)
      ).toEqual([playerId8]);

      const matchPlayers = getFinalPlayers(tieBracketMatch);      

      expect(matchPlayers).toHaveLength(5);
      
      const result = tieBracketMatch.matchWinner(matchPlayers, 3);      

      // playerId8 has the highest game 3 score.
      expect(result).toEqual([playerId8]);
    });

    it("returns the winner from 5 finalists when matches 2, 3, and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 2.
      setGameScore(tieGames, playerId6, 1, 225);

      // Tie match 3.
      setGameScore(tieGames, playerId7, 1, 230);      

      // All four players entering match 5 tie.
      [
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ].forEach((playerId) => {
        setGameScore(tieGames, playerId, 2, 220);
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();      

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0)
      ).toEqual([playerId2]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1)
      ).toEqual([
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ]);

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(5);
      
      const result = tieBracketMatch.matchWinner(matchPlayers, 3);

      // playerId8 has the highest game 3 score.
      expect(result).toEqual([playerId8]);
    });

    it("returns all 8 players when every match is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie first-round match 0.
      setGameScore(tieGames, playerId1, 1, 210);

      // Tie first-round match 1.
      setGameScore(tieGames, playerId3, 1, 205);

      // Tie first-round match 2.
      setGameScore(tieGames, playerId6, 1, 225);

      // Tie first-round match 3.
      setGameScore(tieGames, playerId7, 1, 230);

      // All four players in match 4 tie.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(tieGames, playerId, 2, 220);
      });

      // All four players in match 5 tie.
      [
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ].forEach((playerId) => {
        setGameScore(tieGames, playerId, 2, 230);
      });

      // All eight players tie in match 6.
      playerIds.forEach((playerId) => {
        setGameScore(tieGames, playerId, 3, 240);        
      });

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();      

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0)
      ).toHaveLength(4);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1)        
      ).toHaveLength(4);

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(8);

      playerIds.forEach((playerId) => {
        expect(matchPlayers).toContain(playerId);
      });
      
      const result = tieBracketMatch.matchWinner(matchPlayers, 3);      

      expect(result).toHaveLength(8);

      playerIds.forEach((playerId) => {
        expect(result).toContain(playerId);
      });
    });
  });  

});
