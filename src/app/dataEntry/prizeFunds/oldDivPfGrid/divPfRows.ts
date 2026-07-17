import type { divPfType, divPfEntryRow } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

/**
 * populates divison Prize Fund Entry Rows
 * 
 * @param {divPfType[]} divPfs - array of divPfs
 * @param {string} divId - division id
 * @param {number} divPrizeFund - division prize fund
 * @param {number} positions - number of cashers
 * @returns {divPfEntryRow[]} - array of divPfEntryRows 
 */
export const populateDivPfRows = (
  divPfs: divPfType[],
  divId: string,
  divPrizeFund: number,
  positions: number,
): divPfEntryRow[] => {
  
  const divPfEntries: divPfEntryRow[] = [];

  if (!divPrizeFund || !positions) return divPfEntries;

  for (let i = 1; i <= positions; i++) {
    const found = divPfs.find((divPf) => divPf.position === i);
    if (found) {
      const divPfEntry: divPfEntryRow = {
        id: found.id,
        div_id: found.div_id,
        position: i,
        amount: found.amount!,
        percentage: ((found.amount! || 0) / divPrizeFund),
      }
      divPfEntries.push(divPfEntry);
    } else { 
      const divPfEntry: divPfEntryRow = {
        id: btDbUuid('dpf'),
        div_id: divId,
        position: i,
        amount: 0,
        percentage: 0,
      }
      divPfEntries.push(divPfEntry);
    }
  }
  
  return divPfEntries;
}