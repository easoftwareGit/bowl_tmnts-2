import { Bracket } from "@/components/brackets/bracketClass";
import { cloneDeep } from "lodash";
import { isOdd } from "@/lib/validation/validation";
import { defaultBrktGames, defaultPlayersPerMatch, initPlayer } from "@/lib/db/initVals";
import { BracketList } from "@/components/brackets/bracketListClass";
import {
  brktId1,
  byeId,
  mockGames,
  mockTmntFullData,
  oneBrktId1,
  playerId1,
  playerId2,
  playerId3,
  playerId4,
  playerId5,
  playerId6,
  playerId7,
  playerId8,  
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";
import { playerType } from "@/lib/types/types";
import { populatePlayerRows } from "@/app/dataEntry/playersForm/populatePlayerRows";

describe('Bracket', () => {

  const quarterFullPlayers = ['player-1', 'player-2'];
  const fullPlayers = ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6', 'player-7', 'player-8'];
  const halfFullPlayers = ['player-1', 'player-2', 'player-3', 'player-4'];

  const addPlayersToBracket = (bracket: Bracket, players: string[]): void => {
    if (players.length > 0 && ((players.length % 2) === 0)) {
      for (let i = 0; i < players.length; i += 2) {
        bracket.addMatch([players[i], players[i + 1]]);
      }
    }
  };

  describe('constructor', () => { 
    it('should initialize with an empty players array when constructed', () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.players).toEqual([]);
    });  
    it('should return the correct # of games', () => {
      const bracket = new Bracket(brktId1);
      const result = bracket.games;
      expect(result).toBe(defaultBrktGames);
    });
    it('should return the correct # of players per match', () => { 
      const bracket = new Bracket(brktId1);
      const result = bracket.playersPerMatch;
      expect(result).toBe(defaultPlayersPerMatch);
    })
    it('should return the correct # of players per bracket', () => { 
      const bracket = new Bracket(brktId1);
      const result = bracket.playersPerBracket;
      expect(result).toBe(defaultPlayersPerMatch ** defaultBrktGames);
    })  
  })

  describe('set parent', () => {
    it("should set parent bracketList, create player map", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const mockPlayerRows = populatePlayerRows(mockTmntFullData);
      bracketList.addBrktEntries(mockPlayerRows);
      bracketList.createGameScoresMap(mockGames); 
      bracketList.createPlayersMap(mockTmntFullData.divEntries, mockTmntFullData.divs[0]);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap?.size).toBe(8); // 8 mock players
      expect(bracket.parent.playerMap?.has(byeId)).toBe(false);
    });
    it("should set parent bracketList, create no player map when no bracket entries", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(mockTmntFullData.divEntries, mockTmntFullData.divs[0]);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap).toBeNull(); // no brktEntries 
    });
    it("should set parent bracketList, create no player map when divEntries is null", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const mockPlayerRows = populatePlayerRows(mockTmntFullData);
      bracketList.addBrktEntries(mockPlayerRows);

      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(null as any, mockTmntFullData.divs[0]);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap).toBeNull(); // no divEntries
    });
    it("should set parent bracketList, create no player map when divEntries is not an array", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const mockPlayerRows = populatePlayerRows(mockTmntFullData);
      bracketList.addBrktEntries(mockPlayerRows);

      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(mockTmntFullData as any, mockTmntFullData.divs[0]);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap).toBeNull(); // no divEntries
    });
    it("should set parent bracketList, create no player map when divEntries is empty", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const mockPlayerRows = populatePlayerRows(mockTmntFullData);
      bracketList.addBrktEntries(mockPlayerRows);

      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap([], mockTmntFullData.divs[0]);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap).toBeNull(); // no divEntries
    });
    it("should set parent bracketList, create no player map when div is null", () => {
      const bracket = new Bracket(brktId1);
      expect(bracket.parent).toBeUndefined();

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );
      const mockPlayerRows = populatePlayerRows(mockTmntFullData);
      bracketList.addBrktEntries(mockPlayerRows);

      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(mockTmntFullData.divEntries, null as any);

      bracket.parent = bracketList;
      expect(bracket.parent).toBe(bracketList);
      expect(bracket.parent.playerMap).toBeNull(); // no divEntries
    });
  })

  describe('addMatch', () => {

    it('should add match to bracket', () => { 
      const bracket = new Bracket();
      const result = bracket.addMatch(['player-1', 'player-2']);
      expect(result).toBe(2);
      expect(bracket.players.length).toBe(2);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2']);
    })
    it('should return errInvalidMatch when invalid length match to bracket', () => { 
      const bracket = new Bracket();
      const result = bracket.addMatch(['player-1', 'player-2','player-3']);
      expect(result).toBe(Bracket.errInvalidMatch);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should NOT add an empty match to bracket', () => { 
      const bracket = new Bracket();
      const result = bracket.addMatch([]);
      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should NOT add a null match to bracket', () => { 
      const bracket = new Bracket();
      const result = bracket.addMatch(null as any);
      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should return errBracketFull when bracket is full', () => { 
      const bracket = new Bracket();
      const fullPlayers = ['player-1', 'player-2', 'player-3', 'player-4', 'player-5', 'player-6', 'player-7', 'player-8'];
      addPlayersToBracket(bracket, fullPlayers); 
      const result = bracket.addMatch(['player-9', 'player-10']);
      expect(result).toBe(Bracket.errBracketIsFull);     
    })
    it('should return errAlreadyInBracket when first player in match is already in bracket', () => { 
      const bracket = new Bracket();      
      addPlayersToBracket(bracket, halfFullPlayers);
      const result = bracket.addMatch(['player-1', 'player-5']);
      expect(result).toBe(Bracket.errAlreadyInBracket);     
      expect(bracket.players.length).toBe(4);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
    })
    it('should return errAlreadyInBracket when second player in match is already in bracket', () => { 
      const bracket = new Bracket();
      addPlayersToBracket(bracket, halfFullPlayers);
      const result = bracket.addMatch(['player-5', 'player-2']);
      expect(result).toBe(Bracket.errAlreadyInBracket);     
      expect(bracket.players.length).toBe(4);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
    })
  })

  describe('clearPlayers', () => {
    it ('should clear players', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, halfFullPlayers);
      expect(bracket.players.length).toBe(4);
      bracket.clearPlayers()
      expect(bracket.players.length).toBe(0);      
    })
  })

  describe('emptySpots', () => { 
    it('should return correct number of empty spots when bracket is not full', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, quarterFullPlayers);
      const result = bracket.emptySpots();
      expect(result).toBe(6);
    });
    it('should return 0 when bracket is full', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, fullPlayers);
      const result = bracket.emptySpots();
      expect(result).toBe(0);
    })
  })

  describe('getMatchInfo', () => {

    it("returns completed match scores for all matches when there are no ties or byes", () => {
      const bracket = new Bracket(brktId1);

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );

      const mockPlayerRows = populatePlayerRows(mockTmntFullData);

      bracketList.addBrktEntries(mockPlayerRows);
      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      bracket.parent = bracketList;

      // add the eight seeded players
      mockTmntFullData.players.forEach((_, i) => {
        if ((i % 2) === 0) {
          bracket.addMatch([
            mockTmntFullData.players[i].id,
            mockTmntFullData.players[i + 1].id,
          ]);
        }
      });

      for (let match = 0 as const; match <= 6; match++) {
        const gameNum =
          match <= 3 ? 1 :
          match <= 5 ? 2 : 3;

        const scores = bracket.getMatchScores(match, gameNum);

        expect(scores.length).toBeGreaterThan(0);

        scores.forEach((score) => {
          expect(score.playerId).toBeTruthy();
          expect(score.first_name).toBeTruthy();
          expect(score.score).toBeDefined();
          expect(score.hdcp).toBeDefined();
          expect(score.total).toBeDefined();
        });
      }
    });

    it("returns a bye player with score 0 and total 0", () => {
      const bracket = new Bracket(brktId1);

      const byePlayer: playerType = {
        ...initPlayer,
        id: byeId,
        first_name: "Bye",
        average: 0,
      };

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
        undefined,
        byePlayer,
      );

      const mockPlayerRows = populatePlayerRows(mockTmntFullData);

      bracketList.addBrktEntries(mockPlayerRows);
      bracketList.createGameScoresMap(mockGames);
      bracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      bracket.parent = bracketList;

      bracket.addMatch([
        mockTmntFullData.players[0].id,
        byeId,
      ]);

      const scores = bracket.getMatchScores(0, 1);

      expect(scores).toHaveLength(2);

      const bye = scores.find((p) => p.playerId === byeId);

      expect(bye).toBeDefined();
      expect(bye?.first_name).toBe("Bye");
      expect(bye?.score).toBe(0);
      expect(bye?.hdcp).toBe(0);
      expect(bye?.total).toBe(0);
    });

    it("returns all tied winners from a prior match", () => {
      const bracket = new Bracket(brktId1);
      const tmntData = cloneDeep(mockTmntFullData);
      const games = cloneDeep(mockGames);

      // force players 1 & 2 to tie game 1
      games.find(g => g.player_id === tmntData.players[0].id && g.game_num === 1)!.score = 250;
      games.find(g => g.player_id === tmntData.players[1].id && g.game_num === 1)!.score = 250;

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );

      const mockPlayerRows = populatePlayerRows(tmntData);

      bracketList.addBrktEntries(mockPlayerRows);
      bracketList.createGameScoresMap(games);
      bracketList.createPlayersMap(
        tmntData.divEntries,
        tmntData.divs[0],
      );

      bracket.parent = bracketList;

      tmntData.players.forEach((_, i) => {
        if ((i % 2) === 0) {
          bracket.addMatch([
            tmntData.players[i].id,
            tmntData.players[i + 1].id,
          ]);
        }
      });

      const scores = bracket.getMatchScores(4, 2);

      expect(scores.length).toBeGreaterThan(2);

      expect(
        scores.filter(
          s =>
            s.playerId === tmntData.players[0].id ||
            s.playerId === tmntData.players[1].id,
        ),
      ).toHaveLength(2);
    });

    it("returns undefined score and total when a player's game has not been entered", () => {
      const bracket = new Bracket(brktId1);
      const games = cloneDeep(mockGames);
      const playerId = mockTmntFullData.players[0].id;
      const index = games.findIndex(
        g => g.player_id === playerId && g.game_num === 1,
      );

      games.splice(index, 1);

      const bracketList = new BracketList(
        brktId1,
        defaultPlayersPerMatch,
        defaultBrktGames,
      );

      const mockPlayerRows = populatePlayerRows(mockTmntFullData);

      bracketList.addBrktEntries(mockPlayerRows);
      bracketList.createGameScoresMap(games);
      bracketList.createPlayersMap(
        mockTmntFullData.divEntries,
        mockTmntFullData.divs[0],
      );

      bracket.parent = bracketList;

      mockTmntFullData.players.forEach((_, i) => {
        if ((i % 2) === 0) {
          bracket.addMatch([
            mockTmntFullData.players[i].id,
            mockTmntFullData.players[i + 1].id,
          ]);
        }
      });

      const scores = bracket.getMatchScores(0, 1);
      const player = scores.find(s => s.playerId === playerId);

      expect(player).toBeDefined();
      expect(player?.score).toBeUndefined();
      expect(player?.total).toBeUndefined();
    });

    it("returns an empty array when the bracket has no parent", () => {
      const bracket = new Bracket(brktId1);

      expect(bracket.getMatchScores(0, 1)).toEqual([]);
    });

  });
  
  describe('hasByePlayer', () => { 
    it('should return false when bracket has no bye player', () => {
      const bracket = new Bracket();
      const playersToAdd = ['player-1', 'player-2', 'player-3', 'player-4'];
      addPlayersToBracket(bracket, playersToAdd);
      expect(bracket.players.length).toBe(4);
      expect(bracket.hasByePlayer()).toBe(false);
    });    
    it('should return true when bracket has bye player', () => {
      const bracket = new Bracket();
      const playersToAdd = ['player-1', 'player-2', 'player-3', 'bye_player-4'];
      addPlayersToBracket(bracket, playersToAdd);
      expect(bracket.players.length).toBe(4);
      expect(bracket.hasByePlayer()).toBe(true);
    });    
  })

  describe('numEmptySpots', () => { 
    it('should return correct number of empty spots when bracket is not full', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, quarterFullPlayers);
      const result = bracket.numEmptySpots();
      expect(result).toBe(6);
    });
    it('should return 0 when bracket is full', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, fullPlayers);
      const result = bracket.numEmptySpots();
      expect(result).toBe(0);
    });
  })

  describe('playerIndex', () => { 
    it('should return correct index when player exists in array', () => {
      const bracket = new Bracket();
      addPlayersToBracket(bracket, halfFullPlayers);
      const result = bracket.playerIndex('player-2');
      expect(result).toBe(1);
    });
    it('should return -1 when player does not exist in array', () => { 
      const bracket = new Bracket();
      addPlayersToBracket(bracket, quarterFullPlayers);
      const result = bracket.playerIndex('player-4');
      expect(result).toBe(-1);
    })
    it('should return -1 when players array is empty', () => { 
      const bracket = new Bracket();
      const result = bracket.playerIndex('player-4');
      expect(result).toBe(-1);
    })
  })

  describe('populateBracket', () => {

    const getBracketSeeds = () => {
      return mockTmntFullData.brktSeeds.filter(
        (seed) => seed.one_brkt_id === oneBrktId1,
      );
    };

    it('should populate bracket with players in seed order', () => {
      const bracket = new Bracket();
      const brktSeeds = getBracketSeeds();

      bracket.populateBracket(brktSeeds);

      expect(bracket.players).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ]);
    });

    it('should sort bracket seeds before populating bracket', () => {
      const bracket = new Bracket();
      const brktSeeds = getBracketSeeds().reverse();

      bracket.populateBracket(brktSeeds);

      expect(bracket.players).toEqual([
        playerId1,
        playerId2,
        playerId3,
        playerId4,
        playerId5,
        playerId6,
        playerId7,
        playerId8,
      ]);
    });

    it('should NOT populate bracket when there are too few bracket seeds', () => {
      const bracket = new Bracket();
      const brktSeeds = getBracketSeeds().slice(0, 7);

      bracket.populateBracket(brktSeeds);

      expect(bracket.players).toEqual([]);
    });

    it('should NOT populate bracket when there are too many bracket seeds', () => {
      const bracket = new Bracket();
      const brktSeeds = [
        ...getBracketSeeds(),
        getBracketSeeds()[0],
      ];

      bracket.populateBracket(brktSeeds);

      expect(bracket.players).toEqual([]);
    });

    it('should NOT populate bracket when bracket seeds is null', () => {
      const bracket = new Bracket();

      bracket.populateBracket(null as any);

      expect(bracket.players).toEqual([]);
    });

    it('should NOT populate bracket when bracket seeds is not an array', () => {
      const bracket = new Bracket();

      bracket.populateBracket({} as any);

      expect(bracket.players).toEqual([]);
    });
  });

  describe('shuffle', () => { 
    const baseBracket = new Bracket();
    addPlayersToBracket(baseBracket, fullPlayers);

    it('should shuffle players in bracket', () => { 
      const bracket = cloneDeep(baseBracket);  
      bracket.shuffle();
  
      // is the bracket shuffled?
      expect(bracket.players).not.toEqual(baseBracket);
      // is the bracket the same size?
      expect(bracket.players.length).toBe(baseBracket.players.length);
      // are the players the same?
      for (let i = 0; i < bracket.players.length; i++) {
        expect(baseBracket.players.find((p) => p === bracket.players[i])).toBeTruthy();
      }
      // are the matches intact?
      for (let i = 0; i < bracket.players.length; i++) {
        // get opponent index in shuffled bracket
        let oppoIndex;
        if (isOdd(i)) { 
          oppoIndex = i - 1;
        } else {
          oppoIndex = i + 1;
        }
        // get opponent id in base bracket, unshuffled
        const playerId = bracket.players[i];
        const baseIndex = baseBracket.players.indexOf(playerId);
        let oppoBaseIndex;
        if (isOdd(baseIndex)) { 
          oppoBaseIndex = baseIndex - 1;
        } else {
          oppoBaseIndex = baseIndex + 1;
        }
        // check if the player has the same opponent in both shuffled and unshuffled brackets
        expect(bracket.players[oppoIndex]).toEqual(baseBracket.players[oppoBaseIndex]);
      }
    });
    it('should not shuffle players if bracket is not full', () => { 
      const bracket = new Bracket();
      addPlayersToBracket(bracket, quarterFullPlayers);
      bracket.shuffle();
  
      expect(bracket.players.length).toBe(2);
      expect(bracket.players).toEqual(['player-1', 'player-2']);
    });
  })

});
