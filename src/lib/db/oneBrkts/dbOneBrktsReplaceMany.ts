import { validateOneBrkts } from "@/lib/validation/oneBrkts/valildate";
import { oneBrktType, validOneBrktsType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { deleteAllOneBrktsForSquad, postManyOneBrkts } from "./dbOneBrkts";

/**
 * updates, inserts or deletes many oneBrkts via delete all then post all 
 * 
 * @param {playerType[]} oneBrkts - array of oneBrkts to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of oneBrkts saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyOneBrkts = async (oneBrkts: oneBrktType[], squadId: string): Promise<number> => {

  if (!oneBrkts || !Array.isArray(oneBrkts)) {
    throw new Error("Invalid oneBrkts");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validOneBrkts: validOneBrktsType = { oneBrkts: [], errorCode: ErrorCode.NONE };
  if (oneBrkts.length !== 0) {
    validOneBrkts = validateOneBrkts(oneBrkts);
  }  
  if (validOneBrkts.errorCode !== ErrorCode.NONE
    || validOneBrkts.oneBrkts.length !== oneBrkts.length)
  { 
    if (validOneBrkts.oneBrkts.length === 0) {      
      throw new Error('Invalid oneBrkt data at index 0');
    }
    const errorIndex = oneBrkts.findIndex(oneBrkt => !isValidBtDbId(oneBrkt.id, "obk"));
    if (errorIndex < 0) {
      throw new Error(`Invalid oneBrkt data at index ${validOneBrkts.oneBrkts.length}`);
    } else {
      throw new Error(`Invalid oneBrkt data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllOneBrktsForSquad(squadId); // throws on failure    
    return await postManyOneBrkts(validOneBrkts.oneBrkts); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace oneBrkts: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
