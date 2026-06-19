import type { tmntMoneyType, tmntMoneyDataType } from "@/lib/types/types"

/**
 * Converts tmntMoney to tmntMoneyDataType
 * 
 * @param {tmntMoney} tmntMoney - tmntMoney to convert to tmntMoneyDataType
 * @returns {tmntMoneyDataType | null} - tmntMoneyDataType or null if event is null 
 */
export const tmntMoneyDataForPrisma = (tmntMoney: tmntMoneyType): tmntMoneyDataType | null => {
  if (!tmntMoney || typeof tmntMoney !== "object") return null
  try { 
    return {      
      id: tmntMoney.id,
      event_id: tmntMoney.event_id,
      squad_id: tmntMoney.squad_id,      
      div_id: tmntMoney.div_id,
      descrip: tmntMoney.descrip,
      flow: tmntMoney.flow,
      amount: tmntMoney.amount || 0,
      pot_id: tmntMoney.pot_id,
      brkt_id: tmntMoney.brkt_id,
      elim_id: tmntMoney.elim_id,
      sort_order: tmntMoney.sort_order
    }
  } catch (err) {
    return null
  }
}