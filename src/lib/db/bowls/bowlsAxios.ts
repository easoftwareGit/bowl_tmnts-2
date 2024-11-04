import axios from "axios";
import { baseBowlsApi } from "@/lib/db/apiPaths";
import { testBaseBowlsApi } from "../../../../test/testApi";
import { Bowl } from "@prisma/client";
import { bowlType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;   
const oneBowlUrl = url + "/bowl/";  

/**
 * get array of bowls
 *
 * NOTE:
 * Do not use try / catch blocks here. Need the promise to be fulfilled
 * or rejected in /src/redux/features/bowls/bowlsSlice.tsx
 * which will have the appropriate response in the extraReducers.
 *
 * @returns { data: Bowl[] } - array of bowls;
 */

export const getBowls = async (): Promise<Bowl[]> => {  
  const response = await axios.get(url);  
  return (!response || response.status !== 200) 
    ? []
    : response.data.bowls;
};

/**
 * gets a single bowl
 * 
 * @param {string} id - id of bowl to get
 * @returns { Bowl | null } - bowl or null
 */
export const getBowl = async (id: string): Promise<Bowl | null> => {

  try {
    if (!id || !isValidBtDbId(id, 'bwl')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneBowlUrl + id,
    });
    return (response.status === 200)
      ? response.data.tmnt
      : null
  } catch (err) {
    return null;
  }
}

/**
 * posts a bowl
 * 
 * @param {bowlType} bowl - bowl to post
 * @returns { bowlType | null } - posted bowl or null
 */
export const postBowl = async (bowl: bowlType): Promise<Bowl | null> => {
  
  try {
    if (!bowl || !isValidBtDbId(bowl.id, 'bwl')) return null
    // further sanatation and validation done in POST route
    const bowlJSON = JSON.stringify(bowl);
    const response = await axios({
      method: "post",
      data: bowlJSON,
      withCredentials: true,
      url: url,
    });
    return (response.status === 201)
      ? response.data.bowl
      : null
  } catch (err) {
    return null;
  }
}

/**
 * puts a bowl
 * 
 * @param {bowlType} bowl - bowl to update
 * @returns { Bowl | null } - updated bowl or null
 */
export const putBowl = async (bowl: bowlType): Promise<Bowl | null> => {
  
  try {
    if (!bowl || !isValidBtDbId(bowl.id, 'bwl')) return null
    // further sanatation and validation done in PUT route
    const bowlJSON = JSON.stringify(bowl);
    const response = await axios({
      method: "put",
      data: bowlJSON,
      withCredentials: true,
      url: oneBowlUrl + bowl.id,
    });
    return (response.status === 200)
      ? response.data.bowl
      : null
  } catch (err) {
    return null;
  }
}