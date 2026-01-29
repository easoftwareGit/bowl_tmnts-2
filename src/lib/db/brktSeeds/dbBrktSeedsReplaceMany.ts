import { brktSeedType, validBrktSeedsType } from "@/lib/types/types";
import { deleteAllBrktSeedsForSquad, postManyBrktSeeds } from "./dbBrktSeeds";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { validateBrktSeeds, validCompositKey } from "@/lib/validation/brktSeeds/validate";

/**
 * brktSeeds data rows are never edited. They are deleted and re-posted
 * use this function to update or post brktSeed rows 
 * NOTE: NO error checking if brktSeeds are in the squad
 * 
 * @param {brktSeedType[]} brktSeeds - array of brktSeeds to used as replacement
 * @param {string} squadId - id of squad to delete all brktSeeds from
 * @returns {number} - number of brktSeeds posted
 * @throws {Error} - if brktSeeds are invalid or API call fails
 */
export const replaceManyBrktSeeds = async (brktSeeds: brktSeedType[], squadId: string): Promise<number> => {  

  if (!brktSeeds || !Array.isArray(brktSeeds)) {
    throw new Error("Invalid brktSeeds provided");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error("Invalid squad id");
  }
  let validBrktSeeds: validBrktSeedsType = { brktSeeds: [], errorCode: ErrorCode.NONE };
  if (brktSeeds.length !== 0) {
    validBrktSeeds = validateBrktSeeds(brktSeeds);
  }  
  if (validBrktSeeds.errorCode !== ErrorCode.NONE
    || validBrktSeeds.brktSeeds.length !== brktSeeds.length)
  { 
    if (validBrktSeeds.brktSeeds.length === 0) {      
      throw new Error('Invalid brktSeeds data at index 0');
    }
    const errorIndex = brktSeeds.findIndex(brktSeed => !validCompositKey(brktSeed.one_brkt_id, brktSeed.seed));
    if (errorIndex < 0) {
      throw new Error(`Invalid brktSeed data at index ${validBrktSeeds.brktSeeds.length}`);
    } else {
      throw new Error(`Invalid brktSeed data at index ${errorIndex}`);
    }
  }
  try { 
    await deleteAllBrktSeedsForSquad(squadId); // throws on failure    
    return await postManyBrktSeeds(validBrktSeeds.brktSeeds); // throws on failure
  } catch (err) {
    throw new Error(`Failed to replace brktSeeds: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
