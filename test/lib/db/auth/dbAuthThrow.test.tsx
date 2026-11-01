import { privateApi } from "@/lib/api/axios";
import { baseRegisterApi } from "@/lib/api/apiPaths";
import { testBaseRegisterApi } from "../../../testApi";
import { registerUser } from "@/lib/db/auth/dbAuth";
import { mapApiUserToUser } from "@/lib/db/users/dbUsers";
import type { userFormType } from "@/lib/types/types";

jest.mock("@/lib/api/axios", () => ({
  __esModule: true,
  privateApi: {
    post: jest.fn(),
  },
}));

// mapApiUserToUser is mocked so a test can make it throw
jest.mock("@/lib/db/users/dbUsers", () => ({
  __esModule: true,
  mapApiUserToUser: jest.fn(),
}));

const mockPrivatePost = privateApi.post as jest.Mock;
const mockMapApiUserToUser = mapApiUserToUser as jest.Mock;

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseRegisterApi
  ? testBaseRegisterApi
  : baseRegisterApi;

const testUserId = "usr_01234567890123456789012345678901";
const serverUserId = "usr_abcdef0123456789abcdef0123456789";

const userToRegister = {
  id: testUserId,
  email: "test@email.com",
  password: "Test123!",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  role: "USER",
} as userFormType;

const apiUser = {
  id: serverUserId,
  email: "test@email.com",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  role: "USER",
};

describe("non standard throw cases", () => {
  beforeEach(() => {
    // mockReset also clears mockResolvedValue implementations,
    // clearAllMocks only clears the call history
    mockPrivatePost.mockReset();
    mockMapApiUserToUser.mockReset();
  });

  describe("registerUser - non standard throw cases", () => {
    it("should throw an error when response.data.user is missing", async () => {
      mockPrivatePost.mockResolvedValue({
        data: {},
      });

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: Error posting user"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
      expect(mockPrivatePost).toHaveBeenCalledWith(url, userToRegister);
      expect(mockMapApiUserToUser).not.toHaveBeenCalled();
    });

    it("should throw an error when response.data is null", async () => {
      mockPrivatePost.mockResolvedValue({
        data: null,
      });

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: Error posting user"
      );
    });

    it("should throw an error when response has no data", async () => {
      mockPrivatePost.mockResolvedValue({});

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: Error posting user"
      );
    });

    it("should throw with custom message if privateApi.post rejects", async () => {
      mockPrivatePost.mockRejectedValueOnce(new Error("Network Error"));

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: Network Error"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw an error when privateApi.post rejects with non-error", async () => {
      mockPrivatePost.mockRejectedValueOnce("testing 123");

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: testing 123"
      );

      expect(mockPrivatePost).toHaveBeenCalledTimes(1);
    });

    it("should throw with custom message if mapApiUserToUser throws", async () => {
      mockPrivatePost.mockResolvedValue({
        data: { user: apiUser },
      });
      mockMapApiUserToUser.mockImplementation(() => {
        throw new Error("bad user");
      });

      await expect(registerUser(userToRegister)).rejects.toThrow(
        "registerUser failed: bad user"
      );

      expect(mockMapApiUserToUser).toHaveBeenCalledWith(apiUser);
    });
  });
});
