import { brktEntryType, validBrktEntriesType } from "@/lib/types/types";
import { validateBrktEntries } from "../validate";
import { ErrorCode } from "@/lib/validation";

/**
 * gets array of unique brktIds
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries
 * @returns {string[]} - array of unique brktIds
 */
const getBrktIds = (brktEntries: brktEntryType[]) => {
  const brktIds: string[] = [];
  brktEntries.forEach((brktEntry) => {
    if (!brktIds.includes(brktEntry.brkt_id)) {
      brktIds.push(brktEntry.brkt_id);
    }    
  })
  return brktIds;
}

/**
 * gets SQL query to update many brktEntries at once
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries
 * @returns {string} - SQL query to update many brktEntries at once or '' 
 */
export const getUpdateManySQL = (brktEntries: brktEntryType[]) => {

  if (!brktEntries || brktEntries.length === 0) return "";

  const validBrktEntries: validBrktEntriesType = validateBrktEntries(brktEntries);
  if (validBrktEntries.errorCode !== ErrorCode.None) return "";

  const brktIds: string[] = getBrktIds(brktEntries);
  if (brktIds.length === 0) return "";

  const getSqlValues = (brktEntries: brktEntryType[]) => {
    const values: string[] = [];
    brktEntries.forEach((brktEntry) => {      
      values.push(`('${brktEntry.brkt_id}', '${brktEntry.player_id}', ${brktEntry.num_brackets}, ${brktEntry.time_stamp})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query  
  const updateManySQL =
    `UPDATE public."Brkt_Entry" ` +
    `SET num_brackets = CASE ` +
      brktIds.map((brktId) => `WHEN public."Brkt_Entry".brkt_id = '${brktId}' THEN b2Up.num_brackets`).join(` `) + ' ' +
    `END, ` +
    `time_stamp = CASE ` +
      brktIds.map((brktId) => `WHEN public."Brkt_Entry".brkt_id = '${brktId}' THEN to_timestamp(b2Up.time_stamp / 1000)`).join(` `) + ' ' +
    `END ` +    
    `FROM (VALUES ` +
      getSqlValues(validBrktEntries.brktEntries) +
    `) AS b2Up(brkt_id, player_id, num_brackets, time_stamp) ` +
    `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`
    
  return updateManySQL  
}

/**
 * gets SQL query to insert many brktEntries at once
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries
 * @returns {string} - SQL query to insert many brktEntries at once or '' 
 */
export const getInsertManySQL = (brktEntries: brktEntryType[]) => {

  if (!brktEntries || brktEntries.length === 0) return "";
  const validBrktEntries: validBrktEntriesType = validateBrktEntries(brktEntries);
  if (validBrktEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (brktEntries: brktEntryType[]) => {
    const values: string[] = [];
    brktEntries.forEach((brktEntry) => {
      // values.push(`('${brktEntry.brkt_id}', '${brktEntry.player_id}', ${brktEntry.fee}, ${brktEntry.num_brackets})`)
      values.push(`('${brktEntry.id}', '${brktEntry.brkt_id}', '${brktEntry.player_id}', ${brktEntry.num_brackets}, ${brktEntry.time_stamp})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Brkt_Entry" (id, brkt_id, player_id, num_brackets, time_stamp) ` +
    `SELECT b2up.id, b2up.brkt_id, b2up.player_id, b2up.num_brackets, to_timestamp(b2Up.time_stamp / 1000) ` +
    `FROM (VALUES ` +
      getSqlValues(validBrktEntries.brktEntries) +
      `) AS b2up(id, brkt_id, player_id, num_brackets, time_stamp) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE id = b2up.id);`

  return insertManySQL 
}

/**
 * gets SQL query to delete many brktEntries at once
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries
 * @returns {string} - SQL query to delete many brktEntries at once or '' 
 */
export const getDeleteManySQL = (brktEntries: brktEntryType[]) => { 

  if (!brktEntries || brktEntries.length === 0) return "";
  const validBrktEntries: validBrktEntriesType = validateBrktEntries(brktEntries);
  if (validBrktEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (brktEntries: brktEntryType[]) => {
    const values: string[] = [];
    brktEntries.forEach((brktEntry) => {
      values.push(`('${brktEntry.brkt_id}', '${brktEntry.player_id}')`)
    })
    return values.join(`, `);
  }

  const deleteManySQL = 
    `DELETE FROM public."Brkt_Entry" ` +
    `WHERE (brkt_id, player_id) IN ( ` +
      getSqlValues(validBrktEntries.brktEntries) +
    `);`

  return deleteManySQL
}

export const exportedForTesting = {
  getBrktIds,  
}