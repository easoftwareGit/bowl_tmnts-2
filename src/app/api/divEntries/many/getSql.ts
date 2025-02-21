import { divEntryType } from "@/lib/types/types";
import { validateDivEntries } from "../validate";
import { ErrorCode } from "@/lib/validation";

/**
 * returns an array of unique divIds
 * 
 * @param {divEntryType[]} divEntries - array of divEntries
 * @returns {string[]} - array of unique divIds
 */
const getDivIds = (divEntries: divEntryType[]) => {
  const divIds: string[] = [];
  divEntries.forEach((divEntry) => {
    if (!divIds.includes(divEntry.div_id)) {
      divIds.push(divEntry.div_id);
    }    
  })
  return divIds;
}

/**
 * returns the SQL query to update many divEntries
 * 
 * @param divEntries - array of divEntries
 * @returns {string} - SQL query to update many divEntries at once or ''
 */
export const getUpdateManySQL = (divEntries: divEntryType[]) => {

  if (!divEntries || divEntries.length === 0) return "";
  const validDivEntries = validateDivEntries(divEntries);
  if (validDivEntries.errorCode !== ErrorCode.None) return "";

  const divIds: string[] = getDivIds(divEntries);
  if (divIds.length === 0) return "";

  const getSqlValues = (divEntries: divEntryType[]) => {
    const values: string[] = [];
    divEntries.forEach((divEntry) => {
      values.push(`('${divEntry.div_id}', '${divEntry.player_id}', ${divEntry.fee})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query
  // update does not need to update squad_id
  const updateManySQL =
    `UPDATE public."Div_Entry" ` +
    `SET fee = CASE ` +
    divIds.map((divId) => `WHEN public."Div_Entry".div_id = '${divId}' THEN d2Up.fee`).join(` `) + ' ' +
    `END ` +      
    `FROM (VALUES ` +
      getSqlValues(validDivEntries.divEntries) +
    `) AS d2Up(div_id, player_id, fee) ` +
    `WHERE public."Div_Entry".player_id = d2Up.player_id AND public."Div_Entry".div_id = d2Up.div_id;`
    
  return updateManySQL  
}

/**
 * returns the SQL query to insert many divEntries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries
 * @returns {string} - SQL query to insert many divEntries at once or ''
 */
export const getInsertManySQL = (divEntries: divEntryType[]) => {

  if (!divEntries || divEntries.length === 0) return "";
  const validDivEntries = validateDivEntries(divEntries);
  if (validDivEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (divEntries: divEntryType[]) => {
    const values: string[] = [];
    divEntries.forEach((divEntry) => {
      values.push(`('${divEntry.id}', '${divEntry.div_id}', '${divEntry.squad_id}', '${divEntry.player_id}', ${divEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Div_Entry" (id, div_id, squad_id, player_id, fee) ` +
    `SELECT d2up.id, d2up.div_id, d2up.squad_id, d2up.player_id, d2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(validDivEntries.divEntries) +
      `) AS d2up(id, div_id, squad_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Div_Entry" WHERE id = d2up.id);`

  return insertManySQL 
}

/**
 * returns the SQL query to delete many divEntries
 * 
 * @param {divEntryType[]} divEntries - array of divEntries
 * @returns {string} - SQL query to delete many divEntries at once or ''
 */
export const getDeleteManySQL = (divEntries: divEntryType[]) => { 

  if (!divEntries || divEntries.length === 0) return "";
  const validDivEntries = validateDivEntries(divEntries);
  if (validDivEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (divEntries: divEntryType[]) => {
    const values: string[] = [];
    divEntries.forEach((divEntry) => {
      values.push(`('${divEntry.div_id}', '${divEntry.player_id}')`)
    })
    return values.join(`, `);
  }

  const deleteManySQL = 
    `DELETE FROM public."Div_Entry" ` +
    `WHERE (div_id, player_id) IN ( ` +
      getSqlValues(validDivEntries.divEntries) +
    `);`

  return deleteManySQL
}

export const exportedForTesting = {
  getDivIds,  
}