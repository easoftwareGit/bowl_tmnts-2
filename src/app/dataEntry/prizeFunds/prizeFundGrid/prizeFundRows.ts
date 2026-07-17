import type { prizeFundType, prizeFundEntryRow, idTypes } from "@/lib/types/types";
import { btDbUuid } from "@/lib/uuid";

/**
 * Gets the database ID prefix for a prize-fund parent.
 *
 * @param {string} parentId - division, pot, or eliminator ID
 * @returns {idTypes | null} - prize-fund ID prefix, or null when invalid
 */
const getPfIdPrefix = (parentId: string): idTypes | null => {
  if (parentId.startsWith("div_")) {
    return "dpf";
  } 

  if (parentId.startsWith("pot_")) {
    return "ppf";
  }

  if (parentId.startsWith("elm_")) {
    return "epf";
  }

  return null;
};

/**
 * populates Prize Fund Entry Rows
 * 
 * @param {prizeFundType[]} prizeFunds - array of prize funds
 * @param {string} parentId - parent id
 * @param {number} prizeFund - prize fund
 * @param {number} positions - number of cashers
 * @returns {prizeFundEntryRow[]} - array of prizeFundEntryRows 
 */
export const populatePfRows = (
  prizeFunds: prizeFundType[],
  parentId: string,
  prizeFund: number,
  positions: number,
): prizeFundEntryRow[] => {
  
  const pfIdPrefix = getPfIdPrefix(parentId);
  if (!pfIdPrefix || prizeFund <= 0 || positions <= 0) {
    return [];
  }  

  const pfEntries: prizeFundEntryRow[] = [];  

  for (let p = 1; p <= positions; p++) {
    const found = prizeFunds.find(
      (pf) =>
        pf.parent_id === parentId &&
        pf.position === p,
    );

    if (found) {
      const amount = found.amount ?? 0;
      const pfEntry: prizeFundEntryRow = {
        id: found.id,
        parent_id: found.parent_id,
        position: p,
        amount,
        percentage: (amount / prizeFund),
      }
      pfEntries.push(pfEntry);
    } else { 
      const pfEntry: prizeFundEntryRow = {
        id: btDbUuid(pfIdPrefix),
        parent_id: parentId,
        position: p,
        amount: 0,
        percentage: 0,
      }
      pfEntries.push(pfEntry);
    }
  }
  
  return pfEntries;
}