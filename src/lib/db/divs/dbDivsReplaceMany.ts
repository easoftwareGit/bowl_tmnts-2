import { validateDivs } from "@/lib/validation/divs/validate";
import { divType, validDivsType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { deleteAllDivsForTmnt, postManyDivs } from "./dbDivs";

/**
 * updates, inserts or deletes many divs via delete all then post all 
 * 
 * @param {divType[]} divs - array of divs to update, insert or delete
 * @param {string} tmntId - id of tmnt
 * @returns {number} - number of divs saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyDivs = async (  
  divs: divType[],
  tmntId: string
): Promise<number> => {

  if (!divs || !Array.isArray(divs)) {
    throw new Error("Invalid divs");
  }
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }

  if (divs.length === 0) {
      deleteAllDivsForTmnt(tmntId)      
    return 0;
  }  

  const validDivs: validDivsType = validateDivs(divs);
  if (validDivs.errorCode !== ErrorCode.NONE
    || validDivs.divs.length !== divs.length)
  { 
    if (validDivs.divs.length === 0) {      
      throw new Error('Invalid div data at index 0');
    }
    const errorIndex = divs.findIndex(div => !isValidBtDbId(div.id, "div"));
    if (errorIndex < 0) {
      throw new Error(`Invalid div data at index ${validDivs.divs.length}`);
    } else {
      throw new Error(`Invalid div data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllDivsForTmnt(tmntId); // throws on failure    
    return await postManyDivs(validDivs.divs); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace divs: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
