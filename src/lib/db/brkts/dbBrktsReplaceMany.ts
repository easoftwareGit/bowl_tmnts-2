import { validateBrkts } from "@/lib/validation/brkts/validate";
import type { brktType, validBrktsType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllBrktsForSquad, postManyBrkts } from "./dbBrkts";

/**
 * updates, inserts or deletes many brkts via delete all then post all 
 * 
 * @param {brktType[]} brkts - array of brkts to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of brkts saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyBrkts = async (brkts: brktType[], squadId: string): Promise<number> => {

  if (!brkts || !Array.isArray(brkts)) {
    throw new Error("Invalid brkts");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validBrkts: validBrktsType = { brkts: [], errorCode: ErrorCode.NONE };
  if (brkts.length !== 0) {
    validBrkts = validateBrkts(brkts);
  }  
  if (validBrkts.errorCode !== ErrorCode.NONE
    || validBrkts.brkts.length !== brkts.length)
  { 
    if (validBrkts.brkts.length === 0) {      
      throw new Error('Invalid brkt data at index 0');
    }
    const errorIndex = brkts.findIndex(brkt => !isValidBtDbId(brkt.id, "brk"));
    if (errorIndex < 0) {
      throw new Error(`Invalid brkt data at index ${validBrkts.brkts.length}`);
    } else {
      throw new Error(`Invalid brkt data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllBrktsForSquad(squadId); // throws on failure    
    return await postManyBrkts(validBrkts.brkts); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace brkts: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
