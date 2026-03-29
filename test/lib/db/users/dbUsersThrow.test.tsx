import { publicApi, privateApi } from "@/lib/api/axios";
import type { userDataType } from "@/lib/types/types";
import { blankUserData } from "@/lib/db/initVals";
import { changePassword, getUserByEmail, getUserById, patchUser } from "@/lib/db/users/dbUsers";

jest.mock("@/lib/api/axios", () => ({
  publicApi: {
    get: jest.fn(),
  },
  privateApi: {
    get: jest.fn(),
    patch: jest.fn(),
  },
}));

const mockedPublicApi = publicApi as jest.Mocked<typeof publicApi>;
const mockedPrivateApi = privateApi as jest.Mocked<typeof privateApi>;

const validUser: userDataType = {
  ...blankUserData,
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "ADMIN",
};

describe("non standard throw cases", () => {

  describe("getUserById - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.user is missing", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getUserById(validUser.id)).rejects.toThrow(
        "getUserById failed: Error getting user"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(validUser.id)
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUserById(validUser.id)).rejects.toThrow(
        "getUserById failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getUserById(validUser.id)).rejects.toThrow(
        "getUserById failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("getUserByEmail - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data is missing user property", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: {},
      });

      await expect(getUserByEmail(validUser.email)).rejects.toThrow(
        "getUserByEmail failed: Invalid user response"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(validUser.email))
      );
    });

    it("should return null when response.data.user is null", async () => {
      mockedPublicApi.get.mockResolvedValueOnce({
        data: { user: null },
      });

      await expect(getUserByEmail(validUser.email)).resolves.toBeNull();

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
      expect(mockedPublicApi.get).toHaveBeenCalledWith(
        expect.stringContaining(encodeURIComponent(validUser.email))
      );
    });

    it("should throw with custom message if publicApi.get rejects", async () => {
      mockedPublicApi.get.mockRejectedValueOnce(new Error("Network Error"));

      await expect(getUserByEmail(validUser.email)).rejects.toThrow(
        "getUserByEmail failed: Network Error"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when publicApi.get rejects with non-error", async () => {
      mockedPublicApi.get.mockRejectedValueOnce("testing 123");

      await expect(getUserByEmail(validUser.email)).rejects.toThrow(
        "getUserByEmail failed: testing 123"
      );

      expect(mockedPublicApi.get).toHaveBeenCalledTimes(1);
    });
  });

  describe("patchUser - non standard throw cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.data.user is missing", async () => {
      mockedPrivateApi.patch.mockResolvedValueOnce({
        data: {},
      });

      await expect(patchUser(validUser)).rejects.toThrow(
        "patchUser failed: Error patching user"
      );

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.patch).toHaveBeenCalledWith(
        expect.stringContaining(validUser.id),
        JSON.stringify(validUser)
      );
    });

    it("should throw with custom message if privateApi.patch rejects", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchUser(validUser)).rejects.toThrow(
        "patchUser failed: Network Error"
      );

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.patch rejects with non-error", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce("testing 123");

      await expect(patchUser(validUser)).rejects.toThrow(
        "patchUser failed: testing 123"
      );

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });
  });

  describe("changePassword - non standard error cases", () => {
    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should return failure when response.data is missing", async () => {
      mockedPrivateApi.patch.mockResolvedValueOnce({
        data: undefined,
      });

      const result = await changePassword(
        validUser.id,
        "Test123!",
        "NewTest123!"
      );

      expect(result).toEqual({
        success: false,
        error: "No response data",
      });

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
      expect(mockedPrivateApi.patch).toHaveBeenCalledWith(
        expect.stringContaining(`${validUser.id}/changePassword`),
        {
          currentPassword: "Test123!",
          newPassword: "NewTest123!",
        }
      );
    });

    it("should return failure with custom message if privateApi.patch rejects", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce(new Error("Network Error"));

      const result = await changePassword(
        validUser.id,
        "Test123!",
        "NewTest123!"
      );

      expect(result).toEqual({
        success: false,
        error: "Network Error",
      });

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });

    it("should return failure when privateApi.patch rejects with non-error", async () => {
      mockedPrivateApi.patch.mockRejectedValueOnce("testing 123");

      const result = await changePassword(
        validUser.id,
        "Test123!",
        "NewTest123!"
      );

      expect(result).toEqual({
        success: false,
        error: "Unable to change password",
      });

      expect(mockedPrivateApi.patch).toHaveBeenCalledTimes(1);
    });
  });
  
});
