// Tests for src/lib/db/auth/dbAuth.ts using a mocked axios instance module.
// The real axios.isAxiosError runs, so AxiosError rethrows are tested.
// Non standard throw cases are in dbAuthThrow.test.tsx.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { baseRegisterApi } from "@/lib/api/apiPaths";
import { testBaseRegisterApi } from "../../../testApi";
import { registerUser } from "@/lib/db/auth/dbAuth";
import { mapApiUserToUser } from "@/lib/db/users/dbUsers";
import type { userFormType, userDataType } from "@/lib/types/types";

// Replace the axios instance with a mock function each test can control
jest.mock("@/lib/api/axios", () => ({
  privateApi: { post: jest.fn() },
}));
const mockPost = privateApi.post as jest.Mock;

// Mock the mapper so these tests only check dbAuth, not the field mapping.
// mapApiUserToUser gets its own tests with dbUsers.
jest.mock("@/lib/db/users/dbUsers", () => ({
  mapApiUserToUser: jest.fn(),
}));
const mockMapApiUserToUser = mapApiUserToUser as jest.Mock;

// same url logic as dbAuth.ts; only used to check what was called
const url = process.env.NODE_ENV === "test" && testBaseRegisterApi
  ? testBaseRegisterApi
  : baseRegisterApi;

// the id the client had (ignored by the server)
const clientId = "usr_01234567890123456789012345678901";
// the id the server makes with btDbUuid("usr")
const serverId = "usr_abcdef0123456789abcdef0123456789";
const bowlId = "bwl_012342f8b85942929f2584318b3d49a2";

// Looks like the error axios rejects with for a non-2xx response.
// axios.isAxiosError only checks isAxiosError === true.
const axiosError = (status: number, data: object = {}) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    code: status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    response: { status, data },
  });

const userToRegister = {
  id: clientId,
  email: "test@email.com",
  password: "Test123!",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  role: "DIRECTOR",
} as userFormType;

// what the API sends back: server id, role always USER, no password
const apiUser = {
  id: serverId,
  email: "test@email.com",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  role: "USER",
};

// what the mocked mapper returns
const mappedUser = { ...apiUser } as userDataType;

describe("dbAuth", () => {
  beforeEach(() => {
    // jest config does not auto-reset mocks
    mockPost.mockReset();
    mockMapApiUserToUser.mockReset();
    mockMapApiUserToUser.mockReturnValue(mappedUser);
  });

  describe("registerUser()", () => {
    it("should register a user and return the mapped user", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });

      const user = await registerUser(userToRegister);

      expect(user).toEqual(mappedUser);
    });

    it("should post the user object (not a JSON string) to the register url", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });

      await registerUser(userToRegister);

      expect(mockPost).toHaveBeenCalledTimes(1);
      expect(mockPost).toHaveBeenCalledWith(url, userToRegister);
    });

    it("should map the user from the response", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });

      await registerUser(userToRegister);

      expect(mockMapApiUserToUser).toHaveBeenCalledTimes(1);
      expect(mockMapApiUserToUser).toHaveBeenCalledWith(apiUser);
    });

    it("should return the server id, not the id passed in", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });

      const user = await registerUser(userToRegister);

      expect(user.id).toBe(serverId);
      expect(user.id).not.toBe(clientId);
    });

    it("should return role USER even when another role was passed in", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });

      const user = await registerUser({ ...userToRegister, role: "ADMIN" });

      expect(user.role).toBe("USER");
    });

    it("should register a user with an empty id (the server sets the id)", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });
      const noIdUser = { ...userToRegister, id: "" };

      const user = await registerUser(noIdUser);

      expect(user).toEqual(mappedUser);
      expect(mockPost).toHaveBeenCalledWith(url, noIdUser);
    });

    it("should register a user with an invalid id (id is not checked)", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });
      const badIdUser = { ...userToRegister, id: "invalid" };

      const user = await registerUser(badIdUser);

      expect(user).toEqual(mappedUser);
      expect(mockPost).toHaveBeenCalledWith(url, badIdUser);
    });

    it("should register a user with a valid id that is not a user id", async () => {
      mockPost.mockResolvedValue({ data: { user: apiUser } });
      const bowlIdUser = { ...userToRegister, id: bowlId };

      const user = await registerUser(bowlIdUser);

      expect(user).toEqual(mappedUser);
      expect(mockPost).toHaveBeenCalledWith(url, bowlIdUser);
    });

    it("should rethrow the AxiosError as is when email is in use (409)", async () => {
      const err = axiosError(409, { error: "Email already in use" });
      mockPost.mockRejectedValue(err);

      await expect(registerUser(userToRegister)).rejects.toBe(err);
      await expect(registerUser(userToRegister)).rejects.toMatchObject({
        response: { status: 409, data: { error: "Email already in use" } },
      });
      expect(mockMapApiUserToUser).not.toHaveBeenCalled();
    });

    it("should rethrow the AxiosError as is for invalid JSON (400)", async () => {
      const err = axiosError(400, { error: "invalid JSON" });
      mockPost.mockRejectedValue(err);

      await expect(registerUser(userToRegister)).rejects.toBe(err);
      await expect(registerUser(userToRegister)).rejects.toMatchObject({
        response: { status: 400, data: { error: "invalid JSON" } },
      });
    });

    it("should rethrow the AxiosError as is for invalid data (422)", async () => {
      const err = axiosError(422, { error: "invalid data" });
      mockPost.mockRejectedValue(err);

      await expect(registerUser(userToRegister)).rejects.toBe(err);
    });

    it("should rethrow the AxiosError as is for a server error (500)", async () => {
      const err = axiosError(500);
      mockPost.mockRejectedValue(err);

      await expect(registerUser(userToRegister)).rejects.toBe(err);
    });

    it("should not register a user when passed null", async () => {
      await expect(
        registerUser(null as unknown as userFormType)
      ).rejects.toThrow(new Error("Invalid user data"));
      expect(mockPost).not.toHaveBeenCalled();
    });

    it("should not register a user when passed undefined", async () => {
      await expect(
        registerUser(undefined as unknown as userFormType)
      ).rejects.toThrow(new Error("Invalid user data"));
      expect(mockPost).not.toHaveBeenCalled();
    });
  });
});
