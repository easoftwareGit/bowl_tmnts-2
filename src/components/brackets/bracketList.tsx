import { Bracket } from "./bracketClass";
import { entryNumBrktsColName, playerEntryData } from "@/app/dataEntry/playersForm/createColumns";
import { cloneDeep } from "lodash";
import { initBGColNames } from "./bracketGrid";

// test input
// 10, 8, 6, 7, 6, 4, 6
// test results
// 1, 1, 1, 1, 2, 2, 5, 6, 7, 7, 33
// 0, 0, 0, 0, 1, 1, 4, 5, 6, 6, 23

export type findPlayerResult = {
  playerIndex: number,
  brktIndex: number
}

export type playerBrktEntry = {
  player_id: string,
  num_brackets: number,
  createdAt: number,
  usedCount: number
}

export interface brktCountType {
  brktInfo: string;
  toFill: string;
  B1: number;
  B2: number;
  B3: number;
  B4: number;
  B5: number;
  B6: number;
  B7: number;
  B8: number;
  B9: number;
  B10: number;
  [key: string]: number | string; // add an index signature
}

interface filledBrktType { 
  pos: string;
  [key: string]: string;
}

export const brktsToShow = 10

export type initBrktCountsType = {
  forFullValues: (number | null)[];
  for1ByeValues: (number | null)[];  
}

const initBrktCounts: initBrktCountsType = {
  forFullValues: [],
  for1ByeValues: []
}

export class BracketList { 

  private _copyFrom: Bracket[] = [];   
  private _brktColTitles = cloneDeep(initBGColNames);
  private _brktCounts: initBrktCountsType = cloneDeep(initBrktCounts) as initBrktCountsType;
  private _filledBrkts: filledBrktType[] = [];  

  brktId: string;
  games: number;
  playersPerMatch: number;
  
  brackets: Bracket[] = [];

  constructor(brktId: string, playersPerMatch: number, games: number, copyFrom: Bracket[] = []) {
    this.brktId = brktId;
    this.playersPerMatch = playersPerMatch;
    this.games = games;
    this._copyFrom = copyFrom;
    if (this._copyFrom.length > 0) {
      this.brackets.push(...this._copyFrom); 
    }
  }

  get allBrkts(): Bracket[] {
    return this.brackets;
  }
  get brktColTitles() {
    return this._brktColTitles;
  }
  get brktCounts() {
    return this._brktCounts;
  }
  get filledBrkts(): filledBrktType[] {
    return this._filledBrkts;
  }
  get needToAddBrkt(): boolean {
    if (this.brackets.length === 0) return true;
    for (let i = 0; i < this.brackets.length; i++) { 
      if (this.brackets[i].isFull) return false;
    }
    return true;
  }
  get playersPerBrkt(): number {
    // 2 bolwers per match ** 3 games = 2**3 = 8
    return this.playersPerMatch ** this.games;
  }

  addBrkt(): Bracket{
    const brkt = new Bracket(this);
    this.brackets.push(brkt);
    return brkt;
  }

  /**
   * gets the bracket number column name for count of brackets grid
   * 
   * @param {number} brktNum - bracket number
   * @returns {string} - bracket number column name
   */
  brktNumColName(brktNum: number): string {
    return "B" + brktNum.toString();
  }

  /**
   * finds a bracket with all the players in it
   * 
   * @param {string[]} playerIds - array of player ids
   * @param {number} startBrktIndex - bracket index to start at
   * @returns {number} - bracket index where all the players were found or -1 
   */
  // findBrkt(playerIds: string[], startBrktIndex: number = 0): number {     
  //   for (let i = startBrktIndex; i < this.brackets.length; i++) {
  //     if (this.brackets[i].findMissingPlayerIndex(playerIds) === -1) {         
  //       return i;
  //     }      
  //   }
  //   return -1;
  // }
  
  /**
   * finds the index of a player in a bracket, starting at startBrktIndex
   * also returns the bracket index where the player was found
   * 
   * @param {string} playerId - player id to find
   * @param {number} startBrktIndex - bracket index to start at
   * @returns {findPlayerResult} - player index and bracket index 
   */
  findPlayer(playerId: string, startBrktIndex: number = 0): findPlayerResult {
    const result: findPlayerResult = {
      playerIndex: -1,
      brktIndex: -1
    }
    if (startBrktIndex < 0 || startBrktIndex >= this.brackets.length) return result;
    for (let i = startBrktIndex; i < this.brackets.length; i++) {
      const pIndex = this.brackets[i].findPlayerIndex(playerId);
      if (pIndex >= 0) {
        result.playerIndex = pIndex;
        result.brktIndex = i;
        return result;        
      }
    }
    return result;
  }


