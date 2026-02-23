import { validateElims } from "@/lib/validation/elims/validate";
import type { elimType, validElimsType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllElimsForSquad, postManyElims } from "./dbElims";

/**
 * updates, inserts or deletes many elims via delete all then post all 
 * 
 * @param {elimType[]} elims - array of elims to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of elims saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyElims = async (elims: elimType[], squadId: string): Promise<number> => {

  if (!elims || !Array.isArray(elims)) {
    throw new Error("Invalid elims");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validElims: validElimsType = { elims: [], errorCode: ErrorCode.NONE };
  if (elims.length !== 0) {
    validElims = validateElims(elims);
  }  
  if (validElims.errorCode !== ErrorCode.NONE
    || validElims.elims.length !== elims.length)
  { 
    if (validElims.elims.length === 0) {      
      throw new Error('Invalid elim data at index 0');
    }
    const errorIndex = elims.findIndex(elims => !isValidBtDbId(elims.id, "elm"));
    if (errorIndex < 0) {
      throw new Error(`Invalid elim data at index ${validElims.elims.length}`);
    } else {
      throw new Error(`Invalid elim data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllElimsForSquad(squadId); // throws on failure    
    return await postManyElims(validElims.elims); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace elims: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
