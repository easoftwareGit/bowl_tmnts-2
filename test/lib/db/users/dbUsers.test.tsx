import { privateApi } from "@/lib/api/axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import type { userDataType, userFormType } from "@/lib/types/types";
import { initUserData, initUserForm } from "@/lib/db/initVals";
import { changePassword, getUserByEmail, getUserById, patchUser } from "@/lib/db/users/dbUsers";

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

const testUser: userFormType = {
  ...initUserForm,
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  password: "Test123!",
  phone: "+18005551212",
  role: "ADMIN",
};

const testUserData: userDataType = {
  ...initUserData,
  id: testUser.id,
  email: testUser.email,
  first_name: testUser.first_name,
  last_name: testUser.last_name,
  phone: testUser.phone,
  role: testUser.role,
};

const notFoundId = "usr_01234567890123456789012345678901";
const tmntId = "tmt_01234567890123456789012345678901";
const notFoundEmail = "notfound@email.com";

describe("dbUsers.tsx", () => {
  const userToGet = {
    ...initUserData,
    id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
    email: "adam@email.com",
    password_hash: '',
    first_name: "Adam",
    last_name: "Smith",
    phone: "+18005551212",
    role: "ADMIN",
  }

  describe("getUserById()", () => {      

    it("should get a user by ID", async () => {
      const gotUser = await getUserById(userToGet.id);      
      expect(gotUser).not.toBeNull();
      if (gotUser === null) return;
      expect(gotUser.id).toBe(userToGet.id);
      expect(gotUser.email).toBe(userToGet.email);
      expect(gotUser.first_name).toBe(userToGet.first_name);
      expect(gotUser.last_name).toBe(userToGet.last_name);
      expect(gotUser.phone).toBe(userToGet.phone);
      expect(gotUser.role).toBe(userToGet.role);      
    });

    it("should throw error when trying to get a user by ID that doesn't exist", async () => {
      await expect(getUserById(notFoundId)).rejects.toThrow(
        "getUserById failed: Request failed with status code 404",
      );
    });
    
    it('should throw error if user id is invalid', async () => {
      await expect(getUserById('test')).rejects.toThrow(
        'getUserById failed: Invalid user id'
      );
    });

    it('should throw error if user id is valid, but not a user id', async () => {
      await expect(getUserById(tmntId)).rejects.toThrow(
        'getUserById failed: Invalid user id'        
      );
    });

    it('should throw error if user id is null', async () => {
      await expect(getUserById(null as unknown as string)).rejects.toThrow(
        'getUserById failed: Invalid user id'
      );
    });
  });

  describe("getUserByEmail()", () => {      

    it("should get a user by email", async () => {
      const gotUser = await getUserByEmail(userToGet.email);
      expect(gotUser).not.toBeNull();
      if (gotUser === null) return;
      expect(gotUser.id).toBe(userToGet.id);
      expect(gotUser.email).toBe(userToGet.email);
      expect(gotUser.first_name).toBe(userToGet.first_name);
      expect(gotUser.last_name).toBe(userToGet.last_name);
      expect(gotUser.phone).toBe(userToGet.phone);
      expect(gotUser.role).toBe(userToGet.role);      
    });

    it("should throw error when trying to get a user by email that doesn't exist", async () => {
      const gotUser = await getUserByEmail(notFoundEmail);
      expect(gotUser).toBeNull();
    });
    
    it('should throw error if user email is invalid', async () => {
      await expect(getUserByEmail('test')).rejects.toThrow(
        'getUserByEmail failed: Invalid email'
      );
    });

    it('should throw error if user id is null', async () => {
      await expect(getUserByEmail(null as unknown as string)).rejects.toThrow(
        'getUserByEmail failed: Invalid email'
      );
    });
  });

  describe("patchUser()", () => {
    const toPatchUser: userDataType = {
      ...testUserData,
    };

    beforeAll(async () => {
      // make sure test user is reset in database
      const userJSON = JSON.stringify(testUser);
      await privateApi.put(userUrl + testUser.id, userJSON);
    });

    afterEach(async () => {
      try {
        const userJSON = JSON.stringify(testUser);
        await privateApi.put(userUrl + testUser.id, userJSON);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    });

    it("should patch a user first name by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        first_name: "Zach",
      };

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;

      expect(patchedUser.first_name).toEqual("Zach");
      expect(patchedUser.last_name).toEqual(testUser.last_name);
      expect(patchedUser.email).toEqual(testUser.email);
      expect(patchedUser.phone).toEqual(testUser.phone);
      expect(patchedUser.role).toEqual(testUser.role);
    });

    it("should patch a user last name and phone by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        last_name: "Jones",
        phone: "+18005559999",
      };

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;

      expect(patchedUser.last_name).toEqual("Jones");
      expect(patchedUser.phone).toEqual("+18005559999");
      expect(patchedUser.first_name).toEqual(testUser.first_name);
      expect(patchedUser.email).toEqual(testUser.email);
      expect(patchedUser.role).toEqual(testUser.role);
    });

    it("should patch a user email by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        email: "zach@email.com",
      };

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).not.toBeNull();
      if (patchedUser === null) return;

      expect(patchedUser.email).toEqual("zach@email.com");
      expect(patchedUser.first_name).toEqual(testUser.first_name);
      expect(patchedUser.last_name).toEqual(testUser.last_name);
      expect(patchedUser.phone).toEqual(testUser.phone);
      expect(patchedUser.role).toEqual(testUser.role);
    });

    it("should not patch a user by ID when id is not found", async () => {
      try {
        const toBePatched: userDataType = {
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
        const toBePatched: userDataType = {
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
          id: null,
          first_name: "Zach",
        };

        await patchUser(toBePatched as unknown as userDataType);
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

        await patchUser(toBePatched as unknown as userDataType);
      } catch (err) {
        expect(err).toBeInstanceOf(Error);
        expect((err as Error).message).toBe("Invalid user data");
      }
    });
  });

  describe("changePassword()", () => {
    const originalPassword = testUser.password;
    const newPassword = "321Test!";
    const wrongPassword = "Wrong123!";

    const noPasswordUser: userFormType = {
      ...initUserForm,
      id: "usr_0f1e2d3c4b5a69788776655443322110",
      email: "nopassword@email.com",
      password: "",
      first_name: "No",
      last_name: "Password",
      phone: "+18005550123",
      role: "USER",
    };

    let createdNoPasswordUser = false;

    const deleteNoPasswordUser = async () => {
      try {
        await privateApi.delete(userUrl + noPasswordUser.id);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }
    };

    const createNoPasswordDbUser = async () => {
      await deleteNoPasswordUser();
      const userJSON = JSON.stringify(noPasswordUser);
      await privateApi.post(url, userJSON);
      createdNoPasswordUser = true;
    };

    beforeAll(async () => {
      const userJSON = JSON.stringify(testUser);
      await privateApi.put(userUrl + testUser.id, userJSON);
      await deleteNoPasswordUser();
    });

    beforeEach(async () => {
      const userJSON = JSON.stringify(testUser);
      await privateApi.put(userUrl + testUser.id, userJSON);
      createdNoPasswordUser = false;
    });

    afterEach(async () => {
      try {
        const userJSON = JSON.stringify(testUser);
        await privateApi.put(userUrl + testUser.id, userJSON);
      } catch (err) {
        if (err instanceof Error) {
          console.log(err.message);
        }
      }

      if (createdNoPasswordUser) {
        await deleteNoPasswordUser();
        createdNoPasswordUser = false;
      }
    });

    it("should change a user's password", async () => {
      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should not change password when user id is invalid", async () => {
      const result = await changePassword(
        "test",
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid user id");
    });

    it("should not change password when user id is valid, but not a user id", async () => {
      const result = await changePassword(
        tmntId,
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid user id");
    });

    it("should not change password when user id is null", async () => {
      const result = await changePassword(
        null as unknown as string,
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid user id");
    });

    it("should not change password when user is not found", async () => {
      const result = await changePassword(
        notFoundId,
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("not found");      
    });

    it("should not change password when current password is invalid format", async () => {
      const result = await changePassword(
        testUser.id,
        "test",
        newPassword
      );

      expect(result.success).toBe(false);      
      expect(result.error).toBe("Invalid password");
    });

    it("should not change password when new password is invalid format", async () => {
      const result = await changePassword(
        testUser.id,
        originalPassword,
        "test"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Invalid password");      
    });

    it("should not change password when new password is the same as current password", async () => {
      const result = await changePassword(
        testUser.id,
        originalPassword,
        originalPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("New password must be different");      
    });

    it("should not change password when current password is incorrect", async () => {
      const result = await changePassword(
        testUser.id,
        wrongPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Current Password is incorrect");      
    });

    it("should not change password when user has no password", async () => {
      await createNoPasswordDbUser();

      const result = await changePassword(
        noPasswordUser.id,
        originalPassword,
        newPassword
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("User has no password");
    });
  });

});
