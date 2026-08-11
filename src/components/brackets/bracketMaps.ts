import { playerEntryRow } from "@/app/dataEntry/playersForm/populatePlayerRows";
import { calcHandicap } from "@/lib/db/divEntries/calcHdcp";
import type {
  bracketPlayerType,
  divEntryType,
  divType,
  gameType
} from "@/lib/types/types";

type GameScoreKey = string;

export type GameScoreMap = Map<GameScoreKey, number>;

export type PlayerBracketMap = Map<string, bracketPlayerType>;

/**
 * Creates a game score lookup key.
 *
 * @param {string} playerId - player id
 * @param {number} gameNum - game number
 * 
 * @returns {string} - game score lookup key
 */
export const getGameScoreKey = (
  playerId: string,
  gameNum: number,
): string => {
  return `${playerId}_${gameNum}`;
};

/**
 * Creates a game score lookup map.
 *
 * @param {gameType[]} games - array of game objects
 * 
 * @returns {GameScoreMap}
 */
export const createGameScoreMap = (
  games: gameType[],
): GameScoreMap => {
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
 *
 * The divEntries array must already be filtered to the bracket's division.
 * Each player must have one entry in that division.
 * 
 * @param {playerEntryRow[]} playerRows - array of player row objects
 * @param {divEntryType[]} divEntries - array of division entry objects
 * @param {divType} div - division object
 * 
 * @returns {PlayerBracketMap} - player bracket lookup map
 * @throws {Error} If a player is missing from divEntries.
 */
export const createPlayerMap = (
  playerRows: playerEntryRow[],
  divEntries: divEntryType[],
  div: divType,
): PlayerBracketMap => {
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
      return [
        player.id,
        {
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          average: player.average,
          hdcp: calcHandicap(
            player.average,
            div.hdcp_from,
            div.hdcp_per,        
            div.int_hdcp,
          ),          
        }
      ];
    }),
  );
};
