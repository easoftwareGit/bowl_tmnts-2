import type { tmntFullType } from "@/lib/types/types";
import { createByePlayer } from "@/components/brackets/byePlayer";
import { BracketList, brktListInitialDataType } from "@/components/brackets/bracketListClass";
import {
  defaultPlayersPerMatch,
  defaultBrktGames,
} from "@/lib/db/initVals";
import { dummySquadId } from "@/lib/validation/constants";

export type BrktListRecord = Record<string, BracketList>;

/**
 * builds bracket list records
 * 
 * @param {tmntFullType} tmntFullData - full tournament data
 * @returns {BrktListRecord} bracket list records 
 */
export const buildBrktListRecords = (
  tmntFullData: tmntFullType,
): BrktListRecord => {
  const blRecord: BrktListRecord = {};

  // one bye player for all brackets
  const initByePlayer = createByePlayer(dummySquadId); // ok to use dummy data, not saved
  
  tmntFullData.brkts.forEach((brkt) => {
    // get the div for this brkt
    const brktDiv = tmntFullData.divs.find(
      (div) => div.id === brkt.div_id
    );
    if (!brktDiv) {
      throw new Error(
        "No div for brkt " + brkt.id + " in buildBrktListRecords"
      );
    };

    // get divEntries for this brkt
    const brktDivEntries = tmntFullData.divEntries.filter(
      (divEntry) => divEntry.div_id === brkt.div_id
    );
    if (brktDivEntries.length === 0) {
      throw new Error(
        "No divEntries for brkt " + brkt.id + " in buildBrktListRecords"
      );
    };

    // get oneBrkts for this brkt
    const brktOneBrkts = tmntFullData.oneBrkts.filter(
      (oneBrkt) => oneBrkt.brkt_id === brkt.id,
    );
    if (brktOneBrkts.length === 0) {
      throw new Error(
        "No oneBrkts for brkt " + brkt.id + " in buildBrktListRecords"
      );
    };

    // get just the one_brkt_ids for this brkt
    const oneBrktIds = brktOneBrkts.map((oneBrkt) => oneBrkt.id);

    // get bracketseeds for this brkt
    const brktSeeds = tmntFullData.brktSeeds.filter(
      (seed) => oneBrktIds.includes(seed.one_brkt_id),
    );
    if (brktSeeds.length === 0) {
      throw new Error(
        "No brktSeeds for brkt " + brkt.id + " in buildBrktListRecords"
      );
    };

    // get the game numbers for this brkt
    const gameNumbers = [
      brkt.start,
      brkt.start + 1,
      brkt.start + 2,
    ];

    const initData: brktListInitialDataType = {        
      tmntFullData: tmntFullData,
      divId: brkt.div_id,
    };

    // create bracketList object for this brkt
    const bracketList = new BracketList(
      brkt.id,
      defaultPlayersPerMatch,
      defaultBrktGames,
      gameNumbers,
      initByePlayer,
      initData,
    );
    
    // add bracketList to record 
    blRecord[brkt.id] = bracketList;
  });

  return blRecord;
};