import type { brktEntryDataType, brktEntryType } from "@/lib/types/types"

/**
 * Converts brktEntry to brktEntryDataType
 * 
 * @param {brktEntryType} brktEntry - brktEntry to convert to brktEntryDataType
 * @returns {brktEntryDataType | null} - brktEntryDataType or null
 */
export const brktEntryDataForPrisma = (brktEntry: brktEntryType): brktEntryDataType | null => {
  if (!brktEntry || typeof brktEntry !== 'object') return null
  // DO NOT INCLUDE FEE
  return {
    id: brktEntry.id,    
    brkt_id: brktEntry.brkt_id,
    player_id: brktEntry.player_id,
    num_brackets: brktEntry.num_brackets,
    num_refunds: brktEntry.num_refunds,
    time_stamp: new Date(brktEntry.time_stamp), // Convert to Date object    
  }
}