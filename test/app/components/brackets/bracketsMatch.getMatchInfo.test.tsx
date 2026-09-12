import { Bracket } from "@/components/brackets/bracketClass";
import { BracketMatch } from "@/components/brackets/bracketMatchClass";
import {
  byeId,
  brktId1,
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
  divId1,
  oneBrktId1,
  brktEntryId10,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { cloneDeep } from "lodash";
import { BracketList, brktListInitialDataType } from "@/components/brackets/bracketListClass";
import { gameType, playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";

describe("BracketMatch.getMatchInfo()", () => {
  let brktList: BracketList;
  let bracket: Bracket;
  let bracketMatch: BracketMatch | undefined;
  let testGames: gameType[];

  const oneBrkt = mockTmntFullData.oneBrkts[0];

  const brktSeeds = mockTmntFullData.brktSeeds
    .filter((brktSeed) => brktSeed.one_brkt_id === oneBrkt.id)
    .sort((a, b) => a.seed - b.seed);

  const playerIds = brktSeeds.map((brktSeed) => brktSeed.player_id);
 
  const byePlayer: playerType = {
    ...initPlayer,
    id: byeId,
    first_name: 'Bye',
    average: 0,
  }
  
  beforeEach(() => {
    testGames = cloneDeep(mockGames);

    const initData: brktListInitialDataType = {        
      tmntFullData: mockTmntFullData,
      divId: divId1,
    };
    brktList = new BracketList(
      brktId1,
      2,
      3,
      undefined,
      undefined,
      initData,
    );

    brktList.createGameScoresMap(testGames);

    bracket = brktList.brackets[0];
    bracketMatch = bracket.match;
  });

  describe("getMatchInfo() - first round matches", () => {
    it("returns match info for the players in match 0", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [playerId1, playerId2];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 1); 

      expect(result).toEqual([
        {
          playerId: playerId1,
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 201,
          hdcp: 0,
          total: 201,
          result: 'L',
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 210,
          hdcp: 0,
          total: 210,
          result: 'W',
        },
      ]);
    });

    it("returns match info for the players in match 1", () => {    
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [playerId3, playerId4];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerId3,
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 195,
          hdcp: 0,
          total: 195,
          result: 'L',
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 205,
          hdcp: 0,
          total: 205,
          result: 'W',
        },
      ]);
    });

    it("returns match info for the players in match 2", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [playerId5, playerId6];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerId5,
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 225,
          hdcp: 0,
          total: 225,
          result: 'W',
        },
        {
          playerId: playerId6,
          first_name: 'Tony',
          last_name: 'Smith',
          average: 211,
          score: 215,
          hdcp: 0,
          total: 215,
          result: 'L',
        },
      ]);
    });

    it("returns match info for the players in match 3", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [playerId7, playerId8];      
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerId7,
          first_name: 'Tina',
          last_name: 'Smith',
          average: 201,
          score: 190,
          hdcp: 0,
          total: 190,
          result: 'L',
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 230,
          hdcp: 0,
          total: 230,
          result: 'W',
        },
      ]);
    });

    it("returns match info for the players in match 0 - bracket 2", () => {
      bracket = brktList.brackets[1];
      bracketMatch = bracket.match;
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = bracketMatch.getMatchPlayers(0);
      expect(matchPlayers).toEqual([playerId4, playerId7]);
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;
      const result = bracketMatch.getMatchInfo(matchPlayers, 1); 

      expect(result).toEqual([
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 205,
          hdcp: 0,
          total: 205,
          result: 'W',
        },
        {
          playerId: playerId7,
          first_name: 'Tina',
          last_name: 'Smith',
          average: 201,
          score: 190,
          hdcp: 0,
          total: 190,
          result: 'L',
        },
      ]);
    });

  });

  describe("getMatchInfo() - first round matches with a bye", () => {
    let byeBrktList: BracketList;
    let byeBracket: Bracket;
    let byeMatch: BracketMatch | undefined;

    const byeTmntData = cloneDeep(mockTmntFullData);
    const byeSeed = byeTmntData.brktSeeds.find(
      (seed) => seed.one_brkt_id === oneBrktId1 && seed.player_id === playerId1
    )    
    if (byeSeed == null) return;
    byeSeed.player_id = byePlayer.id

    const initByeData: brktListInitialDataType = {        
      tmntFullData: byeTmntData,
      divId: divId1,
    };

    beforeEach(() => {
      byeBrktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        byePlayer,
        initByeData,
      );
      byeBrktList.createGameScoresMap(testGames);
      byeBracket = byeBrktList.brackets[0];
      byeMatch = byeBracket.match;
    });

    it("returns match info for the players in match 0 when one player is a bye", () => {

      expect(byeMatch).not.toBeUndefined();
      if (byeMatch == null) return;

      const byeMatchPlayers = byeMatch.getMatchPlayers(0)
      expect(byeMatchPlayers).toEqual([byeId, playerId2]);
      
      const result = byeMatch.getMatchInfo(byeMatchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: byeId,
          first_name: 'Bye',
          last_name: '',
          average: 0,
          score: 0,
          hdcp: 0,
          total: 0,
          result: "L",
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 210,
          hdcp: 0,
          total: 210,
          result: 'W',
        },
      ]);
    });

  });

  describe("getMatchInfo() - matches with more than two players", () => {

    it("returns match info for more than two players", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [playerId1, playerId2, playerId3];
      // normally, game 1 would only have two players, no ties.
      // but same code for getMatchInfo for ties (more than 2 players)
      // so ok to test here for game 1
      const result = bracketMatch.getMatchInfo(matchPlayers, 1);

      expect(result).toEqual([
        {
          playerId: playerId1,
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 201,
          hdcp: 0,
          total: 201,
          result: "L",
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 210,
          hdcp: 0,
          total: 210,
          result: "W",
        },
        {
          playerId: playerId3,
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 195,
          hdcp: 0,
          total: 195,
          result: "L",
        },
      ]);
    });
  })

  describe("getMatchInfo() - first round matches with missing game scores", () => {

    it("returns match info with undefined score and total when one player is missing a game 1 score", () => {
      const partialGame1 = cloneDeep(mockGames.filter(
        (game) =>
          game.game_num === 1 &&
          (game.player_id === playerId1 ||
            game.player_id === playerId2 ||
            game.player_id === playerId3 ||
            game.player_id === playerId4 ||
            game.player_id === playerId5),
      ));

      const partialInitData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      }

      const partialGame1BrktList = new BracketList(
        brktId1,
        2,          // two players per match
        3,          // three games
        undefined,  // use games 1, 2, 3
        undefined,  // no bye playet
        partialInitData,
      );      
      partialGame1BrktList.createGameScoresMap(partialGame1);      
   
      const partialBracket = partialGame1BrktList.brackets[0];
      const partialBracketMatch = partialBracket.match;

      expect(partialBracketMatch).not.toBeUndefined();
      if (partialBracketMatch == null) return;

      const matchPlayers = [playerId5, playerId6];

      const result = partialBracketMatch.getMatchInfo(matchPlayers, 1);
      expect(result).toEqual([
        {
          playerId: playerId5,
          first_name: 'Tom',
          last_name: 'Smith',
          average: 221,
          score: 225,
          hdcp: 0,
          total: 225,
          result: undefined,
        },
        {
          playerId: playerId6,
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
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [
        playerId2, // winner of match 0
        playerId4, // winner of match 1
      ];
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: "W",
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: "L",
        },
      ]);
    });

    it("returns game scores for three advancing players - 1 round 1 match with a tie", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [
        playerId1,
        playerId2,
        playerId4,
      ];
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerId1,
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 202,
          hdcp: 0,
          total: 202,
          result: "L",
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: "W",
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: "L",
        },
      ]);
    });
        
    it("returns game scores for four advancing players - 2 round 1 matches with a tie", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const matchPlayers = [
        playerId1,
        playerId2,
        playerId3,
        playerId4,
      ];
      const result = bracketMatch.getMatchInfo(matchPlayers, 2);

      expect(result).toEqual([
        {
          playerId: playerId1,
          first_name: 'John',
          last_name: 'Doe',
          average: 220,
          score: 202,
          hdcp: 0,
          total: 202,
          result: "L",
        },
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: "W",
        },
        {
          playerId: playerId3,
          first_name: 'Joe',
          last_name: 'Doe',
          average: 200,
          score: 196,
          hdcp: 0,
          total: 196,
          result: "L",
        },
        {
          playerId: playerId4,
          first_name: 'Jill',
          last_name: 'Doe',
          average: 190,
          score: 206,
          hdcp: 0,
          total: 206,
          result: "L",
        },
      ]);
    });
    
    it("returns match info with undefined score and total when one player is missing a game 2 score", () => {
      const partialGame2 = mockGames.filter(
        (game) =>
          game.game_num === 2 &&
          (game.player_id === playerId1 ||
            game.player_id === playerId2 ||
            game.player_id === playerId3),
      );
      const partialInitData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      }

      const partialGame1BrktList = new BracketList(
        brktId1,
        2,          // two players per match
        3,          // three games
        undefined,  // use games 1, 2, 3
        undefined,  // no bye playet
        partialInitData,
      );      
      partialGame1BrktList.createGameScoresMap(partialGame2);      
   
      const partialBracket = partialGame1BrktList.brackets[0];
      const partialBracketMatch = partialBracket.match;

      expect(partialBracketMatch).not.toBeUndefined();
      if (partialBracketMatch == null) return;

      const matchPlayers = [playerId2, playerId4];
      const result = partialBracketMatch.getMatchInfo(matchPlayers, 2);
      // player 2: playerId2, game 2. no score for player 4: playerId4
      expect(result).toEqual([
        {
          playerId: playerId2,
          first_name: 'Jane',
          last_name: 'Doe',
          average: 210,
          score: 211,
          hdcp: 0,
          total: 211,
          result: undefined,
        },
        {
          playerId: playerId4,
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
    const getFinalPlayers = (
      testBracketMatch: BracketMatch,
    ): string[] => {
      return [
        ...testBracketMatch.getPlayersForPosition(6, 0),
        ...testBracketMatch.getPlayersForPosition(6, 1),
      ];
    };

    it("returns game 3 scores for the two finalists when there are no ties", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

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
          result: "L",
        },
        {
          playerId: playerId8,
          first_name: 'Terri',
          last_name: 'Smith',
          average: 191,
          score: 232, // playerId8 game 3 score in mockGames
          hdcp: 0,
          total: 232,
          result: "W",
        },
      ]);
    });    

    it("returns match info with undefined score and total when one player is missing a game 3 score", () => {
      const partialGame3 = mockGames.filter(
        (game) =>
          game.game_num === 3 &&
          (game.player_id === playerId2 ||
            game.player_id === playerId3 ||
            game.player_id === playerId5), // no playerId4
      );
      const partialInitData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      }

      const partialGame1BrktList = new BracketList(
        brktId1,
        2,          // two players per match
        3,          // three games
        undefined,  // use games 1, 2, 3
        undefined,  // no bye playet
        partialInitData,
      );      
      partialGame1BrktList.createGameScoresMap(partialGame3);      
   
      const partialBracket = partialGame1BrktList.brackets[0];
      const partialBracketMatch = partialBracket.match;

      expect(partialBracketMatch).not.toBeUndefined();
      if (partialBracketMatch == null) return;

      const matchPlayers = [playerId2, playerId4];
      const result = partialBracketMatch.getMatchInfo(matchPlayers, 3);

      // player 2: playerId2, game 3. no score for player 4: playerId4
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
          score: undefined,
          hdcp: 0,
          total: undefined,
          result: undefined,
        },
      ]);
    });

  })

  describe("getMatchInfo() - ties", () => {
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;
    let tiesBracketMatch: BracketMatch | undefined;

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

      const tiesInitData: brktListInitialDataType = {
        tmntFullData: mockTmntFullData,
        divId: divId1,
      }

      tiesBrktList = new BracketList(
        brktId1,
        2,          // two players per match
        3,          // three games
        undefined,  // use games 1, 2, 3
        undefined,  // no bye playet
        tiesInitData,
      );      
      tiesBrktList.createGameScoresMap(testGames);      
    
      tiesBracket = tiesBrktList.brackets[0];
      tiesBracketMatch = tiesBracket.match;

    };

    const getFinalPlayers = (
      testBracketMatch: BracketMatch,
    ): string[] => {
      return [
        ...testBracketMatch.getPlayersForPosition(6, 0),
        ...testBracketMatch.getPlayersForPosition(6, 1),
      ];
    };

    describe('first round matches with ties', () => {
      it("returns match info for the players in match 0 tie", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = [playerId1, playerId2];
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 1);

        expect(result).toEqual([
          {
            playerId: playerId1,
            first_name: 'John',
            last_name: 'Doe',
            average: 220,
            score: 210,
            hdcp: 0,
            total: 210,
            result: 'T',
          },
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 210,
            hdcp: 0,
            total: 210,
            result: 'T',
          },
        ]);
      });
      
      it("returns match info for the players in match 1 tie", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = [playerId3, playerId4];
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 1);

        expect(result).toEqual([
          {
            playerId: playerId3,
            first_name: 'Joe',
            last_name: 'Doe',
            average: 200,
            score: 205,
            hdcp: 0,
            total: 205,
            result: 'T',
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 205,
            hdcp: 0,
            total: 205,
            result: 'T',
          },
        ]);
      });

      it("returns match info for the players in match 2 tie", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId5, 1, 215);
        setGameScore(tieGames, playerId6, 1, 215);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = [playerId5, playerId6];
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 1);
        
        expect(result).toEqual([
          {
            playerId: playerId5,
            first_name: 'Tom',
            last_name: 'Smith',
            average: 221,
            score: 215,
            hdcp: 0,
            total: 215,
            result: 'T',
          },
          {
            playerId: playerId6,
            first_name: 'Tony',
            last_name: 'Smith',
            average: 211,
            score: 215,
            hdcp: 0,
            total: 215,
            result: 'T',
          },
        ]);
      });

      it("returns match info for the players in match 3", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId7, 1, 230);
        setGameScore(tieGames, playerId8, 1, 230);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = [playerId7, playerId8];
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 1);

        expect(result).toEqual([
          {
            playerId: playerId7,
            first_name: 'Tina',
            last_name: 'Smith',
            average: 201,
            score: 230,
            hdcp: 0,
            total: 230,
            result: 'T',
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 230,
            hdcp: 0,
            total: 230,
            result: 'T',
          },
        ]);
      });
    });

    describe('second round matches with ties', () => {
      it("returns game scores for two advancing players - no round 1 ties", () => {     
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId2, 2, 206);
        setGameScore(tieGames, playerId4, 2, 206);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        // winner of match 0, winner of match 1
        const matchPlayers = [playerId2, playerId4]; 
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 2);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 206,
            hdcp: 0,
            total: 206,
            result: "T",
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 206,
            hdcp: 0,
            total: 206,
            result: "T",
          },
        ]);
      });

      it("returns ties for multiple winners in a match with more than two players", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId2, 2, 211);
        setGameScore(tieGames, playerId4, 2, 211);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;
        
        const matchPlayers = [playerId1, playerId2, playerId4]; 
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 2);

        expect(result).toEqual([
          {
            playerId: playerId1,
            first_name: 'John',
            last_name: 'Doe',
            average: 220,
            score: 202,
            hdcp: 0,
            total: 202,
            result: 'L',
          },
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 211,
            hdcp: 0,
            total: 211,
            result: 'T',
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 211,
            hdcp: 0,
            total: 211,
            result: 'T',
          },          
        ]);
      });

    });

    describe('third round matches with ties', () => { 
      it("returns game 3 scores for three finalists when match 4 is tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie in match 4
        setGameScore(tieGames, playerId2, 2, 211);
        setGameScore(tieGames, playerId4, 2, 211);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(3);
        expect(matchPlayers).toContain(playerId2);
        expect(matchPlayers).toContain(playerId4);
        expect(matchPlayers).toContain(playerId8);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 207, 
            hdcp: 0,
            total: 207,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns game 3 scores for three finalists when match 5 is tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie tie match 5        
        setGameScore(tieGames, playerId5, 2, 211);
        setGameScore(tieGames, playerId8, 2, 211);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(3);
        expect(matchPlayers).toContain(playerId2);
        expect(matchPlayers).toContain(playerId5);
        expect(matchPlayers).toContain(playerId8);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId5,
            first_name: 'Tom',
            last_name: 'Smith',
            average: 221,
            score: 227, // playerId5 game 3 score in mockGames
            hdcp: 0,
            total: 227,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });
      
      it("returns game 3 scores for four finalists when matches 4 and 5 are tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie second-round matches 4 and 5.
        setGameScore(tieGames, playerId2, 2, 211);
        setGameScore(tieGames, playerId4, 2, 211);
        setGameScore(tieGames, playerId5, 2, 221);
        setGameScore(tieGames, playerId8, 2, 221);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(4);
        expect(matchPlayers).toContain(playerId2);
        expect(matchPlayers).toContain(playerId4);
        expect(matchPlayers).toContain(playerId5);
        expect(matchPlayers).toContain(playerId8);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 207,
            hdcp: 0,
            total: 207,
            result: "L",
          },
          {
            playerId: playerId5,
            first_name: 'Tom',
            last_name: 'Smith',
            average: 221,
            score: 227,
            hdcp: 0,
            total: 227,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns two finalists when matches 0 and 1 tie but later matches do not", () => {
        const tieGames = cloneDeep(mockGames);

        // Match 0 tie: player 1 and player 2.        
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);
        // Match 1 tie: player 3 and player 4.
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);
        
        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 0),
        ).toEqual([playerId2]);

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 1),
        ).toEqual([playerId8]);

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns three finalists when matches 3 and 4 are tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie match 3.
        setGameScore(tieGames, playerId7, 1, 230);
        setGameScore(tieGames, playerId8, 1, 230);

        // Tie match 4.
        setGameScore(tieGames, playerId2, 2, 211);
        setGameScore(tieGames, playerId4, 2, 211);

        createTiesBrktList(tieGames);
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(3);
        expect(matchPlayers).toContain(playerId2);
        expect(matchPlayers).toContain(playerId4);
        expect(matchPlayers).toContain(playerId8);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 207,
            hdcp: 0,
            total: 207,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns five finalists when matches 0, 1, and 4 are tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Match 0 tie.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);

        // Match 1 tie.
        setGameScore(tieGames, playerId3, 1, 205);
        setGameScore(tieGames, playerId4, 1, 205);

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
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 0),
        ).toEqual([
          playerId1,
          playerId2,
          playerId3,
          playerId4,
        ]);

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 1),
        ).toEqual([playerId8]);

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(5);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId1,
            first_name: 'John',
            last_name: 'Doe',
            average: 220,
            score: 203,
            hdcp: 0,
            total: 203,
            result: "L",
          },
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId3,
            first_name: 'Joe',
            last_name: 'Doe',
            average: 200,
            score: 197,
            hdcp: 0,
            total: 197,
            result: "L",
          },
          {
            playerId: playerId4,
            first_name: 'Jill',
            last_name: 'Doe',
            average: 190,
            score: 207,
            hdcp: 0,
            total: 207,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns five finalists when matches 2, 3, and 5 are tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Match 2 tie.
        setGameScore(tieGames, playerId5, 1, 225);
        setGameScore(tieGames, playerId6, 1, 225);

        // Match 3 tie.
        setGameScore(tieGames, playerId7, 1, 230);
        setGameScore(tieGames, playerId8, 1, 230);

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
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 0),
        ).toEqual([playerId2]);

        expect(
          tiesBracketMatch.getPlayersForPosition(6, 1),
        ).toEqual([
          playerId5,
          playerId6,
          playerId7,
          playerId8,
        ]);

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(5);
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

        expect(result).toEqual([
          {
            playerId: playerId2,
            first_name: 'Jane',
            last_name: 'Doe',
            average: 210,
            score: 212,
            hdcp: 0,
            total: 212,
            result: "L",
          },
          {
            playerId: playerId5,
            first_name: 'Tom',
            last_name: 'Smith',
            average: 221,
            score: 227,
            hdcp: 0,
            total: 227,
            result: "L",
          },
          {
            playerId: playerId6,
            first_name: 'Tony',
            last_name: 'Smith',
            average: 211,
            score: 217,
            hdcp: 0,
            total: 217,
            result: "L",
          },
          {
            playerId: playerId7,
            first_name: 'Tina',
            last_name: 'Smith',
            average: 201,
            score: 192,
            hdcp: 0,
            total: 192,
            result: "L",
          },
          {
            playerId: playerId8,
            first_name: 'Terri',
            last_name: 'Smith',
            average: 191,
            score: 232,
            hdcp: 0,
            total: 232,
            result: "W",
          },
        ]);
      });  

      it("returns game 3 scores for all eight players when every prior match is tied", () => {
        const tieGames = cloneDeep(mockGames);

        // Tie first-round matches 0 through 3.
        setGameScore(tieGames, playerId1, 1, 210);
        setGameScore(tieGames, playerId2, 1, 210);

        setGameScore(tieGames, playerId3, 1, 205);      
        setGameScore(tieGames, playerId4, 1, 205);      

        setGameScore(tieGames, playerId5, 1, 225);
        setGameScore(tieGames, playerId6, 1, 225);

        setGameScore(tieGames, playerId7, 1, 230);      
        setGameScore(tieGames, playerId8, 1, 230);      

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
        expect(tiesBracketMatch).not.toBeUndefined();
        if (tiesBracketMatch == null) return;

        const matchPlayers = getFinalPlayers(tiesBracketMatch);

        expect(matchPlayers).toHaveLength(8);

        playerIds.forEach((playerId) => {
          expect(matchPlayers).toContain(playerId);
        });
        
        const result = tiesBracketMatch.getMatchInfo(matchPlayers, 3);

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
            result: "T",
          });
        });
      });
    });
  });  

  describe("getMatchInfo() - edge cases", () => {
    it("returns an empty array when matchPlayers is empty", () => {
      expect(bracketMatch).not.toBeUndefined();
      if (bracketMatch == null) return;

      const result = bracketMatch.getMatchInfo([], 1);

      expect(result).toEqual([]);
    });

    it("throws when playerMap is null", () => {
      const noPlayerMapInitData: brktListInitialDataType = {        
        tmntFullData: cloneDeep(mockTmntFullData),        
        divId: divId1,
      };

      const noPlayerMapBrktList = new BracketList(
        brktEntryId10,
        2,
        3,
      );

      noPlayerMapBrktList.createGameScoresMap(testGames);
      expect(noPlayerMapBrktList.brackets.length).toBe(0);
      expect(noPlayerMapBrktList.playersMap).toBeNull();

      const noPlayerMapBracket = new Bracket(oneBrktId1);
      noPlayerMapBrktList.brackets.push(noPlayerMapBracket);
      noPlayerMapBracket.parent = noPlayerMapBrktList;
      const noPlayerMapBracketMatch = noPlayerMapBracket.match;

      expect(noPlayerMapBracketMatch).not.toBeUndefined();
      if (noPlayerMapBracketMatch == null) return;

      expect(() =>
        noPlayerMapBracketMatch.getMatchInfo(
          [playerId1, playerId2],
          1,
        ),
      ).toThrow("playerMap is null");
    });

    it("throws when gameScoreMap is null", () => {
      const noGameScoreMapInitData: brktListInitialDataType = {        
        tmntFullData: cloneDeep(mockTmntFullData),        
        divId: divId1,
      };

      const noGameScoreMapBrktList = new BracketList(
        brktId1,
        2,
        3,
        undefined,
        undefined,
        noGameScoreMapInitData,
      );

      const noGameScoreMapBracket = noGameScoreMapBrktList.brackets[0];
      const noGameScoreMapBracketMatch = noGameScoreMapBracket.match;
      expect(noGameScoreMapBracketMatch).not.toBeUndefined();
      if (noGameScoreMapBracketMatch == null) return;      

      expect(() =>
        noGameScoreMapBracketMatch.getMatchInfo(
          [playerId1, playerId2],
          1,
        ),
      ).toThrow("gameScoreMap is null");
    });
  });

});
