import { playerDataType, playerType } from "@/lib/types/types"

/**
 * Converts player to playerDataType
 * 
 * @param {playerType} player - player to convert to playerDataType
 * @returns {playerDataType | null} - playerDataType or null if player is null 
 */
export const playerDataForPrisma = (player: playerType): playerDataType | null => {
  if (!player || typeof player !== "object") return null
  try { 
    return {      
      id: player.id,
      squad_id: player.squad_id,
      first_name: player.first_name,
      last_name: player.last_name,
      average: player.average,
      lane: player.lane,
      position: player.position,      
    }
  } catch (err) {
    return null
  }
}