import type { brktType } from "@/lib/types/types";
import type { playerEntryRow } from "./populateRows";
import { BracketList } from "@/components/brackets/bracketListClass";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { createByePlayer } from "@/components/brackets/byePlayer";

/**
 * builds brkts list map
 *
 * @param {string} squadId - id of squad
 * @param {brktType[]} brkts - array of brkts
 * @param {playerEntryRow[]} rows - array of playerEntryData, current data entry rows
 * @param {Record<string, BracketList>} prevAllBrktsList - prior brkts list
 * @returns {Record<string, BracketList>} - brkts list map
 */
export const buildBrktList = (
  squadId: string,
  brkts: brktType[],
  rows: playerEntryRow[] = [],
  prevAllBrktsList?: Record<string, BracketList>
): Record<string, BracketList> => {
  const bList: Record<string, BracketList> = {};

  const byePlayer = createByePlayer(squadId)

  brkts.forEach((brkt) => {        
    const prev = prevAllBrktsList?.[brkt.id];
    const brktList = new BracketList(
      brkt.id,
      defaultPlayersPerMatch,
      defaultBrktGames,    
      byePlayer,
      prev?.brackets ?? []
    );
    brktList.calcTotalBrkts(rows);
    bList[brkt.id] = brktList;
  });

  return bList;
};
