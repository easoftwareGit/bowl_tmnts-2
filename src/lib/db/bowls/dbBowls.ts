import axios from "axios";
import { baseBowlsApi } from "@/lib/db/apiPaths";
import { testBaseBowlsApi } from "../../../../test/testApi";
import { bowlType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankBowl } from "../initVals";

const url = testBaseBowlsApi.startsWith("undefined")
  ? baseBowlsApi
  : testBaseBowlsApi;   
const oneBowlUrl = url + "/bowl/";  

/**
 * get array of bowls
 *
 * @returns {bowlType[]} - array of bowls;
 * @throws {Error} - if API call fails
 */

export const getBowls = async (): Promise<bowlType[]> => {  
  let response;
  try { 
    response = await axios.get(url, { withCredentials: true });
  } catch (err) {
    throw new Error(`getBowls failed: ${err instanceof Error ? err.message : err}`);
  }    
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching bowls`)
  }
  const allBowls = response.data.bowls;
  const bowls = allBowls.map((bowl: any) => ({
    ...blankBowl,
    id: bowl.id,
    bowl_name: bowl.bowl_name,
    city: bowl.city,
    state: bowl.state,
    country: bowl.country,
    url: bowl.url
  }))
  return bowls;
};

/**
 * gets a single bowl
 * 
 * @param {string} id - id of bowl to get
 * @returns {bowlType} - bowl from database
 * @throws {Error} - if id is invalid or if API call fails
 */
export const getBowl = async (id: string): Promise<bowlType> => {

  if (!isValidBtDbId(id, 'bwl')) { 
    throw new Error('Invalid bowl id');
  }
  let response;
  try { 
    response = await axios.get(oneBowlUrl + id, {
      withCredentials: true
    });
  } catch (err) { 
    throw new Error(`getBowl failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) {
    throw new Error(`Unexpected status ${response.status} when fetching bowl`)
  }    
  const bowl: bowlType = {
    ...blankBowl,
    id: response.data.bowl.id,
    bowl_name: response.data.bowl.bowl_name,
    city: response.data.bowl.city,
    state: response.data.bowl.state,
    url: response.data.bowl.url,      
  }
  return bowl
}

/**
 * posts a bowl
 * 
 * @param {bowlType} bowl - bowl to post
 * @returns {bowlType} - posted bowl 
 * @throws { Error } - if id is invalid or if API call fails
 */
export const postBowl = async (bowl: bowlType): Promise<bowlType> => {
  
  if (!bowl || !isValidBtDbId(bowl.id, 'bwl')) { 
    throw new Error('Invalid bowl data');
  }
  let response;
  try { 
    // further sanatation and validation done in POST route
    const bowlJSON = JSON.stringify(bowl);
    response = await axios.post(url, bowlJSON, {
      withCredentials: true
    });
  } catch (err) { 
    throw new Error(`postBowl failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.bowl) {
    throw new Error("Error posting bowl");
  }
  const dbBowl = response.data.bowl;
  return {
    ...blankBowl,
    id: dbBowl.id,
    bowl_name: dbBowl.bowl_name,
    city: dbBowl.city,
    state: dbBowl.state,
    url: dbBowl.url
  }    
}

/**
 * puts a bowl
 * 
 * @param {bowlType} bowl - bowl to update
 * @returns {bowlType} - updated bowl
 * @throws { Error } - if id is invalid or if API call fails
 */
export const putBowl = async (bowl: bowlType): Promise<bowlType> => {
  
  if (!bowl || !isValidBtDbId(bowl.id, 'bwl')) { 
    throw new Error('Invalid bowl data');
  }
  let response;
  try {
    const bowlJSON = JSON.stringify(bowl);
    response = await axios.put(oneBowlUrl + bowl.id, bowlJSON, {
      withCredentials: true
    });
  } catch (err) {
    throw new Error(`putBowl failed: ${err instanceof Error ? err.message : err}`);  
  }
  if (response.status !== 200 || !response.data?.bowl) {
    throw new Error("Error putting bowl");
  }
  const dbBowl = response.data.bowl;
  return {
    ...blankBowl,
    id: dbBowl.id,
    bowl_name: dbBowl.bowl_name,
    city: dbBowl.city,
    state: dbBowl.state,
    url: dbBowl.url
  }  
}

/**
 * upserts a bowl (updates or inserts)
 * 
 * @param {bowlType} bowl - bowl to upsert
 * @returns {bowlType} - upserted bowl
 * @throws { Error } - if id is invalid or if API call fails 
 */
export const upsertBowl = async (bowl: bowlType): Promise<bowlType> => {
  if (!bowl || !isValidBtDbId(bowl.id, 'bwl')) { 
    throw new Error('Invalid bowl data');
  }  
  try {
    const bowlJSON = JSON.stringify(bowl);
    const response = await axios.put(oneBowlUrl + bowl.id, bowlJSON, {
      withCredentials: true
    });
    if (response.status !== 200 || !response.data?.bowl) {
      throw new Error("Error upserting bowl");
    }
    const dbBowl = response.data.bowl;
    return {
      ...blankBowl,
      id: dbBowl.id,
      bowl_name: dbBowl.bowl_name,
      city: dbBowl.city,
      state: dbBowl.state,
      url: dbBowl.url
    }  
  } catch (err) {
    throw new Error(`upsertBowl failed: ${err instanceof Error ? err.message : err}`);  
  }
}