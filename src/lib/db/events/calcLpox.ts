import { formatValue2Dec } from "@/lib/currency/formatValue";
import type { eventType, validTypeStrings } from "@/lib/types/types";
import { localConfig } from "@/lib/currency/const";

/**
 * Calculates LPOX
 *
 * @param {eventType} event - event with lineage, prize_fund, other, and expenses
 * @returns {string} - lpox linage + prize_fund + other + expenses, "" on error
 */
export const calcLpox = (event: eventType): string => {
  if (
    !event ||
    event.lineage == null ||
    event.prize_fund == null ||
    event.other == null ||
    event.expenses == null 
  )
    return "";
    
  try {
    const lpoxNum =
      Number(event.lineage || 0) +
      Number(event.prize_fund || 0) +
      Number(event.other || 0) +
      Number(event.expenses || 0);
    const lpoxStr = lpoxNum.toString();
    if (lpoxStr === "NaN") {
      return "";
    }
    return formatValue2Dec(lpoxNum.toString(), localConfig);
  } catch (err) {
    return "";
  }
};

/**
 * Checks if LPOX is valid
 * 
 * @param {eventType} event - event 
 * @returns {string} - "is-valid" or "is-invalid", "" on error 
 */
export const calcLpoxValid = (event: eventType): validTypeStrings => {
  if (!event || event.entry_fee == null || event.lpox == null) return "";
  try { 
    return Number(event.entry_fee) === Number(event.lpox)
      ? "is-valid"
      : "is-invalid";
  } catch (err) {
    return "";
  }  
};
