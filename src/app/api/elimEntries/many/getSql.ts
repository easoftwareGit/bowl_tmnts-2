import { elimEntryType } from "@/lib/types/types";

const getElimIds = (elimEntries: elimEntryType[]) => {
  const elimIds: string[] = [];
  elimEntries.forEach((elimEntry) => {
    if (!elimIds.includes(elimEntry.elim_id)) {
      elimIds.push(elimEntry.elim_id);
    }    
  })
  return elimIds;
}

export const getUpdateManySQL = (elimEntries: elimEntryType[]) => {

  if (!elimEntries || elimEntries.length === 0) return "";

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
      getSqlValues(elimEntries) +
    `) AS e2Up(elim_id, player_id, fee) ` +
    `WHERE public."Elim_Entry".player_id = e2Up.player_id AND public."Elim_Entry".elim_id = e2Up.elim_id;`
    
  return updateManySQL  
}

export const getInsertManySQL = (elimEntries: elimEntryType[]) => {

  if (elimEntries.length === 0) return "";

  const getSqlValues = (elimEntries: elimEntryType[]) => {
    const values: string[] = [];
    elimEntries.forEach((elimEntry) => {
      values.push(`('${elimEntry.elim_id}', '${elimEntry.player_id}', ${elimEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Elim_Entry" (elim_id, player_id, fee) ` +
    `SELECT e2up.elim_id, e2up.player_id, e2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(elimEntries) +
      `) AS e2up(elim_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Elim_Entry" WHERE elim_id = e2up.elim_id AND player_id = e2up.player_id);`

  return insertManySQL 
}

export const getDeleteManySQL = (elimEntries: elimEntryType[]) => { 

  if (elimEntries.length === 0) return "";

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
      getSqlValues(elimEntries) +
    `);`

  return deleteManySQL
}
