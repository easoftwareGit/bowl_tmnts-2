import { playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { Bracket } from "@/components/brackets/bracketClass"
import { BracketList, initBrktCountsType, playerUsedType } from "@/components/brackets/bracketListClass"
import { maxBrackets } from "@/lib/validation";
import { cloneDeep } from "lodash";

describe('BracketList', () => { 

  const mockBracketList = new BracketList("mock", 2, 3);
  const playerData = [
    { player_id: 'Al', mock_brkts: 10, test_timeStamp: 100 },
    { player_id: 'Bob', mock_brkts: 8, test_timeStamp: 200 },
    { player_id: 'Chad', mock_brkts: 6, test_timeStamp: 300 },
    { player_id: 'Don', mock_brkts: 7, test_timeStamp: 400 },
    { player_id: 'Ed', mock_brkts: 6, test_timeStamp: 500 },
    { player_id: 'Fred', mock_brkts: 4, test_timeStamp: 600 },
    { player_id: 'Greg', mock_brkts: 6, test_timeStamp: 700 },
  ];

  const clearBracketList = () => {
    mockBracketList.clear();
  }

  const populateBrackets = () => {     

    // test input
    // 10, 8, 6, 7, 6, 5, 6
    // test results
    //       bk1   bk2   bk3   bk4   bk5   bk6   bk7   bk8   bk9   bk10
    // pos1  Al    Al    Al    Al    Al    Al    Al    Al    Al    Al
    // pos2  Bob   Bob   Bob   Bob   Bob   Bob   Bob   Bob
    // pos3  Don   Don   Don   Don   Don   Don   Don  
    // pos4  Chad  Chad  Chad  Chad  Chad  Chad
    // pos5  Ed    Ed    Ed    Ed    Ed    Ed
    // pos6  Greg  Greg  Greg  Greg  Greg  Greg
    // pos7  Fred  Fred  Fred  Fred  Fred       
    clearBracketList();
    mockBracketList.calcTotalBrkts(playerData);  
  }

  describe('constructor', () => {    
           
    const testBracketList = new BracketList("test", 2, 3);

    it('should initialize with an empty brackets array when constructed', () => {
      expect(testBracketList.brackets).toHaveLength(0);
    })
    it('brktCounts should return empty values when constructed', () => {
      const result: initBrktCountsType = testBracketList.brktCounts;
      expect(result.forFullValues).toHaveLength(0);
      expect(result.forOneByeValues).toHaveLength(0);
    })
    it('should return the correct # of games', () => {
      const result = testBracketList.games;
      expect(result).toBe(3);
    });
    it('should return the correct # of players per match', () => {
      const result = testBracketList.playersPerMatch;
      expect(result).toBe(2);
    })
    it('should return the correct # of players per bracket', () => {
      const result = testBracketList.playersPerBrkt;
      expect(result).toBe(8);
    })
  })

  // moved from class function to function inside of rePopulateBrkts
  // start as class functions for testing
  
  describe('class functions for testing only', () => { 

    describe('calcTotalBrkts - adjustPlayersNumBrkts', () => { 
    
      // it('should make no adjustemnts when brackets are already balanced', () => {
        
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_brkts !== b.test_brkts) {
      //       return b.test_brkts - a.test_brkts; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });
    
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(10);
      //   expect(totalBrkts.full).toBe(10);
      //   expect(totalBrkts.oneBye).toBe(0);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_brkts).toBe(10);
      //   expect(playerData[1].test_brkts).toBe(10);
      //   expect(playerData[2].test_brkts).toBe(8);
      //   expect(playerData[3].test_brkts).toBe(8);
      //   expect(playerData[4].test_brkts).toBe(8);
      //   expect(playerData[5].test_brkts).toBe(7);
      //   expect(playerData[6].test_brkts).toBe(6);
      //   expect(playerData[7].test_brkts).toBe(6);
      //   expect(playerData[8].test_brkts).toBe(6);
      //   expect(playerData[9].test_brkts).toBe(6);
      //   expect(playerData[10].test_brkts).toBe(5);
      // })
      // it('edge case high, should adjust Al to 19 brackets', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_brkts !== b.test_brkts) {
      //       return b.test_brkts - a.test_brkts; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });

      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(23);
      //   expect(totalBrkts.full).toBe(17);
      //   expect(totalBrkts.oneBye).toBe(6);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_brkts).toBe(19);
      //   expect(playerData[1].test_brkts).toBe(12);
      //   expect(playerData[2].test_brkts).toBe(10);
      //   expect(playerData[3].test_brkts).toBe(10);
      //   expect(playerData[4].test_brkts).toBe(10);
      //   expect(playerData[5].test_brkts).toBe(10);
      //   expect(playerData[6].test_brkts).toBe(8);
      //   expect(playerData[7].test_brkts).toBe(8);
      //   expect(playerData[8].test_brkts).toBe(8);
      //   expect(playerData[9].test_brkts).toBe(8);
      //   expect(playerData[10].test_brkts).toBe(7);
      //   expect(playerData[11].test_brkts).toBe(6);
      //   expect(playerData[12].test_brkts).toBe(6);
      //   expect(playerData[13].test_brkts).toBe(6);
      //   expect(playerData[14].test_brkts).toBe(5);
      //   expect(playerData[15].test_brkts).toBe(5);
      //   expect(playerData[16].test_brkts).toBe(5);
      //   expect(playerData[17].test_brkts).toBe(4);
      // })
      // it('edge case high, should adjust Al and Bob tp 21 brackets', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      //   ];      
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_brkts !== b.test_brkts) {
      //       return b.test_brkts - a.test_brkts; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });

      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(28);
      //   expect(totalBrkts.full).toBe(24);
      //   expect(totalBrkts.oneBye).toBe(4);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_brkts).toBe(21);
      //   expect(playerData[1].test_brkts).toBe(21);
      //   expect(playerData[2].test_brkts).toBe(12);
      //   expect(playerData[3].test_brkts).toBe(10);
      //   expect(playerData[4].test_brkts).toBe(10);
      //   expect(playerData[5].test_brkts).toBe(10);
      //   expect(playerData[6].test_brkts).toBe(10);
      //   expect(playerData[7].test_brkts).toBe(8);
      //   expect(playerData[8].test_brkts).toBe(8);
      //   expect(playerData[9].test_brkts).toBe(8);
      //   expect(playerData[10].test_brkts).toBe(7);
      //   expect(playerData[11].test_brkts).toBe(6);
      //   expect(playerData[12].test_brkts).toBe(6);
      //   expect(playerData[13].test_brkts).toBe(6);
      //   expect(playerData[14].test_brkts).toBe(5);
      //   expect(playerData[15].test_brkts).toBe(5);
      //   expect(playerData[16].test_brkts).toBe(5);
      //   expect(playerData[17].test_brkts).toBe(4);

      //   expect(totalBrkts.total).toBe(21);
      //   expect(totalBrkts.full).toBe(15);
      //   expect(totalBrkts.oneBye).toBe(6);
      // })
      // it('edge case low, should return the correct number of brackets (2, 6 Full, -4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);      
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 2, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 2, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 2, test_timeStamp: 1000 },
      //   ];      
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_brkts !== b.test_brkts) {
      //       return b.test_brkts - a.test_brkts; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });

      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(2);
      //   expect(totalBrkts.full).toBe(6);
      //   expect(totalBrkts.oneBye).toBe(-4);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(3);
      //   expect(totalBrkts.full).toBe(2);
      //   expect(totalBrkts.oneBye).toBe(1);
      // })
    })

    describe('calcTotalBrkts - calculateNumBrackets', () => { 

      // it('should return the correct number of brackets (6, 5 Full, 1 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 4, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(6);
      //   expect(totalBrkts.full).toBe(5);
      //   expect(totalBrkts.oneBye).toBe(1);
      // })
      // it('should return the correct number of brackets (7, 4 Full, 3 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 4, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 6, test_timeStamp: 800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(7);
      //   expect(totalBrkts.full).toBe(4);
      //   expect(totalBrkts.oneBye).toBe(3);
      // })
      // it('should return the correct number of brackets (13, 9 Full, 4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(13);
      //   expect(totalBrkts.full).toBe(9);
      //   expect(totalBrkts.oneBye).toBe(4);
      // })
      // it('edge case high, should return the correct number of brackets (24, 4 Full, 4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(28);
      //   expect(totalBrkts.full).toBe(24);
      //   expect(totalBrkts.oneBye).toBe(4);
      // })
      // it('edge case low, should return the correct number of brackets (2, 6 Full, -4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 2, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 2, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 2, test_timeStamp: 1000 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(2);
      //   expect(totalBrkts.full).toBe(6);
      //   expect(totalBrkts.oneBye).toBe(-4);
      // })
      // it('should return 0 brackets when no player entries', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   const playerData: playerBrktEntry[] = [];
      //   const totalBrkts: totalBrktsType = { total: 3, full: 2, oneBye: 1 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(0);
      //   expect(totalBrkts.full).toBe(0);
      //   expect(totalBrkts.oneBye).toBe(0);
      // })
    })

    describe('calcTotalBrkts - populateBrktCounts', () => { 

      // beforeAll(() => {
      //   populateBrackets();
      // })
  
      // it('should update bracket counts and after processing all entries', () => {
        
      //   expect(mockBracketList.brackets.length).toBe(10)
  
      //   const result = mockBracketList.brktCounts as initBrktCountsType;
      //   expect(result.forFullValues).toHaveLength(10);
      //   expect(result.forOneByeValues).toHaveLength(10);
        
      //   expect(result.forFullValues[0]).toBe(1);
      //   expect(result.forFullValues[1]).toBe(1);
      //   expect(result.forFullValues[2]).toBe(1);
      //   expect(result.forFullValues[3]).toBe(1);
      //   expect(result.forFullValues[4]).toBe(2);
      //   expect(result.forFullValues[5]).toBe(2);
      //   expect(result.forFullValues[6]).toBe(5);
      //   expect(result.forFullValues[7]).toBe(6);
      //   expect(result.forFullValues[8]).toBe(7);
      //   expect(result.forFullValues[9]).toBe(7);
  
      //   expect(result.forOneByeValues[0]).toBe(0);
      //   expect(result.forOneByeValues[1]).toBe(0);
      //   expect(result.forOneByeValues[2]).toBe(0);
      //   expect(result.forOneByeValues[3]).toBe(0);
      //   expect(result.forOneByeValues[4]).toBe(1);
      //   expect(result.forOneByeValues[5]).toBe(1);
      //   expect(result.forOneByeValues[6]).toBe(4);
      //   expect(result.forOneByeValues[7]).toBe(5);
      //   expect(result.forOneByeValues[8]).toBe(6);
      //   expect(result.forOneByeValues[9]).toBe(6);
      // });
      // it('should set bracketCounts to [] For Full and One Bye when bracketList is created with no brackets', () => {
      //   const testBracktList = new BracketList('test', 2, 3);
      //   expect(testBracktList.brktCounts.forFullValues.length).toBe(0);
      //   expect(testBracktList.brktCounts.forOneByeValues.length).toBe(0);
      // });
      // it('should set bracketCounts with [0, 0], for Full and One Bye with 2 full brackets ', () => {
      //   const testBracktList = new BracketList('test', 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_brkts: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 2, test_timeStamp: 800 },
      //   ];
    
      //   testBracktList.rePopulateBrkts(testData);
      //   expect(testBracktList.brktCounts.forFullValues.length).toBe(2);
      //   expect(testBracktList.brktCounts.forFullValues[0]).toBe(0);
      //   expect(testBracktList.brktCounts.forFullValues[1]).toBe(0);
      //   expect(testBracktList.brktCounts.forOneByeValues.length).toBe(2);
      //   expect(testBracktList.brktCounts.forOneByeValues[0]).toBe(0);
      //   expect(testBracktList.brktCounts.forOneByeValues[1]).toBe(0);
      // });
      // it('should set bracketCounts with [0, 0], for Full and [1, 1] One Bye with 2 brackets with 7 players ', () => {
      //   const testBracktList = new BracketList('test', 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_brkts: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 2, test_timeStamp: 700 },
      //   ];
    
      //   testBracktList.rePopulateBrkts(testData);
      //   expect(testBracktList.brktCounts.forFullValues.length).toBe(2);
      //   expect(testBracktList.brktCounts.forFullValues[0]).toBe(1);
      //   expect(testBracktList.brktCounts.forFullValues[1]).toBe(1);
      //   expect(testBracktList.brktCounts.forOneByeValues.length).toBe(2);
      //   expect(testBracktList.brktCounts.forOneByeValues[0]).toBe(0);
      //   expect(testBracktList.brktCounts.forOneByeValues[1]).toBe(0);
      // });
      // it('should set bracketCounts to [] For Full and One Bye when no brackets', () => {
      //   const testBracktList = new BracketList('test', 2, 3);
      //   const testData = [{}];
      
      //   testBracktList.rePopulateBrkts(testData);
      //   expect(testBracktList.brktCounts.forFullValues.length).toBe(0);
      //   expect(testBracktList.brktCounts.forOneByeValues.length).toBe(0)
      // });
    })
  
    describe('rePopulateBrkts - populateBrktColTitles', () => { 
  
      // beforeAll(async () => {
      //   populateBrackets();
      // })
  
      // it('should update bracket column titles and after processing all entries', () => {
        
      //   expect(mockBracketList.brackets.length).toBe(10)
        
      //   expect(mockBracketList.brktColTitles).toHaveLength(12);      
        
      //   expect(mockBracketList.brktColTitles[0]).toBe('Brackets');
      //   expect(mockBracketList.brktColTitles[1]).toBe('1');
      //   expect(mockBracketList.brktColTitles[2]).toBe('2');
      //   expect(mockBracketList.brktColTitles[3]).toBe('3');
      //   expect(mockBracketList.brktColTitles[4]).toBe('4');
      //   expect(mockBracketList.brktColTitles[5]).toBe('5');
      //   expect(mockBracketList.brktColTitles[6]).toBe('6');
      //   expect(mockBracketList.brktColTitles[7]).toBe('7');
      //   expect(mockBracketList.brktColTitles[8]).toBe('8');
      //   expect(mockBracketList.brktColTitles[9]).toBe('9');
      //   expect(mockBracketList.brktColTitles[10]).toBe('10');
      //   expect(mockBracketList.brktColTitles[11]).toBe('To Fill');
      // });
      // it('should return default bracket column titles when no brackets', () => {
      //   const testBracketList = new BracketList("test", 2, 3);
  
      //   expect(testBracketList.brktColTitles).toHaveLength(12);      
        
      //   expect(testBracketList.brktColTitles[0]).toBe('Brackets');
      //   expect(testBracketList.brktColTitles[1]).toBe('1');
      //   expect(testBracketList.brktColTitles[2]).toBe('2');
      //   expect(testBracketList.brktColTitles[3]).toBe('3');
      //   expect(testBracketList.brktColTitles[4]).toBe('4');
      //   expect(testBracketList.brktColTitles[5]).toBe('5');
      //   expect(testBracketList.brktColTitles[6]).toBe('6');
      //   expect(testBracketList.brktColTitles[7]).toBe('7');
      //   expect(testBracketList.brktColTitles[8]).toBe('8');
      //   expect(testBracketList.brktColTitles[9]).toBe('9');
      //   expect(testBracketList.brktColTitles[10]).toBe('10');
      //   expect(testBracketList.brktColTitles[11]).toBe('To Fill');
      // })
      // it('should return updated bracket column titles when there are 12 brackets', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 12, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 12, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 12, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 12, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 12, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 12, test_timeStamp: 800 },        
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
      //   expect(testBracketList.brktColTitles).toHaveLength(12);
        
      //   expect(testBracketList.brktColTitles[0]).toBe('Brackets');
      //   expect(testBracketList.brktColTitles[1]).toBe('3');
      //   expect(testBracketList.brktColTitles[2]).toBe('4');
      //   expect(testBracketList.brktColTitles[3]).toBe('5');
      //   expect(testBracketList.brktColTitles[4]).toBe('6');
      //   expect(testBracketList.brktColTitles[5]).toBe('7');
      //   expect(testBracketList.brktColTitles[6]).toBe('8');
      //   expect(testBracketList.brktColTitles[7]).toBe('9');
      //   expect(testBracketList.brktColTitles[8]).toBe('10');
      //   expect(testBracketList.brktColTitles[9]).toBe('11');
      //   expect(testBracketList.brktColTitles[10]).toBe('12');
      //   expect(testBracketList.brktColTitles[11]).toBe('To Fill');
      // })
    })
  
    describe('randomize - createByeEntry', () => {
            
      // it('should create a bye entry to fill brackets', () => { 
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);

      //   const numBrkts = testBracketList.fullCount + testBracketList.oneByeCount;
      //   expect(testBracketList.fullCount).toBe(12);
      //   expect(testBracketList.oneByeCount).toBe(6);
      //   expect(numBrkts).toBe(18);
      //   testBracketList.createByeEntry();
      //   expect(isValidBtDbId(testBracketList.byeEntry.id, 'ply')).toBe(true);
      //   expect(testBracketList.byeEntry.player_id).toBe(testBracketList.byeEntry.id);
      //   expect(testBracketList.byeEntry.first_name).toBe('Bye');
      //   expect(testBracketList.byeEntry.last_name).toBe('Bye');
      //   expect(testBracketList.byeEntry.average).toBe(0);        
      //   expect(testBracketList.byeEntry[testBracketList.numBrktsName]).toBe(testBracketList.oneByeCount);
      // })
      // it('should NOT create a bye entry when all brackets are full', () => { 
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);

      //   const numBrkts = testBracketList.fullCount + testBracketList.oneByeCount;
      //   expect(testBracketList.fullCount).toBe(7);
      //   expect(testBracketList.oneByeCount).toBe(0);
      //   expect(numBrkts).toBe(7);
      //   testBracketList.createByeEntry();
      //   expect(Object.keys(testBracketList.byeEntry).length).toBe(0);
      // })
    })

    describe('randomize - setShuffledBrktsForPlayer', () => { 

      // it('should set shuffled brackets for player set, 1st player', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const playerId = 'Al';
      //   const numBrkts = testBracketList.fullCount + testBracketList.oneByeCount;
      //   const playerBrktsMap = new Map<string, Set<number>>(); 
      //   for (let i = 0; i < playerData.length; i++) {          
      //     playerBrktsMap.set(playerData[i].player_id, new Set<number>());
      //   }
      //   const indexArray = Array.from({ length: numBrkts }, (_, index) => index);
      //   const result = testBracketList.setShuffledBrktsForPlayer(playerId, numBrkts, playerBrktsMap);
      //   // same length as numBrakets and index array
      //   expect(result).toHaveLength(numBrkts);
      //   expect(result).toHaveLength(indexArray.length);
      //   // same elements in different order
      //   expect(result).not.toEqual(indexArray);
      //   // same elements can be in any order
      //   expect(result.sort((a, b) => a - b)).toEqual(indexArray);
      // })
      // it('should set shuffled brackets for player set, 2nd player has match vs 1st player', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const playerId = 'Bob';
      //   const numBrkts = testBracketList.fullCount + testBracketList.oneByeCount;
      //   const playerBrktsMap = new Map<string, Set<number>>(); 
      //   for (let i = 0; i < playerData.length; i++) {          
      //     playerBrktsMap.set(playerData[i].player_id, new Set<number>());
      //   }
      //   // create dummy match of al vs bob in last bracket
      //   playerBrktsMap.get('Al')?.add(numBrkts-1);
      //   playerBrktsMap.get('Bob')?.add(numBrkts - 1);        
      //   // get list of all brackets to test with
      //   const indexArray = Array.from({ length: numBrkts }, (_, index) => index);
      //   // remove last bracket index becuse it was used in dummy match
      //   indexArray.pop(); 
      //   const result = testBracketList.setShuffledBrktsForPlayer(playerId, numBrkts, playerBrktsMap);
      //   // same length as index array        
      //   expect(result).toHaveLength(indexArray.length);
      //   // same elements in different order
      //   expect(result).not.toEqual(indexArray);
      //   // same elements can be in any order
      //   expect(result.sort((a, b) => a - b)).toEqual(indexArray);
      // })
      // it('should set shuffled brackets for player set, 3nd player has match vs 1st player and 2nd player', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const playerId = 'Chad';
      //   const numBrkts = testBracketList.fullCount + testBracketList.oneByeCount;
      //   const playerBrktsMap = new Map<string, Set<number>>(); 
      //   for (let i = 0; i < playerData.length; i++) {          
      //     playerBrktsMap.set(playerData[i].player_id, new Set<number>());
      //   }
      //   // create dummy match of al vs bob in last bracket
      //   playerBrktsMap.get('Bob')?.add(5);
      //   playerBrktsMap.get('Chad')?.add(5);
      //   playerBrktsMap.get('Al')?.add(7);
      //   playerBrktsMap.get('Chad')?.add(7);
      //   // get list of all brackets to test with
      //   const indexArray = Array.from({ length: numBrkts }, (_, index) => index);
      //   // filter out bracket indexes that are arleady used
      //   const filteredIndexArray = indexArray.filter((index) => index !== 5 && index !== 7);        
      //   const result = testBracketList.setShuffledBrktsForPlayer(playerId, numBrkts, playerBrktsMap);
      //   // same length as filteredIndexArray array        
      //   expect(result).toHaveLength(filteredIndexArray.length);
      //   // same elements in different order
      //   expect(result).not.toEqual(filteredIndexArray);
      //   // same elements can be in any order
      //   expect(result.sort((a, b) => a - b)).toEqual(filteredIndexArray);
      // })

    })

    describe('randomize - createOppoMap', () => { 

      // const createNeededMapCount = (brktEntries: (typeof playerEntryData)[]): Map<string, number> => {
      //   const neededCountMap = new Map<string, number>();
      //   for (let i = 0; i < brktEntries.length; i++) {
      //     neededCountMap.set(brktEntries[i].player_id, brktEntries[i]['test_brkts']);
      //   }      
      //   return neededCountMap;
      // }
  
      // it('should set oppoMaps for players: 8 Players 7 Brackets each', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);        
      //   let neededCountMap = createNeededMapCount(playerData);
      //   let playerNumBrkts = playerData[0].test_brkts;
      //   let result = testBracketList.createOppoMapForTesting2(0, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(playerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(1);
      //   })

      //   const BobPlayerData = playerData.slice(1);        
      //   for (let i = 0; i < BobPlayerData.length; i++) {
      //     BobPlayerData[i].test_brkts = BobPlayerData[i].test_brkts - 1;
      //   }
      //   neededCountMap = createNeededMapCount(BobPlayerData);
      //   playerNumBrkts = playerData[1].test_brkts - 1;
      //   result = testBracketList.createOppoMapForTesting2(1, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(BobPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(1);
      //   })

      //   const ChadPlayerData = playerData.slice(2);
      //   for (let i = 0; i < ChadPlayerData.length; i++) {
      //     ChadPlayerData[i].test_brkts = ChadPlayerData[i].test_brkts - 2;
      //   }
      //   neededCountMap = createNeededMapCount(ChadPlayerData);
      //   playerNumBrkts = playerData[2].test_brkts - 2;
      //   result = testBracketList.createOppoMapForTesting2(2, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(ChadPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(1);
      //   })
      // })
      // it('should set oppoMaps for players: 8 Players 14 Brackets each', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);        
      //   let neededCountMap = createNeededMapCount(playerData);
      //   let playerNumBrkts = playerData[0].test_brkts;
      //   let result = testBracketList.createOppoMapForTesting2(0, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(playerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(2);
      //   })

      //   const BobPlayerData = playerData.slice(1);        
      //   for (let i = 0; i < BobPlayerData.length; i++) {
      //     BobPlayerData[i].test_brkts = BobPlayerData[i].test_brkts - 2;
      //   }
      //   neededCountMap = createNeededMapCount(BobPlayerData);
      //   playerNumBrkts = playerData[1].test_brkts - 2;
      //   result = testBracketList.createOppoMapForTesting2(1, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(BobPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(2);
      //   })

      //   const ChadPlayerData = playerData.slice(2);
      //   for (let i = 0; i < ChadPlayerData.length; i++) {
      //     ChadPlayerData[i].test_brkts = ChadPlayerData[i].test_brkts - 4;
      //   }
      //   neededCountMap = createNeededMapCount(ChadPlayerData);
      //   playerNumBrkts = playerData[2].test_brkts - 4;
      //   result = testBracketList.createOppoMapForTesting2(2, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(ChadPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     expect(value).toBe(2);
      //   })
      // })

      // it('should set oppoMap for players: 18 players x varuioius brackets ', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 13, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 12, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 11, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      //     { player_id: 'Bye', test_brkts: 2, test_timeStamp: 1900 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);        
      //   let neededCountMap = createNeededMapCount(playerData);
      //   let playerNumBrkts = playerData[0].test_brkts;
      //   let result = testBracketList.createOppoMapForTesting2(0, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(playerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {
      //     if (key === 'Bob' || key === 'Chad' || key === 'Don') {
      //       expect(value).toBe(2);
      //     } else {
      //       expect(value).toBe(1);
      //     }
      //   })

      //   const BobPlayerData = playerData.slice(1);        
      //   // remove 14 matches from BobPlayerData
      //   BobPlayerData[0].test_brkts = BobPlayerData[0].test_brkts - 2;
      //   BobPlayerData[1].test_brkts = BobPlayerData[1].test_brkts - 1;
      //   BobPlayerData[2].test_brkts = BobPlayerData[2].test_brkts - 1;
      //   BobPlayerData[3].test_brkts = BobPlayerData[3].test_brkts - 1;
      //   BobPlayerData[4].test_brkts = BobPlayerData[4].test_brkts - 1;
      //   BobPlayerData[5].test_brkts = BobPlayerData[5].test_brkts - 1;
      //   BobPlayerData[7].test_brkts = BobPlayerData[6].test_brkts - 1;
      //   BobPlayerData[8].test_brkts = BobPlayerData[7].test_brkts - 1;
      //   BobPlayerData[10].test_brkts = BobPlayerData[10].test_brkts - 1;
      //   BobPlayerData[11].test_brkts = BobPlayerData[11].test_brkts - 1;
      //   BobPlayerData[12].test_brkts = BobPlayerData[12].test_brkts - 1;
      //   BobPlayerData[13].test_brkts = BobPlayerData[13].test_brkts - 1;
      //   BobPlayerData[14].test_brkts = BobPlayerData[14].test_brkts - 1;

      //   neededCountMap = createNeededMapCount(BobPlayerData);
      //   playerNumBrkts = BobPlayerData[0].test_brkts;
      //   result = testBracketList.createOppoMapForTesting2(1, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(BobPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {          
      //     if (key === 'Chad' || key === 'Don') {
      //       expect(value).toBe(2);
      //     } else {
      //       expect(value).toBe(1);
      //     }
      //   })

      //   const ChadPlayerData = BobPlayerData.slice(1);
      //   // remove 14 matches from ChadPlayerData
      //   ChadPlayerData[0].test_brkts = ChadPlayerData[0].test_brkts - 2;
      //   ChadPlayerData[1].test_brkts = ChadPlayerData[1].test_brkts - 1;
      //   ChadPlayerData[2].test_brkts = ChadPlayerData[2].test_brkts - 1;
      //   ChadPlayerData[3].test_brkts = ChadPlayerData[3].test_brkts - 1;
      //   ChadPlayerData[4].test_brkts = ChadPlayerData[4].test_brkts - 1;
      //   ChadPlayerData[5].test_brkts = ChadPlayerData[5].test_brkts - 1;
      //   ChadPlayerData[7].test_brkts = ChadPlayerData[7].test_brkts - 1;
      //   ChadPlayerData[9].test_brkts = ChadPlayerData[9].test_brkts - 1;
      //   ChadPlayerData[10].test_brkts = ChadPlayerData[10].test_brkts - 1;
      //   ChadPlayerData[11].test_brkts = ChadPlayerData[11].test_brkts - 1;
      //   ChadPlayerData[13].test_brkts = ChadPlayerData[13].test_brkts - 1;
      //   ChadPlayerData[15].test_brkts = ChadPlayerData[15].test_brkts - 1;
      //   ChadPlayerData[16].test_brkts = ChadPlayerData[16].test_brkts - 1;        

      //   neededCountMap = createNeededMapCount(ChadPlayerData);
      //   playerNumBrkts = ChadPlayerData[0].test_brkts;
      //   result = testBracketList.createOppoMapForTesting2(2, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(ChadPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {          
      //     if (key === 'Don') {
      //       expect(value).toBe(2);
      //     } else {
      //       expect(value).toBe(1);
      //     }
      //   })

      //   const DonPlayerData = ChadPlayerData.slice(1);
      //   // remove 13 matches from DonPlayerData
      //   DonPlayerData[0].test_brkts = DonPlayerData[0].test_brkts - 1;
      //   DonPlayerData[1].test_brkts = DonPlayerData[1].test_brkts - 1;
      //   DonPlayerData[2].test_brkts = DonPlayerData[2].test_brkts - 1;
      //   DonPlayerData[3].test_brkts = DonPlayerData[3].test_brkts - 1; 
      //   DonPlayerData[4].test_brkts = DonPlayerData[4].test_brkts - 1;
      //   DonPlayerData[5].test_brkts = DonPlayerData[5].test_brkts - 1;
      //   DonPlayerData[7].test_brkts = DonPlayerData[7].test_brkts - 1;
      //   DonPlayerData[8].test_brkts = DonPlayerData[8].test_brkts - 1;
      //   DonPlayerData[9].test_brkts = DonPlayerData[9].test_brkts - 1;
      //   DonPlayerData[10].test_brkts = DonPlayerData[10].test_brkts - 1;
      //   DonPlayerData[11].test_brkts = DonPlayerData[11].test_brkts - 1;
      //   DonPlayerData[13].test_brkts = DonPlayerData[13].test_brkts - 1;
      //   DonPlayerData[14].test_brkts = DonPlayerData[14].test_brkts - 1;

      //   neededCountMap = createNeededMapCount(DonPlayerData);
      //   playerNumBrkts = DonPlayerData[0].test_brkts;
      //   result = testBracketList.createOppoMapForTesting2(3, playerNumBrkts, neededCountMap);
      //   expect(result).not.toBeNull();
      //   expect(result.size).toBe(DonPlayerData.length - 1); // all opponemnts except self
      //   result.forEach((value, key) => {          
      //     expect(value).toBe(1);
      //   })
      // })
    })

    describe('randomize - updateOppoMap', () => { 

      // it('should update correct oppoMap for 8 players x 14 brackets', () => { 
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);        
      //   const neededCountMap = new Map<string, number>();
      //   for (let i = 0; i < playerData.length; i++) {
      //     neededCountMap.set(playerData[i].player_id, playerData[i]['test_brkts']);
      //   }
      //   const oppoMap = testBracketList.createOppoMap(0, neededCountMap);
      //   expect(oppoMap).not.toBeNull();
      //   expect(oppoMap.size).toBe(playerData.length - 1); // all opponemnts except self 
      //   oppoMap.forEach((value, key) => {
      //     expect(value).toBe(2);
      //   })

      //   // removes 1 from chad
      //   expect(oppoMap.get('Chad')).toBe(2)
      //   testBracketList.updateOppoMap('Chad', oppoMap);
      //   expect(oppoMap.get('Chad')).toBe(1);

      //   // removes 1 from Bob
      //   expect(oppoMap.get('Bob')).toBe(2)
      //   testBracketList.updateOppoMap("Bob", oppoMap);
      //   expect(oppoMap.get('Bob')).toBe(1);

      //   // removes 1 more from Chad, deletes Chad
      //   expect(oppoMap.get('Chad')).toBe(1);
      //   testBracketList.updateOppoMap('Chad', oppoMap);
      //   expect(oppoMap.has('Chad')).toBe(false);
      // })      
    })

    describe('randomize - matchTest', () => { 

      // // from proof of concept
      // // 8 players x 7 brackets each
      // const poc_shuffledEntries: string[] = ['Chad', 'Ed', 'Bob', 'Fred', 'Don', 'Hal', 'Al', 'Fred', 'Greg', 'Al', 'Bob', 'Chad', 'Don', 'Hal', 'Hal', 'Fred', 'Ed', 'Al', 'Bob', 'Greg', 'Don', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Chad', 'Don', 'Greg', 'Ed', 'Chad', 'Don', 'Hal', 'Bob', 'Fred', 'Al', 'Fred', 'Greg', 'Hal', 'Ed', 'Al', 'Chad', 'Bob', 'Greg', 'Don', 'Fred', 'Al', 'Ed', 'Greg', 'Don', 'Bob', 'Hal', 'Ed', 'Greg', 'Chad', 'Fred'];

      // enum matchTestCodes {
      //   Valid = 0,
      //   Used = -1,
      //   Self = -2,
      //   Past = -3,    
      //   Prior = -4,  
      // }
      
      // let poc_shuffledEntriesObj: playerUsedType[];

      // beforeEach(() => {
      //   // create playerUsedType array
      //   poc_shuffledEntriesObj = [];
      //   poc_shuffledEntriesObj = poc_shuffledEntries.map(playerId => ({
      //     playerId,
      //     used: false
      //   }));
      // })

      // it('should return correct matchTest code 8 players x 7 Brackets', () => {

      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const oppoMap = new Map<string, number>();
      //   // no Al entry, can't play vs one's self
      //   oppoMap.set('Bob', 1);
      //   oppoMap.set('Chad', 1);
      //   oppoMap.set('Don', 1);
      //   oppoMap.set('Ed', 1);
      //   oppoMap.set('Fred', 1);
      //   oppoMap.set('Greg', 1);
      //   oppoMap.set('Hal', 1);
  
      //   let playerId = 'Al';
      //   let i = 0;        
      //   const pastPlayersSet = new Set<string>();
                
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   let result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;        
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   let iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
        
      //   // done with AL as playerId
      //   pastPlayersSet.add(playerId);

      //   // now set match test for Bob
      //   i = iRestart;
      //   playerId = 'Bob';
      //   // reset oppoMap for Bob
      //   oppoMap.clear();
      //   oppoMap.set('Chad', 1);
      //   oppoMap.set('Don', 1);
      //   oppoMap.set('Ed', 1);
      //   oppoMap.set('Fred', 1);
      //   oppoMap.set('Greg', 1);
      //   oppoMap.set('Hal', 1);

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   // this greg index alread used
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   // Done with Bob
      //   pastPlayersSet.add(playerId);

      //   // now set match test for Bob
      //   i = iRestart;
      //   playerId = 'Chad';
      //   // reset oppoMap for Chad
      //   oppoMap.clear();
      //   oppoMap.set('Don', 1);
      //   oppoMap.set('Ed', 1);
      //   oppoMap.set('Fred', 1);
      //   oppoMap.set('Greg', 1);
      //   oppoMap.set('Hal', 1);

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;
      // })    
      // it('should return correct matchTest code 8 players x 14 brackets', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const oppoMap = new Map<string, number>();
      //   // no Al entry, can't play vs one's self
      //   oppoMap.set('Bob', 2);
      //   oppoMap.set('Chad', 2);
      //   oppoMap.set('Don', 2);
      //   oppoMap.set('Ed', 2);
      //   oppoMap.set('Fred', 2);
      //   oppoMap.set('Greg', 2);
      //   oppoMap.set('Hal', 2);
  
      //   let playerId = 'Al';
      //   let i = 0;
      //   const pastPlayersSet = new Set<string>();  
                
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   let result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this match is a prior match
      //   let iRestart = i;        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this match is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   // Done with Al
      //   pastPlayersSet.add(playerId);

      //   // now set match test for Bob
      //   i = iRestart;
      //   playerId = 'Bob';
      //   // reset oppoMap for Bob
      //   oppoMap.clear();        
      //   oppoMap.set('Chad', 2);
      //   oppoMap.set('Don', 2);
      //   oppoMap.set('Ed', 2);
      //   oppoMap.set('Fred', 2);
      //   oppoMap.set('Greg', 2);
      //   oppoMap.set('Hal', 2);

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);        
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);  
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);  
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;        
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   iRestart = i;        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Prior);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   // Done with Bob
      //   pastPlayersSet.add(playerId);

      //   // now set match test for Chad
      //   i = iRestart;
      //   playerId = 'Chad';
      //   // reset oppoMap for Chad
      //   oppoMap.clear();                
      //   oppoMap.set('Don', 2);
      //   oppoMap.set('Ed', 2);
      //   oppoMap.set('Fred', 2);
      //   oppoMap.set('Greg', 2);
      //   oppoMap.set('Hal', 2);

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Used);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Self);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Past);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.Valid);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);        
      //   i++;

      // })
    })

    describe('randomize - isBrktIdxAvailForPlayer', () => {

      // it('should return true when a bracket index is available for a player', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // use pre-sorted data for test
      //   const playerData = [
      //     { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      //   ];
      //   testBracketList.calcTotalBrkts(playerData);
      //   const playerId = 'Al';        
      //   const playersBrktsMap = new Map<string, Set<number>>();
      //   playerData.forEach((player) => {
      //     playersBrktsMap.set(player.player_id, new Set<number>()); 
      //   })       
      //   let playerBrktSet = playersBrktsMap.get(playerId);
      //   let result = testBracketList.isBrktIdxAvailForPlayer(0, playerId, playersBrktsMap);
      //   expect(result).toBe(true);

      //   playerBrktSet?.add(0);
      //   result = testBracketList.isBrktIdxAvailForPlayer(0, playerId, playersBrktsMap);
      //   expect(result).toBe(false);

      //   result = testBracketList.isBrktIdxAvailForPlayer(12, playerId, playersBrktsMap);
      //   expect(result).toBe(true);
      //   playerBrktSet?.add(12);
      //   result = testBracketList.isBrktIdxAvailForPlayer(12, playerId, playersBrktsMap);
      //   expect(result).toBe(false);

      //   // no error checking if index is out of range
      //   result = testBracketList.isBrktIdxAvailForPlayer(1000, playerId, playersBrktsMap);
      //   expect(result).toBe(true);
      //   result = testBracketList.isBrktIdxAvailForPlayer(-1, playerId, playersBrktsMap);
      //   expect(result).toBe(true);
      // })
    })

    describe('randomize - getRandomBracketIndexForMatch', () => {

      // const testBracketList = new BracketList('test', 2, 3);
      // // use pre-sorted data for test
      // const playerData = [
      //   { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //   { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //   { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //   { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //   { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //   { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //   { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //   { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //   { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //   { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //   { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //   { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //   { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //   { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //   { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //   { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //   { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //   { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      // ];
      // testBracketList.calcTotalBrkts(playerData);

      // let playersBrktsMap: Map<string, Set<number>>;
      // beforeEach(() => {
      //   playersBrktsMap = new Map<string, Set<number>>();
      // })

      // it('should return a random bracket index', () => {
        
      //   let playerId = 'Al';
      //   let oppoId = 'Bob';      
      //   playerData.forEach((player) => {
      //     playersBrktsMap.set(player.player_id, new Set<number>()); 
      //   })       
      //   let playerBrktSet = playersBrktsMap.get(playerId);        
      //   let oppoBrktSet = playersBrktsMap.get(oppoId);
      //   const shuffledBrktsForPlayer: number[] = testBracketList.setShuffledBrktsForPlayer(playerId, playerData.length, playersBrktsMap);

      //   const result = testBracketList.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);
      //   expect(result).toBeGreaterThan(-1);
      //   expect(result).toBeLessThan(playerData.length);

      //   playerBrktSet?.add(result);
      //   oppoBrktSet?.add(result);
      // })
      // it('should return a non random when only 1 renaining bracket index', () => {
        
      //   let playerId = 'Al';
      //   let oppoId = 'Bob';      
      //   playerData.forEach((player) => {
      //     playersBrktsMap.set(player.player_id, new Set<number>()); 
      //   })       
      //   let playerBrktSet = playersBrktsMap.get(playerId);
      //   let oppoBrktSet = playersBrktsMap.get(oppoId);
      //   // all bracktes in set except last index
      //   for (let i = 0; i < playerData.length - 1; i++) {
      //     playerBrktSet?.add(i);
      //     oppoBrktSet?.add(i);
      //   }

      //   const lastIndex = playerData.length - 1
      //   const shuffledBrktsForPlayer: number[] = [lastIndex];

      //   let result = testBracketList.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);
      //   expect(result).toBe(lastIndex);
      //   expect(result).toBeLessThan(playerData.length);
      // })
      // it('should return a -1 when no valid brackets for both players', () => {
        
      //   let playerId = 'Al';
      //   let oppoId = 'Bob';      
      //   playerData.forEach((player) => {
      //     playersBrktsMap.set(player.player_id, new Set<number>()); 
      //   })       
      //   let playerBrktSet = playersBrktsMap.get(playerId);
      //   let oppoBrktSet = playersBrktsMap.get(oppoId);
      //   // all bracktes in set except last index
      //   for (let i = 0; i < playerData.length; i++) {
      //     playerBrktSet?.add(i);
      //     oppoBrktSet?.add(i);
      //   }
      //   playerBrktSet?.delete(2);
      //   oppoBrktSet?.delete(3);
        
      //   // valid for player, not for opponent
      //   const shuffledBrktsForPlayer: number[] = [1, 2];
      //   let result = testBracketList.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);
      //   expect(result).toBe(-1);

      //   // valid for opponent, not for player
      //   shuffledBrktsForPlayer[1] = 3;
      //   result = testBracketList.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);
      //   expect(result).toBe(-1);
      // })
      // it('should return BracketList.errInvalidShuffledBrktIndex when no valid shuffled brackets', () => {        
      //   let playerId = 'Al';
      //   let oppoId = 'Bob';      
      //   playerData.forEach((player) => {
      //     playersBrktsMap.set(player.player_id, new Set<number>()); 
      //   })       
      //   let playerBrktSet = playersBrktsMap.get(playerId);
      //   let oppoBrktSet = playersBrktsMap.get(oppoId);
      //   // all bracktes in set except last index
      //   for (let i = 0; i < playerData.length; i++) {
      //     playerBrktSet?.add(i);
      //     oppoBrktSet?.add(i);
      //   }
      //   playerBrktSet?.delete(2);
      //   oppoBrktSet?.delete(3);
        
      //   // valid for player, not for opponent
      //   const shuffledBrktsForPlayer: number[] = [];
      //   let result = testBracketList.getRandomBracketIndexForMatch(oppoId, shuffledBrktsForPlayer, playerId, playersBrktsMap);
      //   expect(result).toBe(BracketList.errInvalidShuffledBrktIndex);

      //   result = testBracketList.getRandomBracketIndexForMatch(oppoId, null as any, playerId, playersBrktsMap);
      //   expect(result).toBe(BracketList.errInvalidShuffledBrktIndex);

      // })
    })

    describe('randomize - putMatchInBracket', () => {
      
      // const testBracketList = new BracketList('test', 2, 3);
      // // use pre-sorted data for test
      // const playerData = [
      //   { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //   { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //   { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //   { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //   { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //   { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //   { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //   { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //   { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //   { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //   { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //   { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //   { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //   { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //   { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //   { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //   { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //   { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      // ];
      // testBracketList.calcTotalBrkts(playerData);
      // // create the brackets
      // testBracketList.brackets.push(
      //   ...Array.from({ length: playerData.length }, () => new Bracket(testBracketList))
      // );
      // // from proof of concept
      // const poc_shuffledEntries: string[] = ['Chad', 'Ed', 'Bob', 'Fred', 'Don', 'Hal', 'Al', 'Fred', 'Greg', 'Al', 'Bob', 'Chad', 'Don', 'Hal', 'Hal', 'Fred', 'Ed', 'Al', 'Bob', 'Greg', 'Don', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Chad', 'Don', 'Greg', 'Ed', 'Chad', 'Don', 'Hal', 'Bob', 'Fred', 'Al', 'Fred', 'Greg', 'Hal', 'Ed', 'Al', 'Chad', 'Bob', 'Greg', 'Don', 'Fred', 'Al', 'Ed', 'Greg', 'Don', 'Bob', 'Hal', 'Ed', 'Greg', 'Chad', 'Fred'];

      // let playersBrktsMap: Map<string, Set<number>>;      
      // let poc_shuffledEntriesObjArr: playerUsedType[];
      // let setShuffledBrktsForPlayer: number[];

      // beforeEach(() => {
      //   testBracketList.brackets.length = 0;
      //   testBracketList.brackets.push(
      //     ...Array.from({ length: playerData.length }, () => new Bracket(testBracketList))
      //   );  
      //   playersBrktsMap = new Map<string, Set<number>>();
      //   playerData.forEach(player => {
      //     playersBrktsMap.set(player.player_id, new Set<number>());
      //   })
      //   // create playerUsedType array
      //   poc_shuffledEntriesObjArr = [];
      //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
      //     playerId,
      //     used: false
      //   }));
      //   setShuffledBrktsForPlayer = [8, 16, 2, 17, 3, 12, 4, 7, 17, 5, 15, 9, 13, 6, 1, 10, 0, 11, 14];
      // })

      // it('should put a match in the brackets and return the bracket index', () => { 
      //   const playerId = 'Al';
      //   const i = 0;        

      //   const result = testBracketList.putMatchInBracket(playerId, poc_shuffledEntriesObjArr[i].playerId, setShuffledBrktsForPlayer, playersBrktsMap);
      //   expect(result).toBe(8); 
      //   expect(testBracketList.brackets[8].players.length).toBe(2);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Chad');
      // })
      // it('should return BracketList.errInvalidShuffledBrktIndex if no shuffledBrktsForPlayer', () => { 
      //   const playerId = 'Al';
      //   const i = 0;        
      //   const noShuffledData: number[] = []

      //   const result = testBracketList.putMatchInBracket(playerId, poc_shuffledEntriesObjArr[i].playerId, noShuffledData, playersBrktsMap);
      //   expect(result).toBe(BracketList.errInvalidShuffledBrktIndex); 

      //   const result2 = testBracketList.putMatchInBracket(playerId, poc_shuffledEntriesObjArr[i].playerId, null as any, playersBrktsMap);
      //   expect(result2).toBe(BracketList.errInvalidShuffledBrktIndex); 
      // })
      // it('should return -1 when no avaliable bracket is found', () => {
        
      //   const playerId = 'Al';
      //   const i = 0;        
      //   const playerBrktSet: Set<number> = playersBrktsMap.get(playerId)!;
      //   // mock al's brackets as full
      //   for (let i = 0; i < 18; i++) {
      //     playerBrktSet!.add(i);
      //   }
      //   // all brackets are full for Al
      //   const result = testBracketList.putMatchInBracket(playerId, poc_shuffledEntriesObjArr[i].playerId, setShuffledBrktsForPlayer, playersBrktsMap);
      //   expect(result).toBe(-1);
      // })
    })

    describe('randomize - updatePlayerSet', () => {

      // const testBracketList = new BracketList('test', 2, 3);
      // // use pre-sorted data for test
      // const playerData = [
      //   { player_id: 'Al', test_brkts: 12, test_timeStamp: 100 },
      //   { player_id: 'Bob', test_brkts: 11, test_timeStamp: 200 },
      //   { player_id: 'Chad', test_brkts: 11, test_timeStamp: 300 },
      //   { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
      //   { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
      //   { player_id: 'Fred', test_brkts: 8, test_timeStamp: 600 },
      //   { player_id: 'Greg', test_brkts: 8, test_timeStamp: 700 },
      //   { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
      //   { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      //   { player_id: 'Jim', test_brkts: 6, test_timeStamp: 1000 },
      //   { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      //   { player_id: 'Lou', test_brkts: 6, test_timeStamp: 1200 },
      //   { player_id: 'Mike', test_brkts: 6, test_timeStamp: 1300 },
      //   { player_id: 'Nate', test_brkts: 5, test_timeStamp: 1400 },
      //   { player_id: 'Otto', test_brkts: 4, test_timeStamp: 1500 },
      //   { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
      //   { player_id: 'Quin', test_brkts: 4, test_timeStamp: 1700 },
      //   { player_id: 'Rob', test_brkts: 4, test_timeStamp: 1800 },
      // ];
      // testBracketList.calcTotalBrkts(playerData);
      // // create the brackets
      // testBracketList.brackets.push(
      //   ...Array.from({ length: playerData.length }, () => new Bracket(testBracketList))
      // );
      // // from proof of concept
      // const poc_shuffledEntries: string[] = ['Chad', 'Ed', 'Bob', 'Fred', 'Don', 'Hal', 'Al', 'Fred', 'Greg', 'Al', 'Bob', 'Chad', 'Don', 'Hal', 'Hal', 'Fred', 'Ed', 'Al', 'Bob', 'Greg', 'Don', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Chad', 'Don', 'Greg', 'Ed', 'Chad', 'Don', 'Hal', 'Bob', 'Fred', 'Al', 'Fred', 'Greg', 'Hal', 'Ed', 'Al', 'Chad', 'Bob', 'Greg', 'Don', 'Fred', 'Al', 'Ed', 'Greg', 'Don', 'Bob', 'Hal', 'Ed', 'Greg', 'Chad', 'Fred'];

      // let playersBrktsMap: Map<string, Set<number>>;      
      // let poc_shuffledEntriesObjArr: playerUsedType[];
      // let setShuffledBrktsForPlayer: number[];

      // beforeEach(() => {
      //   testBracketList.brackets.length = 0;
      //   testBracketList.brackets.push(
      //     ...Array.from({ length: playerData.length }, () => new Bracket(testBracketList))
      //   );  
      //   playersBrktsMap = new Map<string, Set<number>>();
      //   playerData.forEach(player => {
      //     playersBrktsMap.set(player.player_id, new Set<number>());
      //   })
      //   // create playerUsedType array
      //   poc_shuffledEntriesObjArr = [];
      //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
      //     playerId,
      //     used: false
      //   }));
      //   setShuffledBrktsForPlayer = [8, 16, 2, 17, 3, 12, 4, 7, 17, 5, 15, 9, 13, 6, 1, 10, 0, 11, 14];
      // })

      // it('should update playerSet, return bracket index', () => {
      //   const playerId = 'Al';
      //   const oppoId = 'Chad';
        
      //   let result = testBracketList.updatePlayerSet(playerId, 8, playersBrktsMap);
      //   expect(result).toBe(8) 
      //   expect(playersBrktsMap.get(playerId)).toContain(8)
      //   result = testBracketList.updatePlayerSet(oppoId, 8, playersBrktsMap);
      //   expect(result).toBe(8)
      //   expect(playersBrktsMap.get(oppoId)).toContain(8)
      // })
      // it('should NOT update playerSet with invalid playerId, return BracketList.errInvalidPlayerBrktSet', () => {
      //   const playerId = 'Al';
      //   const oppoId = 'Zack';
        
      //   let result = testBracketList.updatePlayerSet(playerId, 8, playersBrktsMap);
      //   expect(result).toBe(8) 
      //   expect(playersBrktsMap.get(playerId)).toContain(8)
      //   result = testBracketList.updatePlayerSet(oppoId, 8, playersBrktsMap);
      //   expect(result).toBe(BracketList.errInvalidPlayerBrktSet)
      // })
    })

    describe('randomize - functions to swap matches', () => {
      
      const testBracketList = new BracketList('test', 2, 3);
      // use pre-sorted data for test
      const playerData = [
        { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      ];
      const playersBrktsMap = new Map<string, Set<number>>();
      let playerSet = new Set<number>();
    
      const setup = () => {
        testBracketList.calcTotalBrkts(playerData);

        // bracket index 0
        let brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Don']);
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Fred']);
        brkt.addMatch(['Bob', 'Hal']);
        brkt.addMatch(['Chad', 'Don']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Don']);
        brkt.addMatch(['Bob', 'Chad']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Ed']);
        brkt.addMatch(['Bob', 'Greg']);
        brkt.addMatch(['Chad', 'Hal']);
        testBracketList.brackets.push(brkt);

        // const playersBrktsMap = new Map<string, Set<number>>();
        // let playerSet = new Set<number>();
        // Al's set
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Al', playerSet);
        // Bob's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Bob', playerSet);
        // Chad's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2); // NO 3!
        playerSet.add(4); // NO 3!
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Chad', playerSet);
        // Don's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(2);
        playerSet.add(5);
        playersBrktsMap.set('Don', playerSet);
        // Ed's set
        playerSet = new Set<number>();
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(6);
        playersBrktsMap.set('Ed', playerSet);
        // Fred's set
        playerSet = new Set<number>();
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(4);
        playersBrktsMap.set('Fred', playerSet);
        // Greg's set
        playerSet = new Set<number>();
        playerSet.add(3);
        playerSet.add(6);
        playersBrktsMap.set('Greg', playerSet);
        // Hal's set
        playerSet = new Set<number>();
        playerSet.add(2);
        playerSet.add(4);
        playerSet.add(6);
        playersBrktsMap.set('Hal', playerSet);        
      }

      const setup2 = () => {
        testBracketList.calcTotalBrkts(playerData);

        // bracket index 0
        let brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Ed']);
        brkt.addMatch(['Bob', 'Greg']);
        brkt.addMatch(['Chad', 'Hal']);
        brkt.addMatch(['Don', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Don']);
        brkt.addMatch(['Bob', 'Chad']);
        brkt.addMatch(['Ed', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        brkt.addMatch(['Don', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Hal']);
        brkt.addMatch(['Don', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Don']);
        brkt.addMatch(['Ed', 'Hal']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Don']);
        brkt.addMatch(['Chad', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Fred']);
        brkt.addMatch(['Bob', 'Ed']);
        brkt.addMatch(['Chad', 'Greg']);
        brkt.addMatch(['Don', 'Hal']);
        testBracketList.brackets.push(brkt);

        // const playersBrktsMap = new Map<string, Set<number>>();
        // let playerSet = new Set<number>();
        // Al's set
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Al', playerSet);
        // Bob's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Bob', playerSet);
        // Chad's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Chad', playerSet);
        // Don's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Don', playerSet);
        // Ed's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4); // NO 5
        playerSet.add(6); // NO 5
        playersBrktsMap.set('Ed', playerSet);
        // Fred's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(2);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Fred', playerSet);
        // Greg's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Greg', playerSet);
        // Hal's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(6);
        playersBrktsMap.set('Hal', playerSet);        
      }

      const setup3 = () => {
        testBracketList.calcTotalBrkts(playerData);

        // bracket index 0
        let brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Ed']);
        brkt.addMatch(['Chad', 'Don']);        
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Ed']);
        brkt.addMatch(['Bob', 'Don']);
        brkt.addMatch(['Chad', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        brkt.addMatch(['Don', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Hal']);        
        brkt.addMatch(['Don', 'Hal']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Hal']);      
        brkt.addMatch(['Don', 'Fred']);
        brkt.addMatch(['Ed', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Fred']);
        brkt.addMatch(['Bob', 'Greg']);
        brkt.addMatch(['Chad', 'Hal']);
        brkt.addMatch(['Don', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket(testBracketList);
        brkt.addMatch(['Al', 'Don']);
        brkt.addMatch(['Bob', 'Chad']);
        brkt.addMatch(['Ed', 'Hal']);
        testBracketList.brackets.push(brkt);

        // const playersBrktsMap = new Map<string, Set<number>>();
        // let playerSet = new Set<number>();
        // Al's set
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Al', playerSet);
        // Bob's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Bob', playerSet);
        // Chad's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Chad', playerSet);
        // Don's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Don', playerSet);
        // Ed's set
        playerSet = new Set<number>();
        playerSet.add(0);
        playerSet.add(1);
        playerSet.add(2); // NO 3 !        
        playerSet.add(4); // NO 3 !
        playerSet.add(5); 
        playerSet.add(6);
        playersBrktsMap.set('Ed', playerSet);
        // Fred's set
        playerSet = new Set<number>();
        playerSet.add(2);
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5); 
        playersBrktsMap.set('Fred', playerSet);
        // Greg's set
        playerSet = new Set<number>();
        playerSet.add(0);        
        playerSet.add(1);
        playerSet.add(2);
        playerSet.add(4);
        playerSet.add(5);
        playersBrktsMap.set('Greg', playerSet);
        // Hal's set
        playerSet = new Set<number>();        
        playerSet.add(2);        
        playerSet.add(3);
        playerSet.add(4);
        playerSet.add(5);
        playerSet.add(6);
        playersBrktsMap.set('Hal', playerSet);        
      }

      describe('randomize - Step 1 - getPlayersCanMoveMatchBrktIdxes', () => {
          
        // beforeAll(() => {
        //   setup();
        // })

        // it('should return correct getPlayersCanMoveMatchBrktIdxes 8 players x 7 Brackets', () => {

        //   const result = testBracketList.getPlayersCanMoveMatchBrktIdxes('Chad', playersBrktsMap)
        //   expect(result.length).toBe(4);
        //   expect(result[0]).toBe(1);
        //   expect(result[1]).toBe(2);
        //   expect(result[2]).toBe(4);
        //   expect(result[3]).toBe(6);
        // })
      })

      describe('randomize - Steps 2, 5, 6 - getAvailBrktIdxesForPlayer', () => {
        
        // beforeAll(() => {
        //   setup();
        // })
        
        // it('should return correct getAvailBrktIdxesForPlayer 8 players x 7 Brackets', () => {
          
        //   // Step 2 - getAvailBrktIdxesForPlayer for current player - Greg
        //   const availGreg = testBracketList.getAvailBrktIdxesForPlayer('Greg', playersBrktsMap)
        //   expect(availGreg.length).toBe(5);
        //   expect(availGreg[0]).toBe(0);
        //   expect(availGreg[1]).toBe(1);
        //   expect(availGreg[2]).toBe(2);
        //   expect(availGreg[3]).toBe(4);
        //   expect(availGreg[4]).toBe(5);

        //   // Step 5 - getAvailBrktIdxesForPlayer for swap opponent - Fred
        //   const availFred = testBracketList.getAvailBrktIdxesForPlayer('Fred', playersBrktsMap)
        //   expect(availFred.length).toBe(4);
        //   expect(availFred[0]).toBe(0);
        //   expect(availFred[1]).toBe(3);
        //   expect(availFred[2]).toBe(5);
        //   expect(availFred[3]).toBe(6);

        //   // Step 6 - getAvailBrktIdxesForPlayer for swap opponent - Chad
        //   const availChad = testBracketList.getAvailBrktIdxesForPlayer('Chad', playersBrktsMap)
        //   expect(availChad.length).toBe(1);
        //   expect(availChad[0]).toBe(3);

        // })
      })

      describe('randomize - Steps 3, 7 - getIntersection', () => {
        
        // beforeAll(() => {
        //   setup();
        // })
        
        // it('should return correct getIntersection 8 players x 7 Brackets', () => {

        //   const canMoveChad = testBracketList.getPlayersCanMoveMatchBrktIdxes('Chad', playersBrktsMap)
        //   expect(canMoveChad.length).toBe(4);
        //   expect(canMoveChad[0]).toBe(1);
        //   expect(canMoveChad[1]).toBe(2);
        //   expect(canMoveChad[2]).toBe(4);
        //   expect(canMoveChad[3]).toBe(6);
          
        //   const availGreg = testBracketList.getAvailBrktIdxesForPlayer('Greg', playersBrktsMap)
        //   expect(availGreg.length).toBe(5);
        //   expect(availGreg[0]).toBe(0);
        //   expect(availGreg[1]).toBe(1);
        //   expect(availGreg[2]).toBe(2);
        //   expect(availGreg[3]).toBe(4);
        //   expect(availGreg[4]).toBe(5);

        //   // step 3 - getIntersection of canMoveChad and availGreg
        //   const result = testBracketList.getIntersection(canMoveChad, availGreg)
        //   expect(result.length).toBe(3);
        //   expect(result[0]).toBe(1);
        //   expect(result[1]).toBe(2);
        //   expect(result[2]).toBe(4);

        //   const availChad = testBracketList.getAvailBrktIdxesForPlayer('Chad', playersBrktsMap)
        //   expect(availChad.length).toBe(1);
        //   expect(availChad[0]).toBe(3);

        //   const availFred = testBracketList.getAvailBrktIdxesForPlayer('Fred', playersBrktsMap)
        //   expect(availFred.length).toBe(4);
        //   expect(availFred[0]).toBe(0);
        //   expect(availFred[1]).toBe(3);
        //   expect(availFred[2]).toBe(5);
        //   expect(availFred[3]).toBe(6);

        //   // step 7 - getIntersection of availChad and availFred
        //   const result2 = testBracketList.getIntersection(availChad, availFred)
        //   expect(result2.length).toBe(1);
        //   expect(result2[0]).toBe(3);          
        // })
      })

      describe('randomize - Step 4 - Get correct opponent from intersection Step 4', () => { 

        // it('should get the correct swap opponent id "Fred" from Bracket at index 1, Chad vs Fred', () => {
        //   setup();

        //   const canMoveChad = testBracketList.getPlayersCanMoveMatchBrktIdxes('Chad', playersBrktsMap)
        //   expect(canMoveChad.length).toBe(4);
        //   expect(canMoveChad[0]).toBe(1);
        //   expect(canMoveChad[1]).toBe(2);
        //   expect(canMoveChad[2]).toBe(4);
        //   expect(canMoveChad[3]).toBe(6);
          
        //   const availGreg = testBracketList.getAvailBrktIdxesForPlayer('Greg', playersBrktsMap)
        //   expect(availGreg.length).toBe(5);
        //   expect(availGreg[0]).toBe(0);
        //   expect(availGreg[1]).toBe(1);
        //   expect(availGreg[2]).toBe(2);
        //   expect(availGreg[3]).toBe(4);
        //   expect(availGreg[4]).toBe(5);

        //   const swapLocations = testBracketList.getIntersection(canMoveChad, availGreg)
        //   expect(swapLocations.length).toBe(3);
        //   expect(swapLocations[0]).toBe(1);
        //   expect(swapLocations[1]).toBe(2);
        //   expect(swapLocations[2]).toBe(4);

        //   // step 4 - Get first opponent from intersection
        //   const location1 = swapLocations[0];
        //   // get id of last player in bracket
        //   const swapOppoId = testBracketList.brackets[location1].players[testBracketList.brackets[location1].players.length - 1];
        //   expect(swapOppoId).toBe('Fred');
        // })
        // it('should get the correct swap opponent id "Hal" from Bracket at 4 Ed vs Hal ', () => {
        //   setup2();

        //   const canMoveEd = testBracketList.getPlayersCanMoveMatchBrktIdxes('Ed', playersBrktsMap)
        //   expect(canMoveEd.length).toBe(2);
        //   expect(canMoveEd[0]).toBe(1);
        //   expect(canMoveEd[1]).toBe(4);
          
        //   const availFred = testBracketList.getAvailBrktIdxesForPlayer('Fred', playersBrktsMap)
        //   expect(availFred.length).toBe(3);
        //   expect(availFred[0]).toBe(1);
        //   expect(availFred[1]).toBe(3);
        //   expect(availFred[2]).toBe(4);

        //   const swapLocations = testBracketList.getIntersection(canMoveEd, availFred)
        //   expect(swapLocations.length).toBe(2);
        //   expect(swapLocations[0]).toBe(1);
        //   expect(swapLocations[1]).toBe(4);

        //   // step 4 - Get first opponent from intersection
        //   const location1 = swapLocations[0];
        //   // get id of last player in bracket
        //   const swapOppoId = testBracketList.brackets[location1].players[testBracketList.brackets[location1].players.length - 1];
        //   expect(swapOppoId).toBe('Greg');

        //   // step 4a - get 2nd opponent from intersection
        //   const location2 = swapLocations[1];
        //   const swapOppoId2 = testBracketList.brackets[location2].players[testBracketList.brackets[location2].players.length - 1];
        //   expect(swapOppoId2).toBe('Hal');
        // })
      })

      describe('randomize - Step 5 returns empty array', () => {
        
        // it('should NOT find a swap opponent id for Ed vs Fred', () => {
        //   setup3();

        //   const canMoveEd = testBracketList.getPlayersCanMoveMatchBrktIdxes('Ed', playersBrktsMap)
        //   expect(canMoveEd.length).toBe(2);
        //   expect(canMoveEd[0]).toBe(4);
        //   expect(canMoveEd[1]).toBe(6);
          
        //   const availFred = testBracketList.getAvailBrktIdxesForPlayer('Fred', playersBrktsMap)
        //   expect(availFred.length).toBe(3);
        //   expect(availFred[0]).toBe(0);
        //   expect(availFred[1]).toBe(1);
        //   expect(availFred[2]).toBe(6);

        //   const swapLocations = testBracketList.getIntersection(canMoveEd, availFred)
        //   expect(swapLocations.length).toBe(1);
        //   expect(swapLocations[0]).toBe(6);          

        //   // step 4 - Get first opponent from intersection
        //   const location1 = swapLocations[0];
        //   // get id of last player in bracket
        //   const swapOppoId = testBracketList.brackets[location1].players[testBracketList.brackets[location1].players.length - 1];
        //   expect(swapOppoId).toBe('Hal');

        //   // step 5 - get available brackets for swapOppoId
        //   const availHal = testBracketList.getAvailBrktIdxesForPlayer('Hal', playersBrktsMap)
        //   expect(availHal.length).toBe(2);
        //   expect(availHal[0]).toBe(0);
        //   expect(availHal[1]).toBe(1);

        //   const availEd = testBracketList.getAvailBrktIdxesForPlayer('Ed', playersBrktsMap)
        //   expect(availEd.length).toBe(1);
        //   expect(availEd[0]).toBe(3);

        //   const swapToIndex = testBracketList.getIntersection(availEd, availHal)
        //   expect(swapToIndex.length).toBe(0);
        // })
      })

      describe('randomize - Steps 1 through 7 - getSwapIndexesForMatch', () => { 

        // it('should move Chad vs Fred from bracket index 1 to bracket index 3', () => { 
        //   setup();
        //   const playerId: string = 'Chad';
        //   const oppoId: string = 'Greg';
        //   const result = testBracketList.getSwapIndexesForMatch(playerId, oppoId, playersBrktsMap)
        //   expect(result.length).toBe(2);
        //   // expect to swap from 1 to 3
        //   expect(result[0]).toBe(1);
        //   expect(result[1]).toBe(3);
        // })
        // it('should move Ed vs Hal from bracket index 4 to bracket index 5', () => { 
        //   setup2();
        //   const playerId: string = 'Ed';
        //   const oppoId: string = 'Fred';
        //   const result = testBracketList.getSwapIndexesForMatch(playerId, oppoId, playersBrktsMap)
        //   expect(result.length).toBe(2);
        //   // expect to swap from 4 to 5
        //   expect(result[0]).toBe(4);
        //   expect(result[1]).toBe(5);
        // })
        // it('should NOT move Ed vs Hal in Bracket index 6', () => { 
        //   setup3();
        //   const playerId: string = 'Ed';
        //   const oppoId: string = 'Fred';
        //   const result = testBracketList.getSwapIndexesForMatch(playerId, oppoId, playersBrktsMap)
        //   expect(result.length).toBe(0);
        // })
      })
    
      describe('randomize - Step 8 - moveMatch', () => {

        // beforeAll(() => {
        //   setup();
        // })

        // it('should move match to new bracket', () => {         
        //   const canMoveChad = testBracketList.getPlayersCanMoveMatchBrktIdxes('Chad', playersBrktsMap)
        //   expect(canMoveChad.length).toBe(4);
        //   expect(canMoveChad[0]).toBe(1);
        //   expect(canMoveChad[1]).toBe(2);
        //   expect(canMoveChad[2]).toBe(4);
        //   expect(canMoveChad[3]).toBe(6);
          
        //   const availGreg = testBracketList.getAvailBrktIdxesForPlayer('Greg', playersBrktsMap)
        //   expect(availGreg.length).toBe(5);
        //   expect(availGreg[0]).toBe(0);
        //   expect(availGreg[1]).toBe(1);
        //   expect(availGreg[2]).toBe(2);
        //   expect(availGreg[3]).toBe(4);
        //   expect(availGreg[4]).toBe(5);

        //   const FromLocations = testBracketList.getIntersection(canMoveChad, availGreg)
        //   expect(FromLocations.length).toBe(3);
        //   expect(FromLocations[0]).toBe(1);
        //   expect(FromLocations[1]).toBe(2);
        //   expect(FromLocations[2]).toBe(4);

        //   const fromIndex = FromLocations[0];
        //   // get id of last player in bracket
        //   const swapOppoId = testBracketList.brackets[fromIndex].players[testBracketList.brackets[fromIndex].players.length - 1];
        //   expect(swapOppoId).toBe('Fred');          
        //   const fromPlayers = testBracketList.brackets[fromIndex].players;
        //   expect(fromPlayers.length).toBe(4);
        //   expect(fromPlayers).toContain('Chad');
        //   expect(fromPlayers).toContain('Fred');

        //   const availChad = testBracketList.getAvailBrktIdxesForPlayer('Chad', playersBrktsMap)
        //   expect(availChad.length).toBe(1);
        //   expect(availChad[0]).toBe(3);

        //   const availFred = testBracketList.getAvailBrktIdxesForPlayer('Fred', playersBrktsMap)
        //   expect(availFred.length).toBe(4);
        //   expect(availFred[0]).toBe(0);
        //   expect(availFred[1]).toBe(3);
        //   expect(availFred[2]).toBe(5);
        //   expect(availFred[3]).toBe(6);

        //   const toLocations = testBracketList.getIntersection(availChad, availFred)
        //   expect(toLocations.length).toBe(1);
        //   expect(toLocations[0]).toBe(3);          

        //   const toIndex = toLocations[0];
        //   const toPlayers = testBracketList.brackets[toIndex].players;
        //   expect(toPlayers.length).toBe(4);
        //   expect(toPlayers).not.toContain('Chad');
        //   expect(toPlayers).not.toContain('Fred');
          
        //   const result = testBracketList.moveMatch('Chad', [fromIndex, toIndex], playersBrktsMap);
        //   expect(result).toBe(fromIndex);
        //   expect(toPlayers.length).toBe(6);
        //   expect(toPlayers).toContain('Chad');
        //   expect(toPlayers).toContain('Fred');

        //   expect(fromPlayers).toHaveLength(2);
        //   expect(fromPlayers).not.toContain('Chad');
        //   expect(fromPlayers).not.toContain('Fred');
        // })
      })      

      describe('randomize - putPlayerInBrkt - using MoveMatch - Steps 1-8', () => { 

        // it('should call moveMatch when putting player in bracket using setup', () => {
        //   setup();
        //   const shuffledBrktsForPlayer: number[] = [3];
        //   const result = testBracketList.putMatchInBracket('Chad', 'Greg', shuffledBrktsForPlayer, playersBrktsMap);
        //   expect(result).toBe(1);

        //   // moved Chad vs Fred from bracket index 1 to bracket index 3
        //   const fromIndex = 1;
        //   const toIndex = 3;
        //   // confirm from index players
        //   const fromLastIndex = testBracketList.brackets[fromIndex].players.length - 1;
        //   expect(testBracketList.brackets[fromIndex].players).toHaveLength(4);
        //   // from index players has Chad vs Greg and no Fred
        //   expect(testBracketList.brackets[fromIndex].players[fromLastIndex-1]).toBe('Chad');
        //   expect(testBracketList.brackets[fromIndex].players[fromLastIndex]).toBe('Greg');
        //   expect(testBracketList.brackets[fromIndex].players).not.toContain('Fred');

        //   // confirm toIndex players
        //   const toLastIndex = testBracketList.brackets[toIndex].players.length - 1;
        //   expect(testBracketList.brackets[toIndex].players).toHaveLength(6);
        //   // to index players has Chad and Fred
        //   expect(testBracketList.brackets[toIndex].players[toLastIndex-1]).toBe('Chad');
        //   expect(testBracketList.brackets[toIndex].players[toLastIndex]).toBe('Fred');          
        // })
        // it('should call moveMatch when putting player in bracket using setup2', () => {
        //   setup2();
        //   const shuffledBrktsForPlayer: number[] = [6];
        //   const result = testBracketList.putMatchInBracket('Ed', 'Fred', shuffledBrktsForPlayer, playersBrktsMap);
        //   expect(result).toBe(4);

        //   // moved Ed va Hal from bracket index 4 to bracket index 5
        //   const fromIndex = 4;
        //   const toIndex = 5;
        //   // confirm from index players
        //   const fromLastIndex = testBracketList.brackets[fromIndex].players.length - 1;
        //   expect(testBracketList.brackets[fromIndex].players).toHaveLength(6);
        //   // from index players has Ed vs Fred and no Hal
        //   expect(testBracketList.brackets[fromIndex].players[fromLastIndex-1]).toBe('Ed');
        //   expect(testBracketList.brackets[fromIndex].players[fromLastIndex]).toBe('Fred');
        //   expect(testBracketList.brackets[fromIndex].players).not.toContain('Hal');

        //   // confirm toIndex players
        //   const toLastIndex = testBracketList.brackets[toIndex].players.length - 1;
        //   expect(testBracketList.brackets[toIndex].players).toHaveLength(8);
        //   // to index players has Ed and Hal
        //   expect(testBracketList.brackets[toIndex].players[toLastIndex-1]).toBe('Ed');
        //   expect(testBracketList.brackets[toIndex].players[toLastIndex]).toBe('Hal');          
        // })
      })

      describe('randomize - for loop', () => {
        
        // // from proof of concept
        // // 8 players x 7 brackets each
        // const poc_shuffledEntries: string[] = ['Chad', 'Ed', 'Bob', 'Fred', 'Don', 'Hal', 'Al', 'Fred', 'Greg', 'Al', 'Bob', 'Chad', 'Don', 'Hal', 'Hal', 'Fred', 'Ed', 'Al', 'Bob', 'Greg', 'Don', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Chad', 'Don', 'Greg', 'Ed', 'Chad', 'Don', 'Hal', 'Bob', 'Fred', 'Al', 'Fred', 'Greg', 'Hal', 'Ed', 'Al', 'Chad', 'Bob', 'Greg', 'Don', 'Fred', 'Al', 'Ed', 'Greg', 'Don', 'Bob', 'Hal', 'Ed', 'Greg', 'Chad', 'Fred'];

        // enum matchTestCodes {
        //   Valid = 0,
        //   Used = -1,
        //   Self = -2,
        //   Past = -3,    
        //   Prior = -4,  
        // }
        
        // let poc_shuffledEntriesObj: playerUsedType[];

        // beforeEach(() => {
        //   // create playerUsedType array
        //   poc_shuffledEntriesObj = [];
        //   poc_shuffledEntriesObj = poc_shuffledEntries.map(playerId => ({
        //     playerId,
        //     used: false
        //   }));
        // })

        // it('should run the for loop - Move Match for Chad', () => { 

        //   const testBracketList = new BracketList('test', 2, 3);
        //   // use pre-sorted data for test
        //   const playerData = [
        //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
        //   ];
        //   testBracketList.calcTotalBrkts(playerData);
        //   const numBrakets = testBracketList.fullCount + testBracketList.oneByeCount;
        //   testBracketList.brackets.push(
        //     ...Array.from({ length: numBrakets }, () => new Bracket(testBracketList))
        //   );

        //   const neededCountMap = new Map<string, number>();
        //   const playersBrktsMap = new Map<string, Set<number>>();
        //   for (let i = 0; i < playerData.length; i++) {
        //     neededCountMap.set(playerData[i].player_id, playerData[i].test_brkts);
        //     playersBrktsMap.set(playerData[i].player_id, new Set<number>());
        //   }
      
        //   let sIndex = 0;
        //   let startIndex = -1;          
        //   let pStart = 0;
        //   let pStop = 1;
        //   const pastPlayersSet = new Set<string>();
        //   let testShuffledBrackets = [0, 6, 1, 2, 5, 4, 3];
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);
          
        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Chad']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Fred']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Greg']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Hal']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Don']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Ed']);
          
        //   expect(poc_shuffledEntriesObj[0].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[1].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[2].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[3].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[4].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[5].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[6].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[7].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(false);

        //   expect(pastPlayersSet.has('Al')).toBe(true);

        //   sIndex = 7;
        //   startIndex = -1;          
        //   pStart = 1;
        //   pStop = 2;          
        //   testShuffledBrackets = [4, 5, 0, 2, 3, 6];  // NO 1, used in Al vs Bob
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Chad', 'Bob', 'Don']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Fred', 'Bob', 'Hal']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Greg', 'Bob', 'Ed']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Hal', 'Bob', 'Fred']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Ed', 'Bob', 'Greg']);

        //   expect(poc_shuffledEntriesObj[7].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[10].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[11].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[12].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[13].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[14].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(false);

        //   expect(pastPlayersSet.has('Bob')).toBe(true);

        //   sIndex = 14;
        //   startIndex = -1;          
        //   pStart = 2;
        //   pStop = 3;          
        //   testShuffledBrackets = [6, 1, 2, 4, 3];  // NO 0, 5
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Chad', 'Bob', 'Don']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Bob', 'Chad', 'Greg']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Fred', 'Bob', 'Hal', 'Chad', 'Don']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Greg', 'Bob', 'Ed', 'Chad', 'Fred']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Ed', 'Bob', 'Greg', 'Chad', 'Hal']);
  
        //   expect(poc_shuffledEntriesObj[14].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[21].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[22].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[23].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[24].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[25].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[26].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[27].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[28].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[29].used).toBe(false);          

        //   expect(pastPlayersSet.has('Chad')).toBe(true);
        // })
        // it('should run the for loop - Move Match for Ed', () => { 

        //   const testBracketList = new BracketList('test', 2, 3);
        //   // use pre-sorted data for test
        //   const playerData = [
        //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
        //   ];
        //   testBracketList.calcTotalBrkts(playerData);
        //   const numBrakets = testBracketList.fullCount + testBracketList.oneByeCount;
        //   testBracketList.brackets.push(
        //     ...Array.from({ length: numBrakets }, () => new Bracket(testBracketList))
        //   );

        //   const neededCountMap = new Map<string, number>();
        //   const playersBrktsMap = new Map<string, Set<number>>();
        //   for (let i = 0; i < playerData.length; i++) {
        //     neededCountMap.set(playerData[i].player_id, playerData[i].test_brkts);
        //     playersBrktsMap.set(playerData[i].player_id, new Set<number>());
        //   }
      
        //   let sIndex = 0;
        //   let startIndex = -1;          
        //   let pStart = 0;
        //   let pStop = 1;
        //   const pastPlayersSet = new Set<string>();
        //   let testShuffledBrackets = [3, 0, 4, 6, 1, 2, 5];
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);
          
        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Ed']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Don']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Chad']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Greg']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Fred']);
          
        //   expect(poc_shuffledEntriesObj[0].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[1].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[2].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[3].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[4].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[5].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[6].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[7].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(false);

        //   expect(pastPlayersSet.has('Al')).toBe(true);

        //   sIndex = 7;
        //   startIndex = -1;          
        //   pStart = 1;
        //   pStop = 2;          
        //   testShuffledBrackets = [2, 1, 5, 3, 6, 0];  // NO 4, used in Al vs Bob
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Ed', 'Bob', 'Greg']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Chad', 'Bob', 'Hal']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Greg', 'Bob', 'Don']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Fred', 'Bob', 'Ed']);
  
        //   expect(poc_shuffledEntriesObj[7].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[10].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[11].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[12].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[13].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[14].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(false);

        //   expect(pastPlayersSet.has('Bob')).toBe(true);

        //   sIndex = 14;
        //   startIndex = -1;          
        //   pStart = 2;
        //   pStop = 3;          
        //   testShuffledBrackets = [0, 5, 4, 2, 6];  // NO 1, 4
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Ed', 'Bob', 'Greg', 'Chad', 'Hal']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Chad', 'Bob', 'Hal']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Bob', 'Chad', 'Don']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Greg', 'Bob', 'Don', 'Chad', 'Fred']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Fred', 'Bob', 'Ed', 'Chad', 'Greg']);
    
        //   expect(poc_shuffledEntriesObj[14].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[21].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[22].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[23].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[24].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[25].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[26].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[27].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[28].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[29].used).toBe(false);          

        //   expect(pastPlayersSet.has('Chad')).toBe(true);

        //   sIndex = 22;
        //   startIndex = -1;          
        //   pStart = 3;
        //   pStop = 4;          
        //   testShuffledBrackets = [6, 3, 0, 2];  
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Ed', 'Bob', 'Greg', 'Chad', 'Hal', 'Don', 'Fred']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed', 'Don', 'Greg']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Chad', 'Bob', 'Hal', 'Don', 'Ed']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Bob', 'Chad', 'Don']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Greg', 'Bob', 'Don', 'Chad', 'Fred']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Fred', 'Bob', 'Ed', 'Chad', 'Greg', 'Don', 'Hal']);
    
        //   expect(poc_shuffledEntriesObj[22].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[23].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[24].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[25].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[26].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[27].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[28].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[29].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[30].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[31].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[32].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[33].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[34].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[35].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[36].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[37].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[38].used).toBe(false);

        //   expect(pastPlayersSet.has('Don')).toBe(true);

        //   sIndex = 32;
        //   startIndex = -1;          
        //   pStart = 4;
        //   pStop = 5;          
        //   testShuffledBrackets = [4, 1, 5];  
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Ed', 'Bob', 'Greg', 'Chad', 'Hal', 'Don', 'Fred']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Don', 'Bob', 'Chad', 'Ed', 'Fred']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed', 'Don', 'Greg']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Chad', 'Bob', 'Hal', 'Don', 'Ed']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Bob', 'Chad', 'Don', 'Ed', 'Greg']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Greg', 'Bob', 'Don', 'Chad', 'Fred', 'Ed', 'Hal']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Fred', 'Bob', 'Ed', 'Chad', 'Greg', 'Don', 'Hal']);
    
        //   expect(poc_shuffledEntriesObj[32].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[33].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[34].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[35].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[36].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[37].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[38].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[39].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[40].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[41].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[42].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[43].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[44].used).toBe(false);

        //   expect(pastPlayersSet.has('Ed')).toBe(true);

        // })
        // it('should run the for loop - CANNOT Move Match for Ed', () => { 

        //   const testBracketList = new BracketList('test', 2, 3);
        //   // use pre-sorted data for test
        //   const playerData = [
        //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
        //   ];
        //   testBracketList.calcTotalBrkts(playerData);
        //   const numBrakets = testBracketList.fullCount + testBracketList.oneByeCount;
        //   testBracketList.brackets.push(
        //     ...Array.from({ length: numBrakets }, () => new Bracket(testBracketList))
        //   );

        //   const neededCountMap = new Map<string, number>();
        //   const playersBrktsMap = new Map<string, Set<number>>();
        //   for (let i = 0; i < playerData.length; i++) {
        //     neededCountMap.set(playerData[i].player_id, playerData[i].test_brkts);
        //     playersBrktsMap.set(playerData[i].player_id, new Set<number>());
        //   }
      
        //   let sIndex = 0;
        //   let startIndex = -1;          
        //   let pStart = 0;
        //   let pStop = 1;
        //   const pastPlayersSet = new Set<string>();
        //   let testShuffledBrackets = [4, 1, 3, 5, 6, 2, 0];
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);
          
        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Greg']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Ed']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Chad']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Fred']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Don']);
          
        //   expect(poc_shuffledEntriesObj[0].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[1].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[2].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[3].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[4].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[5].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[6].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[7].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(false);

        //   expect(pastPlayersSet.has('Al')).toBe(true);

        //   sIndex = 7;
        //   startIndex = -1;          
        //   pStart = 1;
        //   pStop = 2;          
        //   testShuffledBrackets = [2, 6, 1, 4, 0, 5];  // NO 3, used in Al vs Bob
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Greg', 'Bob', 'Ed']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Ed', 'Bob', 'Don']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Bob']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Chad', 'Bob', 'Hal']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Fred', 'Bob', 'Greg']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
  
        //   expect(poc_shuffledEntriesObj[7].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[8].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[9].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[10].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[11].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[12].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[13].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[14].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(false);

        //   expect(pastPlayersSet.has('Bob')).toBe(true);

        //   sIndex = 14;
        //   startIndex = -1;          
        //   pStart = 2;
        //   pStop = 3;          
        //   testShuffledBrackets = [5, 3, 0, 2, 1];  // NO 4, 6
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Greg', 'Bob', 'Ed', 'Chad', 'Don']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Ed', 'Bob', 'Don', 'Chad', 'Greg']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Bob', 'Chad', 'Fred']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Chad', 'Bob', 'Hal']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Fred', 'Bob', 'Greg', 'Chad', 'Hal']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
    
        //   expect(poc_shuffledEntriesObj[14].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[15].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[16].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[17].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[18].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[19].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[20].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[21].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[22].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[23].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[24].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[25].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[26].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[27].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[28].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[29].used).toBe(false);          

        //   expect(pastPlayersSet.has('Chad')).toBe(true);

        //   sIndex = 22;
        //   startIndex = -1;          
        //   pStart = 3;
        //   pStop = 4;          
        //   testShuffledBrackets = [3, 5, 4, 2];  
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);

        //   expect(testBracketList.brackets[0].players).toEqual(['Al', 'Greg', 'Bob', 'Ed', 'Chad', 'Don']);
        //   expect(testBracketList.brackets[1].players).toEqual(['Al', 'Ed', 'Bob', 'Don', 'Chad', 'Greg']);
        //   expect(testBracketList.brackets[2].players).toEqual(['Al', 'Hal', 'Bob', 'Fred', 'Chad', 'Ed', 'Don', 'Greg']);
        //   expect(testBracketList.brackets[3].players).toEqual(['Al', 'Bob', 'Chad', 'Fred', 'Don', 'Hal']);
        //   expect(testBracketList.brackets[4].players).toEqual(['Al', 'Chad', 'Bob', 'Hal', 'Don', 'Fred']);
        //   expect(testBracketList.brackets[5].players).toEqual(['Al', 'Fred', 'Bob', 'Greg', 'Chad', 'Hal', 'Don', 'Ed']);
        //   expect(testBracketList.brackets[6].players).toEqual(['Al', 'Don', 'Bob', 'Chad']);
      
        //   expect(poc_shuffledEntriesObj[22].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[23].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[24].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[25].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[26].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[27].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[28].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[29].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[30].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[31].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[32].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[33].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[34].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[35].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[36].used).toBe(false);
        //   expect(poc_shuffledEntriesObj[37].used).toBe(true);
        //   expect(poc_shuffledEntriesObj[38].used).toBe(false);

        //   expect(pastPlayersSet.has('Don')).toBe(true);

        //   sIndex = 32;
        //   startIndex = -1;          
        //   pStart = 4;
        //   pStop = 5;          
        //   testShuffledBrackets = [6, 4, 3];  
        //   testBracketList.randomForLoopTest(
        //     sIndex, startIndex, poc_shuffledEntriesObj,
        //     pStart, pStop,
        //     pastPlayersSet, testShuffledBrackets,
        //     neededCountMap, playersBrktsMap);
        //   expect(testBracketList.errorCode).toBe(BracketList.reRandomize);
        // })
  
      })

    })

    describe('ramdomize - getOpenBracketIndex', () => {      
//       const testString =
//         `Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al
// Mike	Fred	Ken	Rob	Don	Quin	Ed	Otto	Hal	Greg	Ian	Chad	Ed	Bye	Jim	Paul	Nate	Bob	Lou
// Ed	Ed	Ed	Don	Ed	Ed	Bob	Bob	Ed	Bob	Don	Ed	Bob	Ed	Don	Otto	Ed	Don	Ed
// Chad	Nate	Otto	Jim	Bob	Jim	Chad	Ian	Mike	Otto	Nate	Rob	Rob	Fred	Chad	Ken	Don	Fred	Ian
// Bob	Bob	Don	Hal	Ian	Bob	Jim	Don	Don	Jim	Jim	Nate	Jim	Jim	Mike	Greg	Hal	Hal	Bob
// Don	Jim	Rob	Quin	Greg	Mike	Rob	Quin	Ian	Lou	Chad	Bye	Ken	Mike	Greg	Lou	Otto	Ken	Nate
// Hal	Rob	Jim	Ian	Mike	Nate	Nate	Nate	Rob	Ken	Rob	Hal	Hal	Nate	Otto		Mike	Mike	Rob
// Ian	Hal	Nate	Otto	Fred	Lou	Greg	Rob	Fred	Paul	Quin	Fred	Greg	Ian	Paul		Paul	Bye	Ken`
//       const pasred = testString.trim().split(/r?\n/).map(row => row.split('\t'));
//       const testBracketList = new BracketList('test', 2, 3);
//       for (let i = 0; i < pasred[0].length; i++) {
//         const brkt = new Bracket(testBracketList);        
//         testBracketList.brackets.push(brkt);
//       }
//       for (let i = 0; i < pasred.length; i++) {
//         for (let j = 0; j < pasred[0].length; j++) {
//           if (pasred[i][j] !== '') { 
//             testBracketList.brackets[j].players.push(pasred[i][j]);
//           }
//         }
//       }

//       it('should find the first open bracket at index 15', () => { 
//         const openBracketIndex = testBracketList.getOpenBracketIndex();
//         expect(openBracketIndex).toBe(15);
//       })
    })

    describe('ramdomize - getAvailBrktsForPlayers', () => {
//       const testString =
//         `Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al	Al
// Mike	Fred	Ken	Rob	Don	Quin	Ed	Otto	Hal	Greg	Ian	Chad	Ed	Bye	Jim	Paul	Nate	Bob	Lou
// Ed	Ed	Ed	Don	Ed	Ed	Bob	Bob	Ed	Bob	Don	Ed	Bob	Ed	Don	Otto	Ed	Don	Ed
// Chad	Nate	Otto	Jim	Bob	Jim	Chad	Ian	Mike	Otto	Nate	Rob	Rob	Fred	Chad	Ken	Don	Fred	Ian
// Bob	Bob	Don	Hal	Ian	Bob	Jim	Don	Don	Jim	Jim	Nate	Jim	Jim	Mike	Greg	Hal	Hal	Bob
// Don	Jim	Rob	Quin	Greg	Mike	Rob	Quin	Ian	Lou	Chad	Bye	Ken	Mike	Greg	Lou	Otto	Ken	Nate
// Hal	Rob	Jim	Ian	Mike	Nate	Nate	Nate	Rob	Ken	Rob	Hal	Hal	Nate	Otto		Mike	Mike	Rob
// Ian	Hal	Nate	Otto	Fred	Lou	Greg	Rob	Fred	Paul	Quin	Fred	Greg	Ian	Paul		Paul	Bye	Ken`
//       const pasred = testString.trim().split(/r?\n/).map(row => row.split('\t'));
//       const testBracketList = new BracketList('test', 2, 3);
//       for (let i = 0; i < pasred[0].length; i++) {
//         const brkt = new Bracket(testBracketList);        
//         testBracketList.brackets.push(brkt);
//       }
//       for (let i = 0; i < pasred.length; i++) {
//         for (let j = 0; j < pasred[0].length; j++) {
//           if (pasred[i][j] !== '') { 
//             testBracketList.brackets[j].players.push(pasred[i][j]);
//           }
//         }
//       }

//       // 0, 1, 2, 4, 8, 11, 13, 17, 
//       it('should find the all the available brackets', () => { 
//         const availBrkts = testBracketList.getAvailBrktsForPlayers('Lou', 'Quin', 15);
//         expect(availBrkts).toHaveLength(8);
//         expect(availBrkts).toEqual([0, 1, 2, 4, 8, 11, 13, 17]);
//       })
     })    
  })

  describe('addBrktEntries', () => { 
    it('should add 8 players with bracket entries', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      ];
      testBracketList.addBrktEntries(playerData);
      expect(testBracketList.brktEntries).toHaveLength(8);      
    })
    it('should add 9 players with bracket entries', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      ];
      testBracketList.addBrktEntries(playerData);
      expect(testBracketList.brktEntries).toHaveLength(9);
    })
    it('should add 8 players with bracket entries', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 0, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 7, test_timeStamp: 900 },
      ];
      testBracketList.addBrktEntries(playerData);
      expect(testBracketList.brktEntries).toHaveLength(8);
    })
    it('should return empty array when no players', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData: any[] = [];
      testBracketList.addBrktEntries(playerData);
      expect(testBracketList.brktEntries).toHaveLength(0);
    })
    it('should return empty array when no players with brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 0, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 0, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 0, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 0, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 0, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 0, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 0, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 0, test_timeStamp: 800 },
      ];
      testBracketList.addBrktEntries(playerData);
      expect(testBracketList.brktEntries).toHaveLength(0);
    })
    it('should return empty array when passed null', () => {
      const testBracketList = new BracketList('test', 2, 3);
      testBracketList.addBrktEntries(null as any);
      expect(testBracketList.brktEntries).toHaveLength(0);
    })
    it('should return empty array when passed undefined', () => {
      const testBracketList = new BracketList('test', 2, 3);
      testBracketList.addBrktEntries(undefined as any);
      expect(testBracketList.brktEntries).toHaveLength(0);
    })
    it('should return empty array when passed non array', () => {
      const testBracketList = new BracketList('test', 2, 3);
      testBracketList.addBrktEntries('not an array' as any);
      expect(testBracketList.brktEntries).toHaveLength(0);
    })
  })

  describe('calcTotalBrkts', () => {    

    it('should return the correct number of brackets 8 Players x 7Brackets (8 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(7);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('should return the correct number of brackets 7 Players (0 Full, 4 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(4);
    })
    it('should return the correct number of brackets 8 players (4 Full, 2 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 6, test_timeStamp: 800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(4);
      expect(testBracketList.oneByeCount).toBe(2);
    })    
    it('should return corect # of full and one bye brackets - 10 full brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(10);
      expect(testBracketList.oneByeCount).toBe(0);
    });
    it('should return the correct number of brackets (9 Full, 4 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(9);
      expect(testBracketList.oneByeCount).toBe(4);
    })
    it('edge case high, should return the correct number of brackets Al and Bob 50 Brackets (15 Full, 6 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(15);
      expect(testBracketList.oneByeCount).toBe(6);
    })
    it('edge case high, Al 50 brackets (14 Full, 5 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(14);
      expect(testBracketList.oneByeCount).toBe(5);
    })
    it('edge case low, should return the correct number of brackets 18Px1B (0 Full, 2 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },        
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(0);
    })    
    it('edge case low, should return the correct number of brackets 10Px4B (5 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 4, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 4, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(5);
      expect(testBracketList.oneByeCount).toBe(0);
    })    
    it('edge case low, should return the correct number of brackets 10Px2B (2 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 2, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 2, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(1);
    })
    it('edge case low, should return the correct number of brackets 20Px1B (1 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
        { player_id: 'Sam', test_brkts: 1, test_timeStamp: 1900 },
        { player_id: 'Tim', test_brkts: 1, test_timeStamp: 2000 },
      ]
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case low, should return the correct number of brackets 21Px1B (1 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
        { player_id: 'Sam', test_brkts: 1, test_timeStamp: 1900 },
        { player_id: 'Tim', test_brkts: 1, test_timeStamp: 2000 },
        { player_id: 'Uri', test_brkts: 1, test_timeStamp: 2100 },
      ]
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(3);
    })
    it('edge case high and low, should return the correct number of brackets 1Px50B 17Px1B (1 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
      ]
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case low, should return the correct number of brackets 4Px4B (2 Full, 0 OneBye)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 4, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 4, test_timeStamp: 400 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case - no full brackets, 7 Players x 10 brkts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(10);
    })
    it('edge case low - no full brackets, 7 players with random brackets, 5 is min', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(5);
    })    
    it('should return 0 brackets when no player entries', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData: typeof playerEntryData[] = [];
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case invalid data - no player id, should return 0 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: '', test_brkts: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case invalid data - number of brackets too high, should return 0 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: maxBrackets + 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case invalid data - number of brackets non-integer, should return 0 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 10.5, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case invalid data - no time stamp, should return 0 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 10, test_timeStamp: null as any},
        { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
  })

  describe('canRandomize', () => { 

    it('should return true when brackets can be randomized', () => {      
      const testBracketList = new BracketList('test', 2, 3);
      const testData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.canRandomize()).toBe(true);
    })
    it('should return false when when not enough players', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const testData = [
        { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.canRandomize()).toBe(false);
      expect(testBracketList.errorMessage).toBe('Not enough players for brackets');
    })
    it('should return false when when no players', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData: typeof playerEntryData[] = [];
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.canRandomize()).toBe(false);
      expect(testBracketList.errorMessage).toBe('Not enough players for brackets');
    })
    it('edge case low - 16 players x 1 Bracket - should return true', () => {      
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.canRandomize()).toBe(true);
    })
    it('edge case low, should return false for 20Px1B - not all players in a bracket', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
        { player_id: 'Sam', test_brkts: 1, test_timeStamp: 1900 },
        { player_id: 'Tim', test_brkts: 1, test_timeStamp: 2000 },
      ]
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.canRandomize()).toBe(false);
      expect(testBracketList.errorMessage).toBe("Not all entries assigned to brackets. Adjust entries");
    })
    it('edge case low, should return true for 21Px1B', () => {
      const testBracketList = new BracketList('test', 2, 3);
      const playerData = [
        { player_id: 'Al', test_brkts: 1, test_timeStamp: 100 },
        { player_id: 'Bob', test_brkts: 1, test_timeStamp: 200 },
        { player_id: 'Chad', test_brkts: 1, test_timeStamp: 300 },
        { player_id: 'Don', test_brkts: 1, test_timeStamp: 400 },
        { player_id: 'Ed', test_brkts: 1, test_timeStamp: 500 },
        { player_id: 'Fred', test_brkts: 1, test_timeStamp: 600 },
        { player_id: 'Greg', test_brkts: 1, test_timeStamp: 700 },
        { player_id: 'Hal', test_brkts: 1, test_timeStamp: 800 },
        { player_id: 'Ian', test_brkts: 1, test_timeStamp: 900 },
        { player_id: 'Jim', test_brkts: 1, test_timeStamp: 1000 },
        { player_id: 'Ken', test_brkts: 1, test_timeStamp: 1100 },
        { player_id: 'Lou', test_brkts: 1, test_timeStamp: 1200 },
        { player_id: 'Mike', test_brkts: 1, test_timeStamp: 1300 },
        { player_id: 'Nate', test_brkts: 1, test_timeStamp: 1400 },
        { player_id: 'Otto', test_brkts: 1, test_timeStamp: 1500 },
        { player_id: 'Paul', test_brkts: 1, test_timeStamp: 1600 },
        { player_id: 'Quin', test_brkts: 1, test_timeStamp: 1700 },
        { player_id: 'Rob', test_brkts: 1, test_timeStamp: 1800 },
        { player_id: 'Sam', test_brkts: 1, test_timeStamp: 1900 },
        { player_id: 'Tim', test_brkts: 1, test_timeStamp: 2000 },
        { player_id: 'Uri', test_brkts: 1, test_timeStamp: 2100 },
      ]
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.canRandomize()).toBe(true);
    })
  })

  describe('randomize', () => {

    // since randomize is just that - random, test the function by calling
    // it 250 times with each data set to test to further test for errors
    // that might occur during randomization

    type errorInfoType = {
      error: number;
      bracketCount: number;
      invalidBracketIndex: number;
      oppoId: string;
    }
    
    const inBracketMoreThanOnce = -1001
    const incorrectBracketCount = -1002
    const tooManyVsOppo = -1003

    const validBracketsForPlayer = (
      brktList: BracketList,
      playerEntries: (typeof playerEntryData)[],
      playerIndex: number,
      playerOppoMap: Map<string, number>
    ): errorInfoType => {
      const errorInfo: errorInfoType = {
        error: 0,
        bracketCount: 0,
        invalidBracketIndex: -1,
        oppoId: ''
      }      

      const playerId = playerEntries[playerIndex].player_id;
      const numBrkts = playerEntries[playerIndex]['test_brkts'];
      const oppoMap = new Map<string, number>();
      for (let b = 0; b < brktList.brackets.length; b++) {
        const filtered = brktList.brackets[b].players.filter(p => p === playerId);
        if (filtered.length > 1) {
          errorInfo.invalidBracketIndex = b;
          errorInfo.error = inBracketMoreThanOnce
          return errorInfo
        }
        if (filtered.length === 1) {
          errorInfo.bracketCount++;
          const playerIndex = brktList.brackets[b].players.findIndex(p => p === playerId);
          const match = brktList.brackets[b].getMatch(playerIndex);
          const oppoId = match[0] === playerId ? match[1] : match[0];
          if (!oppoMap.has(oppoId)) {
            oppoMap.set(oppoId, 1);
          } else {
            oppoMap.set(oppoId, oppoMap.get(oppoId)! + 1);
          }
        }
      }

      if (errorInfo.bracketCount !== numBrkts) {
        errorInfo.error = incorrectBracketCount
        return errorInfo
      }

      const mapArr = Array.from(oppoMap);
      for(let i = 0; i < oppoMap.size; i++) {
        const [key, value] = mapArr[i];
        if (playerOppoMap.has(key)) {
          const playerMaxOppoCount = playerOppoMap.get(key)!;
          if (value > playerMaxOppoCount) {            
            const debugStr = getDebugBrackets(brktList);
            errorInfo.error = tooManyVsOppo;
            errorInfo.oppoId = key;
            errorInfo.bracketCount = value;
            console.log('DEBUG: ' + debugStr);
            console.log('numBrkts: ' + numBrkts);
            console.log('oppoMap: ' + oppoMap);
            console.log('playerOppoMap: ' + playerOppoMap);
            console.log('playerMaxOppoCount: ' + playerMaxOppoCount);
            console.log('value: ' + value);
            console.log('key: ' + key);
            return errorInfo
          }
        }
      }
      return errorInfo
    }

    const createNeededMapCount = (brktEntries: (typeof playerEntryData)[]): Map<string, number> => {
      const neededCountMap = new Map<string, number>();
      for (let i = 0; i < brktEntries.length; i++) {
        neededCountMap.set(brktEntries[i].player_id, brktEntries[i]['test_brkts']);
      }      
      return neededCountMap;
    }

    const getDebugBrackets = (bl: BracketList): string => {
      let debugStr = '';
      for (let i = 0; i < bl.playersPerBrkt; i++) {
        for (let b = 0; b < bl.brackets.length; b++) {
          if (i < bl.brackets[b].players.length) {
            debugStr += bl.brackets[b].players[i]
            if (b < bl.brackets.length - 1) {
              debugStr += '\t'  
            }              
          } else {
            debugStr += '\t'
          }          
        }
        debugStr += '\r\n'
      }
      return debugStr
    }

    // it('should randomize brackets 8 Players x 7 Brackets (7 Full, 0 OneBye) pass shuffled entries', () => {    
    //   const poc_shuffledEntries: string[] = ['Chad', 'Ed', 'Bob', 'Fred', 'Don', 'Hal', 'Al', 'Fred', 'Greg', 'Al', 'Bob', 'Chad', 'Don', 'Hal', 'Hal', 'Fred', 'Ed', 'Al', 'Bob', 'Greg', 'Don', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Chad', 'Don', 'Greg', 'Ed', 'Chad', 'Don', 'Hal', 'Bob', 'Fred', 'Al', 'Fred', 'Greg', 'Hal', 'Ed', 'Al', 'Chad', 'Bob', 'Greg', 'Don', 'Fred', 'Al', 'Ed', 'Greg', 'Don', 'Bob', 'Hal', 'Ed', 'Greg', 'Chad', 'Fred'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));
    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(7);
    //   expect(testBracketList.oneByeCount).toBe(0);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {
    //     const startTime = Date.now();
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
        
    //     for (let p = 0; p < playerData.length; p++) {
    //       const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);          
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // expect(testBracketList.errorCode).toBe(BracketList.noError);
    //   // expect(testBracketList.errorMessage).toBe('');
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
      
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 8 Players x 7 Brackets (7 Full, 0 OneBye) - randomize shuffles entries', () => {
    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 7, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 7, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 7, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 7, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 7, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 7, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 7, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 7, test_timeStamp: 800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(7);
    //   expect(testBracketList.oneByeCount).toBe(0);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {
    //     const startTime = Date.now();
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
        
    //     for (let p = 0; p < playerData.length; p++) {
    //       const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);

    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 8 Players x 14 Brackets (14 Full, 0 OneBye) - passed shuffled entries', () => {

    //   const poc_shuffledEntries: string[] = ['Fred', 'Al', 'Greg', 'Bob', 'Bob', 'Greg', 'Greg', 'Greg', 'Al', 'Greg', 'Bob', 'Greg', 'Chad', 'Bob', 'Bob', 'Greg', 'Greg', 'Al', 'Bob', 'Al', 'Hal', 'Al', 'Chad', 'Ed', 'Chad', 'Al', 'Fred', 'Ed', 'Bob', 'Ed', 'Greg', 'Don', 'Don', 'Al', 'Al', 'Don', 'Fred', 'Don', 'Bob', 'Bob', 'Hal', 'Fred', 'Don', 'Bob', 'Bob', 'Fred', 'Chad', 'Bob', 'Ed', 'Fred', 'Chad', 'Ed', 'Greg', 'Chad', 'Hal', 'Al', 'Al', 'Don', 'Fred', 'Hal', 'Ed', 'Don', 'Chad', 'Hal', 'Ed', 'Chad', 'Greg', 'Hal', 'Chad', 'Al', 'Ed', 'Don', 'Fred', 'Don', 'Al', 'Fred', 'Ed', 'Don', 'Ed', 'Ed', 'Ed', 'Hal', 'Hal', 'Bob', 'Chad', 'Al', 'Don', 'Greg', 'Fred', 'Don', 'Don', 'Hal', 'Fred', 'Chad', 'Fred', 'Ed', 'Bob', 'Greg', 'Hal', 'Fred', 'Chad', 'Ed', 'Al', 'Chad', 'Greg', 'Hal', 'Hal', 'Chad', 'Fred', 'Don', 'Hal', 'Hal'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(14);
    //   expect(testBracketList.oneByeCount).toBe(0);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
        
    //     for (let p = 0; p < playerData.length; p++) {
    //       const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
      
    //   // for (let p = 0; p < playerData.length; p++) {        
    //   //   const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 8 Players x 14 Brackets (14 Full, 0 OneBye) - passed shuffled entries #2', () => {

    //   const poc_shuffledEntries: string[] = ['Al', 'Bob', 'Don', 'Al', 'Don', 'Al', 'Hal', 'Chad', 'Don', 'Al', 'Hal', 'Greg', 'Don', 'Ed', 'Bob', 'Fred', 'Ed', 'Chad', 'Ed', 'Al', 'Chad', 'Chad', 'Ed', 'Don', 'Fred', 'Chad', 'Al', 'Greg', 'Hal', 'Al', 'Bob', 'Bob', 'Greg', 'Hal', 'Greg', 'Al', 'Bob', 'Hal', 'Don', 'Greg', 'Ed', 'Greg', 'Ed', 'Chad', 'Al', 'Hal', 'Hal', 'Ed', 'Fred', 'Chad', 'Fred', 'Don', 'Greg', 'Bob', 'Chad', 'Ed', 'Bob', 'Ed', 'Don', 'Greg', 'Chad', 'Hal', 'Greg', 'Hal', 'Ed', 'Chad', 'Don', 'Fred', 'Ed', 'Ed', 'Don', 'Fred', 'Greg', 'Ed', 'Bob', 'Don', 'Bob', 'Fred', 'Hal', 'Chad', 'Al', 'Greg', 'Fred', 'Bob', 'Al', 'Fred', 'Bob', 'Fred', 'Al', 'Chad', 'Don', 'Greg', 'Don', 'Al', 'Chad', 'Don', 'Fred', 'Hal', 'Chad', 'Ed', 'Fred', 'Bob', 'Al', 'Greg', 'Bob', 'Fred', 'Hal', 'Fred', 'Greg', 'Hal', 'Bob', 'Hal'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(14);
    //   expect(testBracketList.oneByeCount).toBe(0);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
        
    //     for (let p = 0; p < playerData.length; p++) {
    //       const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
      
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 8 Players x 14 Brackets (14 Full, 0 OneBye) - randomize shuffles entries', () => {
    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 14, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 14, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 14, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 14, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 14, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 14, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 14, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 14, test_timeStamp: 800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(14);
    //   expect(testBracketList.oneByeCount).toBe(0);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {
    //     const startTime = Date.now();
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
        
    //     for (let p = 0; p < playerData.length; p++) {
    //       const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
      
    //   // for (let p = 0; p < playerData.length; p++) {        
    //   //   const playerNumBrkts = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, playerNumBrkts, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries', () => {
    //   const poc_shuffledEntries: string[] = ['Otto', 'Fred', 'Ken', 'Jim', 'Lou', 'Bye', 'Otto', 'Hal', 'Ed', 'Don', 'Al', 'Rob', 'Jim', 'Ed', 'Ken', 'Greg', 'Al', 'Greg', 'Lou', 'Bob', 'Ken', 'Bye', 'Greg', 'Rob', 'Mike', 'Hal', 'Don', 'Ed', 'Ed', 'Chad', 'Bye', 'Mike', 'Al', 'Jim', 'Ed', 'Ed', 'Chad', 'Ken', 'Chad', 'Ed', 'Hal', 'Nate', 'Al', 'Fred', 'Rob', 'Mike', 'Jim', 'Jim', 'Quin', 'Ken', 'Ed', 'Ian', 'Fred', 'Chad', 'Ian', 'Quin', 'Don', 'Quin', 'Fred', 'Al', 'Mike', 'Nate', 'Ian', 'Hal', 'Otto', 'Bob', 'Bob', 'Rob', 'Jim', 'Chad', 'Jim', 'Al', 'Ed', 'Paul', 'Ken', 'Fred', 'Jim', 'Otto', 'Al', 'Lou', 'Don', 'Hal', 'Al', 'Nate', 'Jim', 'Bye', 'Bob', 'Otto', 'Ed', 'Rob', 'Ian', 'Nate', 'Don', 'Mike', 'Rob', 'Ed', 'Don', 'Hal', 'Don', 'Jim', 'Otto', 'Greg', 'Rob', 'Paul', 'Greg', 'Don', 'Bob', 'Lou', 'Lou', 'Bye', 'Bye', 'Mike', 'Greg', 'Nate', 'Quin', 'Bob', 'Rob', 'Paul', 'Don', 'Hal', 'Ian', 'Bob', 'Paul', 'Quin', 'Ian', 'Ian', 'Rob', 'Ed', 'Al', 'Bob', 'Mike', 'Fred', 'Nate', 'Al', 'Hal', 'Ian', 'Mike', 'Nate', 'Don', 'Nate', 'Nate', 'Otto', 'Rob', 'Nate'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);
      
    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         const debugStr = getDebugBrackets(testBracketList);
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //         console.log(debugStr);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries #2', () => {
    //   const poc_shuffledEntries: string[] = ['Ed', 'Bob', 'Ian', 'Mike', 'Al', 'Lou', 'Otto', 'Don', 'Chad', 'Otto', 'Al', 'Nate', 'Paul', 'Bye', 'Hal', 'Al', 'Don', 'Greg', 'Ian', 'Don', 'Ken', 'Don', 'Nate', 'Ed', 'Jim', 'Chad', 'Rob', 'Otto', 'Ed', 'Rob', 'Fred', 'Hal', 'Greg', 'Ed', 'Rob', 'Rob', 'Otto', 'Al', 'Mike', 'Mike', 'Jim', 'Nate', 'Mike', 'Nate', 'Rob', 'Ed', 'Quin', 'Paul', 'Nate', 'Jim', 'Al', 'Bye', 'Bye', 'Al', 'Nate', 'Lou', 'Ed', 'Mike', 'Jim', 'Lou', 'Jim', 'Otto', 'Don', 'Bob', 'Rob', 'Mike', 'Paul', 'Bob', 'Greg', 'Greg', 'Nate', 'Ian', 'Otto', 'Al', 'Ian', 'Greg', 'Nate', 'Chad', 'Don', 'Bye', 'Bob', 'Don', 'Nate', 'Rob', 'Don', 'Quin', 'Don', 'Bob', 'Ed', 'Ed', 'Bye', 'Fred', 'Hal', 'Quin', 'Hal', 'Otto', 'Ed', 'Lou', 'Jim', 'Rob', 'Fred', 'Hal', 'Ian', 'Hal', 'Bob', 'Jim', 'Greg', 'Ed', 'Bye', 'Hal', 'Rob', 'Bob', 'Ian', 'Ken', 'Jim', 'Chad', 'Rob', 'Ken', 'Nate', 'Ken', 'Hal', 'Ian', 'Al', 'Fred', 'Jim', 'Al', 'Paul', 'Don', 'Quin', 'Ken', 'Chad', 'Quin', 'Lou', 'Ed', 'Mike', 'Fred', 'Ken', 'Al', 'Fred', 'Ed', 'Ian', 'Jim', 'Bob', 'Mike'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);      
    //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);
      
    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking 
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries #2', () => {
    //   const poc_shuffledEntries: string[] = ['Jim', 'Paul', 'Rob', 'Bye', 'Nate', 'Ed', 'Ed', 'Nate', 'Hal', 'Fred', 'Don', 'Chad', 'Rob', 'Bob', 'Jim', 'Don', 'Lou', 'Paul', 'Nate', 'Jim', 'Lou', 'Al', 'Al', 'Al', 'Ken', 'Jim', 'Ian', 'Al', 'Jim', 'Mike', 'Chad', 'Hal', 'Mike', 'Mike', 'Ken', 'Otto', 'Nate', 'Mike', 'Don', 'Ed', 'Jim', 'Nate', 'Chad', 'Paul', 'Ken', 'Don', 'Rob', 'Fred', 'Rob', 'Lou', 'Al', 'Don', 'Nate', 'Al', 'Otto', 'Mike', 'Fred', 'Greg', 'Ed', 'Ed', 'Don', 'Fred', 'Nate', 'Jim', 'Bye', 'Quin', 'Nate', 'Al', 'Quin', 'Bye', 'Ken', 'Greg', 'Nate', 'Mike', 'Otto', 'Ian', 'Quin', 'Ken', 'Ed', 'Al', 'Jim', 'Ian', 'Ken', 'Greg', 'Bye', 'Bye', 'Ed', 'Ian', 'Otto', 'Ed', 'Nate', 'Rob', 'Greg', 'Ian', 'Al', 'Al', 'Hal', 'Bob', 'Bye', 'Fred', 'Rob', 'Ian', 'Ed', 'Bob', 'Otto', 'Chad', 'Rob', 'Ian', 'Bob', 'Chad', 'Greg', 'Bob', 'Otto', 'Lou', 'Hal', 'Rob', 'Mike', 'Rob', 'Rob', 'Ed', 'Lou', 'Don', 'Hal', 'Greg', 'Paul', 'Ed', 'Jim', 'Mike', 'Hal', 'Don', 'Jim', 'Don', 'Quin', 'Bob', 'Don', 'Fred', 'Hal', 'Bob', 'Quin', 'Bob', 'Otto', 'Hal', 'Ian', 'Ed'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       } else {
    //         testBracketList.randomizeErrors.length = 0;
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once to check for errors
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   } else {
    //   //     testBracketList.randomizeErrors.length = 0;
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - move last bracket #1', () => {
    //   const poc_shuffledEntries: string[] = ['Nate', 'Fred', 'Bob', 'Don', 'Ken', 'Al', 'Hal', 'Nate', 'Jim', 'Ian', 'Greg', 'Chad', 'Nate', 'Rob', 'Don', 'Rob', 'Al', 'Don', 'Bye', 'Ed', 'Mike', 'Don', 'Bob', 'Greg', 'Ed', 'Chad', 'Ed', 'Al', 'Lou', 'Chad', 'Nate', 'Ed', 'Ken', 'Jim', 'Ian', 'Mike', 'Bob', 'Fred', 'Bye', 'Chad', 'Al', 'Bye', 'Chad', 'Lou', 'Rob', 'Greg', 'Hal', 'Hal', 'Nate', 'Quin', 'Lou', 'Bob', 'Jim', 'Lou', 'Al', 'Ian', 'Al', 'Rob', 'Paul', 'Hal', 'Rob', 'Rob', 'Ed', 'Don', 'Nate', 'Hal', 'Bye', 'Bob', 'Mike', 'Jim', 'Ian', 'Al', 'Paul', 'Quin', 'Mike', 'Paul', 'Lou', 'Quin', 'Bob', 'Ed', 'Otto', 'Ian', 'Mike', 'Ian', 'Don', 'Don', 'Otto', 'Ed', 'Al', 'Ed', 'Ed', 'Hal', 'Ken', 'Bob', 'Ian', 'Jim', 'Fred', 'Greg', 'Mike', 'Greg', 'Otto', 'Jim', 'Rob', 'Nate', 'Fred', 'Don', 'Bye', 'Bye', 'Jim', 'Otto', 'Mike', 'Ken', 'Don', 'Jim', 'Jim', 'Rob', 'Quin', 'Ian', 'Ken', 'Mike', 'Don', 'Nate', 'Al', 'Ed', 'Greg', 'Ed', 'Rob', 'Paul', 'Hal', 'Fred', 'Otto', 'Nate', 'Quin', 'Fred', 'Bob', 'Otto', 'Al', 'Rob', 'Jim', 'Ed', 'Hal', 'Otto', 'Ken', 'Nate'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {        
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       } else {
    //         testBracketList.randomizeErrors.length = 0;
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once to check for errors
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   } else {
    //   //     testBracketList.randomizeErrors.length = 0;
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries #3', () => {
    //   const poc_shuffledEntries: string[] = ['Rob', 'Mike', 'Don', 'Ed', 'Fred', 'Don', 'Al', 'Bob', 'Fred', 'Nate', 'Nate', 'Mike', 'Al', 'Don', 'Jim', 'Otto', 'Rob', 'Don', 'Otto', 'Rob', 'Fred', 'Jim', 'Don', 'Bob', 'Ken', 'Otto', 'Ian', 'Hal', 'Quin', 'Bob', 'Lou', 'Greg', 'Ian', 'Greg', 'Greg', 'Chad', 'Hal', 'Ian', 'Don', 'Paul', 'Lou', 'Ed', 'Bye', 'Hal', 'Hal', 'Ed', 'Ken', 'Hal', 'Mike', 'Rob', 'Ian', 'Bye', 'Jim', 'Al', 'Nate', 'Bob', 'Al', 'Nate', 'Fred', 'Nate', 'Al', 'Mike', 'Rob', 'Don', 'Jim', 'Ed', 'Fred', 'Don', 'Ed', 'Jim', 'Otto', 'Greg', 'Jim', 'Nate', 'Jim', 'Ed', 'Lou', 'Bob', 'Jim', 'Rob', 'Ian', 'Quin', 'Jim', 'Chad', 'Bob', 'Rob', 'Otto', 'Nate', 'Ian', 'Greg', 'Lou', 'Nate', 'Hal', 'Otto', 'Don', 'Ed', 'Quin', 'Ken', 'Ken', 'Ken', 'Hal', 'Ed', 'Ed', 'Lou', 'Paul', 'Bye', 'Chad', 'Mike', 'Hal', 'Mike', 'Ian', 'Quin', 'Rob', 'Quin', 'Otto', 'Rob', 'Ed', 'Paul', 'Ken', 'Al', 'Bye', 'Bob', 'Rob', 'Paul', 'Bye', 'Ed', 'Ian', 'Al', 'Mike', 'Al', 'Fred', 'Nate', 'Nate', 'Jim', 'Greg', 'Al', 'Mike', 'Bob', 'Chad', 'Chad', 'Ed', 'Al', 'Bye', 'Don'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       } else {
    //         testBracketList.randomizeErrors.length = 0;
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once to check for errors
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   } else {
    //   //     testBracketList.randomizeErrors.length = 0;
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries #4', () => {
    //   const poc_shuffledEntries: string[] = ['Mike', 'Mike', 'Rob', 'Lou', 'Hal', 'Al', 'Ed', 'Ed', 'Greg', 'Al', 'Ken', 'Ken', 'Jim', 'Ed', 'Greg', 'Nate', 'Bob', 'Al', 'Jim', 'Ed', 'Greg', 'Mike', 'Paul', 'Ian', 'Ian', 'Quin', 'Don', 'Mike', 'Otto', 'Hal', 'Otto', 'Hal', 'Mike', 'Chad', 'Nate', 'Nate', 'Lou', 'Bob', 'Lou', 'Chad', 'Ken', 'Rob', 'Otto', 'Jim', 'Don', 'Bye', 'Nate', 'Bob', 'Hal', 'Fred', 'Nate', 'Al', 'Ken', 'Don', 'Ed', 'Greg', 'Al', 'Ian', 'Bye', 'Otto', 'Bob', 'Jim', 'Ian', 'Bye', 'Ian', 'Ian', 'Otto', 'Don', 'Fred', 'Don', 'Bob', 'Greg', 'Ed', 'Chad', 'Bye', 'Otto', 'Al', 'Quin', 'Rob', 'Ed', 'Ed', 'Fred', 'Bob', 'Chad', 'Jim', 'Mike', 'Chad', 'Jim', 'Hal', 'Jim', 'Rob', 'Al', 'Ken', 'Bob', 'Nate', 'Fred', 'Rob', 'Ian', 'Lou', 'Hal', 'Jim', 'Fred', 'Ed', 'Bye', 'Rob', 'Al', 'Paul', 'Quin', 'Lou', 'Hal', 'Rob', 'Nate', 'Don', 'Greg', 'Quin', 'Rob', 'Nate', 'Mike', 'Jim', 'Don', 'Don', 'Al', 'Ed', 'Ian', 'Al', 'Don', 'Ed', 'Mike', 'Ken', 'Otto', 'Fred', 'Nate', 'Ed', 'Paul', 'Hal', 'Rob', 'Quin', 'Paul', 'Bob', 'Bye', 'Don', 'Jim', 'Nate', 'Rob'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       } else {
    //         testBracketList.randomizeErrors.length = 0;
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }
      
    //   // // run once to check for errors
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   } else {
    //   //     testBracketList.randomizeErrors.length = 0;
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - pass shuffled entries #5', () => {
    //   const poc_shuffledEntries: string[] = ['Don', 'Hal', 'Bob', 'Hal', 'Chad', 'Ken', 'Mike', 'Rob', 'Bye', 'Mike', 'Rob', 'Mike', 'Mike', 'Fred', 'Lou', 'Hal', 'Quin', 'Al', 'Bob', 'Chad', 'Paul', 'Nate', 'Ken', 'Greg', 'Hal', 'Rob', 'Jim', 'Bye', 'Ian', 'Ian', 'Jim', 'Ian', 'Bye', 'Bob', 'Fred', 'Jim', 'Ed', 'Ed', 'Otto', 'Greg', 'Hal', 'Al', 'Ken', 'Bye', 'Ed', 'Don', 'Don', 'Ed', 'Chad', 'Ed', 'Al', 'Al', 'Fred', 'Rob', 'Nate', 'Hal', 'Ed', 'Mike', 'Ed', 'Al', 'Ian', 'Ian', 'Otto', 'Ken', 'Bob', 'Chad', 'Al', 'Ed', 'Ian', 'Don', 'Rob', 'Don', 'Mike', 'Ed', 'Ed', 'Jim', 'Greg', 'Jim', 'Otto', 'Jim', 'Ken', 'Greg', 'Greg', 'Ian', 'Don', 'Ed', 'Fred', 'Fred', 'Hal', 'Fred', 'Otto', 'Ed', 'Hal', 'Quin', 'Lou', 'Al', 'Jim', 'Otto', 'Bye', 'Ian', 'Mike', 'Rob', 'Quin', 'Rob', 'Otto', 'Nate', 'Greg', 'Nate', 'Jim', 'Chad', 'Bob', 'Rob', 'Otto', 'Nate', 'Bob', 'Bye', 'Nate', 'Lou', 'Don', 'Paul', 'Paul', 'Don', 'Mike', 'Don', 'Nate', 'Al', 'Bob', 'Rob', 'Lou', 'Al', 'Don', 'Quin', 'Paul', 'Bob', 'Jim', 'Jim', 'Nate', 'Quin', 'Al', 'Rob', 'Nate', 'Nate', 'Lou', 'Ken'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {
    //     const startTime = Date.now();
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets (12 Full, 6 OneBye) - randomize shuffles entries', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 8, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(12);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {
    //     const startTime = Date.now();
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
              
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets, 1 players 50 entries (15 Full, 6 OneBye) - passed shuffled entries #1', () => {

    //   const poc_shuffledEntries: string[] = ['Don', 'Ed', 'Nate', 'Nate', 'Rob', 'Chad', 'Al', 'Otto', 'Hal', 'Al', 'Otto', 'Mike', 'Lou', 'Mike', 'Lou', 'Bob', 'Al', 'Jim', 'Ian', 'Mike', 'Otto', 'Ian', 'Rob', 'Chad', 'Ian', 'Lou', 'Chad', 'Ken', 'Fred', 'Ed', 'Ken', 'Al', 'Mike', 'Mike', 'Rob', 'Al', 'Paul', 'Al', 'Ken', 'Quin', 'Ian', 'Nate', 'Ian', 'Al', 'Mike', 'Ed', 'Jim', 'Al', 'Jim', 'Ken', 'Mike', 'Al', 'Hal', 'Bob', 'Lou', 'Paul', 'Jim', 'Al', 'Don', 'Jim', 'Ed', 'Paul', 'Otto', 'Greg', 'Ed', 'Hal', 'Al', 'Jim', 'Chad', 'Rob', 'Don', 'Nate', 'Quin', 'Fred', 'Fred', 'Jim', 'Fred', 'Greg', 'Ed', 'Fred', 'Ed', 'Hal', 'Ed', 'Bob', 'Greg', 'Jim', 'Bye', 'Al', 'Ken', 'Bob', 'Mike', 'Ed', 'Al', 'Chad', 'Quin', 'Nate', 'Fred', 'Don', 'Rob', 'Ed', 'Rob', 'Ian', 'Al', 'Bob', 'Bob', 'Otto', 'Jim', 'Ken', 'Hal', 'Rob', 'Nate', 'Quin', 'Bob', 'Nate', 'Greg', 'Don', 'Quin', 'Ed', 'Don', 'Otto', 'Al', 'Otto', 'Nate', 'Hal', 'Greg', 'Don', 'Hal', 'Bob', 'Hal', 'Al', 'Ian', 'Bob', 'Bob', 'Nate', 'Al', 'Lou', 'Ed', 'Don', 'Rob', 'Don', 'Bye', 'Jim', 'Greg', 'Al', 'Paul', 'Ian', 'Al', 'Nate', 'Rob', 'Rob', 'Bye', 'Don'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(16);
    //   expect(testBracketList.oneByeCount).toBe(3);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 1500 times
    //   for (let i = 1; i <= 500; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   // if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })    
    // it('should randomize brackets 18 Players x random Brackets, 1 players 50 entries (15 Full, 6 OneBye) - passed shuffled entries #2', () => {

    //   const poc_shuffledEntries: string[] = ['Paul', 'Mike', 'Al', 'Otto', 'Hal', 'Otto', 'Lou', 'Rob', 'Al', 'Hal', 'Fred', 'Bob', 'Don', 'Bob', 'Otto', 'Ian', 'Ed', 'Don', 'Quin', 'Hal', 'Rob', 'Chad', 'Mike', 'Nate', 'Fred', 'Bob', 'Jim', 'Ken', 'Ed', 'Mike', 'Mike', 'Quin', 'Jim', 'Greg', 'Bye', 'Paul', 'Al', 'Mike', 'Chad', 'Al', 'Don', 'Ken', 'Quin', 'Ed', 'Al', 'Nate', 'Jim', 'Mike', 'Jim', 'Rob', 'Al', 'Ian', 'Quin', 'Lou', 'Ken', 'Ed', 'Al', 'Bye', 'Ian', 'Ian', 'Don', 'Rob', 'Ed', 'Don', 'Ed', 'Chad', 'Hal', 'Nate', 'Hal', 'Chad', 'Rob', 'Ed', 'Lou', 'Rob', 'Bob', 'Al', 'Al', 'Mike', 'Rob', 'Jim', 'Ian', 'Fred', 'Bob', 'Ed', 'Lou', 'Paul', 'Ian', 'Al', 'Ian', 'Al', 'Quin', 'Al', 'Nate', 'Jim', 'Don', 'Al', 'Fred', 'Otto', 'Fred', 'Lou', 'Ian', 'Al', 'Greg', 'Ken', 'Nate', 'Ed', 'Ed', 'Al', 'Al', 'Ken', 'Ed', 'Fred', 'Al', 'Greg', 'Bob', 'Al', 'Don', 'Otto', 'Jim', 'Rob', 'Jim', 'Jim', 'Greg', 'Don', 'Don', 'Al', 'Nate', 'Ken', 'Greg', 'Bob', 'Rob', 'Nate', 'Nate', 'Don', 'Bob', 'Chad', 'Nate', 'Hal', 'Rob', 'Bye', 'Nate', 'Hal', 'Jim', 'Mike', 'Otto', 'Greg', 'Ed', 'Bob', 'Bob', 'Paul', 'Hal', 'Otto'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(16);
    //   expect(testBracketList.oneByeCount).toBe(3);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 1500 times
    //   for (let i = 1; i <= 500; i++) {
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   // if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })    
    // it('should randomize brackets 18 Players x random Brackets, 1 players 50 entries (15 Full, 6 OneBye) - randomize shuffles entries', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(16);
    //   expect(testBracketList.oneByeCount).toBe(3);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 1500 times
    //   for (let i = 1; i <= 1500; i++) {
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run once for error checking
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 19; // adjusted entries for Al
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   // if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets, 2 players 50 entries (15 Full, 6 OneBye) - pass shuffles entries', () => {
    //   const poc_shuffledEntries: string[] = ['Rob', 'Ken', 'Don', 'Greg', 'Bob', 'Paul', 'Al', 'Hal', 'Ed', 'Mike', 'Nate', 'Otto', 'Mike', 'Bob', 'Jim', 'Ian', 'Hal', 'Mike', 'Nate', 'Ed', 'Hal', 'Bob', 'Chad', 'Al', 'Nate', 'Paul', 'Hal', 'Al', 'Ed', 'Jim', 'Ken', 'Mike', 'Lou', 'Al', 'Bye', 'Chad', 'Mike', 'Bob', 'Rob', 'Al', 'Greg', 'Bob', 'Otto', 'Bob', 'Bye', 'Greg', 'Al', 'Greg', 'Rob', 'Otto', 'Mike', 'Don', 'Don', 'Bob', 'Lou', 'Rob', 'Jim', 'Jim', 'Bob', 'Rob', 'Otto', 'Don', 'Ed', 'Jim', 'Ian', 'Ian', 'Greg', 'Nate', 'Al', 'Al', 'Al', 'Quin', 'Al', 'Ian', 'Chad', 'Bob', 'Ian', 'Nate', 'Greg', 'Lou', 'Ed', 'Bob', 'Rob', 'Jim', 'Don', 'Jim', 'Ed', 'Bob', 'Paul', 'Bye', 'Nate', 'Rob', 'Ken', 'Chad', 'Al', 'Bye', 'Mike', 'Nate', 'Hal', 'Nate', 'Ed', 'Rob', 'Paul', 'Mike', 'Ed', 'Quin', 'Fred', 'Bob', 'Hal', 'Lou', 'Bob', 'Al', 'Lou', 'Hal', 'Fred', 'Bob', 'Al', 'Al', 'Fred', 'Ken', 'Otto', 'Ken', 'Ed', 'Bye', 'Bob', 'Don', 'Nate', 'Al', 'Ian', 'Don', 'Bob', 'Al', 'Don', 'Bye', 'Rob', 'Don', 'Otto', 'Ed', 'Ed', 'Quin', 'Ken', 'Al', 'Jim', 'Bob', 'Fred', 'Jim', 'Ian', 'Hal', 'Rob', 'Nate', 'Chad', 'Bob', 'Al', 'Bob', 'Quin', 'Otto', 'Al', 'Fred', 'Ed', 'Fred', 'Bob', 'Ian', 'Don', 'Al', 'Al', 'Bob', 'Quin', 'Jim'];
      
    //   let poc_shuffledEntriesObjArr: playerUsedType[];

    //   // create playerUsedType array
    //   poc_shuffledEntriesObjArr = [];
    //   poc_shuffledEntriesObjArr = poc_shuffledEntries.map(playerId => ({
    //     playerId,
    //     used: false
    //   }));

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },        
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(15);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);

    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <=250; i++) {   
    //     const startTime = Date.now();
    //     // testBracketList.randomize([]);  
    //     testBracketList.randomize(poc_shuffledEntriesObjArr);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);             
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 21; // adjusted entries for Al      
    //     adjustedEntries[1].test_brkts = 21; // adjusted entries for Bob
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //     if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once for error checking
    //   // testBracketList.randomize(poc_shuffledEntriesObjArr);     
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 21; // adjusted entries for Al 
    //   // adjustedEntries[1].test_brkts = 21; // adjusted entries for Bob
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   // if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets, 2 players 50 entries (15 Full, 6 OneBye) - randomize shuffles entries', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },        
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(15);
    //   expect(testBracketList.oneByeCount).toBe(6);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);
      
    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {     
    //     const startTime = Date.now();
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);             
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 21; // adjusted entries for Al      
    //     adjustedEntries[1].test_brkts = 21; // adjusted entries for Bob
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run once to check for errors
    //   // testBracketList.randomize([]);     
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 21; // adjusted entries for Al 
    //   // adjustedEntries[1].test_brkts = 21; // adjusted entries for Bob
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x random Brackets, 3 players 50 entries (15 Full, 6 OneBye) - randomize shuffles entries', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 50, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 50, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 5, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 50, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 12, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 6, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 6, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 8, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 8, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 6, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 5, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 8, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 7, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 4, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 5, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },        
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(18);
    //   expect(testBracketList.oneByeCount).toBe(5);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);
      
    //   // Performance test & ramdomize test - randomize 250 times
    //   let resultsStr = '';
    //   for (let i = 1; i <= 250; i++) {     
    //     const startTime = Date.now();
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);             
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[0].test_brkts = 23; // adjusted entries for Al      
    //     adjustedEntries[1].test_brkts = 23; // adjusted entries for Bob
    //     adjustedEntries[3].test_brkts = 23; // adjusted entries for Don
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //     const endTime = Date.now();
    //     resultsStr += `${i}\t${endTime - startTime}\t${testBracketList.randomizeErrors[lastIndex].tryCount}\n`;
    //   }
    //   // console.log(resultsStr);

    //   // // run test one to check for errors
    //   // testBracketList.randomize([]);     
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[0].test_brkts = 23; // adjusted entries for Al      
    //   // adjustedEntries[1].test_brkts = 23; // adjusted entries for Bob
    //   // adjustedEntries[3].test_brkts = 23; // adjusted entries for don
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   // if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 18 Players x 10 Brackets, (19 Full, 4 OneBye) - check bracket entries sort', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Paul', test_brkts: 10, test_timeStamp: 1600 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
    //     { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 10, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 10, test_timeStamp: 1200 },
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Mike', test_brkts: 10, test_timeStamp: 1300 },
    //     { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
    //     { player_id: 'Otto', test_brkts: 10, test_timeStamp: 1500 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Quin', test_brkts: 10, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },        
    //     { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
    //   ];

    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(19);
    //   expect(testBracketList.oneByeCount).toBe(4);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);
        
    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {           
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');        
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);             
    //     for (let p = 0; p < playerData.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run test once to check for errors
    //   // testBracketList.randomize([]);     
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);
            
    //   // for (let p = 0; p < playerData.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(playerData[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, playerData, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${playerData[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 60 Players x random Brackets, 1 Player 100 entries (64 Full, 7 OneBye) - randomize shuffles entries', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 10, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 10, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 10, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 10, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 10, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 10, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //     { player_id: 'Sam', test_brkts: 6, test_timeStamp: 1900 },
    //     { player_id: 'Tom', test_brkts: 4, test_timeStamp: 2000 },
    //     { player_id: 'Umar', test_brkts: 8, test_timeStamp: 2100 },
    //     { player_id: 'Vince', test_brkts: 5, test_timeStamp: 2200 },
    //     { player_id: 'Will', test_brkts: 9, test_timeStamp: 2300 },
    //     { player_id: 'Xander', test_brkts: 7, test_timeStamp: 2400 },
    //     { player_id: 'Yuri', test_brkts: 6, test_timeStamp: 2500 },
    //     { player_id: 'Zane', test_brkts: 8, test_timeStamp: 2600 },
    //     { player_id: 'Adam', test_brkts: 4, test_timeStamp: 2700 },
    //     { player_id: 'Ben', test_brkts: 5, test_timeStamp: 2800 },
    //     { player_id: 'Carl', test_brkts: 7, test_timeStamp: 2900 },
    //     { player_id: 'Dave', test_brkts: 6, test_timeStamp: 3000 },
    //     { player_id: 'Eli', test_brkts: 8, test_timeStamp: 3100 },
    //     { player_id: 'Finn', test_brkts: 9, test_timeStamp: 3200 },
    //     { player_id: 'Gabe', test_brkts: 10, test_timeStamp: 3300 },
    //     { player_id: 'Hank', test_brkts: 5, test_timeStamp: 3400 },
    //     { player_id: 'Isaac', test_brkts: 9, test_timeStamp: 3500 },
    //     { player_id: 'Joe', test_brkts: 4, test_timeStamp: 3600 },
    //     { player_id: 'Kyle', test_brkts: 8, test_timeStamp: 3700 },
    //     { player_id: 'Liam', test_brkts: 6, test_timeStamp: 3800 },
    //     { player_id: 'Mark', test_brkts: 5, test_timeStamp: 3900 },
    //     { player_id: 'Noah', test_brkts: 4, test_timeStamp: 4000 },
    //     { player_id: 'Owen', test_brkts: 7, test_timeStamp: 4100 },
    //     { player_id: 'Pete', test_brkts: 9, test_timeStamp: 4200 },
    //     { player_id: 'Ric', test_brkts: 6, test_timeStamp: 4300 },
    //     { player_id: 'Stu', test_brkts: 8, test_timeStamp: 4400 },
    //     { player_id: 'Ted', test_brkts: 10, test_timeStamp: 4500 },
    //     { player_id: 'Vic', test_brkts: 5, test_timeStamp: 4600 },
    //     { player_id: 'Wes', test_brkts: 4, test_timeStamp: 4700 },
    //     { player_id: 'Xavier', test_brkts: 9, test_timeStamp: 4800 },
    //     { player_id: 'Yann', test_brkts: 7, test_timeStamp: 4900 },
    //     { player_id: 'Zeke', test_brkts: 6, test_timeStamp: 5000 },
    //     { player_id: 'Aaron', test_brkts: 10, test_timeStamp: 5100 },
    //     { player_id: 'Bill', test_brkts: 8, test_timeStamp: 5200 },
    //     { player_id: 'Cam', test_brkts: 20, test_timeStamp: 5300 },
    //     { player_id: 'Dick', test_brkts: 20, test_timeStamp: 5400 },
    //     { player_id: 'Eric', test_brkts: 100, test_timeStamp: 5500 },
    //     { player_id: 'Felix', test_brkts: 7, test_timeStamp: 5600 },
    //     { player_id: 'Gary', test_brkts: 9, test_timeStamp: 5700 },
    //     { player_id: 'Harry', test_brkts: 10, test_timeStamp: 5800 },
    //     { player_id: 'Ivan', test_brkts: 7, test_timeStamp: 5900 },
    //     { player_id: 'John', test_brkts: 9, test_timeStamp: 6000 },
    //   ];
            
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(68);
    //   expect(testBracketList.oneByeCount).toBe(3);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);
            
    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {           
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);             
    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[54].test_brkts = 71; // adjusted entries for Eric              
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }
    //   }

    //   // // run test once to check for errors
    //   // testBracketList.randomize([]);     
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);

    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[54].test_brkts = 71; // adjusted entries for Eric            
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }
    // })
    // it('should randomize brackets 60 Players x random Brackets, shuffle individual brackets after randomize', () => {

    //   const testBracketList = new BracketList('test', 2, 3);
    //   const playerData = [
    //     { player_id: 'Al', test_brkts: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_brkts: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_brkts: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_brkts: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_brkts: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_brkts: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_brkts: 10, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_brkts: 10, test_timeStamp: 800 },
    //     { player_id: 'Ian', test_brkts: 10, test_timeStamp: 900 },
    //     { player_id: 'Jim', test_brkts: 10, test_timeStamp: 1000 },
    //     { player_id: 'Ken', test_brkts: 10, test_timeStamp: 1100 },
    //     { player_id: 'Lou', test_brkts: 10, test_timeStamp: 1200 },
    //     { player_id: 'Mike', test_brkts: 10, test_timeStamp: 1300 },
    //     { player_id: 'Nate', test_brkts: 10, test_timeStamp: 1400 },
    //     { player_id: 'Otto', test_brkts: 10, test_timeStamp: 1500 },
    //     { player_id: 'Paul', test_brkts: 10, test_timeStamp: 1600 },
    //     { player_id: 'Quin', test_brkts: 10, test_timeStamp: 1700 },
    //     { player_id: 'Rob', test_brkts: 10, test_timeStamp: 1800 },
    //     { player_id: 'Sam', test_brkts: 6, test_timeStamp: 1900 },
    //     { player_id: 'Tom', test_brkts: 4, test_timeStamp: 2000 },
    //     { player_id: 'Umar', test_brkts: 8, test_timeStamp: 2100 },
    //     { player_id: 'Vince', test_brkts: 5, test_timeStamp: 2200 },
    //     { player_id: 'Will', test_brkts: 9, test_timeStamp: 2300 },
    //     { player_id: 'Xander', test_brkts: 7, test_timeStamp: 2400 },
    //     { player_id: 'Yuri', test_brkts: 6, test_timeStamp: 2500 },
    //     { player_id: 'Zane', test_brkts: 8, test_timeStamp: 2600 },
    //     { player_id: 'Adam', test_brkts: 4, test_timeStamp: 2700 },
    //     { player_id: 'Ben', test_brkts: 5, test_timeStamp: 2800 },
    //     { player_id: 'Carl', test_brkts: 7, test_timeStamp: 2900 },
    //     { player_id: 'Dave', test_brkts: 6, test_timeStamp: 3000 },
    //     { player_id: 'Eli', test_brkts: 8, test_timeStamp: 3100 },
    //     { player_id: 'Finn', test_brkts: 9, test_timeStamp: 3200 },
    //     { player_id: 'Gabe', test_brkts: 10, test_timeStamp: 3300 },
    //     { player_id: 'Hank', test_brkts: 5, test_timeStamp: 3400 },
    //     { player_id: 'Isaac', test_brkts: 9, test_timeStamp: 3500 },
    //     { player_id: 'Joe', test_brkts: 4, test_timeStamp: 3600 },
    //     { player_id: 'Kyle', test_brkts: 8, test_timeStamp: 3700 },
    //     { player_id: 'Liam', test_brkts: 6, test_timeStamp: 3800 },
    //     { player_id: 'Mark', test_brkts: 5, test_timeStamp: 3900 },
    //     { player_id: 'Noah', test_brkts: 4, test_timeStamp: 4000 },
    //     { player_id: 'Owen', test_brkts: 7, test_timeStamp: 4100 },
    //     { player_id: 'Pete', test_brkts: 9, test_timeStamp: 4200 },
    //     { player_id: 'Ric', test_brkts: 6, test_timeStamp: 4300 },
    //     { player_id: 'Stu', test_brkts: 8, test_timeStamp: 4400 },
    //     { player_id: 'Ted', test_brkts: 10, test_timeStamp: 4500 },
    //     { player_id: 'Vic', test_brkts: 5, test_timeStamp: 4600 },
    //     { player_id: 'Wes', test_brkts: 4, test_timeStamp: 4700 },
    //     { player_id: 'Xavier', test_brkts: 9, test_timeStamp: 4800 },
    //     { player_id: 'Yann', test_brkts: 7, test_timeStamp: 4900 },
    //     { player_id: 'Zeke', test_brkts: 6, test_timeStamp: 5000 },
    //     { player_id: 'Aaron', test_brkts: 10, test_timeStamp: 5100 },
    //     { player_id: 'Bill', test_brkts: 8, test_timeStamp: 5200 },
    //     { player_id: 'Cam', test_brkts: 20, test_timeStamp: 5300 },
    //     { player_id: 'Dick', test_brkts: 20, test_timeStamp: 5400 },
    //     { player_id: 'Eric', test_brkts: 100, test_timeStamp: 5500 },
    //     { player_id: 'Felix', test_brkts: 7, test_timeStamp: 5600 },
    //     { player_id: 'Gary', test_brkts: 9, test_timeStamp: 5700 },
    //     { player_id: 'Harry', test_brkts: 10, test_timeStamp: 5800 },
    //     { player_id: 'Ivan', test_brkts: 7, test_timeStamp: 5900 },
    //     { player_id: 'John', test_brkts: 9, test_timeStamp: 6000 },
    //   ];
            
    //   testBracketList.calcTotalBrkts(playerData);
    //   expect(testBracketList.fullCount).toBe(68);
    //   expect(testBracketList.oneByeCount).toBe(3);

    //   const neededCountMap = createNeededMapCount(testBracketList.brktEntries);
            
    //   // Performance test & ramdomize test - randomize 250 times
    //   for (let i = 1; i <= 250; i++) {
    //     testBracketList.randomize([]);
    //     expect(testBracketList.errorCode).toBe(BracketList.noError);
    //     expect(testBracketList.errorMessage).toBe('');
    //     const lastIndex = testBracketList.randomizeErrors.length - 1;
    //     if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //       console.log(testBracketList.randomizeErrors);
    //     }
    //     expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //     expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);

    //     const adjustedEntries = cloneDeep(playerData)
    //     adjustedEntries[54].test_brkts = 71; // adjusted entries for Eric            
    //     for (let p = 0; p < adjustedEntries.length; p++) {
    //       const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //       const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //       const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //       if (errorInfo.error !== 0) {
    //         console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //       }
    //       expect(errorInfo.error).toBe(0);
    //     }

    //     // eric is going to be entred first in all brackets
    //     // check to see eric's positions in each bracket
    //     const positions: number[] = Array(8).fill(0);      
    //     testBracketList.brackets.forEach((brkt) => { 
    //       expect(brkt.players.length).toBe(testBracketList.playersPerBrkt);
    //       const playerIndex = brkt.players.indexOf(adjustedEntries[54].player_id);
    //       if (playerIndex !== -1) {
    //         positions[playerIndex] += 1;
    //       }        
    //     })
    //     for (let i = 0; i < positions.length; i++) {        
    //       expect(positions[i]).toBeLessThan(testBracketList.brackets.length);
    //       expect(positions[i]).toBeGreaterThan(0);
    //     }
    //   }

    //   // // run test once to check for errors
    //   // testBracketList.randomize([]);
    //   // const lastIndex = testBracketList.randomizeErrors.length - 1;
    //   // if (testBracketList.randomizeErrors[lastIndex].error !== 0) {
    //   //   console.log(testBracketList.randomizeErrors);
    //   // }
    //   // expect(testBracketList.randomizeErrors[lastIndex].error).toBe(0);
    //   // expect(testBracketList.brackets.length).toBe(testBracketList.fullCount + testBracketList.oneByeCount);

    //   // const adjustedEntries = cloneDeep(playerData)
    //   // adjustedEntries[54].test_brkts = 71; // adjusted entries for Eric            
    //   // for (let p = 0; p < adjustedEntries.length; p++) {
    //   //   const priorCount = testBracketList.count1stPosBrktsForPlayer(adjustedEntries[p].player_id);
    //   //   const oppoMap = testBracketList.createOppoMapForTesting(p, priorCount, neededCountMap)
    //   //   const errorInfo: errorInfoType = validBracketsForPlayer(testBracketList, adjustedEntries, p, oppoMap);
    //   //   if (errorInfo.error !== 0) {
    //   //     console.log(`player: ${adjustedEntries[p].player_id} error: ${errorInfo.error}`);
    //   //   }
    //   //   expect(errorInfo.error).toBe(0);
    //   // }

    //   // // eric is going to be entred first in all brackets
    //   // // check to see eric's positions in each bracket
    //   // const positions: number[] = Array(8).fill(0);      
    //   // testBracketList.brackets.forEach((brkt) => { 
    //   //   expect(brkt.players.length).toBe(testBracketList.playersPerBrkt);
    //   //   const playerIndex = brkt.players.indexOf(adjustedEntries[54].player_id);
    //   //   if (playerIndex !== -1) {
    //   //     positions[playerIndex] += 1;
    //   //   }        
    //   // })
    //   // for (let i = 0; i < positions.length; i++) {        
    //   //   expect(positions[i]).toBeLessThan(testBracketList.brackets.length);
    //   //   expect(positions[i]).toBeGreaterThan(0);
    //   // }
    // })
  })

  describe('clear', () => { 

    beforeAll(() => {
      populateBrackets();
    })

    it('should clear the brackets array', () => {
      mockBracketList.clear();
      expect(mockBracketList.brackets).toHaveLength(0);
      expect(mockBracketList.brktCounts.forFullValues).toHaveLength(0);
      expect(mockBracketList.brktCounts.forOneByeValues).toHaveLength(0);
      expect(mockBracketList.randomizeErrors).toHaveLength(0);
      expect(mockBracketList.errorCode).toBe(BracketList.noError);
      expect(mockBracketList.errorMessage).toBe("");
    })
  })

  describe('findPlayer', () => { 

    // beforeAll(() => {
    //   populateBrackets();
    // })    

    // it('should find correct bracket for a player', () => { 
    //   const result = mockBracketList.findPlayer('Al', 0);
    //   expect(result.brktIndex).toBe(0);
    //   expect(result.playerIndex).toBe(0);

    //   const result2 = mockBracketList.findPlayer('Chad', 1);
    //   expect(result2.brktIndex).toBe(1);
    //   expect(result2.playerIndex).toBe(3);
    // })
    // it('should return -1, -1 for player not found', () => { 
    //   const result = mockBracketList.findPlayer('player-99', 0);
    //   expect(result.brktIndex).toBe(-1);
    //   expect(result.playerIndex).toBe(-1);
    // })
    // it('should return -1, -1 for player invalid player id', () => { 
    //   const result = mockBracketList.findPlayer('', 0);
    //   expect(result.brktIndex).toBe(-1);
    //   expect(result.playerIndex).toBe(-1);
    //   const result2 = mockBracketList.findPlayer(null as any, 0);
    //   expect(result2.brktIndex).toBe(-1);
    //   expect(result2.playerIndex).toBe(-1);
    // })
    // it('should return -1, -1 for invalid bracket index', () => {
    //   const result = mockBracketList.findPlayer('Al', -1);    
    //   expect(result.brktIndex).toBe(-1);
    //   expect(result.playerIndex).toBe(-1);
    //   const result1 = mockBracketList.findPlayer('Al', mockBracketList.brackets.length);
    //   expect(result1.brktIndex).toBe(-1);
    //   expect(result1.playerIndex).toBe(-1);
    // })
  })

})