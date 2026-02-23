import type { elimEntryType } from "@/lib/types/types";
import { initElimEntry } from "@/lib/db/initVals";
import { mockElimEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL, exportedForTesting } from "@/app/api/elimEntries/many/getSql";

const { getElimIds } = exportedForTesting;

describe('getSql', () => {

  const squadId = 'sqd_1a6c885ee19a49489960389193e8f819';

  const testElimEntries = [
    {
      ...mockElimEntriesToPost[0],
    },
    {
      ...mockElimEntriesToPost[1],
    },
    {
      ...initElimEntry,
      id: 'een_03be0472be3d476ea1caa99dd05953fa',
      elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '5'
    },
    {
      ...initElimEntry,
      id: 'een_04be0472be3d476ea1caa99dd05953fa',
      elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '5'
    },
  ]

  describe('getElimIds', () => { 

    it('should return an array of unique elimIds', () => { 
      const elimIds = getElimIds(testElimEntries);
      expect(elimIds).toEqual(['elm_b4c3939adca140898b1912b75b3725f8', 'elm_4f176545e4294a0292732cccada91b9d']);
    })
  })

  describe('getUpdateManySQL', () => { 

    // beforeAll(async () => {
    //   await deleteAllElimEntriesForSquad(squadId);      
    //   await postManyElimEntries(testElimEntries);
    // })

    // afterAll(async () => {
    //   await deleteAllElimEntriesForSquad(squadId);
    // })

    it('should return valid update SQL - 1 player 2 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5,
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
        //   elm_4f176545e4294a0292732cccada91b9d_fee: 5,
        // },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      const expected = 
        `UPDATE public."Elim_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Elim_Entry".elim_id = 'elm_b4c3939adca140898b1912b75b3725f8' THEN e2Up.fee ` +
	        `WHEN public."Elim_Entry".elim_id = 'elm_4f176545e4294a0292732cccada91b9d' THEN e2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
          `('elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa', 5)` +
          `) AS e2Up(elim_id, player_id, fee) ` +
        `WHERE public."Elim_Entry".player_id = e2Up.player_id AND public."Elim_Entry".elim_id = e2Up.elim_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 1 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      const expected = 
        `UPDATE public."Elim_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Elim_Entry".elim_id = 'elm_b4c3939adca140898b1912b75b3725f8' THEN e2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
          `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136', 5)` +
          `) AS e2Up(elim_id, player_id, fee) ` +
        `WHERE public."Elim_Entry".player_id = e2Up.player_id AND public."Elim_Entry".elim_id = e2Up.elim_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 2 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      const expected = 
        `UPDATE public."Elim_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Elim_Entry".elim_id = 'elm_b4c3939adca140898b1912b75b3725f8' THEN e2Up.fee ` +
	        `WHEN public."Elim_Entry".elim_id = 'elm_4f176545e4294a0292732cccada91b9d' THEN e2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
          `('elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
	        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136', 5), ` +
          `('elm_4f176545e4294a0292732cccada91b9d', 'ply_be57bef21fc64d199c2f6de4408bd136', 5)` +
          `) AS e2Up(elim_id, player_id, fee) ` +
        `WHERE public."Elim_Entry".player_id = e2Up.player_id AND public."Elim_Entry".elim_id = e2Up.elim_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return "" if id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if player_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: '<script>alert("xss")</script>',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if elim_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: '<script>alert("xss")</script>',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too high', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '1234567890'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '-1'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })

  })

  describe('getInsertManySQL', () => { 

    // beforeEach(async () => {
    //   await deleteAllElimEntriesForSquad(squadId);            
    // })

    // afterAll(async () => {
    //   await deleteAllElimEntriesForSquad(squadId);
    // })

    it('should return valid insert SQL - 1 player 2 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
        //   elm_4f176545e4294a0292732cccada91b9d_fee: 5
        // },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: 'een_a123456789abcdef0123456789abcdef', 
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          id: 'een_a133456789abcdef0123456789abcdef', 
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const insertSQL = getInsertManySQL(mockElimEntries);
      const expected = 
      `INSERT INTO public."Elim_Entry" (id, elim_id, player_id, fee) ` +
      `SELECT e2up.id, e2up.elim_id, e2up.player_id, e2up.fee ` +
      `FROM (VALUES ` +
        `('een_a123456789abcdef0123456789abcdef', 'elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
        `('een_a133456789abcdef0123456789abcdef', 'elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa', 5)` +
        `) AS e2up(id, elim_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Elim_Entry" WHERE id = e2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 player 1 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: 'een_a123456789abcdef0123456789abcdef', 
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          id: 'een_a143456789abcdef0123456789abcdef', 
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
      ];

      const insertSQL = getInsertManySQL(mockElimEntries);
      const expected = 
      `INSERT INTO public."Elim_Entry" (id, elim_id, player_id, fee) ` +
      `SELECT e2up.id, e2up.elim_id, e2up.player_id, e2up.fee ` +
      `FROM (VALUES ` +
        `('een_a123456789abcdef0123456789abcdef', 'elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
        `('een_a143456789abcdef0123456789abcdef', 'elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136', 5)` +
        `) AS e2up(id, elim_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Elim_Entry" WHERE id = e2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 player 1 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: 'een_a123456789abcdef0123456789abcdef', 
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          id: 'een_a133456789abcdef0123456789abcdef', 
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
        {
          ...initElimEntry,
          id: 'een_a143456789abcdef0123456789abcdef', 
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          id: 'een_a153456789abcdef0123456789abcdef', 
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const insertSQL = getInsertManySQL(mockElimEntries);
      const expected = 
      `INSERT INTO public."Elim_Entry" (id, elim_id, player_id, fee) ` +
      `SELECT e2up.id, e2up.elim_id, e2up.player_id, e2up.fee ` +
      `FROM (VALUES ` +
        `('een_a123456789abcdef0123456789abcdef', 'elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
        `('een_a133456789abcdef0123456789abcdef', 'elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa', 5), ` +
        `('een_a143456789abcdef0123456789abcdef', 'elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136', 5), ` +
        `('een_a153456789abcdef0123456789abcdef', 'elm_4f176545e4294a0292732cccada91b9d', 'ply_be57bef21fc64d199c2f6de4408bd136', 5)` +
        `) AS e2up(id, elim_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Elim_Entry" WHERE id = e2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return "" if id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if player_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: '<script>alert("xss")</script>',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if elim_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: '<script>alert("xss")</script>',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too high', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '1234567890'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '-1'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getInsertManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })

  })

  describe('getDeleteManySQL', () => { 

    it('should return valid delete SQL - 1 player 2 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
        //   elm_4f176545e4294a0292732cccada91b9d_fee: 5
        // },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockElimEntries);
      const expected = 
      `DELETE FROM public."Elim_Entry" ` +
      `WHERE (elim_id, player_id) IN ( ` +
        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa')` +    
      `);`
  
      expect(deleteSQL).toBe(expected);
    })
    it('should return valid delete SQL - 2 player 1 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          // elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockElimEntries);
      const expected = 
      `DELETE FROM public."Elim_Entry" ` +
      `WHERE (elim_id, player_id) IN ( ` +
        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136')` +    
      `);`
  
      expect(deleteSQL).toBe(expected);
    })
    it('should return valid delete SQL - 2 player 2 elims', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elm_b4c3939adca140898b1912b75b3725f8_fee: 5,
          elm_4f176545e4294a0292732cccada91b9d_fee: 5
        },
      ];

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockElimEntries);
      const expected = 
      `DELETE FROM public."Elim_Entry" ` +
      `WHERE (elim_id, player_id) IN ( ` +
        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('elm_4f176545e4294a0292732cccada91b9d', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('elm_b4c3939adca140898b1912b75b3725f8', 'ply_be57bef21fc64d199c2f6de4408bd136'), ` +
        `('elm_4f176545e4294a0292732cccada91b9d', 'ply_be57bef21fc64d199c2f6de4408bd136')` +    
      `);`

      expect(deleteSQL).toBe(expected);
    })
    it('should return "" if id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getDeleteManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if player_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: '<script>alert("xss")</script>',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getDeleteManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if elim_id is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: '<script>alert("xss")</script>',
          fee: '5'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getDeleteManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is invalid', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getDeleteManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too high', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '1234567890'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => { 

      const mockElimEntries: elimEntryType[] = [
        {
          ...initElimEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_b4c3939adca140898b1912b75b3725f8',
          fee: '-1'
        },
        {
          ...initElimEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          elim_id: 'elm_4f176545e4294a0292732cccada91b9d',
          fee: '5'
        },
      ];

      const updateSQL = getUpdateManySQL(mockElimEntries);
      expect(updateSQL).toBe('');
    })

  })

})