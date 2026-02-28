import axios from "axios";
import { bcryptLength, maxToHashLength } from "@/lib/validation/validation";
import { baseBcryptApi } from "@/lib/api/apiPaths";
import { testBaseBcryptApi } from "../../test/testApi";

const url = testBaseBcryptApi.startsWith("undefined")
  ? baseBcryptApi
  : testBaseBcryptApi;
const hashUrl = url + "/hash"  
const compareUrl = url + "/compare"
  
export const doHash = async (toHash: string): Promise<string> => {
  try {
    if (!toHash || toHash.length > maxToHashLength) return "";
    const bcryptJSON = JSON.stringify({ toHash });
    const response = await axios({
      method: "put",
      data: bcryptJSON,
      withCredentials: true,
      url: hashUrl,
    })
    return response.status === 200 ? response.data.hashed : "";
  } catch {
    return "";
  }
};

export const doCompare = async (toHash: string, hashed: string): Promise<boolean> => {
  try {
    if (!toHash || toHash.length > maxToHashLength || !hashed || hashed.length !== bcryptLength) return false;
    const bcryptJSON = JSON.stringify({ toHash, hashed });
    const response = await axios({
      method: "put",
      data: bcryptJSON,
      withCredentials: true,
      url: compareUrl,
    })
    return response.status === 200 ? response.data.match : false;
  } catch {
    return false;
  }
};
