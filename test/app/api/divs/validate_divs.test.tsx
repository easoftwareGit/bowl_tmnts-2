import {
  sanitizeDiv,
  validateDiv,
  validDivName,
  validHdcpPer,
  validHdcpFrom,
  validIntHdcp,
  validDivFkId,
  exportedForTesting,
  validHdcpFor,
  validateDivs
} from "@/app/api/divs/validate";
import { initDiv } from "@/lib/db/initVals";
import { divType, validDivsType } from "@/lib/types/types";
import { ErrorCode, maxEventLength, maxSortOrder } from "@/lib/validation";
import { mockDivs } from "../../../mocks/tmnts/twoDivs/mockDivs";

const { gotDivData, validDivData } = exportedForTesting;

const divId = 'div_f30aea2c534f4cfe87f4315531cef8ef'

const validScratchDiv: divType = {
  ...initDiv,
  tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",
  div_name: 'Scratch',
  hdcp_per: 0,
  hdcp_from: 230,
  int_hdcp: true,
  hdcp_for: 'Game',
  sort_order: 1,
}
const validHdcpDiv: divType = {
  ...initDiv,
  tmnt_id: "tmt_fd99387c33d9c78aba290286576ddce5",  
  div_name: 'Hdcp',
  hdcp_per: 0.90,
  hdcp_from: 230,
  int_hdcp: true,
  hdcp_for: 'Game',
  sort_order: 2,
}

