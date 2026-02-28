import axios from "axios";
import { doCompare, doHash } from "@/lib/hash";
import { bcryptLength, maxToHashLength } from "@/lib/validation/validation";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../testApi";

// before running this test, run the following commands in the terminal:
// 1) clear and re-seed the database
//    a) clear the database
//       npx prisma db push --force-reset
//    b) re-seed
//       npx prisma db seed  
//    if just need to re-seed, then only need step 1b
// 2) make sure the server is running
//    in the VS activity bar, 
//      a) click on "Run and Debug" (Ctrl+Shift+D)
//      b) at the top of the window, click on the drop-down arrow
//      c) select "Node.js: debug server-side"
//      d) directly to the left of the drop down select, click the green play button
//         This will start the server in debug mode. 

const userUrl = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;    
const oneUserUrl = userUrl + "/user/"

const testPassword = 'Test123!';
const testUserId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";

describe('hash functions', () => {

  describe('doHash()', () => { 
    it('should return a hash', async () => { 
      const toHash = "some string";
      const hashed = await doHash(toHash);
      expect(hashed).toBeDefined();
    })
    it('should return an empty string when passed an empty string', async () => { 
      const toHash = "";
      const hashed = await doHash(toHash);
      expect(hashed).toBe("");
    })
    it('should return an empty string when passed a string too long', async () => { 
      const toHash = "a".repeat(maxToHashLength + 1);
      const hashed = await doHash(toHash);
      expect(hashed).toBe("");
    })
    it('should return an empty string when passed a null', async () => { 
      const toHash = null;
      const hashed = await doHash(toHash as any);
      expect(hashed).toBe("");
    })
  })

  describe('doCompare()', () => { 

    let dbUser: any = null;

    beforeAll(async () => {
      const response = await axios.get(oneUserUrl + testUserId);
      dbUser = response.data.user;
    })

    it('should return true when passed toHash and hashed match', async () => { 
      expect(dbUser).not.toBeNull();
      const match = await doCompare(testPassword, dbUser.password_hash);
      expect(match).toBe(true);
    })
    it('should return false when passed toHash and hashed do not match', async () => { 
      const match = await doCompare("some other password", dbUser.password_hash);
      expect(match).toBe(false);
    })
    it('should return false when toHash is blank', async () => {
      const match = await doCompare("", dbUser.password);
      expect(match).toBe(false);      
    })
    it('should return false when hashed is blank', async () => {
      const match = await doCompare(testPassword, "");
      expect(match).toBe(false);      
    })
    it('should return false when toHash is too long', async () => {
      const match = await doCompare("a".repeat(maxToHashLength + 1), dbUser.password_hash);
      expect(match).toBe(false);      
    })
    it('should return false when hashed is too long', async () => {      
      const match = await doCompare(testPassword, "a".repeat(bcryptLength + 1));
      expect(match).toBe(false);      
    })
    it('should return false when hashed is invalid format', async () => { 
      const match = await doCompare(testPassword, "a".repeat(bcryptLength));
      expect(match).toBe(false);
    })
    it('should return false when toHash is null', async () => {
      const match = await doCompare(null as any, dbUser.password_hash);
      expect(match).toBe(false);      
    })
    it('should return false when toHash is undefined', async () => { 
      const match = await doCompare(undefined as any, dbUser.password_hash);
      expect(match).toBe(false);
    })
    it('should return false when hashed is null', async () => {
      const match = await doCompare(testPassword, null as any);
      expect(match).toBe(false);      
    })
    it('should return false when hashed is undefined', async () => {
      const match = await doCompare(testPassword, undefined as any);
      expect(match).toBe(false);      
    })
  })

});