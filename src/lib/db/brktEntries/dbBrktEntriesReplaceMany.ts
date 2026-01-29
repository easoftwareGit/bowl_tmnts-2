import { validateBrktEntries } from "@/lib/validation/brktEntries/validate";
import { brktEntryType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { deleteAllBrktEntriesForSquad, postManyBrktEntries } from "./dbBrktEntries";

/**
 * updates, inserts or deletes many brkt entries via delete all then post all
 * 
 * @param {brktEntryType[]} brktEntries - array of brktEntries to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of brktEntries saved 
 * @throws {Error} - if brktEntries is invalid or API call fails
 */
export const replaceManyBrktEntries = async (brktEntries: brktEntryType[], squadId: string): Promise<number> => {

  if (!brktEntries || !Array.isArray(brktEntries)) {
    throw new Error("No brktEntries provided");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  if (brktEntries.length === 0) {
    return 0;
  }
  const validBrktEntries = validateBrktEntries(brktEntries);
  if (validBrktEntries.errorCode !== ErrorCode.NONE
    || validBrktEntries.brktEntries.length !== brktEntries.length)
  { 
    if (validBrktEntries.brktEntries.length === 0) {      
      throw new Error('Invalid brktEntry data at index 0');
    }
    const errorIndex = brktEntries.findIndex(brktEntry => !isValidBtDbId(brktEntry.id, "ben"));
    if (errorIndex < 0) {
      throw new Error(`Invalid brktEntry data at index ${validBrktEntries.brktEntries.length}`);
    } else {
      throw new Error(`Invalid brktEntry data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllBrktEntriesForSquad(squadId); // throws on failure
    return await postManyBrktEntries(validBrktEntries.brktEntries); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to save brktEntries: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
