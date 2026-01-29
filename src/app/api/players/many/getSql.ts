import { playerType, validPlayersType } from "@/lib/types/types"
import { validatePlayers } from "../../../../lib/validation/players/validate"
import { ErrorCode } from "@/lib/validation/validation";

/**
 * Returns SQL query to update many players at once
 * 
 * @param {playerType[]} playerEntries - array of player entries
 * @returns {string} - SQL query to update many players at once or ''
 */
export const getUpdateManySQL = (playerEntries: playerType[]) => {

  if (!playerEntries || playerEntries.length === 0) return ''
  const validPlayerEntries: validPlayersType = validatePlayers(playerEntries);
  if (validPlayerEntries.errorCode !== ErrorCode.NONE) return ''
  
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
      validPlayerEntries.players.map((player) => `('${player.id}', '${player.first_name}', '${player.last_name}', ${player.average}, ${player.lane}, '${player.position}')`).join(`, `) +
      `) AS p2up(id, first, last, average, lane, position) ` +
    `WHERE public."Player".id = p2up.id;`

  return updateManySQL
}

/**
 * Returns SQL query to insert many players at once
 * 
 * @param {playerType[]} playerEntries - array of player entries
 * @returns {string} - SQL query to insert many players at once or '' 
 */
export const getInsertManySQL = (playerEntries: playerType[]) => { 

  if (!playerEntries || playerEntries.length === 0) return ''
  const validPlayerEntries: validPlayersType = validatePlayers(playerEntries);
  if (validPlayerEntries.errorCode !== ErrorCode.NONE) return ''

  const insertManySQL = 
    `INSERT INTO public."Player" (id, squad_id, first_name, last_name, average, lane, position) ` +
    `SELECT p2up.id, p2up.squad_id, p2up.first, p2up.last, p2up.average, p2up.lane, p2up.position ` +
    `FROM (VALUES ` +
      validPlayerEntries.players.map((player) => `('${player.id}', '${player.squad_id}', '${player.first_name}', '${player.last_name}', ${player.average}, ${player.lane}, '${player.position}')`).join(`, `) +
      `) AS p2up(id, squad_id, first, last, average, lane, position) ` +
    `WHERE NOT EXISTS (SELECT 1 FROM public."Player" WHERE id = p2up.id);`

  return insertManySQL
}

/**
 * Returns SQL query to delete many players at once
 * 
 * @param {playerType[]} playerEntries - array of player entries
 * @returns {string} - SQL query to delete many players at once or ''
 */
export const getDeleteManySQL = (playerEntries: playerType[]) => { 

  if (!playerEntries || playerEntries.length === 0) return ''
  const validPlayerEntries: validPlayersType = validatePlayers(playerEntries);
  if (validPlayerEntries.errorCode !== ErrorCode.NONE) return ''

  const deleteManySQL = 
    `DELETE FROM public."Player" ` +
    `WHERE id IN ( ` +
      validPlayerEntries.players.map((player) => `'${player.id}'`).join(`, `) +
    `);`

  return deleteManySQL
}
