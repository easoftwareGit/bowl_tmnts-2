import type { eventDataType, eventType } from "@/lib/types/types"

/**
 * Converts event to eventDataType
 * 
 * @param {eventType} event - event to convert to eventDataType
 * @returns {eventDataType | null} - eventDataType or null if event is null 
 */
export const eventDataForPrisma = (event: eventType): eventDataType | null => {
  if (!event || typeof event !== "object") return null
  try { 
    return {      
      id: event.id,
      tmnt_id: event.tmnt_id,
      event_name: event.event_name,
      team_size: event.team_size,
      games: event.games,
      entry_fee: event.entry_fee,
      lineage: event.lineage,
      prize_fund: event.prize_fund,
      other: event.other,
      expenses: event.expenses,
      added_money: event.added_money,      
      sort_order: event.sort_order,          
    }
  } catch (err) {
    return null
  }
}