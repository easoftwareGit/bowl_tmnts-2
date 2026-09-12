import { createSelector } from "@reduxjs/toolkit";
import { selectTmntFullData } from "./tmntFullDataSlice";
import {
  buildBrktListRecords,
  type BrktListRecord,
} from "@/components/brackets/buildBrktLists";
import type { RootState } from "@/redux/store";
import type { BracketList } from "@/components/brackets/bracketListClass";

/**
* state
*   │
*   └── state.tmntFullData
*             │
*             └── .tmntFullData
*                     │
*                     ▼
*             selectTmntFullData
*                     │
*                     ▼
*           getBrktListRecords
*                     │
*                     ▼
*           buildBrktListRecords()
*                     │
*                     ▼
*                record
*                     │
*                     ▼
*              getBrktList
*/

/**
 * Input selector that returns the bracket id passed to getBrktList().
 *
 * createSelector passes the same arguments to every input selector.
 * getBrktList() is called with:
 *
 *   getBrktList(state, brktId)
 *
 * Therefore, this selector must accept Redux state as its first parameter
 * so that brktId is available as the second parameter.
 *
 * This selector does not use Redux state directly, so the parameter is
 * named _state to show that it is intentionally unused.
 *
 * @param {RootState} _state - Redux state; required as the first parameter
 *   but intentionally unused by this selector
 * @param {string} brktId - bracket id passed to getBrktList()
 * @returns {string} bracket id
 */
const getBrktId = (
  _state: RootState,
  brktId: string,
): string => brktId;

/**
 * Builds and returns all bracket lists for the tournament.
 *
 * The BrktListRecord is derived entirely from tmntFullData and is not stored
 * separately in Redux state.
 *
 * createSelector memoizes the returned BrktListRecord. buildBrktListRecords()
 * runs again only when selectTmntFullData returns a different tmntFullData
 * object. If tmntFullData has not changed, the previously created
 * BrktListRecord is returned.
 *
 * The selector has one input:
 * 1. selectTmntFullData returns the full tournament data from Redux.
 *
 * The returned record is keyed by bracket id:
 *
 *   {
 *     [brktId]: BracketList
 *   }
 *
 * @returns {BrktListRecord} all bracket lists keyed by bracket id
 */
export const getBrktListRecords = createSelector(
  [selectTmntFullData],
  (tmntFullData): BrktListRecord => {
    return buildBrktListRecords(
      tmntFullData,
    );
  },
);

/**
 * Gets one BracketList from the tournament's BrktListRecord.
 *
 * getBrktList() is called with:
 *
 *   getBrktList(state, brktId)
 *
 * The selector has two inputs:
 * 1. getBrktListRecords returns all bracket lists keyed by bracket id.
 * 2. getBrktId returns the bracket id passed to this selector.
 *
 * This selector only performs a record lookup. It does not rebuild the
 * bracket lists. getBrktListRecords handles building and memoizing the
 * BrktListRecord.
 *
 * If brktId does not exist in the record, undefined is returned.
 *
 * @param {RootState} state - Redux state
 * @param {string} brktId - bracket id to retrieve
 * @returns {BracketList | undefined} matching BracketList, or undefined
 *   if the bracket id is not found
 */
export const getBrktList = createSelector(
  [
    getBrktListRecords,
    getBrktId,
  ],
  (
    brktListRecords,
    brktId,
  ): BracketList | undefined => {
    return brktListRecords[brktId];
  },
);