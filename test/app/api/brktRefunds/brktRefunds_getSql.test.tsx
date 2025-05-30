import { getUpdateManySQL, getDeleteManySQL, getInsertManySQL, exportedForTesting } from "@/app/api/brktRefunds/many/getSql";
import { initBrktRefund } from "@/lib/db/initVals";
import { brktRefundType } from "@/lib/types/types";
import { maxBrackets } from "@/lib/validation";

const { getBrktIds } = exportedForTesting;

describe('getSql', () => {

  const squadId = 'sqd_1a6c885ee19a49489960389193e8f819';

  const testBrktRefunds = [
    {
      ...initBrktRefund,
      id: 'brf_01ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_refunds: 3,      
    },
    {
      ...initBrktRefund,
      id: 'brf_02ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
      num_refunds: 3,      
    },
    {
      ...initBrktRefund,
      id: 'brf_03ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      num_refunds: 5,       
    },
    {
      ...initBrktRefund,
      id: 'brf_04ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
      num_refunds: 5,
    },
    {
      ...initBrktRefund,
      id: 'brf_05ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
      player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
      num_refunds: 7,
      fee: '40'
    },
    {
      ...initBrktRefund,
      id: 'brf_06ee0472be3d476ea1caa99dd05953fa',
      brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
      player_id: 'ply_8bc2b34cf25e4081ba6a365e89ff49d8',
      num_refunds: 7,      
    },
  ]

  describe('getBrktIds()', () => { 
    it('should return array of unique brktIds', () => {
      const brktIds = getBrktIds(testBrktRefunds);
      expect(brktIds).toEqual(['brk_aa3da3a411b346879307831b6fdadd5f', 'brk_37345eb6049946ad83feb9fdbb43a307']);
    })
  })

  describe('getUpdateManySQL()', () => { 

    it('should return valid update SQL - 1 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);

      const expected =
        `UPDATE public."Brkt_Refund" ` +
        `SET num_refunds = CASE ` +
          `WHEN public."Brkt_Refund".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_refunds ` +
          `WHEN public."Brkt_Refund".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_refunds ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4)` +
          `) AS b2Up(brkt_id, player_id, num_refunds) ` +
        `WHERE public."Brkt_Refund".player_id = b2Up.player_id AND public."Brkt_Refund".brkt_id = b2Up.brkt_id;`;
      
      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 1 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);

      const expected =
        `UPDATE public."Brkt_Refund" ` +
        `SET num_refunds = CASE ` +
          `WHEN public."Brkt_Refund".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_refunds ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6)` +
          `) AS b2Up(brkt_id, player_id, num_refunds) ` +
        `WHERE public."Brkt_Refund".player_id = b2Up.player_id AND public."Brkt_Refund".brkt_id = b2Up.brkt_id;`;
      
      expect(updatedSQL).toEqual(expected);
    });
    it('should return valid update SQL - 2 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307__time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 6,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      const expected =
        `UPDATE public."Brkt_Refund" ` +
        `SET num_refunds = CASE ` +
          `WHEN public."Brkt_Refund".brkt_id = 'brk_aa3da3a411b346879307831b6fdadd5f' THEN b2Up.num_refunds ` +
          `WHEN public."Brkt_Refund".brkt_id = 'brk_37345eb6049946ad83feb9fdbb43a307' THEN b2Up.num_refunds ` +
        `END ` +
        `FROM (VALUES ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 6)` +
          `) AS b2Up(brkt_id, player_id, num_refunds) ` +
        `WHERE public."Brkt_Refund".player_id = b2Up.player_id AND public."Brkt_Refund".brkt_id = b2Up.brkt_id;`;

      expect(updatedSQL).toEqual(expected);
    });
    it('should return "" for invalid id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          id: '<script>alert("xss")</script>',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for id valid, but not a bracket refund id ', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          id: squadId,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid player_id, but not a player id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid brkt id, but not a brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: squadId,
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too high', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: maxBrackets + 1,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too low', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 0,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not an integer', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4.5,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not a number', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 'abc' as any,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktRefunds: brktRefundType[] = [];
      const updatedSQL = getUpdateManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getUpdateManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });

  })

  describe('getInsertManySQL()', () => { 

    it('should return valid insert SQL - 1 player 2 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          id: 'brf_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          id: 'brf_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktRefunds);
      const expected =
        `INSERT INTO public."Brkt_Refund" (id, brkt_id, player_id, num_refunds) ` +
        `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_refunds ` +
        `FROM (VALUES ` +
          `('brf_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brf_a133456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4)` +
          `) AS b2up(id, brkt_id, player_id, num_refunds) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Refund" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 1 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          id: 'brf_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          id: 'brf_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktRefunds);
      const expected =
      `INSERT INTO public."Brkt_Refund" (id, brkt_id, player_id, num_refunds) ` +
      `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_refunds ` +
      `FROM (VALUES ` +
        `('brf_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
        `('brf_a143456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6)` +
        `) AS b2up(id, brkt_id, player_id, num_refunds) ` +
      `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Refund" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return valid insert SQL - 2 player 2 brackets', () => {
      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          id: 'brf_a123456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          id: 'brf_a133456789abcdef0123456789abcdef',
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          id: 'brf_a143456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
        {
          ...initBrktRefund,
          id: 'brf_a153456789abcdef0123456789abcdef',
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 6,
        },
      ];

      const insertSQL = getInsertManySQL(mockBrktRefunds);
      const expected =
        `INSERT INTO public."Brkt_Refund" (id, brkt_id, player_id, num_refunds) ` +
        `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_refunds ` +
        `FROM (VALUES ` +
          `('brf_a123456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brf_a133456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa', 4), ` +
          `('brf_a143456789abcdef0123456789abcdef', 'brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136', 6), ` +
          `('brf_a153456789abcdef0123456789abcdef', 'brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136', 6)` +
          `) AS b2up(id, brkt_id, player_id, num_refunds) ` +
        `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Refund" WHERE id = b2up.id);`;
      
      expect(insertSQL).toEqual(expected);
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid player_id, but not a player id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid brkt id, bit not a brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: squadId,
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too high', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: maxBrackets + 1,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too low', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 0,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not an integer', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4.5,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not a number', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 'abc' as any,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktRefunds: brktRefundType[] = [];
      const updatedSQL = getInsertManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getInsertManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });
  })

  describe('getDeleteManySQL', () => { 

    it('should return valid update SQL - 1 player 2 brackets', () => {

      const mockRows = [
        {
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktRefunds);
      const expected =
        `DELETE FROM public."Brkt_Refund" ` +
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
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktRefunds);
      const expected =
        `DELETE FROM public."Brkt_Refund" ` +
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
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 4,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 20,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 4,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 20,
          brk_37345eb6049946ad83feb9fdbb43a307_time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
        {
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brk_aa3da3a411b346879307831b6fdadd5f_brkts: 6,
          brk_aa3da3a411b346879307831b6fdadd5f_fee: 30,
          brk_aa3da3a411b346879307831b6fdadd5f_time_stamp: 1739259269537,
          brk_aa3da3a411b346879307831b6fdadd5f_refunds: 0,
          brk_37345eb6049946ad83feb9fdbb43a307_brkts: 6,
          brk_37345eb6049946ad83feb9fdbb43a307_fee: 30,
          brk_37345eb6049946ad83feb9fdbb43a307__time_stamp: 1739259269537,
          brk_37345eb6049946ad83feb9fdbb43a307_refunds: 0,
        },
      ];

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 6,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_be57bef21fc64d199c2f6de4408bd136',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 6,
        },
      ];

      const deleteSQL = getDeleteManySQL(mockBrktRefunds);
      const expected =
        `DELETE FROM public."Brkt_Refund" ` +
        `WHERE (brkt_id, player_id) IN ( ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_88be0472be3d476ea1caa99dd05953fa'), ` +
          `('brk_aa3da3a411b346879307831b6fdadd5f', 'ply_be57bef21fc64d199c2f6de4408bd136'), ` +
          `('brk_37345eb6049946ad83feb9fdbb43a307', 'ply_be57bef21fc64d199c2f6de4408bd136')` +
        `);`;
      expect(deleteSQL).toEqual(expected);
    });
    it('should return "" for invalid player_id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: '<script>alert("xss")</script>',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid player_id, but not a player id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,
          player_id: squadId,
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for invalid brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: '<script>alert("xss")</script>',
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for valid brkt id, but not a brkt id', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: squadId,
          num_refunds: 4,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too high', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: maxBrackets + 1,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds too low', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 0,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not an integer', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 1.5,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" for num_refunds not a number', () => {

      const mockBrktRefunds: brktRefundType[] = [
        {
          ...initBrktRefund,          
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_aa3da3a411b346879307831b6fdadd5f',
          num_refunds: 'abc' as any,
        },
        {
          ...initBrktRefund,
          player_id: 'ply_88be0472be3d476ea1caa99dd05953fa',
          brkt_id: 'brk_37345eb6049946ad83feb9fdbb43a307',
          num_refunds: 4,
        },
      ];

      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed empty array', () => {
      const mockBrktRefunds: brktRefundType[] = [];
      const updatedSQL = getDeleteManySQL(mockBrktRefunds);
      expect(updatedSQL).toEqual('');
    });
    it('should return "" when passed null', () => {      
      const updatedSQL = getDeleteManySQL(null as any);
      expect(updatedSQL).toEqual('');
    });

  })
  
})