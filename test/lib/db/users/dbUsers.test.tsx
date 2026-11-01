// Tests for src/lib/db/users/dbUsers.tsx using a mocked axios instance module.
// No database or server needed.
import { publicApi, privateApi } from "@/lib/api/axios";
import { AxiosError, AxiosHeaders } from "axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import type { acctUserType, userDataType, userFormType } from "@/lib/types/types";
import { blankUserData, initUserData, initUserForm } from "@/lib/db/initVals";
import {
  changePassword,
  getAcctUserById,
  getUserById,
  isEmailInUse,
  mapApiUserToAcctUser,
  mapApiUserToUser,
  patchUser,
} from "@/lib/db/users/dbUsers";

// Replace the axios instances with mock functions each test can control.
// Only "@/lib/api/axios" is mocked, so AxiosError from "axios" stays real.
jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: { get: jest.fn() },
  privateApi: { get: jest.fn(), patch: jest.fn() },
}));
const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivateGet = privateApi.get as jest.Mock;
const mockPatch = privateApi.patch as jest.Mock;

// same url logic as dbUsers.tsx; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseUsersApi
  ? testBaseUsersApi
  : baseUsersApi;
const userUrl = url + "/user/";
const emailUrl = url + "/email/";

// A real AxiosError, like axios rejects with for a non-2xx response.
// changePassword reads response.data.error, so data can be passed in.
const axiosError = (status: number, data: { error?: string } = {}) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status,
      statusText: "",
      data,
      headers: {},
      config: { headers: new AxiosHeaders() },
    }
  );

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

// what the user routes send back: public fields plus has_password
// (never password_hash, failed_pwd_attempts or pwd_locked_until)
const apiUserFrom = (user: userDataType, has_password = true) => ({
  id: user.id,
  email: user.email,
  first_name: user.first_name,
  last_name: user.last_name,
  phone: user.phone,
  role: user.role,
  has_password,
});
const apiUser = apiUserFrom(testUserData);

// what mapApiUserToUser returns for apiUser (has_password is dropped)
const mappedUser: userDataType = {
  ...blankUserData,
  id: testUserData.id,
  email: testUserData.email,
  first_name: testUserData.first_name,
  last_name: testUserData.last_name,
  phone: testUserData.phone,
  role: testUserData.role,
};

// what mapApiUserToAcctUser returns for apiUser (has_password is kept)
const mappedAcctUser: acctUserType = { ...mappedUser, has_password: true };

// an api user with private fields that must never be carried over
const apiUserWithSecrets = {
  ...apiUser,
  password_hash: "hashed-Test123!",
  failed_pwd_attempts: 5,
  pwd_locked_until: "2026-12-31T00:00:00.000Z",
  extra: "x",
};

const privateFields = ["password_hash", "failed_pwd_attempts", "pwd_locked_until"];

const notFoundId = "usr_01234567890123456789012345678901";
const tmntId = "tmt_01234567890123456789012345678901";

