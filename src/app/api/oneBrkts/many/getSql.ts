import type { oneBrktType } from "@/lib/types/types";

/**
 * gets array of unique brktIds
 * 
 * @param {oneBrktType[]} onebrkts - array of onebrkts
 * @returns {string[]} - array of unique brktIds
 */
const getBrktIds = (onebrkts: oneBrktType[]) => {
  const brktIds: string[] = [];
  onebrkts.forEach((oneBrkt) => {
    if (!brktIds.includes(oneBrkt.brkt_id)) {
      brktIds.push(oneBrkt.brkt_id);
    }    
  })
  return brktIds;
}

/**
 * gets array of unique oneBrktIds
 * 
 * @param {oneBrktType[]} onebrkts - array of onebrkts
 * @returns {string[]} - array of unique oneBrktIds 
 */
const getOneBrktIds = (onebrkts: oneBrktType[]) => {
  const oneBrktIds: string[] = [];
  onebrkts.forEach((onebrkts) => {
    if (!oneBrktIds.includes(onebrkts.id)) {
      oneBrktIds.push(onebrkts.id);
    }    
  })
  return oneBrktIds;
}
