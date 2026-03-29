import type { elimEntryDataType, elimEntryType } from "@/lib/types/types"

/**
 * Converts elimEntry to elimEntryDataType
 * 
 * @param {elimEntryType} elimEntry - event to convert to elimEntryDataType
 * @returns {elimEntryDataType | null} - elimEntryDataType or null if event is null 
 */
export const elimEntryDataForPrisma = (elimEntry: elimEntryType): elimEntryDataType | null => {
  if (!elimEntry || typeof elimEntry !== "object") return null
  try { 
    return {      
      id: elimEntry.id,      
      elim_id: elimEntry.elim_id,
      player_id: elimEntry.player_id,      
      fee: elimEntry.fee,
    }
  } catch (err) {
    return null
  }
}