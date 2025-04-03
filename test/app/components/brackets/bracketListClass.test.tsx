import { Bracket } from "@/components/brackets/bracketClass"
import { BGNumberedColCount, brktColTitle, initBGColNames, toFillColTitle } from "@/components/brackets/bracketGrid";
import { BracketList, brktCountType, initBrktCountsType, totalBrktsType } from "@/components/brackets/bracketListClass"

describe('BracketList', () => { 
  
  const mockBracketList = new BracketList("mock", 2, 3);
  const playerData = [
    { player_id: 'Al', mock_name: 10, test_timeStamp: 100 },
    { player_id: 'Bob', mock_name: 8, test_timeStamp: 200 },
    { player_id: 'Chad', mock_name: 6, test_timeStamp: 300 },
    { player_id: 'Don', mock_name: 7, test_timeStamp: 400 },
    { player_id: 'Ed', mock_name: 6, test_timeStamp: 500 },
    { player_id: 'Fred', mock_name: 4, test_timeStamp: 600 },
    { player_id: 'Greg', mock_name: 6, test_timeStamp: 700 },
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
    it('NeedToAddBrkt should return true when brackets array is empty', () => {
      const result = testBracketList.needToAddBrkt;
      expect(result).toBe(true);
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

  describe('addBracket', () => {
  
    // it('should add a new bracket to the brackets array', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   let brkt1 = testBracketList.addBrkt();
    //   expect(brkt1).not.toBeNull();
    //   expect(testBracketList.brackets).toHaveLength(1);

    //   const result = testBracketList.putPlayerInBrkt('Al');
    //   expect(result).not.toBeNull();
    //   if (!result) return;
    //   expect(testBracketList.brackets).toHaveLength(1);
    //   expect(testBracketList.brackets[0].players).toHaveLength(1);
    //   expect(result.players).toHaveLength(1);
    //   expect(result.players[0]).toBe('Al');
    //   expect(result.players[0]).toBe(brkt1.players[0]);
    // })
  })

  // moved from class function to function inside of rePopulateBrkts
  // start as class functions for testing
  describe('class functions for testing only', () => { 

    describe('adjustPlayersNumBrkts', () => { 
    
      // it('should make no adjustemnts wehn brackets are already balanced', () => {
        
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_name !== b.test_name) {
      //       return b.test_name - a.test_name; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });
    
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(10);
      //   expect(totalBrkts.full).toBe(10);
      //   expect(totalBrkts.oneBye).toBe(0);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_name).toBe(10);
      //   expect(playerData[1].test_name).toBe(10);
      //   expect(playerData[2].test_name).toBe(8);
      //   expect(playerData[3].test_name).toBe(8);
      //   expect(playerData[4].test_name).toBe(8);
      //   expect(playerData[5].test_name).toBe(7);
      //   expect(playerData[6].test_name).toBe(6);
      //   expect(playerData[7].test_name).toBe(6);
      //   expect(playerData[8].test_name).toBe(6);
      //   expect(playerData[9].test_name).toBe(6);
      //   expect(playerData[10].test_name).toBe(5);
      // })
      // it('edge case high, should adjust Al to 19 brackets', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_name !== b.test_name) {
      //       return b.test_name - a.test_name; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });

      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(23);
      //   expect(totalBrkts.full).toBe(17);
      //   expect(totalBrkts.oneBye).toBe(6);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_name).toBe(19);
      //   expect(playerData[1].test_name).toBe(12);
      //   expect(playerData[2].test_name).toBe(10);
      //   expect(playerData[3].test_name).toBe(10);
      //   expect(playerData[4].test_name).toBe(10);
      //   expect(playerData[5].test_name).toBe(10);
      //   expect(playerData[6].test_name).toBe(8);
      //   expect(playerData[7].test_name).toBe(8);
      //   expect(playerData[8].test_name).toBe(8);
      //   expect(playerData[9].test_name).toBe(8);
      //   expect(playerData[10].test_name).toBe(7);
      //   expect(playerData[11].test_name).toBe(6);
      //   expect(playerData[12].test_name).toBe(6);
      //   expect(playerData[13].test_name).toBe(6);
      //   expect(playerData[14].test_name).toBe(5);
      //   expect(playerData[15].test_name).toBe(5);
      //   expect(playerData[16].test_name).toBe(5);
      //   expect(playerData[17].test_name).toBe(4);
      // })
      // it('edge case high, should adjust Al and Bob tp 21 brackets', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 50, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      //   ];      
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_name !== b.test_name) {
      //       return b.test_name - a.test_name; // descending
      //     } else {
      //       return a.createdAt - b.createdAt; // ascending
      //     }
      //   });

      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(28);
      //   expect(totalBrkts.full).toBe(24);
      //   expect(totalBrkts.oneBye).toBe(4);

      //   testBracketList.adjustPlayersNumBrkts(playerData, totalBrkts);
      //   expect(playerData[0].test_name).toBe(21);
      //   expect(playerData[1].test_name).toBe(21);
      //   expect(playerData[2].test_name).toBe(12);
      //   expect(playerData[3].test_name).toBe(10);
      //   expect(playerData[4].test_name).toBe(10);
      //   expect(playerData[5].test_name).toBe(10);
      //   expect(playerData[6].test_name).toBe(10);
      //   expect(playerData[7].test_name).toBe(8);
      //   expect(playerData[8].test_name).toBe(8);
      //   expect(playerData[9].test_name).toBe(8);
      //   expect(playerData[10].test_name).toBe(7);
      //   expect(playerData[11].test_name).toBe(6);
      //   expect(playerData[12].test_name).toBe(6);
      //   expect(playerData[13].test_name).toBe(6);
      //   expect(playerData[14].test_name).toBe(5);
      //   expect(playerData[15].test_name).toBe(5);
      //   expect(playerData[16].test_name).toBe(5);
      //   expect(playerData[17].test_name).toBe(4);

      //   expect(totalBrkts.total).toBe(21);
      //   expect(totalBrkts.full).toBe(15);
      //   expect(totalBrkts.oneBye).toBe(6);
      // })
      // it('edge case low, should return the correct number of brackets (2, 6 Full, -4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);      
      //   // num brackets name = id + "_name" = 'test_name'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      //   ];      
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   playerData.sort((a, b) => {
      //     if (a.test_name !== b.test_name) {
      //       return b.test_name - a.test_name; // descending
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

    describe('calculateNumBrackets', () => { 

      // it('should return the correct number of brackets (6, 5 Full, 1 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(6);
      //   expect(totalBrkts.full).toBe(5);
      //   expect(totalBrkts.oneBye).toBe(1);
      // })
      // it('should return the correct number of brackets (7, 4 Full, 3 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 6, test_timeStamp: 800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(7);
      //   expect(totalBrkts.full).toBe(4);
      //   expect(totalBrkts.oneBye).toBe(3);
      // })
      // it('should return the correct number of brackets (13, 9 Full, 4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 10, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(13);
      //   expect(totalBrkts.full).toBe(9);
      //   expect(totalBrkts.oneBye).toBe(4);
      // })
      // it('edge case high, should return the correct number of brackets (24, 4 Full, 4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 50, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      //     { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
      //     { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
      //     { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
      //     { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
      //     { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
      //     { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
      //     { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(28);
      //   expect(totalBrkts.full).toBe(24);
      //   expect(totalBrkts.oneBye).toBe(4);
      // })
      // it('edge case low, should return the correct number of brackets (2, 6 Full, -4 OneBye)', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData = [
      //     { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      //   ];
      //   const totalBrkts: totalBrktsType = { total: 0, full: 0, oneBye: 0 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(2);
      //   expect(totalBrkts.full).toBe(6);
      //   expect(totalBrkts.oneBye).toBe(-4);
      // })
      // it('should return 0 brackets when no player entries', () => {
      //   const testBracketList = new BracketList('test', 2, 3);
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const playerData: playerBrktEntry[] = [];
      //   const totalBrkts: totalBrktsType = { total: 3, full: 2, oneBye: 1 };
      //   testBracketList.calculateNumBrackets(playerData, totalBrkts);
      //   expect(totalBrkts.total).toBe(0);
      //   expect(totalBrkts.full).toBe(0);
      //   expect(totalBrkts.oneBye).toBe(0);
      // })
    })

    describe('rePopulateBrkts - populateBrktCounts', () => { 

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
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const testData = [
      //     { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
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
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      //   const testData = [
      //     { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
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
      //   // num brackets name = id + "_name" = 'test_name'
      //   // time stamp name = id + "_timeStamp" = 'test_timeStamp'
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
      //     { player_id: 'Al', test_name: 12, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 12, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 12, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 12, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 12, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 12, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 12, test_timeStamp: 800 },        
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
  
  })

  describe('Mergeing functions', () => { 

    describe('findMergeStartInfo', () => {

      // beforeAll(() => {
      //   populateBrackets();
      // })

      // it('should return the correct merge start info', () => {      
      //   const result = mockBracketList.findMergeStartInfo();      
      //   expect(result).toEqual({ brktIndex: 8, playerIndex: 1 });  
      // })
      // it('should return the correct merge start info - full brackets', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 8, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 8, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 8, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 8, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },        
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
      //   const result = testBracketList.findMergeStartInfo();
      //   expect(result).toEqual({ brktIndex: 0, playerIndex: 0 });  
      // })
      // it('should return the correct merge start info - last 4 not full', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 8, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 8, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 8, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 8, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 8, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 8, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },        
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
      //   const result = testBracketList.findMergeStartInfo();
      //   expect(result).toEqual({ brktIndex: 4, playerIndex: 7 });
      // })
      // it('should return the error merge start info when no brackets', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const result = testBracketList.findMergeStartInfo();
      //   expect(result).toEqual({ brktIndex: -1, playerIndex: -1 });
      // })
    })

    describe('mergePlayer', () => {

      // const testBracketList = new BracketList("test", 2, 3);

      // beforeEach(() => {
      //   testBracketList.clear();
      //   for (let i = 0; i <= 9; i++) {
      //     const brkt = testBracketList.addBrkt();
      //     brkt.players.push('Al');
      //     if (i <= 7) {
      //       brkt.players.push('Bob');
      //       brkt.players.push('Hal');
      //       brkt.players.push('Ian');
      //     }
      //     if (i <= 6) {         
      //       brkt.players.push('Don');
      //     }
      //     if (i <= 5) {
      //       brkt.players.push('Chad');
      //       brkt.players.push('Ed');
      //       brkt.players.push('Greg');
      //     }
      //   }
      // })

      // it('added 5, should merge 2 player entries into 2nd position, and return 3 remaining to be merged - 9 players', () => {      
      //   const startBrktIndex = 8;
      //   const playerIndex = 1;
      //   let toMerge = Array(5).fill('Fred');
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);      
      //   expect(result).toHaveLength(3)
      //   expect(result[0]).toBe('Fred');
      //   expect(result[1]).toBe('Fred');
      //   expect(result[2]).toBe('Fred');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Fred');
      // })
      // it('added 4, should merge 2 player entries into 2nd position, and return 2 remaining to be merged - 9 players', () => {
      //   const startBrktIndex = 8;
      //   const playerIndex = 1;
      //   let toMerge = Array(4).fill('Fred');
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);      
      //   expect(result).toHaveLength(2)
      //   expect(result[0]).toBe('Fred');
      //   expect(result[1]).toBe('Fred');      
      //   expect(testBracketList.brackets[8].players[1]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Fred');
      // })
      // it('added 1 player, should merge 1 player into 2nd position, and return 0 remaining to be merged - 9 players', () => {
      //   const startBrktIndex = 8;
      //   const playerIndex = 1;
      //   let toMerge = Array(1).fill('Fred');
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when toMereg is null', () => {
      //   const startBrktIndex = 8;
      //   const playerIndex = 1;
      //   const result = testBracketList.mergePlayers(null as any, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when toMereg is empty', () => {
      //   const startBrktIndex = 8;
      //   const playerIndex = 1;
      //   const result = testBracketList.mergePlayers([], startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when startBrktIndex is < 0', () => {
      //   let toMerge = Array(5).fill('Fred');
      //   const startBrktIndex = -1;
      //   const playerIndex = 1;
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when startBrktIndex is >= brackets.length', () => {
      //   let toMerge = Array(5).fill('Fred');
      //   const startBrktIndex = testBracketList.brackets.length;
      //   const playerIndex = 1;
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when playerIndex is < 0', () => {
      //   let toMerge = Array(5).fill('Fred');
      //   const startBrktIndex = 8;
      //   const playerIndex = -1;
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
      // it('should not merge when playerIndex is >= playersPerBrkt', () => {
      //   let toMerge = Array(5).fill('Fred');
      //   const startBrktIndex = testBracketList.brackets.length;
      //   const playerIndex = testBracketList.playersPerBrkt;
      //   const result = testBracketList.mergePlayers(toMerge, startBrktIndex, playerIndex);
      //   expect(result).toHaveLength(0)
      //   expect(testBracketList.brackets[8].players[1]).toBeUndefined;
      //   expect(testBracketList.brackets[9].players[1]).toBeUndefined;
      // })
    })  

    describe('rePopulateBrkts - Merging', () => { 

      // it('should merge a player instead of creating a new bracket - 9 players', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
  
      //   expect(testBracketList.brackets.length).toBe(10);
      //   expect(testBracketList.brackets[0].players).toHaveLength(8);
      //   expect(testBracketList.brackets[0].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[0].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[0].players[2]).toBe('Fred');
      //   expect(testBracketList.brackets[0].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[0].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[0].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[0].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[0].players[7]).toBe('Greg');
    
      //   expect(testBracketList.brackets[1].players).toHaveLength(8);
      //   expect(testBracketList.brackets[1].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[1].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[1].players[2]).toBe('Fred');
      //   expect(testBracketList.brackets[1].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[1].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[1].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[1].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[1].players[7]).toBe('Greg');
        
      //   expect(testBracketList.brackets[2].players).toHaveLength(8);
      //   expect(testBracketList.brackets[2].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[2].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[2].players[2]).toBe('Fred');
      //   expect(testBracketList.brackets[2].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[2].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[2].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[2].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[2].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[3].players).toHaveLength(8);
      //   expect(testBracketList.brackets[3].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[3].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[3].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[3].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[3].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[3].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[3].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[3].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[4].players).toHaveLength(8);
      //   expect(testBracketList.brackets[4].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[4].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[4].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[4].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[4].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[4].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[4].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[4].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[5].players).toHaveLength(8);
      //   expect(testBracketList.brackets[5].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[5].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[5].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[5].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[5].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[5].players[5]).toBe('Chad');
      //   expect(testBracketList.brackets[5].players[6]).toBe('Ed');
      //   expect(testBracketList.brackets[5].players[7]).toBe('Greg');
        
      //   expect(testBracketList.brackets[6].players).toHaveLength(5);
      //   expect(testBracketList.brackets[6].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[6].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[6].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[6].players[3]).toBe('Ian');
      //   expect(testBracketList.brackets[6].players[4]).toBe('Don');
        
      //   expect(testBracketList.brackets[7].players).toHaveLength(4);
      //   expect(testBracketList.brackets[7].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[7].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[7].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[7].players[3]).toBe('Ian');
        
      //   expect(testBracketList.brackets[8].players).toHaveLength(4);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Fred');
      //   expect(testBracketList.brackets[8].players[2]).toBe('Hal');
      //   expect(testBracketList.brackets[8].players[3]).toBe('Ian');
  
      //   expect(testBracketList.brackets[9].players).toHaveLength(3);
      //   expect(testBracketList.brackets[9].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[2]).toBe('Hal');
      // })
      // it('should merge a player instead of creating a new bracket - 10 players', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
  
      //   expect(testBracketList.brackets.length).toBe(10);
      //   expect(testBracketList.brackets[0].players).toHaveLength(8);
      //   expect(testBracketList.brackets[0].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[0].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[0].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[0].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[0].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[0].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[0].players[6]).toBe('Fred');
      //   expect(testBracketList.brackets[0].players[7]).toBe('Ed');
    
      //   expect(testBracketList.brackets[1].players).toHaveLength(8);
      //   expect(testBracketList.brackets[1].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[1].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[1].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[1].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[1].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[1].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[1].players[6]).toBe('Fred');
      //   expect(testBracketList.brackets[1].players[7]).toBe('Ed');
        
      //   expect(testBracketList.brackets[2].players).toHaveLength(8);
      //   expect(testBracketList.brackets[2].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[2].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[2].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[2].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[2].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[2].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[2].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[2].players[7]).toBe('Ed');
  
      //   expect(testBracketList.brackets[3].players).toHaveLength(8);
      //   expect(testBracketList.brackets[3].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[3].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[3].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[3].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[3].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[3].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[3].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[3].players[7]).toBe('Ed');
  
      //   expect(testBracketList.brackets[4].players).toHaveLength(8);
      //   expect(testBracketList.brackets[4].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[4].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[4].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[4].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[4].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[4].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[4].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[4].players[7]).toBe('Ed');
  
      //   expect(testBracketList.brackets[5].players).toHaveLength(8);
      //   expect(testBracketList.brackets[5].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[5].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[5].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[5].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[5].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[5].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[5].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[5].players[7]).toBe('Ed');
        
      //   expect(testBracketList.brackets[6].players).toHaveLength(7);
      //   expect(testBracketList.brackets[6].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[6].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[6].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[6].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[6].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[6].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[6].players[6]).toBe('Chad');      
        
      //   expect(testBracketList.brackets[7].players).toHaveLength(7);
      //   expect(testBracketList.brackets[7].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[7].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[7].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[7].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[7].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[7].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[7].players[6]).toBe('Chad');
        
      //   expect(testBracketList.brackets[8].players).toHaveLength(6);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[8].players[2]).toBe('Greg');
      //   expect(testBracketList.brackets[8].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[8].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[8].players[5]).toBe('Fred');
  
      //   expect(testBracketList.brackets[9].players).toHaveLength(6);
      //   expect(testBracketList.brackets[9].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[9].players[2]).toBe('Greg');
      //   expect(testBracketList.brackets[9].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[9].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[9].players[5]).toBe('Fred');
      // })
      // it('should merge a player instead of creating a new bracket - 10 players 10 brackets each', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 10, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
  
      //   expect(testBracketList.brackets.length).toBe(13);
      //   expect(testBracketList.brackets[0].players).toHaveLength(8);
      //   expect(testBracketList.brackets[0].players[0]).toBe('Hal');
      //   expect(testBracketList.brackets[0].players[1]).toBe('Ian');
      //   expect(testBracketList.brackets[0].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[0].players[3]).toBe('Chad');
      //   expect(testBracketList.brackets[0].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[0].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[0].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[0].players[7]).toBe('Greg');
    
      //   expect(testBracketList.brackets[1].players).toHaveLength(8);
      //   expect(testBracketList.brackets[1].players[0]).toBe('Hal');
      //   expect(testBracketList.brackets[1].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[1].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[1].players[3]).toBe('Chad');
      //   expect(testBracketList.brackets[1].players[4]).toBe('Don');
      //   expect(testBracketList.brackets[1].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[1].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[1].players[7]).toBe('Greg');
        
      //   expect(testBracketList.brackets[2].players).toHaveLength(8);
      //   expect(testBracketList.brackets[2].players[0]).toBe('Hal');
      //   expect(testBracketList.brackets[2].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[2].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[2].players[3]).toBe('Chad');
      //   expect(testBracketList.brackets[2].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[2].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[2].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[2].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[3].players).toHaveLength(8);
      //   expect(testBracketList.brackets[3].players[0]).toBe('Hal');
      //   expect(testBracketList.brackets[3].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[3].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[3].players[3]).toBe('Chad');
      //   expect(testBracketList.brackets[3].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[3].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[3].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[3].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[4].players).toHaveLength(8);
      //   expect(testBracketList.brackets[4].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[4].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[4].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[4].players[3]).toBe('Chad');
      //   expect(testBracketList.brackets[4].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[4].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[4].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[4].players[7]).toBe('Greg');
  
      //   expect(testBracketList.brackets[5].players).toHaveLength(8);
      //   expect(testBracketList.brackets[5].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[5].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[5].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[5].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[5].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[5].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[5].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[5].players[7]).toBe('Greg');
        
      //   expect(testBracketList.brackets[6].players).toHaveLength(8);
      //   expect(testBracketList.brackets[6].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[6].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[6].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[6].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[6].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[6].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[6].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[6].players[7]).toBe('Hal');
        
      //   expect(testBracketList.brackets[7].players).toHaveLength(8);
      //   expect(testBracketList.brackets[7].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[7].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[7].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[7].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[7].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[7].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[7].players[6]).toBe('Jim');
      //   expect(testBracketList.brackets[7].players[7]).toBe('Hal');
        
      //   expect(testBracketList.brackets[8].players).toHaveLength(8);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[2]).toBe('Chad');
      //   expect(testBracketList.brackets[8].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[8].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[8].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[8].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[8].players[7]).toBe('Hal');
  
      //   expect(testBracketList.brackets[9].players).toHaveLength(8);
      //   expect(testBracketList.brackets[9].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[9].players[2]).toBe('Chad');
      //   expect(testBracketList.brackets[9].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[9].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[9].players[5]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[9].players[7]).toBe('Hal');
  
      //   expect(testBracketList.brackets[10].players).toHaveLength(8);
      //   expect(testBracketList.brackets[10].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[10].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[10].players[2]).toBe('Chad');
      //   expect(testBracketList.brackets[10].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[10].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[10].players[5]).toBe('Jim');
      //   expect(testBracketList.brackets[10].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[10].players[7]).toBe('Hal');
  
      //   expect(testBracketList.brackets[11].players).toHaveLength(8);
      //   expect(testBracketList.brackets[11].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[11].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[11].players[2]).toBe('Chad');
      //   expect(testBracketList.brackets[11].players[3]).toBe('Don');
      //   expect(testBracketList.brackets[11].players[4]).toBe('Ed');
      //   expect(testBracketList.brackets[11].players[5]).toBe('Jim');
      //   expect(testBracketList.brackets[11].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[11].players[7]).toBe('Hal');
  
      //   expect(testBracketList.brackets[12].players).toHaveLength(4);
      //   expect(testBracketList.brackets[12].players[0]).toBe('Ian');
      //   expect(testBracketList.brackets[12].players[1]).toBe('Bob');
      //   expect(testBracketList.brackets[12].players[2]).toBe('Chad');
      //   expect(testBracketList.brackets[12].players[3]).toBe('Don');      
      // })
      // it('should merge a player instead of creating a new bracket - 11 players filled all', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
  
      //   expect(testBracketList.brackets.length).toBe(10);
      //   expect(testBracketList.brackets[0].players).toHaveLength(8);
      //   expect(testBracketList.brackets[0].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[0].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[0].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[0].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[0].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[0].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[0].players[6]).toBe('Ken');
      //   expect(testBracketList.brackets[0].players[7]).toBe('Fred');
    
      //   expect(testBracketList.brackets[1].players).toHaveLength(8);
      //   expect(testBracketList.brackets[1].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[1].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[1].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[1].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[1].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[1].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[1].players[6]).toBe('Ken');
      //   expect(testBracketList.brackets[1].players[7]).toBe('Fred');
        
      //   expect(testBracketList.brackets[2].players).toHaveLength(8);
      //   expect(testBracketList.brackets[2].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[2].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[2].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[2].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[2].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[2].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[2].players[6]).toBe('Ken');
      //   expect(testBracketList.brackets[2].players[7]).toBe('Fred');
  
      //   expect(testBracketList.brackets[3].players).toHaveLength(8);
      //   expect(testBracketList.brackets[3].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[3].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[3].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[3].players[3]).toBe('Greg');
      //   expect(testBracketList.brackets[3].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[3].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[3].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[3].players[7]).toBe('Fred');
  
      //   expect(testBracketList.brackets[4].players).toHaveLength(8);
      //   expect(testBracketList.brackets[4].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[4].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[4].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[4].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[4].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[4].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[4].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[4].players[7]).toBe('Ed');
  
      //   expect(testBracketList.brackets[5].players).toHaveLength(8);
      //   expect(testBracketList.brackets[5].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[5].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[5].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[5].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[5].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[5].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[5].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[5].players[7]).toBe('Ed');
        
      //   expect(testBracketList.brackets[6].players).toHaveLength(8);
      //   expect(testBracketList.brackets[6].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[6].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[6].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[6].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[6].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[6].players[5]).toBe('Don');
      //   expect(testBracketList.brackets[6].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[6].players[7]).toBe('Ed');
        
      //   expect(testBracketList.brackets[7].players).toHaveLength(8);
      //   expect(testBracketList.brackets[7].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[7].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[7].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[7].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[7].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[7].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[7].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[7].players[7]).toBe('Ed');
        
      //   expect(testBracketList.brackets[8].players).toHaveLength(8);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[8].players[2]).toBe('Greg');
      //   expect(testBracketList.brackets[8].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[8].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[8].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[8].players[6]).toBe('Chad');
      //   expect(testBracketList.brackets[8].players[7]).toBe('Ed');
  
      //   expect(testBracketList.brackets[9].players).toHaveLength(8);
      //   expect(testBracketList.brackets[9].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[9].players[2]).toBe('Greg');
      //   expect(testBracketList.brackets[9].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[9].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[9].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[9].players[6]).toBe('Fred');
      //   expect(testBracketList.brackets[9].players[7]).toBe('Ed');
      // })
      // it('should merge a player and create a new bracket when needed - 11 players two over filled', () => { 
      //   const testBracketList = new BracketList("test", 2, 3);
      //   const testData = [
      //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
      //     { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
      //     { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
      //     { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
      //     { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
      //     { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
      //     { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      //     { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
      //     { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
      //     { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      //     { player_id: 'Ken', test_name: 8, test_timeStamp: 1100 },
      //   ];
      //   testBracketList.rePopulateBrkts(testData);
  
      //   expect(testBracketList.brackets.length).toBe(11);
      //   expect(testBracketList.brackets[0].players).toHaveLength(8);
      //   expect(testBracketList.brackets[0].players[0]).toBe('Fred');
      //   expect(testBracketList.brackets[0].players[1]).toBe('Al');
      //   expect(testBracketList.brackets[0].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[0].players[3]).toBe('Ed');
      //   expect(testBracketList.brackets[0].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[0].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[0].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[0].players[7]).toBe('Don');
    
      //   expect(testBracketList.brackets[1].players).toHaveLength(8);
      //   expect(testBracketList.brackets[1].players[0]).toBe('Fred');
      //   expect(testBracketList.brackets[1].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[1].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[1].players[3]).toBe('Ed');
      //   expect(testBracketList.brackets[1].players[4]).toBe('Hal');
      //   expect(testBracketList.brackets[1].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[1].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[1].players[7]).toBe('Chad');
        
      //   expect(testBracketList.brackets[2].players).toHaveLength(8);
      //   expect(testBracketList.brackets[2].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[2].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[2].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[2].players[3]).toBe('Ed');
      //   expect(testBracketList.brackets[2].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[2].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[2].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[2].players[7]).toBe('Chad');
  
      //   expect(testBracketList.brackets[3].players).toHaveLength(8);
      //   expect(testBracketList.brackets[3].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[3].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[3].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[3].players[3]).toBe('Ed');
      //   expect(testBracketList.brackets[3].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[3].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[3].players[6]).toBe('Greg');
      //   expect(testBracketList.brackets[3].players[7]).toBe('Chad');
  
      //   expect(testBracketList.brackets[4].players).toHaveLength(8);
      //   expect(testBracketList.brackets[4].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[4].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[4].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[4].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[4].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[4].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[4].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[4].players[7]).toBe('Chad');
  
      //   expect(testBracketList.brackets[5].players).toHaveLength(8);
      //   expect(testBracketList.brackets[5].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[5].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[5].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[5].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[5].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[5].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[5].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[5].players[7]).toBe('Chad');
        
      //   expect(testBracketList.brackets[6].players).toHaveLength(8);
      //   expect(testBracketList.brackets[6].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[6].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[6].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[6].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[6].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[6].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[6].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[6].players[7]).toBe('Chad');
        
      //   expect(testBracketList.brackets[7].players).toHaveLength(8);
      //   expect(testBracketList.brackets[7].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[7].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[7].players[2]).toBe('Bob');
      //   expect(testBracketList.brackets[7].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[7].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[7].players[5]).toBe('Ken');
      //   expect(testBracketList.brackets[7].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[7].players[7]).toBe('Fred');
        
      //   expect(testBracketList.brackets[8].players).toHaveLength(8);
      //   expect(testBracketList.brackets[8].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[8].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[8].players[2]).toBe('Ed');
      //   expect(testBracketList.brackets[8].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[8].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[8].players[5]).toBe('Greg');
      //   expect(testBracketList.brackets[8].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[8].players[7]).toBe('Fred');
  
      //   expect(testBracketList.brackets[9].players).toHaveLength(8);
      //   expect(testBracketList.brackets[9].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[9].players[1]).toBe('Jim');
      //   expect(testBracketList.brackets[9].players[2]).toBe('Ed');
      //   expect(testBracketList.brackets[9].players[3]).toBe('Hal');
      //   expect(testBracketList.brackets[9].players[4]).toBe('Ian');
      //   expect(testBracketList.brackets[9].players[5]).toBe('Greg');
      //   expect(testBracketList.brackets[9].players[6]).toBe('Don');
      //   expect(testBracketList.brackets[9].players[7]).toBe('Fred');
  
      //   expect(testBracketList.brackets[10].players).toHaveLength(2);
      //   expect(testBracketList.brackets[10].players[0]).toBe('Al');
      //   expect(testBracketList.brackets[10].players[1]).toBe('Jim');
      // })
    })  
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
    })
  })

  describe('emptySpots', () => {
   
    it('should return correct number of empty spots for not full brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(6);
    });
    it('should retun 0 when all brackets are full', () => { 
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      ];

      testBracketList.calcTotalBrkts(testData);
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(0);
    })
    it('edge case high, Al and Bob - 50B, should return correct # of empty spots', () => { 
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 50, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(6);
    })
    it('edge case - 10Px7B, no filled brackets, should return correct # of empty spots', () => { 
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(10);
    })
    it('edge case low, 10Px4B, should return correct # of empty spots', () => { 
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 4, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 4, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(0);
    })
    it('edge case low, 10Px2B, should return correct # of empty spots', () => { 
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(4);
    })
    it('should return 0 when bracket is full', () => {
      const testBracketList = new BracketList("test", 2, 3);
      const result = testBracketList.emptySpotsCalculated();
      expect(result).toBe(-1); // no brackets yet
    })
  })

  describe('calcTotalBrkts', () => {

    it('should return coreect # of full and one bye brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.fullCount).toBe(12);
      expect(testBracketList.oneByeCount).toBe(6);
    });
    it('should return coreect # of full and one bye brackets - 10 full brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.fullCount).toBe(10);
      expect(testBracketList.oneByeCount).toBe(0);
    });
    it('should return coreect # of full and one bye brackets 1Px10B, 17Px4B', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 4, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 4, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 4, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 4, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 4, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 4, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 4, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 4, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.fullCount).toBe(8);
      expect(testBracketList.oneByeCount).toBe(2);
    });
    it('should return coreect # of full and one bye brackets 10Px10B', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 5, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 5, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 5, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.fullCount).toBe(9);
      expect(testBracketList.oneByeCount).toBe(4);
    });
    it('should return coreect # of full and one bye brackets 8Px10B, 4Px5B', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);            
      expect(testBracketList.fullCount).toBe(9);
      expect(testBracketList.oneByeCount).toBe(4);
    });  
    it('edge case high, Al 50 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(14);
      expect(testBracketList.oneByeCount).toBe(5);
    })
    it('edge case high, Al and Bob 50 brackets', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 50, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(15);
      expect(testBracketList.oneByeCount).toBe(6);
    })
    it('edge case high, 10 Players x 4 brkts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 4, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 4, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(5);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('edge case low, 10 Players x 2 brkts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(2);
      expect(testBracketList.oneByeCount).toBe(1);
    })
    it('edge case - no full brackets, 7 Players x 10 brkts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(10);
    })
    it('edge case low - no full brackets, 7 players with random brackets, 5 is min', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(5);
    })
    it('should clear brackets and return when input array is empty', () => {
      const testBracketList = new BracketList('test', 2, 3);

      testBracketList.calcTotalBrkts([]);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    });
    it('should exit when playerId is not found', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: '', test_name: 2, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('should exit when numBrkts is not and integer', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 1.5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('should exit when numBrkts is too high', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 1234, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
    it('should exit when createdAt is not found', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 2 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(0);
      expect(testBracketList.oneByeCount).toBe(0);
    })
  })

  describe('calcTotalBrkts - remove players with no bracket entries', () => { 

    it('should ignore brackets with no value', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 8, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_timeStamp: 300 },
        { player_id: 'Don', test_name: 8, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 8, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 8, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 8, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },          
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(8);
      expect(testBracketList.oneByeCount).toBe(0);
    })        
    it('should ignore brackets with negative values', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 8, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad',test_name: -1, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 8, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 8, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 8, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 8, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },          
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(8);
      expect(testBracketList.oneByeCount).toBe(0);
    })        
    it('should ignore brackets with 0 values', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 8, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 0, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 8, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 8, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 8, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 8, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },          
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.fullCount).toBe(8);
      expect(testBracketList.oneByeCount).toBe(0);
    })        
  })

  describe('rePopulateBrkts - populateBrktCounts', () => { 

    it('should have correct full (12:0, 6:1) and one bye (18:0) bracket counts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(18);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(18);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 12) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    });
    it('should have correct full (10:0, 0:1) and one bye (10:0) bracket counts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 11) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    });
    it('should have correct full (8:0, 2:1) and one bye (10:0) bracket counts', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 4, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 4, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 4, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 4, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 4, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 4, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 4, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 4, test_timeStamp: 1800 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 8) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    });
    it('should have correct full (9:0, 4:1) and one bye (13:0) bracket counts (10 players, 10 brackets each)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 10, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(13);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(13);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 9) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    });
    it('should have correct full (9:0, 4:1) and one bye (13:0) bracket counts (14 Players, 8x10 + 4x5)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 5, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 5, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 5, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
      ];
  
      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(13);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(13);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 9) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    });
    it('edge case high, adjust Al to 19 brackets, should have correct full (14:0. 5:1) and one bye (19:0)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(19);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(19);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 14) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }

    })
    it('edge case high, adjust Al and Bob to 21 brackets, should have correct full (15:0. 6:1) and one bye (21:0)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 50, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 50, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 5, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 12, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 6, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 8, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 8, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 10, test_timeStamp: 1000 },
        { player_id: 'Ken', test_name: 6, test_timeStamp: 1100 },
        { player_id: 'Lou', test_name: 5, test_timeStamp: 1200 },
        { player_id: 'Mike', test_name: 8, test_timeStamp: 1300 },
        { player_id: 'Nate', test_name: 10, test_timeStamp: 1400 },
        { player_id: 'Otto', test_name: 7, test_timeStamp: 1500 },
        { player_id: 'Paul', test_name: 4, test_timeStamp: 1600 },
        { player_id: 'Quin', test_name: 5, test_timeStamp: 1700 },
        { player_id: 'Rob', test_name: 10, test_timeStamp: 1800 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(21);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(21);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 15) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        }
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('edge case high, 10 Players x 4 brkts, should have correct full (5:0, 5:8) and one bye (5:0, 5:7)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 4, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 4, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 4, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 4, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 4, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 4, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 4, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 4, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 4, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 4, test_timeStamp: 1000 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);

      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 5) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(0);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }
      }
    })
    it('edge case low, 10 Players x 2 brkts, should have correct full (2:1, 1:2. 7:8) and one bye (2:0, 1:1, 7:7)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 2, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);
      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 2) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else if (i < 3) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(2);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(1);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }
      }
    })
    it('edge case high, 10 Players x 7 brkts, should have correct full (10:1) and one bye (10:0)', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
      ];
      testBracketList.calcTotalBrkts(playerData);
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);

      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
        expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
      }
    })
    it('edge case low - no full brackets, 7 players with random brackets, 5 is min', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const playerData = [
        { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 8, test_timeStamp: 200 },
        { player_id: 'Chad', test_name: 6, test_timeStamp: 300 },
        { player_id: 'Don', test_name: 7, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 6, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 5, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 6, test_timeStamp: 700 },
      ];      
      testBracketList.calcTotalBrkts(playerData);      
      expect(testBracketList.brktCounts.forFullValues.length).toBe(10);
      expect(testBracketList.brktCounts.forOneByeValues.length).toBe(10);

      for (let i = 0; i < testBracketList.brktCounts.forFullValues.length; i++) {
        if (i < 5) {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(1);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(0);
        } else {
          expect(testBracketList.brktCounts.forFullValues[i]).toBe(8);
          expect(testBracketList.brktCounts.forOneByeValues[i]).toBe(7);
        }
      }
    })    
    it('should set no brktCounts when input array is empty', () => {
      const testBracketList = new BracketList('test', 2, 3);

      testBracketList.calcTotalBrkts([]);
      expect(testBracketList.brktCounts.forFullValues).toHaveLength(0);
      expect(testBracketList.brktCounts.forOneByeValues).toHaveLength(0);      
    });
    it('should set no brktCounts when brktEntries are not valid', () => {
      const testBracketList = new BracketList('test', 2, 3);
      // num brackets name = id + "_name" = 'test_name'
      // time stamp name = id + "_timeStamp" = 'test_timeStamp'
      const testData = [
        { player_id: 'Al', test_name: 2, test_timeStamp: 100 },
        { player_id: 'Bob', test_name: 2, test_timeStamp: 200 },
        { player_id: '', test_name: 2, test_timeStamp: 300 }, // invalid
        { player_id: 'Don', test_name: 2, test_timeStamp: 400 },
        { player_id: 'Ed', test_name: 2, test_timeStamp: 500 },
        { player_id: 'Fred', test_name: 2, test_timeStamp: 600 },
        { player_id: 'Greg', test_name: 2, test_timeStamp: 700 },
        { player_id: 'Hal', test_name: 2, test_timeStamp: 800 },
        { player_id: 'Ian', test_name: 2, test_timeStamp: 900 },
        { player_id: 'Jim', test_name: 2, test_timeStamp: 1000 },
      ];

      testBracketList.calcTotalBrkts(testData);
      expect(testBracketList.brktCounts.forFullValues).toHaveLength(0);
      expect(testBracketList.brktCounts.forOneByeValues).toHaveLength(0);      
    })
  })

  describe('brktsAvaliableForPlayer', () => { 

    // beforeAll(() => {
    //   populateBrackets();
    // })

    // it('should return 2 brackets (#9 & #10) for Bob', () => {
    //   const result = mockBracketList.brktsAvaliableForPlayer('Bob');
    //   expect(result.length).toBe(2);
    // })
    // it('should return 0 brackets for Al', () => { 
    //   const result = mockBracketList.brktsAvaliableForPlayer('Al');
    //   expect(result.length).toBe(0);
    // })
    // it('should return 4 brackets for Chad', () => {
    //   const result = mockBracketList.brktsAvaliableForPlayer('Chad');
    //   expect(result.length).toBe(4);
    // })
    // it('should return 0 brackets for Bob when Brakcts array is empty', () => { 
    //   const emptyBracketList = new BracketList("brk_test1", 2, 3);
    //   const result = emptyBracketList.brktsAvaliableForPlayer('Bob');
    //   expect(result.length).toBe(0);
    // })
    // it('should return all brackets for player-abc when player is not found in brackets', () => {       
    //   const result = mockBracketList.brktsAvaliableForPlayer('player-abc');
    //   expect(result.length).toBe(mockBracketList.brackets.length);
    // })
  })

  // describe('brktNumColName', () => {     

  //   beforeAll(() => {
  //     populateBrackets();
  //   })

  //   it('should return correct bracket number column name', () => {
  //     const result = mockBracketList.brktNumColName(1);
  //     expect(result).toBe('B1');
  //     const result2 = mockBracketList.brktNumColName(2);
  //     expect(result2).toBe('B2');
  //     const result13 = mockBracketList.brktNumColName(13);
  //     expect(result13).toBe('');
  //     const blankResult = mockBracketList.brktNumColName(null as any);
  //     expect(blankResult).toBe('');
  //     const result0 = mockBracketList.brktNumColName(0);
  //     expect(result0).toBe('');
  //   })
  // })

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

  describe('putPlayerInBrkt', () => { 

    // it('should put players in bracket', () => {
    //   const mockBracketList = new BracketList("brk_test1", 2, 3);
    //   let brkt1 = mockBracketList.addBrkt()
    //   mockBracketList.putPlayerInBrkt('Al');
    //   mockBracketList.putPlayerInBrkt('Bob');

    //   expect(mockBracketList.brackets.length).toBe(1);
    //   expect(mockBracketList.brackets[0].players.length).toBe(2);
    //   expect(mockBracketList.brackets[0].players[0]).toBe('Al');
    //   expect(mockBracketList.brackets[0].players[1]).toBe('Bob');
    //   expect(brkt1.players.length).toBe(2);
    //   expect(brkt1.players[0]).toBe('Al');
    //   expect(brkt1.players[1]).toBe('Bob');
    // })
    // it('should put players in bracket without duplicating player ids in bracket', () => {
    //   const mockBracketList = new BracketList("brk_test1", 2, 3);
    //   mockBracketList.addBrkt()
    //   mockBracketList.putPlayerInBrkt('Al');
    //   mockBracketList.putPlayerInBrkt('Bob');
    //   let brkt2 = mockBracketList.putPlayerInBrkt('Al');
    //   expect(brkt2).toBe(null);
    //   mockBracketList.addBrkt();
    //   brkt2 = mockBracketList.putPlayerInBrkt('Al');
    //   expect(brkt2).not.toBe(null);

    //   expect(mockBracketList.brackets.length).toBe(2);
    //   expect(mockBracketList.brackets[0].players.length).toBe(2);
    //   expect(mockBracketList.brackets[0].players[0]).toBe('Al');
    //   expect(mockBracketList.brackets[0].players[1]).toBe('Bob');

    //   expect(mockBracketList.brackets[1].players.length).toBe(1);
    //   expect(mockBracketList.brackets[1].players[0]).toBe('Al');
    // })
    // it('should return null if brackets are full', () => {
    //   const mockBracketList = new BracketList("brk_test1", 2, 3);
    //   mockBracketList.addBrkt()
    //   mockBracketList.putPlayerInBrkt('Al');
    //   mockBracketList.putPlayerInBrkt('Bob');
    //   mockBracketList.putPlayerInBrkt('Chad');
    //   mockBracketList.putPlayerInBrkt('Don');
    //   mockBracketList.putPlayerInBrkt('Ed');
    //   mockBracketList.putPlayerInBrkt('Fred');
    //   mockBracketList.putPlayerInBrkt('Greg');
    //   mockBracketList.putPlayerInBrkt('Hal');
    //   mockBracketList.addBrkt()
    //   mockBracketList.putPlayerInBrkt('Al');
    //   mockBracketList.putPlayerInBrkt('Bob');
    //   mockBracketList.putPlayerInBrkt('Chad');
    //   mockBracketList.putPlayerInBrkt('Don');
    //   mockBracketList.putPlayerInBrkt('Ed');
    //   mockBracketList.putPlayerInBrkt('Fred');
    //   mockBracketList.putPlayerInBrkt('Greg');
    //   mockBracketList.putPlayerInBrkt('Hal');
      
    //   let brkt3 = mockBracketList.putPlayerInBrkt('Ian');
    //   expect(brkt3).toBe(null);
    // })
    // it('should return null if no brakcts', () => {
    //   const mockBracketList = new BracketList("brk_test1", 2, 3);
    //   let brkt1 = mockBracketList.putPlayerInBrkt('Al');
    //   expect(brkt1).toBe(null);
    // })
  })

  describe('validBrackets', () => { 

    // beforeAll(() => {
    //   mockBracketList.rePopulateBrkts(playerData);
    // })

    // it('should return valid brackets - 8 players 10 brackets each', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   const testData = [
    //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
    //   ];
    //   testBracketList.rePopulateBrkts(testData);
    //   const result = testBracketList.validBrackets();
    //   expect(result).toBe(true);
    //   expect(testBracketList.errorMessage).toBe('');
    // })
    // it('should return false and set error to "No brackets" when no brackers', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   const result = testBracketList.validBrackets();
    //   expect(result).toBe(false);
    //   expect(testBracketList.errorMessage).toBe('No brackets');
    // })
    // it('should return false and set error to "No bracket counts" when first bracket is missing a count', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   const testData = [
    //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
    //   ];
    //   testBracketList.rePopulateBrkts(testData);
    //   testBracketList.brktCounts.forFullValues.length = 0;
    //   const result = testBracketList.validBrackets();      
    //   expect(result).toBe(false);
    //   expect(testBracketList.errorMessage).toBe('Invalid bracket counts');      
    // })
    // it('should return false and set error to "Bracket 10 count is missing" when first bracket is missing a count', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   const testData = [
    //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },
    //     { player_id: 'Hal', test_name: 10, test_timeStamp: 800 },
    //   ];
    //   testBracketList.rePopulateBrkts(testData);
    //   testBracketList.brktCounts.forFullValues[9] = null;
    //   const result = testBracketList.validBrackets();      
    //   expect(result).toBe(false);
    //   expect(testBracketList.errorMessage).toBe('Bracket 10 count is missing');      
    // })
    // it('should return false and "Bracket 10 has more than 1 empty spot" when bracket 10 has more than 1 empty spot', () => { 
    //   const result = mockBracketList.validBrackets();      
    //   expect(result).toBe(false);
    //   expect(mockBracketList.errorMessage).toBe('Bracket 10 has more than 1 empty spot');      
    // })
    // it('should return false and set error to "More than 7 brackets with one bye"', () => {
    //   const testBracketList = new BracketList("test", 2, 3);
    //   const testData = [
    //     { player_id: 'Al', test_name: 10, test_timeStamp: 100 },
    //     { player_id: 'Bob', test_name: 10, test_timeStamp: 200 },
    //     { player_id: 'Chad', test_name: 10, test_timeStamp: 300 },
    //     { player_id: 'Don', test_name: 10, test_timeStamp: 400 },
    //     { player_id: 'Ed', test_name: 10, test_timeStamp: 500 },
    //     { player_id: 'Fred', test_name: 10, test_timeStamp: 600 },
    //     { player_id: 'Greg', test_name: 10, test_timeStamp: 700 },        
    //   ];
    //   testBracketList.rePopulateBrkts(testData);      
    //   const result = testBracketList.validBrackets();      
    //   expect(result).toBe(false);
    //   expect(testBracketList.errorMessage).toBe('More than 7 brackets with one bye');      
    // })
  })

})