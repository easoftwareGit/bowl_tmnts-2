import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL } from "@/app/api/brktEntries/many/getSQL";
import { deleteAllBrktEntriesForSquad, postManyBrktEntries } from "@/lib/db/brktEntries/dbBrktEntries";
import { initBrktEntry } from "@/lib/db/initVals";
import { brktEntryType } from "@/lib/types/types";

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
  ]

  describe('getUpdateManySQL()', () => { 

    // beforeAll(async () => {
    //   await deleteAllBrktEntriesForSquad(squadId);      
    //   await postManyBrktEntries(testBrktEntries);
    // })

    // afterAll(async () => {
    //   await deleteAllBrktEntriesForSquad(squadId);
    // })

    it('should return valid update SQL - 1 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
        //   brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
        //   brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
        //   brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        // },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.fee ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.fee ` +
        `END, ` +
        `num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_brackets ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4)` +
          `) AS b2Up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;

      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 1 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30'
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.fee ` +          
        `END, ` +
        `num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6)` +
          `) AS b2Up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;

      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 6,
          fee: '30'
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktEntries);
      const expected =
        `UPDATE public."Brkt_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.fee ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.fee ` +
        `END, ` +
        `num_brackets = CASE ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_brackets ` +
          `WHEN public."Brkt_Entry".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_brackets ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6)` +
          `) AS b2Up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`;

      expect(updatedSQL).toEqual(expected);
    });

  })

  describe('getInsertManySQL()', () => { 

    it('should return valid insert SQL - 1 player 2 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
        //   brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
        //   brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
        //   brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        // },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Entry" (brkt_id, player_id, fee, num_brackets) ` +
        `SELECT b2up.brkt_id, b2up.player_id, b2up.fee, b2up.num_brackets ` +
        `FROM (VALUES ` +
        `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
        `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4)` +
        `) AS b2up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE brkt_id = b2up.brkt_id AND player_id = b2up.player_id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 1 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30'
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Entry" (brkt_id, player_id, fee, num_brackets) ` +
        `SELECT b2up.brkt_id, b2up.player_id, b2up.fee, b2up.num_brackets ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6)` +
          `) AS b2up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE brkt_id = b2up.brkt_id AND player_id = b2up.player_id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 2 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 6,
          fee: '30'
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktEntries);
      const expected =
        `INSERT INTO public."Brkt_Entry" (brkt_id, player_id, fee, num_brackets) ` +
        `SELECT b2up.brkt_id, b2up.player_id, b2up.fee, b2up.num_brackets ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 20, 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 30, 6)` +
          `) AS b2up(brkt_id, player_id, fee, num_brackets) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE brkt_id = b2up.brkt_id AND player_id = b2up.player_id);`;
      
      expect(insertSQL).toEqual(expected);
    });

  })

  describe('getDeleteManySQL', () => { 

    it('should return valid update SQL - 1 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
        //   brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
        //   brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
        //   brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        // },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
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

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          // brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          // brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 6,
          fee: '30'
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

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_name: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307_name: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30
        },
      ];

      const mockBrktEntries: brktEntryType[] = [
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_brackets: 4,
          fee: '20'
        },
        {
          ...initBrktEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_brackets: 4,
          fee: '20'
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

  })
})