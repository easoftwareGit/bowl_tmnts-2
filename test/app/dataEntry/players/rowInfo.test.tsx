import { entryFeeColName, entryNumBrktsColName, playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { findNextError, getRowPlayerName, exportedForTesting } from "@/app/dataEntry/playersForm/rowInfo";
import { initBrkt, initDiv, initElim, initEvent, initLane, initPot, initSquad, initTmnt } from "@/lib/db/initVals";
import { dataOneTmntType } from "@/lib/types/types";
import { maxAverage, maxBrackets, maxMoney } from "@/lib/validation";

const { validAverage, validLane, validPosition, validDivs, validPots, validBrkts, validElims } = exportedForTesting;

describe('findError', () => {

  const tmntData: dataOneTmntType = {
    tmnt: {
      ...initTmnt,
      id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
      user_id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
      tmnt_name: "Full Tournament",
      bowl_id: "bwl_561540bd64974da9abdd97765fdb3659",
    },
    events: [{    
      ...initEvent,
      id: "evt_aff710c8493f4a218d2e2b045442974a",
      tmnt_id: "tmt_a237a388a8fc4641a2e37233f1d6bebd",
      event_name: "Singles",
      team_size: 1,
      games: 6,
      entry_fee: '85',
      lineage: '21',
      prize_fund: '57',
      other: '2',
      expenses: '5',
      added_money: '0',
      sort_order: 1,
    }],
    divs: [{     
      ...initDiv,
      id: "div_99a3cae28786485bb7a036935f0f6a0a",
      tmnt_id: "tmt_d237a388a8fc4641a2e37233f1d6bebd",
      div_name: "Scratch",
      hdcp_per: 0,
      hdcp_from: 230,
      int_hdcp: true,
      hdcp_for: "Game",
      sort_order: 1,
    }],
    squads: [{ 
      ...initSquad,
      id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
      event_id: "evt_4ff710c8493f4a218d2e2b045442974a",
      squad_name: "Squad 1",        
      squad_time: null,
      games: 6,
      lane_count: 12,
      starting_lane: 29,
      sort_order: 1,
    }],
    lanes: [
      {
        ...initLane,
        id: "lan_aa019d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 29,
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_aa029d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 30,
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        in_use: true,          
      },
      {
        ...initLane,
        id: "lan_aa039d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 31,
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        in_use: true,
      },
      {
        ...initLane,
        id: "lan_aa049d9e6b6e4c5b9f6b7d9e7f9b6c5d",
        lane_number: 32,
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        in_use: true,
      },
    ],
    pots: [
      { 
        ...initPot,
        id: "pot_a9fd8f787de942a1a92aaa2df3e7c185",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        fee: '20',
        pot_type: "Game",
      },
      { 
        ...initPot,
        id: "pot_a9fd8f787de942a1a92aaa2df3e7c186",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        fee: '10',
        pot_type: "Last Game",
      }
    ],
    brkts: [
      {
        ...initBrkt,
        id: "brk_3e6bf51cc1ca4748ad5e8abab88277e0",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        players: 8,
        fee: '5',
        first: '25',
        second: '10',
        admin: '5',  
      },
      {
        ...initBrkt,
        id: "brk_fd88cd2f5a164e8c8f758daae18bfc83",
        squad_id: "sqd_8e4266e1174642c7a1bcec47a50f275f",
        div_id: "div_99a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        players: 8,
        fee: '5',
        first: '25',
        second: '10',
        admin: '5',  
      }
    ],
    elims: [
      {
        ...initElim,
        id: "elm_a47a4ec07f824b0e93169ae78e8b4b1e",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 1,
        start: 1,
        games: 3,
        fee: '5',  
      },
      {
        ...initElim,
        id: "elm_a61eece3c50241e9925e9a520730ac7e",
        squad_id: "sqd_ae4266e1174642c7a1bcec47a50f275f",
        div_id: "div_a9a3cae28786485bb7a036935f0f6a0a",
        sort_order: 2,
        start: 4,
        games: 3,
        fee: '5',  
      }
    ]
  };
  const div1FeeColName = entryFeeColName(tmntData.divs[0].id);
  const pot1FeeColName = entryFeeColName(tmntData.pots[0].id);
  const pot2FeeColName = entryFeeColName(tmntData.pots[1].id);
  const brkt1NumColName = entryNumBrktsColName(tmntData.brkts[0].id);    
  const brkt1FeeColName = entryFeeColName(tmntData.brkts[0].id);
  const brkt2NumColName = entryNumBrktsColName(tmntData.brkts[1].id);
  const brkt2FeeColName = entryFeeColName(tmntData.brkts[1].id);
  const elim1FeeColName = entryFeeColName(tmntData.elims[0].id);
  const elim2FeeColName = entryFeeColName(tmntData.elims[1].id);

  const validRow = {
    id: 'player1',
    first_name: 'John',
    last_name: 'Smith',
    average: 205,
    lane: 29,
    position: 'A',
    [div1FeeColName]: 85,
    [pot1FeeColName]: 20,
    [pot2FeeColName]: 10,
    [brkt1NumColName]: 4,
    [brkt1FeeColName]: 20,
    [brkt2NumColName]: 4,
    [brkt2FeeColName]: 20,
    [elim1FeeColName]: 5,
    [elim2FeeColName]: 5,
    feeTotal: 165
  }

  const validRows = [{
    ...validRow
  }]    
  const invalidBaseRow = {
    ...validRow,
    first_name: 'Tom',
    last_name: 'Jones'
  }
  const errPlayer = 'Tom Jones';
    
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

  describe('findNextError', () => {

    it('should return empty string when all row data is valid', () => {
      const result = findNextError(validRows, tmntData);
      expect(result.msg).toBe('');
    });
    it('should return empty string when rows array is empty', () => {
      const emptyRows: typeof playerEntryData[] = [];
      const result = findNextError(emptyRows, tmntData);
      expect(result.msg).toBe('');
    });
    it('should return error message when first name is missing', () => {
      const invalidRow = { ...invalidBaseRow, first_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Missing First Name in row 2');
    });
    it('should return error message when last name is missing', () => {
      const invalidRow = { ...invalidBaseRow, last_name: '' };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Missing Last Name in row 2');
    });
    it('should return error message when averagge is invalid', () => { 
      const invalidRow = { ...invalidBaseRow, average: maxAverage + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Average for Tom Jones in row 2');
    })
    it('should return error message when lane is invalid', () => {
      const invalidRow = { ...invalidBaseRow, lane: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Lane for Tom Jones in row 2');
    });
    it('should return error message when division too low', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when division too high', () => {
      const invalidRow = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Fee for Tom Jones in row 2');
    });
    it('should return error message when pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Pot Fee for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [pot2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Pot Fee for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too low', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: -1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Number of brackets is less than 0 for Tom Jones in row 2');
    });
    it('should return error message when number of brackets is too high', () => {
      const invalidRow = { ...invalidBaseRow, [brkt1NumColName]: maxBrackets + 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Number of brackets is more than 999 for Tom Jones in row 2');
    });
    it('should return error message when eliminator fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim1FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Eliminator Fee for Tom Jones in row 2');
    });
    it('should return error message when 2nd pot fee is invalid', () => {
      const invalidRow = { ...invalidBaseRow, [elim2FeeColName]: 1 };
      const invalidRows = [validRow, invalidRow];
      const result = findNextError(invalidRows, tmntData);
      expect(result.msg).toBe('Invalid Eliminator Fee for Tom Jones in row 2');
    });

  });

  describe('validAverage', () => {
    
    it('should return empty string when average is between 0 and maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: 200 };      
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('');
    });
    it('should return error message when average is null', () => {
      const invalidRow = { ...invalidBaseRow, average: null };
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');      
    });
    it('should return error message when average is undefined', () => {
      const invalidRow = { ...invalidBaseRow, average: undefined };
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');      
    });
    it('should return error message when average is negative', () => {
      const invalidRow = { ...invalidBaseRow, average: -1 };
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');      
    });
    it('should return empty string when average is at boundary 0', () => {
      const invalidRow = { ...invalidBaseRow, average: 0 };      
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('');      
    });
    it('should return empty string when average is equal to maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: maxAverage };      
      const result = validAverage(invalidRow, errPlayer, 1);      
      expect(result).toBe('');
    });
    it('should return error message when average exceeds maxAverage', () => {
      const invalidRow = { ...invalidBaseRow, average: maxAverage + 1 };      
      const result = validAverage(invalidRow, errPlayer, 1);
      expect(result).toBe('Invalid Average for Tom Jones in row 2');
    });
  });

  describe('validLane', () => {    

    it('should return error message when lane is undefined', () => {
      const row = { ...playerEntryData, lane: undefined };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is 0', () => {
      const row = { ...playerEntryData, lane: 0 };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return empty string when lane is within valid range', () => {
      const row = { ...playerEntryData, lane: 5 };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when lane null', () => {
      const row = { ...playerEntryData, lane: null };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane undefined', () => {
      const row = { ...playerEntryData, lane: undefined };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is less than minLane', () => {
      const row = { ...playerEntryData, lane: 1 };
      const result = validLane(row, 3, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
    it('should return error message when lane is greater than maxLane', () => {
      const row = { ...playerEntryData, lane: 11 };
      const result = validLane(row, 1, 10, errPlayer, 0);
      expect(result).toBe('Invalid Lane for Tom Jones in row 1');
    });
  });

  describe('validPosition', () => {
    it('should return error message when position is empty string', () => {
      const row = { ...playerEntryData, position: '' };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position is undefined', () => {
      const row = { ...playerEntryData, position: undefined };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return error message when position is null', () => {
      const row = { ...playerEntryData, position: null };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
    it('should return empty string when position is a valid single character', () => {
      const row = { ...playerEntryData, position: 'A' };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when position is a valid lowercase single character', () => {
      const row = { ...playerEntryData, position: 'a' };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string for number as 1 char input', () => {
      const row = { ...playerEntryData, position: '1' };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when position has invalid characters', () => {
      const row = { ...playerEntryData, position: '*' };
      const result = validPosition(row, errPlayer, 0);
      expect(result).toBe('Invalid Position for Tom Jones in row 1');
    });
  });

  describe('validDivs', () => {    

    it('should return empty error message when fee is valid number within range', () => {
      const result = validDivs(validRows[0], tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when fee exceeds maxMoney', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: maxMoney + 1 };
      const result = validDivs(row, tmntData, errPlayer, 0);
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return empty error message when fee is zero', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: 0 };
      const result = validDivs(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should default fee to 0 when fee is null', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: null };
      const result = validDivs(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should default fee to 0 when fee is undefined', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: undefined };
      const result = validDivs(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when fee is negative', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: -1 };
      const result = validDivs(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
    it('should return error message when fee is non-numeric', () => {
      const row = { ...invalidBaseRow, [div1FeeColName]: 'abc' };
      const result = validDivs(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Invalid Fee for Tom Jones in row 1');
    });
  });

  describe('validPots', () => {
    it('should return empty string when all pot fees are valid', () => {
      const result = validPots(validRows[0], tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when pot fee is null or undefined', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: null, [pot2FeeColName]: undefined };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when pot fee is 0', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 0, [pot2FeeColName]: 0 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when all pot fees are valid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 20, [pot2FeeColName]: 10 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return error message with player name when pot 1 fee is invalid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 15, [pot2FeeColName]: 10 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Pot Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when pot 2 fee is invalid', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: 20, [pot2FeeColName]: 15 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Pot Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when pot fee is negative', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: -1, [pot2FeeColName]: 10 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Pot Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when pot fee is more than max money', () => {
      const row = { ...invalidBaseRow, [pot1FeeColName]: maxMoney + 1, [pot2FeeColName]: 10 };
      const result = validPots(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Pot Fee for Tom Jones in row 1");
    });
  });

  describe('validBrkts', () => {
    it('should return empty string when bracket numbers are within valid range', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: 4 };
      const result = validBrkts(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are 0', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 0, [brkt2NumColName]: 0 };
      const result = validBrkts(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are null', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: null, [brkt2NumColName]: null };
      const result = validBrkts(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return empty string when bracket numbers are undefined', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: undefined, [brkt2NumColName]: undefined };
      const result = validBrkts(row, tmntData, errPlayer, 0);
      expect(result).toBe('');
    });
    it('should return error message when bracket 1 number is negative', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: -1, [brkt2NumColName]: 4 };
      const result = validBrkts(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Number of brackets is less than 0 for Tom Jones in row 1');
    });
    it('should return error message when bracket 2 number is negative', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: -1 };
      const result = validBrkts(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Number of brackets is less than 0 for Tom Jones in row 1');
    });
    it('should return error message when bracket 1 number is too large', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: maxBrackets + 1, [brkt2NumColName]: 4 };
      const result = validBrkts(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Number of brackets is more than 999 for Tom Jones in row 1');
    });
    it('should return error message when bracket 2 number is too large', () => {
      const row = { ...invalidBaseRow, [brkt1NumColName]: 4, [brkt2NumColName]: maxBrackets + 1 };
      const result = validBrkts(row, tmntData, errPlayer, 0);      
      expect(result).toBe('Number of brackets is more than 999 for Tom Jones in row 1');
    });
  });

  describe('validElims', () => {
    it('should return empty string when all elim fees are valid', () => {
      const result = validElims(validRows[0], tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee is null or undefined', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: null, [elim2FeeColName]: undefined };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee 0', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 0, [elim2FeeColName]: 0 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return empty string when elim fee are valid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: 5 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("");
    });
    it('should return error message with player name when elim 1 fee invalid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 15, [elim2FeeColName]: 5 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee invalid', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: 15 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 1 fee is negative', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: -1, [elim2FeeColName]: 5 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee is negative', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: -5 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 1 fee is too large', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: maxMoney + 1, [elim2FeeColName]: 5 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
    it('should return error message with player name when elim 2 fee is too large', () => {
      const row = { ...invalidBaseRow, [elim1FeeColName]: 5, [elim2FeeColName]: maxMoney + 1 };
      const result = validElims(row, tmntData, errPlayer, 0);
      expect(result).toBe("Invalid Eliminator Fee for Tom Jones in row 1");
    });
  });

})