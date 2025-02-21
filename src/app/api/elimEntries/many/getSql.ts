import { elimEntryType } from "@/lib/types/types";
import { validate } from "uuid";
import { validateElimEntries } from "../validate";
import { ErrorCode } from "@/lib/validation";

/**
 * Get an array of unique elimIds
 * 
 * @param elimEntries - array of elimEntries
 * @returns {string[]} - array of unique elimIds 
 */
const getElimIds = (elimEntries: elimEntryType[]) => {
  const elimIds: string[] = [];
  elimEntries.forEach((elimEntry) => {
    if (!elimIds.includes(elimEntry.elim_id)) {
      elimIds.push(elimEntry.elim_id);
    }    
  })
  return elimIds;
}

/**
 * returns an SQL query to update many elimEntries at once
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries
 * @returns {string} - SQL query to update many elimEntries at once or '' 
 */
export const getUpdateManySQL = (elimEntries: elimEntryType[]) => {

  if (!elimEntries || elimEntries.length === 0) return "";
  const validElimEntries = validateElimEntries(elimEntries);
  if (validElimEntries.errorCode !== ErrorCode.None) return "";

  const elimIds: string[] = getElimIds(elimEntries);
  if (elimIds.length === 0) return "";

  const getSqlValues = (elimEntries: elimEntryType[]) => {
    const values: string[] = [];
    elimEntries.forEach((elimEntry) => {
      values.push(`('${elimEntry.elim_id}', '${elimEntry.player_id}', ${elimEntry.fee})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query  
  const updateManySQL =
    `UPDATE public."Elim_Entry" ` +
    `SET fee = CASE ` +
      elimIds.map((elimId) => `WHEN public."Elim_Entry".elim_id = '${elimId}' THEN e2Up.fee`).join(` `) + ' ' +
    `END ` +      
    `FROM (VALUES ` +
      getSqlValues(validElimEntries.elimEntries) +
    `) AS e2Up(elim_id, player_id, fee) ` +
    `WHERE public."Elim_Entry".player_id = e2Up.player_id AND public."Elim_Entry".elim_id = e2Up.elim_id;`
    
  return updateManySQL  
}

/**
 * returns an SQL query to insert many elimEntries at once
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries
 * @returns {string} - SQL query to insert many elimEntries at once or '' 
 */
export const getInsertManySQL = (elimEntries: elimEntryType[]) => {

  if (!elimEntries || elimEntries.length === 0) return "";
  const validElimEntries = validateElimEntries(elimEntries);
  if (validElimEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (elimEntries: elimEntryType[]) => {
    const values: string[] = [];
    elimEntries.forEach((elimEntry) => {
      values.push(`('${elimEntry.id}', '${elimEntry.elim_id}', '${elimEntry.player_id}', ${elimEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Elim_Entry" (id, elim_id, player_id, fee) ` +
    `SELECT e2up.id, e2up.elim_id, e2up.player_id, e2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(validElimEntries.elimEntries) +
      `) AS e2up(id, elim_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Elim_Entry" WHERE id = e2up.id);`

  return insertManySQL 
}

/**
 * returns the SQL query to delete many elimEntries
 * 
 * @param {elimEntryType[]} elimEntries - array of elimEntries
 * @returns {string} - SQL query to delete many elimEntries at once or ''
 */
export const getDeleteManySQL = (elimEntries: elimEntryType[]) => { 

  if (!elimEntries || elimEntries.length === 0) return "";
  const validElimEntries = validateElimEntries(elimEntries);
  if (validElimEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (elimEntries: elimEntryType[]) => {
    const values: string[] = [];
    elimEntries.forEach((elimEntry) => {
      values.push(`('${elimEntry.elim_id}', '${elimEntry.player_id}')`)
    })
    return values.join(`, `);
  }

  const deleteManySQL = 
    `DELETE FROM public."Elim_Entry" ` +
    `WHERE (elim_id, player_id) IN ( ` +
      getSqlValues(validElimEntries.elimEntries) +
    `);`

  return deleteManySQL
}

export const exportedForTesting = {
  getElimIds,  
}