import { playerEntryRow } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import type {
  PlayerInfoType,  
  divEntryType,
  divType,
  gameType,  
} from "@/lib/types/types";
import type { playerBracketsType } from "./bracketListClass";
import { Bracket } from "./bracketClass";

type GameScoreKey = string;

export type BracketPlayersMapType = Map<string, string[]>;

export type BracketIndexMapType = Map<string, number>;

export type GameScoreMapType = Map<GameScoreKey, number>;

export type PlayerMapType = Map<string, PlayerInfoType>;

/**
 * Creates a game score lookup key.
 *
 * @param {string} playerId - player id
 * @param {number} squadGameNum - game number
 * 
 * @returns {string} - game score lookup key
 */
export const getGameScoreKey = (
  playerId: string,
  squadGameNum: number,
): string => {
  return `${playerId}_${squadGameNum}`;
};

/**
 * Creates a bracket players lookup map.
 * 
 * @param {Bracket[]} brackets - array of bracket classes
 * @returns {BracketPlayersMapType} - bracket player lookup map 
 */
export const createBracketPlayersMap = (brackets: Bracket[]): BracketPlayersMapType => { 
  return new Map(brackets.map((bracket) => [bracket.id, bracket.players]));
}

/**
 * Creates a game score lookup map.
 *
 * @param {gameType[]} games - array of game objects
 * 
 * @returns {GameScoreMapType}
 */
export const createGameScoreMap = (
  games: gameType[],
): GameScoreMapType => {
  return new Map(
    games.map((game) => [
      getGameScoreKey(
        game.player_id,
        game.game_num,
      ),
      game.score,
    ]),
  );
};

/**
 * Creates a player lookup map.
 * map structure:
 * ply_123
 *    | 
 *    +-- first_name
 *    +-- last_name
 *    +-- average
 *    +-- hdcp
 *    +-- lane
 *    +-- [obk_123, obk_456, obk_789]
 *
 * The divEntries array must already be filtered to the bracket's division.
 * Each player must have one entry in that division.
 * 
 * @param {playerEntryRow[]} playerRows - array of player row objects, players in the bracket type
 * @param {divEntryType[]} divEntries - array of division entry objects
 * @param {divType} div - division object
 * @param {playerBracketsType[]} playerBrackets - array of player bracket objects
 * 
 * @returns {PlayerMapType} - player bracket lookup map
 * @throws {Error} If a player is missing from divEntries.
 */
export const createPlayersMap = (    
  playerRows: playerEntryRow[],
  divEntries: divEntryType[],
  div: divType,
  playerBrackets: playerBracketsType[],
): PlayerMapType => {

  // const justBracketPlayers = playerBrackets.filter((bracket) => bracket.bracketIds.length > 0)  

  return new Map(
    playerRows.map((player) => {
      const divEntry = divEntries.find(
        (entry) => entry.player_id === player.id,
      );

      if (divEntry === undefined) {
        throw new Error(
          `Division entry not found for player ${player.id}.`,
        );
      }

      const playerBracketsIds = playerBrackets
        .find((bracket) => bracket.playerId === player.id)
        ?.bracketIds;
      if (playerBracketsIds === undefined) {
        throw new Error(
          `Bracket Ids not found for player ${player.id}.`,
        );
      }      
      
      return [
        player.id,
        {          
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: calcHandicap(
            player.average,
            div.hdcp_from,
            div.hdcp_per,        
            div.int_hdcp,
          ),  
          lane: player.lane,
          bracketIds: playerBracketsIds,          
        }
      ];
    }),
  );
};

/**
 * Creates a bracket index lookup map
 * 
 * @param {Bracket[]} brackets - array of bracket classes
 * @returns {BracketIndexMapType} - bracket index lookup map
 */
export const createBracketIndexMap = (
  brackets: Bracket[],
): BracketIndexMapType => {
  return new Map(brackets.map((bracket, index) => [bracket.id, index]));
};