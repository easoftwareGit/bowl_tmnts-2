import { divEntryDataType, divEntryType } from "@/lib/types/types"

/**
 * Converts divEntry to divEntryDataType
 * 
 * @param {divEntryType} divEntry - divEntry to convert to divEntryDataType
 * @returns {divEntryDataType | null} - divEntryDataType or null if divEntry is null 
 */
export const divEntryDataForPrisma = (divEntry: divEntryType): divEntryDataType | null => {
  if (!divEntry || typeof divEntry !== "object") return null
  try { 
    return {      
      id: divEntry.id,
      squad_id: divEntry.squad_id,
      div_id: divEntry.div_id,
      player_id: divEntry.player_id,
      fee: divEntry.fee
    }
  } catch (err) {
    return null
  }
}