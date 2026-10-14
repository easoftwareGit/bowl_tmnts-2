import { brktListRecord } from "@/components/brackets/buildBrktLists";
import { brktGamesTableRow, tmntGameResult } from "@/lib/types/resultsTypes";
import { calcNumGames } from "@/components/tmnts/games";
import { updateAllBracketMatches } from "./updateAllBracketMatches";
import { lastFirst } from "@/lib/getName";

/**
 * Sorts the bracket results grid rows in place.
 *
 * Sort order:
 * 1. Last, First name
 * 2. Lane
 *
 * @param {brktGamesTableRow[]} playerRows - bracket results grid rows to sort
 */
const sortPlayerRows = (playerRows: brktGamesTableRow[]): void => {
  // sort by last name, then first name, then lane
  playerRows.sort((a, b) => {
    const lastNameCompare = a.last_first.localeCompare(
      b.last_first,
      undefined,
      { sensitivity: "base" },
    );

    if (lastNameCompare !== 0) {
      return lastNameCompare;
    }

    return a.lane - b.lane;
  });    
}

/**
 * Populates the bracket results table rows
 *
 * @param {tmntGameResult[]} tmntResults - array of game results
 * @param {(brktListRecord)} brktListRecords - bracket list record
 * @return {brktGamesTableRow[]} - array of bracket results table rows
 */
export const populatePlayerBrktRows = (  
  tmntResults: tmntGameResult[],
  brktListRecords: brktListRecord,
): brktGamesTableRow[] => {
  const playerRows: brktGamesTableRow[] = [];

  updateAllBracketMatches(brktListRecords, tmntResults);
  
  Object.values(brktListRecords).forEach((brktList) => {    
    const playersMap = brktList.playersMap;
    const bracketIndexMap = brktList.bracketIndexMap;

    if (playersMap == null || bracketIndexMap == null || brktList.brkt == null) {
      return;
    }
    const brktDiv = brktList.brkt.div_id;    
    
    const bracketGames = tmntResults.filter((playerResult) =>
      playersMap.has(playerResult.player_id) && playerResult.div_id === brktDiv,
    );

    const numGames = calcNumGames(bracketGames);

    playersMap.forEach((player, player_id) => {
      let playerRow = playerRows.find((pRow) => pRow.player_id === player_id);
      if (!playerRow) {
        playerRow = {
          id: player_id,
          player_id: player_id,
          last_first: lastFirst(player.first_name, player.last_name,),
          lane: player.lane,
          in: 0,
          cash: "",
        };
        playerRows.push(playerRow);
      }
      let btPlayerRow = bracketGames.find((bGames) => bGames.player_id === player_id);
      if (btPlayerRow) {
        for (let game = 1; game <= numGames; game++) {
          const gameCol = `Game ${game}` as const;
          playerRow[gameCol] = btPlayerRow[gameCol];
        }
      }
      player.bracketIds.forEach(brktId => {
        const bindex = bracketIndexMap.get(brktId);
        if (bindex !== undefined) {
          const bracket = brktList.brackets[bindex];
          if (bracket) {
            if (bracket.isPlayerAlive(player_id)) {
              playerRow.in++
            }
            if (bracket.isPlayerFirstOrSecond(player_id)) {
              playerRow.cash = '$';
            }
          }
        }
      });      
    });  
  });

  sortPlayerRows(playerRows);

  return playerRows;
};
