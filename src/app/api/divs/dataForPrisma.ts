import type { divDataType, divType } from "@/lib/types/types";

/**
 * Converts div to divDataType
 * 
 * @param {divType} div  - div to convert to divDataType
 * @returns {divDataType} - divDataType
 */
export const divDataForPrisma = (div: divType): divDataType | null => {
  if (!div || typeof div !== "object") return null;
  try {
    return {
      id: div.id,
      tmnt_id: div.tmnt_id,
      div_name: div.div_name,
      hdcp_per: div.hdcp_per,
      hdcp_from: div.hdcp_from,
      int_hdcp: div.int_hdcp,
      hdcp_for: div.hdcp_for,
      sort_order: div.sort_order,
    };
  } catch (err) {
    return null;
  }
};