import { playerType } from "@/lib/types/types"

export const getUpdateManySQL = (playersToUpdate: playerType[]) => {

  if (playersToUpdate.length === 0) return ''
  
  // create the SQL query
  // update does not need to update squad_id
  const updateManySQL =
    `UPDATE public."Player" SET ` + 
      `first_name = p2up.first, ` +
      `last_name = p2up.last, ` +
      `average = p2up.average, ` +
      `lane = p2up.lane, ` +
      `position = p2up.position ` +
    `FROM (VALUES ` +
      playersToUpdate.map((player) => `('${player.id}', '${player.first_name}', '${player.last_name}', ${player.average}, ${player.lane}, '${player.position}')`).join(`, `) +
      `) AS p2up(id, first, last, average, lane, position) ` +
    `WHERE public."Player".id = p2up.id;`

  return updateManySQL
}

export const getInsertManySQL = (playersToInsert: playerType[]) => { 

  if (playersToInsert.length === 0) return ''

  const insertManySQL = 
    `INSERT INTO public."Player" (id, squad_id, first_name, last_name, average, lane, position) ` +
    `SELECT p2up.id, p2up.squad_id, p2up.first, p2up.last, p2up.average, p2up.lane, p2up.position ` +
    `FROM (VALUES ` +
      playersToInsert.map((player) => `('${player.id}', '${player.squad_id}', '${player.first_name}', '${player.last_name}', ${player.average}, ${player.lane}, '${player.position}')`).join(`, `) +
      `) AS p2up(id, squad_id, first, last, average, lane, position) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Player" WHERE id = p2up.id);`

  return insertManySQL
}

export const getDeleteManySQL = (playersToDelete: playerType[]) => { 

  if (playersToDelete.length === 0) return ''

  const deleteManySQL = 
    `DELETE FROM public."Player" ` +
    `WHERE id IN ( ` +
    playersToDelete.map((player) => `'${player.id}'`).join(`, `) +
    `);`

  return deleteManySQL
}
