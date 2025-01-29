import { potEntryType } from "@/lib/types/types";

const getPotIds = (potEntries: potEntryType[]) => {
  const potIds: string[] = [];
  potEntries.forEach((potEntry) => {
    if (!potIds.includes(potEntry.pot_id)) {
      potIds.push(potEntry.pot_id);
    }    
  })
  return potIds;
}

export const getUpdateManySQL = (potEntries: potEntryType[]) => {

  if (!potEntries || potEntries.length === 0) return "";

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
      getSqlValues(potEntries) +
    `) AS p2Up(pot_id, player_id, fee) ` +
    `WHERE public."Pot_Entry".player_id = p2Up.player_id AND public."Pot_Entry".pot_id = p2Up.pot_id;`
    
  return updateManySQL  
}

export const getInsertManySQL = (potEntries: potEntryType[]) => {

  if (potEntries.length === 0) return "";

  const getSqlValues = (potEntries: potEntryType[]) => {
    const values: string[] = [];
    potEntries.forEach((potEntry) => {
      values.push(`('${potEntry.pot_id}', '${potEntry.player_id}', ${potEntry.fee})`)
    })    
    return values.join(`, `);
  }

  const insertManySQL = 
    `INSERT INTO public."Pot_Entry" (pot_id, player_id, fee) ` +
    `SELECT p2up.pot_id, p2up.player_id, p2up.fee ` +
    `FROM (VALUES ` +
      getSqlValues(potEntries) +
      `) AS p2up(pot_id, player_id, fee) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Pot_Entry" WHERE pot_id = p2up.pot_id AND player_id = p2up.player_id);`

  return insertManySQL 
}

export const getDeleteManySQL = (potEntries: potEntryType[]) => { 

  if (potEntries.length === 0) return "";

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
      getSqlValues(potEntries) +
    `);`

  return deleteManySQL
}
