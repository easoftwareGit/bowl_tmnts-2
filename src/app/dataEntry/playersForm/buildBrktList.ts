import { BracketList } from "@/components/brackets/bracketListClass";
import { createByePlayer } from "@/components/brackets/byePlayer";
import type { tmntFullType, errInfoType } from "@/lib/types/types";
import { playerEntryRow } from "./populatePlayerRows";
import { defaultBrktGames, defaultPlayersPerMatch } from "@/lib/db/initVals";
import { getBrktOrElimName } from "@/lib/getName";

type createBrktListArgs = {
  rows: playerEntryRow[];
  tmntData: tmntFullType;
};

export const randomizeAllBrkts = ({
  rows,
  tmntData,
}: createBrktListArgs): BracketList[] | errInfoType => {

  if (rows == null || !Array.isArray(rows) || rows.length === 0) {
    return {
      id: "",
      column: "",
      msg: "No rows",
    }
  }
  if (tmntData.brkts == null || tmntData.brkts.length === 0) {
    return []; // no brackets, not an error
  };
  
  const brktLists: BracketList[] = [];
  
  // create bye player for all bracket lists
  const byePlayer = createByePlayer(tmntData.squads[0].id); // only one squad for now

  for (let b = 0; b < tmntData.brkts.length; b++) {
    const bnrktId = tmntData.brkts[b].id;
    const gameNumbers = [tmntData.brkts[b].start, tmntData.brkts[b].start + 1, tmntData.brkts[b].start + 2];
    // right now only 2 players per match, 3 games in bracket
    const brktList = new BracketList(
      bnrktId,
      defaultPlayersPerMatch,
      defaultBrktGames,
      gameNumbers,
      byePlayer
    );
    brktList.calcTotalBrkts(rows); // calc total brkts - simple math calc
    if (brktList.canRandomize()) {
      brktList.randomize([]);
      if (brktList.errorCode !== BracketList.noError) {
        // empty array of brackets
        brktLists.length = 0;
        const brktName = getBrktOrElimName(tmntData.brkts[b], tmntData.divs);
        return {
          id: tmntData.brkts[b].id,
          column: "",
          msg: `Error creating bracket list ${brktName}: ${brktList.errorMessage}`,
        }
      }
    } else { 
      // empty array of brackets
      brktLists.length = 0;
      const brktName = getBrktOrElimName(tmntData.brkts[b], tmntData.divs);
      return {
        id: tmntData.brkts[b].id,
        column: "",
        msg: `Error creating bracket list ${brktName}: ${brktList.errorMessage}`,
      }
    }
    brktLists.push(brktList);
  }
  return brktLists;
}