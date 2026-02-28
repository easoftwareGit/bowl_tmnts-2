import axios, { AxiosError } from "axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import type { userType } from "@/lib/types/types";
import { initUser } from "@/lib/db/initVals";
import { patchUser } from "@/lib/db/users/dbUsers";

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

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;
const userUrl = url + "/user/";

const testUser: userType = {
  ...initUser,
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  password: "Test123!",
  phone: "+18005551212",
  role: "ADMIN",
};
const notFoundId = "usr_01234567890123456789012345678901";
const tmntId = "tmt_01234567890123456789012345678901";

describe("dbUsers.tsx", () => {

  describe("patchUsers()", () => {

    const toPatchUser = {
      id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    };

    beforeAll(async () => {
      
      // make sure test user is reset in database
      const userJSON = JSON.stringify(testUser);
      const patchResponse = await axios({
        method: "put",
        data: userJSON,
        withCredentials: true,
        url: userUrl + testUser.id,
      });
    });

    afterEach(async () => {
      try {
        const userJSON = JSON.stringify(testUser);
        const response = await axios({
          method: "put",
          data: userJSON,
          withCredentials: true,
          url: userUrl + testUser.id,
        });
      } catch (err) {
        if (err instanceof AxiosError) console.log(err.message);
      }
    });

    it("should patch a user first name by ID", async () => {
      const toBePatched = {
        ...toPatchUser,
        first_name: "Zach",
      };
      const patchedUser = (await patchUser(toBePatched)) as userType;
      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;
      expect(patchedUser.first_name).toEqual("Zach");
      expect(patchedUser.last_name).toEqual(testUser.last_name);
      expect(patchedUser.email).toEqual(testUser.email);
      expect(patchedUser.phone).toEqual(testUser.phone);
      expect(patchedUser.role).toEqual(testUser.role);
    });
    it("should patch a user last name and phone by ID", async () => {
      const toBePatched = {
        ...toPatchUser,
        last_name: "Jones",
        phone: "+18005559999",
      };
      const patchedUser = (await patchUser(toBePatched)) as userType;
      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;
      expect(patchedUser.last_name).toEqual(patchedUser.last_name);
      expect(patchedUser.phone).toEqual(patchedUser.phone);
      expect(patchedUser.first_name).toEqual(testUser.first_name);
      expect(patchedUser.email).toEqual(testUser.email);
      expect(patchedUser.role).toEqual(testUser.role);
    });
    it("should patch a user email by ID", async () => {
      const toBePatched = {
        ...toPatchUser,
        email: "zach@email.com",
      };
      const patchedUser = (await patchUser(toBePatched)) as userType;
      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;
      expect(patchedUser.email).toEqual(patchedUser.email);
      expect(patchedUser.first_name).toEqual(testUser.first_name);
      expect(patchedUser.last_name).toEqual(testUser.last_name);
      expect(patchedUser.phone).toEqual(testUser.phone);
      expect(patchedUser.role).toEqual(testUser.role);
    });
    it("should patch a user password by ID", async () => {
      const toBePatched = {
        ...toPatchUser,
        password: "321!Test",
      };
      const patchedUser = (await patchUser(toBePatched)) as userType;
      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;
      expect(patchedUser.email).toEqual(patchedUser.email);
      expect(patchedUser.first_name).toEqual(testUser.first_name);
      expect(patchedUser.last_name).toEqual(testUser.last_name);
      expect(patchedUser.phone).toEqual(testUser.phone);
      expect(patchedUser.role).toEqual(testUser.role);
    });
    it("should not patch a user by ID when id is not found", async () => {
      try { 
        const toBePatched = {
          ...toPatchUser,
          id: notFoundId,
          first_name: "Zach",
        };
        await patchUser(toBePatched);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "patchUser failed: Request failed with status code 404"
        );
      }      
    });
    it("should not patch a user by ID when email is a duplicate", async () => {      
      try { 
        const toBePatched = {
          ...toPatchUser,
          email: "chad@email.com", // from prisma/seed.ts
        };
        await patchUser(toBePatched);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe(
          "patchUser failed: Request failed with status code 409"
        );
      }      
    });
    it("should not patch a user by ID when id is invalid", async () => {
      try { 
        const toBePatched = {
          ...toPatchUser,
          id: "test",
          first_name: "Zach",
        };
        await patchUser(toBePatched);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user data");
      }      
    });
    it("should not patch a user by ID when id is valid, but not a user ID", async () => {
      try { 
        const toBePatched = {
          ...toPatchUser,
          id: tmntId,
          first_name: "Zach",
        };
        await patchUser(toBePatched);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user data");
      }      
    });
    it("should not patch a user by ID when id null", async () => {
      try { 
        const toBePatched = {
          ...toPatchUser,
          id: null as any,
          first_name: "Zach",
        };
        await patchUser(toBePatched);
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user data");
      }      
    });
    it("should not patch a user if ID is not in passed object", async () => {
      try { 
        const toBePatched = {
          first_name: "Zach",
        };
        await patchUser(toBePatched);        
      } catch (err) { 
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user data");
      }      
    });
  });
});
