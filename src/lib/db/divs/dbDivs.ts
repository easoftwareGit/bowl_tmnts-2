import axios from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../../test/testApi";
import { divType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { blankDiv } from "../initVals";
import { validateDivs } from "@/app/api/divs/validate";

const url = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;   
const divUrl = url + "/div/";
const manyUrl = url + "/many";
const tmntUrl = url + "/tmnt/";  

/**
 * extract div data from GET API response
 * 
 * @param {any} divs - array of divs from GET API response
 * @returns {divType[]} - array of divs
 */
export const extractDivs = (divs: any): divType[] => {
  if (!divs || !Array.isArray(divs)) return [];
  return divs.map((div: any) => ({
    ...blankDiv,
    id: div.id,
    tmnt_id: div.tmnt_id,
    div_name: div.div_name,        
    tab_title: div.div_name,
    hdcp_per: div.hdcp_per,
    hdcp_per_str: (div.hdcp_per * 100).toFixed(2),
    hdcp_from: div.hdcp_from,        
    int_hdcp: div.int_hdcp,
    hdcp_for: div.hdcp_for,
    sort_order: div.sort_order,
  }));
}

/**
 * get all divs for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with divs to get
 * @returns {divType[]} - array of divs or null
 * @throws {Error} - if tmntId is invalid or API call fails
 */
export const getAllDivsForTmnt = async (tmntId: string): Promise<divType[]> => {
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let response;
  try {
    response = await axios.get(tmntUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`getAllDivsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error(`Unexpected status ${response.status} when fetching divs`)
  }  
  return extractDivs(response.data.divs);
}

/**
 * posts a div
 * 
 * @param {divType} div - div to post
 * @returns {divType | null} - div posted or null
 * @throws {Error} - if div is invalid or API call fails
 */  
export const postDiv = async (div: divType): Promise<divType | null> => {
  if (!div || !isValidBtDbId(div.id, 'div')) { 
    throw new Error('Invalid div data');
  }
  let response;
  try {    
    // further sanatation and validation done in POST route
    const divJSON = JSON.stringify(div);
    response = await axios.post(url, divJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`postDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || !response.data?.div) {
    throw new Error("Error posting div");
  }
  const dbDiv = response.data.div;
  const postedDiv: divType = {
    ...blankDiv,
    id: dbDiv.id,
    tmnt_id: dbDiv.tmnt_id,
    div_name: dbDiv.div_name,        
    tab_title: dbDiv.div_name,
    hdcp_per: dbDiv.hdcp_per,
    hdcp_per_str: (dbDiv.hdcp_per * 100).toFixed(2),
    hdcp_from: dbDiv.hdcp_from,        
    int_hdcp: dbDiv.int_hdcp,
    hdcp_for: dbDiv.hdcp_for,
    sort_order: dbDiv.sort_order,
  }
  return postedDiv;
}

/**
 * post many divs
 * 
 * @param {divType[]} divs - array of divs to post
 * @returns {number} - number of divs posted 
 * @throws {Error} - if divs are invalid or API call fails
 */
export const postManyDivs = async (divs: divType[]): Promise<number> => { 
  if (!divs || !Array.isArray(divs)) { 
    throw new Error('Invalid div data');
  }
  if (divs.length === 0) return 0; //not an error, just no divs to post
  const validDivs = validateDivs(divs);
  if (validDivs.errorCode !== ErrorCode.None
    || validDivs.divs.length !== divs.length)
  { 
    if (validDivs.divs.length === 0) {      
      throw new Error('Invalid div data at index 0');
    }
    const errorIndex = divs.findIndex(div => !isValidBtDbId(div.id, "div"));
    if (errorIndex < 0) {
      throw new Error(`Invalid div data at index ${validDivs.divs.length}`);
    } else {
      throw new Error(`Invalid div data at index ${errorIndex}`);
    }
  }
  let response;
  try {  
    const divsJSON = JSON.stringify(divs);  
    response = await axios.post(manyUrl, divsJSON, {    
      withCredentials: true,    
    });
  } catch (err) {
    throw new Error(`postManyDivs failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 201 || typeof response.data?.count !== "number") {
    throw new Error("Error posting divs");
  }
  return response.data.count;
}

/**
 * puts a div
 * 
 * @param {divType} event - div to put
 * @returns - div putted 
 * @throws {Error} - if div is invalid or API call fails
 */  
export const putDiv = async (div: divType): Promise<divType | null> => {  
  if (!div || !isValidBtDbId(div.id, 'div')) { 
    throw new Error('Invalid div data');
  }
  let response;
  try {    
    // further sanatation and validation done in POST route
    const divJSON = JSON.stringify(div);
    response = await axios.put(divUrl + div.id, divJSON, { withCredentials: true });
  } catch (err) {
    throw new Error(`putDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || !response.data?.div) { 
    throw new Error("Error putting div");
  }
  const dbDiv = response.data.div;
  const puttedDiv: divType = {
    ...blankDiv,
    id: dbDiv.id,
    tmnt_id: dbDiv.tmnt_id,
    div_name: dbDiv.div_name,        
    tab_title: dbDiv.div_name,
    hdcp_per: dbDiv.hdcp_per,
    hdcp_per_str: (dbDiv.hdcp_per * 100).toFixed(2),
    hdcp_from: dbDiv.hdcp_from,        
    int_hdcp: dbDiv.int_hdcp,
    hdcp_for: dbDiv.hdcp_for,
    sort_order: dbDiv.sort_order,
  }
  return puttedDiv;
}

/**
 * deletes a div
 * 
 * @param {string} id - id of div to delete
 * @returns - 1 if deleted, -1 if not found or error
 */  
export const deleteDiv = async (id: string): Promise<number> => {
  if (!isValidBtDbId(id, "div")) { 
    throw new Error("Invalid div id");
  }
  let response;
  try {
    response = await axios.delete(divUrl + id, { withCredentials: true });    
  } catch (err) {
    throw new Error(`deleteDiv failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200) { 
    throw new Error("Error deleting div");
  }
  return 1;
}

/**
 * deletes all divs for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with divs to delete
 * @returns - # of rows deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllDivsForTmnt = async (tmntId: string): Promise<number> => {
  if (!isValidBtDbId(tmntId, "tmt")) { 
    throw new Error("Invalid tmnt id");
  }
  let response;
  try {
    response = await axios.delete(tmntUrl + tmntId, { withCredentials: true });
  } catch (err) {
    throw new Error(`deleteAllDivsForTmnt failed: ${err instanceof Error ? err.message : err}`);
  }
  if (response.status !== 200 || typeof response.data?.deleted?.count !== "number") {
    throw new Error("Error deleting divs for tmnt");
  }
  return response.data.deleted.count;
}