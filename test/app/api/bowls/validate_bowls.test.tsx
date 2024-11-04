import {
  sanitizeBowl,
  validateBowl,
  validBowlName,
  validCity,
  validState,
  validUrl,  
  exportedForTesting,   
} from "@/app/api/bowls/validate";
import { initBowl } from "@/lib/db/initVals";
import { bowlType } from "@/lib/types/types";
import { ErrorCode, maxUrlLength } from "@/lib/validation";

const { gotBowlData, validBowlData } = exportedForTesting;

const bowlId = 'bwl_561540bd64974da9abdd97765fdb3659';
const userId = 'use_561540bd64974da9abdd97765fdb365a';

const validBowl = {
  ...initBowl,
  id: bowlId,
  bowl_name: 'Valid Bowl Name',
  city: 'Valid City',
  state: 'VS',
  url: 'https://valid.com'
}

describe("bowl table data validation", () => { 

  describe("gotBowlData function", () => { 
    it('should return ErrorCode.None when all fields are properly sanitized', () => {
      const result = gotBowlData(validBowl);
      expect(result).toBe(ErrorCode.None);
    });

    it('should return ErrorCode.MissingData when id is an empty string', () => {
      const invalidBowl = {
        ...validBowl,
        id: '',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it('should return ErrorCode.MissingData when bowl_name is an empty string', () => {
      const invalidBowl = {
        ...validBowl,
        bowl_name: '',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });            
    it('should return ErrorCode.MissingData when city is an empty string', () => {
      const invalidBowl = {
        ...validBowl,
        city: '',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });    
    it('should return ErrorCode.MissingData when state is an empty string', () => {
      const invalidBowl = {
        ...validBowl,
        state: '',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });    
    it('should return ErrorCode.MissingData when URL is an empty string', () => {
      const invalidBowl = {
        ...validBowl,
        url: ''
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });    
    it('should return ErrorCode.MissingData when bowl_name contains only special characters', () => {
      const invalidBowl = {
        ...validBowl,
        id: bowlId,
        bowl_name: '!!!',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });    
    it('should return ErrorCode.MissingData when city contains only special characters', () => {
      const invalidBowl = {
        ...validBowl,
        city: '***',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it('should return ErrorCode.MissingData when state contains only special characters', () => {
      const invalidBowl = {
        ...validBowl,
        state: '!$%^&',
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });
    it('should return ErrorCode.MissingData when URL contains invalid URL', () => {
      const invalidBowl = {
        ...validBowl,
        url: 'invalidUrl'
      }
      const result = gotBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.MissingData);
    });
    
    it('should return ErrorCode.MissingData when bowl object is null', () => {
      const result = gotBowlData(null as any);
      expect(result).toBe(ErrorCode.MissingData);
    });

    it('should return ErrorCode.None when all fields are properly sanitized', () => {
      const validBowl: bowlType = {
        id: bowlId,
        bowl_name: ' Valid Bowl Name ',
        city: ' Valid City ',
        state: ' VS ',
        url: ' https://valid.url '
      };
      const result = gotBowlData(validBowl);
      expect(result).toBe(ErrorCode.None);
    });
  });

  describe('validBowlName function', () => { 

    it('should return true for valid bowl name within length limit', () => {
      const validName = "Valid Bowl Name";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });
    it('should return false for empty string', () => {
      const emptyName = "";
      const result = validBowlName(emptyName);
      expect(result).toBe(false);
    });
    it('should return false for bowl name exceeding max length', () => {
      const invalidName = "This is a very long bowl name that exceeds the maximum length allowed";
      const result = validBowlName(invalidName);
      expect(result).toBe(false);
    });
    it('should return true with special characters removed', () => {
      const validName = "Valid Bowl Name!@#$";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });
    it('should return true for bowl name with spaces trimmed', () => {
      const validName = "  Valid Bowl Name ";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });    
    it('should return true for valid bowl name with URL encoded characters decoded', () => {
      const validName = "Valid%20Bowl%20Name";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });    
    it('should return true when bowl name string contains HTML tags (tags removed)', () => {
      const validName = "<script>alert('hello')</script>";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });    
    it('should return true when state string contains newline characters (newline characters removed)', () => {
      const validName = "Test\nbowl";
      const result = validBowlName(validName);
      expect(result).toBe(true);
    });
    it('should return false for bowl name with only spaces', () => {
      const invalidName = "     ";
      const result = validBowlName(invalidName);
      expect(result).toBe(false);
    });    
    it('should return false for null input', () => {
      const result = validBowlName(null as any);
      expect(result).toBe(false);
    });    
  })

  describe('validCity function', () => { 

    it('should return true when city name is within length limit', () => {
      const city = "San Francisco";
      const result = validCity(city);
      expect(result).toBe(true);
    });    
    it('should return false when city name is empty', () => {
      const city = "";
      const result = validCity(city);
      expect(result).toBe(false);
    });
    it('should return false when city name exceeds max length limit with a longer city name', () => {
      const city = "A very long city name that exceeds the limit";
      const result = validCity(city);
      expect(result).toBe(false);
    });
    it('should return true when city name with special characters removed', () => {
      const city = "San Francisco!";
      const result = validCity(city);
      expect(result).toBe(true);
    });
    it('should return true when city name is within length limit and leading/trailing spaces are trimmed', () => {
      const city = "  New York  ";
      const result = validCity(city);
      expect(result).toBe(true);
    });    
    it('should return true when city name with URL-encoded characters decoded is within length limit', () => {
      const city = "San%20Francisco";
      const result = validCity(city);
      expect(result).toBe(true);
    });
    it('should return true when city string contains HTML tags (tags removed)', () => {
      const city = "<script>alert('hello')</script>";       
      const result = validCity(city); // sanitized to alert'hello'
      expect(result).toBe(true);
    });
    // state string with newline characters returns false after sanitization
    it('should return false when state string contains newline characters (newline characters removed)', () => {
      const city = "New\nYork";
      const result = validCity(city);
      expect(result).toBe(true);
    });
    it('should return false when city name has only spaces', () => {
      const city = "     ";
      const result = validCity(city);
      expect(result).toBe(false);
    });        
    it('should return false when city is null', () => {      
      const result = validCity(null as any);
      expect(result).toBe(false);
    });
  })

  describe('validState function', () => { 
    it('should return true when state string is within max length', () => {
      const state = "Texas";
      const result = validState(state);
      expect(result).toBe(true);
    });    
    it('should return false when state string is empty', () => {
      const state = "";
      const result = validState(state);
      expect(result).toBe(false);
    });    
    it('should return true when state string is exactly at max length', () => {
      const state = "Texas";
      const result = validState(state);
      expect(result).toBe(true);
    });
    it('should return false when state string exceeds max length', () => {
      const state = "CaliforniaLong";
      const result = validState(state);
      expect(result).toBe(false);
    });
    it('should return true with special characters removed', () => {
      const state = "VS!@#$";
      const result = validState(state);
      expect(result).toBe(true);
    });
    it('should return true when state string has leading/trailing spaces', () => {
      const state = "   VS   ";
      const result = validState(state);
      expect(result).toBe(true);
    });
    it('should return true for state with URL encoded characters decoded', () => {
      const state = "%20VS%20";
      const result = validState(state);
      expect(result).toBe(true);
    });
    it('should return false when state string contains HTML tags', () => {
      const state = "<script>alert('hello')</script>";
      const result = validState(state);
      expect(result).toBe(false); // over max length
    });    
    it('should return true when state string contains newline characters', () => {
      const state = "N\nY";
      const result = validState(state);
      expect(result).toBe(true);
    });
    it('should return false when state string contains only spaces', () => {
      const state = "     ";
      const result = validState(state);
      expect(result).toBe(false);
    });
    it('should return false for null input', () => {
      const result = validState(null as any);
      expect(result).toBe(false);
    });    
  })

  describe('validUrl function', () => { 
    it('should return true for valid HTTP URL within max length', () => {
      const url = 'http://example.com';
      const result = validUrl(url);
      expect(result).toBe(true);
    });
    it('should return false for empty URL', () => {
      const url = '';
      const result = validUrl(url);
      expect(result).toBe(false);
    });
    it('should return false for URL exceeding max length', () => {
      const url = 'http://example.com/' + 'a'.repeat(maxUrlLength);
      const result = validUrl(url);
      expect(result).toBe(false);
    });  
    it('should return true for valid HTTP URL within max length after sanitization', () => {
      const url = 'http://example.com?a=1&b=2';
      const result = validUrl(url);
      expect(result).toBe(true);
    });
    it('should return true for valid HTTP URL with fragment within max length', () => {
      const url = '  http://example.com  ';
      const result = validUrl(url);
      expect(result).toBe(true);
    });
    it('should return false for URL with only domain and no protocol', () => {
      const url = 'example.com';
      const result = validUrl(url);
      expect(result).toBe(false);
    });
    it('should return false for malformed URL', () => {
      const url = 'invalidurl';
      const result = validUrl(url);
      expect(result).toBe(false);
    });
    it('should return false for url with only spaces', () => {
      const url = "     ";
      const result = validUrl(url);
      expect(result).toBe(false);
    });
    it('should return false for null input', () => {
      const result = validUrl(null as any);
      expect(result).toBe(false);
    });    
  })
  
  describe('validBowlData function', () => { 
    it('should return ErrorCode.None when all bowl data fields are within maximum lengths', () => {
      const result = validBowlData(validBowl);
      expect(result).toBe(ErrorCode.None);
    });
    it('should return ErrorCode.InvalidData when id is empty', () => {
      const invalidBowl = {
        ...validBowl,
        id: '',        
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it('should return ErrorCode.InvalidData when bowl name is empty', () => {
      const invalidBowl = {
        ...validBowl,
        bowl_name: '',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });    
    it('should return ErrorCode.InvalidData when bowl name exceeds max length', () => {
      const invalidBowl = {
        ...validBowl,
        bowl_name: 'This bowl name is way too long and should exceed the maximum length allowed',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });    
    it('should return ErrorCode.InvalidData when city is empty', () => {
      const invalidBowl = {
        ...validBowl,
        city: '',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });    
    it('should return ErrorCode.InvalidData when city length exceeds maximum allowed', () => {
      const invalidCityLengthBowl = {
        ...validBowl,
        city: 'City Name Exceeding Maximum Length',
      };
      const result = validBowlData(invalidCityLengthBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });    
    it('should return ErrorCode.InvalidData when state is empty', () => {
      const invalidBowl = {
        ...validBowl,
        state: '',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it('should return ErrorCode.InvalidData when state exceeds max length', () => {
      const invalidBowl = {
        ...validBowl,
        state: 'ThisStateNameIsTooLongAndExceedsTheMaximumAllowedLength',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });   
    it('should return ErrorCode.InvalidData when url is empty', () => {
      const invalidBowl = {
        ...validBowl,
        url: ''
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });        
    it('should return ErrorCode.InvalidData when url exceeds max length', () => {
      const invalidUrl = 'http://' + 'a'.repeat(maxUrlLength) + '.com'; // creating a url that exceeds max length
      const invalidBowl = {
        ...validBowl,
        url: invalidUrl
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it('should return ErrorCode.MissingData when id is invalid', () => {
      const invalidBowl = {
        ...validBowl,
        id: 'test',
      }
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it('should return ErrorCode.MissingData when id is valid, but not a bowl id', () => {
      const invalidBowl = {
        ...validBowl,
        id: userId,
      }
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.InvalidData);
    });
    it('should return ErrorCode.InvalidData when bowl_name is missing', () => {
      const invalidBowl = {        
        id: '1',
        city: 'Valid City',
        state: 'VS',
        url: 'http://valid.url'
      };
      const result = validBowlData(invalidBowl as bowlType);
      expect(result).toBe(ErrorCode.InvalidData);
    });

    it('should return ErrorCode.None when bowl name contains special characters, but still ok length', () => {
      const invalidBowl = {
        ...validBowl,
        bowl_name: 'Invalid Bowl$',
      };
      const result = validBowlData(invalidBowl);
      expect(result).toBe(ErrorCode.None);
    });
  })

  describe('sanitizeBowl function', () => { 
    it('should make not changed to bowl object when all properties are already sanitized', () => { 
      const testBowl = {
        ...validBowl,                
      }
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.id).toEqual(bowlId);
      expect(sanitizedBowl.bowl_name).toEqual('Valid Bowl Name');
      expect(sanitizedBowl.city).toEqual('Valid City');
      expect(sanitizedBowl.state).toEqual('VS');
      expect(sanitizedBowl.url).toEqual('https://valid.com');
    })
    it('should return a sanitized bowl when bowl has an invalid id', () => { 
      const testBowl = {
        ...validBowl,
        id: 'test123',
      }
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.id).toEqual('');
    })
    it('should remove unwanted characters from bowl_name, city, and state', () => {
      const testBowl = {    
        ...validBowl,
        bowl_name: 'Test<bowl>',
        city: 'City<script>',
        state: 'State<alert>',
        url: 'http://example.com'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);      
      expect(sanitizedBowl.id).toBe(bowlId);
      expect(sanitizedBowl.bowl_name).toBe('Test');
      expect(sanitizedBowl.city).toBe('City');
      expect(sanitizedBowl.state).toBe('State');
      expect(sanitizedBowl.url).toBe('http://example.com');
    });    
    it('should sanitize a valid URL when calling sanitizeBowl', () => {
      const testBowl = {
        ...validBowl,
        url: 'http://example.com'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.url).toBe('http://example.com');
    });
    
    it('should return a bowl object with the same structure as the input', () => {
      const testBowl = {
        ...validBowl,
        bowl_name: 'Test<bowl>',
        city: 'City<script>',
        state: 'State<alert>',
        url: 'http://example.com'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.id).toBe(bowlId);
      expect(sanitizedBowl.bowl_name).toBe('Test');
      expect(sanitizedBowl.city).toBe('City');
      expect(sanitizedBowl.state).toBe('State');
      expect(sanitizedBowl.url).toBe('http://example.com');
    });
    
    it('should handle empty strings in id, bowl_name, city, state, and url gracefully', () => {
      const testBowl = {
        id: '',
        bowl_name: '',
        city: '',
        state: '',
        url: ''
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.id).toBe('');
      expect(sanitizedBowl.bowl_name).toBe('');
      expect(sanitizedBowl.city).toBe('');
      expect(sanitizedBowl.state).toBe('');
      expect(sanitizedBowl.url).toBe('');
    });

    it('should handle strings with HTML tags in bowl_name, city, and state', () => {
      const testBowl = {
        ...validBowl,
        bowl_name: 'Test<bowl>',
        city: 'City<script>',
        state: 'State<alert>',
        url: 'http://example.com'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.bowl_name).toBe('Test');
      expect(sanitizedBowl.city).toBe('City');
      expect(sanitizedBowl.state).toBe('State');
    });
    
    it('should handle strings with special characters like parentheses, asterisks, and plus signs', () => {
      const testBowl = {
        ...validBowl,
        bowl_name: 'Test(bowl)*&',
        city: 'City(bowl)*@',
        state: 'S(T)*#',
        url: 'http://example.com'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.bowl_name).toBe('Testbowl');
      expect(sanitizedBowl.city).toBe('Citybowl');
      expect(sanitizedBowl.state).toBe('ST');
      expect(sanitizedBowl.url).toBe('http://example.com');
    });
    it('should sanitize url', () => {
      const testBowl = {
        ...validBowl,
        bowl_name: 'Testbowl',
        city: 'Citybowl',
        state: 'ST',
        url: 'http://username:password@example.com/path?query=123#hash'
      };
      const sanitizedBowl = sanitizeBowl(testBowl);
      expect(sanitizedBowl.bowl_name).toBe('Testbowl');
      expect(sanitizedBowl.city).toBe('Citybowl');
      expect(sanitizedBowl.state).toBe('ST');
      expect(sanitizedBowl.url).toBe('http://example.com/path?query=123#hash');
    });
  })

  describe('validateBowl function', () => { 

    describe('validateBowl function - valid data', () => { 
      it('should return ErrorCode.None when all fields are properly sanitized', () => {
        const result = validateBowl(validBowl);
        expect(result).toBe(ErrorCode.None);
      });
      it('should return ErrorCode.None when all fields are properly sanitized', () => {
        const testBowl: bowlType = {
          ...validBowl,
          bowl_name: ' Valid Bowl Name ',
          city: ' Valid City ',
          state: ' VS ',
          url: ' https://valid.url '
        };
        const result = validateBowl(testBowl);
        expect(result).toBe(ErrorCode.None);
      });  
      it('should return ErrorCode.None when bowl name contains special characters, but still ok length', () => {
        const invalidBowl = {
          ...validBowl,
          bowl_name: 'Invalid Bowl$',
          city: 'Valid City',
          state: 'VS',
          url: 'http://valid.url'
        };
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.None);
      });  
    })
    describe('validateBowl function - missing data', () => {
      it('should return ErrorCode.MissingData when bowl_name is an empty string', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: '',
          city: 'Valid City',
          state: 'VS',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });              
      it('should return ErrorCode.MissingData when city is an empty string', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: '',
          state: 'VS',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });      
      it('should return ErrorCode.MissingData when state is an empty string', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: 'Valid City',
          state: '',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it('should return ErrorCode.MissingData when URL is an empty string', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: 'Valid City',
          state: 'VS',
          url: ''
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it('should return ErrorCode.MissingData when bowl_name contains only special characters', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: '!!!',
          city: 'Valid City',
          state: 'VS',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });      
      it('should return ErrorCode.MissingData when city contains only special characters', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: '***',
          state: 'VS',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it('should return ErrorCode.MissingData when state contains only special characters', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: 'Valid City',
          state: '!$%^&',
          url: 'https://valid.com'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });
      it('should return ErrorCode.MissingData when URL contains invalid URL', () => {
        const invalidBowl = {
          ...validBowl,          
          bowl_name: 'Valid Bowl Name',
          city: 'Valid City',
          state: 'VS',
          url: 'invalidUrl'
        }
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });      
      it('should return ErrorCode.MissingData when bowl object is null', () => {
        const result = validateBowl(null as any);
        expect(result).toBe(ErrorCode.MissingData);
      });      
    })

    describe('validateBowl function - invalid data', () => { 

      it('should return ErrorCode.InvalidData when bowl name exceeds max length', () => {
        const invalidBowl = {
          ...validBowl,
          bowl_name: 'This bowl name is way too long and should exceed the maximum length allowed',
          city: 'Valid City',
          state: 'VS',
          url: 'http://valid.url'
        };
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.InvalidData);
      });  
      it('should return ErrorCode.InvalidData when city length exceeds maximum allowed', () => {
        const invalidCityLengthBowl = {
          ...validBowl,
          bowl_name: 'Invalid Bowl',
          city: 'City Name Exceeding Maximum Length',
          state: 'VS',
          url: 'http://valid.url'
        };
        const result = validateBowl(invalidCityLengthBowl);
        expect(result).toBe(ErrorCode.InvalidData);
      });  
      it('should return ErrorCode.InvalidData when state exceeds max length', () => {
        const invalidBowl = {
          ...validBowl,
          bowl_name: 'Invalid Bowl',
          city: 'Invalid City',
          state: 'ThisStateNameIsTooLongAndExceedsTheMaximumAllowedLength',
          url: 'http://invalid.url'
        };
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.InvalidData);
      });  
      it('should return ErrorCode.MissingData when url exceeds max length', () => {
        const invalidUrl = 'http://test.com/' + 'a'.repeat(maxUrlLength); // creating a url that exceeds max length
        const invalidBowl = {
          ...validBowl,
          bowl_name: 'Valid Bowl',
          city: 'Valid City',
          state: 'VS',
          url: invalidUrl
        };
        const result = validateBowl(invalidBowl);
        expect(result).toBe(ErrorCode.MissingData);
      });
  
    })
  })

})