describe('tests for div validation', () => { 

  describe('gotDivData function', () => { 
    
    it('should return ErrorCode.None for valid data - scratch', () => {
      expect(gotDivData(validScratchDiv)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.None for valid data - hdcp', () => {
      expect(gotDivData(validHdcpDiv)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.MissingData for missing div_name', () => {
      const invalidDiv = {
        ...validScratchDiv,
        div_name: '',
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing hdcp', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        hdcp_per: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing hdcp_from', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        hdcp_from: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing int_hdcp', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        int_hdcp: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing hdcp_for', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        hdcp_for: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing sort_order', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        sort_order: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for missing tmnt_id', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        tmnt_id: null as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for div_name all special characters', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        div_name: '*****((()))',
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData for invalid hdcp_for', () => {
      const invalidDiv = {
        ...validHdcpDiv,
        hdcp_for: 'Test' as any,
      }
      expect(gotDivData(invalidDiv)).toBe(ErrorCode.MissingData);
    })

  })

  describe('validDivName function', () => {    
    it('should return true when valid', () => { 
      expect(validDivName('Scratch')).toBe(true);
      expect(validDivName('Hdcp')).toBe(true);
      expect(validDivName('50+')).toBe(true); // allow '+' 
    })
    it('should return false when over max length', () => { 
      expect(validDivName('Scratch'.repeat(10))).toBe(false);      
    })
    it('should return false when empty', () => { 
      expect(validDivName('')).toBe(false);      
    })
    it('should sanitize div name', () => { 
      expect(validDivName('<script>alert(1)</script>')).toBe(true); // sanitizes to 'alert1'   
    })
    it('should return false when passed null', () => { 
      expect(validDivName(null as any)).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validDivName(undefined as any)).toBe(false);      
    })
  })

  describe('validHdcp function', () => {    
    it('should return true when valid', () => { 
      expect(validHdcpPer(1)).toBe(true);
      expect(validHdcpPer(0.9)).toBe(true);
      expect(validHdcpPer(0)).toBe(true);      
    })
    it('should return false when out of range', () => { 
      expect(validHdcpPer(-1)).toBe(false);      
      expect(validHdcpPer(200)).toBe(false);      
    })
    it('should return false when passed string', () => { 
      expect(validHdcpPer('1' as any)).toBe(false);
      expect(validHdcpPer('abc' as any)).toBe(false);
    })
    it('should return false when passed null', () => { 
      expect(validHdcpPer(null as any)).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validHdcpPer(undefined as any)).toBe(false);      
    })
  })

  describe('validHdcpFrom function', () => {    
    it('should return true when valid', () => { 
      expect(validHdcpFrom(230)).toBe(true);
      expect(validHdcpFrom(0)).toBe(true);
    })
    it('should return false when out of range', () => { 
      expect(validHdcpFrom(-1)).toBe(false);      
      expect(validHdcpFrom(301)).toBe(false);      
    })
    it('should return false when passed string', () => { 
      expect(validHdcpFrom('1' as any)).toBe(false);
      expect(validHdcpFrom('abc' as any)).toBe(false);
    })
    it('should return false when passed null', () => { 
      expect(validHdcpFrom(null as any)).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validHdcpFrom(undefined as any)).toBe(false);      
    })
  })

  describe('validIntHdcp function', () => {    
    it('should return true when valid', () => { 
      expect(validIntHdcp(true)).toBe(true);
      expect(validIntHdcp(false)).toBe(true);
    })
    it('should return false when passed string', () => { 
      expect(validIntHdcp('true' as any)).toBe(false);
      expect(validIntHdcp('false' as any)).toBe(false);
    })
    it('should return false when passed null', () => { 
      expect(validIntHdcp(null as any)).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validIntHdcp(undefined as any)).toBe(false);      
    })
  })  

  describe('validHdcpFor function', () => {    
    it('should return true when valid', () => { 
      expect(validHdcpFor('Game')).toBe(true);
      expect(validHdcpFor('Series')).toBe(true);
    })
    it('should return false when passed invalid valies', () => { 
      expect(validHdcpFor('Test')).toBe(false);
      expect(validHdcpFor('game')).toBe(false);
      expect(validHdcpFor('series')).toBe(false);
      expect(validHdcpFor(2 as any)).toBe(false);
    })
    it('should return false when passed null', () => { 
      expect(validHdcpFor(null as any)).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validHdcpFor(undefined as any)).toBe(false);      
    })
  })

  describe('validDivFkId function', () => { 
    it('should return true when valid', () => { 
      expect(validDivFkId('tmt_12345678901234567890123456789012', 'tmt')).toBe(true);
    })
    it('should return false when passed invalid values', () => { 
      expect(validDivFkId('tmt_12345678901234567890123456789012', 'bwl')).toBe(false);
      expect(validDivFkId('bwl_12345678901234567890123456789012', 'bwl')).toBe(false);
      expect(validDivFkId('abc', 'bwl')).toBe(false);      
    })
    it('should return false when passed null', () => { 
      expect(validDivFkId(null as any, 'evt')).toBe(false);      
    })
    it('should return false when passed undefined', () => { 
      expect(validDivFkId(undefined as any, 'evt')).toBe(false);      
    })
  })

  describe('validDivData function', () => { 
    it('should return ErrorCode.None when valid div data', () => { 
      expect(validDivData(validScratchDiv)).toBe(ErrorCode.None);
      expect(validDivData(validHdcpDiv)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.None when div_name is sanitied to a valid value', () => {
      const invalidDiv = {
        ...validScratchDiv,
        div_name: '<script>alert(1)</script>',
      }
      // sanitied to: alert1
      expect(validDivData(invalidDiv)).toBe(ErrorCode.None);
    })
    it('should return ErrorCode.InvalidData when tmnt_id is empty', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        tmnt_id: '',
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when tmnt_id is wrong type', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        tmnt_id: 'usr_12345678901234567890123456789012',
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_name is empty', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        div_name: '',
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_name is just special chars', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        div_name: '******',
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when div_name is too long', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        div_name: 'a'.repeat(maxEventLength + 1),
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp is empty', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_per: null as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp is too low', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_per: -1,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp is too high', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_per: 2,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp is not a number', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_per: 'abc' as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_from is empty', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_from: null as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_from is too low', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_from: -1,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_from is too high', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_from: 301,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_from is not a number', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_from: 'abc' as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when int_hdcp is empty', () => {
      const invalidDiv = {
        ...validScratchDiv,
        int_hdcp: null as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when int_hdcp is not a boolean', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        int_hdcp: 'abc' as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_for is empty', () => { 
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_for: null as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when hdcp_for is not valid', () => {
      const invalidDiv = {
        ...validScratchDiv,
        hdcp_for: 'abc' as any,
      }
      expect(validDivData(invalidDiv)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when passed null', () => { 
      expect(validDivData(null as any)).toBe(ErrorCode.InvalidData);      
    })
    it('should return ErrorCode.InvalidData when passed undefined', () => { 
      expect(validDivData(undefined as any)).toBe(ErrorCode.InvalidData);
    })
  })

  describe('sanitizeDiv function', () => { 
    it('should return a sanitized div when div is already sanitized', () => {
      const testDiv = {
        ...validScratchDiv,
        id: '',
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.id).toEqual('')
      expect(sanitizedDiv.tmnt_id).toEqual('tmt_fd99387c33d9c78aba290286576ddce5') 
      expect(sanitizedDiv.div_name).toEqual('Scratch')
      expect(sanitizedDiv.hdcp_per).toEqual(0)
      expect(sanitizedDiv.hdcp_from).toEqual(230)
      expect(sanitizedDiv.int_hdcp).toEqual(true)
      expect(sanitizedDiv.hdcp_for).toEqual('Game')
      expect(sanitizedDiv.sort_order).toEqual(1)
    })
    it('should return a sanitized div when div has an id', () => { 
      const testDiv = {
        ...validScratchDiv,
        id: divId,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.id).toEqual(divId)
    })
    it('should return a sanitized div when div has an invalid id', () => {
      const testDiv = {
        ...validScratchDiv,
        id: 'abc_123',
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.id).toEqual('')      
    })
    it('should return a sanitized div when div is NOT already sanitized', () => {
      // no numerical fields in this test
      const testDiv = {
        ...validScratchDiv,
        tmnt_id: 'abc_123',
        div_name: '  Test* ',   
        hdcp_for: ' invalid ' as any,
        int_hdcp: 'true' as any,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.tmnt_id).toEqual('') 
      expect(sanitizedDiv.div_name).toEqual('Test')            
      expect(sanitizedDiv.hdcp_for).toEqual('')
      expect(sanitizedDiv.int_hdcp).toBeNull()
    })
    it('should return a sanitized div when numerical values are null', () => {
      const testDiv = {
        ...validScratchDiv,
        hdcp_per: null as any,
        hdcp_from: null as any,
        sort_order: null as any,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.hdcp_per).toBeNull()
      expect(sanitizedDiv.hdcp_from).toBeNull()
      expect(sanitizedDiv.sort_order).toBeNull()
    })
    it('should return a sanitized div when numerical values are not numbers', () => {
      const testDiv = {
        ...validScratchDiv,
        hdcp_per: 'abc' as any,
        hdcp_from: ['abc', 'def'] as any,
        sort_order: new Date() as any,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      expect(sanitizedDiv.hdcp_per).toBeNull()
      expect(sanitizedDiv.hdcp_from).toBeNull()
      expect(sanitizedDiv.sort_order).toBeNull()
    })
    it('should return a sanitized div when numerical values are too low', () => {
      const testDiv = {
        ...validScratchDiv,
        hdcp_per: -0.5,
        hdcp_from: -1,
        sort_order: 0,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      // not valid, but sanitized
      expect(sanitizedDiv.hdcp_per).toEqual(-0.5)
      expect(sanitizedDiv.hdcp_from).toEqual(-1)
      expect(sanitizedDiv.sort_order).toEqual(0)
    })
    it('should return a sanitized div when numerical values are to high', () => {
      const testDiv = {
        ...validScratchDiv,
        hdcp_per: 2.5,
        hdcp_from: 301,
        sort_order: 1234567,
      }
      const sanitizedDiv = sanitizeDiv(testDiv)
      // not valid, but sanitized
      expect(sanitizedDiv.hdcp_per).toEqual(2.5)
      expect(sanitizedDiv.hdcp_from).toEqual(301)
      expect(sanitizedDiv.sort_order).toEqual(1234567)
    })
    it('should return null when passed null', () => { 
      expect(sanitizeDiv(null as any)).toBe(null)
    })          
    it('should return null when passed undefined', () => { 
      expect(sanitizeDiv(undefined as any)).toBe(null)
    })          
  })

  describe('validateDiv function', () => { 
    
    describe('validateDiv function - valid data', () => { 
      it('should return true when passed valid data', () => { 
        expect(validateDiv(validScratchDiv)).toBe(ErrorCode.None);
      })
      it('should return ErrorCode.None when all fields are poperly sanitized', () => { 
        const validTestDiv: divType = {
          ...validScratchDiv,          
          div_name: ' Test Div** ',
          hdcp_per: 1.0,
          hdcp_from: 230,
          int_hdcp: true,
          hdcp_for: 'Game',
          sort_order: 1,
        }        
        expect(validateDiv(validTestDiv)).toBe(ErrorCode.None);
      })      
    })

    describe('validateDiv function - missing data data', () => { 
      it('should return ErrorCode.MissingData when tmnt_id is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          tmnt_id: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when div_name is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          div_name: '',
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when div_name is all special characters', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          div_name: '******',
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_per: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp is not a number', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_per: 'abc' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp_from is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_from: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp_from is not a number', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_from: 'xyz' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when int_hdcp is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          int_hdcp: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when int_hdcp is a string', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          int_hdcp: 'true' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp_for is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_for: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp_for is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_for: 'test' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when sort_order is missing', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          sort_order: null as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when sort_order is not a number', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          sort_order: 'abc' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
    })

    describe('validateDiv function - invalid data', () => { 
      it('should return ErrorCode.InvalidData when div name is too long', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          div_name: 'This div name is way too long and should exceed the maximum length allowed',
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when hdcp is less than 0', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_per: -1,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when hdcp is over max', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_per: 200,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when hdcp_from is less than 0', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_from: -1,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when hdcp_from is over max', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_from: 301,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.MissingData when int_hdcp is not a boolean', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          int_hdcp: 'true' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when hdcp_for is not valid', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          hdcp_for: 'test' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.MissingData when sort_order is not a number', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          sort_order: 'abc' as any,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.MissingData);
      })
      it('should return ErrorCode.InvalidData when sort_order is less than 0', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          sort_order: -1,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
      it('should return ErrorCode.InvalidData when sort_order is over max', () => { 
        const invalidTestDiv: divType = {
          ...validScratchDiv,          
          sort_order: maxSortOrder + 1,
        }        
        expect(validateDiv(invalidTestDiv)).toBe(ErrorCode.InvalidData);
      })
    })
  })

  describe('validateDivs function', () => { 
    it('should validate divs', async () => {
      const divsTovalidate = [...mockDivs];
      const validDivs: validDivsType = validateDivs(divsTovalidate);
      expect(validDivs.errorCode).toBe(ErrorCode.None);
      expect(validDivs.divs.length).toBe(divsTovalidate.length);

      for (let i = 0; i < divsTovalidate.length; i++) {
        expect(validDivs.divs[i].id).toBe(divsTovalidate[i].id);
        expect(validDivs.divs[i].tmnt_id).toBe(divsTovalidate[i].tmnt_id);
        expect(validDivs.divs[i].div_name).toBe(divsTovalidate[i].div_name);
        expect(validDivs.divs[i].hdcp_per).toBe(divsTovalidate[i].hdcp_per);
        expect(validDivs.divs[i].hdcp_from).toBe(divsTovalidate[i].hdcp_from);
        expect(validDivs.divs[i].int_hdcp).toBe(divsTovalidate[i].int_hdcp);
        expect(validDivs.divs[i].hdcp_for).toBe(divsTovalidate[i].hdcp_for);
        expect(validDivs.divs[i].sort_order).toBe(divsTovalidate[i].sort_order);
      }
    })
    it('should return ErrorCode.None and sanitize divs', async () => { 
      const toSanitzie = [
        {
          ...mockDivs[0],
          div_name: '   Scratch  ****',
        },
        {
          ...mockDivs[1],
          div_name: '<script>Hdcp</script>',
        },
      ]
      const validDivs: validDivsType = validateDivs(toSanitzie);
      expect(validDivs.errorCode).toBe(ErrorCode.None);
      expect(validDivs.divs[0].div_name).toBe('Scratch');
      expect(validDivs.divs[1].div_name).toBe('Hdcp');
    })
    it('should return ErrorCode.MissingData when required data is missing', async () => { 
      const invalidDivs = [
        {
          ...mockDivs[0],
          div_name: '',
        },
        {
          ...mockDivs[1],          
        },
      ]
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData); 
      expect(valildDivs.divs.length).toBe(0);
    })
    it('should return ErrorCode.MissingData when tmnt_id is not a valid tmnt_id', async () => { 
      // ErroCode.MissingData because sanitize will change invalid tmnt_id to ''
      const invalidDivs = [
        {
          ...mockDivs[0],       
        },
        {
          ...mockDivs[1],
          tmnt_id: divId,
        },
      ]
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData); 
    })
    it('should return ErrorCode.MissingData when 1st div is valid and 2nd is not', async () => { 
      // ErroCode.MissingData because sanitize will change invalid tmnt_id to ''
      const invalidDivs = [
        {
          ...mockDivs[0],       
        },
        {
          ...mockDivs[1],
          tmnt_id: divId,
        },
      ]
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData); 
      expect(valildDivs.divs.length).toBe(1); // fisrt event valid
    })
    it("should return ErrorCode.InvalidData when all tmnt_id's are not the same", async () => {
      const invalidDivs = [
        {
          ...mockDivs[0],       
        },
        {
          ...mockDivs[1],
          tmnt_id: 'tmt_00000000000000000000000000000000',
        },
      ]      
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.InvalidData); 
      expect(valildDivs.divs.length).toBe(1); // fisrt event valid
    })
    it('should return ErrorCode.MissingData when required data is invalid', async () => { 
      const invalidDivs = [
        {
          ...mockDivs[0],       
          id: 'tmt_00000000000000000000000000000000',
        },
        {
          ...mockDivs[1],          
        },
      ]      
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.InvalidData when id is not a valid div id', async () => { 
      const invalidDivs = [
        {
          ...mockDivs[0],       
          hdcp_from: -1
        },
        {
          ...mockDivs[1],          
        },
      ]   
      const valildDivs = validateDivs(invalidDivs);
      expect(valildDivs.errorCode).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.MissingData if passed empty array', async () => {
      const valildDivs = validateDivs([]);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData);
      expect(valildDivs.divs.length).toBe(0);
    })
    it('should return ErrorCode.MissingData if passed null', async () => {
      const valildDivs = validateDivs(null as any);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData);
      expect(valildDivs.divs.length).toBe(0);
    })
    it('should return ErrorCode.MissingData if passed undefined', async () => {
      const valildDivs = validateDivs(undefined as any);
      expect(valildDivs.errorCode).toBe(ErrorCode.MissingData);
      expect(valildDivs.divs.length).toBe(0);
    })
  })

})