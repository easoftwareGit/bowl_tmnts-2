import type { potPfType, potPfEntryRow } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

/**
 * populates pots Prize Fund Entry Rows
 * 
 * @param {potPfType[]} potPfs - array of potPfs
 * @param {string} potId - pot id
 * @param {number} potPrizeFund - pot prize fund
 * @param {number} positions - number of cashers
 * @returns {divPfEntryType[]} - array of potPfEntries 
 */
export const populatePotPfRows = (
  potPfs: potPfType[],
  potId: string,
  potPrizeFund: number,
  positions: number,
): potPfEntryRow[] => {
  
  const potPfEntries: potPfEntryRow[] = [];

  if (!potPrizeFund || !positions) return potPfEntries;

  for (let i = 1; i <= positions; i++) {
    const found = potPfs.find((potPf) => potPf.position === i);
    if (found) {
      const potPfEntry: potPfEntryRow = {
        id: found.id,
        pot_id: found.pot_id,
        position: i,
        amount: found.amount!,
        percentage: ((found.amount! || 0) / potPrizeFund),
      }
      potPfEntries.push(potPfEntry);
    } else { 
      const potPfEntry: potPfEntryRow = {
        id: btDbUuid('ppf'),
        pot_id: potId,
        position: i,
        amount: 0,
        percentage: 0,
      }
      potPfEntries.push(potPfEntry);
    }
  }
  
  return potPfEntries;
}