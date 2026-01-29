import axios, { AxiosError } from "axios";
import { baseBcryptApi, baseUsersApi } from "@/lib/db/apiPaths";
import { testBaseBcryptApi, testBaseUsersApi } from "../../../testApi";
import { maxToHashLength } from "@/lib/validation/validation";

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

const url = testBaseBcryptApi.startsWith("undefined")
  ? baseBcryptApi
  : testBaseBcryptApi;    
const hashUrl = url + "/hash"  
const compareUrl = url + "/compare"

const userUrl = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;    
const oneUserUrl = userUrl + "/user/"

const testPassword = 'Test123!';
const testUserId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";                    

describe("bcrypt route test", () => { 

  describe('PUT compare - API: /api/bcrypt/compare', () => {     

    let dbUser: any = null;

    beforeAll(async () => {
      const response = await axios.get(oneUserUrl + testUserId);
      dbUser = response.data.user;
    })

    it("should return true when toHash and hashed compare as true", async () => { 
      expect(dbUser).not.toBeNull();
      const bcryptJSON = JSON.stringify({ toHash: testPassword, hashed: dbUser?.password_hash });
      const response = await axios({
        method: "put",
        data: bcryptJSON,
        withCredentials: true,
        url: compareUrl,
      })
      expect(response.status).toBe(200);
      expect(response.data.match).toBe(true);
    })
    it("should return 'does not match' toHash and hashed compare as false", async () => {       
      expect(dbUser).not.toBeNull();
      const bcryptJSON = JSON.stringify({ toHash: 'testPassword', hashed: dbUser?.password_hash });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("does not match");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("does not match");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'Error bcrypt put' when passed null", async () => {       
      try { 
        const response = await axios({
          method: "put",
          data: null,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(500);
        expect(response.data.message).toBe("Error bcrypt put");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(500);
          expect(err.response?.data.error).toBe("Error bcrypt put");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when toHash is blank", async () => { 
      const bcryptJSON = JSON.stringify({ toHash: '', hashed: dbUser?.password_hash });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when toHash is too long", async () => { 
      const bcryptJSON = JSON.stringify({ toHash: 'a'.repeat(maxToHashLength + 1), hashed: dbUser?.password_hash });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when toHash is mising", async () => { 
      const bcryptJSON = JSON.stringify({ hashed: dbUser?.password_hash  });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when hashed is blank", async () => { 
      const bcryptJSON = JSON.stringify({ toHash: testPassword, hashed: '' });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when hashed is not the correct length", async () => { 
      const bcryptJSON = JSON.stringify({ toHash: testPassword, hashed: 'testhash' });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it("should return 'invalid request' when hashed is missing", async () => { 
      const bcryptJSON = JSON.stringify({ toHash: testPassword });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: compareUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })

  describe('PUT hash - API: /api/bcrypt/hash', () => { 

    it('should return a hashed text', async () => { 
      const bcryptJSON = JSON.stringify({ toHash: 'testPassword' });
      const response = await axios({
        method: "put",
        data: bcryptJSON,
        withCredentials: true,
        url: hashUrl,
      })
      expect(response.status).toBe(200);
      expect(response.data.hashed).not.toBe(null);
      expect(response.data.hashed).not.toBe('');
    })
    it('should not return hashed test if null is passed', async () => { 
      try { 
        const response = await axios({
          method: "put",
          data: null,
          withCredentials: true,
          url: hashUrl,
        })
        expect(response.status).toBe(500);
        expect(response.data.message).toBe("Error bcrypt put");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(500);
          expect(err.response?.data.error).toBe("Error bcrypt put");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not return hashed test if tohash is null', async () => { 
      const bcryptJSON = JSON.stringify({ toHash: null });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: hashUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not return hashed test if tohash is missing', async () => { 
      const bcryptJSON = JSON.stringify({ somethingElse: 'testPassword' });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: hashUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not return hashed test if tohash is blank', async () => { 
      const bcryptJSON = JSON.stringify({ toHash: '' });
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: hashUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
    it('should not return hashed test if tohash is too long', async () => { 
      const bcryptJSON = JSON.stringify({ toHash: 'a'.repeat(maxToHashLength + 1)});
      try { 
        const response = await axios({
          method: "put",
          data: bcryptJSON,
          withCredentials: true,
          url: hashUrl,
        })
        expect(response.status).toBe(404);
        expect(response.data.message).toBe("invalid request");
      } catch (err) {
        if (err instanceof AxiosError) {
          expect(err.response?.status).toBe(404);
          expect(err.response?.data.error).toBe("invalid request");
        } else {
          expect(true).toBeFalsy();
        }
      }
    })
  })
})