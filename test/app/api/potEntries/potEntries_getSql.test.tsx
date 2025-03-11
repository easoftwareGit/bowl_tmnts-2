import { potEntryType } from "@/lib/types/types";
import { initPotEntry } from "@/lib/db/initVals";
import { mockPotEntriesToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { getDeleteManySQL, getInsertManySQL, getUpdateManySQL, exportedForTesting } from "@/app/api/potEntries/many/getSql";

const { getPotIds } = exportedForTesting;

describe('getSql', () => {

  const squadId = 'sqd_1a6c885ee19a49489960389193e8f819';

  const testPotEntries = [
    {
      ...mockPotEntriesToPost[0],
    },
    {
      ...mockPotEntriesToPost[1],
    },
    {
      ...initPotEntry,
      id: 'pen_03be0472be3d476ea1caa99dd05953fa',
      pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      fee: '10'
    },
    {
      ...initPotEntry,
      id: 'pen_04be0472be3d476ea1caa99dd05953fa',
      pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      fee: '10'
    },
  ]

  describe('getPotIds', () => { 

    it('should return array of unique potIds', () => { 
      const potIds = getPotIds(testPotEntries);      
      expect(potIds).toEqual(['pot_98b3a008619b43e493abf17d9f462a65', 'pot_ab80213899ea424b938f52a062deacfe']);      
    })
  })

  describe('getUpdateManySQL', () => { 

    // beforeAll(async () => {
    //   await deleteAllPotEntriesForSquad(squadId);      
    //   await postManyPotEntries(testPotEntries);
    // })

    // afterAll(async () => {
    //   await deleteAllPotEntriesForSquad(squadId);
    // })

    it('should return valid update SQL - 1 player 2 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
        //   pot_ab80213899ea424b938f52a062deacfe_fee: 19
        // },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      const expected = 
        `UPDATE public."Pot_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Pot_Entry".pot_id = 'pot_98b3a008619b43e493abf17d9f462a65' THEN p2Up.fee ` +
	        `WHEN public."Pot_Entry".pot_id = 'pot_ab80213899ea424b938f52a062deacfe' THEN p2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
          `('pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa', 19)` +
          `) AS p2Up(pot_id, player_id, fee) ` +
        `WHERE public."Pot_Entry".player_id = p2Up.player_id AND public."Pot_Entry".pot_id = p2Up.pot_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 1 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      const expected = 
        `UPDATE public."Pot_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Pot_Entry".pot_id = 'pot_98b3a008619b43e493abf17d9f462a65' THEN p2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
          `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136', 9)` +
          `) AS p2Up(pot_id, player_id, fee) ` +
        `WHERE public."Pot_Entry".player_id = p2Up.player_id AND public."Pot_Entry".pot_id = p2Up.pot_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return valid update SQL - 2 player 2 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      const expected = 
        `UPDATE public."Pot_Entry" ` +
        `SET fee = CASE ` +
          `WHEN public."Pot_Entry".pot_id = 'pot_98b3a008619b43e493abf17d9f462a65' THEN p2Up.fee ` +
	        `WHEN public."Pot_Entry".pot_id = 'pot_ab80213899ea424b938f52a062deacfe' THEN p2Up.fee ` +
        `END ` +
        `FROM (VALUES ` +
	        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
          `('pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa', 19), ` +
	        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136', 9), ` +
          `('pot_ab80213899ea424b938f52a062deacfe', 'ply_be57bef21fc64d199c2f6de4408bd136', 19)` +
          `) AS p2Up(pot_id, player_id, fee) ` +
        `WHERE public."Pot_Entry".player_id = p2Up.player_id AND public."Pot_Entry".pot_id = p2Up.pot_id;`;

      expect(updateSQL).toBe(expected);
    })
    it('should return return "" when player_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: '<script>alert("xss")</script>',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when div_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: '<script>alert("xss")</script>',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too high', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '1234567890'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too low', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '-1'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed empty pot entries', () => { 

      const mockPotEntries: potEntryType[] = [];

      const updateSQL = getUpdateManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed null', () => { 
      const updateSQL = getUpdateManySQL(null as any);
      expect(updateSQL).toBe('');
    })

  })

  describe('getInsertManySQL', () => { 

    // beforeAll(async () => {
    //   await deleteAllPotEntriesForSquad(squadId);
    // })

    // afterEach(async () => {
    //   await deleteAllPotEntriesForSquad(squadId);
    // })

    it('should return valid insert SQL - 1 player 2 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
        //   pot_ab80213899ea424b938f52a062deacfe_fee: 19
        // },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const insertSQL = getInsertManySQL(mockPotEntries);
      const expected = 
      `INSERT INTO public."Pot_Entry" (id, pot_id, player_id, fee) ` +
      `SELECT p2up.id, p2up.pot_id, p2up.player_id, p2up.fee ` +
      `FROM (VALUES ` +
        `('pen_a123456789abcdef0123456789abcdef', 'pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
        `('pen_a133456789abcdef0123456789abcdef', 'pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa', 19)` +
        `) AS p2up(id, pot_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Pot_Entry" WHERE id = p2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 player 1 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
      ];

      const insertSQL = getInsertManySQL(mockPotEntries);
      const expected = 
      `INSERT INTO public."Pot_Entry" (id, pot_id, player_id, fee) ` +
      `SELECT p2up.id, p2up.pot_id, p2up.player_id, p2up.fee ` +
      `FROM (VALUES ` +
        `('pen_a123456789abcdef0123456789abcdef', 'pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
        `('pen_a143456789abcdef0123456789abcdef', 'pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136', 9)` +
        `) AS p2up(id, pot_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Pot_Entry" WHERE id = p2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return valid insert SQL - 2 player 1 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
        {
          ...initPotEntry,
          id: 'pen_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a153456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const insertSQL = getInsertManySQL(mockPotEntries);
      const expected = 
      `INSERT INTO public."Pot_Entry" (id, pot_id, player_id, fee) ` +
      `SELECT p2up.id, p2up.pot_id, p2up.player_id, p2up.fee ` +
      `FROM (VALUES ` +
        `('pen_a123456789abcdef0123456789abcdef', 'pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa', 9), ` +
        `('pen_a133456789abcdef0123456789abcdef', 'pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa', 19), ` +
        `('pen_a143456789abcdef0123456789abcdef', 'pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136', 9), ` +
        `('pen_a153456789abcdef0123456789abcdef', 'pot_ab80213899ea424b938f52a062deacfe', 'ply_be57bef21fc64d199c2f6de4408bd136', 19)` +
        `) AS p2up(id, pot_id, player_id, fee) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Pot_Entry" WHERE id = p2up.id);`
  
      expect(insertSQL).toBe(expected);
    })
    it('should return return "" when id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when player_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: '<script>alert("xss")</script>',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when pot_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: '<script>alert("xss")</script>',
          fee: '9'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too high', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '1234567890'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too low', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: 'pen_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '-1'
        },
        {
          ...initPotEntry,
          id: 'pen_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed empty pot entries', () => { 

      const mockPotEntries: potEntryType[] = [];

      const updateSQL = getInsertManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed null', () => { 
      const updateSQL = getInsertManySQL(null as any);
      expect(updateSQL).toBe('');
    })

  })

  describe('getDeleteManySQL', () => { 

    it('should return valid delete SQL - 1 player 2 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        // {
        //   player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
        //   pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
        //   pot_ab80213899ea424b938f52a062deacfe_fee: 19
        // },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockPotEntries);
      const expected = 
      `DELETE FROM public."Pot_Entry" ` +
      `WHERE (pot_id, player_id) IN ( ` +
        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa')` +    
      `);`
  
      expect(deleteSQL).toBe(expected);
    })
    it('should return valid delete SQL - 2 player 1 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          // pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockPotEntries);
      const expected = 
      `DELETE FROM public."Pot_Entry" ` +
      `WHERE (pot_id, player_id) IN ( ` +
        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136')` +    
      `);`
  
      expect(deleteSQL).toBe(expected);
    })
    it('should return valid delete SQL - 2 player 2 pots', () => { 

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_98b3a008619b43e493abf17d9f462a65_fee: 9,
          pot_ab80213899ea424b938f52a062deacfe_fee: 19
        },
      ];

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const deleteSQL = getDeleteManySQL(mockPotEntries);
      const expected = 
      `DELETE FROM public."Pot_Entry" ` +
      `WHERE (pot_id, player_id) IN ( ` +
        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('pot_ab80213899ea424b938f52a062deacfe', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
        `('pot_98b3a008619b43e493abf17d9f462a65', 'ply_be57bef21fc64d199c2f6de4408bd136'), ` +
        `('pot_ab80213899ea424b938f52a062deacfe', 'ply_be57bef21fc64d199c2f6de4408bd136')` +    
      `);`

      expect(deleteSQL).toBe(expected);
    })
    it('should return return "" when player_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: '<script>alert("xss")</script>',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when div_id is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: '<script>alert("xss")</script>',
          fee: '9'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is invalid', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '<script>alert("xss")</script>'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too high', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '1234567890'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when fee is too low', () => { 

      const mockPotEntries: potEntryType[] = [
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_98b3a008619b43e493abf17d9f462a65',
          fee: '-1'
        },
        {
          ...initPotEntry,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          pot_id: 'pot_ab80213899ea424b938f52a062deacfe',
          fee: '19'
        },
      ];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed empty pot entries', () => { 

      const mockPotEntries: potEntryType[] = [];

      const updateSQL = getDeleteManySQL(mockPotEntries);
      expect(updateSQL).toBe('');
    })
    it('should return return "" when passed null', () => { 
      const updateSQL = getDeleteManySQL(null as any);
      expect(updateSQL).toBe('');
    })

  })

})