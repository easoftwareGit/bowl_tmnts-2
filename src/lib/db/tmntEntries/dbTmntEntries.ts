import { playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { dataOneSquadEntriesType, playerType } from "@/lib/types/types";
import { initPlayer } from "../initVals";
import { getPlayerRow, playerRowChanged } from "./players";

export const saveTmntEntries = async (rows: typeof playerEntryData[], origData: dataOneSquadEntriesType): Promise<dataOneSquadEntriesType | null> => {

  if (!rows || rows.length === 0) return null;

  const playersToUpdate: playerType[] = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];    
    if (row.player_id !== "") { 
      const playerRow = getPlayerRow(origData, row.player_id);
      if (playerRowChanged(playerRow, origData.players)) {
        playersToUpdate.push(playerRow);
      }
    }
  }

  return null
}