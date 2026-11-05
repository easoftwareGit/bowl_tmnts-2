// Tests for src/lib/db/auth/dbAuth.ts using a mocked axios instance module.
// The real axios.isAxiosError runs, so AxiosError rethrows are tested.
// Non standard throw cases are in dbAuthThrow.test.tsx.
// No database or server needed.
import { privateApi } from "@/lib/api/axios";
import { baseRegisterApi } from "@/lib/api/apiPaths";
import { testBaseRegisterApi } from "../../../testApi";
import { registerUser } from "@/lib/db/auth/dbAuth";
import { mapApiUserToUser } from "@/lib/db/users/dbUsers";
import type { registerUserType, userDataType } from "@/lib/types/types";

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

// an id the client might have (the server ignores it and makes its own)
// the id the server makes with btDbUuid("usr")
const serverId = "usr_abcdef0123456789abcdef0123456789";

// Looks like the error axios rejects with for a non-2xx response.
// axios.isAxiosError only checks isAxiosError === true.
const axiosError = (status: number, data: object = {}) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    name: "AxiosError",
    isAxiosError: true,
    code: status >= 500 ? "ERR_BAD_RESPONSE" : "ERR_BAD_REQUEST",
    response: { status, data },
  });

// what the register form sends: no role, the server decides that
const userToRegister: registerUserType = {  
  email: "test@email.com",
  password: "Test123!",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
};

// what the API sends back: server id, server-chosen role, no password
const apiUser = {
  id: serverId,
  email: "test@email.com",
  first_name: "Zach",
  last_name: "Jones",
  phone: "+18005559999",
  role: "DIRECTOR",
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
    describe("success", () => {
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

      // the server decides whether registration is open; checking
      // REGISTRATION_MODE here would always fail in the browser, where
      // non-NEXT_PUBLIC_ env vars are undefined
      it("should post even when REGISTRATION_MODE is not set", async () => {
        const original = process.env.REGISTRATION_MODE;
        delete process.env.REGISTRATION_MODE;
        mockPost.mockResolvedValue({ data: { user: apiUser } });

        try {
          await expect(registerUser(userToRegister)).resolves.toEqual(mappedUser);
          expect(mockPost).toHaveBeenCalledTimes(1);
        } finally {
          if (original === undefined) {
            delete process.env.REGISTRATION_MODE;
          } else {
            process.env.REGISTRATION_MODE = original;
          }
        }
      });
    });

    describe("API errors are rethrown as is", () => {
      it("should rethrow the AxiosError when email is in use (409)", async () => {
        const err = axiosError(409, { error: "Email already in use" });
        mockPost.mockRejectedValue(err);

        await expect(registerUser(userToRegister)).rejects.toBe(err);
        await expect(registerUser(userToRegister)).rejects.toMatchObject({
          response: { status: 409, data: { error: "Email already in use" } },
        });
        expect(mockMapApiUserToUser).not.toHaveBeenCalled();
      });

      // the register form reads this to show "Registration is closed."
      it("should rethrow the AxiosError when registration is closed (403)", async () => {
        const err = axiosError(403, { error: "Registration is closed." });
        mockPost.mockRejectedValue(err);

        await expect(registerUser(userToRegister)).rejects.toBe(err);
        await expect(registerUser(userToRegister)).rejects.toMatchObject({
          response: { status: 403, data: { error: "Registration is closed." } },
        });
        expect(mockMapApiUserToUser).not.toHaveBeenCalled();
      });

      it("should rethrow the AxiosError for invalid JSON (400)", async () => {
        const err = axiosError(400, { error: "invalid JSON" });
        mockPost.mockRejectedValue(err);

        await expect(registerUser(userToRegister)).rejects.toBe(err);
        await expect(registerUser(userToRegister)).rejects.toMatchObject({
          response: { status: 400, data: { error: "invalid JSON" } },
        });
      });

      it("should rethrow the AxiosError for invalid data (422)", async () => {
        const err = axiosError(422, { error: "invalid data" });
        mockPost.mockRejectedValue(err);

        await expect(registerUser(userToRegister)).rejects.toBe(err);
      });

      it("should rethrow the AxiosError for a server error (500)", async () => {
        const err = axiosError(500);
        mockPost.mockRejectedValue(err);

        await expect(registerUser(userToRegister)).rejects.toBe(err);
      });
    });

    describe("bad input", () => {
      it("should not register a user when passed null", async () => {
        await expect(
          registerUser(null as unknown as registerUserType),
        ).rejects.toThrow(new Error("Invalid user data"));
        expect(mockPost).not.toHaveBeenCalled();
      });

      it("should not register a user when passed undefined", async () => {
        await expect(
          registerUser(undefined as unknown as registerUserType),
        ).rejects.toThrow(new Error("Invalid user data"));
        expect(mockPost).not.toHaveBeenCalled();
      });
    });
  });
});
