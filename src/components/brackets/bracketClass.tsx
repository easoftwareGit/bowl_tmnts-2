import { isEven, isOdd } from "@/lib/validation";
import { BracketList } from "./bracketListClass";
import { btDbUuid } from "@/lib/uuid";
import { shuffleArray } from "@/lib/tools";

export class Bracket { 

  static errInvalidPlayerId = -1;
  static errAlreadyInBracket = -2;
  static errBracketIsFull = -3;    
  static errInvalidMatch = -4;  
  static byePlayerId = 'ply_00000000000000000000000000000000';

  private _id: string = '';
  // private _emptyIndexes: Set<number>;
  private _playersPerMatch: number;
  private _players: string[];  
  
  parent: BracketList;

  constructor(parent: BracketList) {
    this._id = btDbUuid('bib')
    this.parent = parent;
    // this._emptyIndexes = Array.from({ length: parent.playersPerBrkt }, (_, i) => i);
    // this._emptyIndexes = new Set(Array.from({ length: 8 }, (_, i) => i));
    // this._players = new Array(parent.playersPerBrkt).fill(''); // array of empty strings
    this._players = []; 
    this._playersPerMatch = parent.playersPerMatch;    
  }

  get games(): number {
    return this.parent.games;
  }
  get id(): string {
    return this._id;
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
   * Add players in a match to bracket
   * 
   * @param {string[]} playerIds - array of players in match to add to bracket
   * @returns {number} - number of players in bracket
   */
  addMatch(playerIds: string[]): number {
    if (!playerIds || playerIds.length === 0) return Bracket.errInvalidPlayerId;
    if (playerIds.length !== this.playersPerMatch) return Bracket.errInvalidMatch;
    if (playerIds.length + this._players.length > this.playersPerBracket) return Bracket.errBracketIsFull;
    for (let i = 0; i < playerIds.length; i++) {
      if (this._players.includes(playerIds[i])) return Bracket.errAlreadyInBracket;
    }
    // DO NOT use addPlayer here
    playerIds.forEach(playerId => {
      this._players.push(playerId);      
    })
    return this._players.length;
  }

  /**
   * clear all players from bracket
   * also resets empty indexes
   * 
   * note: called clearPlayers() not emptyPlayers(), to avoid confusion with emptySpots()
   */
  clearPlayers(): void { 
    this._players.length = 0;
    // this._emptyIndexes = new Set(Array.from({ length: 8 }, (_, i) => i));
  }

  /**
   * get number of empty spots in bracket
   * 
   * @returns {number} - number of empty spots in bracket
   */
  emptySpots(): number {
    return this.playersPerBracket - this._players.length;
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
  // findMatch(playerIds: string[]): number {
  //   const pIndex = this._players.indexOf(playerIds[0]); 
  //   if (pIndex < 0) return -1;                        // if first player not in bracket return -1
  //   const fpi = this.firstPlayerInMatchIndex(pIndex); // get first player index
  //   const matchIds = this.playerIdsInMatch(fpi);      // get player ids in match (will be sorted)
  //   // make sure matchIds is the correct length
  //   if (matchIds.length === 0
  //     || matchIds.length !== this._playersPerMatch
  //     || matchIds.length !== playerIds.length) return -1;     
  //   // make sure both arrays are the same
  //   playerIds.sort();
  //   if (playerIds.every((value, index) => value === matchIds[index])) return fpi;
  //   return -1;
  // }

  /**
   * gets the index of the first player not in bracket
   * 
   * @param {string[]} playerIds - array of player ids to find
   * @returns {number} - index of first player not in bracket 
   */
  // findMissingPlayerIndex(playerIds: string[]): number {
  //   for (let i = 0; i < this._players.length; i++) {
  //     if (!this._players.includes(playerIds[i])) return i;
  //   }
  //   return -1;
  // }

  /**
   * gets the index of the first player in a match
   * 
   * @param {number} pIndex - player index in bracket
   * @returns {number} - index of opponent in first match or -1 
   */
  // firstMatchVs(pIndex: number): number {
  //   if (pIndex < 0 || pIndex >= this._playersPerMatch) return -1;
  //   if (isEven(pIndex)) return pIndex + 1;
  //   return pIndex - 1;
  // }

  /**
   * gets the index of the first player any first match in the bracket
   * 
   * @param {number} pIndex - player index in bracket 
   * @returns {number} - index of first player in the match 
   */
  // firstPlayerInMatchIndex(pIndex: number): number {
  //   if (pIndex < 0 || pIndex >= this.playersPerBracket) return -1;
  //   return (pIndex - (pIndex % this._playersPerMatch));
  // }

  /**
   * gets the index of a random empty spot
   * 
   * @returns {number} - index of random empty spot, -1 if no empty spots
   */
  // getRandomEmptyIndex(): number {
  //   if (this._emptyIndexes.size === 0) return -1;
  //   return Array.from(this._emptyIndexes)[Math.floor(Math.random() * this._emptyIndexes.size)];
  // }

  /**
   * gets the player ids in a match
   * 
   * @param {number} index - index of first player in match MUST BE 0 or EVEN
   * @returns {string[]} - player ids in match or empty array if index is invalid 
   */
  getMatch(index: number): string[] {
    // use index+1 because need two player ids, starting at index
    // use isOdd to make sure index is a multiple of 2 or 0, first player in match

    if (index < 0 || index > this._players.length) return [];
    if (isOdd(index)) {
      return [this._players[index - 1], this._players[index]];
    } else { 
      if (index + 1 >= this._players.length) return [];
      return [this._players[index], this._players[index + 1]];
    }
    // return [this._players[index], this._players[index + 1]];
  }

  /**
   * determines if a match is full
   * 
   * @param matchStartIndex - index of first player in match 
   * @returns {boolean} - true if match is full
   */
  // isMatchFull(matchStartIndex: number): boolean {
  //   if (matchStartIndex === 0 || (matchStartIndex % this._playersPerMatch) === 0) {
  //     for (let i = matchStartIndex; i < matchStartIndex + this._playersPerMatch; i++) {
  //       if (i > this._players.length - 1) return false;
  //       if (this._players[i] === Bracket.byePlayerId) return false;
  //     }
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  /**
   * gets the number of positions in players without a player id
   * 
   * @returns {number} - number of positions in players without a player id
   */
  numEmptySpots(): number {
    // return this._emptyIndexes.size;
    return this.playersPerBracket - this._players.length;
  }

  /**
   * gets the sorted array of player ids in a match 
   * 
   * @param {number} pIndex - player index in bracket
   * @returns {string[]} - array of player sorted ids 
   */
  // playerIdsInMatch(pIndex: number): string[] {
  //   if (pIndex < 0 || pIndex >= this._players.length) return [];
  //   const fpi: number = this.firstPlayerInMatchIndex(pIndex);
  //   const playerIds: string[] = [];
  //   playerIds.push(this._players[fpi]);
  //   playerIds.push(this._players[fpi + 1]);
  //   playerIds.sort();
  //   return playerIds;
  // }

  /**
   * finds the index of a player 
   * 
   * @param {string} playerId - player id to find
   * @returns {number} - index of player 
   */
  playerIndex(playerId: string): number {    
    return this._players.indexOf(playerId);
  }

  /**
   * removes players from bracket
   * 
   * @param playerIds - array of player ids to remove
   */
  removePlayers(playerIds: string[]): void {    
    this._players = this._players.filter(id => !playerIds.includes(id));    
  }

  /**
   * shuffles the players in the bracket, keeping the matches intact
   * positions in a match are shuffled too
   */
  shuffle(): void {

    // if players is empty or bracket is not full, do nothing
    if (!this._players || !this.isFull) return;

    // 1) split the players into the matches 
    const matches = [];
    for (let i = 0; i < this._players.length; i += 2) {
      matches.push([this._players[i], this._players[i + 1]]);
    }

    // 2) shuffle each individual match
    matches.forEach(match => { 
      if (Math.random() > 0.5) {
        match.reverse();
      }
    })

    // 3) shuffle the matches using the Fisher-Yates shuffle algorithm
    shuffleArray(matches);

    // 4) flatten the matches back into a single array and save it to _players
    this._players = matches.flat();
  }
}