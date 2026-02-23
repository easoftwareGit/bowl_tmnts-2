import { validatePots } from "@/lib/validation/pots/validate";
import type { potType, validPotsType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllPotsForSquad, postManyPots } from "./dbPots";

/**
 * updates, inserts or deletes many pots via delete all then post all 
 * 
 * @param {potType[]} pots - array of pots to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of pots saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyPots = async (pots: potType[], squadId: string): Promise<number> => {

  if (!pots || !Array.isArray(pots)) {
    throw new Error("Invalid pots");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validPots: validPotsType = { pots: [], errorCode: ErrorCode.NONE };
  if (pots.length !== 0) {
    validPots = validatePots(pots);
  }  
  if (validPots.errorCode !== ErrorCode.NONE
    || validPots.pots.length !== pots.length)
  { 
    if (validPots.pots.length === 0) {      
      throw new Error('Invalid pot data at index 0');
    }
    const errorIndex = pots.findIndex(pot => !isValidBtDbId(pot.id, "pot"));
    if (errorIndex < 0) {
      throw new Error(`Invalid pot data at index ${validPots.pots.length}`);
    } else {
      throw new Error(`Invalid pot data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllPotsForSquad(squadId); // throws on failure    
    return await postManyPots(validPots.pots); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace pots: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
