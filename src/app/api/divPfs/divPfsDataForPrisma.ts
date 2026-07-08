import type { divPfDataType, divPfType } from "@/lib/types/types";

/**
 * Converts div to divPfDataType
 * 
 * @param {divPfType} divPf  - divPf to convert to divPfDataType
 * @returns {divPfDataType} - divDataType
 */
export const divPfDataForPrisma = (divPf: divPfType): divPfDataType | null => {
  if (!divPf || typeof divPf !== "object") return null;
  if (
    !divPf ||
    divPf.position === null ||
    divPf.amount === null
  ) {
    return null;
  }
  return {
    id: divPf.id,
    div_id: divPf.div_id,
    position: divPf.position,
    amount: divPf.amount,
  };
};