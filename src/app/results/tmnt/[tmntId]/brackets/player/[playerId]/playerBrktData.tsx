import React from "react";
import type { brktEntryType, tmntFullType } from "@/lib/types/types";
import { isNumber } from "@/lib/validation/validation";
import type { brktListRecord } from "@/components/brackets/buildBrktLists";
import type { BracketList } from "@/components/brackets/bracketListClass";

export type brktSummaryType = {
  allComplete: boolean;
  entries: number;
  entryAmount: number;
  refunds: number;
  refundAmount: number;
  earnings: number;
};

/**
 * simple error message display for missing data
 * 
 * @param {string} errMsg - error message to display
 * @returns - react component
 */
export const missingDataError = (errMsg: string) => {
  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="alert alert-danger" role="alert">
            {errMsg}
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Checks that the tournament has what is needed to total the player's brackets:
 * a bracket entry, the bracket, and a numeric fee, first and second amount.
 *
 * @param {tmntFullType} tmntFullData - full tournament data
 * @param {string} brktId - bracket id
 * @param {string} playerId - player id
 * @returns {string | null} the error message, or null when the data is good
 */
export const getBrktSummaryDataError = (
  tmntFullData: tmntFullType,
  brktId: string,
  playerId: string,
): string | null => {
  const brkt = tmntFullData.brkts.find((b) => b.id === brktId);
  if (!brkt) return "Bracket configuration not found. Id: " + brktId;
  const entry = tmntFullData.brktEntries.find(
    (be) => be.player_id === playerId && be.brkt_id === brkt.id,
  );
  if (!entry) return "Player bracket entries not found. Id: " + playerId;
  if (!isNumber(brkt.fee)) return "Bracket fee not found.";
  if (!isNumber(brkt.first)) return "Bracket first amount not found.";
  if (!isNumber(brkt.second)) return "Bracket second amount not found.";
  return null;
};

/**
 * Adds up the summaries of all of a player's brackets.
 *
 * Returns all zeros, with allComplete false, when any of the player's
 * brackets is not complete. Every bracket is checked for completeness before
 * any earnings are asked for.
 *
 * Throws when the player has no bracket entries in the brackets asked for, or
 * when an entry's bracket has no bracket list. The page guards against both,
 * so either one is a bug.
 *
 * Old comment:
 * Stops at the first bracket that is not complete: allComplete is then false,
 * and the totals are the partial totals of the brackets counted so far, so
 * they must not be shown as final numbers.
 *
 * @param {tmntFullType} tmntFullData - full tournament data
 * @param {brktListRecord} brktListRecords - bracket list records
 * @param {string} playerId - player id
 * @param {string[]} [brktIds] - array of bracket ids to include
 * @returns {brktSummaryType} - summary of ALL of a player's brackets
 * @throws {Error} - no bracket entries for the player, or a missing bracket list
 */
export const calcAllBrktSummaries = (
  tmntFullData: tmntFullType,
  brktListRecords: brktListRecord,
  playerId: string,
  brktIds?: string[],
): brktSummaryType => {
  const notComplete: brktSummaryType = {
    allComplete: false,
    entries: 0,
    entryAmount: 0,
    refunds: 0,
    refundAmount: 0,
    earnings: 0,
  };
  const total: brktSummaryType = { ...notComplete, allComplete: true };

  const playerBrktEntries = tmntFullData.brktEntries.filter(
    (be) =>
      be.player_id === playerId &&
      (brktIds === undefined || brktIds.includes(be.brkt_id)),
  );

  // the page guards against a player with no bracket entries, so none here is a bug
  if (playerBrktEntries.length === 0) {
    throw new Error(
      "calcAllBrktSummaries - no bracket entries for player. Id: " + playerId,
    );
  }

  // each bracket has one bracket list, so every entry has a list, even an
  // entry with refunds. A missing list is a bug.
  const counted: { be: brktEntryType; list: BracketList }[] = [];
  for (const be of playerBrktEntries) {
    const list = brktListRecords[be.brkt_id];
    if (!list) {
      throw new Error(
        "calcAllBrktSummaries - no bracket list for bracket. Id: " + be.brkt_id,
      );
    }
    counted.push({ be, list });
  }

  // every bracket must be complete before any earnings are asked for
  if (!counted.every(({ list }) => list.allBracketsCompleted())) {
    return notComplete;
  }

  for (const { be, list } of counted) {
    const fee = Number(
      tmntFullData.brkts.find((b) => b.id === be.brkt_id)?.fee ?? 0,
    );
    const refunds = be.num_refunds;
    const entries = be.num_brackets - refunds;

    total.entries += entries;
    total.entryAmount += fee * entries;
    total.refunds += refunds;
    total.refundAmount += fee * refunds;
    total.earnings += list.playerEarnings(playerId);
  }

  return total;

  // Old code:
  // let counted = 0;
  //
  // for (const be of playerBrktEntries) {
  //   const brktList = brktListRecords[be.brkt_id];
  //   if (!brktList) continue;
  //
  //   // a bracket that is not complete means the totals are not final
  //   if (!brktList.allBracketsCompleted()) return notComplete;
  //
  //   const fee = Number(
  //     tmntFullData.brkts.find((b) => b.id === be.brkt_id)?.fee ?? 0,
  //   );
  //   const refunds = be.num_refunds ?? 0;
  //   const entries = be.num_brackets - refunds;
  //
  //   total.entries += entries;
  //   total.entryAmount += fee * entries;
  //   total.refunds += refunds;
  //   total.refundAmount += fee * refunds;
  //   total.earnings += brktList.playerEarnings(playerId);
  //   counted += 1;
  // }
  //
  // // nothing counted: no entries, or no bracket lists to count them in
  // return counted === 0 ? notComplete : total;
};


// import React from "react";
// import type { tmntFullType } from "@/lib/types/types";
// import { isNumber } from "@/lib/validation/validation";
// import type { brktListRecord } from "@/components/brackets/buildBrktLists";

// export type brktSummaryType = {
//   allComplete: boolean;
//   entries: number;
//   entryAmount: number;
//   refunds: number;
//   refundAmount: number;
//   earnings: number;
// };

// /**
//  * simple error message display for missing data
//  *
//  * @param {string} errMsg - error message to display
//  * @returns - react component
//  */
// export const missingDataError = (errMsg: string) => {
//   return (
//     <>
//       <div className="row">
//         <div className="col-12">
//           <div className="alert alert-danger" role="alert">
//             {errMsg}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// /**
//  * Checks that the tournament has what is needed to total the player's brackets:
//  * a bracket entry, the bracket, and a numeric fee, first and second amount.
//  *
//  * @param {tmntFullType} tmntFullData - full tournament data
//  * @param {string} brktId - bracket id
//  * @param {string} playerId - player id
//  * @returns {string | null} the error message, or null when the data is good
//  */
// export const getBrktSummaryDataError = (
//   tmntFullData: tmntFullType,
//   brktId: string,
//   playerId: string,
// ): string | null => {
//   const brkt = tmntFullData.brkts.find((b) => b.id === brktId);
//   if (!brkt) return "Bracket configuration not found. Id: " + brktId;
//   const entry = tmntFullData.brktEntries.find(
//     (be) => be.player_id === playerId && be.brkt_id === brkt.id,
//   );
//   if (!entry) return "Player bracket entries not found. Id: " + playerId;
//   if (!isNumber(brkt.fee)) return "Bracket fee not found.";
//   if (!isNumber(brkt.first)) return "Bracket first amount not found.";
//   if (!isNumber(brkt.second)) return "Bracket second amount not found.";
//   return null;
// };

// /**
//  * Adds up the summaries of all of a player's brackets.
//  *
//  * Stops at the first bracket that is not complete: allComplete is then false,
//  * and the totals are the partial totals of the brackets counted so far, so
//  * they must not be shown as final numbers.
//  *
//  * @param {tmntFullType} tmntFullData - full tournament data
//  * @param {brktListRecord} brktListRecords - bracket list records
//  * @param {string} playerId - player id
//  * @param {string[]} [brktIds] - array of bracket ids to include
//  * @returns {brktSummaryType} - summary of ALL of a player's brackets
//  */
// export const calcAllBrktSummaries = (
//   tmntFullData: tmntFullType,
//   brktListRecords: brktListRecord,
//   playerId: string,
//   brktIds?: string[],
// ): brktSummaryType => {
//   const notComplete: brktSummaryType = {
//     allComplete: false,
//     entries: 0,
//     entryAmount: 0,
//     refunds: 0,
//     refundAmount: 0,
//     earnings: 0,
//   };
//   const total: brktSummaryType = { ...notComplete, allComplete: true };

//   const playerBrktEntries = tmntFullData.brktEntries.filter(
//     (be) =>
//       be.player_id === playerId &&
//       (brktIds === undefined || brktIds.includes(be.brkt_id)),
//   );

//   let counted = 0;

//   for (const be of playerBrktEntries) {
//     const brktList = brktListRecords[be.brkt_id];
//     if (!brktList) continue;

//     // a bracket that is not complete means the totals are not final
//     if (!brktList.allBracketsCompleted()) return notComplete;

//     const fee = Number(
//       tmntFullData.brkts.find((b) => b.id === be.brkt_id)?.fee ?? 0,
//     );
//     const refunds = be.num_refunds ?? 0;
//     const entries = be.num_brackets - refunds;

//     total.entries += entries;
//     total.entryAmount += fee * entries;
//     total.refunds += refunds;
//     total.refundAmount += fee * refunds;
//     total.earnings += brktList.playerEarnings(playerId);
//     counted += 1;
//   }

//   // nothing counted: no entries, or no bracket lists to count them in
//   return counted === 0 ? notComplete : total;
// };
