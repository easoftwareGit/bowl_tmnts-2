import type { potEntryDataType, potEntryType } from "@/lib/types/types"

/**
 * Converts potEntry to potEntryDataType
 * 
 * @param {potEntryType} potEntry - event to convert to potEntryDataType
 * @returns {potEntryDataType | null} - potEntryDataType or null if event is null 
 */
export const potEntryDataForPrisma = (potEntry: potEntryType): potEntryDataType | null => {
  if (!potEntry || typeof potEntry !== "object") return null
  try { 
    return {      
      id: potEntry.id,
      pot_id: potEntry.pot_id,
      player_id: potEntry.player_id,
      fee: potEntry.fee,
    }
  } catch (err) {
    return null
  }
}