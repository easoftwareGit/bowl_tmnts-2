import { divType, playerType, tmntDataType, tmntFullType } from "@/lib/types/types";

/**
 * sorts an array of players by lane and position
 * 
 * @param {playerType[]} players - array of players to sort 
 * @returns {playerType[]} - sorted array of players 
 */
export const sortedPlayersByLanePos = (players: playerType[]): playerType[] => {
  if (!Array.isArray(players)) return [];
  return [...players].sort((a, b) => {
    // primary sort
    if (a.lane !== b.lane) {
      return a.lane - b.lane;
    }
    // secondary sort
    return a.position.localeCompare(b.position);
  });
}

/**
 * checks if a tmnt has hdcp divs
 * 
 * @param {tmntFullType} fullTmntData - full tmnt data
 * @returns {boolean} - true if tmnt has hdcp divs 
 */
export const tmntHasHdcpDivs = (fullTmntData: tmntFullType): boolean => {
  if (!fullTmntData) return false;
  return fullTmntData?.divs?.some(
    (div) => (div.hdcp_per ?? 0) > 0,
  ) ?? false;
}

/**
 * sorts an array of divs by sort order
 * 
 * @param {divType[]} divs - array of divs to sort 
 * @returns {divType[]} - sorted array of divs 
 */
export const sortedDivsByOrder = (divs: divType[]): divType[] => {
  if (!Array.isArray(divs)) return [];
  return [...divs].sort((a, b) =>
    (a.sort_order ?? Number.MAX_SAFE_INTEGER) -
    (b.sort_order ?? Number.MAX_SAFE_INTEGER)
  );  
}

/**
 * checks if full tmnt data has data
 * 
 * @param {tmntFullType} fullTmntData - full tmnt data to check
 * @returns {boolean} - true if full tmnt data is valid 
 */
export const tmntObjectHasData = (fullTmntData: tmntFullType): boolean => {
  if (
    !fullTmntData ||
    !fullTmntData.tmnt ||
    !fullTmntData.events ||
    !fullTmntData.squads ||
    !fullTmntData.lanes ||
    !fullTmntData.divs ||
    !fullTmntData.divEntries ||
    !fullTmntData.players
  ) {
    return false;
  }
  return true;
}