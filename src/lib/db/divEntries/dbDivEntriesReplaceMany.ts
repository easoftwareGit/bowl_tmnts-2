import { validateDivEntries } from "@/lib/validation/divEntries/validate";
import type { divEntryType, validDivEntriesType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllDivEntriesForSquad, postManyDivEntries } from "./dbDivEntries";

/**
 * updates, inserts or deletes many divEntries via delete all then post all 
 * 
 * @param {divEntries[]} divEntries - array of divEntries to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of divEntries saved
 * @throws {Error} - if validation fails or operations fail
 */

export const replaceManyDivEntries = async (divEntries: divEntryType[], squadId: string): Promise<number> => {

  if (!divEntries || !Array.isArray(divEntries)) {
    throw new Error("Invalid divEntries provided");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validDivEntries: validDivEntriesType = { divEntries: [], errorCode: ErrorCode.NONE };
  if (divEntries.length !== 0) {
    validDivEntries = validateDivEntries(divEntries);
  }  
  if (validDivEntries.errorCode !== ErrorCode.NONE
    || validDivEntries.divEntries.length !== divEntries.length)
  { 
    if (validDivEntries.divEntries.length === 0) {      
      throw new Error('Invalid divEntry data at index 0');
    }
    const errorIndex = divEntries.findIndex(divEntry => !isValidBtDbId(divEntry.id, "den"));
    if (errorIndex < 0) {
      throw new Error(`Invalid divEntry data at index ${validDivEntries.divEntries.length}`);
    } else {
      throw new Error(`Invalid divEntry data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllDivEntriesForSquad(squadId); // throws on failure    
    return await postManyDivEntries(validDivEntries.divEntries); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace divEntries: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
