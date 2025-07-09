import { exportedForTesting, sanitizeOneBrkt, validateOneBrkt, validateOneBrkts } from "@/app/api/oneBrkts/valildate";
import { initOneBrkt } from "@/lib/db/initVals";
import { ErrorCode } from "@/lib/validation";
import { mockOneBrktsToPost } from "../../../mocks/tmnts/singlesAndDoubles/mockSquads";
import { cloneDeep } from "lodash";
import { validOneBrktsType } from "@/lib/types/types";

const { gotOneBrktData, validBindex, validOneBrktData } = exportedForTesting;

const userId = "usr_00000000000000000000000000000000";
const validOneBrkt = {
  ...initOneBrkt,
  brkt_id: 'brk_5109b54c2cc44ff9a3721de42c80c8c1',
  bindex: 0,
}

describe("tests for one bracket validation", () => {

  describe('gotOneBrktData function', () => {
    it('returns None when all required fields are present', () => {
      expect(gotOneBrktData(validOneBrkt)).toBe(ErrorCode.None);
    });
    it('should return ErrorCode.MissingData when brkt_id is missing', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        brkt_id: null as any
      }
      expect(gotOneBrktData(testOneBrkt)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when bindex is missing', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: null as any
      }
      expect(gotOneBrktData(testOneBrkt)).toBe(ErrorCode.MissingData);
    })
    it('returns MissingData when oneBrkt is null or undefined', () => {
      expect(gotOneBrktData(null as any)).toBe(ErrorCode.MissingData);
      expect(gotOneBrktData(undefined as any)).toBe(ErrorCode.MissingData);
    });
    it('returns MissingData when bindex is not a number', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: 'not a number' as any,
      };
      expect(gotOneBrktData(testOneBrkt)).toBe(ErrorCode.MissingData);
    });
  });
  
  describe('validBIndex function', () => { 
    it('should return true for valid bindex', () => {
      expect(validBindex(0)).toBe(true);
      expect(validBindex(100)).toBe(true);
      expect(validBindex(Number.MAX_SAFE_INTEGER)).toBe(true);
    });
    it('should return false for negative bindex', () => {
      expect(validBindex(-1)).toBe(false);
    });
    it('should return false for non-integer bindex', () => {
      expect(validBindex(1.5)).toBe(false);
      expect(validBindex(Number.MAX_SAFE_INTEGER + 1)).toBe(false);
    });
    it('should return false for non-number bindex', () => {
      expect(validBindex('not a number' as any)).toBe(false);
      expect(validBindex(null as any)).toBe(false);
      expect(validBindex(undefined as any)).toBe(false);
      expect(validBindex(NaN)).toBe(false);
    });
  });

  describe('validOneBrktData function', () => {
    it('should return None for valid oneBrkt', () => {
      expect(validOneBrktData(validOneBrkt)).toBe(ErrorCode.None);
    });
    it('should return InvalidData for null oneBrkt', () => {
      expect(validOneBrktData(null as any)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for invalid id', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        id: 'invalid_id',
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for valid id, but not a oneBrkt id', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        id: userId,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for invalid brkt_id', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        brkt_id: 'invalid_brkt_id',
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for valid brkt_id, but not a bracket id', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        brkt_id: userId,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for non-integer bindex', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: 1.5,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for non-number bindex', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: 'not a number' as any,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for bindex too high', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: Number.MAX_SAFE_INTEGER + 1,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for bindex too low', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: -1,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for bindex is undefined', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: undefined as any,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });
    it('should return InvalidData for bindex is null', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: null as any,
      };
      expect(validOneBrktData(testOneBrkt)).toBe(ErrorCode.InvalidData);
    });    
  });

  describe('sanitizeOneBrkt function', () => {
    it('should return a sanitized oneBrkt with valid fields', () => {
      const sanitized = sanitizeOneBrkt(validOneBrkt);
      expect(sanitized).toEqual({
        ...initOneBrkt,
        id: validOneBrkt.id,
        brkt_id: validOneBrkt.brkt_id,
        bindex: validOneBrkt.bindex,
      });
    });
    it('should return a sanitized oneBrkt when id is not sanitized', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        id: '<script>id</script>',
      };
      const sanitized = sanitizeOneBrkt(testOneBrkt);
      expect(sanitized.id).toEqual('');
    });
    it('should return a sanitized oneBrkt when brkt_id is not sanitized', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        brkt_id: '<script>brk</script>',
      };
      const sanitized = sanitizeOneBrkt(testOneBrkt);
      expect(sanitized.brkt_id).toEqual('');
    });
    it('should return a sanitized oneBrkt when brkt_id is not sanitized', () => {
      const testOneBrkt = {
        ...validOneBrkt,
        bindex: Number.MAX_SAFE_INTEGER + 1,
      };
      const sanitized = sanitizeOneBrkt(testOneBrkt);
      expect(sanitized.bindex).toBeUndefined();
    });
  });

  describe('validateOneBrkt function', () => {

    describe('validateOneBrkt function - valid data', () => { 
      it('should return None for valid oneBrkt', () => {
        expect(validateOneBrkt(validOneBrkt)).toBe(ErrorCode.None);
      });
    })
    describe('validateOneBrkt function - missing data', () => { 
      it('should return MissingData for null oneBrkt', () => {
        expect(validateOneBrkt(null as any)).toBe(ErrorCode.MissingData);
      });
      it('should return MissingData for non-number bindex', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          bindex: 'not a number' as any,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.MissingData);
      });
      it('should return MissingData for bindex is undefined', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          bindex: undefined as any,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.MissingData);
      });
    })
    describe('validateOneBrkt function - invalid data', () => { 
      it('should return InvalidData for invalid id', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          id: 'invalid_id',
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for valid id, but not a oneBrkt id', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          id: userId,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for invalid brkt_id', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          brkt_id: 'invalid_brkt_id',
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for valid brkt_id, but not a bracket id', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          brkt_id: userId,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for non-integer bindex', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          bindex: 1.5,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for bindex too high', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          bindex: Number.MAX_SAFE_INTEGER + 1,
        };
        expect(validateOneBrkt(testOneBrkt
        )).toBe(ErrorCode.InvalidData);
      });
      it('should return InvalidData for bindex too low', () => {
        const testOneBrkt = {
          ...validOneBrkt,
          bindex: -1,
        };
        expect(validateOneBrkt(testOneBrkt)).toBe(ErrorCode.InvalidData);
      });
    })
  });

  describe('validateOneBrkts function', () => { 

    it('should validate oneBrkts with valid data', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(toValidate.length);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.None);
      for (let i = 0; i < validOneBrkts.oneBrkts.length; i++) {
        expect(validOneBrkts.oneBrkts[i].id).toBe(toValidate[i].id);
        expect(validOneBrkts.oneBrkts[i].brkt_id).toBe(toValidate[i].brkt_id);
        expect(validOneBrkts.oneBrkts[i].bindex).toBe(toValidate[i].bindex);
      }
    });
    it('should return MissingData when oneBrkts is null', () => {
      const validOneBrkts: validOneBrktsType = validateOneBrkts(null as any);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when oneBrkts is empty', () => {
      const validOneBrkts: validOneBrktsType = validateOneBrkts([]);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when oneBrkts is not an array', () => {
      const validOneBrkts: validOneBrktsType = validateOneBrkts({} as any);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with invalid id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].id = 'invalid_id';
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with valid id, but not a oneBrkt id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].id = userId
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with no id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].id = '';
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with invalid brkt_id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].brkt_id = 'invalid_brkt_id';
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with valid brkt_id, but not a brkt_id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].brkt_id = userId;
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with missing brkt_id', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].brkt_id = '';
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with index that is not a number', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].bindex = 'not a number' as any;
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with index that is too high', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].bindex = Number.MAX_SAFE_INTEGER + 1;
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with index that is not a number', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].bindex = -1;
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
    it('should return MissingData when there is a oneBrkt with no index', () => {
      const toValidate = cloneDeep(mockOneBrktsToPost);
      toValidate[0].bindex = undefined as any;
      const validOneBrkts: validOneBrktsType = validateOneBrkts(toValidate);
      expect(validOneBrkts).toBeDefined();
      expect(validOneBrkts.oneBrkts.length).toBe(0);
      expect(validOneBrkts.errorCode).toBe(ErrorCode.MissingData);
    });
  })

});