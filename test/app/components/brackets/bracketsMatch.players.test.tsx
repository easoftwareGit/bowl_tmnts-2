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

describe("BracketMatch - players funnctions", () => {
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

  describe('constrctor', () => {
    it('sets the parent', () => {
      expect(bracketMatch.parent).toEqual(bracket);
    });

    it('sets the gameScoreMap', () => {
      expect(bracketMatch.gameScoreMap).toEqual(bracket.parent?.gameScoreMap);
    });

    it('sets the playerMap', () => {
      expect(bracketMatch.playerMap).toEqual(bracket.parent?.playerMap);
    });
  });

  describe("getPlayersForPosition()", () => {
    // The first 4 matches are seeded. [match, position, seed]
    it.each([
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 2],
      [1, 1, 3],
      [2, 0, 4],
      [2, 1, 5],
      [3, 0, 6],
      [3, 1, 7],
    ] as const)(
      "returns player in match %i position %i, seed %i",
      (matchNumber, position, seed) => {
        expect(bracketMatch.getPlayersForPosition(matchNumber, position)).toEqual([
          playerIds[seed],
        ]);
      },
    );

    it('gets the players for the second round matches', () => { 
      // 1st round matches:
      // match 0 playerId1 vs playerId2: playerId2 wins
      // match 1 playerId3 vs playerId4: playerId4 wins
      // match 2 playerId5 vs playerId6: playerId5 wins
      // match 3 playerId7 vs playerId8: playerId8 wins
      expect(bracketMatch.getPlayersForPosition(4, 0)).toEqual([playerId2]);
      expect(bracketMatch.getPlayersForPosition(4, 1)).toEqual([playerId4]);
      expect(bracketMatch.getPlayersForPosition(5, 0)).toEqual([playerId5]);
      expect(bracketMatch.getPlayersForPosition(5, 1)).toEqual([playerId8]);
    })

    it('gets the players for the third round matche', () => { 
      // 1st round matches:
      // match 0 playerId1 vs playerId2: playerId2 wins
      // match 1 playerId3 vs playerId4: playerId4 wins
      // match 2 playerId5 vs playerId6: playerId5 wins
      // match 3 playerId7 vs playerId8: playerId8 wins
      // second round matches:
      // match 4 playerId2 vs playerId4: playerId2 wins
      // match 5 playerId5 vs playerId8: playerId8 wins
      expect(bracketMatch.getPlayersForPosition(6, 0)).toEqual([playerId2]);
      expect(bracketMatch.getPlayersForPosition(6, 1)).toEqual([playerId8]);
    })

  });

  describe("getMatchPlayers()", () => {

    it("returns the players for all first round matches", () => {
      expect(bracketMatch.getMatchPlayers(0)).toEqual([
        playerId1,
        playerId2,
      ]);

      expect(bracketMatch.getMatchPlayers(1)).toEqual([
        playerId3,
        playerId4,
      ]);

      expect(bracketMatch.getMatchPlayers(2)).toEqual([
        playerId5,
        playerId6,
      ]);

      expect(bracketMatch.getMatchPlayers(3)).toEqual([
        playerId7,
        playerId8,
      ]);
    });

    it("returns the players for the second round matches", () => {
      expect(bracketMatch.getMatchPlayers(4)).toEqual([
        playerId2,
        playerId4,
      ]);

      expect(bracketMatch.getMatchPlayers(5)).toEqual([
        playerId5,
        playerId8,
      ]);
    });

    it("returns the players for the championship match", () => {
      expect(bracketMatch.getMatchPlayers(6)).toEqual([
        playerId2,
        playerId8,
      ]);
    });  

  });

  describe('getMatchPlayers() - ties', () => {    
    
    let tiesBrktList: BracketList;
    let tiesBracket: Bracket;

    const setGameScore = (
      games: gameType[],
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

    it("returns three players when match 0 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 0.
      setGameScore(tieGames, playerId1, 1, 210);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      expect(tieBracketMatch.getMatchPlayers(4)).toEqual([
        playerId1,
        playerId2,
        playerId4,
      ]);
    });

    it("returns three finalists when match 4 is tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 4.
      setGameScore(tieGames, playerId4, 2, 211);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      expect(tieBracketMatch.getMatchPlayers(6)).toEqual([
        playerId2,
        playerId4,
        playerId8,
      ]);
    });

    it("returns four finalists when matches 4 and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 4.
      setGameScore(tieGames, playerId4, 2, 211);
      // Tie match 5.
      setGameScore(tieGames, playerId5, 2, 231);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      expect(tieBracketMatch.getMatchPlayers(6)).toEqual([
        playerId2,
        playerId4,
        playerId5,
        playerId8,
      ]);
    });

    it("returns five finalists when matches 1, 4, and 5 are tied", () => {
      const tieGames = cloneDeep(mockGames);

      // Tie match 1:
      // playerId3 and playerId4 advance to match 4.
      setGameScore(tieGames, playerId3, 1, 205);

      // Tie all three players in match 4:
      // playerId2, playerId3, and playerId4.
      setGameScore(tieGames, playerId3, 2, 211);
      setGameScore(tieGames, playerId4, 2, 211);

      // Tie match 5:
      // playerId5 and playerId8.
      setGameScore(tieGames, playerId5, 2, 231);

      createTiesBrktList(tieGames);
      createBracketWithTies();
      const tieBracketMatch = createTestBracketMatch();

      expect(tieBracketMatch.getMatchPlayers(6)).toEqual([
        playerId2,
        playerId3,
        playerId4,
        playerId5,
        playerId8,
      ]);
    }); 
  })

});
