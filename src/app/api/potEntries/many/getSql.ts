import { potEntryType } from "@/lib/types/types";
import { validatePotEntries } from "../validate";
import { ErrorCode } from "@/lib/validation";

/**
 * returns array of unique potIds
 * 
 * @param {potEntryType[]} potEntries - array of unique potIds
 * @returns {string[]} - array of unique potIds
 */
const getPotIds = (potEntries: potEntryType[]) => {
  const potIds: string[] = [];
  potEntries.forEach((potEntry) => {
    if (!potIds.includes(potEntry.pot_id)) {
      potIds.push(potEntry.pot_id);
    }    
  })
  return potIds;
}

/**
 * returns the SQL query to update many potEntries
 * 
 * @param {potEntryType[]} potEntries - array of potEntries
 * @returns {string} - SQL query to update many potEntries at once or '' 
 */
export const getUpdateManySQL = (potEntries: potEntryType[]) => {

  if (!potEntries || potEntries.length === 0) return "";
  const validPotEntries = validatePotEntries(potEntries);
  if (validPotEntries.errorCode !== ErrorCode.None) return "";

  const potIds: string[] = getPotIds(potEntries);
  if (potIds.length === 0) return "";

  const getSqlValues = (potEntries: potEntryType[]) => {
    const values: string[] = [];
    potEntries.forEach((potEntry) => {
      values.push(`('${potEntry.pot_id}', '${potEntry.player_id}', ${potEntry.fee})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query
  // update does not need to update squad_id
  const updateManySQL =
    `UPDATE public."Pot_Entry" ` +
    `SET fee = CASE ` +
    potIds.map((potId) => `WHEN public."Pot_Entry".pot_id = '${potId}' THEN p2Up.fee`).join(` `) + ' ' +
    `END ` +      
    `FROM (VALUES ` +
      getSqlValues(validPotEntries.potEntries) +
    `) AS p2Up(pot_id, player_id, fee) ` +
    `WHERE public."Pot_Entry".player_id = p2Up.player_id AND public."Pot_Entry".pot_id = p2Up.pot_id;`
    
  return updateManySQL  
}

/**
 * returns the SQL query to insert many potEntries
 * 
 * @param {potEntryType[]} potEntries - array of potEntries
 * @returns {string} - SQL query to insert many potEntries at once or '' 
 */
export const getInsertManySQL = (potEntries: potEntryType[]) => {

  if (!potEntries || potEntries.length === 0) return "";
  const validPotEntries = validatePotEntries(potEntries);
  if (validPotEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (potEntries: potEntryType[]) => {
    const values: string[] = [];
    potEntries.forEach((potEntry) => {
      values.push(`('${potEntry.id}', '${potEntry.pot_id}', '${potEntry.player_id}', ${potEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Pot_Entry" (id, pot_id, player_id, fee) ` +
    `SELECT p2up.id, p2up.pot_id, p2up.player_id, p2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(validPotEntries.potEntries) +
      `) AS p2up(id, pot_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Pot_Entry" WHERE id = p2up.id);`

  return insertManySQL 
}

export const getDeleteManySQL = (potEntries: potEntryType[]) => { 

  if (!potEntries || potEntries.length === 0) return "";
  const validPotEntries = validatePotEntries(potEntries);
  if (validPotEntries.errorCode !== ErrorCode.None) return "";

  const getSqlValues = (potEntries: potEntryType[]) => {
    const values: string[] = [];
    potEntries.forEach((potEntry) => {
      values.push(`('${potEntry.pot_id}', '${potEntry.player_id}')`)
    })
    return values.join(`, `);
  }

  const deleteManySQL = 
    `DELETE FROM public."Pot_Entry" ` +
    `WHERE (pot_id, player_id) IN ( ` +
      getSqlValues(validPotEntries.potEntries) +
    `);`

  return deleteManySQL
}

export const exportedForTesting = {
  getPotIds,  
}