import axios from "axios";
import { baseUsersApi } from "@/lib/db/apiPaths";
import { testBaseUsersApi } from "../../../testApi";
import { userType } from "@/lib/types/types";
import { blankUser } from "@/lib/db/initVals";
import { patchUser } from "@/lib/db/users/dbUsers";

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;
const userUrl = url + "/user/";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

const validUser: userType = {
  ...blankUser,
  id: "usr_5bcefb5d314fff1ff5da6521a2fa7bde",
  email: "adam@email.com",
  first_name: "Adam",
  last_name: "Smith",
  phone: "+18005551212",
  role: "ADMIN",
};

describe("non standard throw cases", () => { 

  describe("patchUser - non standard throw cases", () => {

    afterEach(() => {
      jest.restoreAllMocks();
      jest.clearAllMocks();
    });

    it("should throw an error when response.status !== 200", async () => {
      mockedAxios.patch.mockResolvedValueOnce({
        status: 500,
        data: {},
      });

      await expect(patchUser(validUser)).rejects.toThrow(
        "Error patching user"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        userUrl + validUser.id,
        JSON.stringify(validUser),
        { withCredentials: true }
      );
    });
    it("should throw with custom message if axios.get rejects", async () => {
      mockedAxios.patch.mockRejectedValueOnce(new Error("Network Error"));

      await expect(patchUser(validUser)).rejects.toThrow(
        "patchUser failed: Network Error"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
    it("should throw an error when axios.get rejects with non-error", async () => {
      mockedAxios.patch.mockRejectedValueOnce("testing 123");

      await expect(patchUser(validUser)).rejects.toThrow(
        "patchUser failed: testing 123"
      );

      expect(mockedAxios.patch).toHaveBeenCalledTimes(1);
    });
  });

});