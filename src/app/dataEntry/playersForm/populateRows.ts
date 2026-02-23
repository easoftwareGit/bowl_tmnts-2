import type { tmntFullType } from "@/lib/types/types";
import {
  divEntryHdcpColName,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  playerEntryData,
  timeStampColName,
} from "./createColumns";
import { cloneDeep } from "lodash";
import { isValidBtDbId } from "@/lib/validation/validation";

export type playerEntryRow = typeof playerEntryData;

/**
 * populates rows for data entry grid
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {playerEntryRow[]} - array of playerEntryRow
 */

export const populateRows = (tmntFullData: tmntFullType): playerEntryRow[] => {
  const pRows: playerEntryRow[] = [];
  // populate all players
  tmntFullData?.players?.forEach((player) => {
    // if a player, not a bye, then add player to pRows
    if (isValidBtDbId(player.id, 'ply')) { 
      const pRow: playerEntryRow = cloneDeep({...playerEntryData});    
      pRow.id = player.id;
      pRow.player_id = player.id;
      pRow.first_name = player.first_name;
      pRow.last_name = player.last_name;
      pRow.average = player.average;
      pRow.lane = player.lane;
      pRow.position = player.position;
      pRow.lanePos = `${player.lane}-${player.position}`;
      pRows.push(pRow);
    }
  });
  // populate division fee(s) and hdcp(s)
  tmntFullData?.divEntries?.forEach((divEntry) => {
    // find player row
    const pRow = pRows.find((row) => row.player_id === divEntry.player_id);
    if (!pRow) return;
    // creates columns if not yet created or populates columns
    pRow[entryFeeColName(divEntry.div_id)] = Number(divEntry.fee) || 0;
    pRow[divEntryHdcpColName(divEntry.div_id)] = Number(divEntry.hdcp) || 0;

  });
  // populate pot fees
  tmntFullData?.potEntries?.forEach((potEntry) => {
    const pRow = pRows.find((row) => row.player_id === potEntry.player_id);
    if (!pRow) return;    
    pRow[entryFeeColName(potEntry.pot_id)] = Number(potEntry.fee) || 0;

  });
  // populate bracket entries & fee(s)
  tmntFullData?.brktEntries?.forEach((brktEntry) => {
    const pRow = pRows.find((row) => row.player_id === brktEntry.player_id);
    if (!pRow) return;    
    pRow[entryNumBrktsColName(brktEntry.brkt_id)] = Number(brktEntry.num_brackets) || 0;
    pRow[entryFeeColName(brktEntry.brkt_id)] = Number(brktEntry.fee) || 0;
    pRow[timeStampColName(brktEntry.brkt_id)] = Number(brktEntry.time_stamp) || 0;
  });
  // populate elimination fee(s)
  tmntFullData?.elimEntries?.forEach((elimEntry) => {
    const pRow = pRows.find((row) => row.player_id === elimEntry.player_id);
    if (!pRow) return;    
    pRow[entryFeeColName(elimEntry.elim_id)] = Number(elimEntry.fee) || 0;
  });
  pRows.forEach((row) => {
    let feeTotal = 0;
    for (const key of Object.keys(row)) {
      if (!key.endsWith(feeColNameEnd)) continue;

      const n = Number(row[key]);
      feeTotal += Number.isFinite(n) ? n : 0;
    }
    row.feeTotal = feeTotal;
  });
  return pRows;
};
