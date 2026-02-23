import { validateSquads } from "@/lib/validation/squads/validate";
import type { squadType, validSquadsType } from "@/lib/types/types";
import { isValidBtDbId } from "@/lib/validation/validation";
import { ErrorCode } from "@/lib/enums/enums";
import { deleteAllSquadsForTmnt, postManySquads } from "./dbSquads";

/**
 * updates, inserts or deletes many squads via delete all then post all 
 * 
 * @param {squadType[]} squads - array of squads to update, insert or delete
 * @param {string} tmntId - id of tournament
 * @returns {number} - number of squads saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManySquads = async (squads: squadType[], tmntId: string): Promise<number> => {

  if (!squads || !Array.isArray(squads)) {
    throw new Error("Invalid squads");
  }
  if (!isValidBtDbId(tmntId, "tmt")) {
    throw new Error('Invalid tmnt id');
  }
  let validSquads: validSquadsType = { squads: [], errorCode: ErrorCode.NONE };
  if (squads.length !== 0) {
    validSquads = validateSquads(squads);
  }  
  if (validSquads.errorCode !== ErrorCode.NONE
    || validSquads.squads.length !== squads.length)
  { 
    if (validSquads.squads.length === 0) {      
      throw new Error('Invalid squad data at index 0');
    }
    const errorIndex = squads.findIndex(squad => !isValidBtDbId(squad.id, "sqd"));
    if (errorIndex < 0) {
      throw new Error(`Invalid squad data at index ${validSquads.squads.length}`);
    } else {
      throw new Error(`Invalid squad data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllSquadsForTmnt(tmntId); // throws on failure    
    return await postManySquads(validSquads.squads); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace squads: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
