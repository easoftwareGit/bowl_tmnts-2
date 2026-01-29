import { validatePlayers } from "@/lib/validation/players/validate";
import { playerType, validPlayersType } from "@/lib/types/types";
import { ErrorCode, isValidBtDbId } from "@/lib/validation/validation";
import { deleteAllPlayersForSquad, postManyPlayers } from "./dbPlayers";

/**
 * updates, inserts or deletes many players via delete all then post all 
 * 
 * @param {playerType[]} players - array of players to update, insert or delete
 * @param {string} squadId - id of squad
 * @returns {number} - number of players saved
 * @throws {Error} - if validation fails or operations fail
 */
export const replaceManyPlayers = async (players: playerType[], squadId: string): Promise<number> => {

  if (!players || !Array.isArray(players)) {
    throw new Error("Invalid players");
  }
  if (!isValidBtDbId(squadId, "sqd")) {
    throw new Error('Invalid squad id');
  }
  let validPlayers: validPlayersType = { players: [], errorCode: ErrorCode.NONE };
  if (players.length !== 0) {
    validPlayers = validatePlayers(players);
  }  
  if (validPlayers.errorCode !== ErrorCode.NONE
    || validPlayers.players.length !== players.length)
  { 
    if (validPlayers.players.length === 0) {      
      throw new Error('Invalid player data at index 0');
    }
    const errorIndex = players.findIndex(player => !isValidBtDbId(player.id, "ply"));
    if (errorIndex < 0) {
      throw new Error(`Invalid player data at index ${validPlayers.players.length}`);
    } else {
      throw new Error(`Invalid player data at index ${errorIndex}`);
    }
  }
  try {
    await deleteAllPlayersForSquad(squadId); // throws on failure    
    return await postManyPlayers(validPlayers.players); // throws on failure
  } catch (err) { 
    throw new Error(`Failed to replace players: ${err instanceof Error ? err.message : "Unknown error"}`);
  }
}
