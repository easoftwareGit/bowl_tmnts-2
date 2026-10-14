import { brktListRecord } from "@/components/brackets/buildBrktLists";
import { tmntGameResult } from "@/lib/types/resultsTypes";

/**
 * Updates all bracket matches in all bracket lists in a tmnt
 * 
 * @param {brktListRecord} brktListRecords - bracket list records 
 * @param {tmntGameResult[]} tmntResults - array of game results
 */
export const updateAllBracketMatches = (
  brktListRecords: brktListRecord,
  tmntResults: tmntGameResult[],
): void => {
  Object.values(brktListRecords).forEach((brktList) => {
    if (brktList.playersMap === null || brktList.bracketIndexMap === null) {
      return;
    }
    brktList.updateBracketMatches(tmntResults);
  });
};