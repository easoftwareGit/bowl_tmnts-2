import {
  sanitizeUser,
  validateUser,
  validUserFirstName,
  validUserLastName,
  validUserEmail,
  validUserPhone,
  validUserPassword,
  exportedForTesting,   
} from "@/app/api/users/validate";
import { userType } from "@/lib/types/types";
import { mockUser } from "../../../mocks/tmnts/mockTmnt";
import { ErrorCode } from "@/lib/validation";

const userId = 'usr_5bcefb5d314fff1ff5da6521a2fa7bde';
const nonUserId = 'bwl_5bcefb5d314fff1ff5da6521a2fa7bde';

const { gotUserData, validUserData } = exportedForTesting;

describe("user table data validation", () => {  

  describe("gotUserData function - check for missing data", () => {
    
    it("should return ErrorCode.None when valid user object", () => {
      const testUser: userType = {
        ...mockUser,
        password: "Test123!",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when valid user object, but no phone and do not check phone", () => {
      const testUser: userType = {
        ...mockUser,
        phone: "",
        password: "Test123!",
      };
      expect(gotUserData(testUser, false, true)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when valid user object, but no password and do not check password", () => {
      const testUser: userType = {
        ...mockUser,        
        password: "",
        password_hash: "",
      };
      expect(gotUserData(testUser, true, false)).toBe(ErrorCode.None);
    });

    it("should return ErrorCode.MissingData when no first_name", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when first_name has just special chars", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "***",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when no last_name", () => {
      const testUser: userType = {
        ...mockUser,
        last_name: "",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when last_name has just special chars", () => {
      const testUser: userType = {
        ...mockUser,
        last_name: "****",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });    
    it("should return ErrorCode.MissingData when no email", () => {
      const testUser: userType = {
        ...mockUser,
        email: "",
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when no phone, but checking for phone", () => {
      const testUser: userType = {
        ...mockUser,
        phone: "",
      };
      expect(gotUserData(testUser, true, false)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when no password, but checking for password", () => {
      const testUser: userType = {
        ...mockUser,
        password: "",
        password_hash: "",
      };
      expect(gotUserData(testUser, false, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when no role", () => {
      const testUser: userType = {
        ...mockUser,
        role: "" as any,
      };
      expect(gotUserData(testUser, true, true)).toBe(ErrorCode.MissingData);
    });        
  });

  describe('validUserFirstName function', () => {
    it('should return true when first name is valid', () => {
      expect(validUserFirstName("John")).toBe(true);
    });
    it('should return false when first name is too long', () => {
      expect(validUserFirstName("1234567890123456")).toBe(false);
    });
    it('should return false when first name is empty', () => {
      expect(validUserFirstName("")).toBe(false);
    });
    it('should return false when first name has just special chars', () => {
      expect(validUserFirstName("***")).toBe(false);
    });
    it('should return false when first name is null', () => {
      expect(validUserFirstName(null as any)).toBe(false);
    });
    it('should return false when first name is undefined', () => {
      expect(validUserFirstName(undefined as any)).toBe(false);
    });
    it('should return true when passed html tag (tags remove)', () => { 
      // will be John
      expect(validUserFirstName("<b>John</b>")).toBe(true);
      // will be alerthello
      expect(validUserFirstName("<script>alert('hello')</script>")).toBe(true);
    })
  });

  describe('validUserLastName function', () => {
    it('should return true when last name is valid', () => {
      expect(validUserLastName("Doe")).toBe(true);
    });
    it('should return false when last name is too long', () => {
      expect(validUserLastName("123456789012345678901")).toBe(false);
    });
    it('should return false when last name is empty', () => {
      expect(validUserLastName("")).toBe(false);
    });
    it('should return false when last name has just special chars', () => {
      expect(validUserLastName("<<<>>>")).toBe(false);
    });
    it('should return false when last name is null', () => {
      expect(validUserLastName(null as any)).toBe(false);
    });
    it('should return false when last name is undefined', () => {
      expect(validUserLastName(undefined as any)).toBe(false);
    });
    it('should return true when passed html tag (tags remove)', () => { 
      // will be Jones
      expect(validUserLastName("<b>Jones</b>")).toBe(true);
      // will be alerthello
      expect(validUserLastName("<script>alert('hello')</script>")).toBe(true);
    })
  });

  describe('validUserEmail function', () => {
    it('should return true when email is valid', () => {
      expect(validUserEmail("a@b.com")).toBe(true);
      expect(validUserEmail("test@example.com")).toBe(true);
    });
    it('should return false when email is invalid', () => {
      expect(validUserEmail("a@b")).toBe(false);
    });
    it('should return false when email is empty', () => {
      expect(validUserEmail("")).toBe(false);
    });
    it('should return false when email is null', () => {
      expect(validUserEmail(null as any)).toBe(false);
    });
    it('should return false when email is undefined', () => {
      expect(validUserEmail(undefined as any)).toBe(false);
    });
    it('should return false when passed html tag (tags remove)', () => { 
      expect(validUserEmail("<b>a@b.com</b>")).toBe(false);
    })
    it('should return false when passed invalid characters', () => { 
      expect(validUserEmail('invalid**test@email.com')).toBe(false);      
    })
    it('should return false when passed not exaclty one @', () => { 
      expect(validUserEmail('inv@alid@email.com')).toBe(false);
      expect(validUserEmail('invalidemail.com')).toBe(false);
    })
    it('should return false when passed email will no domain', () => {       
      expect(validUserEmail('invalid@emailcom')).toBe(false);
    })
  });

  describe('validUserPhone function', () => {
    it('should return true when phone is valid', () => {
      expect(validUserPhone("2345678901")).toBe(true);
    });
    it('should return false when phone is invalid', () => {
      expect(validUserPhone("12345678901")).toBe(true);
      expect(validUserPhone("abc")).toBe(false);
    });
    it('should return false when phone is empty', () => {
      expect(validUserPhone("")).toBe(false);
    });
    it('should return false when phone is null', () => {
      expect(validUserPhone(null as any)).toBe(false);
    });
    it('should return false when phone is undefined', () => {
      expect(validUserPhone(undefined as any)).toBe(false);
    });
    it('should return false when passed invalid characters', () => {
      expect(validUserPassword("1234567890a")).toBe(false);
      expect(validUserPassword("  1234567890 ")).toBe(false);
      expect(validUserPassword("12345678%0")).toBe(false);
      expect(validUserPassword("12345678@0")).toBe(false);
    })
    it('should return false when passed html tag)', () => { 
      expect(validUserPhone("<b>2345678901</b>")).toBe(true);
    })
  });

  describe('validUserPassword function', () => { 
    it('should return true when password is valid', () => { 
      expect(validUserPassword("Test123!")).toBe(true);
    });
    it('should return false when no uppercase letter', () => { 
      expect(validUserPassword("test123!")).toBe(false);
    })
    it('should return false when no lowercase letter', () => { 
      expect(validUserPassword("TEST123!")).toBe(false);
    })
    it('should return false when no number', () => { 
      expect(validUserPassword("Testtest!")).toBe(false);
    })
    it('should return false when no special char', () => { 
      expect(validUserPassword("Test1234")).toBe(false);
    })
    it('should return false when password is empty', () => { 
      expect(validUserPassword("")).toBe(false);
    })
    it('should return false when password is too short', () => { 
      expect(validUserPassword("Test")).toBe(false);
    })
    it('should return false when password is too long', () => {
      expect(validUserPassword("Test123!Test123!Test123!")).toBe(false);
    })
    it('should return false when password is undefined', () => {
      expect(validUserPassword(undefined as any)).toBe(false);
    })
    it('should return false when password is null', () => { 
      expect(validUserPassword(null as any)).toBe(false);
    })
  })

  describe("validUserData function - invalid data", () => {
    it("should return ErrorCode.None when valid user object", () => {
      const testUser: userType = {
        ...mockUser,
        password: "Test123!",
      };
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when phone is invalid, and not checking for phone", () => {
      const testUser: userType = {
        ...mockUser,
        phone: "",
        password: "Test123!",        
      };
      expect(validUserPhone(testUser.phone)).toBe(false);
      expect(validUserData(testUser, false, true)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when password is invalid, and not checking for password", () => {
      const testUser: userType = {
        ...mockUser,        
        password: "Test",        
      };
      expect(validUserPassword(testUser.phone)).toBe(false);
      expect(validUserData(testUser, true, false)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.InvalidData when first name is too long", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "1234567890123456",
        password: "Test123!",
      };
      expect(validUserFirstName(testUser.first_name)).toBe(false);
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.InvalidData);      
    });
    it("should return ErrorCode.InvalidData when last name is too long", () => {
      const testUser: userType = {
        ...mockUser,
        last_name: "123456789012345678901",
        password: "Test123!",
      };
      expect(validUserLastName(testUser.last_name)).toBe(false);
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when email is invalid", () => {
      const testUser: userType = {
        ...mockUser,
        email: "john.doe@example",
        password: "Test123!",
      };
      expect(validUserEmail(testUser.email)).toBe(false);
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when phone is invalid, and checking for phone", () => {
      const testUser: userType = {
        ...mockUser,
        phone: "abc",
        password: "Test123!",
      };
      expect(validUserPhone(testUser.phone)).toBe(false);
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when password is invalid and checking for password", () => {
      const testUser: userType = {
        ...mockUser,
        password: "Test12!",
      };
      expect(validUserPassword(testUser.password)).toBe(false);
      expect(validUserData(testUser, true, true)).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when role is invalid", () => {
      const testUser: userType = {
        ...mockUser,        
        role: "Test" as any,
      };            
      expect(validUserData(testUser, false, false)).toBe(ErrorCode.InvalidData);
    });

  });

  describe('validateUser function, test both gotUserData AND validUserData', () => {
    it("should return ErrorCode.None when valid data", () => {
      const testUser: userType = {
        ...mockUser,
        password: "Test123!",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.None when user no phone or password, but not checking for phone or password", () => {
      const testUser: userType = {
        ...mockUser,
        phone: "",
        password: "",
        password_hash: "",
      };
      expect(validateUser(testUser, false, false)).toBe(ErrorCode.None);
    });
    it("should return ErrorCode.MissingData when user is missing id", () => {
      const testUser: userType = {
        ...mockUser,
        id: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when user is missing first name", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when first_name is all special characters", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "*****",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    });
    it("should return ErrorCode.MissingData when user is missing last name", () => {
      const testUser: userType = {
        ...mockUser,
        last_name: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    })    
    it("should return ErrorCode.MissingData when user is missing email", () => {
      const testUser: userType = {
        ...mockUser,
        email: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    })    
    it('should return ErrorCode.MissingData when user has missing phone and checking phone', () => {
      const testUser: userType = {
        ...mockUser,
        phone: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    })
    it('should return ErrorCode.MissingData when user has missing password and checking password', () => {
      const testUser: userType = {
        ...mockUser,
        password: "",
        password_hash: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.MissingData);
    })
    it("should return ErrorCode.InvalidData when user has invalid first name", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "1234567890123456789012345678901234567890",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.InvalidData);
    });
    it("should return ErrorCode.InvalidData when user is missing last name", () => {
      const testUser: userType = {
        ...mockUser,
        last_name: "This is a very long last name that should fail",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.InvalidData);
    })    
    it("should return ErrorCode.InvalidData when user is missing email", () => {
      const testUser: userType = {
        ...mockUser,
        email: "notvalid@something",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.InvalidData);
    })    
    it('should return ErrorCode.InvalidData when user has invalid phone and checking phone', () => {
      const testUser: userType = {
        ...mockUser,
        phone: "abc",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.InvalidData);
    })
    it('should return ErrorCode.InvalidData when user has invalid password and checking password', () => {
      const testUser: userType = {
        ...mockUser,
        password: "1234",
        password_hash: "",
      };
      expect(validateUser(testUser, true, true)).toBe(ErrorCode.InvalidData);
    })

  })

  describe("sanitizeUser function", () => {
    // const testUser: userType = {
    //   ...mockUser,
    //   first_name: "   J>o<h@n-P#aকu😀l",
    //   last_name: "J?o/n[e,s.D]o{e}   ",
    //   email: "john.doe@example.com",
    //   phone: "(800) 555-1234",
    //   password: "Test123!",
    //   role: "USER",
    // };
    it("should return a sanitized user object - no sanitizing", () => {
      const testUser: userType = {
        ...mockUser,
        id: userId,
        first_name: "John-Paul",
        last_name: "Jones Doe",
        phone: "1+8005551234",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.id).toEqual(userId);
      expect(sanitized.first_name).toEqual("John-Paul");
      expect(sanitized.last_name).toEqual("Jones Doe");
      expect(sanitized.phone).toEqual("+18005551234");
      expect(sanitized.email).toEqual(mockUser.email);
      expect(sanitized.role).toEqual(mockUser.role);
    });
    it('should return a sanitized user when user id is invalid', () => { 
      const testUser: userType = {
        ...mockUser,
        id: "<script>alert(1)</script>",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.id).toEqual("");
    })
    it('should return a sanitized user when user id is a valid id, but not a user id', () => { 
      const testUser: userType = {
        ...mockUser,
        id: nonUserId,
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.id).toEqual("");
    })
    it('should return a sanitized user when user has an invalid id', () => { 
      const testUser: userType = {
        ...mockUser,
        id: "test",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.id).toEqual("");
    })
    it("should return a sanitized user object", () => {
      const testUser: userType = {
        ...mockUser,
        first_name: "   J>o<h@n-P#aকu😀l",
        last_name: "O'Conner, Jr.   ",
        phone: "<b>(800) 555-1234</b>",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.first_name).toEqual("John-Paul");
      expect(sanitized.last_name).toEqual("O'Conner, Jr.");
      expect(sanitized.phone).toEqual("+18005551234");
    });
    it("should return a sanitized user object without email or password", () => {
      const testUser: userType = {
        ...mockUser,
        email: 'johndoe.com',
        password: "Test123",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.email).toEqual("");
      expect(sanitized.password).toEqual("");      
    });
    it('should return a sanitized user object without phone when phone is blank', () => { 
      const testUser: userType = {
        ...mockUser,
        phone: "",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.phone).toEqual("");
    })
    it('should return a sanitized user object without phone is invalid', () => { 
      const testUser: userType = {
        ...mockUser,
        phone: "abc",
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.phone).toEqual("");
    })
    it('should return a sanitized user when role is invalid', () => { 
      const testUser: userType = {
        ...mockUser,
        role: "<script>alert(1)</script>" as any,
      };
      const sanitized = sanitizeUser(testUser);
      expect(sanitized.role).toEqual("USER");
    })

  });

});