describe("dbUsers.tsx", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockPublicGet.mockReset();
    mockPrivateGet.mockReset();
    mockPatch.mockReset();
  });

  describe("mapApiUserToUser()", () => {
    it("should map an api user to user data", () => {
      expect(mapApiUserToUser(apiUser)).toEqual(mappedUser);
    });

    it("should fill missing fields with blanks and default role to USER", () => {
      expect(mapApiUserToUser({ id: testUser.id })).toEqual({
        ...blankUserData,
        id: testUser.id,
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "USER",
      });
    });

    it("should map an empty object to blank user data", () => {
      expect(mapApiUserToUser({})).toEqual({ ...blankUserData, role: "USER" });
    });

    it("should drop has_password", () => {
      const mapped = mapApiUserToUser(apiUser);

      expect(mapped).not.toHaveProperty("has_password");
    });

    it("should not carry extra or private api fields into the user", () => {
      const mapped = mapApiUserToUser(apiUserWithSecrets);

      expect(mapped).toEqual(mappedUser);
      expect(Object.keys(mapped).sort()).toEqual(Object.keys(mappedUser).sort());
      privateFields.forEach((field) => {
        expect(mapped).not.toHaveProperty(field);
      });
    });
  });

  describe("mapApiUserToAcctUser()", () => {
    it("should map an api user to account user data with has_password", () => {
      expect(mapApiUserToAcctUser(apiUser)).toEqual(mappedAcctUser);
    });

    it("should set has_password false when the api says false", () => {
      const mapped = mapApiUserToAcctUser(apiUserFrom(testUserData, false));

      expect(mapped).toEqual({ ...mappedUser, has_password: false });
    });

    it("should set has_password false when it is missing", () => {
      const noFlag = {
        id: apiUser.id,
        email: apiUser.email,
        first_name: apiUser.first_name,
        last_name: apiUser.last_name,
        phone: apiUser.phone,
        role: apiUser.role,
      };

      expect(mapApiUserToAcctUser(noFlag).has_password).toBe(false);
    });

    it.each([
      ["the string 'true'", "true"],
      ["the number 1", 1],
      ["null", null],
    ])("should set has_password false when it is %s (only true counts)", (_label, value) => {
      const mapped = mapApiUserToAcctUser({
        ...apiUser,
        has_password: value as unknown as boolean,
      });

      expect(mapped.has_password).toBe(false);
    });

    it("should fill missing fields like mapApiUserToUser", () => {
      expect(mapApiUserToAcctUser({ id: testUser.id })).toEqual({
        ...mapApiUserToUser({ id: testUser.id }),
        has_password: false,
      });
    });

    it("should not carry extra or private api fields into the user", () => {
      const mapped = mapApiUserToAcctUser(apiUserWithSecrets);

      expect(mapped).toEqual(mappedAcctUser);
      expect(Object.keys(mapped).sort()).toEqual(Object.keys(mappedAcctUser).sort());
      privateFields.forEach((field) => {
        expect(mapped).not.toHaveProperty(field);
      });
    });
  });

  describe("getAcctUserById()", () => {
    it("should get an account user by ID with has_password", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUser } });

      const gotUser = await getAcctUserById(testUser.id);

      expect(gotUser).toEqual(mappedAcctUser);
    });

    it("should return has_password false for a user with no password", async () => {
      mockPrivateGet.mockResolvedValue({
        data: { user: apiUserFrom(testUserData, false) },
      });

      const gotUser = await getAcctUserById(testUser.id);

      expect(gotUser.has_password).toBe(false);
    });

    it("should call the user url once with the private api", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUser } });

      await getAcctUserById(testUser.id);

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(userUrl + testUser.id);
      expect(mockPublicGet).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should not return private fields even if the api sends them", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUserWithSecrets } });

      const gotUser = await getAcctUserById(testUser.id);

      expect(gotUser).toEqual(mappedAcctUser);
      privateFields.forEach((field) => {
        expect(gotUser).not.toHaveProperty(field);
      });
    });

    it.each([
      ["not logged in", 401],
      ["not authorized", 403],
      ["not found", 404],
      ["a server error", 500],
    ])("should throw error when the API answers %s", async (_label, status) => {
      mockPrivateGet.mockRejectedValue(axiosError(status));

      await expect(getAcctUserById(testUser.id)).rejects.toThrow(
        `getAcctUserById failed: Request failed with status code ${status}`
      );
    });

    it("should throw error when the response has no user", async () => {
      mockPrivateGet.mockResolvedValue({ data: {} });

      await expect(getAcctUserById(testUser.id)).rejects.toThrow(
        "getAcctUserById failed: Error getting user"
      );
    });

    it.each([
      ["invalid", "test"],
      ["valid, but not a user id", tmntId],
      ["null", null as unknown as string],
    ])("should throw error if user id is %s", async (_label, id) => {
      await expect(getAcctUserById(id)).rejects.toThrow(
        "getAcctUserById failed: Invalid user id"
      );
      expect(mockPrivateGet).not.toHaveBeenCalled();
    });
  });

  describe("getUserById()", () => {
    it("should get a user by ID", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUser } });

      const gotUser = await getUserById(testUser.id);

      expect(gotUser).toEqual(mappedUser);
    });

    it("should call the user url once with the private api", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUser } });

      await getUserById(testUser.id);

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(userUrl + testUser.id);
      expect(mockPublicGet).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should drop has_password from the user", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUser } });

      const gotUser = await getUserById(testUser.id);

      expect(gotUser).not.toHaveProperty("has_password");
    });

    it("should not return private fields even if the api sends them", async () => {
      mockPrivateGet.mockResolvedValue({ data: { user: apiUserWithSecrets } });

      const gotUser = await getUserById(testUser.id);

      expect(gotUser).toEqual(mappedUser);
      privateFields.forEach((field) => {
        expect(gotUser).not.toHaveProperty(field);
      });
    });

    it("should throw error when trying to get a user by ID that doesn't exist", async () => {
      mockPrivateGet.mockRejectedValue(axiosError(404));

      await expect(getUserById(notFoundId)).rejects.toThrow(
        "getUserById failed: Request failed with status code 404"
      );
      expect(mockPrivateGet).toHaveBeenCalledWith(userUrl + notFoundId);
    });

    it.each([
      ["not logged in", 401],
      ["not a director", 403],
    ])("should throw error when the user is %s", async (_label, status) => {
      mockPrivateGet.mockRejectedValue(axiosError(status));

      await expect(getUserById(testUser.id)).rejects.toThrow(
        `getUserById failed: Request failed with status code ${status}`
      );
    });

    it("should throw error when the response has no user", async () => {
      mockPrivateGet.mockResolvedValue({ data: {} });

      await expect(getUserById(testUser.id)).rejects.toThrow(
        "getUserById failed: Error getting user"
      );
    });

    it("should throw error when the API call fails", async () => {
      mockPrivateGet.mockRejectedValue(axiosError(500));

      await expect(getUserById(testUser.id)).rejects.toThrow(
        "getUserById failed: Request failed with status code 500"
      );
    });

    it.each([
      ["invalid", "test"],
      ["valid, but not a user id", tmntId],
      ["null", null as unknown as string],
    ])("should throw error if user id is %s", async (_label, id) => {
      await expect(getUserById(id)).rejects.toThrow(
        "getUserById failed: Invalid user id"
      );
      expect(mockPrivateGet).not.toHaveBeenCalled();
    });
  });

  describe("isEmailInUse()", () => {
    it("should return true when a user has the email", async () => {
      mockPublicGet.mockResolvedValue({ data: { gotUser: true } });

      const inUse = await isEmailInUse(testUser.email);

      expect(inUse).toBe(true);
    });

    it("should return false when no user has the email", async () => {
      mockPublicGet.mockResolvedValue({ data: { gotUser: false } });

      const inUse = await isEmailInUse("notfound@email.com");

      expect(inUse).toBe(false);
    });

    it("should call the email url once with the public api", async () => {
      mockPublicGet.mockResolvedValue({ data: { gotUser: true } });

      await isEmailInUse(testUser.email);

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(
        emailUrl + encodeURIComponent(testUser.email)
      );
      expect(mockPrivateGet).not.toHaveBeenCalled();
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should url encode the email", async () => {
      mockPublicGet.mockResolvedValue({ data: { gotUser: true } });

      await isEmailInUse("adam@email.com");

      // "@" is sent as "%40"
      expect(mockPublicGet).toHaveBeenCalledWith(emailUrl + "adam%40email.com");
    });

    it.each([
      ["upper case", "Adam@Email.COM"],
      ["spaces", "  adam@email.com  "],
      ["upper case and spaces", "  Adam@Email.COM  "],
      ["tabs and newlines", "\t adam@email.com \n"],
    ])("should trim and lower case an email with %s", async (_label, email) => {
      mockPublicGet.mockResolvedValue({ data: { gotUser: true } });

      await isEmailInUse(email);

      expect(mockPublicGet).toHaveBeenCalledWith(emailUrl + "adam%40email.com");
    });

    it.each([
      ["empty", ""],
      ["null", null as unknown as string],
      ["only spaces", "   "],
      ["not an email", "test"],
      ["missing the @", "adam.email.com"],
      ["missing the domain", "adam@"],
      ["not an email with spaces", "  test  "],
      ["too long", "a".repeat(250) + "@email.com"],
    ])("should throw error and not call the api when email is %s", async (_label, email) => {
      await expect(isEmailInUse(email)).rejects.toThrow(
        "isEmailInUse failed: Invalid email"
      );
      expect(mockPublicGet).not.toHaveBeenCalled();
    });

    it.each([
      ["no data", undefined],
      ["no gotUser", {}],
      ["gotUser is a string", { gotUser: "true" }],
      ["gotUser is null", { gotUser: null }],
    ])("should throw error when the response has %s", async (_label, data) => {
      mockPublicGet.mockResolvedValue({ data });

      await expect(isEmailInUse(testUser.email)).rejects.toThrow(
        "isEmailInUse failed: Invalid response"
      );
    });

    it("should throw error when the API call fails", async () => {
      mockPublicGet.mockRejectedValue(axiosError(500));

      await expect(isEmailInUse(testUser.email)).rejects.toThrow(
        "isEmailInUse failed: Request failed with status code 500"
      );
    });
  });

  describe("patchUser()", () => {
    const toPatchUser: userDataType = {
      ...testUserData,
    };

    // the only fields patchUser sends
    const sentFields = (user: userDataType) => ({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
    });

    it("should patch a user first name by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        first_name: "Zach",
      };
      mockPatch.mockResolvedValue({ data: { user: apiUserFrom(toBePatched) } });

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).toEqual({ ...mappedUser, first_name: "Zach" });
    });

    it("should patch a user last name and phone by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        last_name: "Jones",
        phone: "+18005559999",
      };
      mockPatch.mockResolvedValue({ data: { user: apiUserFrom(toBePatched) } });

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).toEqual({
        ...mappedUser,
        last_name: "Jones",
        phone: "+18005559999",
      });
    });

    it("should patch a user email by ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        email: "zach@email.com",
      };
      mockPatch.mockResolvedValue({ data: { user: apiUserFrom(toBePatched) } });

      const patchedUser = await patchUser(toBePatched);

      expect(patchedUser).toEqual({ ...mappedUser, email: "zach@email.com" });
    });

    it("should patch only the editable fields to the user url with the private api", async () => {
      mockPatch.mockResolvedValue({ data: { user: apiUser } });

      await patchUser(toPatchUser);

      expect(mockPatch).toHaveBeenCalledTimes(1);
      expect(mockPatch).toHaveBeenCalledWith(
        userUrl + toPatchUser.id,
        sentFields(toPatchUser)
      );
      expect(mockPublicGet).not.toHaveBeenCalled();
      expect(mockPrivateGet).not.toHaveBeenCalled();
    });

    it("should never send the id, role or a password", async () => {
      mockPatch.mockResolvedValue({ data: { user: apiUser } });
      // a form object with extra fields, passed in by mistake
      const withExtras = {
        ...toPatchUser,
        role: "USER",
        password: "Test123!",
      } as unknown as userDataType;

      await patchUser(withExtras);

      const sentBody = mockPatch.mock.calls[0][1];
      expect(Object.keys(sentBody).sort()).toEqual(
        ["email", "first_name", "last_name", "phone"]
      );
      expect(sentBody).not.toHaveProperty("id");
      expect(sentBody).not.toHaveProperty("role");
      expect(sentBody).not.toHaveProperty("password");
    });

    it("should send an object, not a JSON string", async () => {
      mockPatch.mockResolvedValue({ data: { user: apiUser } });

      await patchUser(toPatchUser);

      expect(typeof mockPatch.mock.calls[0][1]).toBe("object");
    });

    it("should return the role from the api, not from the passed user", async () => {
      // role is not sent, so the saved role comes back unchanged
      mockPatch.mockResolvedValue({ data: { user: apiUser } });
      const withOtherRole: userDataType = { ...toPatchUser, role: "USER" };

      const patchedUser = await patchUser(withOtherRole);

      expect(patchedUser?.role).toBe("ADMIN");
    });

    it("should drop has_password and private fields from the result", async () => {
      mockPatch.mockResolvedValue({ data: { user: apiUserWithSecrets } });

      const patchedUser = await patchUser(toPatchUser);

      expect(patchedUser).toEqual(mappedUser);
      expect(patchedUser).not.toHaveProperty("has_password");
      privateFields.forEach((field) => {
        expect(patchedUser).not.toHaveProperty(field);
      });
    });

    it("should not patch a user by ID when id is not found", async () => {
      mockPatch.mockRejectedValue(axiosError(404));
      const toBePatched: userDataType = {
        ...toPatchUser,
        id: notFoundId,
        first_name: "Zach",
      };

      await expect(patchUser(toBePatched)).rejects.toThrow(
        "patchUser failed: Request failed with status code 404"
      );
    });

    it("should not patch a user by ID when email is a duplicate", async () => {
      mockPatch.mockRejectedValue(axiosError(409));
      const toBePatched: userDataType = {
        ...toPatchUser,
        email: "chad@email.com", // from prisma/seed.ts
      };

      await expect(patchUser(toBePatched)).rejects.toThrow(
        "patchUser failed: Request failed with status code 409"
      );
    });

    it.each([
      ["not logged in", 401],
      ["not a director", 403],
      ["invalid data", 422],
    ])("should throw error when the api answers %s", async (_label, status) => {
      mockPatch.mockRejectedValue(axiosError(status));

      await expect(patchUser(toPatchUser)).rejects.toThrow(
        `patchUser failed: Request failed with status code ${status}`
      );
    });

    it("should throw error when the response has no user", async () => {
      mockPatch.mockResolvedValue({ data: {} });

      await expect(patchUser(toPatchUser)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );
    });

    it("should not patch a user by ID when id is invalid", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        id: "test",
        first_name: "Zach",
      };

      await expect(patchUser(toBePatched)).rejects.toThrow("Invalid user data");
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should not patch a user by ID when id is valid, but not a user ID", async () => {
      const toBePatched: userDataType = {
        ...toPatchUser,
        id: tmntId,
        first_name: "Zach",
      };

      await expect(patchUser(toBePatched)).rejects.toThrow("Invalid user data");
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should not patch a user by ID when id null", async () => {
      const toBePatched = {
        ...toPatchUser,
        id: null,
        first_name: "Zach",
      };

      await expect(
        patchUser(toBePatched as unknown as userDataType)
      ).rejects.toThrow("Invalid user data");
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should not patch a user if ID is not in passed object", async () => {
      const toBePatched = {
        first_name: "Zach",
      };

      await expect(
        patchUser(toBePatched as unknown as userDataType)
      ).rejects.toThrow("Invalid user data");
      expect(mockPatch).not.toHaveBeenCalled();
    });

    it("should not patch a user when passed null", async () => {
      await expect(
        patchUser(null as unknown as userDataType)
      ).rejects.toThrow("Invalid user data");
      expect(mockPatch).not.toHaveBeenCalled();
    });
  });

  describe("changePassword()", () => {
    const originalPassword = testUser.password;
    const newPassword = "321Test!";
    const wrongPassword = "Wrong123!";
    const pwdUrl = userUrl + testUser.id + "/changePassword";

    it("should change a user's password", async () => {
      mockPatch.mockResolvedValue({ data: { success: true } });

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: true });
    });

    it("should patch the passwords to the change password url with the private api", async () => {
      mockPatch.mockResolvedValue({ data: { success: true } });

      await changePassword(testUser.id, originalPassword, newPassword);

      expect(mockPatch).toHaveBeenCalledTimes(1);
      expect(mockPatch).toHaveBeenCalledWith(pwdUrl, {
        currentPassword: originalPassword,
        newPassword,
      });
      expect(mockPublicGet).not.toHaveBeenCalled();
      expect(mockPrivateGet).not.toHaveBeenCalled();
    });

    it("should return an error when the response has no data", async () => {
      mockPatch.mockResolvedValue({ data: undefined });

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false, error: "No response data" });
    });

    it.each([
      ["invalid", "test"],
      ["valid, but not a user id", tmntId],
      ["null", null as unknown as string],
    ])("should not change password when user id is %s", async (_label, id) => {
      const result = await changePassword(id, originalPassword, newPassword);

      expect(result).toEqual({ success: false, error: "Invalid user id" });
      expect(mockPatch).not.toHaveBeenCalled();
    });

    // The route's error text comes back in response.data.error.
    // Only the text matters to changePassword, not the status code.
    it("should not change password when user is not found", async () => {
      mockPatch.mockRejectedValue(axiosError(404, { error: "not found" }));

      const result = await changePassword(
        notFoundId,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false, error: "not found" });
      expect(mockPatch).toHaveBeenCalledWith(
        userUrl + notFoundId + "/changePassword",
        { currentPassword: originalPassword, newPassword }
      );
    });

    it.each([
      ["not logged in", 401, "not logged in"],
      ["not the same user", 403, "not authorized"],
    ])("should not change password when %s", async (_label, status, message) => {
      // requireSelf sends { message }, not { error }; changePassword reads both
      mockPatch.mockRejectedValue(
        new AxiosError(
          `Request failed with status code ${status}`,
          "ERR_BAD_REQUEST",
          undefined,
          undefined,
          {
            status,
            statusText: "",
            data: { message },
            headers: {},
            config: { headers: new AxiosHeaders() },
          }
        )
      );

      const result = await changePassword(testUser.id, originalPassword, newPassword);

      expect(result).toEqual({ success: false, error: message });
    });

    it("should prefer the route's error text over its message text", async () => {
      mockPatch.mockRejectedValue(
        new AxiosError(
          "Request failed with status code 400",
          "ERR_BAD_REQUEST",
          undefined,
          undefined,
          {
            status: 400,
            statusText: "",
            data: { error: "Invalid password", message: "some other text" },
            headers: {},
            config: { headers: new AxiosHeaders() },
          }
        )
      );

      const result = await changePassword(testUser.id, originalPassword, newPassword);

      expect(result).toEqual({ success: false, error: "Invalid password" });
    });

    it("should not change password when current password is invalid format", async () => {
      mockPatch.mockRejectedValue(axiosError(400, { error: "Invalid password" }));

      const result = await changePassword(testUser.id, "test", newPassword);

      expect(result).toEqual({ success: false, error: "Invalid password" });
    });

    it("should not change password when new password is invalid format", async () => {
      mockPatch.mockRejectedValue(axiosError(400, { error: "Invalid password" }));

      const result = await changePassword(testUser.id, originalPassword, "test");

      expect(result).toEqual({ success: false, error: "Invalid password" });
    });

    it("should not change password when new password is the same as current password", async () => {
      mockPatch.mockRejectedValue(
        axiosError(400, { error: "New password must be different" })
      );

      const result = await changePassword(
        testUser.id,
        originalPassword,
        originalPassword
      );

      expect(result).toEqual({
        success: false,
        error: "New password must be different",
      });
    });

    it("should not change password when current password is incorrect", async () => {
      mockPatch.mockRejectedValue(
        axiosError(400, { error: "Current Password is incorrect" })
      );

      const result = await changePassword(
        testUser.id,
        wrongPassword,
        newPassword
      );

      expect(result).toEqual({
        success: false,
        error: "Current Password is incorrect",
      });
    });

    it("should not change password when the account is locked", async () => {
      mockPatch.mockRejectedValue(
        axiosError(429, { error: "Too many attempts, try again in 15 minutes" })
      );

      const result = await changePassword(
        testUser.id,
        wrongPassword,
        newPassword
      );

      expect(result).toEqual({
        success: false,
        error: "Too many attempts, try again in 15 minutes",
      });
    });

    it("should not change password when user has no password", async () => {
      mockPatch.mockRejectedValue(
        axiosError(400, { error: "User has no password" })
      );

      const result = await changePassword(
        "usr_0f1e2d3c4b5a69788776655443322110",
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false, error: "User has no password" });
    });

    // With no text from the route, changePassword returns no error, so the
    // page shows its own friendly message instead of axios/technical text.
    it("should return no error text when the route sends none", async () => {
      mockPatch.mockRejectedValue(axiosError(500));

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false });
      expect(result).not.toHaveProperty("error");
    });

    it("should return no error text when a plain error is thrown", async () => {
      mockPatch.mockRejectedValue(new Error("Network Error"));

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false });
      expect(result).not.toHaveProperty("error");
    });

    it("should return no error text when something other than an error is thrown", async () => {
      mockPatch.mockRejectedValue("something odd");

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false });
      expect(result).not.toHaveProperty("error");
    });

    it("should ignore an empty error text from the route", async () => {
      mockPatch.mockRejectedValue(axiosError(400, { error: "" }));

      const result = await changePassword(
        testUser.id,
        originalPassword,
        newPassword
      );

      expect(result).toEqual({ success: false });
    });
  });
});