import axios from "axios";
import { baseDivsApi } from "@/lib/db/apiPaths";
import { testBaseDivsApi } from "../../../../test/testApi";
import { divType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation";
import { blankDiv } from "../initVals";

const url = testBaseDivsApi.startsWith("undefined")
  ? baseDivsApi
  : testBaseDivsApi;   
const oneDivUrl = url + "/div/";
const oneTmntUrl = url + "/tmnt/";  
const manyUrl = url + "/many";

/**
 * get all divs for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with divs to get
 * @returns {divType[] | null} - array of divs or null
 */
export const getAllDivsForTmnt = async (tmntId: string): Promise<divType[] | null> => {

  try {
    if (!isValidBtDbId(tmntId, 'tmt')) return null
    const response = await axios({
      method: "get",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    if (response.status !== 200) return null
    const dbDivs = response.data.divs;
    const divs: divType[] = dbDivs.map((div: any) => {
      return {
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
      }
    })
    return divs
  } catch (err) {
    return null;
  }
}

/**
 * post a new div
 * 
 * @param {divType} div - div to post
 * @returns {divType | null} - div posted or null
 */  
export const postDiv = async (div: divType): Promise<divType | null> => {
  
  try {
    if (!div || !isValidBtDbId(div.id, 'div')) return null
    // further sanatation and validation done in POST route
    const divJSON = JSON.stringify(div);
    const response = await axios({
      method: "post",
      data: divJSON,
      withCredentials: true,
      url: url,
    });
    if (response.status !== 201) return null
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
  } catch (err) {
    return null;
  }
}

/**
 * post many divs
 * 
 * @param {divType[]} divs - array of divs to post
 * @returns {divType[] | null} - array of divs posted or null
 */
export const postManyDivs = async (divs: divType[]): Promise<divType[] | null> => { 

  try {
    // sanatation and validation done in POST route
    const divsJSON = JSON.stringify(divs);
    const response = await axios({
      method: "post",
      data: divsJSON,
      withCredentials: true,
      url: manyUrl,
    });
    if (response.status !== 201) return null
    const dbDivs = response.data.divs;
    const postedDivs: divType[] = dbDivs.map((div: any) => {
      return {
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
      }
    })
    return postedDivs
  } catch (err) {
    return null;
  }
}

/**
 * puts a div
 * 
 * @param {divType} event - div to put
 * @returns - div putted or null
 */  
export const putDiv = async (div: divType): Promise<divType | null> => {  

  try {
    if (!div || !isValidBtDbId(div.id, 'div')) return null
    // further sanatation and validation done in POST route
    const divJSON = JSON.stringify(div);
    const response = await axios({
      method: "put",
      data: divJSON,
      withCredentials: true,
      url: oneDivUrl + div.id,
    });
    if (response.status !== 200) return null
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
  } catch (err) {
    return null;
  }
}

/**
 * deletes a div
 * 
 * @param {string} id - id of div to delete
 * @returns - 1 if deleted, -1 if not found or error
 */  
export const deleteDiv = async (id: string): Promise<number> => {
  try {
    if (!isValidBtDbId(id, "div")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneDivUrl + id,
    });
    return (response.status === 200) ? 1 : -1
  } catch (err) {
    return -1;
  }
}

/**
 * deletes all divs for a tmnt
 * 
 * @param {string} tmntId - id of tmnt with divs to delete
 * @returns - # of rows deleted, -1 if tmntId is invalid or an error
 */
export const deleteAllDivsForTmnt = async (tmntId: string): Promise<number> => {
  try {
    if (!isValidBtDbId(tmntId, "tmt")) return -1
    const response = await axios({
      method: "delete",
      withCredentials: true,
      url: oneTmntUrl + tmntId,
    });
    return (response.status === 200) ? response.data.deleted.count : -1
  } catch (err) {
    return -1;
  }
}