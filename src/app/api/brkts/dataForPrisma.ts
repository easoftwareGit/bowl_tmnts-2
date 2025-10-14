import { brktDataType, brktType } from "@/lib/types/types"

/**
 * Converts brkt to brktDataType
 * 
 * @param {brktType} brkt - event to convert to brktDataType
 * @returns {brktDataType | null} - brktDataType or null if event is null 
 */
export const brktDataForPrisma = (brkt: brktType): brktDataType | null => {
  if (!brkt || typeof brkt !== "object") return null
  // note: NO fsa in brktDataType
  try {     
    return {      
      id: brkt.id,
      div_id: brkt.div_id,
      squad_id: brkt.squad_id,
      fee: brkt.fee,
      start: brkt.start,
      games: brkt.games,
      players: brkt.players,
      first: brkt.first,
      second: brkt.second,
      admin: brkt.admin,      
      sort_order: brkt.sort_order
    }
  } catch (err) {
    return null
  }
}