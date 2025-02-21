import { playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { playerType } from "@/lib/types/types";
import { initPlayer } from "../initVals";

export const getPlayerRow = (row: typeof playerEntryData, squadId: string): playerType => {
  return {
    ...initPlayer,        
    id: row.player_id,
    squad_id: squadId,
    first_name: row.first_name,
    last_name: row.last_name,
    average: row.average,
    lane: row.lane,
    position: row.position
  } 
}

export const playerRowChanged = (playerRow: playerType, players: playerType[]): boolean => {
  if (!playerRow || !players) return false;
  const origRow = players.find((player) => player.id === playerRow.id);
  if (!origRow) return false; // new player, not changed
  const origPlayer = {
    ...initPlayer,
    id: origRow.id,
    squad_id: origRow.squad_id,
    first_name: origRow.first_name,
    last_name: origRow.last_name,
    average: origRow.average,
    lane: origRow.lane,
    position: origRow.position
  };
  return JSON.stringify(playerRow) !== JSON.stringify(origPlayer);
}
