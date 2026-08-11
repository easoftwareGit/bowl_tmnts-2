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
import { init } from "next/dist/compiled/webpack/webpack";
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

  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    first_name: 'Bye',
    average: 0,
  }
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

  describe("getMatchInfo() - first round matches", () => {
    it("returns match info for the players in match 0", () => {
      const matchPlayers = [playerIds[0], playerIds[1]];
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerIds[0],
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 201,
          hdcp: 0,
          total: 201,
          result: undefined,
        },
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 210,
          hdcp: 0,
          total: 210,
          result: undefined,
        },
      ]);
    });

    it("returns match info for the players in match 1", () => {
      const matchPlayers = [playerIds[2], playerIds[3]];
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerIds[2],
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 195,
          hdcp: 0,
          total: 195,
          result: undefined,
        },
        {
          playerId: playerIds[3],
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 205,
          hdcp: 0,
          total: 205,
          result: undefined,
        },
      ]);
    });

    it("returns match info for the players in match 2", () => {
      const matchPlayers = [playerIds[4], playerIds[5]];
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerIds[4],
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 225,
          hdcp: 0,
          total: 225,
          result: undefined,
        },
        {
          playerId: playerIds[5],
          first_name: 'Tony',
          last_name: 'Smith',
          average: 211,
          score: 215,
          hdcp: 0,
          total: 215,
          result: undefined,
        },
      ]);
    });

    it("returns match info for the players in match 3", () => {
      const matchPlayers = [playerIds[6], playerIds[7]];
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerIds[6],
          first_name: 'Tina',
          last_name: 'Smith',
          average: 201,
          score: 190,
          hdcp: 0,
          total: 190,
          result: undefined,
        },
        {
          playerId: playerIds[7],
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 230,
          hdcp: 0,
          total: 230,
          result: undefined,
        },
      ]);
    });
  });

  describe("getMatchInfo() - first round matches with a bye", () => {
    let byeBrktList: BracketList;
    let byeBracket: Bracket
    let byePlayerIds: string[]

    beforeEach(() => {
      byeBrktList = new BracketList(
        brktId,
        2,
        3,
        [1, 2, 3],
        byePlayer,
      );
      byeBrktList.addBrktEntries(mockPlayerRows);
      byeBrktList.createGameScoresMap(testGames);
      byeBrktList.createPlayersMap(div1Entries, mockTmntFullData.divs[0]);;

      byeBracket = new Bracket(mockTmntFullData.brkts[0].id);
      byeBracket.parent = byeBrktList;

      byePlayerIds = cloneDeep(playerIds);
    });

    it("returns match info for the players in match 0 when one player is a bye", () => {
      byePlayerIds[1] = byeId;
      addPlayersToBracket(byeBracket, byePlayerIds);
      expect(byeBracket.players.length).toBe(8);

      const byeBracketMatch = new BracketMatch(byeBracket);

      const byeMatchPlayers = [byePlayerIds[0], byePlayerIds[1]]; // playerId1, byeId
      const result = byeBracketMatch.getMatchInfo(byeMatchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: byePlayerIds[0],
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 201,
          hdcp: 0,
          total: 201,
          result: undefined,
        },
        {
          playerId: byeId,
          first_name: 'Bye',
          last_name: '',
          average: 0,
          score: 0,
          hdcp: 0,
          total: 0,
          result: undefined,
        },
      ]);
    });

    it("returns game scores for the players in match 2 when one player is a bye", () => {
      byePlayerIds[4] = byeId;
      addPlayersToBracket(byeBracket, byePlayerIds);
      expect(byeBracket.players.length).toBe(8);

      const byeBracketMatch = new BracketMatch(byeBracket);

      const byeMatchPlayers = [byePlayerIds[4], byePlayerIds[5]]; // byeId, playerId6
      const result = byeBracketMatch.getMatchInfo(byeMatchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: byeId,
          first_name: 'Bye',
          last_name: '',
          average: 0,
          score: 0,
          hdcp: 0,
          total: 0,
          result: undefined,
        },
        {
          playerId: playerIds[5],
          first_name: 'Tony',
          last_name: 'Smith',
          average: 211,
          score: 215,
          hdcp: 0,
          total: 215,
          result: undefined,
        },
      ]);
    });

  });

  describe("getMatchInfo() - first round matches with a tie", () => {

    it("returns game scores for more then 2 players in match 0 - simulate a tie in prior match", () => {
      const matchPlayers = [playerIds[0], playerIds[1], playerIds[2]];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerIds[0],
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 201,
          hdcp: 0,
          total: 201,
          result: undefined,
        },
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 210,
          hdcp: 0,
          total: 210,
          result: undefined,
        },
        {
          playerId: playerIds[2],
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 195,
          hdcp: 0,
          total: 195,
          result: undefined,
        },
      ]);
    });    
  })

  describe("getMatchInfo() - first round matches with missing game scores", () => {

    it("returns game scores for the players in match 2 when one player has game 1 score missing", () => {
      const partialGame1 = cloneDeep(mockGames.filter(
        (game) =>
          game.game_num === 1 &&
          (game.player_id === playerIds[0] ||
            game.player_id === playerIds[1] ||
            game.player_id === playerIds[2] ||
            game.player_id === playerIds[3] ||
            game.player_id === playerIds[4]),
      ));

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

      const result = partialBracketMatch.getMatchInfo(matchPlayers, 1);
      expect(result).toEqual([
        {
          playerId: playerIds[4],
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 225,
          hdcp: 0,
          total: 225,
          result: undefined,
        },
        {
          playerId: playerIds[5],
          first_name: 'Tony',
          last_name: 'Smith',
          average: 211,
          score: undefined,
          hdcp: 0,
          total: undefined,
          result: undefined,
        },
      ]);
    });
  });

  describe("getMatchInfo() - second round matches", () => {

    it("returns game scores for two advancing players - no round 1 ties", () => {
      const matchPlayers = [
        playerIds[1], // winner of match 0
        playerIds[3], // winner of match 1
      ];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: undefined,
        },
        {
          playerId: playerIds[3],
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: undefined,
        },
      ]);
    });

    it("returns game scores for three advancing players - 1 round 1 match with a tie", () => {
      const matchPlayers = [
        playerIds[0],
        playerIds[1],
        playerIds[3],
      ];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerIds[0],
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 202,
          hdcp: 0,
          total: 202,
          result: undefined,
        },
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: undefined,
        },
        {
          playerId: playerIds[3],
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: undefined,
        },
      ]);
    });    
        
    it("returns game scores for four advancing players - 2 round 1 matches with a tie", () => {
      const matchPlayers = [
        playerIds[0],
        playerIds[1],
        playerIds[2],
        playerIds[3],
      ];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerIds[0],
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 202,
          hdcp: 0,
          total: 202,
          result: undefined,
        },
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: undefined,
        },
        {
          playerId: playerIds[2],
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 196,
          hdcp: 0,
          total: 196,
          result: undefined,
        },
        {
          playerId: playerIds[3],
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: undefined,
        },
      ]);
    });    
    
    it("returns game scores for the players in next match when one player has game score missing", () => {
      const partialGame1 = mockGames.filter(
        (game) =>
          game.game_num === 2 &&
          (game.player_id === playerIds[0] ||
            game.player_id === playerIds[1] ||
            game.player_id === playerIds[2]),
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

      const matchPlayers = [playerIds[1], playerIds[3]];      
      const result = partialBracketMatch.getMatchInfo(matchPlayers, 2);
      // player 2: playerIds[1], game 2. no score for player 4: playerIds[3]
      expect(result).toEqual([
        {
          playerId: playerIds[1],
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: undefined,
        },
        {
          playerId: playerIds[3],
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: undefined,
          hdcp: 0,
          total: undefined,
          result: undefined,
        },
      ]);
    });

  })

  describe("getMatchInfo() - third round match", () => {
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

    it("returns game 3 scores for the two finalists when there are no ties", () => {
      const matchPlayers = getFinalPlayers(bracketMatch);

      expect(matchPlayers).toEqual([
        playerId2,
        playerId8,
      ]);
      
      const result = bracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212, // playerId2 game 3 score in mockGames
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232, // playerId8 game 3 score in mockGames
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });

    it("returns game 3 scores for three finalists when match 4 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      setGameScore(tieGames, playerId4, 2, 211);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(3);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId4);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 207, // playerId4 game 3 score in mockGames
          hdcp: 0,
          total: 207,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns game 3 scores for three finalists when match 5 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      setGameScore(tieGames, playerId5, 2, 231);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(3);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId5);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId5,
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 227, // playerId5 game 3 score in mockGames
          hdcp: 0,
          total: 227,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });
    
    it("returns game 3 scores for four finalists when matches 4 and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 4.
      setGameScore(tieGames, playerId4, 2, 211);

      // Tie match 5.
      setGameScore(tieGames, playerId5, 2, 231);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(4);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId4);
      expect(matchPlayers).toContain(playerId5);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 207,
          hdcp: 0,
          total: 207,
          result: undefined,
        },
        {
          playerId: playerId5,
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 227,
          hdcp: 0,
          total: 227,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns two finalists when matches 0 and 1 tie but later matches do not", () => {
      const tieGames = cloneDeep(mockGames);

      // Match 0 tie: player 1 and player 2.
      setGameScore(tieGames, playerId1, 1, 210);

      // Match 1 tie: player 3 and player 4.
      setGameScore(tieGames, playerId3, 1, 205);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      expect(
        tieBracketMatch.getPlayersForPosition(6, 0),
      ).toEqual([playerId2]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1),
      ).toEqual([playerId8]);

      const matchPlayers = getFinalPlayers(tieBracketMatch);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns three finalists when matches 3 and 4 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 3.
      setGameScore(tieGames, playerId7, 1, 230);

      // Tie match 4.
      setGameScore(tieGames, playerId4, 2, 211);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(3);
      expect(matchPlayers).toContain(playerId2);
      expect(matchPlayers).toContain(playerId4);
      expect(matchPlayers).toContain(playerId8);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 207,
          hdcp: 0,
          total: 207,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns five finalists when matches 0, 1, and 4 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Match 0 tie.
      setGameScore(tieGames, playerId1, 1, 210);

      // Match 1 tie.
      setGameScore(tieGames, playerId3, 1, 205);

      // All four players tie in match 4.
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
        tieBracketMatch.getPlayersForPosition(6, 0),
      ).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1),
      ).toEqual([playerId8]);

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(5);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId1,
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 203,
          hdcp: 0,
          total: 203,
          result: undefined,
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId3,
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 197,
          hdcp: 0,
          total: 197,
          result: undefined,
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 207,
          hdcp: 0,
          total: 207,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns five finalists when matches 2, 3, and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Match 2 tie.
      setGameScore(tieGames, playerId6, 1, 225);

      // Match 3 tie.
      setGameScore(tieGames, playerId7, 1, 230);

      // All four players tie in match 5.
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
        tieBracketMatch.getPlayersForPosition(6, 0),
      ).toEqual([playerId2]);

      expect(
        tieBracketMatch.getPlayersForPosition(6, 1),
      ).toEqual([
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ]);

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(5);
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 212,
          hdcp: 0,
          total: 212,
          result: undefined,
        },
        {
          playerId: playerId5,
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 227,
          hdcp: 0,
          total: 227,
          result: undefined,
        },
        {
          playerId: playerId6,
          first_name: 'Tony',
          last_name: 'Smith',
          average: 211,
          score: 217,
          hdcp: 0,
          total: 217,
          result: undefined,
        },
        {
          playerId: playerId7,
          first_name: 'Tina',
          last_name: 'Smith',
          average: 201,
          score: 192,
          hdcp: 0,
          total: 192,
          result: undefined,
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232,
          hdcp: 0,
          total: 232,
          result: undefined,
        },
      ]);
    });  

    it("returns game 3 scores for all eight players when every prior match is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie first-round matches 0 through 3.
      setGameScore(tieGames, playerId1, 1, 210);      
      setGameScore(tieGames, playerId3, 1, 205);      
      setGameScore(tieGames, playerId6, 1, 225);
      setGameScore(tieGames, playerId7, 1, 230);      

      // Tie all four players in match 4.
      [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ].forEach((playerId) => {
        setGameScore(tieGames, playerId, 2, 220);
      });

      // Tie all four players in match 5.
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

      const matchPlayers = getFinalPlayers(tieBracketMatch);

      expect(matchPlayers).toHaveLength(8);

      playerIds.forEach((playerId) => {
        expect(matchPlayers).toContain(playerId);
      });
      
      const result = tieBracketMatch.getMatchInfo(matchPlayers, 3);

      expect(result).toHaveLength(8);

      result.forEach((matchScore) => {
        expect(matchScore).toEqual({
          playerId: matchScore.playerId,
          first_name: matchScore.first_name,
          last_name: matchScore.last_name,
          average: matchScore.average,
          score: 240,
          hdcp: 0,
          total: 240,
          result: undefined,
        });
      });
    });
  });  

});
