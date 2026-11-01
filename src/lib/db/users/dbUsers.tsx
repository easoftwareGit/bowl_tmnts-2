import { privateApi, publicApi } from "@/lib/api/axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../../test/testApi";
import type { acctUserType, roleTypes, userDataType } from "@/lib/types/types";
import { isEmail, isValidBtDbId } from "@/lib/validation/validation";
import { blankUserData } from "../initVals";
import { maxEmailLength } from "@/lib/validation/constants";
import { AxiosError } from "axios";

// If running tests AND a test URL is defined, use it; otherwise use the app API path
const url = process.env.NODE_ENV === "test" && testBaseUsersApi
  ? testBaseUsersApi
  : baseUsersApi;

const userUrl = url + "/user/";
const emailUrl = url + "/email/";

type ApiUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  role?: string;
  has_password?: boolean;
};

/**
 * Maps an API user object to a user data object
 * 
 * @param {ApiUser} user - The API user object to map
 * @returns {userDataType} - The mapped user data 
 */
export const mapApiUserToUser = (user: ApiUser): userDataType => ({
  ...blankUserData,
  id: user.id ?? "",
  first_name: user.first_name ?? "",
  last_name: user.last_name ?? "",
  email: user.email ?? "",
  phone: user.phone ?? "",
  role: user.role as roleTypes ?? "USER",
});

/**
 * Maps an API user object to an account user object - includes has_password
 * 
 * @param {ApiUser} user - The API user object to map
 * @returns {acctUserType} - The mapped account user data 
 */
export const mapApiUserToAcctUser = (user: ApiUser): acctUserType => ({
  ...mapApiUserToUser(user),
  has_password: user.has_password === true,
});

/**
 * Retrieves a user for the account page, including has_password
 *
 * @param {string} id - The ID of the user to retrieve
 * @returns {acctUserType} - The user data with has_password
 * @throws {Error} - If the user ID is invalid or the API call fails
 */
export const getAcctUserById = async (id: string): Promise<acctUserType> => {
  if (!isValidBtDbId(id, "usr")) {
    throw new Error("getAcctUserById failed: Invalid user id");
  }
  try {
    const response = await privateApi.get(userUrl + id);
    if (!response.data?.user) {
      throw new Error("Error getting user");
    }
    return mapApiUserToAcctUser(response.data.user);
  } catch (err) {
    throw new Error(
      `getAcctUserById failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Retrieves a user by ID
 * 
 * @param {string} id - The ID of the user to retrieve
 * @returns {userDataType} - The user data
 * @throws {Error} - If the user ID is invalid
 */
export const getUserById = async (id: string): Promise<userDataType> => {
  if (!isValidBtDbId(id, "usr")) {
    throw new Error("getUserById failed: Invalid user id");
  }
  
  try {
    const response = await privateApi.get(userUrl + id);

    if (!response.data?.user) {
      throw new Error("Error getting user");
    }

    return mapApiUserToUser(response.data.user);
  } catch (err) {
    throw new Error(
      `getUserById failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Checks whether an email is already registered
 *
 * @param {string} email - email to check
 * @returns {boolean} - true if a user already has this email
 * @throws {Error} - if the email is invalid or the API call fails
 */
export const isEmailInUse = async (email: string): Promise<boolean> => {
  if (!email) {
    throw new Error("isEmailInUse failed: Invalid email");
  }
  const trimmedEmail = email.trim().toLowerCase();
  if (!isEmail(trimmedEmail) || trimmedEmail.length > maxEmailLength) {
    throw new Error("isEmailInUse failed: Invalid email");
  }

  try {
    const response = await publicApi.get(emailUrl + encodeURIComponent(trimmedEmail));
    if (typeof response.data?.gotUser !== "boolean") {
      throw new Error("Invalid response");
    }
    return response.data.gotUser;
  } catch (err) {
    throw new Error(
      `isEmailInUse failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Patches a user - does not patch password or role
 *
 * @param {userDataType} user - user data to patch
 * @returns {userDataType | null} - patched user data
 * @throws {Error} - if user data is invalid or API call fails
 */
export const patchUser = async (
  user: userDataType
): Promise<userDataType | null> => {
  if (!user || !isValidBtDbId(user.id, "usr")) {
    throw new Error("Invalid user data");
  }

  try {
    const { first_name, last_name, email, phone } = user;
    const toPatch = { first_name, last_name, email, phone };    
    const response = await privateApi.patch(userUrl + user.id, toPatch);

    if (!response.data?.user) {
      throw new Error("Error patching user");
    }

    return mapApiUserToUser(response.data.user);
  } catch (err) {
    throw new Error(
      `patchUser failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Changes a user's password
 * 
 * @param {string} userId - id of user to change password
 * @param {string} currentPassword - current password
 * @param {string} newPassword - new password
 * @returns {{ success: boolean; error?: string }} - success and error message
 */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> => {
  if (!isValidBtDbId(userId, "usr")) {
    return { success: false, error: "Invalid user id" };
  }
  // more validation in API route
  try {
    const pwdUrl = userUrl + userId + "/changePassword";
    const response = await privateApi.patch(pwdUrl, {
      currentPassword,
      newPassword,
    });
    
    if (!response.data) {
      return { success: false, error: "No response data" };
    }
    
    return { success: true };    
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    // only pass on text the route wrote; axios / network text is not
    // meant for users, so leave error out and let the page use its default
    const routeText =
      axiosError?.response?.data?.error || axiosError?.response?.data?.message;

    return routeText
      ? { success: false, error: routeText }
      : { success: false };
  }
};