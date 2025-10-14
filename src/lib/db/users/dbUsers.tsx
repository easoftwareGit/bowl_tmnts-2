import axios from "axios";
import { baseUsersApi } from "@/lib/db/apiPaths";
import { testBaseUsersApi } from "../../../../test/testApi";
import { userType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankUser } from "../initVals";

const url = testBaseUsersApi.startsWith("undefined")
  ? baseUsersApi
  : testBaseUsersApi;    
const userUrl = url + "/user/"

/**
 * Patches a user - does not patch password or role
 * 
 * @param {any} user - user data to patch
 * @returns {userType} - patched user data (NO PASSWORD returned)
 * @throws {Error} - if user data is invalid or API call fails
 */
export const patchUser = async (user: any): Promise<userType | null> => {

  if (!user || !isValidBtDbId(user.id, 'usr')) { 
    throw Error('Invalid user data')
  }
  let response;
  try { 
    const userJSON = JSON.stringify(user);
    response = await axios.patch(userUrl + user.id, userJSON, {
      withCredentials: true
    })
  } catch (err) { 
    throw new Error(`patchUser failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.user) {
    throw new Error("Error patching user");
  }
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


  // try {
  //   if (!user || !("id" in user) || !isValidBtDbId(user.id, 'usr')) return null
  //   const userJSON = JSON.stringify(user);
  //   const response = await axios({
  //     method: "patch",
  //     data: userJSON,
  //     withCredentials: true,
  //     url: oneUserUrl + user.id,
  //   });
  //   if (response.status !== 200) return null
  //   const dbUser = response.data.user
  //   return {
  //     ...blankUser,
  //     id: dbUser.id,
  //     first_name: dbUser.first_name,
  //     last_name: dbUser.last_name,
  //     email: dbUser.email,      
  //     phone: dbUser.phone,
  //     role: dbUser.role
  //   }
  // } catch (err) {
  //   return null;
  // }
}
