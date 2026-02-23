import { validateElimEntries } from "@/lib/validation/elimEntries/validate";
import type { elimEntryType, validElimEntriesType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllElimEntriesForSquad, postManyElimEntries } from "./dbElimEntries";

/**
 * updates, inserts or deletes many elimEntries via delete all then post all 
 * 
 * @param {playerType[]} elimEntries - array of elimEntries to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of players saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyElimEntries = async (elimEntries: elimEntryType[], squadId: string): Promise<number> => {

  if (!elimEntries || !Array.isArray(elimEntries)) {
    throw new Error("Invalid elimEntries");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validElimEntries: validElimEntriesType = { elimEntries: [], errorCode: ErrorCode.NONE };
  if (elimEntries.length !== 0) {
    validElimEntries = validateElimEntries(elimEntries);
  }  
  if (validElimEntries.errorCode !== ErrorCode.NONE
    || validElimEntries.elimEntries.length !== elimEntries.length)
  { 
    if (validElimEntries.elimEntries.length === 0) {      
      throw new Error('Invalid elimEntry data at index 0');
    }
    const errorIndex = elimEntries.findIndex(elimEntry => !isValidBtDbId(elimEntry.id, "een"));
    if (errorIndex < 0) {
      throw new Error(`Invalid elimEntry data at index ${validElimEntries.elimEntries.length}`);
    } else {
      throw new Error(`Invalid elimEntry data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllElimEntriesForSquad(squadId); // throws on failure    
    return await postManyElimEntries(validElimEntries.elimEntries); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace elimEntries: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
