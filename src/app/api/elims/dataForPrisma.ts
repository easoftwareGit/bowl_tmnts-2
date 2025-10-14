import { elimDataType, elimType } from "@/lib/types/types"

/**
 * Converts elim to elimDataType
 * 
 * @param {elimType} elim - elim to convert to elimDataType
 * @returns {elimDataType | null} - elimDataType or null if elim is null 
 */
export const elimDataForPrisma = (elim: elimType): elimDataType | null => {
  if (!elim || typeof elim !== "object") return null
  try { 
    return {      
      id: elim.id,
      div_id: elim.div_id,
      squad_id: elim.squad_id,
      start: elim.start,
      games: elim.games,
      fee: elim.fee,
      sort_order: elim.sort_order
    }
  } catch (err) {
    return null
  }
}