import type { elimPfDataType, elimPfType } from "@/lib/types/types";

/**
 * Converts elimPfType to elimPfDataType
 * 
 * @param {elimPfType} elimPf  - elimPf to convert to elimPfDataType
 * @returns {elimPfDataType} - elimPfDataType
 */
export const elimPfDataForPrisma = (elimPf: elimPfType): elimPfDataType | null => {
  if (!elimPf || typeof elimPf !== "object") return null;
  if (
    !elimPf ||
    elimPf.position === null ||
    elimPf.amount === null
  ) {
    return null;
  }
  return {
    id: elimPf.id,
    elim_id: elimPf.elim_id,
    position: elimPf.position,
    amount: elimPf.amount,
  };
};