import axios from "axios";
import { baseUsersApi } from "@/lib/db/apiPaths";
import { testBaseUsersApi } from "../../../../test/testApi";
import { userType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankUser } from "../initVals";

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;    
const oneUserUrl = url + "/user/"

/**
 * Patches a user - does not patch password or role
 * 
 * @param {any} user - user data to patch
 * @returns {userType | null} - patched user data (NO PASSWORD returned) | null
 */
export const patchUser = async (user: any): Promise<userType | null> => {

  try {
    if (!user || !("id" in user) || !isValidBtDbId(user.id, 'usr')) return null
    const userJSON = JSON.stringify(user);
    const response = await axios({
      method: "patch",
      data: userJSON,
      withCredentials: true,
      url: oneUserUrl + user.id,
    });
    if (response.status !== 200) return null
    const dbUser = response.data.user
    return {
      ...blankUser,
      id: dbUser.id,
      first_name: dbUser.first_name,
      last_name: dbUser.last_name,
      email: dbUser.email,      
      phone: dbUser.phone,
      role: dbUser.role
    }
  } catch (err) {
    return null;
  }
}
