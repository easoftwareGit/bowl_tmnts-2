import type { potPfDataType, potPfType } from "@/lib/types/types";

/**
 * Converts potPfType to potPfDataType
 * 
 * @param {potPfType} potPf  - potPf to convert to potPfDataType
 * @returns {potPfDataType} - potPfDataType
 */
export const potPfDataForPrisma = (potPf: potPfType): potPfDataType | null => {
  if (!potPf || typeof potPf !== "object") return null;
  if (
    !potPf ||
    potPf.position === null ||
    potPf.amount === null
  ) {
    return null;
  }
  return {
    id: potPf.id,
    pot_id: potPf.pot_id,
    position: potPf.position,
    amount: potPf.amount,
  };
};