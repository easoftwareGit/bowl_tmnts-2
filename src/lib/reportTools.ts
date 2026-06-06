import { divType, playerType, tmntFullType } from "@/lib/types/types";

/**
 * clips a string to a maximum length
 * 
 * @param {string} text - string to clip
 * @param {number} maxChars - maximum length of string
 * @returns {string} - clipped string
 */
export const clipText = (text: string, maxChars: number): string => {
  return text.length > maxChars ? text.slice(0, maxChars) : text;
};

/**
 * removes bye players from an array of players
 * 
 * @param {playerType[]} players - array of players to filter
 * @returns {playerType[]} - array of players without bye players
 */
export const removeByePlayers = (players: playerType[]): playerType[] => {
  if (!Array.isArray(players)) return [];
  return players.filter(player => !player.id.startsWith("bye"));
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
