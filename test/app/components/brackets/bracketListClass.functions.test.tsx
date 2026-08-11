import { Bracket } from "@/components/brackets/bracketClass"
import {
  BracketList,
  initBrktCountsType,
} from "@/components/brackets/bracketListClass"
import { maxBrackets } from "@/lib/validation/constants";
import type { playerEntryRow } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { cloneDeep } from "lodash";
import { playerType } from "@/lib/types/types";
import { initPlayer } from "@/lib/db/initVals";
import { btDbUuid } from "@/lib/uuid";
import { createByePlayer } from "../../../../src/components/brackets/byePlayer";
import {
  squadId1,
  playerId8,
  mockTmntFullData,
} from "../../../mocks/tmnts/tmntFullData/mockTmntFullData";

describe('BracketList class functions', () => { 

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

      // const createNeededMapCount = (brktEntries: playerEntryRow[]): Map<string, number> => {
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
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;        
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   let iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   // this greg index alread used
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   oppoMap.delete(poc_shuffledEntriesObj[i].playerId);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   poc_shuffledEntriesObj[i].used = true;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;
        
      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this match is a prior match
      //   let iRestart = i;        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this match is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);        
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);  
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);  
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   expect(poc_shuffledEntriesObj[i].used).toBe(true);
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   iRestart = i;
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;        
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   iRestart = i;        
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);        
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PRIOR);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a prior match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Don');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Fred');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.USED);
      //   // DO NOT SET poc_shuffledEntriesObj[i].used = true
      //   // DO NOT call updateOppoMap as this is a used match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Hal');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Ed');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
      //   poc_shuffledEntriesObj[i].used = true;
      //   testBracketList.updateOppoMap(poc_shuffledEntriesObj[i].playerId, oppoMap);
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Al');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Chad');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.SELF);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a self match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Bob');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.PAST);
      //   poc_shuffledEntriesObj[i].used = true;
      //   // DO NOT call updateOppoMap as this is a past match
      //   i++;

      //   expect(poc_shuffledEntriesObj[i].playerId).toBe('Greg');
      //   result = testBracketList.matchTest(poc_shuffledEntriesObj[i], playerId, pastPlayersSet, oppoMap);
      //   expect(result).toBe(matchTestCodes.VALID);
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
      
      // const testBracketList = new BracketList('test', 2, 3);
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
        let brkt = new Bracket("brk_00", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Don']);
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket("brk_01", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket("brk_02", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Fred']);
        brkt.addMatch(['Bob', 'Hal']);
        brkt.addMatch(['Chad', 'Don']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket("brk_03", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket("brk_04", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket("brk_05", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Don']);
        brkt.addMatch(['Bob', 'Chad']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket("brk_06", testBracketList.playersPerMatch, testBracketList.games);
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
        let brkt = new Bracket("brk_00", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Ed']);
        brkt.addMatch(['Bob', 'Greg']);
        brkt.addMatch(['Chad', 'Hal']);
        brkt.addMatch(['Don', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket("brk_01", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Don']);
        brkt.addMatch(['Bob', 'Chad']);
        brkt.addMatch(['Ed', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket("brk_02", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        brkt.addMatch(['Don', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket("brk_03", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Hal']);
        brkt.addMatch(['Don', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket("brk_04", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Don']);
        brkt.addMatch(['Ed', 'Hal']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket("brk_05", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Don']);
        brkt.addMatch(['Chad', 'Fred']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket("brk_06", testBracketList.playersPerMatch, testBracketList.games);
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
        let brkt = new Bracket("brk_00", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Greg']);
        brkt.addMatch(['Bob', 'Ed']);
        brkt.addMatch(['Chad', 'Don']);        
        testBracketList.brackets.push(brkt);

        // bracket index 1
        brkt = new Bracket("brk_01", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Ed']);
        brkt.addMatch(['Bob', 'Don']);
        brkt.addMatch(['Chad', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 2
        brkt = new Bracket("brk_02", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Hal']);
        brkt.addMatch(['Bob', 'Fred']);
        brkt.addMatch(['Chad', 'Ed']);
        brkt.addMatch(['Don', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 3
        brkt = new Bracket("brk_03", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Bob']);
        brkt.addMatch(['Chad', 'Hal']);        
        brkt.addMatch(['Don', 'Hal']);
        testBracketList.brackets.push(brkt);

        // bracket index 4
        brkt = new Bracket("brk_04", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Chad']);
        brkt.addMatch(['Bob', 'Hal']);      
        brkt.addMatch(['Don', 'Fred']);
        brkt.addMatch(['Ed', 'Greg']);
        testBracketList.brackets.push(brkt);

        // bracket index 5
        brkt = new Bracket("brk_05", testBracketList.playersPerMatch, testBracketList.games);
        brkt.addMatch(['Al', 'Fred']);
        brkt.addMatch(['Bob', 'Greg']);
        brkt.addMatch(['Chad', 'Hal']);
        brkt.addMatch(['Don', 'Ed']);
        testBracketList.brackets.push(brkt);

        // bracket index 6
        brkt = new Bracket("brk_06", testBracketList.playersPerMatch, testBracketList.games);
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

})