import type { gameType, tmntFullType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { cloneDeep } from "lodash";

export const scoreEntryData: { [key: string]: any } = {
  id: "",  
  player_id: "",
  first_name: "",
  last_name: "",
  average: 0,
  lanePos: "",  
  total: null, 
  plus_minus: null,
};

export type scoreEntryRow = typeof scoreEntryData;

/**
 * Populate rows for scores form
 * 
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @param {gameType[]} games - array of games
 * @returns {scoreEntryRow[]} - array of scoreEntryRow objects 
 */
export const populateScoreRows = (tmntFullData: tmntFullType, games: gameType[]): scoreEntryRow[] => {
  const sRows: scoreEntryRow[] = [];
  const numGames = tmntFullData?.squads?.[0]?.games ?? 0;

  // populate all players
  tmntFullData?.players?.forEach((player) => {
    // if a player, then add player to sRows
    if (isValidBtDbId(player.id, 'ply')) { 
      const sRow: scoreEntryRow = cloneDeep({...scoreEntryData});    
      sRow.id = player.id;
      sRow.player_id = player.id;
      sRow.first_name = player.first_name;
      sRow.last_name = player.last_name;
      sRow.average = player.average;      
      sRow.lanePos = `${player.lane}-${player.position}`;            
      for (let g = 1; g <= numGames; g++) {
        sRow['game_' + g] = null;
      }            
      sRow.total = 0;
      sRow.plus_minus = 0;
      const playerScores = games.filter((game) => game.player_id === player.id);
      playerScores.forEach((game) => {
        sRow['game_' + game.game_num] = game.score;
        sRow.total += game.score;
      });
      sRows.push(sRow);
    }
  });
  return sRows;
};