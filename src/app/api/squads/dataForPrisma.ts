import { startOfDayFromString } from "@/lib/dateTools"
import { squadDataType, squadType } from "@/lib/types/types"

/**
 * Converts a squad to squad data for prisma
 * 
 * @param {squadType} squad - squad to convert
 * @returns {squadDataType | null} - squad data for prisma or null 
 */
export const squadDataForPrisma = (squad: squadType): squadDataType | null => { 

  if (squad == null) return null
  try { 
    const squadDate = startOfDayFromString(squad.squad_date_str) as Date
    if (!squadDate) return null
    return {
      id: squad.id,
      event_id: squad.event_id,            
      squad_name: squad.squad_name,      
      games: squad.games,        
      lane_count: squad.lane_count,      
      starting_lane: squad.starting_lane,      
      squad_date: squadDate,
      squad_time: squad.squad_time,
      finalized: squad.finalized,
      sort_order: squad.sort_order      
    }
  } catch (error) {
    return null
  }
}
