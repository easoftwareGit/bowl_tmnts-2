import { brktsColNameEnd, entryFeeColName, entryNumBrktsColName, feeColNameEnd, isBrktsColumnName, isDivEntryFeeColumnName, isElimFeeColumnName, isPotFeeColumnName, playerEntryData, timeStampColName } from "@/app/dataEntry/playersForm/createColumns";
import { findNextError, getRowPlayerName, exportedForTesting, CheckType, getDivsPotsBrktsElimsCounts, getDivsPotsBrktsElimsCountErrMsg } from "@/app/dataEntry/playersForm/rowInfo";
import { BracketList } from "@/components/brackets/bracketListClass";
import { getBrktOrElimName, getDivName } from "@/lib/getName";
import { brktType, elimType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";
import { cloneDeep } from "lodash";
import { mockTmntFullData } from "../../../mocks/tmnts/tmntFulldata/mockTmntFullData";
import { defaultBrktPlayers } from "@/lib/db/initVals";

const { validAverage, validLane, validPosition, validDivs, validPots, validBrkts, validElims } = exportedForTesting;

describe('rowInfo tests', () => { 

  const div1FeeColName = entryFeeColName(mockTmntFullData.divs[0].id);
  const div2FeeColName = entryFeeColName(mockTmntFullData.divs[1].id);
  const pot1FeeColName = entryFeeColName(mockTmntFullData.pots[0].id);
  const pot2FeeColName = entryFeeColName(mockTmntFullData.pots[1].id);
  const brkt1NumColName = entryNumBrktsColName(mockTmntFullData.brkts[0].id);    
  const brkt1FeeColName = entryFeeColName(mockTmntFullData.brkts[0].id);
  const brkt1TimeStartColName = timeStampColName(mockTmntFullData.brkts[0].id);
  const brkt2NumColName = entryNumBrktsColName(mockTmntFullData.brkts[1].id);
  const brkt2FeeColName = entryFeeColName(mockTmntFullData.brkts[1].id);
  const brkt2TimeStartColName = timeStampColName(mockTmntFullData.brkts[0].id);
  const elim1FeeColName = entryFeeColName(mockTmntFullData.elims[0].id);
  const elim2FeeColName = entryFeeColName(mockTmntFullData.elims[1].id);

  const validRow = {
    id: 'player1',
    first_name: 'John',
    last_name: 'Smith',
    average: 205,
    lane: 29,
    position: 'A',
    [div1FeeColName]: 85,
    [div2FeeColName]: 55,
    [pot1FeeColName]: 20,
    [pot2FeeColName]: 10,
    [brkt1NumColName]: 4,
    [brkt1FeeColName]: 20,
    [brkt1TimeStartColName]: new Date("2025-01-01").getTime(),
    [brkt2NumColName]: 4,
    [brkt2FeeColName]: 20,
    [brkt2TimeStartColName]: new Date("2025-01-02").getTime(),
    [elim1FeeColName]: 5,
    [elim2FeeColName]: 5,
    feeTotal: 165
  }

  const row2 = cloneDeep(validRow);
  row2.id = 'player2';
  row2.first_name = 'Jane';
  row2.last_name = 'Doe';
  row2.position = 'B';
  // use text values for testing
  row2[div1FeeColName] = '85';
  row2[div2FeeColName] = '55';
  row2[pot1FeeColName] = '20';
  row2[pot2FeeColName] = '10';
  row2[elim1FeeColName] = '5';
  row2[elim2FeeColName] = '5';

  const invalidBaseRow = {  
    ...validRow,
    id: 'player2',
    first_name: 'Tom',
    last_name: 'Jones',    
  }
  const errPlayer = 'Tom Jones';

  const mockEntriesCount: Record<string, number> = {
    [div1FeeColName]: 20,
    [div2FeeColName]: 20,
    [pot1FeeColName]: 18,
    [pot2FeeColName]: 18,
    [elim1FeeColName]: 10,
    [elim2FeeColName]: 10,
  }

  const mockAllBrktsList: Record<string, BracketList> = {
    [mockTmntFullData.brkts[0].id]: new BracketList(mockTmntFullData.brkts[0].id, 2, 3),
    [mockTmntFullData.brkts[1].id]: new BracketList(mockTmntFullData.brkts[1].id, 2, 3),
  }
  const row3 = cloneDeep(validRow);
  row3.id = 'player3';
  row3.first_name = 'Al';
  row3.last_name = 'Adams';
  row3.lane = 30;
  row3.position = 'A';

  const row4 = cloneDeep(validRow);
  row4.id = 'player4';
  row4.first_name = 'Bob';
  row4.last_name = 'Brows';
  row4.lane = 30;
  row4.position = 'B';

  const row5 = cloneDeep(validRow);
  row5.id = 'player5';
  row5.first_name = 'Charlie';
  row5.last_name = 'Chaplin';
  row5.lane = 31;
  row5.position = 'A';

  const row6 = cloneDeep(validRow);
  row6.id = 'player6';
  row6.first_name = 'Dennis';
  row6.last_name = 'Dent';
  row6.lane = 31;
  row6.position = 'B';

  const row7 = cloneDeep(validRow);
  row7.id = 'player7';
  row7.first_name = 'Eddie';
  row7.last_name = 'Einstein';
  row7.lane = 32;
  row7.position = 'A';

  const row8 = cloneDeep(validRow);
  row8.id = 'player8';
  row8.first_name = 'Frank';
  row8.last_name = 'Fitzgerald';
  row8.lane = 32;
  row8.position = 'B';

  const eightPlayers = [
    validRow,
    row2,
    row3,
    row4,
    row5,
    row6,
    row7,
    row8]
  mockAllBrktsList[mockTmntFullData.brkts[0].id].calcTotalBrkts(eightPlayers);
  mockAllBrktsList[mockTmntFullData.brkts[1].id].calcTotalBrkts(eightPlayers);
    
  describe('getRowPlayerName', () => {

    it('should return concatenated full name when first and last names exist', () => {
      const rows = [
        { id: 1, index: 1, first_name: 'John', last_name: 'Smith', lanePos: '1' }
      ];
      const row = { id: 1, first_name: 'John', last_name: 'Smith', lanePos: '1' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('John Smith');
    });
    it('should return concatenated full name when both first and last names are provided', () => {
      const rows = [
        { id: 1, index: 1, first_name: 'Jane', last_name: 'Doe', lanePos: '2' }
      ];
      const row = { id: 1, first_name: 'Jane', last_name: 'Doe', lanePos: '2' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('Jane Doe');
    });
    it('should return first name only when last name is empty', () => {
      const rows = [
        { id: 1, index: 1, first_name: 'John', last_name: '', lanePos: '1' }
      ];
      const row = { id: 1, first_name: 'John', last_name: '', lanePos: '1' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('John');
    });
    it('should return last name only when first name is empty', () => {
      const rows = [
        { id: 1, index: 1, first_name: '', last_name: 'Smith', lanePos: '3' }
      ];
      const row = { id: 1, first_name: '', last_name: 'Smith', lanePos: '3' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('Smith');
    });
    it('should return "player on row" with index when first name, last name, and lanePos are empty', () => {
      const rows = [
        { id: 1, index: 1, first_name: '', last_name: '', lanePos: '' }
      ];
      const row = { id: 1, first_name: '', last_name: '', lanePos: '' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('player on row 1');
    });
    it('should return lane position based name when full name is empty but lanePos exists', () => {
      const rows = [
        { id: 1, index: 1, first_name: '', last_name: '', lanePos: '5' }
      ];
      const row = { id: 1, first_name: '', last_name: '', lanePos: '5' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('player at Lane position 5');
    });
    it('should return row number based name when full name and lanePos are empty', () => {
      const rows = [
        { id: 1, index: 1, first_name: '', last_name: '', lanePos: '' },
        { id: 2, index: 2, first_name: '', last_name: '', lanePos: '' }
      ];
      const row = { id: 2, first_name: '', last_name: '', lanePos: '' };
      const result = getRowPlayerName(rows, row);
      expect(result).toBe('player on row 2');
    });
  });

  describe('validAverage', () => {
    
    it('should return empty string when average is between 0 and maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: 200 };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when average is null and checkType is Final', () => {
      const invalidRow = { ...invalidBaseRow, average: null };
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Final);
      expect(result).toBe('Missing Average for Tom Jones in row 2');      
    });
    it('should return error message when average is undefined and checkType is Final', () => {
      const invalidRow = { ...invalidBaseRow, average: undefined };
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Final);
      expect(result).toBe('Missing Average for Tom Jones in row 2');      
    });
    it('should return no error message when average is null and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, average: null };
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('');      
    });
    it('should return error message when average is undefined and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, average: undefined };
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('');      
    });
    it('should return error message when average is negative', () => {
      const invalidRow = { ...invalidBaseRow, average: -1 };
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');      
    });
    it('should return empty string when average is at boundary 0', () => {
      const invalidRow = { ...invalidBaseRow, average: 0 };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('');      
    });
    it('should return empty string when average is equal to maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: maxAverage };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);      
      expect(result).toBe('');
    });
    it('should return error message when average exceeds maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: maxAverage + 1 };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');
    });
    it('should return error message when average is not a number', () => {
      const invalidRow = { ...invalidBaseRow, average: 'abc' };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');
    });
    it('should return error message when average is not an integer', () => {
      const invalidRow = { ...invalidBaseRow, average: 123.4 };      
      const result = validAverage(invalidRow, errPlayer, 1, CheckType.Prelim);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');
    });
  });

  describe('validLane', () => {    
    it('should return empty string when lane is within valid range', () => {
      const row = { ...playerEntryData, lane: 5 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return no error message when lane is undefined and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: undefined };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return no error message when lane is null and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: null };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return no error message when lane is 0 and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: 0 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when lane is undefined and checkType is Final', () => {
      const row = { ...playerEntryData, lane: undefined };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is null and checkType is Final', () => {
      const row = { ...playerEntryData, lane: null };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is 0 and checkType is Final', () => {
      const row = { ...playerEntryData, lane: 0 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Lane for Tom Jones in row 1');
    });
    it('should return empty string when lane is within valid range and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: 5 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when lane is less than minLane and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: 1 };
      const result = validLane(row, 3, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is greater than maxLane and checkType is Prelim', () => {
      const row = { ...playerEntryData, lane: 11 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return empty string when lane is within valid range and checkType is Final', () => {
      const row = { ...playerEntryData, lane: 5 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    });
    it('should return error message when lane is less than minLane and checkType is Final', () => {
      const row = { ...playerEntryData, lane: 1 };
      const result = validLane(row, 3, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is greater than maxLane and checkType is Final', () => {
      const row = { ...playerEntryData, lane: 11 };
      const result = validLane(row, 1, 10, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
  });

  describe('validPosition', () => {
    it('should return no error message when position is valid uppercase and checkType is Prelim', () => { 
      const row = { ...playerEntryData, position: 'A' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    })
    it('should return no error message when position is valid uppercase and checkType is Final', () => { 
      const row = { ...playerEntryData, position: 'A' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    })
    it('should return no error message when position is valid lowercase and checkType is Prelim', () => { 
      const row = { ...playerEntryData, position: 'a' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    })
    it('should return no error message when position is valid lowercase and checkType is Final', () => { 
      const row = { ...playerEntryData, position: 'a' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    })
    it('should return no error message when position is valid digit and checkType is Prelim', () => { 
      const row = { ...playerEntryData, position: 'a' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    })
    it('should return no error message when position is valid digit and checkType is Final', () => { 
      const row = { ...playerEntryData, position: 'a' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    })
    it('should return no error message when position is empty string when checkType is Prelim', () => {
      const row = { ...playerEntryData, position: '' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when position is undefined when checkType is Prelim', () => {
      const row = { ...playerEntryData, position: undefined };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when position is null when checkType is Prelim', () => {
      const row = { ...playerEntryData, position: null };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return error message when position is empty string when checkType is Final', () => {
      const row = { ...playerEntryData, position: '' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Position for Tom Jones in row 1');
    });
    it('should return error message when position is undefined when checkType is Final', () => {
      const row = { ...playerEntryData, position: undefined };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Position for Tom Jones in row 1');
    });
    it('should return error message when position is null when checkType is Final', () => {
      const row = { ...playerEntryData, position: null };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Position for Tom Jones in row 1');
    });
    it('should return error message when position has invalid characters and checkType is Prelim', () => {
      const row = { ...playerEntryData, position: '*' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position has invalid characters and checkType is Final', () => {
      const row = { ...playerEntryData, position: '*' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position has invalid digit and checkType is Prelim', () => {
      const row = { ...playerEntryData, position: '0' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position has invalid digit and checkType is Final', () => {
      const row = { ...playerEntryData, position: '0' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position has more than 1 char and checkType is Prelim', () => {
      const row = { ...playerEntryData, position: 'AB' };
      const result = validPosition(row, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position has more than 1 char and checkType is Final', () => {
      const row = { ...playerEntryData, position: 'AB' };
      const result = validPosition(row, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });

  });

  describe('is___ColumnName', () => { 

    describe('isDivEntryFeeColumnName', () => { 
      it('should return true if a valid division fee column name', () => {
        const result = isDivEntryFeeColumnName(div1FeeColName); 
        expect(result).toBe(true);
      })
      it('should return false if just plain text ', () => {
        const result = isDivEntryFeeColumnName('abc'); 
        expect(result).toBe(false);
      })
      it('should return false when passed an empty string', () => {
        const result = isDivEntryFeeColumnName(''); 
        expect(result).toBe(false);
      })
      it('should return false when passed null', () => {
        const result = isDivEntryFeeColumnName(null as any); 
        expect(result).toBe(false);
      })
      it('should return false when passed another column type', () => {
        const result = isDivEntryFeeColumnName(pot1FeeColName); 
        expect(result).toBe(false);
      })
    })
    describe('isPotFeeColumnName', () => { 
      it('should return true if a valid pot fee column name', () => {
        const result = isPotFeeColumnName(pot1FeeColName); 
        expect(result).toBe(true);
      })
      it('should return false if just plain text ', () => {
        const result = isPotFeeColumnName('abc'); 
        expect(result).toBe(false);
      })
      it('should return false when passed an empty string', () => {
        const result = isPotFeeColumnName(''); 
        expect(result).toBe(false);
      })
      it('should return false when passed null', () => {
        const result = isPotFeeColumnName(null as any); 
        expect(result).toBe(false);
      })
      it('should return false when passed another column type', () => {
        const result = isPotFeeColumnName(div1FeeColName); 
        expect(result).toBe(false);
      })
    })
    describe('isBrktsColumnName', () => { 
      it('should return true if a valid brackets column name', () => {
        const result = isBrktsColumnName(brkt1NumColName); 
        expect(result).toBe(true);
      })
      it('should return false if just plain text ', () => {
        const result = isBrktsColumnName('abc'); 
        expect(result).toBe(false);
      })
      it('should return false when passed an empty string', () => {
        const result = isBrktsColumnName(''); 
        expect(result).toBe(false);
      })
      it('should return false when passed null', () => {
        const result = isBrktsColumnName(null as any); 
        expect(result).toBe(false);
      })
      it('should return false when passed another column type', () => {
        const result = isBrktsColumnName(div1FeeColName); 
        expect(result).toBe(false);
      })
      it('should return false when passed brkts fee column type', () => {
        const result = isBrktsColumnName(brkt1FeeColName); 
        expect(result).toBe(false);
      })
    })
    describe('isElimFeeColumnName', () => { 
      it('should return true if a valid elim fee column name', () => {
        const result = isElimFeeColumnName(elim1FeeColName); 
        expect(result).toBe(true);
      })
      it('should return false if just plain text ', () => {
        const result = isElimFeeColumnName('abc'); 
        expect(result).toBe(false);
      })
      it('should return false when passed an empty string', () => {
        const result = isElimFeeColumnName(''); 
        expect(result).toBe(false);
      })
      it('should return false when passed null', () => {
        const result = isElimFeeColumnName(null as any); 
        expect(result).toBe(false);
      })
      it('should return false when passed another column type', () => {
        const result = isElimFeeColumnName(div1FeeColName); 
        expect(result).toBe(false);
      })
    })
  })

  describe('validDivs', () => {    

    it('should return empty error message when fee is valid number within range and checkType is Prelim', () => {
      const validRows = [validRow, row2];
      const result = validDivs(validRows[0], mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return empty error message when fee is valid number within range and checkType is Final', () => {
      const validRows = [validRow, row2];
      const result = validDivs(validRows[0], mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    });
    it('should return error message when fee1 exceeds maxMoney and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee2 exceeds maxMoney and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: maxMoney + 1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee1 exceeds maxMoney and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee2 exceeds maxMoney and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: maxMoney + 1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee1 less than 0 and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee2 less than 0 and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: -1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee1 less than 0 and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee2 less than 0 and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: -1 };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee is not a number and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: "abc" };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee not a number and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: "abc" };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return empty error message when fee1 is null and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return empty error message when fee2 is null and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return empty error message when fee1 and fee2 are null and checkType is Prelim', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: null, [div2FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Prelim);
      expect(result).toBe('');
    });
    it('should return empty error message when fee1 is null, fee2 is valid and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    });
    it('should return empty error message when fee1 is valid, fee2 is null and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div2FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('');
    });
    it('should return error message when fee1 and fee2 are null and checkType is Final', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: null, [div2FeeColName]: null };
      const result = validDivs(row, mockTmntFullData, errPlayer, 0, CheckType.Final);
      expect(result).toBe('Missing Division Fee for Tom Jones in row 1');
    });
  });

  describe('validPots', () => {
    const playerDivs = [mockTmntFullData.divs[0].id];
    it('should return empty string when all pot fees are valid', () => {
      const validRows = [validRow, row2];
      const result = validPots(validRows[0], mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when pot fee is null or undefined', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: null, [pot2FeeColName]: undefined };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when pot fee is 0', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 0, [pot2FeeColName]: 0 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when all pot fees are valid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 20, [pot2FeeColName]: 10 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return error message with player name when pot 1 fee is invalid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 15, [pot2FeeColName]: 10 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid pot fee in Scratch: Gm for Tom Jones in row 1");
    });
    it('should return error message with player name when pot 2 fee is invalid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 20, [pot2FeeColName]: 15 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid pot fee in Scratch: LG for Tom Jones in row 1");
    });
    it('should return error message with player name when pot fee is negative', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: -1, [pot2FeeColName]: 10 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid pot fee in Scratch: Gm for Tom Jones in row 1");
    });
    it('should return error message with player name when pot fee is more than max money', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: maxMoney + 1, [pot2FeeColName]: 10 };
      const result = validPots(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid pot fee in Scratch: Gm for Tom Jones in row 1");
    });
    it('should return error message when player entred in a pot they are not eligible for', () => { 
      const row = { ...invalidBaseRow, [div1FeeColName]: undefined as any, [pot1FeeColName]: 20, [pot2FeeColName]: 10 };
      const onlyOneDiv = [mockTmntFullData.divs[1].id];
      const result = validPots(row, mockTmntFullData, onlyOneDiv, errPlayer, 0);
      expect(result).toBe("Tom Jones is not entered in the division for pot Scratch: Gm in row 1");      
    })
  });

  describe('validBrkts', () => {
    const playerDivs = [mockTmntFullData.divs[0].id];
    it('should return empty string when bracket numbers are within valid range', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: 4 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are 0', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 0, [brkt2NumColName]: 0 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are null', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: null, [brkt2NumColName]: null };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are undefined', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: undefined, [brkt2NumColName]: undefined };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when bracket 1 number is negative', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: -1, [brkt2NumColName]: 4 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);      
      expect(result).toBe('Number of brackets in Scratch: 1-3 is less than 0 for Tom Jones in row 1');
    });
    it('should return error message when bracket 2 number is negative', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: -1 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);      
      expect(result).toBe('Number of brackets in Scratch: 4-6 is less than 0 for Tom Jones in row 1');
    });
    it('should return error message when bracket 1 number is too large', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: maxBrackets + 1, [brkt2NumColName]: 4 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);      
      expect(result).toBe('Number of brackets in Scratch: 1-3 is more than 999 for Tom Jones in row 1');
    });
    it('should return error message when bracket 2 number is too large', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: maxBrackets + 1 };
      const result = validBrkts(row, mockTmntFullData, playerDivs, errPlayer, 0);      
      expect(result).toBe('Number of brackets in Scratch: 4-6 is more than 999 for Tom Jones in row 1');
    });
    it('should return error message when player entred in a bracket they are not eligible for', () => { 
      const row = { ...invalidBaseRow, [div1FeeColName]: undefined as any, [brkt1NumColName]: 4, [brkt2NumColName]: 4 };
      const onlyOneDiv = [mockTmntFullData.divs[1].id];
      const result = validBrkts(row, mockTmntFullData, onlyOneDiv, errPlayer, 0);
      expect(result).toBe("Tom Jones is not entered in the division for bracket Scratch: 1-3 in row 1");
    })
  });

  describe('validElims', () => {
    const playerDivs = [mockTmntFullData.divs[0].id];
    it('should return empty string when all elim fees are valid', () => {
      const validRows = [validRow, row2];
      const result = validElims(validRows[0], mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee is null or undefined', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: null, [elim2FeeColName]: undefined };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee 0', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 0, [elim2FeeColName]: 0 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee are valid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: 5 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return error message with player name when elim 1 fee invalid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 15, [elim2FeeColName]: 5 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 1-3 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee invalid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: 15 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 1 fee is negative', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: -1, [elim2FeeColName]: 5 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 1-3 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee is negative', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: -5 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 1 fee is too large', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: maxMoney + 1, [elim2FeeColName]: 5 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 1-3 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee is too large', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: maxMoney + 1 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee is too large', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: maxMoney + 1 };
      const result = validElims(row, mockTmntFullData, playerDivs, errPlayer, 0);
      expect(result).toBe("Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 1");
    });
    it('should return error message when player entred in an elim they are not eligible for', () => { 
      const row = { ...invalidBaseRow, [div1FeeColName]: undefined as any, [elim1FeeColName]: 5, [elim2FeeColName]: 5 };
      const onlyOneDiv = [mockTmntFullData.divs[1].id];
      const result = validElims(row, mockTmntFullData, onlyOneDiv, errPlayer, 0);
      expect(result).toBe("Tom Jones is not entered in the division for eliminator Scratch: 1-3 in row 1");
    })

  });
  
  describe('findNextError - Prelim', () => {

    it('should return empty string when all row data is valid', () => {      
      const validRows = [validRow, row2];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no average', () => {      
      const row2a = cloneDeep(row2);
      row2a.average = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no lane', () => {      
      const row2a = cloneDeep(row2);
      row2a.lane = null as any;
      row2a.lanePos = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no position', () => {      
      const row2a = cloneDeep(row2);      
      row2a.position = null as any;
      row2a.lanePos = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no division, no Pots, no Brackets, no Elims', () => {      
      const row2a = cloneDeep(row2);      
      row2a[div1FeeColName] = null as any;
      row2a[div2FeeColName] = null as any;
      row2a[pot1FeeColName] = null as any;
      row2a[pot2FeeColName] = null as any;
      row2a[brkt1FeeColName] = null as any;
      row2a[brkt1NumColName] = null as any;
      row2a[brkt2FeeColName] = null as any;
      row2a[brkt2NumColName] = null as any;
      row2a[elim1FeeColName] = null as any;
      row2a[elim2FeeColName] = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no pots', () => {      
      const row2a = cloneDeep(row2);      
      row2a[pot1FeeColName] = null as any;
      row2a[pot2FeeColName] = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no brackets', () => {      
      const row2a = cloneDeep(row2);      
      row2a[brkt1FeeColName] = null as any;
      row2a[brkt1NumColName] = null as any;
      row2a[brkt2FeeColName] = null as any;
      row2a[brkt2NumColName] = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return empty string when all row data is valid - no elims', () => {      
      const row2a = cloneDeep(row2);      
      row2a[elim1FeeColName] = null as any;
      row2a[elim2FeeColName] = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });    
    it('should return empty string when rows array is empty', () => {
      const emptyRows: typeof playerEntryData[] = [];
      const result = findNextError(emptyRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return error message when rows array is null', () => {      
      const result = findNextError(null as any, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('No players in the tournament');
    });
    it('should return error message when first name is missing', () => {
      const invalidRow = { ...invalidBaseRow, first_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Missing First Name in row 2');
    });
    it('should return error message when last name is missing', () => {
      const invalidRow = { ...invalidBaseRow, last_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Missing Last Name in row 2');
    });
    it('should return error message when average is invalid', () => { 
      const invalidRow = { ...invalidBaseRow, average: maxAverage + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid Average for Tom Jones in row 2');
    })
    it('should return no error message when average is blank and checkType is Prelim', () => { 
      const invalidRow = { ...invalidBaseRow, average: undefined as any};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    })    
    it('should return error message when lane is invalid', () => {
      const invalidRow = { ...invalidBaseRow, lane: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid Lane for Tom Jones in row 2');
    });
    it('should return no error message when lane is undefined and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, lane: undefined as any};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return error message when position is invalid and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, position: '*' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid Position for Tom Jones in row 2');
    });
    it('should return no error message when position is undefined and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, position: undefined as any};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return no error message when position is null and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, position: null as any};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return no error message when position is blank and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, position: ''};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return no error message when position is valid and checkType is Prelim', () => {
      const invalidRow = { ...invalidBaseRow, position: 'A'};
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('');
    });
    it('should return error message when division too low', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when division too high', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid pot fee in Scratch: Gm for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid pot fee in Scratch: LG for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too low', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Number of brackets in Scratch: 1-3 is less than 0 for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too high', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: maxBrackets + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Number of brackets in Scratch: 1-3 is more than 999 for Tom Jones in row 2');
    });
    it('should return error message when eliminator fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid eliminator fee in Scratch: 1-3 for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Prelim);
      expect(result.msg).toBe('Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 2');
    });
  });

  describe('findNextError - Final', () => {

    it('should return empty string when all row data is valid', () => {      
      const validRows = [validRow, row2];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('');
    });
    it('should return error message - no average', () => {      
      const row2a = cloneDeep(row2);
      row2a.average = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing Average for Jane Doe in row 2');
    });
    it('should return error message - no lane', () => {      
      const row2a = cloneDeep(row2);
      row2a.lane = null as any;
      row2a.lanePos = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing Lane for Jane Doe in row 2');
    });
    it('should return error message - no position', () => {      
      const row2a = cloneDeep(row2);      
      row2a.position = null as any;
      row2a.lanePos = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing Position for Jane Doe in row 2');
    });
    it('should return error message - no division', () => {      
      const row2a = cloneDeep(row2);      
      row2a[div1FeeColName] = null as any;   
      row2a[div2FeeColName] = null as any;
      const validRows = [validRow, row2a];
      const result = findNextError(validRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing Division Fee for Jane Doe in row 2');
    });
    it('should return error message when rows array is empty', () => {
      const emptyRows: typeof playerEntryData[] = [];
      const result = findNextError(emptyRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('No players in the tournament');
    });
    it('should return error message when rows array is null', () => {      
      const result = findNextError(null as any, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('No players in the tournament');
    });
    it('should return error message when first name is missing', () => {
      const invalidRow = { ...invalidBaseRow, first_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing First Name in row 2');
    });
    it('should return error message when last name is missing', () => {
      const invalidRow = { ...invalidBaseRow, last_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Missing Last Name in row 2');
    });
    it('should return error message when average is invalid', () => { 
      const invalidRow = { ...invalidBaseRow, average: maxAverage + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid Average for Tom Jones in row 2');
    })
    it('should return error message when lane is invalid', () => {
      const invalidRow = { ...invalidBaseRow, lane: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid Lane for Tom Jones in row 2');
    });
    it('should return error message when position is invalid and checkType is Final', () => {
      const invalidRow = { ...invalidBaseRow, position: '*' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid Position for Tom Jones in row 2');
    });
    it('should return error message when division too low', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when division too high', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid pot fee in Scratch: Gm for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid pot fee in Scratch: LG for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too low', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Number of brackets in Scratch: 1-3 is less than 0 for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too high', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: maxBrackets + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Number of brackets in Scratch: 1-3 is more than 999 for Tom Jones in row 2');
    });
    it('should return error message when eliminator fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid eliminator fee in Scratch: 1-3 for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, mockTmntFullData, CheckType.Final);
      expect(result.msg).toBe('Invalid eliminator fee in Scratch: 4-6 for Tom Jones in row 2');
    });

  });

  describe('getDivsPotsBrktsElimsCounts', () => { 

    it('should return counts of divs, pots, brkts and elims entries', () => {
      const counts = getDivsPotsBrktsElimsCounts(mockEntriesCount, mockAllBrktsList);
      expect(Object.keys(counts)).toHaveLength(8);
      expect(Object.keys(counts)).toEqual(expect.arrayContaining([
        div1FeeColName,
        div2FeeColName,
        pot1FeeColName,
        pot2FeeColName,
        brkt1NumColName,
        brkt2NumColName,
        elim1FeeColName,
        elim2FeeColName
      ]));
      expect(counts[div1FeeColName]).toBe(20);
      expect(counts[div2FeeColName]).toBe(20);
      expect(counts[pot1FeeColName]).toBe(18);
      expect(counts[pot2FeeColName]).toBe(18);
      expect(counts[brkt1NumColName]).toBe(8);
      expect(counts[brkt2NumColName]).toBe(8);
      expect(counts[elim1FeeColName]).toBe(10);
      expect(counts[elim2FeeColName]).toBe(10); 
    });  
    it('should return 0 for division count when no entries', () => { 
      const invalidDivs = cloneDeep(mockEntriesCount);
      invalidDivs[div1FeeColName] = 0;
      const counts = getDivsPotsBrktsElimsCounts(invalidDivs, mockAllBrktsList);
      expect(Object.keys(counts)).toHaveLength(8);
      expect(counts[div1FeeColName]).toBe(0);
    })
    it('should return 0 for pot count when no entries', () => { 
      const invalidPots = cloneDeep(mockEntriesCount);
      invalidPots[pot1FeeColName] = 0;
      const counts = getDivsPotsBrktsElimsCounts(invalidPots, mockAllBrktsList);
      expect(Object.keys(counts)).toHaveLength(8);
      expect(counts[pot1FeeColName]).toBe(0);
    })
    it('should return 0 for elim counts when no entries', () => { 
      const invalidElims = cloneDeep(mockEntriesCount);
      invalidElims[elim1FeeColName] = 0;
      const counts = getDivsPotsBrktsElimsCounts(invalidElims, mockAllBrktsList);
      expect(Object.keys(counts)).toHaveLength(8);
      expect(counts[elim1FeeColName]).toBe(0);
    })
    it('should return 6 for brackets counts when only 6 players entered', () => { 
      const sixOfEightPlayers = cloneDeep(eightPlayers)
      sixOfEightPlayers[6][brkt1NumColName] = undefined as any;
      sixOfEightPlayers[6][brkt1FeeColName] = undefined as any;    
      sixOfEightPlayers[7][brkt1NumColName] = undefined as any;
      sixOfEightPlayers[7][brkt1FeeColName] = undefined as any;
      const sixOfEightBrkts = cloneDeep(mockAllBrktsList);
      sixOfEightBrkts[mockTmntFullData.brkts[0].id].calcTotalBrkts(sixOfEightPlayers);
      sixOfEightBrkts[mockTmntFullData.brkts[1].id].calcTotalBrkts(sixOfEightPlayers);    
      const counts = getDivsPotsBrktsElimsCounts(mockEntriesCount, sixOfEightBrkts);
      expect(Object.keys(counts)).toHaveLength(8);      
      expect(counts[brkt1NumColName]).toBe(6);
    })
  })

  describe('getDivsPotsBrktsElimsCountErrMsg', () => { 
    it('should return empty string when all counts are valid', () => {
      const counts = getDivsPotsBrktsElimsCounts(mockEntriesCount, mockAllBrktsList);
      const result = getDivsPotsBrktsElimsCountErrMsg(counts, mockTmntFullData);
      expect(result).toBe('');
    });
    it('should return error message when division count is invalid', () => {
      const invalidCounts = cloneDeep(mockEntriesCount);
      invalidCounts[div1FeeColName] = 0;
      const result = getDivsPotsBrktsElimsCountErrMsg(invalidCounts, mockTmntFullData);
      const divId = div1FeeColName.slice(0, -feeColNameEnd.length); 
      const divName = getDivName(divId, mockTmntFullData.divs);
      expect(result).toBe(`No division entries for ${divName}`);
    });
    it('should return error message when pot count is invalid', () => {
      const invalidCounts = cloneDeep(mockEntriesCount);
      invalidCounts[pot1FeeColName] = 0;
      const result = getDivsPotsBrktsElimsCountErrMsg(invalidCounts, mockTmntFullData);
      const potId = pot1FeeColName.slice(0, -feeColNameEnd.length); 
      const pot = mockTmntFullData.pots.find((p) => p.id === potId);
      expect(result).toBe(`No pot entries for ${pot?.pot_type}`);
    });
    it('should return error message when bracket count is invalid', () => {
      const invalidCounts = cloneDeep(mockEntriesCount);
      invalidCounts[brkt1NumColName] = defaultBrktPlayers - 2; // defaultBrktPlayers-1 is valid
      const result = getDivsPotsBrktsElimsCountErrMsg(invalidCounts, mockTmntFullData);
      const brktId = brkt1NumColName.slice(0, -brktsColNameEnd.length);
      const brkt = mockTmntFullData.brkts.find((b) => b.id === brktId);
      const brktName = getBrktOrElimName(brkt as brktType, mockTmntFullData.divs);
      expect(result).toBe(`Not enough bracket entries for ${brktName}`);
    });
    it('should return error message when eliminator count is invalid', () => {
      const invalidCounts = cloneDeep(mockEntriesCount);
      invalidCounts[elim1FeeColName] = 0;
      const result = getDivsPotsBrktsElimsCountErrMsg(invalidCounts, mockTmntFullData);
      const elimId = elim1FeeColName.slice(0, -feeColNameEnd.length);
      const elim = mockTmntFullData.elims.find((e) => e.id === elimId);
      const elimName = getBrktOrElimName(elim as elimType, mockTmntFullData.divs);      
      expect(result).toBe(`No elim entries for ${elimName}`);
    });
  })

})