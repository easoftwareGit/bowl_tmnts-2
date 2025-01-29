import { isEven } from "@/lib/validation";
import { BracketList } from "./bracketList";
import { v4 as uuidv4 } from 'uuid';

export class Bracket { 

  static errInvalidPlayerId = -1;
  static errAlreadyInBracket = -2;
  static errBracketIsFull = -3;                       
  static byePlayerId = 'ply_00000000000000000000000000000000';

  private _id: string;
  private _players: string[];
  private _playersPerMatch: number;
  
  parent: BracketList;

  constructor(parent: BracketList) {
    this._id = uuidv4()
    this.parent = parent;
    this._playersPerMatch = parent.playersPerMatch;  
    this._players = [];    
  }

  get games(): number {
    return this.parent.games;
  }
  get isFull(): boolean {
    return this._players.length >= this.playersPerBracket;
  }
  get players(): string[] {
    return this._players;
  }
  get playersPerBracket(): number {
    // 2 bolwers per match ^ 3 games = 2^3 = 8
    return this.parent.playersPerBrkt;
  }
  get playersPerMatch(): number {
    return this._playersPerMatch;
  }

  /**
   * Add player to bracket
   * 
   * @param {string} playerId - id of player to add to bracket
   * @returns {number} - number of players in bracket
   */
  addPlayer(playerId: string): number {
    if (!playerId) return Bracket.errInvalidPlayerId;
    if (this._players.includes(playerId)) return Bracket.errAlreadyInBracket;
    if (this._players.length >= this.playersPerBracket) return Bracket.errBracketIsFull;
    this._players.push(playerId);
    return this._players.length;
  }

  /**
   * finds the index of a player 
   * 
   * @param {string} playerId - player id to find
   * @returns {number} - index of player 
   */
  findPlayerIndex(playerId: string): number {    
    return this._players.indexOf(playerId);
  }

  /**
   * finds the index of the first player in a match
   * 
   * @param {string[]} playerIds - array of player ids
   * @returns {number} - index of first player in match; 
   *   -1: 
   *      - if not found; 
   *      - if matchIds.length !== playersPerMatch
   *      - if playerIds !== matchIds
   */
  findMatch(playerIds: string[]): number {
    const pIndex = this._players.indexOf(playerIds[0]); 
    if (pIndex < 0) return -1;                        // if first player not in bracket return -1
    const fpi = this.firstPlayerInMatchIndex(pIndex); // get first player index
    const matchIds = this.playerIdsInMatch(fpi);      // get player ids in match (will be sorted)
    // make sure matchIds is the correct length
    if (matchIds.length === 0
      || matchIds.length !== this._playersPerMatch
      || matchIds.length !== playerIds.length) return -1;     
    // make sure both arrays are the same
    playerIds.sort();
    if (playerIds.every((value, index) => value === matchIds[index])) return fpi;
    return -1;
  }

  /**
   * gets the index of the first player not in bracket
   * 
   * @param {string[]} playerIds - array of player ids to find
   * @returns {number} - index of first player not in bracket 
   */
  findMissingPlayerIndex(playerIds: string[]): number {
    for (let i = 0; i < this._players.length; i++) {
      if (!this._players.includes(playerIds[i])) return i;
    }
    return -1;
  }

  /**
   * gets the index of the first player in a match
   * 
   * @param {number} pIndex - player index in bracket
   * @returns {number} - index of opponent in first match or -1 
   */
  firstMatchVs(pIndex: number): number {
    if (pIndex < 0 || pIndex >= this._playersPerMatch) return -1;
    if (isEven(pIndex)) return pIndex + 1;
    return pIndex - 1;
  }

  /**
   * gets the index of the first player any first match in the bracket
   * 
   * @param {number} pIndex - player index in bracket 
   * @returns {number} - index of first player in the match 
   */
  firstPlayerInMatchIndex(pIndex: number): number {
    if (pIndex < 0 || pIndex >= this.playersPerBracket) return -1;
    return (pIndex - (pIndex % this._playersPerMatch));
  }

  /**
   * determines if a match is full
   * 
   * @param matchStartIndex - index of first player in match 
   * @returns {boolean} - true if match is full
   */
  isMatchFull(matchStartIndex: number): boolean {
    if (matchStartIndex === 0 || (matchStartIndex % this._playersPerMatch) === 0) {
      for (let i = matchStartIndex; i < matchStartIndex + this._playersPerMatch; i++) {
        if (i > this._players.length - 1) return false;
        if (this._players[i] === Bracket.byePlayerId) return false;
      }
      return true;
    } else {
      return false;
    }
  }

  /**
   * gets the sorted array of player ids in a match 
   * 
   * @param {number} pIndex - player index in bracket
   * @returns {string[]} - array of player sorted ids 
   */
  playerIdsInMatch(pIndex: number): string[] {
    if (pIndex < 0 || pIndex >= this._players.length) return [];
    const fpi: number = this.firstPlayerInMatchIndex(pIndex);
    const playerIds: string[] = [];
    playerIds.push(this._players[fpi]);
    playerIds.push(this._players[fpi + 1]);
    playerIds.sort();
    return playerIds;
  }

  /**
   * removes players from bracket
   * 
   * @param playerIds - array of player ids to remove
   */
  removePlayers(playerIds: string[]): void {    
    this._players = this._players.filter(id => !playerIds.includes(id));    
  }
}