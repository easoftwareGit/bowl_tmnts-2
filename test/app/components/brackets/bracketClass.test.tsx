import { BracketList } from "@/components/brackets/bracketListClass";
import { Bracket } from "@/components/brackets/bracketClass";
import { cloneDeep } from "lodash";
import { isOdd } from "@/lib/validation";

describe('Bracket', () => {

  const mockBracketList = new BracketList("brk_test1", 2, 3);

  describe('constructor', () => { 
    it('should initialize with an empty players array when constructed', () => {
      const bracket = new Bracket(mockBracketList);
      expect(bracket.players).toEqual([]);
    });  
    it('should return the correct # of games', () => {
      const bracket = new Bracket(mockBracketList);
      const result = bracket.games;
      expect(result).toBe(3);
    });
    it('should return the correct # of players per match', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.playersPerMatch;
      expect(result).toBe(2);
    })
    it('should return the correct # of players per bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.playersPerBracket;
      expect(result).toBe(8);
    })  
  })
  describe('addPlayer', () => {
    it('should return new player count when valid player added', () => {
      const bracket = new Bracket(mockBracketList);
      const playerId = 'test-player-id';
      const result = bracket.addPlayer(playerId);
      expect(result).toBe(1);
    });
    it('should return errInvalidPlayerId when empty player id provided', () => {
      const bracket = new Bracket(mockBracketList);
      const emptyPlayerId = '';
      const result = bracket.addPlayer(emptyPlayerId);
      expect(result).toBe(Bracket.errInvalidPlayerId);
    });
    it('should return correct index when player exists in bracket', () => {
      const bracket = new Bracket(mockBracketList);
      const playerId = 'test-player-id';
      bracket.addPlayer(playerId);
      const result = bracket.playerIndex(playerId);
      expect(result).toBe(0);
    });
    it('should return errInvalidPlayerId when passed ""', () => { 
      const bracket = new Bracket(mockBracketList);
      const emptyPlayerId = '';
      const result = bracket.playerIndex(emptyPlayerId);
      expect(result).toBe(Bracket.errInvalidPlayerId);
    })
    it('should return errInvalidPlayerId when passed null', () => { 
      const bracket = new Bracket(mockBracketList);
      const emptyPlayerId = null as any;
      const result = bracket.playerIndex(emptyPlayerId);
      expect(result).toBe(Bracket.errInvalidPlayerId);
    })
    it('should return errAlreadyInBracket when player already exists in bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const playerId = 'test-player-id';
      bracket.addPlayer(playerId);
      const result = bracket.addPlayer(playerId);
      expect(result).toBe(Bracket.errAlreadyInBracket);
    })  
    it('should return errBracketFull when bracket is full', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
      bracket.addPlayer('player-5');
      bracket.addPlayer('player-6');
      bracket.addPlayer('player-7');
      bracket.addPlayer('player-8');      
      const result = bracket.addPlayer('player-9');
      expect(result).toBe(Bracket.errBracketIsFull);     
    })
    it('should return players array when valid player added', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      const result = bracket.players;
      expect(result).toEqual(['player-1', 'player-2']);
    })
  })
  describe('addMatch', () => { 
    it('should add match to bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.addMatch(['player-1', 'player-2']);
      expect(result).toBe(2);
      expect(bracket.players.length).toBe(2);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2']);
    })
    it('should return errInvalidMatch when invalid length match to bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.addMatch(['player-1', 'player-2','player-3']);
      expect(result).toBe(Bracket.errInvalidMatch);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should NOT add an empty match to bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.addMatch([]);
      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should NOT add a null match to bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.addMatch(null as any);
      expect(result).toBe(Bracket.errInvalidPlayerId);
      expect(bracket.players.length).toBe(0);
      const result2 = bracket.players;
      expect(result2).toEqual([]);
    })
    it('should return errBracketFull when bracket is full', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
      bracket.addPlayer('player-5');
      bracket.addPlayer('player-6');
      bracket.addPlayer('player-7');
      bracket.addPlayer('player-8');      
      const result = bracket.addMatch(['player-9', 'player-10']);
      expect(result).toBe(Bracket.errBracketIsFull);     
    })
    it('should return errAlreadyInBracket when first player in match is already in bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
      const result = bracket.addMatch(['player-1', 'player-5']);
      expect(result).toBe(Bracket.errAlreadyInBracket);     
      expect(bracket.players.length).toBe(4);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
    })
    it('should return errAlreadyInBracket when second player in match is already in bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
      const result = bracket.addMatch(['player-5', 'player-2']);
      expect(result).toBe(Bracket.errAlreadyInBracket);     
      expect(bracket.players.length).toBe(4);
      const result2 = bracket.players;
      expect(result2).toEqual(['player-1', 'player-2', 'player-3', 'player-4']);
    })
  })
  describe('clearPlayers', () => { 
    const bracket = new Bracket(mockBracketList);
    bracket.addPlayer('player-1');
    bracket.addPlayer('player-2');
    bracket.addPlayer('player-3'); 
    expect(bracket.players.length).toBe(3);
    bracket.clearPlayers()
    expect(bracket.players.length).toBe(0);
  })
  describe('emptySpots', () => { 
    it('should return correct number of empty spots when bracket is not full', () => {
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      const result = bracket.emptySpots();
      expect(result).toBe(6);
    });
    it('should return 0 when bracket is full', () => {
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
      bracket.addPlayer('player-5');
      bracket.addPlayer('player-6');
      bracket.addPlayer('player-7');
      bracket.addPlayer('player-8');      
      const result = bracket.emptySpots();
      expect(result).toBe(0);
    })
  })
  describe('getMatch', () => {
    const bracket = new Bracket(mockBracketList);
    bracket.addPlayer('player-1');
    bracket.addPlayer('player-2');
    bracket.addPlayer('player-3'); 
    bracket.addPlayer('player-4'); 
    bracket.addPlayer('player-5');
    bracket.addPlayer('player-6');
    bracket.addPlayer('player-7');
    bracket.addPlayer('player-8');

    it('should return correct match when match index is valid', () => {
      const result = bracket.getMatch(2);
      expect(result).toEqual(['player-3', 'player-4']);
    });
    it('should return correct match when match index is 0', () => {
      const result = bracket.getMatch(0);
      expect(result).toEqual(['player-1', 'player-2']);
    });
    it('should return correct match when match index is max valid index', () => {
      const result = bracket.getMatch(6);
      expect(result).toEqual(['player-7', 'player-8']);
    });
    it('should return empty array when match index is too large', () => {
      const result = bracket.getMatch(10);
      expect(result).toEqual([]);
    });
    it('should return empty array when match index is negative', () => {
      const result = bracket.getMatch(-1);
      expect(result).toEqual([]);
    })
    it('should return empty array when match index is odd (1)', () => {
      const result = bracket.getMatch(1);
      expect(result).toEqual(['player-1', 'player-2']);
    })
    it('should return empty array when match index is odd (3)', () => {
      const result = bracket.getMatch(3);
      expect(result).toEqual(['player-3', 'player-4']);
    })
  })
  // describe('findMatch', () => { 
  //   // const bracket = new Bracket(mockBracketList); 
  //   // const player1Id = 'player1';
  //   // const player2Id = 'player2';
  //   // const player3Id = 'player3';
  //   // const player4Id = 'player4';
  //   // bracket.addPlayer(player1Id);
  //   // bracket.addPlayer(player2Id);
  //   // bracket.addPlayer(player3Id);
  //   // bracket.addPlayer(player4Id);

  //   // it('should return first player index when player IDs match a valid match', () => {
  //   //   const result = bracket.findMatch([player1Id, player2Id]);
  //   //   expect(result).toBe(0);
  
  //   //   const result2 = bracket.findMatch([player3Id, player4Id]);
  //   //   expect(result2).toBe(2);
  //   // });  
  //   // it('should return first player index when player IDs match a valid match, but different order', () => {
  //   //   const result = bracket.findMatch([player2Id, player1Id]);
  //   //   expect(result).toBe(0);
  
  //   //   const result2 = bracket.findMatch([player4Id, player3Id]);
  //   //   expect(result2).toBe(2);
  //   // });  
  //   // it('should return -1 when a player id is not found in bracket', () => { 
  //   //   const result = bracket.findMatch([player2Id, player3Id]);
  //   //   expect(result).toBe(-1);

  //   //   const result2 = bracket.findMatch([player3Id, player2Id]);
  //   //   expect(result2).toBe(-1);
  //   // })
  //   // it('should return -1 if player ids length is !== playersInMatch', () => { 
  //   //   const result = bracket.findMatch([player2Id, player3Id, player4Id]);
  //   //   expect(result).toBe(-1);
  //   // })
  //   // it('should return -1 if players ids array is empty', () => { 
  //   //   const result = bracket.findMatch([]);
  //   //   expect(result).toBe(-1);
  //   // })
  //   // it('should return -1 if players array is ', () => { 
  //   //   const emptyBracket = new Bracket(mockBracketList); 
  //   //   const player1Id = 'player1';
  //   //   const player2Id = 'player2';

  //   //   const result = emptyBracket.findMatch([player1Id, player2Id]);
  //   //   expect(result).toBe(-1);  
  //   // })
  // })
  // describe('findMissingPlayerIndex', () => { 
  //   // const bracket = new Bracket(mockBracketList); 
  //   // const player1Id = 'player1';
  //   // const player2Id = 'player2';
  //   // const player3Id = 'player3';
  //   // const player4Id = 'player4';
  //   // bracket.addPlayer(player1Id);
  //   // bracket.addPlayer(player2Id);
  //   // bracket.addPlayer(player3Id);
  //   // bracket.addPlayer(player4Id);

  //   // it('should return index of missing player when player not in the bracket', () => { 
  //   //   const player5Id = 'player5';
  //   //   const player6Id = 'player6';

  //   //   const result = bracket.findMissingPlayerIndex([player5Id, player6Id]);
  //   //   expect(result).toBe(0);

  //   //   const result2 = bracket.findMissingPlayerIndex([player1Id, player5Id]);
  //   //   expect(result2).toBe(1);
  //   // })
  //   // it('should return -1 when all players are in the bracket', () => { 
  //   //   const result = bracket.findMissingPlayerIndex([player1Id, player2Id, player3Id, player4Id]);
  //   //   expect(result).toBe(-1);
  //   // })
  // })
  // describe('firstMatchVs' , () => {
  //   // const bracket = new Bracket(mockBracketList); 
  //   // const player1Id = 'player1';
  //   // const player2Id = 'player2';
  //   // const player3Id = 'player3';
  //   // const player4Id = 'player4';
  //   // bracket.addPlayer(player1Id);
  //   // bracket.addPlayer(player2Id);
  //   // bracket.addPlayer(player3Id);
  //   // bracket.addPlayer(player4Id);    

  //   // it('should return correct opponent index for even and odd player positions', () => {
  //   //   const evenIndexOpponent = bracket.firstMatchVs(0);
  //   //   const oddIndexOpponent = bracket.firstMatchVs(1);
  //   //   expect(evenIndexOpponent).toBe(1);
  //   //   expect(oddIndexOpponent).toBe(0);
  //   // });
  //   // it('should return -1 for invalid position', () => {
  //   //   const result1 = bracket.firstMatchVs(-1);
  //   //   expect(result1).toBe(-1);
  //   //   const result2 = bracket.firstMatchVs(8);
  //   //   expect(result2).toBe(-1);
  //   // });
  // })
  // describe('firstPlayerInMatchIndex', () => { 
  //   // const bracket = new Bracket(mockBracketList); 
  //   // const player1Id = 'player1';
  //   // const player2Id = 'player2';
  //   // const player3Id = 'player3';
  //   // const player4Id = 'player4';
  //   // bracket.addPlayer(player1Id);
  //   // bracket.addPlayer(player2Id);
  //   // bracket.addPlayer(player3Id);
  //   // bracket.addPlayer(player4Id);    

  //   // it('should calculate correct starting position for first player in match when given valid player index', () => {
  //   //   const result = bracket.firstPlayerInMatchIndex(2);
  //   //   expect(result).toBe(2);
  //   //   const result2 = bracket.firstPlayerInMatchIndex(3);
  //   //   expect(result2).toBe(2);      
  //   // });
  //   // it('should return -1 for invalid player index', () => {
  //   //   const result = bracket.firstPlayerInMatchIndex(-1);
  //   //   expect(result).toBe(-1);
  //   //   const result2 = bracket.firstPlayerInMatchIndex(8);
  //   //   expect(result2).toBe(-1);      
  //   // });
  // })
  // describe('isMatchFull', () => { 
  //   // const bracket = new Bracket(mockBracketList);
  //   // bracket.addPlayer('player-1');
  //   // bracket.addPlayer('player-2');
  //   // bracket.addPlayer('player-3');

  //   // it('should return true when match is full', () => {
  //   //   const result = bracket.isMatchFull(0);
  //   //   expect(result).toBe(true);
  //   // })
  //   // it('should return false when match is not full', () => { 
  //   //   const result = bracket.isMatchFull(2);
  //   //   expect(result).toBe(false);
  //   // })
  //   // it('should return false when match has a bye id', () => {
  //   //   const byeBracket = new Bracket(mockBracketList);
  //   //   byeBracket.addPlayer('player-1');
  //   //   byeBracket.addPlayer('player-2');
  //   //   byeBracket.addPlayer('player-3');
  //   //   byeBracket.addPlayer(Bracket.byePlayerId);
  
  //   //   const result = bracket.isMatchFull(2);
  //   //   expect(result).toBe(false);
  //   // })
  //   // it('should return false when index is invalid', () => { 
  //   //   const result = bracket.isMatchFull(-1);
  //   //   expect(result).toBe(false);
  //   //   const result2 = bracket.isMatchFull(1);
  //   //   expect(result).toBe(false);
  //   //   const result3 = bracket.isMatchFull(bracket.players.length);
  //   //   expect(result3).toBe(false);
  //   // })
  // })
  // describe('playerIdsInMatch', () => { 
  //   // const bracket = new Bracket(mockBracketList);
  //   // bracket.addPlayer('player-1');
  //   // bracket.addPlayer('player-2');
  //   // bracket.addPlayer('player-3');
  //   // bracket.addPlayer('player-4');

  //   // it('should return sorted array of player IDs when valid player index is provided', () => {      
  //   //   const result = bracket.playerIdsInMatch(0);
  //   //   expect(result).toEqual(['player-1', 'player-2']);
  //   //   const result2 = bracket.playerIdsInMatch(1);
  //   //   expect(result2).toEqual(['player-1', 'player-2']);
  //   //   const result3 = bracket.playerIdsInMatch(2);
  //   //   expect(result3).toEqual(['player-3', 'player-4']);
  //   //   const result4 = bracket.playerIdsInMatch(3);
  //   //   expect(result4).toEqual(['player-3', 'player-4']);
  //   // });
  //   // it('should return [] for invalid index', () => { 
  //   //   const result = bracket.playerIdsInMatch(-1);
  //   //   expect(result).toHaveLength(0);
  //   //   const result2 = bracket.playerIdsInMatch(bracket.players.length);
  //   //   expect(result2).toHaveLength(0);
  //   // })
  // })
  describe('playerIndex', () => { 
    it('should return correct index when player exists in array', () => {
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3'); 
      const result = bracket.playerIndex('player-2');
      expect(result).toBe(1);
    });
    it('should return -1 when player does not exist in array', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3'); 
      const result = bracket.playerIndex('player-4');
      expect(result).toBe(-1);
    })
    it('should return -1 when players array is empty', () => { 
      const bracket = new Bracket(mockBracketList);
      const result = bracket.playerIndex('player-4');
      expect(result).toBe(-1);
    })
  })
  describe('removePlayer', () => { 
    it('should remove player from bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
  
      bracket.removePlayers(['player-1']);
      expect(bracket.players.length).toBe(3);
      expect(bracket.playerIndex('player-1')).toBe(-1);
    });
    it('should remove players from bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
  
      bracket.removePlayers(['player-1', 'player-2']);
      expect(bracket.players.length).toBe(2);
      expect(bracket.playerIndex('player-1')).toBe(-1);
      expect(bracket.playerIndex('player-2')).toBe(-1);
    });
    it('should not remove non found players from bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
  
      bracket.removePlayers(['player-5', 'player-6']);
      expect(bracket.players.length).toBe(4);
      expect(bracket.playerIndex('player-1')).toBe(0);
      expect(bracket.playerIndex('player-2')).toBe(1);
      expect(bracket.playerIndex('player-3')).toBe(2);
      expect(bracket.playerIndex('player-4')).toBe(3);
      expect(bracket.playerIndex('player-5')).toBe(-1);
      expect(bracket.playerIndex('player-6')).toBe(-1);
    });
    it('should not remove players when passed empty arrayfrom bracket', () => { 
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.addPlayer('player-3');
      bracket.addPlayer('player-4');
  
      bracket.removePlayers([]);
      expect(bracket.players.length).toBe(4);
      expect(bracket.playerIndex('player-1')).toBe(0);
      expect(bracket.playerIndex('player-2')).toBe(1);
      expect(bracket.playerIndex('player-3')).toBe(2);
      expect(bracket.playerIndex('player-4')).toBe(3);
    });
  })
  describe('shuffle', () => { 
    const baseBracket = new Bracket(mockBracketList);
    baseBracket.addPlayer('player-1');
    baseBracket.addPlayer('player-2');
    baseBracket.addPlayer('player-3');
    baseBracket.addPlayer('player-4');
    baseBracket.addPlayer('player-5');
    baseBracket.addPlayer('player-6');
    baseBracket.addPlayer('player-7');
    baseBracket.addPlayer('player-8');

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
      const bracket = new Bracket(mockBracketList);
      bracket.addPlayer('player-1');
      bracket.addPlayer('player-2');
      bracket.shuffle();
  
      expect(bracket.players.length).toBe(2);
      expect(bracket.players).toEqual(['player-1', 'player-2']);
    });
  })

});
