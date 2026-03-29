import { privateApi, publicApi } from "@/lib/api/axios";
import { baseUsersApi } from "@/lib/api/apiPaths";
import { testBaseUsersApi } from "../../../../test/testApi";
import type { userDataType } from "@/lib/types/types";
import { isEmail, isValidBtDbId } from "@/lib/validation/validation";
import { blankUserData } from "../initVals";
import { maxEmailLength } from "@/lib/validation/constants";
import { AxiosError } from "axios";

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;
const userUrl = url + "/user/";
const emailUrl = url + "/email/";

/**
 * Retrieves a user by ID
 * 
 * @param {string} id - The ID of the user to retrieve
 * @returns {userDataType | null} - The user data, or null if not found
 * @throws {Error} - If the user ID is invalid
 */
export const getUserById = async (id: string): Promise<userDataType | null> => {
  if (!isValidBtDbId(id, "usr")) {
    throw new Error("getUserById failed: Invalid user id");
  }
  
  try {
    const response = await publicApi.get(userUrl + id);

    if (!response.data?.user) {
      throw new Error("Error getting user");
    }

    const dbUser = response.data.user;

    return {
      ...blankUserData,
      id: dbUser.id,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: (dbUser.role as userDataType["role"]) ?? "USER",
    };
  } catch (err) {
    throw new Error(
      `getUserById failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

/**
 * Retrieves a user by email
 * 
 * @param {string} email - The email of the user to retrieve
 * @returns {userDataType | null} - The user data, or null if not found
 * @throws {Error} - If the email is invalid
 */
export const getUserByEmail = async (email: string): Promise<userDataType | null> => {
  if (!email || !isEmail(email) || email.length > maxEmailLength) {
    throw new Error("getUserByEmail failed: Invalid email");
  }  

  try {
    const encodedEmail = encodeURIComponent(email);
    const response = await publicApi.get(emailUrl + encodedEmail);
    // user not found returns null in response.data.user
    if (!("user" in response.data)) {
      throw new Error("Invalid user response");
    }
    // if user not found, return null
    if (!response.data.user) {
      return null;
    }
    const dbUser = response.data.user;
    return {
      ...blankUserData,
      id: dbUser.id,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
    };
  } catch (err) {
    throw new Error(
      `getUserByEmail failed: ${err instanceof Error ? err.message : err}`
    );    
  }
}

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
    const userJSON = JSON.stringify(user);
    const response = await privateApi.patch(userUrl + user.id, userJSON);

    if (!response.data?.user) {
      throw new Error("Error patching user");
    }

    const dbUser = response.data.user;

    return {
      ...blankUserData,
      id: dbUser.id,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      email: dbUser.email,
      phone: dbUser.phone,
      role: dbUser.role,
    };
  } catch (err) {
    throw new Error(
      `patchUser failed: ${err instanceof Error ? err.message : err}`
    );
  }
};

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
    const axiosError = error as AxiosError<{ error?: string }>;

    return {
      success: false,
      error:
        axiosError.response?.data?.error ??
        (error instanceof Error ? error.message : "Unable to change password"),
    };
  }

  // } catch (error) {
  //   return {
  //     success: false,
  //     error: error instanceof Error ? error.message : "Unable to change password",
  //   }
  // }

};