  /**
   * gets all the indexes of all the brackets for a player
   * 
   * @param {string} playerId - player id to find 
   * @returns {number[]} - array of bracket indexes 
   */
  // indexesForPlayer(playerId: string): number[] { 
  //   const indexes: number[] = [];
  //   for (let i = 0; i < this.brackets.length; i++) {
  //     if (this.brackets[i].findPlayerIndex(playerId) >= 0) indexes.push(i);
  //   }
  //   return indexes;
  // }

  /**
   * puts a player in a bracket or returns null if cant put player in a bracket
   * 
   * @param playerId - player id to add
   * @returns {Bracket | null} - bracket where player was added or null 
   */
  putPlayerInBrkt(playerId: string): Bracket | null {    
    for (let i = 0; i < this.brackets.length; i++) { 
      const brkt = this.brackets[i];
      if (!brkt.isFull) { 
        if (brkt.findPlayerIndex(playerId) === -1) { 
          brkt.addPlayer(playerId);
          return brkt;
        }
      }
    }
    return null;
  }

  /**
   * repopulates brackets based on player bracket entry rows
   * 
   * @param {typeof playerEntryData[]} brktEntRows - array of player bracket entry rows
   * @returns {void} - no return 
   */
  rePopulateBrkts(brktEntRows: (typeof playerEntryData)[]): void {  

    // 1) clear all brackets
    // 2) sort by # brackets (DESC), and createdAt (ASC)        
    // 3) for each bracket entered, add bowler id to bracket, creating new brackets when needed.

    // 1) clear all brackets
    this.brackets.length = 0;
    if (brktEntRows.length === 0) return; 
    
    // 2) sort by # brackets (DESC), and createdAt (ASC)
    // sort by # brackets (DESC), usedCount (ASC) and createdAt (ASC)
    const numBrktsName = entryNumBrktsColName(this.brktId)
    brktEntRows.sort((a, b) => {
      if (a[numBrktsName] !== b[numBrktsName]) {
        return b[numBrktsName] - a[numBrktsName]; // descending
      } else {
        return a.createdAt - b.createdAt;         // ascending
      }
    });

    // 3) for each bracket entered, add bowler id to bracket, creating new brackets when needed.
    let i = 0;    
    let playerId = "";
    let numBrkts = 0;
    while (i < brktEntRows.length) {
      if (playerId === '') {
        playerId = brktEntRows[i].player_id;
        numBrkts = brktEntRows[i][numBrktsName];
        // if error getting playert id or num brkts, exit this func
        if (!playerId || playerId === '' || isNaN(numBrkts) || numBrkts === null) {
          return;
        }
      }
      if (numBrkts > 0) {
        let oneBracket = this.putPlayerInBrkt(playerId);
        if (!oneBracket) {
          oneBracket = new Bracket(this);
          oneBracket.addPlayer(playerId);
          this.brackets.push(oneBracket);                 
        }        
        numBrkts--;        
      }
      if (numBrkts <= 0) { 
        i++;
        playerId = '';  
      }      
    }
    this.populateBrktCounts();
    // this.populateFilledBrkts();
  } 

  /**
   * re populates bracket titles and counts 
   * 
   * @returns {void} - no return
   */
  populateBrktCounts(): void {
    this._brktCounts.forFullValues.length = 0;
    this._brktCounts.for1ByeValues.length = 0;
    if (this.brackets.length === 0) return;
    for (let i = 0; i < this.brackets.length; i++) {
      const full = this.playersPerBrkt - this.brackets[i].players.length;      
      const oneBye = (full === 0) ? 0 : full - 1;
      this._brktCounts.forFullValues.push(full);
      this._brktCounts.for1ByeValues.push(oneBye);
    }
  }

  // populateFilledBrkts(): void { 
  //   this._filledBrkts.length = 0;
  //   if (this.brackets.length === 0) return;    
  //   for (let p = 1; p <= this.playersPerBrkt; p++) {
  //     const filledRow: filledBrktType = {
  //       pos: p + ''
  //     };            
  //     this._filledBrkts.push(filledRow);
  //   }
  //   for (let b = 0; b < this.brackets.length; b++) {
  //     const bColName = this.brktNumColName(b + 1);
  //     for (let i = 0; i < this.brackets[b].players.length; i++) { 
  //       this._filledBrkts[i][bColName] = this.brackets[b].players[i]
  //     }
  //   }
  // }
}