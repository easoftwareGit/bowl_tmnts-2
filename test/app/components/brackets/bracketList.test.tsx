import { Bracket } from "@/components/brackets/bracketClass"
import { initBGColNames } from "@/components/brackets/bracketGrid";
import { BracketList, brktCountType, initBrktCountsType } from "@/components/brackets/bracketList"
import exp from "constants";
import { init } from "next/dist/compiled/webpack/webpack";

describe('BracketList', () => { 
  
  describe('constructor', () => {    
    
    const mockBracketList = new BracketList("brk_test1", 2, 3);

    it('should initialize with an empty brackets array when constructed', () => {      
      expect(mockBracketList.brackets).toHaveLength(0);
    })
    it('brktColTitles should return default values when constructed', () => {
      const initBrktColTitles = [...initBGColNames]
      const result = mockBracketList.brktColTitles;
      expect(result).toHaveLength(initBrktColTitles.length);
      for (let i = 0; i < result.length; i++) {
        expect(JSON.stringify(result[i])).toEqual(JSON.stringify(initBrktColTitles[i]));
      }      
    })
    it('brktCounts should return empty values when constructed', () => {
      const result: initBrktCountsType = mockBracketList.brktCounts;
      expect(result.forFullValues).toHaveLength(0);
      expect(result.for1ByeValues).toHaveLength(0);
    })
    it('filledBrkts should return an empty array when constructed', () => {      
      const result = mockBracketList.filledBrkts;
      expect(result).toHaveLength(0);
    })
    it('NeedToAddBrkt should return true when brackets array is empty', () => {      
      const result = mockBracketList.needToAddBrkt;
      expect(result).toBe(true);
    })
    it('should return the correct # of games', () => {      
      const result = mockBracketList.games;
      expect(result).toBe(3);
    });
    it('should return the correct # of players per match', () => {       
      const result = mockBracketList.playersPerMatch;
      expect(result).toBe(2);
    })
    it('should return the correct # of players per bracket', () => {       
      const result = mockBracketList.playersPerBrkt;
      expect(result).toBe(8);
    })  
  })

  describe('addBracket', () => { 

    const mockBracketList = new BracketList("brk_test1", 2, 3);
    let brkt1 = mockBracketList.addBrkt();
    expect(brkt1).not.toBeNull();
    expect(mockBracketList.brackets).toHaveLength(1);    

    const result = mockBracketList.putPlayerInBrkt('player-1');
    expect(result).not.toBeNull();
    if (!result) return;
    expect(mockBracketList.brackets).toHaveLength(1);
    expect(mockBracketList.brackets[0].players).toHaveLength(1);
    expect(result.players).toHaveLength(1);
    expect(result.players[0]).toBe('player-1');
    expect(result.players[0]).toBe(brkt1.players[0]);    
  })

  describe('brktsAvaliableForPlayer', () => { 
    const mockBracketList = new BracketList("brk_test1", 2, 3);
    // test input
    // 10, 8, 6, 7, 6, 4, 6
    // test results
    // 1, 1, 1, 1, 2, 2, 5, 6, 7, 7
    // 0, 0, 0, 0, 1, 1, 4, 5, 6, 6

    beforeAll(() => {
      // 1
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 2 
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 3
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 4
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 5
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 6
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 7
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-4');
      // 8
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      // 9
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      // 10
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');          
    })

    it('should return 2 brackets (#9 & #10) for player-2', () => {
      const result = mockBracketList.brktsAvaliableForPlayer('player-2');
      expect(result.length).toBe(2);
    })
    it('should return 0 brackets for player-1', () => { 
      const result = mockBracketList.brktsAvaliableForPlayer('player-1');
      expect(result.length).toBe(0);
    })
    it('should return 4 brackets for player-3', () => {
      const result = mockBracketList.brktsAvaliableForPlayer('player-3');
      expect(result.length).toBe(4);
    })
    it('should return 0 brackets for player-2 when Brakcts array is empty', () => { 
      const emptyBracketList = new BracketList("brk_test1", 2, 3);
      const result = emptyBracketList.brktsAvaliableForPlayer('player-2');
      expect(result.length).toBe(0);
    })
    it('should return all brackets for player-abc when player is not found in brackets', () => {       
      const result = mockBracketList.brktsAvaliableForPlayer('player-abc');
      expect(result.length).toBe(mockBracketList.brackets.length);
    })
  })

  describe('brktNumColName', () => { 

    const mockBracketList = new BracketList("brk_test1", 2, 3);

    it('should return correct bracket number column name', () => {
      const result = mockBracketList.brktNumColName(1);
      expect(result).toBe('B1');
      const result2 = mockBracketList.brktNumColName(2);
      expect(result2).toBe('B2');
      const result3 = mockBracketList.brktNumColName(13);
      expect(result3).toBe('B13');
    })
  })

  describe('findPlayer', () => { 

    const mockBracketList = new BracketList("brk_test1", 2, 3);
    let brkt1: Bracket | null = new Bracket(mockBracketList);
    mockBracketList.brackets.push(brkt1);
    mockBracketList.putPlayerInBrkt('player-1');
    mockBracketList.putPlayerInBrkt('player-2');
    mockBracketList.putPlayerInBrkt('player-3');
    mockBracketList.putPlayerInBrkt('player-4');
    mockBracketList.putPlayerInBrkt('player-5');
    mockBracketList.putPlayerInBrkt('player-6');
    mockBracketList.putPlayerInBrkt('player-7');
    mockBracketList.putPlayerInBrkt('player-8');
    let brkt2: Bracket | null = new Bracket(mockBracketList);
    mockBracketList.brackets.push(brkt2);
    mockBracketList.putPlayerInBrkt('player-1');
    mockBracketList.putPlayerInBrkt('player-2');
    mockBracketList.putPlayerInBrkt('player-3');
    mockBracketList.putPlayerInBrkt('player-4');
    mockBracketList.putPlayerInBrkt('player-5');
    mockBracketList.putPlayerInBrkt('player-6');
    mockBracketList.putPlayerInBrkt('player-7');
    mockBracketList.putPlayerInBrkt('player-9');
    let brkt3: Bracket | null = new Bracket(mockBracketList);
    mockBracketList.brackets.push(brkt3);
    mockBracketList.putPlayerInBrkt('player-1');
    mockBracketList.putPlayerInBrkt('player-10');

    it('should find correct bracket for a player', () => { 
      const result = mockBracketList.findPlayer('player-1', 0);
      expect(result.brktIndex).toBe(0);
      expect(result.playerIndex).toBe(0);

      const result2 = mockBracketList.findPlayer('player-3', 1);
      expect(result2.brktIndex).toBe(1);
      expect(result2.playerIndex).toBe(2);

      const result3 = mockBracketList.findPlayer('player-9', 0);
      expect(result3.brktIndex).toBe(1);
      expect(result3.playerIndex).toBe(7);

      const result4 = mockBracketList.findPlayer('player-10', 0);
      expect(result4.brktIndex).toBe(2);
      expect(result4.playerIndex).toBe(1);
    })
    it('should return -1, -1 for player not found', () => { 
      const result = mockBracketList.findPlayer('player-99', 0);
      expect(result.brktIndex).toBe(-1);
      expect(result.playerIndex).toBe(-1);
    })
    it('should return -1, -1 for invalid bracket index', () => {
      const result = mockBracketList.findPlayer('player-1', -1);    
      expect(result.brktIndex).toBe(-1);
      expect(result.playerIndex).toBe(-1);
      const result1 = mockBracketList.findPlayer('player-1', mockBracketList.brackets.length);    
      expect(result1.brktIndex).toBe(-1);
      expect(result1.playerIndex).toBe(-1);
    })
  })

  describe('rePopulateBrkts', () => { 
    it('should sort players by number of brackets descending and creation time ascending', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 3, createdAt: 100 },
        { player_id: 'player2', B1_name: 5, createdAt: 200 },
        { player_id: 'player3', B1_name: 5, createdAt: 150 },
        { player_id: 'player4', B1_name: 2, createdAt: 50 }
      ];
    
      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.brackets.length).toBe(5);
        
      expect(bracketList.brackets[0].players[0]).toBe('player3'); // [player3, player2, player1, player4]).
      expect(bracketList.brackets[0].players[1]).toBe('player2');
      expect(bracketList.brackets[0].players[2]).toBe('player1');
      expect(bracketList.brackets[0].players[3]).toBe('player4');
  
      expect(bracketList.brackets[1].players[0]).toBe('player3'); // [player3, player2, player1, player4]).
      expect(bracketList.brackets[1].players[1]).toBe('player2');
      expect(bracketList.brackets[1].players[2]).toBe('player1');
      expect(bracketList.brackets[1].players[3]).toBe('player4');
      
      expect(bracketList.brackets[2].players[0]).toBe('player3'); // [player3, player2, player1]).
      expect(bracketList.brackets[2].players[1]).toBe('player2');
      expect(bracketList.brackets[2].players[2]).toBe('player1');

      expect(bracketList.brackets[2].players[0]).toBe('player3'); // [player3, player2]).
      expect(bracketList.brackets[2].players[1]).toBe('player2');

      expect(bracketList.brackets[2].players[0]).toBe('player3'); // [player3, player2]).
      expect(bracketList.brackets[2].players[1]).toBe('player2');
    });
    it('should create new brackets when all existing brackets are full', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
        { player_id: 'player3', B1_name: 2, createdAt: 51 },
        { player_id: 'player4', B1_name: 2, createdAt: 52 },
        { player_id: 'player5', B1_name: 2, createdAt: 53 },
        { player_id: 'player6', B1_name: 2, createdAt: 54 },
        { player_id: 'player7', B1_name: 2, createdAt: 55 },
        { player_id: 'player8', B1_name: 2, createdAt: 56 },
        { player_id: 'player9', B1_name: 1, createdAt: 500 },
      ];
  
      bracketList.rePopulateBrkts(playerData);
  
      expect(bracketList.brackets.length).toBe(3);
      expect(bracketList.brackets[0].players).toContain('player3');
      expect(bracketList.brackets[0].players).toContain('player4');
      expect(bracketList.brackets[0].players).toContain('player5');
      expect(bracketList.brackets[0].players).toContain('player6');
      expect(bracketList.brackets[0].players).toContain('player7');
      expect(bracketList.brackets[0].players).toContain('player8');
      expect(bracketList.brackets[0].players).toContain('player1');
      expect(bracketList.brackets[0].players).toContain('player2');

      expect(bracketList.brackets[1].players).toContain('player3');
      expect(bracketList.brackets[1].players).toContain('player4');
      expect(bracketList.brackets[1].players).toContain('player5');
      expect(bracketList.brackets[1].players).toContain('player6');
      expect(bracketList.brackets[1].players).toContain('player7');
      expect(bracketList.brackets[1].players).toContain('player8');
      expect(bracketList.brackets[1].players).toContain('player1');
      expect(bracketList.brackets[1].players).toContain('player2');

      expect(bracketList.brackets[2].players).toContain('player9');
    });
    it('should assign a single player to multiple new brackets sequentially when they have multiple bracket entries', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
      ];
  
      bracketList.rePopulateBrkts(playerData);
  
      expect(bracketList.brackets.length).toBe(2);
      expect(bracketList.brackets[0].players).toContain('player1');
      expect(bracketList.brackets[0].players).toContain('player1');

      expect(bracketList.brackets[1].players).toContain('player1');
      expect(bracketList.brackets[1].players).toContain('player1');      
    });    
    it('should clear brackets and return when input array is empty', () => {
      const bracketList = new BracketList('B1', 2, 3);
      bracketList.addBrkt();
      bracketList.addBrkt();  

      bracketList.rePopulateBrkts([]);  

      expect(bracketList.brackets.length).toBe(0);
    });   
    it('sould exit when playerId is not found', () => { 
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
        { player_id: '', B1_name: 2, createdAt: 300 },
        { player_id: 'player4', B1_name: 2, createdAt: 400 },
      ];

      bracketList.rePopulateBrkts(playerData);

      expect(bracketList.brackets.length).toBe(2);
      expect(bracketList.brackets[0].players).toContain('player1');
      expect(bracketList.brackets[0].players).toContain('player1');

      expect(bracketList.brackets[1].players).toContain('player1');
      expect(bracketList.brackets[1].players).toContain('player1');
    })
    it('sould exit when numBrkts is not found', () => { 
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
        { player_id: 'player3', createdAt: 300 },
        { player_id: 'player4', B1_name: 2, createdAt: 400 },
      ];

      bracketList.rePopulateBrkts(playerData);

      expect(bracketList.brackets.length).toBe(2);
      expect(bracketList.brackets[0].players).toContain('player1');
      expect(bracketList.brackets[0].players).toContain('player1');

      expect(bracketList.brackets[1].players).toContain('player1');
      expect(bracketList.brackets[1].players).toContain('player1');
    })
    it('should update bracket counts and filled brackets after processing all entries', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 10, createdAt: 100 },
        { player_id: 'player2', B1_name: 8, createdAt: 200 },
        { player_id: 'player3', B1_name: 6, createdAt: 300 },
        { player_id: 'player4', B1_name: 7, createdAt: 400 },
        { player_id: 'player5', B1_name: 6, createdAt: 500 },
        { player_id: 'player6', B1_name: 4, createdAt: 600 },
        { player_id: 'player7', B1_name: 6, createdAt: 700 },
      ];

      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.brackets.length).toBe(10)

      const result = bracketList.brktCounts as initBrktCountsType;
      expect(result.forFullValues).toHaveLength(10);
      expect(result.for1ByeValues).toHaveLength(10);
      
      expect(result.forFullValues[0]).toBe(1);
      expect(result.forFullValues[1]).toBe(1);
      expect(result.forFullValues[2]).toBe(1);
      expect(result.forFullValues[3]).toBe(1);
      expect(result.forFullValues[4]).toBe(2);
      expect(result.forFullValues[5]).toBe(2);
      expect(result.forFullValues[6]).toBe(5);
      expect(result.forFullValues[7]).toBe(6);
      expect(result.forFullValues[8]).toBe(7);
      expect(result.forFullValues[9]).toBe(7);

      expect(result.for1ByeValues[0]).toBe(0);
      expect(result.for1ByeValues[1]).toBe(0);
      expect(result.for1ByeValues[2]).toBe(0);
      expect(result.for1ByeValues[3]).toBe(0);
      expect(result.for1ByeValues[4]).toBe(1);
      expect(result.for1ByeValues[5]).toBe(1);
      expect(result.for1ByeValues[6]).toBe(4);
      expect(result.for1ByeValues[7]).toBe(5);
      expect(result.for1ByeValues[8]).toBe(6);
      expect(result.for1ByeValues[9]).toBe(6);      
    });    

    it('should set _filledBrkts with 2 filled brackets', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
        { player_id: 'player3', B1_name: 2, createdAt: 51 },
        { player_id: 'player4', B1_name: 2, createdAt: 52 },
        { player_id: 'player5', B1_name: 2, createdAt: 53 },
        { player_id: 'player6', B1_name: 2, createdAt: 54 },
        { player_id: 'player7', B1_name: 2, createdAt: 55 },
        { player_id: 'player8', B1_name: 2, createdAt: 56 },
        { player_id: 'player9', B1_name: 1, createdAt: 500 },
      ];
  
      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.filledBrkts.length).toBe(2);
    });
    it('should set _filledBrkts with 2 filled brackets when 2 brackets are full', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 2, createdAt: 100 },
        { player_id: 'player2', B1_name: 2, createdAt: 200 },
        { player_id: 'player3', B1_name: 2, createdAt: 51 },
        { player_id: 'player4', B1_name: 2, createdAt: 52 },
        { player_id: 'player5', B1_name: 2, createdAt: 53 },
        { player_id: 'player6', B1_name: 2, createdAt: 54 },
        { player_id: 'player7', B1_name: 2, createdAt: 55 },
        { player_id: 'player8', B1_name: 2, createdAt: 56 },
        { player_id: 'player9', B1_name: 1, createdAt: 500 },
      ];
  
      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.filledBrkts.length).toBe(2);
    });
    it('should set _filledBrkts with 0 filled brackets when no brackets are full', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [
        { player_id: 'player1', B1_name: 3, createdAt: 100 },
        { player_id: 'player2', B1_name: 5, createdAt: 200 },
        { player_id: 'player3', B1_name: 5, createdAt: 150 },
        { player_id: 'player4', B1_name: 2, createdAt: 50 }
      ];
    
      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.filledBrkts.length).toBe(0);
    });
    it('should set _filledBrkts with 0 filled brackets when no player data', () => {
      const bracketList = new BracketList('B1', 2, 3);
      // num brackets name = id + "_name" = 'B1_name'
      const playerData = [{}];
    
      bracketList.rePopulateBrkts(playerData);
      expect(bracketList.filledBrkts.length).toBe(0);
    });
    it('should set _filledBrkts with 0 filled brackets when bracketList is created', () => {
      const bracketList = new BracketList('B1', 2, 3);
      expect(bracketList.filledBrkts.length).toBe(0);
    });
  })

  describe('populateBrktCounts', () => {
    it('should populate the bracket counts', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);

      // test input
      // 10, 8, 6, 7, 6, 4, 6
      // test results
      // 1, 1, 1, 1, 2, 2, 5, 6, 7, 7
      // 0, 0, 0, 0, 1, 1, 4, 5, 6, 6

      // 1
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 2 
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 3
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 4
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 5
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 6
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 7
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-4');
      // 8
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      // 9
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      // 10
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');    
       
      mockBracketList.populateBrktCounts();
      const result = mockBracketList.brktCounts as initBrktCountsType;      
      expect(result.forFullValues).toHaveLength(10);
      expect(result.for1ByeValues).toHaveLength(10);
      
      expect(result.forFullValues[0]).toBe(1);
      expect(result.forFullValues[1]).toBe(1);
      expect(result.forFullValues[2]).toBe(1);
      expect(result.forFullValues[3]).toBe(1);
      expect(result.forFullValues[4]).toBe(2);
      expect(result.forFullValues[5]).toBe(2);
      expect(result.forFullValues[6]).toBe(5);
      expect(result.forFullValues[7]).toBe(6);
      expect(result.forFullValues[8]).toBe(7);
      expect(result.forFullValues[9]).toBe(7);

      expect(result.for1ByeValues[0]).toBe(0);
      expect(result.for1ByeValues[1]).toBe(0);
      expect(result.for1ByeValues[2]).toBe(0);
      expect(result.for1ByeValues[3]).toBe(0);
      expect(result.for1ByeValues[4]).toBe(1);
      expect(result.for1ByeValues[5]).toBe(1);
      expect(result.for1ByeValues[6]).toBe(4);
      expect(result.for1ByeValues[7]).toBe(5);
      expect(result.for1ByeValues[8]).toBe(6);
      expect(result.for1ByeValues[9]).toBe(6);      
    })
    it('should populate the bracket counts when more than 10 brackets', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);

      // test input
      // 12, 8, 6, 7, 6, 4, 6
      // test results
      // 1, 1, 1, 1, 2, 2, 5, 6, 7, 7, 7, 7
      // 0, 0, 0, 0, 1, 1, 4, 5, 6, 6, 6, 6

      // 1
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 2 
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 3
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 4
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 5
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 6
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 7
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-4');
      // 8
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      // 9
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      // 10
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');    
      // 11
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      // 12
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');    
       
      mockBracketList.populateBrktCounts();
      const result = mockBracketList.brktCounts as initBrktCountsType;

      expect(result.forFullValues).toHaveLength(12);
      expect(result.for1ByeValues).toHaveLength(12);
     
      expect(result.forFullValues[0]).toBe(1);
      expect(result.forFullValues[1]).toBe(1);
      expect(result.forFullValues[2]).toBe(1);
      expect(result.forFullValues[3]).toBe(1);
      expect(result.forFullValues[4]).toBe(2);
      expect(result.forFullValues[5]).toBe(2);
      expect(result.forFullValues[6]).toBe(5);
      expect(result.forFullValues[7]).toBe(6);
      expect(result.forFullValues[8]).toBe(7);
      expect(result.forFullValues[9]).toBe(7);
      expect(result.forFullValues[10]).toBe(7);
      expect(result.forFullValues[11]).toBe(7);

      expect(result.for1ByeValues[0]).toBe(0);
      expect(result.for1ByeValues[1]).toBe(0);
      expect(result.for1ByeValues[2]).toBe(0);
      expect(result.for1ByeValues[3]).toBe(0);
      expect(result.for1ByeValues[4]).toBe(1);
      expect(result.for1ByeValues[5]).toBe(1);
      expect(result.for1ByeValues[6]).toBe(4);
      expect(result.for1ByeValues[7]).toBe(5);
      expect(result.for1ByeValues[8]).toBe(6);
      expect(result.for1ByeValues[9]).toBe(6);      
      expect(result.for1ByeValues[10]).toBe(6);
      expect(result.for1ByeValues[11]).toBe(6);      
    })
    it('should populate the bracket counts when less than 10 brackets', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);

      // test input
      // 4, 8, 6, 7, 6, 4, 6
      // test results
      // 1, 1, 1, 1, 3, 3, 6, 7
      // 0, 0, 0, 0, 2, 2, 5, 6

      // 1
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 2 
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 3
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 4
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');    
      // 5
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 6
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');    
      mockBracketList.putPlayerInBrkt('player-7');    
      // 7
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-4');
      // 8
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-2');     

      mockBracketList.populateBrktCounts();
      const result = mockBracketList.brktCounts as initBrktCountsType;

      expect(result.forFullValues).toHaveLength(8);
      expect(result.for1ByeValues).toHaveLength(8);
     
      expect(result.forFullValues[0]).toBe(1);
      expect(result.forFullValues[1]).toBe(1);
      expect(result.forFullValues[2]).toBe(1);
      expect(result.forFullValues[3]).toBe(1);
      expect(result.forFullValues[4]).toBe(3);
      expect(result.forFullValues[5]).toBe(3);
      expect(result.forFullValues[6]).toBe(6);
      expect(result.forFullValues[7]).toBe(7);

      expect(result.for1ByeValues[0]).toBe(0);
      expect(result.for1ByeValues[1]).toBe(0);
      expect(result.for1ByeValues[2]).toBe(0);
      expect(result.for1ByeValues[3]).toBe(0);
      expect(result.for1ByeValues[4]).toBe(2);
      expect(result.for1ByeValues[5]).toBe(2);
      expect(result.for1ByeValues[6]).toBe(5);
      expect(result.for1ByeValues[7]).toBe(6);      
    })
  })

  describe('putPlayerInBrkt', () => { 

    it('should put players in bracket', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);
      let brkt1 = mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');

      expect(mockBracketList.brackets.length).toBe(1);
      expect(mockBracketList.brackets[0].players.length).toBe(2);
      expect(mockBracketList.brackets[0].players[0]).toBe('player-1');
      expect(mockBracketList.brackets[0].players[1]).toBe('player-2');
      expect(brkt1.players.length).toBe(2);
      expect(brkt1.players[0]).toBe('player-1');
      expect(brkt1.players[1]).toBe('player-2');
    })
    it('should put players in bracket without duplicating player ids in bracket', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      let brkt2 = mockBracketList.putPlayerInBrkt('player-1');
      expect(brkt2).toBe(null);
      mockBracketList.addBrkt();
      brkt2 = mockBracketList.putPlayerInBrkt('player-1');
      expect(brkt2).not.toBe(null);

      expect(mockBracketList.brackets.length).toBe(2);
      expect(mockBracketList.brackets[0].players.length).toBe(2);
      expect(mockBracketList.brackets[0].players[0]).toBe('player-1');
      expect(mockBracketList.brackets[0].players[1]).toBe('player-2');

      expect(mockBracketList.brackets[1].players.length).toBe(1);
      expect(mockBracketList.brackets[1].players[0]).toBe('player-1');
    })
    it('should return null if brackets are full', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');
      mockBracketList.putPlayerInBrkt('player-8');
      mockBracketList.addBrkt()
      mockBracketList.putPlayerInBrkt('player-1');
      mockBracketList.putPlayerInBrkt('player-2');
      mockBracketList.putPlayerInBrkt('player-3');
      mockBracketList.putPlayerInBrkt('player-4');
      mockBracketList.putPlayerInBrkt('player-5');
      mockBracketList.putPlayerInBrkt('player-6');
      mockBracketList.putPlayerInBrkt('player-7');
      mockBracketList.putPlayerInBrkt('player-8');
      
      let brkt3 = mockBracketList.putPlayerInBrkt('player-9');
      expect(brkt3).toBe(null);
    })
    it('should return null if no brakcts', () => {
      const mockBracketList = new BracketList("brk_test1", 2, 3);
      let brkt1 = mockBracketList.putPlayerInBrkt('player-1');
      expect(brkt1).toBe(null);
    })
  })

})