import type { brktType, divType, elimType, playerType, potType } from "@/lib/types/types";
import { ptGame, ptLastGame } from "./validation/constants";
import { isValidBtDbId } from "./validation/validation";

const findDiv = (id: string, divs: divType[]): divType | undefined => {
  return divs.find((div) => div.id === id);
}

/**
 * gets the name of a div
 * 
 * @param {string} id - id of div
 * @param {divType[]} divs - array of divs
 * @returns {string} - name of div or empty string
 */
export const getDivName = (id: string, divs: divType[]): string => {
  const foundDiv: divType | undefined = findDiv(id, divs)
  return (foundDiv)
    ? foundDiv.div_name
    : '';
}

/**
 * gets the name of a pot
 * 
 * @param {potType} pot - pot type
 * @param {divType[]} divs - array of divs
 * @returns {string} - name of pot or empty string
 */
export const getPotName = (pot: potType | undefined, divs: divType[]): string => {
  if (!pot || !pot.pot_type) return "";
  const foundDiv: divType | undefined = findDiv(pot.div_id, divs)
  return (foundDiv && pot && pot.pot_type)
    ? foundDiv.div_name + ': ' + pot.pot_type
    : '';
}

/**
 * gets the short name of a pot
 * 
 * @param {potType} pot - pot type
 * @param {divType[]} divs - array of divs
 * @returns {string} - short name of pot or empty string 
 */
export const getPotShortName = (pot: potType, divs: divType[]): string => {
  const foundDiv: divType | undefined = findDiv(pot.div_id, divs)
  const potShort = (pot.pot_type === ptGame)
    ? 'Gm'
    : (pot.pot_type === ptLastGame) ? 'LG' : 'Sr';    
  return (foundDiv)
    ? foundDiv.div_name + ': ' + potShort
    : '';
}

/**
 * gets the name of a bracket or eliminator
 * 
 * @param {brktType | elimType} feature - bracket or eliminator
 * @param {divType[]} divs - array of divs
 * @returns {string} - name of bracket/eliminator or empty string 
 */
export const getBrktOrElimName = (feature: brktType | elimType, divs: divType[]): string => {
  if (!feature || !feature.div_id || !divs) return '';
  const foundDiv: divType | undefined = findDiv(feature.div_id, divs)  
  return (foundDiv)
    ? foundDiv.div_name + ': ' + feature.start + '-' + (feature.start + feature.games - 1)
    : '';
}

/**
 * gets the name of a player
 * 
 * @param {playerType[]} players - array of players
 * @param {string} playerId - id of player
 * @param {boolean} firstLast - whether to return "last, first" or "first last"
 * @returns {string} - name of player or empty string
 */
export const getPlayerName = (
  players: playerType[],
  playerId: string,
  firstLast: boolean = true
): string => {
  if (!isValidBtDbId(playerId, 'ply')) return '';
  if (players == null || !Array.isArray(players) || players.length === 0) return '';
  const player = players.find((p) => p.id === playerId);
  if (!player) return '';  
  return (firstLast)
    ? fullName(player.first_name, player.last_name)
    : lastFirst(player.first_name, player.last_name);
}

/**
 * combines last and first name 
 * 
 * @param {string} first - first name 
 * @param {string} last - last name
 * @returns {string} - "last, first" or empty string
 */
export const lastFirst = (first: string, last: string): string => {
  if (!first || first.trim().length === 0) {
    return (!last || last.trim().length === 0) ? '' : last.trim();
  } else { 
    return (!last || last.trim().length === 0)
      ? first
      : last.trim() + ', ' + first.trim();
  }
}

/**
 * combines first and last name
 * 
 * @param {string} first - first name
 * @param {string} last - last name
 * @returns {string} - "first last" name or empty string   
 */
export const fullName = (first: string, last: string): string => {  
  if (!first || first.trim().length === 0) {
    return (!last || last.trim().length === 0) ? '' : last.trim();
  } else { 
    return (!last || last.trim().length === 0)
      ? first : first.trim() + ' ' + last.trim();
  }
}

export const exportedForTesting = {
  findDiv,  
}