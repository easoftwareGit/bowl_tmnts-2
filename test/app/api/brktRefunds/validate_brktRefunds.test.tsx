import {
  exportedForTesting,
  validNumRefunds,
  sanitizeBrktRefund,
  validateBrktRefund,
  validateBrktRefunds,
} from "@/app/api/brktRefunds/validate";
import { initBrktRefund } from "@/lib/db/initVals";
import { ErrorCode, maxBrackets } from "@/lib/validation";
import { mockBrktRefundsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { validBrktRefundsType } from "@/lib/types/types";

const { gotBrktRefundData, validBrktRefundData } = exportedForTesting;

const userId = "usr_00000000000000000000000000000000";
const validBrktRefund = {
  ...initBrktRefund,
  brkt_entry_id: "ben_c0326ba58d3f4a7d950101a5674ce595",
  num_refunds: 2,  
};

describe("test for brktRefunds validation", () => { 

  describe("gotBrktRefundData function", () => {
    it("should return ErrorCode.None for valid brktRefund", () => {
      const result = gotBrktRefundData(validBrktRefund);
      expect(result).toEqual(ErrorCode.None);
    });
    it("should return ErrorCode.MissingData for missing brkt_entry_id", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.brkt_entry_id = undefined as any;
      const result = gotBrktRefundData(testBrktRefund);
      expect(result).toEqual(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData for missing num_refunds", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = undefined as any;
      const result = gotBrktRefundData(testBrktRefund);
      expect(result).toEqual(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when num_refunds is not a number", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = "test" as any;
      const result = gotBrktRefundData(testBrktRefund);
      expect(result).toEqual(ErrorCode.MissingData);
    });
  });

  describe("validNumRefunds function", () => {
    it("should return true for valid num_refunds", () => {
      expect(validNumRefunds(1)).toEqual(true);
      expect(validNumRefunds(7)).toEqual(true);
    });
    it("should return false for 0 or negative num_refunds", () => {
      expect(validNumRefunds(0)).toEqual(false);
      expect(validNumRefunds(-1)).toEqual(false);
    });
    it("should return false invalid num_refunds", () => {
      expect(validNumRefunds(1.5)).toEqual(false);
      expect(validNumRefunds(maxBrackets + 1)).toEqual(false);
    });
    it("should return false for non-numbers num_refunds", () => {
      expect(validNumRefunds(null as any)).toEqual(false);
      expect(validNumRefunds(undefined as any)).toEqual(false);
      expect(validNumRefunds("not a number" as any)).toEqual(false);
      expect(validNumRefunds(NaN)).toEqual(false);
    });
  });

  describe("validBrktRefundData function", () => {
    it("should return ErrorCode.None for valid brktSeed", () => {
      expect(validBrktRefundData(validBrktRefund)).toEqual(ErrorCode.None);
    });
    it("should return InvalidData for null brktSeed", () => {
      expect(validBrktRefundData(null as any)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for invalid one_brkt_id", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.brkt_entry_id = "test";
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for vaild one_brkt_id, but not a oneBrkt id", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.brkt_entry_id = userId;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for one_brkt_id is blank", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.brkt_entry_id = "";
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for missing num_refunds", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = undefined as any;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for num_refunds not a number", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = "test" as any;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for num_refunds not an integer", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = 1.5;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for num_refunds too low", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = -1;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData for num_refunds too high", () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = maxBrackets + 1;
      expect(validBrktRefundData(testBrktRefund)).toEqual(ErrorCode.InvalidData);
    });
  });

  describe('sanitizeBrktRefund function', () => { 
    it('should return valid brktRefund', () => {
      const sanitzied = sanitizeBrktRefund(validBrktRefund);
      expect(sanitzied).toEqual({
        ...initBrktRefund,
        brkt_entry_id: validBrktRefund.brkt_entry_id,
        num_refunds: validBrktRefund.num_refunds,        
      });      
    });
    it('should return sanitized brktRefund when brkt_entry_id not sanitzied', () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.brkt_entry_id = '<script>id</script>';
      const sanitized = sanitizeBrktRefund(testBrktRefund);
      expect(sanitized.brkt_entry_id).toEqual('');
    });
    it('should return sanitized brktRefund when num_refunds not sanitzied', () => {
      const testBrktRefund = cloneDeep(validBrktRefund);
      testBrktRefund.num_refunds = Number.MAX_SAFE_INTEGER + 1;
      const sanitized = sanitizeBrktRefund(testBrktRefund);
      expect(sanitized.num_refunds).toBe(0);
    });
  })

  describe('validateBrktRefund function', () => {
    describe('validateBrktRefund function - valid data', () => { 
      it('should return ErrorCode.None for valid brktRefund', () => { 
        expect(validateBrktRefund(validBrktRefund)).toEqual(ErrorCode.None);  
      })      
    })
    describe('validateBrktRefund function - missing data', () => { 
      it('should return Missingdata for null brktRefund', () => { 
        expect(validateBrktRefund(null as any)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for blank brkt_entry_id', () => { 
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.brkt_entry_id = '';
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for missing brkt_entry_id', () => { 
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.brkt_entry_id = undefined as any;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for null brkt_entry_id', () => { 
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.brkt_entry_id = null as any;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for non-number num_refunds', () => { 
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.num_refunds = "test" as any;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.MissingData);
      })
      it('should return Missingdata for num_refunds undefined', () => { 
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.num_refunds = undefined as any;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.MissingData);
      })
    })
    describe('validateBrktRefund function - missing data', () => { 
      it('should return InvalidData for invalid brkt_entry_id', () => {        
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.brkt_entry_id = "test";
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData for valid brkt_entry_id, but not a one brkt id', () => {        
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.brkt_entry_id = userId;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when num_refunds is not an integer', () => {
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.num_refunds = 1.5;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when num_refunds is too low', () => {
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.num_refunds = -1;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.InvalidData);
      })
      it('should return InvalidData when num_refunds is too high', () => {
        const testBrktRefund = cloneDeep(validBrktRefund);
        testBrktRefund.num_refunds = maxBrackets + 1;
        expect(validateBrktRefund(testBrktRefund)).toEqual(ErrorCode.InvalidData);
      })
    })
  })

  describe('validateBrktRefunds function', () => {
    it('should validate brktRefunds with valid data', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(toValidate.length);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.None);
      for (let i = 0; i < validBrktRefunds.brktRefunds.length; i++) {
        expect(validBrktRefunds.brktRefunds[i].brkt_entry_id).toBe(toValidate[i].brkt_entry_id);
        expect(validBrktRefunds.brktRefunds[i].num_refunds).toBe(toValidate[i].num_refunds);        
      }
    });    
    it('should return MissingData when brktRefunds is null', () => {
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(null as any);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when brktRefunds is empty', () => {
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds([]);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when brktRefunds is not an array', () => {
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds({} as any);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktRefund with invalid brkt_entry_id', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].brkt_entry_id = "test";
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktRefund with valid brkt_entry_id, but not a one_bbrkt_id', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].brkt_entry_id = userId;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktRefund with blank brkt_entry_id', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[0].brkt_entry_id = "";
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a brktRefund with missing brkt_entry_id', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].brkt_entry_id = undefined as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return InvalidData when there is a brktRefund with num_refunds not a number', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].num_refunds = "test" as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData when there is a brktRefunds with num_refunds not an integer', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[0].num_refunds = 1.5;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData when there is a brktRefund with num_refunds too low', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].num_refunds = -1;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData when there is a brktRefund with num_refunds tto high', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[0].num_refunds = maxBrackets + 1;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(0);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData when there is a brktRefund with num_refunds is missing', () => {
      const toValidate = cloneDeep(mockBrktRefundsToPost);
      toValidate[1].num_refunds = undefined as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(toValidate);
      expect(validBrktRefunds).toBeDefined();
      expect(validBrktRefunds.brktRefunds.length).toBe(1);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    });
  })  

})