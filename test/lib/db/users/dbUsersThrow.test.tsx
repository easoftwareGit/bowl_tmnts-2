// Non standard throw / error cases for src/lib/db/users/dbUsers.tsx
// using a mocked axios instance module. No database or server needed.
import { publicApi, privateApi } from "@/lib/api/axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import {
  changePassword,
  getAcctUserById,
  getUserById,
  isEmailInUse,
  patchUser,
} from "@/lib/db/users/dbUsers";
import type { userDataType } from "@/lib/types/types";
import { initUserData } from "@/lib/db/initVals";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockPublicGet = publicApi.get as jest.Mock;
const mockPrivateGet = privateApi.get as jest.Mock;
const mockPrivatePatch = privateApi.patch as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseUsersApi
  ? testBaseUsersApi
  : baseUsersApi;

const userUrl = url + "/user/";
const emailUrl = url + "/email/";

const testUserId = "usr_5bcefb5d314fff1ff5da6521a2fa7bde";
const testEmail = "adam@email.com";

const userToPatch: userDataType = {
  ...initUserData,
  id: testUserId,
  email: testEmail,
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "ADMIN",
};

// the only fields patchUser sends
const patchBody = {
  first_name: userToPatch.first_name,
  last_name: userToPatch.last_name,
  email: userToPatch.email,
  phone: userToPatch.phone,
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPublicGet.mockReset();
    mockPrivateGet.mockReset();
    mockPrivatePatch.mockReset();
  });

  // getUserById and getAcctUserById share the same flow (private GET of the
  // user url), so they share the same non standard cases
  describe.each([
    ["getUserById", getUserById],
    ["getAcctUserById", getAcctUserById],
  ] as const)("%s - non standard throw cases", (name, getUser) => {
    it("should throw an error when response.data.user is missing", async () => {
      mockPrivateGet.mockResolvedValue({
        data: {},
      });

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: Error getting user`
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
      expect(mockPrivateGet).toHaveBeenCalledWith(userUrl + testUserId);
      expect(mockPublicGet).not.toHaveBeenCalled();
    });

    it("should throw an error when response.data.user is null", async () => {
      mockPrivateGet.mockResolvedValue({
        data: { user: null },
      });

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: Error getting user`
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivateGet.mockResolvedValue({
        data: null,
      });

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: Error getting user`
      );
    });

    it("should throw an error when response has no data", async () => {
      mockPrivateGet.mockResolvedValue({});

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: Error getting user`
      );
    });

    it("should throw with custom message if privateApi.get rejects", async () => {
      mockPrivateGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: Network Error`
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.get rejects with non-error", async () => {
      mockPrivateGet.mockRejectedValueOnce("testing 123");

      await expect(getUser(testUserId)).rejects.toThrow(
        `${name} failed: testing 123`
      );

      expect(mockPrivateGet).toHaveBeenCalledTimes(1);
    });

    it("should throw before calling the API when the user id is invalid", async () => {
      await expect(getUser("invalid")).rejects.toThrow(
        `${name} failed: Invalid user id`
      );

      expect(mockPrivateGet).not.toHaveBeenCalled();
    });
  });

  describe("isEmailInUse - non standard throw cases", () => {
    it("should throw an error when response.data has no gotUser property", async () => {
      mockPublicGet.mockResolvedValue({
        data: {},
      });

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: Invalid response"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
      expect(mockPublicGet).toHaveBeenCalledWith(
        emailUrl + encodeURIComponent(testEmail)
      );
      expect(mockPrivateGet).not.toHaveBeenCalled();
    });

    it("should throw an error when response.data is null", async () => {
      mockPublicGet.mockResolvedValue({
        data: null,
      });

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: Invalid response"
      );
    });

    it("should throw an error when response has no data", async () => {
      mockPublicGet.mockResolvedValue({});

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: Invalid response"
      );
    });

    it("should throw an error when gotUser is not a boolean", async () => {
      mockPublicGet.mockResolvedValue({
        data: { gotUser: "true" },
      });

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: Invalid response"
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockPublicGet.mockRejectedValueOnce(new Error("Network Error"));

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: Network Error"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockPublicGet.mockRejectedValueOnce("testing 123");

      await expect(isEmailInUse(testEmail)).rejects.toThrow(
        "isEmailInUse failed: testing 123"
      );

      expect(mockPublicGet).toHaveBeenCalledTimes(1);
    });

    it("should throw before calling the API when the email is invalid", async () => {
      await expect(isEmailInUse("invalid")).rejects.toThrow(
        "isEmailInUse failed: Invalid email"
      );

      expect(mockPublicGet).not.toHaveBeenCalled();
    });
  });

  describe("patchUser - non standard throw cases", () => {
    it("should throw an error when response.data.user is missing", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: {},
      });

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );

      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
      expect(mockPrivatePatch).toHaveBeenCalledWith(
        userUrl + userToPatch.id,
        patchBody
      );
    });

    it("should throw an error when response.data.user is null", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: { user: null },
      });

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: null,
      });

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );
    });

    it("should throw an error when response has no data", async () => {
      mockPrivatePatch.mockResolvedValue({});

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockPrivatePatch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: Network Error"
      );

      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockPrivatePatch.mockRejectedValueOnce("testing 123");

      await expect(patchUser(userToPatch)).rejects.toThrow(
        "patchUser failed: testing 123"
      );

      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
    });

    it("should throw before calling the API when the user id is invalid", async () => {
      await expect(
        patchUser({ ...userToPatch, id: "invalid" })
      ).rejects.toThrow("Invalid user data");

      expect(mockPrivatePatch).not.toHaveBeenCalled();
    });
  });

  // changePassword never throws; it returns { success: false, error? }.
  // error is only set when the route sent text; otherwise the page shows
  // its own default message.
  describe("changePassword - non standard error cases", () => {
    const pwdUrl = userUrl + testUserId + "/changePassword";

    it("should return an error when response.data is null", async () => {
      mockPrivatePatch.mockResolvedValue({
        data: null,
      });

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false, error: "No response data" });
      expect(mockPrivatePatch).toHaveBeenCalledTimes(1);
      expect(mockPrivatePatch).toHaveBeenCalledWith(pwdUrl, {
        currentPassword: "Test123!",
        newPassword: "321Test!",
      });
    });

    it("should return an error when response has no data", async () => {
      mockPrivatePatch.mockResolvedValue({});

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false, error: "No response data" });
    });

    it("should return no error text if privateApi.patch rejects with an Error", async () => {
      mockPrivatePatch.mockRejectedValueOnce(new Error("Network Error"));

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false });
      expect(result).not.toHaveProperty("error");
    });

    it("should return no error text when privateApi.patch rejects with non-error", async () => {
      mockPrivatePatch.mockRejectedValueOnce("testing 123");

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false });
      expect(result).not.toHaveProperty("error");
    });

    it.each([
      ["response.data is null", { response: { data: null } }],
      ["response.data is a string", { response: { data: "Bad Gateway" } }],
      ["response has no data", { response: {} }],
      ["error and message are empty", { response: { data: { error: "", message: "" } } }],
    ])("should return no error text when %s", async (_label, rejected) => {
      mockPrivatePatch.mockRejectedValueOnce(rejected);

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false });
    });

    // axios never rejects with null or undefined, but a mock or interceptor could
    it.each([
      ["null", null],
      ["undefined", undefined],
    ])("should not throw when privateApi.patch rejects with %s", async (_label, rejected) => {
      mockPrivatePatch.mockRejectedValueOnce(rejected);

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false });
    });

    it("should use the message text when the route sends no error text", async () => {
      mockPrivatePatch.mockRejectedValueOnce({
        response: { data: { message: "not authorized" } },
      });

      const result = await changePassword(testUserId, "Test123!", "321Test!");

      expect(result).toEqual({ success: false, error: "not authorized" });
    });

    it("should return an error before calling the API when the user id is invalid", async () => {
      const result = await changePassword("invalid", "Test123!", "321Test!");

      expect(result).toEqual({ success: false, error: "Invalid user id" });
      expect(mockPrivatePatch).not.toHaveBeenCalled();
    });
  });
});
