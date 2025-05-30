import { getUpdateManySQL, getDeleteManySQL, getInsertManySQL, exportedForTesting, getUpdateManyRefundsSQL, getInsertManyRefundsSQL, getDeleteManyRefundsSQL } from "@/app/api/brktEntries/many/getSql";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";
import { maxBrackets } from "@/lib/validation";

const { getBrktIds, getBrktEntryIds } = exportedForTesting;

describe('getSql', () => { 

  const squadId = 'sqd_1a6c885ee19a49489960389193e8f819';

  const testBrktEntries = [
    {
      ...initBrktEntry,
      id: 'ben_01ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_brackets: 4,
      fee: '20'  
    },
    {
      ...initBrktEntry,
      id: 'ben_02ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_brackets: 4,
      fee: '20'
    },
    {
      ...initBrktEntry,
      id: 'ben_03ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      num_brackets: 6,
      fee: '30'  
    },
    {
      ...initBrktEntry,
      id: 'ben_04ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      num_brackets: 6,
      fee: '30'
    },
    {
      ...initBrktEntry,
      id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
      num_brackets: 8,
      num_refunds: 1,
      fee: '40'
    },
    {
      ...initBrktEntry,
      id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
      num_brackets: 8,
      num_refunds: 1,
      fee: '40'
    },
  ]

  describe('getBrktIds()', () => { 
    it('should return array of unique brktIds', () => {
      const brktIds = getBrktIds(testBrktEntries);
      expect(brktIds).toEqual(['brk_aa3da3a411b346879307831b6fdadd5f', 'brk_37345eb6049946ad83feb9fdbb43a307']);
    })
  })

  describe('getBrktEntryIds()', () => { 
    const expected = [
      'ben_01ce0472be3d476ea1caa99dd05953fa',
      'ben_02ce0472be3d476ea1caa99dd05953fa',
      'ben_03ce0472be3d476ea1caa99dd05953fa',
      'ben_04ce0472be3d476ea1caa99dd05953fa',
      'ben_05ce0472be3d476ea1caa99dd05953fa',
      'ben_06ce0472be3d476ea1caa99dd05953fa'
    ]
    it('should return array of unique brktEntryIds', () => {
      const brktIds = getBrktEntryIds(testBrktEntries);
      expect(brktIds).toEqual(expected);
    })
  })
  
  describe('getUpdateManySQL()', () => { 

    it('should return valid update SQL - 1 player 2 brackets', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);

      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_brackets ` +
        `END, ` +
        `time_stamp = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN to_timestamp(b2Up.time_stamp / 1000) ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN to_timestamp(b2Up.time_stamp / 1000) ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537)` +
          `) AS b2Up(brkt_id, player_id, num_brackets, time_stamp) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;
      
      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 1 brackets', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);

      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +          
        `END, ` +
        `time_stamp = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN to_timestamp(b2Up.time_stamp / 1000) ` +          
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537)` +
          `) AS b2Up(brkt_id, player_id, num_brackets, time_stamp) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;
      
      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 2 brackets', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_brackets ` +
        `END, ` +
        `time_stamp = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN to_timestamp(b2Up.time_stamp / 1000) ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN to_timestamp(b2Up.time_stamp / 1000) ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537)` +
          `) AS b2Up(brkt_id, player_id, num_brackets, time_stamp) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;

      expect(updatedSQL).toEqual(expected);
    });
    it('should return "" for invalid id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: maxBrackets + 1,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: -1,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets === 0, but fee !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 0,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid fee', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '<script>alert("xss")</script>',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '1234567890',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '-1',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee === "" and num_brackets !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid time_stamp', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 'abc' as any,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 8.65e15 + 1,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: -8.65e15 - 1,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp as null', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: null as any,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktEntries: brktEntryType[] = [];
      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getUpdateManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });
  })

  describe('getInsertManySQL()', () => { 

    it('should return valid insert SQL - 1 player 2 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Entry" (id, brkt_id, player_id, num_brackets, time_stamp) ` +
        `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_brackets, to_timestamp(b2Up.time_stamp / 1000) ` +
        `FROM (VALUES ` +
          `('ben_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('ben_a133456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537)` +
          `) AS b2up(id, brkt_id, player_id, num_brackets, time_stamp) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 1 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
      `INSERT INTO public."Brkt_Entry" (id, brkt_id, player_id, num_brackets, time_stamp) ` +
      `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_brackets, to_timestamp(b2Up.time_stamp / 1000) ` +
      `FROM (VALUES ` +
        `('ben_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
        `('ben_a143456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537)` +
        `) AS b2up(id, brkt_id, player_id, num_brackets, time_stamp) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 2 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a153456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Entry" (id, brkt_id, player_id, num_brackets, time_stamp) ` +
        `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_brackets, to_timestamp(b2Up.time_stamp / 1000) ` +
        `FROM (VALUES ` +
          `('ben_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('ben_a133456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4, 1739259269537), ` +
          `('ben_a143456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537), ` +
          `('ben_a153456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 6, 1739259269537)` +
          `) AS b2up(id, brkt_id, player_id, num_brackets, time_stamp) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: maxBrackets + 1,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: -1,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets === 0, but fee !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 0,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid fee', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '<script>alert("xss")</script>',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '1234567890',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '-1',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee === "" and num_brackets !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: ''
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid timp_stamp', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 'abc' as any
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 8.65e15 + 1
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: -8.65e15 - 1
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp as null', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: null as any
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktEntries: brktEntryType[] = [];
      const updatedSQL = getInsertManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getInsertManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });
  })

  describe('getDeleteManySQL', () => { 

    it('should return valid update SQL - 1 player 2 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537,
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktEntries);
      const expected =
        `DELETE FROM public."Brkt_Entry" ` +
        `WHERE (brkt_id, player_id) IN ( ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa')` +
        `);`;
      expect(deleteSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 1 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktEntries);
      const expected =
        `DELETE FROM public."Brkt_Entry" ` +
        `WHERE (brkt_id, player_id) IN ( ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136')` +
        `);`;
      expect(deleteSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 2 brackets', () => {
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 6,
          fee: '30',
          time_stamp: 1739259269537
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktEntries);
      const expected =
        `DELETE FROM public."Brkt_Entry" ` +
        `WHERE (brkt_id, player_id) IN ( ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136'), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136')` +
        `);`;
      expect(deleteSQL).toEqual(expected);
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: maxBrackets + 1,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: -1,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_brackets === 0, but fee !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 0,
          fee: '20',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid fee', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '<script>alert("xss")</script>',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '1234567890',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '-1',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for fee === "" and num_brackets !== 0', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: ''
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid time_stamp', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: 'abc' as any
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too high', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '29',
          time_stamp: 8.65e15 + 1
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp too low', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          num_refunds: null as any,
          fee: '20',
          time_stamp: -8.65e15 - 1
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          num_refunds: 0,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for time_stamp as null', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20',
          time_stamp: null as any
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20',
          time_stamp: 1739259269537
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktEntries: brktEntryType[] = [];
      const updatedSQL = getDeleteManySQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getDeleteManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });
  })

  describe('getUpdateManyRefundsSQL', () => {

    it('should return valid update refunds SQL', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);

      const expected =
        `UPDATE public."Brkt_Refund" ` +
        `SET num_refunds = CASE ` +
          `WHEN public."Brkt_Refund".brkt_entry_id = 'ben_05ce0472be3d476ea1caa99dd05953fa' THEN b2Up.num_refunds ` +
          `WHEN public."Brkt_Refund".brkt_entry_id = 'ben_06ce0472be3d476ea1caa99dd05953fa' THEN b2Up.num_refunds ` +
        `END ` +
        `FROM (VALUES ` +
          `('ben_05ce0472be3d476ea1caa99dd05953fa', 3), ` +
          `('ben_06ce0472be3d476ea1caa99dd05953fa', 3)` +
          `) AS b2Up(brkt_entry_id, num_refunds) ` +
        `WHERE public."Brkt_Refund".brkt_entry_id = b2Up.brkt_entry_id;`;
      
      expect(updatedSQL).toEqual(expected);
    });
    it('should return "" for invalid id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    })
    it('should return "" when is valid, but not a brkt_entry id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual('');
    })
    it('should return "" when num_refunds is too low', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: -1,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })
    it('should return "" when num_refunds is too high', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 1234567890,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })
    it('should return "" when num_refunds is higher than num_brackets', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 9,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })
    it('should return "" when num_refunds is not a number', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 'abc' as any,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })
    it('should return "" when num_refunds is not an integer', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 1.5,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })    
    it('should return "" when no num_refunds', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,          
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,          
          fee: '40'
        },
      ];

      const updatedSQL = getUpdateManyRefundsSQL(mockBrktEntries);
      expect(updatedSQL).toEqual(''); 
    })
  })

  describe('getInsertManyRefundsSQL', () => { 

    it('should get valid insert SQL', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 10,
          num_refunds: 3,
          fee: '50',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 10,
          num_refunds: 3,
          fee: '50',
          time_stamp: 1739259269537
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Refund" (brkt_entry_id, num_refunds) ` +
        `SELECT b2up.brkt_entry_id, b2up.num_refunds ` +
        `FROM (VALUES ` +
          `('ben_a123456789abcdef0123456789abcdef', 3), ` +
          `('ben_a133456789abcdef0123456789abcdef', 3)` +
          `) AS b2up(brkt_entry_id, num_refunds) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Refund" WHERE brkt_entry_id = b2up.brkt_entry_id);`;
      
      expect(insertSQL).toEqual(expected);
    })
    it('should return "" for invalid id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })
    it('should return "" when is valid, but not a brkt_entry id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })
    it('should return "" when num_refunds is too low', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: -1,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })
    it('should return "" when num_refunds is too high', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 1234567890,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })
    it('should return "" when num_refunds is higher than num_brackets', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 9,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })

    it('should return "" when num_refunds is not a number', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 'abc' as any,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })
    it('should return "" when num_refunds is not an integer', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 1.5,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })    
    it('should return "" when no num_refunds', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,          
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,          
          fee: '40'
        },
      ];

      const insertSQL = getInsertManyRefundsSQL(mockBrktEntries);
      expect(insertSQL).toEqual('');
    })

  })

  describe('getDeleteManyRefundsSQL', () => {

    it('should return valid delete SQL', () => {

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 10,
          num_refunds: 0,
          fee: '50',
          time_stamp: 1739259269537
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 10,
          num_refunds: 0,
          fee: '50',
          time_stamp: 1739259269537
        },
      ];

      const deleteSQL = getDeleteManyRefundsSQL(mockBrktEntries);
      const expected =
        `DELETE FROM public."Brkt_Refund" ` +
        `WHERE brkt_entry_id IN (` +
        `'ben_05ce0472be3d476ea1caa99dd05953fa', ` +
        `'ben_06ce0472be3d476ea1caa99dd05953fa'` +
        `);`;
      
      expect(deleteSQL).toEqual(expected);
    })
    it('should return "" for invalid id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const deleteSQL = getDeleteManyRefundsSQL(mockBrktEntries);
      expect(deleteSQL).toEqual('');
    })
    it('should return "" when is valid, but not a brkt_entry id', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const deleteSQL = getDeleteManyRefundsSQL(mockBrktEntries);
      expect(deleteSQL).toEqual('');
    })
    it('should return "" when num_refunds is not 0 or null', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 8,
          num_refunds: -1,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 0,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const deleteSQL = getDeleteManyRefundsSQL(mockBrktEntries);
      expect(deleteSQL).toEqual('');
    })
    it('should return "" when num_refunds is not a number', () => { 
      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          id: 'ben_05ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 'abc' as any,
          num_refunds: -1,
          fee: '40'
        },
        {
          ...initBrktEntry,
          id: 'ben_06ce0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
          num_brackets: 0,
          num_refunds: 3,
          fee: '40'
        },
      ];

      const deleteSQL = getDeleteManyRefundsSQL(mockBrktEntries);
      expect(deleteSQL).toEqual('');
    })

  })
  
})