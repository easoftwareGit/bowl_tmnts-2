import { brktEntryType } from "@/lib/types/types";

const getBrktIds = (brktEntries: brktEntryType[]) => {
  const brktIds: string[] = [];
  brktEntries.forEach((brktEntry) => {
    if (!brktIds.includes(brktEntry.brkt_id)) {
      brktIds.push(brktEntry.brkt_id);
    }    
  })
  return brktIds;
}

export const getUpdateManySQL = (brktEntries: brktEntryType[]) => {

  if (!brktEntries || brktEntries.length === 0) return "";

  const brktIds: string[] = getBrktIds(brktEntries);
  if (brktIds.length === 0) return "";

  const getSqlValues = (brktEntries: brktEntryType[]) => {
    const values: string[] = [];
    brktEntries.forEach((brktEntry) => {
      values.push(`('${brktEntry.brkt_id}', '${brktEntry.player_id}', ${brktEntry.fee}, ${brktEntry.num_brackets})`)
    })    
    return values.join(`, `);
  }

  // create the SQL query  
  const updateManySQL =
    `UPDATE public."Brkt_Entry" ` +
    `SET fee = CASE ` +
      brktIds.map((brktId) => `WHEN public."Brkt_Entry".brkt_id = '${brktId}' THEN b2Up.fee`).join(` `) + ' ' +
    `END, ` +      
    `num_brackets = CASE ` +
      brktIds.map((brktId) => `WHEN public."Brkt_Entry".brkt_id = '${brktId}' THEN b2Up.num_brackets`).join(` `) + ' ' +
    `END ` +
    `FROM (VALUES ` +
      getSqlValues(brktEntries) +
    `) AS b2Up(brkt_id, player_id, fee, num_brackets) ` +
    `WHERE public."Brkt_Entry".player_id = b2Up.player_id AND public."Brkt_Entry".brkt_id = b2Up.brkt_id;`
    
  return updateManySQL  
}

export const getInsertManySQL = (brktEntries: brktEntryType[]) => {

  if (brktEntries.length === 0) return "";

  const getSqlValues = (brktEntries: brktEntryType[]) => {
    const values: string[] = [];
    brktEntries.forEach((brktEntry) => {
      values.push(`('${brktEntry.brkt_id}', '${brktEntry.player_id}', ${brktEntry.fee}, ${brktEntry.num_brackets})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Brkt_Entry" (brkt_id, player_id, fee, num_brackets) ` +
    `SELECT b2up.brkt_id, b2up.player_id, b2up.fee, b2up.num_brackets ` +
    `FROM (VALUES ` +
      getSqlValues(brktEntries) +
      `) AS b2up(brkt_id, player_id, fee, num_brackets) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Brkt_Entry" WHERE brkt_id = b2up.brkt_id AND player_id = b2up.player_id);`

  return insertManySQL 
}

export const getDeleteManySQL = (brktEntries: brktEntryType[]) => { 

  if (brktEntries.length === 0) return "";

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
      getSqlValues(brktEntries) +
    `);`

  return deleteManySQL
}