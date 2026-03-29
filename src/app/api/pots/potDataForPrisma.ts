import type { potDataType, potType } from "@/lib/types/types"

/**
 * Converts pot to potDataType
 * 
 * @param {potType} pot - event to convert to potDataType
 * @returns {potDataType | null} - potDataType or null if event is null 
 */
export const potDataForPrisma = (pot: potType): potDataType | null => {
  if (!pot || typeof pot !== "object") return null
  try { 
    return {      
      id: pot.id,
      squad_id: pot.squad_id,
      div_id: pot.div_id,
      fee: pot.fee,
      pot_type: pot.pot_type,      
      sort_order: pot.sort_order,          
    }
  } catch (err) {
    return null
  }
}