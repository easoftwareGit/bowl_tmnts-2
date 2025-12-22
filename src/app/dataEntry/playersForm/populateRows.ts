import { tmntFullType } from "@/lib/types/types";
import {
  divEntryHdcpColName,
  entryFeeColName,
  entryNumBrktsColName,
  feeColNameEnd,
  playerEntryData,
  timeStampColName,
} from "./createColumns";

/**
 * populates rows for data entry grid
 *
 * @param {tmntFullType} tmntFullData - tmnt full data
 * @returns {typeof playerEntryData[]} - array of playerEntryData
 */

export const populateRows = (tmntFullData: tmntFullType): typeof playerEntryData[] => {
  const pRows: (typeof playerEntryData)[] = [];
  // populate all players
  tmntFullData?.players?.forEach((player) => {
    const pRow: typeof playerEntryData = { ...playerEntryData };
    pRow.id = player.id;
    pRow.player_id = player.id;
    pRow.first_name = player.first_name;
    pRow.last_name = player.last_name;
    pRow.average = player.average;
    pRow.lane = player.lane;
    pRow.position = player.position;
    pRow.lanePos = player.lane + "-" + player.position;
    pRows.push(pRow);
  });
  // populate division fee(s) and hdcp(s)
  tmntFullData?.divEntries?.forEach((divEntry) => {
    // find player row
    const pRow = pRows.find(
      (row) => row.player_id === divEntry.player_id
    ) as typeof playerEntryData;
    // creates columns if not yet created or populates columns
    if (pRow) {
      pRow[entryFeeColName(divEntry.div_id)] = divEntry.fee + ""; // as a string
      pRow[divEntryHdcpColName(divEntry.div_id)] = divEntry.hdcp;
    }
  });
  // populate pot fees
  tmntFullData?.potEntries?.forEach((potEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === potEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryFeeColName(potEntry.pot_id)] = potEntry.fee;
    }
  });
  // populate bracket entries & fee(s)
  tmntFullData?.brktEntries?.forEach((brktEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === brktEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryNumBrktsColName(brktEntry.brkt_id)] = brktEntry.num_brackets;
      pRow[entryFeeColName(brktEntry.brkt_id)] = brktEntry.fee;
      pRow[timeStampColName(brktEntry.brkt_id)] = brktEntry.time_stamp;
    }
  });
  // populate elimination fee(s)
  tmntFullData?.elimEntries?.forEach((elimEntry) => {
    const pRow = pRows.find(
      (row) => row.player_id === elimEntry.player_id
    ) as typeof playerEntryData;
    if (pRow) {
      pRow[entryFeeColName(elimEntry.elim_id)] = elimEntry.fee;
    }
  });
  pRows.forEach((row) => {
    let feeTotal = 0;
    Object.keys(row).forEach((key) => {
      if (key.endsWith(feeColNameEnd)) {
        feeTotal += Number(row[key]);
      }
    });
    row.feeTotal = feeTotal;
  });
  return pRows;
};
