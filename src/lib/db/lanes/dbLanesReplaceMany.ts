import { validateLanes } from "@/app/api/lanes/validate";
import { laneType, validLanesType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation";
import { deleteAllLanesForSquad, postManyLanes } from "./dbLanes";

/**
 * updates, inserts or deletes many lanes via delete all then post all 
 * 
 * @param {laneType[]} lanes - array of lanes to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of lanes saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyLanes = async (lanes: laneType[], squadId: string): Promise<number> => {

  if (!lanes || !Array.isArray(lanes)) {
    throw new Error("Invalid lanes");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validLanes: validLanesType = { lanes: [], errorCode: ErrorCode.None };
  if (lanes.length !== 0) {
    validLanes = validateLanes(lanes);
  }  
  if (validLanes.errorCode !== ErrorCode.None
    || validLanes.lanes.length !== lanes.length)
  { 
    if (validLanes.lanes.length === 0) {      
      throw new Error('Invalid lane data at index 0');
    }
    const errorIndex = lanes.findIndex(lane => !isValidBtDbId(lane.id, "lan"));
    if (errorIndex < 0) {
      throw new Error(`Invalid lane data at index ${validLanes.lanes.length}`);
    } else {
      throw new Error(`Invalid lane data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllLanesForSquad(squadId); // throws on failure    
    return await postManyLanes(validLanes.lanes); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace lanes: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
