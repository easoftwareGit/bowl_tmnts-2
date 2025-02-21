import { divEntryType } from "@/lib/types/types";
import { getDeleteManySQL, getInsertManySQL,  getUpdateManySQL, exportedForTesting } from "@/app/api/divEntries/many/getSql";
import { initDivEntry } from "@/lib/db/initVals";
import { deleteAllDivEntriesForSquad, postManyDivEntries } from "@/lib/db/divEntries/dbDivEntries";

const { getDivIds } = exportedForTesting;

describe('getSql', () => {
  
  const hdcp_div_id = 'div_24b1cd5dee0542038a1244fc2978e862'

  const mockDivEntriesToPost: divEntryType[] = [
    {
      ...initDivEntry,
      id: "den_11be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      fee: '84',
    },
    {
      ...initDivEntry,
      id: "den_12be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      fee: '64',
    },
    {
      ...initDivEntry,
      id: "den_13be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '84',
    },
    {
      ...initDivEntry,
      id: "den_14be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '64',
    },
    {
      ...initDivEntry,
      id: "den_15be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id:'div_578834e04e5e4885bbae79229d8b96e8',
      player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
      fee: '84',
    },
    {
      ...initDivEntry,
      id: "den_16be0472be3d476ea1caa99dd05953fa",
      squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
      div_id:'div_578834e04e5e4885bbae79229d8b96e8',
      player_id: 'ply_8b0fd8bbd9e34d34a7fa90b4111c6e40',
      fee: '84',
    },
  ]

  const squadId = mockDivEntriesToPost[0].squad_id;

  describe('getDivIds', () => { 

    it('should return valid div ids', () => {
      const divIds = getDivIds(mockDivEntriesToPost);      
      expect(divIds).toEqual(['div_578834e04e5e4885bbae79229d8b96e8', 'div_24b1cd5dee0542038a1244fc2978e862']);
    })
  })

  describe('getUpdateManySQL', () => { 

    // beforeAll(async () => {
    //   await deleteAllDivEntriesForSquad(squadId);      
    //   await postManyDivEntries(mockDivEntriesToPost);
    // })

    // afterAll(async () => {
    //   await deleteAllDivEntriesForSquad(squadId);
    // })

    it('should return valid update SQL - 1 player 2 divs', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
        //   div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        // },
      ];

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);

      const expected =
        `UPDATE public."Div_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN d2Up.fee ` +          
          `WHEN public."Div_Entry".div_id = 'div_24b1cd5dee0542038a1244fc2978e862' THEN d2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` +
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_88be0472be3d476ea1caa99dd05953fa', 63)` +
          `) AS d2Up(div_id, player_id, fee) ` +
        `WHERE public."Div_Entry".player_id = d2Up.player_id AND public."Div_Entry".div_id = d2Up.div_id;`
    
      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 1 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63          
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63          
        },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);

      const expected =
        `UPDATE public."Div_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN d2Up.fee ` +                    
        `END ` +
        `FROM (VALUES ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_be57bef21fc64d199c2f6de4408bd136', 83)` +
          `) AS d2Up(div_id, player_id, fee) ` +
        `WHERE public."Div_Entry".player_id = d2Up.player_id AND public."Div_Entry".div_id = d2Up.div_id;`
    
      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 2 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);

      const expected =
        `UPDATE public."Div_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Div_Entry".div_id = 'div_578834e04e5e4885bbae79229d8b96e8' THEN d2Up.fee ` +          
          `WHEN public."Div_Entry".div_id = 'div_24b1cd5dee0542038a1244fc2978e862' THEN d2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` + 
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_88be0472be3d476ea1caa99dd05953fa', 63), ` + 
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_be57bef21fc64d199c2f6de4408bd136', 83), ` +
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_be57bef21fc64d199c2f6de4408bd136', 63)` +
          `) AS d2Up(div_id, player_id, fee) ` +
        `WHERE public."Div_Entry".player_id = d2Up.player_id AND public."Div_Entry".div_id = d2Up.div_id;`
    
      expect(updateSQL).toBe(expected);
    })
    it('should return "" if id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if player_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: '<script>alert(1)</script>',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if div_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: '<script>alert(1)</script>',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if squad_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: '<script>alert(1)</script>',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '<script>alert(1)</script>'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too high', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '1234567890'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '-1'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if divEntries is empty', () => {
      const mockDivEntries: divEntryType[] = [];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if divEntries is null', () => {
      const mockDivEntries: divEntryType[] = [];

      const updateSQL = getUpdateManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })

  })

  describe('getInsertManySQL2', () => {        

    it('should return valid insert SQL - 1 player 2 divs', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
        //   div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        // },
      ];

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: 'den_11be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          id: 'den_12be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      
      const expected = 
        `INSERT INTO public."Div_Entry" (id, div_id, squad_id, player_id, fee) ` +
        `SELECT d2up.id, d2up.div_id, d2up.squad_id, d2up.player_id, d2up.fee ` +
        `FROM (VALUES ` +
	        `('den_11be0472be3d476ea1caa99dd05953fa', 'div_578834e04e5e4885bbae79229d8b96e8', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` +
          `('den_12be0472be3d476ea1caa99dd05953fa', 'div_24b1cd5dee0542038a1244fc2978e862', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_88be0472be3d476ea1caa99dd05953fa', 63)` +  
          `) AS d2up(id, div_id, squad_id, player_id, fee) ` +
        `WHERE NOT EXISTS ` +
        `(SELECT 1 FROM public."Div_Entry" WHERE id = d2up.id);`
                
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 players 1 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: 'den_11be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          id: 'den_13be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
      ];

      const insertSQL = getInsertManySQL(mockDivEntries);

      const expected = 
        `INSERT INTO public."Div_Entry" (id, div_id, squad_id, player_id, fee) ` +
        `SELECT d2up.id, d2up.div_id, d2up.squad_id, d2up.player_id, d2up.fee ` +
        `FROM (VALUES ` +
          `('den_11be0472be3d476ea1caa99dd05953fa', 'div_578834e04e5e4885bbae79229d8b96e8', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` +
          `('den_13be0472be3d476ea1caa99dd05953fa', 'div_578834e04e5e4885bbae79229d8b96e8', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_be57bef21fc64d199c2f6de4408bd136', 83)` +
          `) AS d2up(id, div_id, squad_id, player_id, fee) ` +
        `WHERE NOT EXISTS ` +
        `(SELECT 1 FROM public."Div_Entry" WHERE id = d2up.id);`
                
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 players 2 div', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
      ];

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: 'den_11be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          id: 'den_12be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
        {
          ...initDivEntry,
          id: 'den_13be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          id: 'den_14be0472be3d476ea1caa99dd05953fa',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const insertSQL = getInsertManySQL(mockDivEntries);
      
      const expected = 
        `INSERT INTO public."Div_Entry" (id, div_id, squad_id, player_id, fee) ` +
        `SELECT d2up.id, d2up.div_id, d2up.squad_id, d2up.player_id, d2up.fee ` +
        `FROM (VALUES ` +
          `('den_11be0472be3d476ea1caa99dd05953fa', 'div_578834e04e5e4885bbae79229d8b96e8', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_88be0472be3d476ea1caa99dd05953fa', 83), ` +
          `('den_12be0472be3d476ea1caa99dd05953fa', 'div_24b1cd5dee0542038a1244fc2978e862', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_88be0472be3d476ea1caa99dd05953fa', 63), ` +
          `('den_13be0472be3d476ea1caa99dd05953fa', 'div_578834e04e5e4885bbae79229d8b96e8', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_be57bef21fc64d199c2f6de4408bd136', 83), ` +
          `('den_14be0472be3d476ea1caa99dd05953fa', 'div_24b1cd5dee0542038a1244fc2978e862', 'sqd_42be0f9d527e4081972ce8877190489d', 'ply_be57bef21fc64d199c2f6de4408bd136', 63)` +
          `) AS d2up(id, div_id, squad_id, player_id, fee) ` +
        `WHERE NOT EXISTS ` +
          `(SELECT 1 FROM public."Div_Entry" WHERE id = d2up.id);`
                
      expect(insertSQL).toBe(expected);
    })
    it('should return "" when id is invalid', () => {

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: '<script>alert(1)</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when player_id is invalid', () => {

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: '<script>alert(1)</script>',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when div_id is invalid', () => {

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: '<script>alert(1)</script>',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when squad_id is invalid', () => {

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: '<script>alert(1)</script>',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when fee is invalid', () => {

      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '<script>alert(1)</script>'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" if fee is too high', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '1234567890'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getInsertManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '-1'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getInsertManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" when divEntries is empty', () => {

      const mockDivEntries: divEntryType[] = [];
      const insertSQL = getInsertManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when divEntries is null', () => {      
      const insertSQL = getInsertManySQL(null as any);
      expect(insertSQL).toBe('');
    })

  })

  describe('getDeleteManySQL2', () => { 

    it('should return valid delete SQL - 1 player 2 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
        //   div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        // },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      
      const expected = 
        `DELETE FROM public."Div_Entry" ` +
        `WHERE (div_id, player_id) IN ( ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_88be0472be3d476ea1caa99dd05953fa')` +
        `);`
                  
      expect(deleteSQL).toBe(expected);
    })
    it('should return valid delete SQL - 2 players 1 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          // div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      
      const expected = 
        `DELETE FROM public."Div_Entry" ` +
        `WHERE (div_id, player_id) IN ( ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_be57bef21fc64d199c2f6de4408bd136')` +  
        `);`
                  
      expect(deleteSQL).toBe(expected);
    })    
    it('should return valid delete SQL - 2 playes 2 div', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_578834e04e5e4885bbae79229d8b96e8_fee: 83,
          div_24b1cd5dee0542038a1244fc2978e862_fee: 63
        },
      ];
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      
      const expected = 
        `DELETE FROM public."Div_Entry" ` +
        `WHERE (div_id, player_id) IN ( ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('div_578834e04e5e4885bbae79229d8b96e8', 'ply_be57bef21fc64d199c2f6de4408bd136'), ` +
          `('div_24b1cd5dee0542038a1244fc2978e862', 'ply_be57bef21fc64d199c2f6de4408bd136')` +
        `);`
                  
      expect(deleteSQL).toBe(expected);
    })
    it('should return "" when id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when player_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,          
          player_id: '<script>alert(1)</script>',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when div_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: '<script>alert(1)</script>',
          squad_id: squadId,
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when squad_id is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: '<script>alert(1)</script>',
          fee: '83'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      expect(deleteSQL).toBe('');
    })
    it('should return "" when fee is invalid', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: squadId,
          fee: '<script>alert(1)</script>'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: squadId,
          fee: '63'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockDivEntries);
      expect(deleteSQL).toBe('');
    })
    it('should return "" if fee is too high', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '1234567890'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getDeleteManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" if fee is too low', () => {
      const mockDivEntries: divEntryType[] = [
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_578834e04e5e4885bbae79229d8b96e8',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '-1'
        },
        {
          ...initDivEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          div_id: 'div_24b1cd5dee0542038a1244fc2978e862',
          squad_id: 'sqd_42be0f9d527e4081972ce8877190489d',
          fee: '63'
        },
      ];

      const updateSQL = getDeleteManySQL(mockDivEntries);
      expect(updateSQL).toBe('');
    })
    it('should return "" when divEntries is empty', () => {

      const mockDivEntries: divEntryType[] = [];
      const insertSQL = getDeleteManySQL(mockDivEntries);
      expect(insertSQL).toBe('');
    })
    it('should return "" when divEntries is null', () => {      
      const insertSQL = getDeleteManySQL(null as any);
      expect(insertSQL).toBe('');
    })

  })

})