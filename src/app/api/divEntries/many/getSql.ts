import { divEntryType } from "@/lib/types/types";

const getDivIds = (divEntries: divEntryType[]) => {
  const divIds: string[] = [];
  divEntries.forEach((divEntry) => {
    if (!divIds.includes(divEntry.div_id)) {
      divIds.push(divEntry.div_id);
    }    
  })
  return divIds;
}

export const getUpdateManySQL = (divEntries: divEntryType[]) => {

  if (!divEntries || divEntries.length === 0) return "";

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
      getSqlValues(divEntries) +
    `) AS d2Up(div_id, player_id, fee) ` +
    `WHERE public."Div_Entry".player_id = d2Up.player_id AND public."Div_Entry".div_id = d2Up.div_id;`
    
  return updateManySQL  
}

export const getInsertManySQL = (divEntries: divEntryType[]) => {

  if (divEntries.length === 0) return "";

  const getSqlValues = (divEntries: divEntryType[]) => {
    const values: string[] = [];
    divEntries.forEach((divEntry) => {
      values.push(`('${divEntry.div_id}', '${divEntry.squad_id}', '${divEntry.player_id}', ${divEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Div_Entry" (div_id, squad_id, player_id, fee) ` +
    `SELECT d2up.div_id, d2up.squad_id, d2up.player_id, d2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(divEntries) +
      `) AS d2up(div_id, squad_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Div_Entry" WHERE div_id = d2up.div_id AND player_id = d2up.player_id);`

  return insertManySQL 
}

export const getDeleteManySQL = (divEntries: divEntryType[]) => { 

  if (divEntries.length === 0) return "";

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
      getSqlValues(divEntries) +
    `);`

  return deleteManySQL
}
