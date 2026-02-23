import { validatePotEntries } from "@/lib/validation/potEntries/validate";
import type { potEntryType, validPotEntriesType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllPotEntriesForSquad, postManyPotEntries } from "./dbPotEntries";

/**
 * updates, inserts or deletes many potEntries via delete all then post all 
 * 
 * @param {potEntryType[]} potEntries - array of potEntries to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of potEntries saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyPotEntries = async (potEntries: potEntryType[], squadId: string): Promise<number> => {

  if (!potEntries || !Array.isArray(potEntries)) {
    throw new Error("Invalid potEntries");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validPotEntries: validPotEntriesType = { potEntries: [], errorCode: ErrorCode.NONE };
  if (potEntries.length !== 0) {
    validPotEntries = validatePotEntries(potEntries);
  }  
  if (validPotEntries.errorCode !== ErrorCode.NONE
    || validPotEntries.potEntries.length !== potEntries.length)
  { 
    if (validPotEntries.potEntries.length === 0) {      
      throw new Error('Invalid potEntry data at index 0');
    }
    const errorIndex = potEntries.findIndex(potEntry => !isValidBtDbId(potEntry.id, "pen"));
    if (errorIndex < 0) {
      throw new Error(`Invalid potEntry data at index ${validPotEntries.potEntries.length}`);
    } else {
      throw new Error(`Invalid potEntry data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllPotEntriesForSquad(squadId); // throws on failure    
    return await postManyPotEntries(validPotEntries.potEntries); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace potEntries: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
