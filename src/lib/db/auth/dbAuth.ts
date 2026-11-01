import { privateApi } from "@/lib/api/axios";
import { baseRegisterApi } from "@/lib/api/apiPaths";
import { testBaseRegisterApi } from "../../../../test/testApi";
import axios from "axios";
import type { userDataType, registerUserType } from "@/lib/types/types";
import { mapApiUserToUser } from "@/lib/db/users/dbUsers";
import { toErrorMessage } from "../helpers";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const registerUrl = process.env.NODE_ENV === "test" && testBaseRegisterApi
  ? testBaseRegisterApi
  : baseRegisterApi;

/**
 * Registers a user
 *
 * @param {registerUserType} user - user data to register
 * @returns {userDataType} - registered user data if successful
 * @throws {AxiosError} - if the API returns an error status (e.g. 409 email in use)
 * @throws {Error} - if user data is invalid or the response is malformed
 */
export const registerUser = async (user: registerUserType): Promise<userDataType> => {
  // user id is set in the POST request, no need to check it before the POST
  if (!user) {
    throw new Error("Invalid user data");
  }
  try {
    // pass the object, not a JSON string, so axios sends Content-Type: application/json
    const response = await privateApi.post(registerUrl, user);

    if (!response.data?.user) {
      throw new Error("Error posting user");
    }
    
    return mapApiUserToUser(response.data.user);
  } catch (err) {
    // keep the AxiosError intact so callers can read err.response.status
    if (axios.isAxiosError(err)) {
      throw err;
    }
    throw new Error(`registerUser failed: ${toErrorMessage(err)}`);
  }
};