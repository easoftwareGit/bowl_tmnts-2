import { exportedForTesting, validBrktRefundNumRefunds, sanitizeBrktRefund, validateBrktRefund, validateBrktRefunds } from "@/app/api/brktRefunds/validate";
import { initBrktRefund } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation";
import { mockBrktRefundsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { validBrktRefundsType } from "@/lib/types/types";
import { cloneDeep } from "lodash";

const { gotBrktRefundData, validBrktRefundData } = exportedForTesting;

const validBrktRefund = {
  ...initBrktRefund,
  id: "brf_bc4c581d7b1c4fc99dbdbd46f4f7210a",
  brkt_id: "brk_5109b54c2cc44ff9a3721de42c80c8c1",          
  player_id: "ply_88be0472be3d476ea1caa99dd05953fa",
  num_refunds: 5,
}

const userId = "usr_01234567890123456789012345678901";

describe("tests for brktRefund validation", () => { 

  describe('gotBrktRefundData()', () => { 

    it('should return ErrorCode.None when all data is present', () => {
      const errorCode = gotBrktRefundData(validBrktRefund);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData when id is missing', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        id: null as any
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when brkt_id is missing', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: null as any
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is missing', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: null as any
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when num_refunds is missing', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: null as any
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when id is blank', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        id: ''
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when brkt_id is blank', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: ''
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when player_id is blank', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: ''
      }
      const errorCode = gotBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.MissingData);
    })    
  })

  describe('validBrktEntryNumRefunds()', () => { 

    it('should return true when num_refunds is valid', () => {            
      expect(validBrktRefundNumRefunds(validBrktRefund.num_refunds)).toBe(true);
    })
    it('should return false when num_refunds is null', () => {      
      expect(validBrktRefundNumRefunds(null as any)).toBe(false);
    })
    it('should return false when num_refunds is undefined', () => {
      expect(validBrktRefundNumRefunds(undefined as any)).toBe(false);
    })
    it('should return false when num_refunds is not a number', () => {      
      expect(validBrktRefundNumRefunds('abc' as any)).toBe(false);
    })
    it('should return false when num_refunds is too low', () => {      
      expect(validBrktRefundNumRefunds(0)).toBe(false);
    })
    it('should return false when num_refunds is too big', () => {       
      expect(validBrktRefundNumRefunds(1234567890)).toBe(false);
    })
    it('should retur true when num_refunds has non integer decimal', () => {       
      expect(validBrktRefundNumRefunds(1.1)).toBe(false);
    })
  })

  describe('validBrktRefundData()', () => { 
    it('should return ErrorCode.None when all data is valid', () => {
      const errorCode = validBrktRefundData(validBrktRefund);
      expect(errorCode).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        id: 'abc'
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when id is a valid id, but not a brktEntry id', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        id: userId
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is blank', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        id: ''
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is null', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is undefined', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when brkt_id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: 'abc'
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when brkt_id is a valid id, but not a brktEntry id', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: userId
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when brkt_id is blank', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: ''
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when brkt_id is null', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when brkt_id is undefined', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when player_id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: 'abc'
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: userId
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is blank', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: ''
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is null', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when player_id is undefined', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when num_refunds is not a number', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: 'abc' as any
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is too low', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: -1
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is too high', () => {  
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: 1234567890
      }
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is null', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is undefined', () => {
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: null as any
      } 
      const errorCode = validBrktRefundData(testBrktRefund);
      expect(errorCode).toBe(ErrorCode.InvalidData);      
    })
  })

  describe('sanitizeBrktRefund()', () => { 
    it('should return a sanitized brktRefund', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund).toEqual(testBrktRefund);
    })
    it('should return a sanitized brktRefund when id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        id: 'abc'
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.id).toEqual('');
    })
    it('should return a sanitized brktRefund when brkt_id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        brkt_id: 'abc'
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund); 
      expect(sanitizedBrktRefund.brkt_id).toEqual('');
    })
    it('should return a sanitized brktRefund when player_id is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        player_id: 'abc'
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.player_id).toEqual('');
    })  
    it('should return a sanitized brktRefund when num_refunds is invalid', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: 'abc' as any
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.num_refunds).toEqual(0);
    })
    it('should return a sanitized brktRefund when num_refunds is too low', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: -1
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.num_refunds).toEqual(0);
    })
    it('should return a sanitized brktRefund when num_refunds is too high', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: 1234567890
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.num_refunds).toEqual(0);
    })
    it('should return a sanitized brktRefund when num_refunds is sanitzied', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        num_refunds: 1.1
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.num_refunds).toEqual(0);
    })
    it('should return a sanitized brktRefund when data is not sanitzied', () => { 
      const testBrktRefund = {
        ...validBrktRefund,
        id: '<script>alert(1)</script>',
        brkt_id: '<script>alert(1)</script>',
        player_id: '<script>alert(1)</script>',
        num_refunds: -1
      }
      const sanitizedBrktRefund = sanitizeBrktRefund(testBrktRefund);
      expect(sanitizedBrktRefund.id).toEqual('');
      expect(sanitizedBrktRefund.brkt_id).toEqual('');
      expect(sanitizedBrktRefund.player_id).toEqual('');      
      expect(sanitizedBrktRefund.num_refunds).toEqual(0); // sanitized, not valildated
    })    

  })

  describe('validateBrktRefund()', () => { 

    describe('valid data', () => { 
      it('should return ErrorCode.None when all data is valid', () => {
        const errorCode = validateBrktRefund(validBrktRefund);
        expect(errorCode).toBe(ErrorCode.None);
      })
    })
    describe('missing data', () => { 
      it('should return ErrorCode.MissingData when id is missing', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          id: null as any
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when brkt_id is missing', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          brkt_id: null as any
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when player_id is missing', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          player_id: null as any
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when num_refunds is missing', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          num_refunds: null as any
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.MissingData);
      })
    })
    describe('invalid data', () => { 
      it('should return ErrorCode.InvalidData when id is invalid', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          id: 'abc'
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when id is a valid id, but not a brktEntry id', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          id: userId
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when brkt_id is invalid', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          brkt_id: 'abc'
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when brkt_id is a valid id, but not a div id', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          brkt_id: userId
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is invalid', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          player_id: 'abc'
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when player_id is a valid id, but not a player id', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          player_id: userId
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when num_refunds is not a number', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          num_refunds: 'abc' as any
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when num_refunds is too low', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          num_refunds: -1
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when num_refunds is too high', () => {
        const testBrktRefund = {
          ...validBrktRefund,
          num_refunds: 1234567890
        }
        const errorCode = validateBrktRefund(testBrktRefund);
        expect(errorCode).toBe(ErrorCode.InvalidData);
      })
    })          
  })

  describe('validateBrktRefunds()', () => { 
    it('should return ErrorCode.None when all data is valid', () => {
      const brktRefundsToValidate = [...mockBrktRefundsToPost];

      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.None);
      expect(validBrktRefunds.brktRefunds.length).toBe(brktRefundsToValidate.length);
      for (let i = 0; i < validBrktRefunds.brktRefunds.length; i++) {
        expect(validBrktRefunds.brktRefunds[i].id).toBe(brktRefundsToValidate[i].id);        
        expect(validBrktRefunds.brktRefunds[i].brkt_id).toBe(brktRefundsToValidate[i].brkt_id);
        expect(validBrktRefunds.brktRefunds[i].player_id).toBe(brktRefundsToValidate[i].player_id);
        expect(validBrktRefunds.brktRefunds[i].num_refunds).toBe(brktRefundsToValidate[i].num_refunds);
      }
    })
    it('should return ErrorCode.InvalidData brktRefunds when data is not sanitized', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = 'abc' as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);      
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is sanitzied to ""', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].id = '<script>alert("xss")</script>'
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when brkt_id is sanitzied to ""', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].brkt_id = 'test'
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when player_id is sanitzied to ""', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].player_id = ''
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is not a number', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = 'abc' as any
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is invalid', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].id = 'abc'
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when id is valid, but not a brktEntry id', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].id = userId
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when brkt_id is invalid', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].brkt_id = 'abc'
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.MissingData when id is null', () => {
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].id = null as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.InvalidData when brkt_id is valid, but not a div id', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].brkt_id = userId
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when brkt_id is null', () => {
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].brkt_id = null as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.InvalidData when player_id is invalid', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].player_id = 'abc'
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when player_id is valid, but not a player id', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].player_id = userId
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when player_id is null', () => {
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].player_id = null as any;
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);      
    })
    it('should return ErrorCode.InvalidData when num_refunds is invalid', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = 'abc' as any
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is too low', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = -1
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when num_refunds is too high', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = 1234567890
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData when num_refunds is null', () => { 
      const brktRefundsToValidate = cloneDeep(mockBrktRefundsToPost);
      brktRefundsToValidate[1].num_refunds = null as any
      const validBrktRefunds: validBrktRefundsType = validateBrktRefunds(brktRefundsToValidate);
      expect(validBrktRefunds.errorCode).toBe(ErrorCode.MissingData);
    })
  })

})